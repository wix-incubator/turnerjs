define(['lodash', 'wixappsBuilder/core/dataSelectorFactory', 'wixappsCore'], function (_, /** dataSelectorFactory */dataSelectorFactory, /** wixappsCore */ wixapps) {
    "use strict";

    /**
     * Get all the items of the data selector that is defined in the part definition of this appPartName.
     * @param {AppRepoDefinition} appRepo
     * @param {string} appPartName
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector} The data selector of the appPart
     */
    function getDataSelector(appRepo, appPartName, siteData, appService, instanceVersion) {
        var dataSelectorDef = getDataSelectorDefinition(appRepo, appPartName);
        return dataSelectorDef ? dataSelectorFactory.getDataSelector(dataSelectorDef, siteData, appService, instanceVersion) : null;
    }

    function getDataSelectorDefinition(appRepo, appPartName) {
        /** @type AppPartDefinition */
        var partDefinition = getAppPartDefinition(appRepo, appPartName);

        if (!partDefinition) {
            return null;
        }

        var dataSelectorId = partDefinition.dataSelector || (partDefinition.dataSelectorDef && partDefinition.dataSelectorDef.id);
        return appRepo.dataSelectors[dataSelectorId];
    }

    /**
     * Get the AppPart Definition according to the (unique) appPartName.
     * @param {AppRepoDefinition} appRepo
     * @param {string} appPartName
     * @returns {AppPartDefinition}
     */
    function getAppPartDefinition(appRepo, appPartName) {
        return _.get(appRepo, ['parts', appPartName]);
    }

    /**
     * Get the view definition with the given name for the type and format needed.
     * @param {AppRepoDefinition} appRepo
     * @param {string} viewName
     * @param {string} type
     * @param {''|'Mobile'|'*'} formatName
     * @returns {ViewDefinition}
     */
    function getViewDef(appRepo, viewName, type, formatName) {
        var idWithFormat = [type, viewName, formatName].join('|');
        var idWithoutFormat = [type, viewName].join('|');

        var viewDef = appRepo.views[idWithFormat] || appRepo.views[idWithoutFormat];
        if (viewDef) {
            // Adds missing ids (i.e. def_0, def_1) to proxies without id or data.
            wixapps.viewsUtils.fillViewDefMissingIDs(viewDef);
        }
        return viewDef;
    }

    function getNamesOfPartsOfType(appRepo, typeId) {
        return _(appRepo.parts)
            .pick(function(part) {
                return part.type === typeId;
            })
            .keys()
            .value();
    }

    /**
     * @class appRepo
     */
    return {
        getDataSelector: getDataSelector,
        getAppPartDefinition: getAppPartDefinition,
        getViewDef: getViewDef,
        getDataSelectorDefinition: getDataSelectorDefinition,
        getNamesOfPartsOfType: getNamesOfPartsOfType
    };
});

/**
 * @typedef {object} AppRepoDefinition
 * @property {string} applicationInstanceVersion
 * @property {{DataSelectorDefinition[]}} dataSelectors
 * @property {{AppPartDefinition[]}} parts
 * @property {{ViewDefinition[]}} views
 */

/**
 * @typedef {object} AppPartPreDefinedSettings
 * @property {string[]} tags
 * @property {string} selectedTag
 */

/**
 * @typedef {object} AppPartDefinition
 * @property {?string} dataSelector
 * @property {?{id: string, predefinedSettings: AppPartPreDefinedSettings}} dataSelectorDef
 * @property {string} viewName
 * @property {string} type
 * @property {string} displayName
 */

/**
 * @typedef {object} ViewDefinition
 * @property {object} comp
 * @property {object[]} customizations
 * @property {string} forType
 * @property {string} id
 * @property {string} name
 * @property {?string} format
 */
