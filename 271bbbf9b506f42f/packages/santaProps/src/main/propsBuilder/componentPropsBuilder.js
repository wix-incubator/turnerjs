define([
    'lodash',
    'utils',
    'santaProps/propsBuilder/propsBuilderUtil',
    'santaProps/utils/propsSelectorsFactory',
    'experiment'
], function (_, utils, propsBuilderUtil, propsSelectorsFactory, experiment) {
    "use strict";

    function getRootProps(rootId, siteAPI, viewerPrivateServices, loadedStyles, measureMap) {
        var siteData = siteAPI.getSiteData();
        var currentPageStructure = siteData.getPageData(rootId).structure;
        var behaviorsAspect = siteAPI.getSiteAspect('behaviorsAspect');

        var props = {
            viewerPrivateServices: viewerPrivateServices,
            structure: currentPageStructure,
            siteData: siteData,
            siteAPI: siteAPI,
            id: rootId,
            key: rootId + '_' + siteData.getViewMode(),
            ref: rootId,
            refInParent: rootId,
            /**@deprecated */
            pageId: rootId,
            rootId: rootId,
            currentUrlPageId: siteData.getCurrentUrlPageId(),
            rootNavigationInfo: siteData.getExistingRootNavigationInfoWithTransitionInfo(rootId),
            loadedStyles: loadedStyles,
            styleId: propsBuilderUtil.getStyleId(currentPageStructure, loadedStyles),
            skin: propsBuilderUtil.getSkin(currentPageStructure, siteData),
            style: {
                width: '100%',
                height: '100%'
            },
            compProp: propsBuilderUtil.getCompProp(siteAPI, rootId, currentPageStructure.propertyQuery, rootId),
            compActions: behaviorsAspect.getActions('comp', rootId),
            compBehaviors: behaviorsAspect.extractBehaviors(rootId),
            renderFlags: siteData.renderFlags
        };
        if (experiment.isOpen('sv_dpages') && props.rootNavigationInfo && props.rootNavigationInfo.routerDefinition) {
            props.key = rootId + props.rootNavigationInfo.routersRendererIndex;
        }

        if (currentPageStructure.dataQuery) {
            props.compData = propsBuilderUtil.getCompData(siteAPI, rootId, currentPageStructure.dataQuery, rootId);
        }


        if (experiment.isOpen('sv_hoverBox')) {
            props.activeModes = utils.objectUtils.cloneDeep(siteData.activeModes); // must clone otherwise mode change will affect both prevProps and nextProps of page
            props.measureMap = measureMap;
        }

        var santaPropsSelectorForComp = propsSelectorsFactory.getPropsSelectorForComponent(currentPageStructure.componentType);
        var santaTypesProps = santaPropsSelectorForComp({
            stylesMap: loadedStyles,
            siteData: siteData,
            siteAPI: siteAPI
        }, {
            structure: currentPageStructure,
            rootNavigationInfo: props.rootNavigationInfo,
            rootId: rootId
        });

        return _.assign(props, santaTypesProps);
    }


    /**
     *
     * @param {data.compStructure} compStructure
     * @param {core.SiteAPI} siteAPI
     * @param {string=} pageId
     * @param {object=} stylesMap
     * @param viewerPrivateServices
     * @return {comp.properties}
     */
    function getCompProps(compStructure, siteAPI, pageId, stylesMap, viewerPrivateServices) {
        var siteData = siteAPI.getSiteData();

        var compPageId = pageId || "masterPage";
        var navigationInfo = siteData.getExistingRootNavigationInfoWithTransitionInfo(compPageId);

        var santaPropsSelectorForComp = propsSelectorsFactory.getPropsSelectorForComponent(compStructure.componentType);
        var santaTypesProps = santaPropsSelectorForComp({
            stylesMap: stylesMap,
            siteData: siteData,
            siteAPI: siteAPI
        }, {
            structure: compStructure,
            rootNavigationInfo: navigationInfo,
            rootId: compPageId
        });

        if (propsSelectorsFactory.isSantaTypedComponentByName(compStructure.componentType)) {
            return santaTypesProps;
        }

        var behaviorsAspect = siteAPI.getSiteAspect('behaviorsAspect');

        var compId = compStructure.id;
        var props = {
            viewerPrivateServices: viewerPrivateServices || {},
            structure: compStructure,
            siteData: siteData,
            siteAPI: siteAPI,
            id: compId,
            key: compId,
            ref: compId,
            refInParent: compId,
            /**@deprecated */
            pageId: compPageId,
            rootId: compPageId,
            currentUrlPageId: siteData.getCurrentUrlPageId(),
            rootNavigationInfo: navigationInfo,
            loadedStyles: stylesMap,
            styleId: propsBuilderUtil.getStyleId(compStructure, stylesMap),
            skin: propsBuilderUtil.getSkin(compStructure, siteData),
            style: propsBuilderUtil.getStyle(compStructure.layout, siteAPI, compId),
            compProp: propsBuilderUtil.getCompProp(siteAPI, compId, compStructure.propertyQuery, pageId),
            compActions: behaviorsAspect.getActions('comp', compId),
            compBehaviors: behaviorsAspect.extractBehaviors(compId),
            renderFlags: siteData.renderFlags
        };

        if (compStructure.designQuery) {
            props.compDesign = propsBuilderUtil.getCompDesign(siteAPI, compId, compStructure.designQuery, pageId);
        }

        if (compStructure.dataQuery) {
            props.compData = propsBuilderUtil.getCompData(siteAPI, compId, compStructure.dataQuery, pageId);
        }

        return _.assign(props, santaTypesProps);
    }

    /**
     * @class core.componentPropsBuilder
     */
    var moduleExports = {
        getCompProps: getCompProps,
        getRootProps: getRootProps
    };

    return moduleExports;
});


/**
 * @typedef {object} comp.properties
 * @property {data.compStructure} structure
 * @property {core.SiteData} siteData,
 * @property {core.SiteAPI} siteAPI
 * @property {string} id
 * @property {string} key
 * @property {string} ref
 * @property {string} styleId the style id in the dom
 * @property {string} rootId the page id the comp is on
 * @property {site.rootNavigationInfo} rootNavigationInfo
 * @property {string} skin the name of the skin
 * @property {comp.compLayout} style
 * @property {Object.<string,string>} loadedStyles a map between the data style id to the dom style id
 * @property {data.compDataItem} compData
 * @property {data.compPropertiesItem} compProp
 * @property {object} compState
 * @property {Action[]} compActions
 * @property {object} reactDomProps the props that will be set on the root redData of the component
 * @property {?function ()} onComponentWillUpdate a hook method that a parent component can request to be notified when his child will update
 */



/**
 * @typedef {object} comp.compLayout
 * @property {?number} top
 * @property {?number} left
 * @property {?number} height
 * @property {?number} width
 * @property {string} position
 */
