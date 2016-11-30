'use strict';

import * as _ from 'lodash';
import * as structuresComparer from 'documentServices/mobileConversion/modules/structuresComparer';
import * as mobileOnlyComponentsHandler from 'documentServices/mobileConversion/modules/mobileOnlyComponentsHandler';
import * as mergeAggregator from 'documentServices/mobileConversion/modules/mergeAggregator';
import {mobileConversion} from 'documentServices/mobileConversion/modules/mobileConversion';

const DEFAULT_HEURISTIC_STRATEGY = 'default';

var mobileConversionFacade = {
    /**
     * Starts the conversion algorithm
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {Object} pageStructure - page structure
     * @param {Array} deletedCompIds - a list of the deleted components IDs
     *
     * @returns {Array} - mobileComponents
     */
    runMobileConversionAlgorithm: function (ps: ps, pageStructure, deletedCompIds) {
        return mobileConversion({ps}).runMobileConversionAlgorithm(pageStructure, deletedCompIds, pageStructure.id);
    },

    resetMobileLayoutOnAllPages: function (ps: ps, options) {
        const heuristicStrategy = <string> _.get(options, 'heuristicStrategy', DEFAULT_HEURISTIC_STRATEGY);
        return mobileConversion({ps, heuristicStrategy}).runMobileConversionAlgorithmOnAllPages();
    },

    prepareForConversion: function (ps: ps, pageIds?: string[]) : Map<PageComponent|MasterPageComponent> {
        let pagesData = ps.dal.get(ps.pointers.general.getPagesData());
        const api = mobileConversion({ps});

        if (pageIds) {
            pagesData = _.pick(pagesData, pageIds);
        }

        return _.mapValues(pagesData, page => {
            return api.prepareConversionData(page.structure);
        });
    },

    applyConversion: function (ps: ps, data: Map<ComponentWithConversionData|MasterPageComponent>) {
        const api = mobileConversion({ps});
        _.forEach(data, page => {
            api.applyConvertedPage(page);
        });
        mergeAggregator.commitResults(ps);
    },

    execConversion: function(ps: ps, data: Map<ComponentWithConversionData|MasterPageComponent>, strategy?: string) {
        let options : PublicAlgorithmOptions = {
            ps,
            heuristicStrategy: strategy || 'default'
        };

        const api = mobileConversion(options);
        _.forEach(data, page => api.execConversion(page));
    },


    /**
     * Starts the merge algorithms
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {Object} pagesData - page structure
     * @param {Object} mobileDeletedCompIdMap - the map of the deleted components' ids
     * @param {Object} settings parsing settings
     *
     * @returns {Object}
     */
    runMobileMergeAlgorithm: function (ps: ps, desktopPagesData, mobilePagesData, mobileDeletedCompIdMap, settings?: StructurePreprocessorSettings) {
        return mobileConversion({ps}).runMobileMergeAlgorithm(desktopPagesData, mobilePagesData, mobileDeletedCompIdMap, settings);
    },

    convertMobileStructure: function (ps: ps, settings?: {commitConversionResults: boolean;}) {
        mobileConversion({ps}).convertMobileStructure(_.get(settings, 'commitConversionResults', true));
    },

    /**
     * Returns components existing in web site and not on mobile structure
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {Object} pagesData - page structure
     *
     * @returns {Object}
     */
    getComponentsExistingInWebsiteButNotInMobile: structuresComparer.getComponentsExistingInWebsiteButNotInMobile,

    /**
     * Returns an array with components hidden only on mobile and which are only mobile unique
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {Object} structure - site structure. Should be a clone!!! of the original structure
     *
     * @returns {Array}
     */
    getHiddenMobileOnlyComponentIds: function (ps: ps, structure) {
        structure.components = structure.mobileComponents; // Note! Passed structure modification. The structure clone should be passed!
        return mobileOnlyComponentsHandler.getHiddenMobileOnlyComponentIds(structure);
    },

    /**
     * Add a component that is unique mobile component to the structure
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {number} compId
     * @param {Object} pageStructure - page's structure
     */
    addMobileOnlyComponentToStructure: function (ps: ps, compId, pageStructure) {
        var mobileStructure = _.cloneDeep(pageStructure);
        mobileStructure.components = mobileStructure.mobileComponents;
        mobileOnlyComponentsHandler.addMobileOnlyComponentIfNeeded(compId, mobileStructure);
        pageStructure.mobileComponents = mobileStructure.components;
    },

    /**
     * Checks if a component is only mobile component
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {number} compId
     *
     * @returns {boolean}
     */
    isMobileOnlyComponent: function (ps: ps, compId: string) {
        return mobileOnlyComponentsHandler.isMobileOnlyComponent(compId);
    }
};

export = mobileConversionFacade;
