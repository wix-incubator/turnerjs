//created By NirM :)
define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    function isCompDisplayed(nodeModes, overridingStructure) {
        var isDisplayed = true;
        if (nodeModes) {
            var isDisplayedByDefault = !nodeModes.isHiddenByModes;
            var isDisplayedOverridden = overridingStructure && !_.isUndefined(overridingStructure.isHiddenByModes);
            isDisplayed = isDisplayedOverridden ? !overridingStructure.isHiddenByModes : isDisplayedByDefault;
        }
        return isDisplayed;
    }

    function getRootActiveModesByPageId(activeModes, pageId) {
        activeModes = activeModes || {};
        return _.omit(activeModes[pageId], function (value) {
            return !value;
        });
    }

    function isOverrideActive(override, pageActiveModes) {
        return !_.isEmpty(pageActiveModes) && _.every(override.modeIds, function (modeId) {
                return pageActiveModes[modeId];
            });
    }

    function getOverridingStructure(overrides, pageActiveModes) {
        var activeOverridingStructure = _.transform(overrides, function (accumulator, override) {
            if (isOverrideActive(override, pageActiveModes)) {
                _.assign(accumulator, override);
            }
        }, {});
        delete activeOverridingStructure.modeIds;

        return activeOverridingStructure;
    }


    function getChildrenKey(compStructure, isMobile) {
        var key = isMobile && compStructure.mobileComponents ? 'mobileComponents' : 'children';
        return compStructure[key] ? key : 'components';
    }

    function generateDisplayedStructureFromComponent(pageActiveModes, compStructure) {
        var desktopChildrenKey = getChildrenKey(compStructure, false);
        var mobileChildrenKey = getChildrenKey(compStructure, true);
        var modes = compStructure.modes;
        var overrides = _.get(compStructure, ['modes', 'overrides']);
        var overridingStructure = getOverridingStructure(overrides || [], pageActiveModes, compStructure);

        if (!isCompDisplayed(modes, overridingStructure)) {
            return undefined;
        }

        var displayedComp = coreUtils.objectUtils.cloneDeep(_.omit(compStructure, ['modes', desktopChildrenKey, mobileChildrenKey]));
        if (modes) {
            if (modes.overrides) {
                overridingStructure = _.omit(overridingStructure, 'isHiddenByModes');
                _.assign(displayedComp, overridingStructure);
            }

            if (modes.definitions) {
                _.set(displayedComp, ['modes', 'definitions'], modes.definitions);
            }
        }

        generateDisplayedStructureChildren(displayedComp, desktopChildrenKey, pageActiveModes, compStructure);
        if (desktopChildrenKey !== mobileChildrenKey) {
            generateDisplayedStructureChildren(displayedComp, mobileChildrenKey, pageActiveModes, compStructure);
        }

        return displayedComp;
    }

    function generateDisplayedStructureChildren(displayedComp, childrenKey, pageActiveModes, compStructure) {
        if (!_.isUndefined(compStructure[childrenKey])) {
            displayedComp[childrenKey] = _(compStructure[childrenKey])
                .map(function (childStructure) {
                    return generateDisplayedStructureFromComponent(pageActiveModes, childStructure);
                })
                .compact()
                .value();
        }
    }

    function generateDisplayedJsonFromPage(fullPage, activeModes) {
        var rootId = fullPage.structure.id;
        var rootActiveModes = getRootActiveModesByPageId(activeModes, rootId);
        var displayedPage = coreUtils.objectUtils.cloneDeep(_.omit(fullPage, 'structure', 'data'));
        displayedPage.structure = generateDisplayedStructureFromComponent(rootActiveModes, fullPage.structure);
        displayedPage.data = coreUtils.objectUtils.cloneDeep(fullPage.data);
        return displayedPage;
    }

    function generateDisplayedFromPagesData(pagesData, activeModes) {
        activeModes = activeModes || {};
        var pagesDataToReturn = {};
        _.forEach(pagesData, function (root, rootId) {
            pagesDataToReturn[rootId] = generateDisplayedJsonFromPage(root, activeModes);
        });
        return pagesDataToReturn;
    }

    function isPageJson(jsonFragment) {
        return !_.isUndefined(jsonFragment.structure);
    }

    function isMasterPageStructure(jsonFragment) {
        return _.get(jsonFragment, 'type') === 'Document';
    }

    function isComponentJson(jsonFragment) {
        return !_.isUndefined(jsonFragment.componentType);
    }

    /**
     * @class fullToDisplayed
     */
    return {
        /**
         *
         * @param fullJsonFragment
         * @param activeModes
         * @returns {{structure: *, data: *}}
         */
        getDisplayedJson: function (fullJsonFragment, activeModes, rootId) {
            var displayedJson = {};

            if (fullJsonFragment) {
                if (isComponentJson(fullJsonFragment) || isMasterPageStructure(fullJsonFragment)) { // page-component or component
                    var rootActiveModes = getRootActiveModesByPageId(activeModes, rootId);
                    displayedJson.structure = generateDisplayedStructureFromComponent(rootActiveModes, fullJsonFragment);
                } else if (isPageJson(fullJsonFragment)) { // page
                    displayedJson = generateDisplayedJsonFromPage(fullJsonFragment, activeModes);
                } else { // pages data
                    displayedJson = generateDisplayedFromPagesData(fullJsonFragment, activeModes);
                }
            }

            return displayedJson;
        },

        applyModesOnSerializedStructure: function (fullSerializedJSON, activeModes) {
            activeModes = activeModes || {};
            return generateDisplayedStructureFromComponent(activeModes, fullSerializedJSON);
        }
    };
});


