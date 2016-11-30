define(['utils',
    'lodash',
    'core/core/dataRequirementsChecker',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/pointers/pointersCache',
    'core/core/data/DisplayedJsonUpdater',
    'core/core/data/DisplayedJsonDal',
    'coreUtils',
    'core/core/data/apiSections/documentDataAPI',
    'core/core/data/RuntimeDal'], function
    (utils, _, dataRequirementsChecker, DataAccessPointers, PointersCache, DisplayedJsonUpdater, DisplayedJsonDal, coreUtils, documentDataAPI, RuntimeDal) {
    'use strict';

    var constants = utils.constants;
    var privates = {};

    function createSiteDataAPIAndDal(fullSiteData, ajaxHandler) {
        var fullPagesData = {pagesData: fullSiteData.pagesData};
        var cache = new PointersCache(fullSiteData, fullSiteData, fullPagesData);
        var dalAndPointers = initDisplayedDalAndPointers(fullSiteData, cache);

        privates[fullSiteData.siteId] = createPrivatesForSite(fullSiteData, dalAndPointers, cache, fullPagesData, ajaxHandler);

        return _.clone(privates[fullSiteData.siteId]);
    }

    function createPrivatesForSite(fullSiteData, dalAndPointers, cache, fullPagesData, ajaxHandler) {
        var privatesForSite = {};
        privatesForSite.displayedDal = dalAndPointers.dal;
        privatesForSite.pointers = dalAndPointers.pointers;
        privatesForSite.cache = cache;
        privatesForSite.displayedJsonUpdater = initDisplayedJsonUpdater(dalAndPointers, fullPagesData, cache);
        privatesForSite.fullPagesData = fullPagesData;
        privatesForSite.siteData = fullSiteData;
        privatesForSite.siteData.pagesData = _.clone(fullPagesData.pagesData);
        privatesForSite.siteDataAPI = new SiteDataAPI(privatesForSite, fullSiteData.siteId, ajaxHandler);
        return privatesForSite;
    }

    function initDisplayedJsonUpdater(displayedDalAndPointers, fullPagesData, pointersCache) {
        var fullJsonCache = pointersCache.getBoundCacheInstance(true);
        var displayedJsonCache = pointersCache.getBoundCacheInstance(false);
        var displayedDal = displayedDalAndPointers.dal;
        var pointers = displayedDalAndPointers.pointers;
        return new DisplayedJsonUpdater(fullPagesData, displayedDal, fullJsonCache, displayedJsonCache, pointers);
    }

    function initDisplayedDalAndPointers(fullSiteData, cache) {
        return {
            dal: new DisplayedJsonDal(fullSiteData, cache.getBoundCacheInstance(false)),
            pointers: new DataAccessPointers(cache)
        };
    }

    function updatePageAnchorsIfNeeded(pageStructure) {
        var siteData = this.siteData;
        var isRootIgnoreBottomBottom = siteData.isRootIgnoreBottomBottom(pageStructure.id);

        if (utils.layoutAnchors.shouldCreateAnchorsForPage(pageStructure, siteData.isMobileView(), isRootIgnoreBottomBottom)) {
            this.createPageAnchors(pageStructure.id);
        }
    }

    var dataCounter = 0;

    function waitForAllDataToBeLoaded(store, siteData, fullPagesData, urlData, callback, pagesToLoad, timedOut) {
        /** @type {utils.Store.requestDescriptor[]} */
        if (timedOut) {
            callback(pagesToLoad);
        }
        var requests = dataRequirementsChecker.getNeededRequests(siteData, fullPagesData, urlData);
        var pageRequests = _.filter(requests, function (req) {
            return _.first(req.destination) === 'pagesData' && req.destination.length === 2;
        });

        pagesToLoad = pagesToLoad || [];
        pagesToLoad = pagesToLoad.concat(_.map(pageRequests, 'destination[1]'));

        if (requests.length === 0 && !timedOut) {
            siteData.wixBiSession['dataLoaded' + dataCounter++] = _.now();
            callback(pagesToLoad);
        } else {
            store.loadBatch(requests, waitForAllDataToBeLoaded.bind(undefined, store, siteData, fullPagesData, urlData, callback, pagesToLoad));
        }
    }

    function notifyDataLoaded(siteId, fullJson, path, data) {
        var privatesForSite = privates[siteId];
        setDataToFullAndDisplayedJson.call(this, privatesForSite, fullJson, path, data);
        if (_.first(path) !== 'pagesData' && privatesForSite.dataLoadedCallback) {
            privatesForSite.dataLoadedCallback(path, data);
        }
    }

    function resolveDisplayedPageCreation(pageId, privatesForSite) {
        if (pageId !== 'masterPage' && !privatesForSite.siteData.pagesData.masterPage) {
            this.pagesPendingForMasterPage.push(pageId);
        } else if (pageId === 'masterPage') {
            this.createDisplayedPage(pageId);
            _.forEach(this.pagesPendingForMasterPage, this.createDisplayedPage, this);
            this.pagesPendingForMasterPage = [];
        } else {
            this.createDisplayedPage(pageId);
        }
    }

    function setDataToFullAndDisplayedJson(privatesForSite, fullJson, path, data) {
        if (isAFullJsonPath(path)) {
            // write to full JSON and create displayedJson
            _.set(fullJson, path, data);
            var pageId = path[1];
            resolveDisplayedPageCreation.call(this, pageId, privatesForSite);
        } else {
            _.set(privatesForSite.siteData, path, data);
        }
    }

    function isAFullJsonPath(path) {
        return _.first(path) === 'pagesData' && _.size(path) > 1;
    }

    function notifyOnDisplayedJsonUpdate(rootCompPointer) {
        var pagePointer = privates[this.siteId].pointers.components.getPageOfComponent(rootCompPointer);
        _.forEach(this._displayedJsonUpdateCallbacks, function (callback) {
            callback(pagePointer.id, rootCompPointer.id);
        });
    }

    function getPointerByCompId(siteDataAPI, compId, rootId) {
        var privatesForSite = privates[siteDataAPI.siteId];
        var mode = getSiteViewMode(privatesForSite);
        var pagePointer = privatesForSite.pointers.components.getPage(rootId, mode);
        return privatesForSite.pointers.components.getComponent(compId, pagePointer);
    }

    function getSiteViewMode(privatesForSite) {
        return privatesForSite.siteData.isMobileView() ? constants.VIEW_MODES.MOBILE : constants.VIEW_MODES.DESKTOP;
    }

    function SiteDataAPI(sitePrivates, siteId, ajaxHandler) {
        sitePrivates.dataLoadedCallback = null;
        this.siteId = siteId;
        this.siteData = sitePrivates.siteData;
        this.store = new utils.Store(this.siteData, ajaxHandler);
        this.store.registerDataLoadedCallback(_.bind(notifyDataLoaded, this, this.siteId, sitePrivates.fullPagesData));
        this.siteData.setStore(this.store);
        this._displayedJsonUpdateCallbacks = [];
        this.pagesPendingForMasterPage = [];

        // api sections
        this.document = documentDataAPI(sitePrivates);
        this.runtime = new RuntimeDal(sitePrivates.siteData, this, sitePrivates.displayedDal, sitePrivates.pointers);
    }

    function updateCompModesAndEnsureActiveModesPerModeType(rootId, compPointer, modeIdToDeactivate, modeIdToActivate) {
        var privatesForSite = privates[this.siteId];
        var definitionsPointer = privatesForSite.pointers.componentStructure.getModesDefinitions(compPointer);
        var modesDefinitions = privatesForSite.displayedDal.get(definitionsPointer);
        var modeToActivate = modeIdToActivate && _.find(modesDefinitions, {modeId: modeIdToActivate});
        var modeToDeactivate = modeIdToDeactivate && _.find(modesDefinitions, {modeId: modeIdToDeactivate});
        var scrollModes = _.filter(modesDefinitions, {type: coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL});
        var defaultMode = _.find(modesDefinitions, {type: coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT});
        var hoverMode = _.find(modesDefinitions, {type: coreUtils.siteConstants.COMP_MODES_TYPES.HOVER});
        this.siteData.activeModes[rootId] = this.siteData.activeModes[rootId] || {};
        var activeModes = this.siteData.activeModes[rootId];

        if (modeToActivate) {
            activeModes[modeIdToActivate] = true;
            switch (modeToActivate.type) {
                case coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL:
                    _.forEach(scrollModes, function (modeDef) {
                        if (modeDef.modeId !== modeToActivate.modeId) {
                            activeModes[modeDef.modeId] = false;
                        }
                    });
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT:
                    activeModes[hoverMode.modeId] = false;
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.HOVER:
                    if (defaultMode) {
                        activeModes[defaultMode.modeId] = false;
                    }
                    break;

            }
        }
        if (modeToDeactivate) {
            activeModes[modeIdToDeactivate] = false;
            switch (modeToDeactivate.type) {
                case coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL:
                    if (!modeToActivate || modeToActivate.type !== coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL) {
                        activeModes[_.first(scrollModes).modeId] = true;
                    }
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT:
                    activeModes[hoverMode.modeId] = true;
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.HOVER:
                    if (defaultMode) {
                        activeModes[defaultMode.modeId] = true;
                    }
                    break;
            }
        }
    }

    SiteDataAPI.prototype = {
        registerDataLoadedCallback: function (callback) {
            var privatesForSite = privates[this.siteId];
            privatesForSite.dataLoadedCallback = callback;
        },

        refreshRenderedRootsData: function (callback) {
            var privatesForSite = privates[this.siteId];

            var rootId = this.siteData.getFocusedRootId();
            var navigationInfo = this.siteData.getExistingRootNavigationInfo(rootId);

            waitForAllDataToBeLoaded(this.store, privatesForSite.siteData, privatesForSite.fullPagesData, navigationInfo, callback);
        },

        registerDisplayedJsonUpdateCallback: function (callback) {
            this._displayedJsonUpdateCallbacks.push(callback);
        },

        loadPage: function (urlData, callback) {
            var privatesForSite = privates[this.siteId];

            function invokeDataLoadedCallback(pageId) {
                if (privatesForSite.dataLoadedCallback) {
                    var fullPage = privatesForSite.fullPagesData.pagesData[pageId];
                    privatesForSite.dataLoadedCallback(['pagesData', pageId], fullPage);
                }
            }

            waitForAllDataToBeLoaded(this.store, privatesForSite.siteData, privatesForSite.fullPagesData, urlData, function (pagesMaybeLoadedIds) {
                if (urlData.pageId && !_.includes(pagesMaybeLoadedIds, urlData.pageId)) {
                    this.createDisplayedPage(urlData.pageId);
                }

                _.forEach(pagesMaybeLoadedIds, invokeDataLoadedCallback, this);
                callback();
            }.bind(this), []);
        },

        resetAllActiveModes: function () {
            var rootIdsToRemove = _.keys(this.siteData.activeModes);
            _.forEach(rootIdsToRemove, function (rootId) {
                if (!_.isEmpty(this.siteData.activeModes[rootId])) {
                    this.siteData.activeModes[rootId] = {};
                    this.createDisplayedPage(rootId);
                }
            }, this);
        },

        deactivateModesInPage: function (rootId) {
            var currentRootModes = this.getActiveModes()[rootId];
            if (!_.isEmpty(currentRootModes)) {
                var sitePrivates = privates[this.siteId];
                sitePrivates.siteData.activeModes[rootId] = {};
                return this.createDisplayedPage(rootId);
            }
            return false;
        },

        getActiveModes: function () {
            var activeModes = {};
            _.forEach(this.siteData.activeModes, function (rootModes, rootId) {
                activeModes[rootId] = _.omit(rootModes, function (value) {
                    return !value;
                });
            });
            return activeModes;
        },

        getPageActiveModes: function (pageId) {
            return _.omit(this.siteData.activeModes[pageId], function (value) {
                return !value;
            });
        },

        activateModeById: function (compId, rootId, modeId) {
            var pointer = getPointerByCompId(this, compId, rootId);
            return this.activateMode(pointer, modeId);
        },

        activateMode: function (compPointer, modeId) {
            var privatesForSite = privates[this.siteId];
            var rootPointer = privatesForSite.pointers.full.components.getPageOfComponent(compPointer);
            if (rootPointer && rootPointer.id) {
                var currentRootModes = this.getActiveModes()[rootPointer.id];
                if (currentRootModes && currentRootModes[modeId]) {
                    return false;
                }
                this.siteData.activeModes[rootPointer.id] = this.siteData.activeModes[rootPointer.id] || {};
                updateCompModesAndEnsureActiveModesPerModeType.call(this, rootPointer.id, compPointer, null, modeId);
                this.createDisplayedNode(compPointer);
                return true;
            }
            return false;
        },

        deactivateModeById: function (compId, rootId, modeId) {
            var pointer = getPointerByCompId(this, compId, rootId);
            return this.deactivateMode(pointer, modeId);
        },

        deactivateMode: function (compPointer, modeId) {
            var privatesForSite = privates[this.siteId];
            var rootPointer = privatesForSite.pointers.full.components.getPageOfComponent(compPointer);
            if (rootPointer && rootPointer.id) {
                var currentRootModes = this.getActiveModes()[rootPointer.id];
                if (!currentRootModes || !currentRootModes[modeId]) {
                    return false;
                }
                this.siteData.activeModes[rootPointer.id] = this.siteData.activeModes[rootPointer.id] || {};
                updateCompModesAndEnsureActiveModesPerModeType.call(this, rootPointer.id, compPointer, modeId);
                this.createDisplayedNode(compPointer);
                return true;
            }
            return false;
        },

        switchModesByIds: function (compPointer, rootId, modeIdToDeactivate, modeIdToActivate) {
            return this.switchModes(compPointer, modeIdToDeactivate, modeIdToActivate);
        },

        switchModes: function (compPointer, modeIdToDeactivate, modeIdToActivate) {
            if (modeIdToDeactivate === modeIdToActivate) {
                return false;
            }
            var privatesForSite = privates[this.siteId];
            var rootPointer = privatesForSite.pointers.full.components.getPageOfComponent(compPointer);
            this.siteData.activeModes[rootPointer.id] = this.siteData.activeModes[rootPointer.id] || {};
            var currentRootModes = this.getActiveModes()[rootPointer.id];
            var modesChanged = false;

            if (!currentRootModes[modeIdToActivate] || currentRootModes[modeIdToDeactivate]) {
                modesChanged = true;
            }

            if (modesChanged) {
                updateCompModesAndEnsureActiveModesPerModeType.call(this, rootPointer.id, compPointer, modeIdToDeactivate, modeIdToActivate);
                this.createDisplayedNode(compPointer);
            }
            return modesChanged;
        },

        updatePageAnchorsIfNeeded: updatePageAnchorsIfNeeded,

        /**
         * Recursive creation of anchors for all components in page
         * According to current viewMode, the anchors map is updated on siteData.anchorsMap[pageId][viewMode]
         * @param rootId
         */
        createPageAnchors: function (rootId, forceMobileStructure) {
            var sitePrivates = privates[this.siteId];
            var pageStructure = this.siteData.getPageData(rootId).structure;

            sitePrivates.displayedJsonUpdater.createPageAnchors(pageStructure, forceMobileStructure);
        },

        createPageOriginalValuesMap: function (rootId, forceMobileStructure) {
            var siteData = this.siteData;
            var pageStructure = siteData.getPageData(rootId).structure;
            var theme = siteData.getAllTheme();
            var viewMode = forceMobileStructure ? utils.constants.VIEW_MODES.MOBILE : siteData.getViewMode();
            var isMobileView = (viewMode === utils.constants.VIEW_MODES.MOBILE);

            var rootOriginalValuesMap = utils.originalValuesMapGenerator.createOriginalValuesMap(pageStructure, theme, isMobileView);
            _.set(siteData, ['originalValuesMap', pageStructure.id, viewMode], rootOriginalValuesMap);
        },

        removePageOriginalValues: function (rootId, forceMobileStructure) {
            var siteData = this.siteData;
            var pageStructure = siteData.getPageData(rootId).structure;
            var viewMode = forceMobileStructure ? utils.constants.VIEW_MODES.MOBILE : siteData.getViewMode();

            _.set(siteData, ['originalValuesMap', pageStructure.id, viewMode], {});
        },

        /**
         * Non recursive creation of anchors for children of given structure.
         * @param parentStructure - component structure
         * @param parentPageId - the page that contains the parent component
         */
        createChildrenAnchors: function (parentStructure, parentPageId) {
            var siteData = this.siteData;
            var viewMode = siteData.getViewMode();
            var theme = siteData.getAllTheme();
            var parentRootStructureId = _.get(siteData, ['pagesData', parentPageId, 'structure', 'id']);
            var generatedAnchorsMap = utils.layoutAnchors.createChildrenAnchors(parentStructure, theme, siteData.isMobileView());
            _.assign(siteData.anchorsMap[parentRootStructureId][viewMode], generatedAnchorsMap);
        },

        createDisplayedPage: function (rootId) {
            var sitePrivates = privates[this.siteId];
            var activeModes = this.siteData.activeModes;
            var fullPage = sitePrivates.fullPagesData.pagesData[rootId];
            if (!fullPage) {
                return false;
            }
            this.activateDefaultModesIfNeeded(rootId);
            var displayedPage = sitePrivates.displayedJsonUpdater.updateDisplayedRoot(activeModes, fullPage);
            updatePageAnchorsIfNeeded.call(this, displayedPage.structure);
            return true;
            //width? -> should it be before or after the creating the displayed
        },

        createDisplayedNode: function (pointer) {
            var sitePrivates = privates[this.siteId];
            var pagePointer = sitePrivates.pointers.components.getPageOfComponent(pointer);
            var fullPageStructure = sitePrivates.fullPagesData.pagesData[pagePointer.id].structure;
            this.activateDefaultModesIfNeeded(pagePointer.id);
            sitePrivates.displayedJsonUpdater.onModesChange(pointer, this.siteData.activeModes);
            updatePageAnchorsIfNeeded.call(this, fullPageStructure);
            sitePrivates.cache.resetValidations();
            notifyOnDisplayedJsonUpdate.call(this, pointer);
        },

        activateDefaultModesIfNeeded: function (rootId) {
            var sitePrivates = privates[this.siteId];
            if (!rootId) {
                return;
            }
            var fullPageStructure = sitePrivates.fullPagesData.pagesData[rootId].structure;
            var activeModes = this.siteData.activeModes;
            var isMobile = this.siteData.isMobileView();
            var currentRootActiveModes = _.clone(activeModes[rootId]);
            var updatedRootActiveModes = utils.modes.resolveCompActiveModesRecursive(fullPageStructure, currentRootActiveModes, isMobile);
            this.siteData.activeModes[rootId] = updatedRootActiveModes;
            var modesHaveChanged = !_.isEqual(currentRootActiveModes, updatedRootActiveModes);
            return modesHaveChanged;
        }
    };

    return {
        createSiteDataAPIAndDal: createSiteDataAPIAndDal
    };
});
