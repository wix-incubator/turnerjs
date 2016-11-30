'use strict';

import * as _ from 'lodash';
import * as biErrors from 'documentServices/bi/errors';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {virtualGroupHandler} from 'documentServices/mobileConversion/modules/virtualGroupHandler';
import * as mobileOnlyComponentsHandler from 'documentServices/mobileConversion/modules/mobileOnlyComponentsHandler';
import * as structurePreprocessor from 'documentServices/mobileConversion/modules/structurePreprocessor';
import {modifyComponentProperties} from 'documentServices/mobileConversion/modules/mobilePropertiesHandler';
import * as anchorsCalculator from 'documentServices/mobileConversion/modules/anchorsCalculator';
import * as structureAnalyzer from 'documentServices/mobileConversion/modules/structureAnalyzer';
import * as mobileMerge from 'documentServices/mobileConversion/modules/mobileMerge';
import * as mergeAggregator from 'documentServices/mobileConversion/modules/mergeAggregator';
import * as structureConverter from 'documentServices/mobileConversion/modules/structureConverter';
import * as componentReducer from 'documentServices/mobileConversion/modules/componentReducer';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';
import {hasMobileStructure} from 'documentServices/mobileConversion/modules/structuresComparer';
import {objectUtils, dataUtils} from 'coreUtils';
import * as experiment from 'experiment';
import * as boxSlideShowLayoutHandler from 'documentServices/mobileConversion/modules/boxSlideShowLayoutHandler';
import * as hooks from 'documentServices/hooks/hooks';
import * as constants from 'documentServices/constants/constants';
import * as textComponentScaler from 'documentServices/mobileConversion/modules/textComponentScaler';

function mobileConversion(options:PublicAlgorithmOptions) {
    const COMPONENT_TYPE_PAGE = 'mobile.core.components.Page';

    const ps:ps = options.ps;
    const heuristics:Map<number | boolean> = conversionConfig.HEURISTIC_STRATEGIES[options.heuristicStrategy || 'default'];

    function runMobileConversionAlgorithmOnAllPages(deletedComponentIdMap:Map<string> = {}, commitConversionResults:boolean = true):void {
        var currDeletedCompsList;
        var mobileComps;

        const pagesData = _.get(mergeAggregator.getAggregatedPagesData(ps), 'desktop');

        _.forEach(pagesData, function (pageData, pageId) {
            currDeletedCompsList = deletedComponentIdMap[pageId] || [];
            mobileComps = runMobileConversionAlgorithm(pageData.structure, currDeletedCompsList, pageId);
            applyMobileConversionResults(mobileComps, pageId);
        });
        if (commitConversionResults || !experiment.isOpen('sv_mergeAggregator')) {
            mergeAggregator.commitResults(ps);
        }
    }

    function runMobileMergeAlgorithm(serializedWebsite: Map<PageData>, serializedMobileSite: Map<PageData>, mobileDeletedCompIdMap: ArraysMap<string>, settings?: StructurePreprocessorSettings): Map<Component[]> {
        var serializedMobileSiteClone = objectUtils.cloneDeep(serializedMobileSite);
        addAndDeletePagesInMobileAccordingToWebsite(serializedWebsite, serializedMobileSiteClone);
        _.forOwn(serializedWebsite, (page, id) => prepareConversion(page.structure, serializedMobileSiteClone[id].structure));
        const comps = <Map<ComponentWithConversionData | MasterPageComponentWithConversionData>> _.mapValues(serializedWebsite, 'structure');
        const mobileComps = <Map<ComponentWithConversionData | MasterPageComponentWithConversionData>> _.mapValues(serializedMobileSiteClone, 'structure');
        const convertedSite = execMobileMerge(comps, mobileComps, mobileDeletedCompIdMap, settings);
        return _.mapValues(convertedSite, conversionUtils.getChildren);
    }

    function runMobileMergeAlgorithmOnChangedPages() {
        const pagesData = mergeAggregator.getAggregatedPagesData(ps);
        if (!pagesData) {
            return;
        }
        const deletedComponentIdMap = ps.dal.get(ps.pointers.general.getDeletedMobileComps()) || {};
        const settings: StructurePreprocessorSettings = {
            keepOccludedAndEmptyBackgrounds: true,
            keepNotRecommendedMobileComponents: false,
            keepEmptyTextComponents: false,
            keepOutOfScreenComponents: true
        };
        return runMobileMergeAlgorithm(pagesData.desktop, pagesData.mobile, deletedComponentIdMap, settings);
    }


    function execMobileMerge(serializedWebsite:Map<ComponentWithConversionData|MasterPageComponentWithConversionData>, serializedMobileSiteClone:Map<ComponentWithConversionData|MasterPageComponentWithConversionData>, mobileDeletedCompIdMap:ArraysMap<string>, settings?: StructurePreprocessorSettings):Map<any> {
        _.forOwn(serializedMobileSiteClone, (mobilePage, id) => {
            const webPage = <ComponentWithConversionData | MasterPageComponentWithConversionData>serializedWebsite[id];
            _.forEach(dataUtils.getAllCompsInStructure(mobilePage), mobChild => {
                const webComponent = <Component>conversionUtils.getComponentByIdFromStructure(mobChild.id, webPage);
                if (!webComponent || !webComponent.dataQuery) {
                    return;
                }

                mobChild.dataQuery = webComponent.dataQuery;
            });
            if (conversionUtils.isMasterPage(webPage)) {
                structurePreprocessor.handleMasterPageComponents(conversionUtils.getChildren(webPage));
            }
            const componentIdsExplicitlyDeletedFromMobileSite = _(mobileDeletedCompIdMap).values().flatten().value();
            mobileMerge.mergeStructure(webPage, mobilePage, id, componentIdsExplicitlyDeletedFromMobileSite, settings);
        });
        _.forEach(serializedMobileSiteClone, removeConversionDataRecursively);
        return serializedMobileSiteClone;
    }

    function runMobileConversionAlgorithm(structure:PageComponent | MasterPageComponent, deletedCompIds:string[], pageId:string):Component[] {
        const mobileStructure:PageComponent | MasterPageComponent = objectUtils.cloneDeep(structure);
        boxSlideShowLayoutHandler.handleSlideShowComponentsBeforeAlgorithm(mobileStructure);
        const comps = conversionUtils.getChildren(mobileStructure);

        const mobileComps:ComponentWithConversionData[] = convertToMobile(mobileStructure, comps, deletedCompIds);
        const isMobileView = true;
        boxSlideShowLayoutHandler.fixSlideShowComponentsFromComponentsArray(pageId, mobileComps, comps, isMobileView);

        removeConversionDataRecursively({components: mobileComps});
        return mobileComps;
    }

    function convertMobileStructure(commitConversionResults:boolean = true):void {
        if (!isValidDesktopStructure()) {
            ps.siteAPI.reportBI(biErrors.MOBILE_STRUCTURE_NOT_SAVED_DUE_TO_CORRUPTION);
            return;
        }

        if (hasMobileStructure(ps)) {
            const mobileCompsMap = runMobileMergeAlgorithmOnChangedPages();
            fixMasterPage(<Component[]>_.get(mobileCompsMap, 'masterPage'));
            _.forEach(mobileCompsMap, applyMobileConversionResults);
            if (commitConversionResults || !experiment.isOpen('sv_mergeAggregator')) {
                mergeAggregator.commitResults(ps);
            }
        } else {
            const deletedComponentIdMap = ps.dal.get(ps.pointers.general.getDeletedMobileComps()) || {};
            this.runMobileConversionAlgorithmOnAllPages(deletedComponentIdMap, commitConversionResults);
        }
    }

    function postProcessStructure(page:ComponentWithConversionData | MasterPageComponent, comps:Component[]) {
        virtualGroupHandler.replaceBackGroupsToFlatComponents(page, comps);

        mobileOnlyComponentsHandler.addMobileOnlyComponentsOnConversion(page);
        if (!experiment.isOpen('removeJsonAnchors')) {
            anchorsCalculator.updateAnchors(page, comps);
        }
    }

    interface AlgorithmOptions {
        deletedCompIds?:string[];
    }

    function resolvePresets(comps:Component[], pageId) {
        const mobilePresetStructuresPointer = ps.pointers.general.getMobileStructuresPointer();
        if (!mobilePresetStructuresPointer) {
            return;
        }

        _.forEach(comps, component => {
            const mobilePresetPointer = ps.pointers.getInnerPointer(mobilePresetStructuresPointer, component.id);
            const preset = mobilePresetPointer ? ps.dal.get(mobilePresetPointer) : null;
            if (!preset) {
                return;
            }

            mobileMerge.mergeStructure(component, preset, pageId);
            _.set(component, ['conversionData', 'preset'], preset);
        });
    }

    function fixMasterPage(comps:Component[]) {
        var headerComponent = _.find(comps, {id: constants.COMP_IDS.HEADER});
        var footerComponent = <Component> _.find(comps, {id: constants.COMP_IDS.FOOTER});
        var pagesContainerComponent = _.find(comps, {id: constants.COMP_IDS.PAGES_CONTAINER});
        if (!headerComponent || !footerComponent || !pagesContainerComponent) {
            return;
        }

        var sitePages = <any> _.first(pagesContainerComponent.components);
        _.assign(headerComponent.layout, {x: 0, y: 0, width: conversionConfig.MOBILE_WIDTH});
        _.assign(pagesContainerComponent.layout, {
            x: 0,
            y: headerComponent.layout.y + headerComponent.layout.height,
            width: conversionConfig.MOBILE_WIDTH
        });
        _.assign(footerComponent.layout, {
            x: 0,
            y: pagesContainerComponent.layout.y + pagesContainerComponent.layout.height,
            width: conversionConfig.MOBILE_WIDTH
        });
        _.set(sitePages, 'layout.width', conversionConfig.MOBILE_WIDTH);
    }

    function convertMasterPage(masterPageStructure:MasterPageComponentWithConversionData) {
        const header = <ComponentWithConversionData>conversionUtils.getComponentByIdFromStructure('SITE_HEADER', masterPageStructure);
        const footer = <ComponentWithConversionData>conversionUtils.getComponentByIdFromStructure('SITE_FOOTER', masterPageStructure);

        _.forEach([header, footer], headerOrFooter => {
            structureConverter.rescaleComponent(headerOrFooter, conversionConfig.MOBILE_WIDTH);
            conversionUtils.ensureContainerTightlyWrapsChildren(headerOrFooter, headerOrFooter.components, {whenNoChildren: true}.whenNoChildren);
        });

        fixMasterPage(masterPageStructure.children);
    }

    function execConversion(page:ComponentWithConversionData | MasterPageComponent, comps:ComponentWithConversionData[], conversionOptions?:AlgorithmOptions):ComponentWithConversionData[] {
        structurePreprocessor.preProcessStructure(page, comps, {}, _.get(conversionOptions, 'deletedCompIds', []));
        const detectSemanticGroups = _.get(heuristics, 'detectSemanticGroups', true);
        if (detectSemanticGroups) {
            virtualGroupHandler.addVirtualGroupsToStructure(page, comps);
        }

        structureAnalyzer.analyzeStructure(page, comps, {semanticOrdering: detectSemanticGroups});

        if (experiment.isOpen('fontScaling')) {
            textComponentScaler.setScale(comps);
        }

        if (conversionUtils.isMasterPage(page)) {
            convertMasterPage(<MasterPageComponentWithConversionData>page);
        } else {
            structureConverter.rescaleComponent(<ComponentWithConversionData>page, conversionConfig.MOBILE_WIDTH);
        }
        postProcessStructure(<ComponentWithConversionData>page, comps);
        return comps;
    }

    function execConversionForPage(page:ComponentWithConversionData | MasterPageComponent) {
        let comps = <ComponentWithConversionData[]> conversionUtils.getChildren(page);
        execConversion(page, comps);

        let allComps = <Map<ComponentWithConversionData>> dataUtils.getAllCompsInStructure(page);
        _.forOwn(allComps, comp => {
            if (comp.layout) {
                delete comp.layout.anchors;
            }

            componentReducer.removeConversionData(comp);
        });
    }

    function applyConvertedPage(page:ComponentWithConversionData | MasterPageComponent) {
        let comps = conversionUtils.getChildren(page);
        if (!experiment.isOpen('removeJsonAnchors')) {
            anchorsCalculator.updateAnchors(page, conversionUtils.getChildren(page));
        }
        applyMobileConversionResults(comps, page.id);
    }

    function applyMobileConversionResults(mobileComps, pageId:string) {
        mobileOnlyComponentsHandler.createAdditionalStylesIfNeeded(ps);
        const pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE);
        const mobileCompsPointer = ps.pointers.getInnerPointer(pagePointer, 'mobileComponents');
        ps.dal.set(mobileCompsPointer, mobileComps);
        if (experiment.isOpen('removeJsonAnchors')) {
            const forceMobileStructure = true;
            ps.siteAPI.createPageAnchors(pageId, forceMobileStructure);
        }
        hooks.executeHook(hooks.HOOKS.MOBILE_CONVERSION.AFTER, COMPONENT_TYPE_PAGE, [ps, pagePointer]);
    }

    function prepareConversion(page:PageComponent | MasterPageComponent, existingPage?:PageComponent | MasterPageComponent) {
        let allComps = _.values<Component>(dataUtils.getAllCompsInStructure(page)).concat(conversionUtils.isMasterPage(page) ? [] : [<PageComponent>page]);
        _.forEach(allComps, comp => componentReducer.createConversionData(ps, comp, page.id));
        const override = !existingPage;
        page.mobileComponents = [];
        resolvePresets(allComps, page.id);
        _.forEach(allComps, clonedDesktopComponent => {
            const mobileComponent = <Component>(existingPage ? conversionUtils.getComponentByIdFromStructure(clonedDesktopComponent.id, existingPage) : clonedDesktopComponent) || clonedDesktopComponent;
            const modifiedMobilePropsQuery = modifyComponentProperties(ps, clonedDesktopComponent, page.id, {override});

            const currentMobilePropsPointer = ps.pointers.data.getPropertyItem(mobileComponent.propertyQuery, page.id);
            const keepMobilePropsByDefault = !override && currentMobilePropsPointer && ps.dal.isExist(currentMobilePropsPointer);
            const defaultMobileProps = keepMobilePropsByDefault  ? mobileComponent.propertyQuery : clonedDesktopComponent.propertyQuery;

            clonedDesktopComponent.propertyQuery = mobileComponent.propertyQuery = modifiedMobilePropsQuery || defaultMobileProps;
        });
        return page;
    }

    function convertToMobile(page:PageComponent | MasterPageComponent, comps:Component[], deletedCompIds?:string[]):ComponentWithConversionData[] {
        prepareConversion(page);
        return execConversion(<ComponentWithConversionData | MasterPageComponent> page, <ComponentWithConversionData[]>comps, {deletedCompIds});
    }


    function removeConversionDataRecursively(container:{components:ComponentWithConversionData[]}):void {
        _.forEach(dataUtils.getAllCompsInStructure(container), componentReducer.removeConversionData);
    }

    function addPagesMissingInMobileSite(desktopSite:Map<PageData>, mobileSite:Map<PageData>) {
        const mobilePagesIdes = <string[]> _.map(mobileSite, 'structure.id');
        const desktopPagesIdes = <string[]> _.map(desktopSite, 'structure.id');
        const missingInMobile = _.reject(desktopPagesIdes, pageId => _.includes(mobilePagesIdes, pageId));
        _.forEach(missingInMobile, function (pageId) {
            mobileSite[pageId] = objectUtils.cloneDeep(desktopSite[pageId]);
            convertToMobile(mobileSite[pageId].structure, []);
        });
    }

    function deletePagesMissingInDesktopSite(desktopSite:Map<PageData>, mobileSite:Map<PageData>) {
        const desktopPagesIdes = <string[]> _.map(desktopSite, 'structure.id');
        const mobilePagesIdes = <string[]> _.map(mobileSite, 'structure.id');
        const missingInDesktop = _.reject(mobilePagesIdes, pageId => _.includes(desktopPagesIdes, pageId));
        _.forEach(missingInDesktop, pageId => delete mobileSite[pageId]);
    }

    function addAndDeletePagesInMobileAccordingToWebsite(serializedWebsitePages:Map<PageData>, serializedMobileSitePages:Map<PageData>) {
        addPagesMissingInMobileSite(serializedWebsitePages, serializedMobileSitePages);
        deletePagesMissingInDesktopSite(serializedWebsitePages, serializedMobileSitePages);
    }

    function isValidDesktopStructure():boolean {
        const DESKTOP = constants.VIEW_MODES.DESKTOP;
        const COMP = ps.pointers.components;
        return _.every([COMP.getFooter(DESKTOP), COMP.getHeader(DESKTOP), COMP.getPagesContainer(DESKTOP)], ps.dal.isExist);
    }

    return {
        convertMobileStructure,
        runMobileConversionAlgorithm,
        runMobileMergeAlgorithm,
        execMobileMerge,
        runMobileConversionAlgorithmOnAllPages,
        applyConvertedPage,
        prepareConversionData: (page:PageComponent | MasterPageComponent) => prepareConversion(page),
        execConversion: execConversionForPage
    };
}

export {
    mobileConversion
}

