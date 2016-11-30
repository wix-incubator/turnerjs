define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE = 'updates outside of pagesData should be done only through full json DAL';

    function isPageDataPath(path) {
        return isInPagesDataPath(path) && path.length > 2 && path[2] === 'data';
    }

    function isPageStructurePath(path) {
        return isInPagesDataPath(path) && path.length > 2 && path[2] === 'structure';
    }

    function isPagePath(path) {
        return isInPagesDataPath(path) && path.length === 2;
    }

    function isInPagesDataPath(path) {
        return path && path.length > 0 && path[0] === 'pagesData';
    }

    function isPagesDataPath(path) {
        return _.isEqual(path, ['pagesData']);
    }

    function isPointerTypeCompOrCompPart(pointer) {
        return isPointerTypeComponent.call(this, pointer) || isPointerTypeComponentPart.call(this, pointer);
    }

    function isPointerPathToPagesData(pointer) {
        var noInnerPathPointer = this.pointers.getOriginalPointerFromInner(pointer);
        var path = this.displayedCache.getPath(noInnerPathPointer);
        return isInPagesDataPath(path);
    }

    function isPagePointer(pointer) {
        return this.pointers.getPointerType(pointer) === 'page';
    }

    function isPointerTypeComponent(pointer) {
        return this.pointers.getPointerType(pointer) === 'component';
    }

    function isPointerTypeComponentPart(pointer) {
        return this.pointers.getPointerType(pointer) === 'componentStructure';
    }

    function isDataPointer(pointer) {
        return pointer && _.includes(utils.constants.DATA_TYPES, pointer.type);
    }

    function updateDisplayedJsonByPointer(pointer, activeModes) {
        var nodePath = this.fullCache.getPath(pointer);
        if (!nodePath) {
            throw new Error('pointer path does not exist');
        }
        if (isPagesDataPath(nodePath)) {
            var fullPagesData = _.get(this.fullJson, nodePath);
            updateDisplayedPagesData.call(this, fullPagesData, activeModes);
        } else if (isInPagesDataPath(nodePath)) {
            updateDisplayedJsonInPagesDataByPointer.call(this, pointer, activeModes);
        } else {
            var fullStructureNode = _.get(this.fullJson, nodePath);
            this.displayedJsonDAL.set(pointer, fullStructureNode);
        }
    }

    function updateDisplayedPagesData(fullPagesData, activeModes) {
        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
        this.displayedJsonDAL.set(pagesDataPointer, {});
        updateDisplayedPage.call(this, activeModes, 'masterPage');
        _(fullPagesData)
            .omit('masterPage')
            .keys()
            .forEach(updateDisplayedPage.bind(this, activeModes))
            .value();
    }

    function updateDisplayedPage(activeModes, rootId) {
        var pagePointer = this.pointers.page.getPagePointer(rootId) || this.pointers.page.getNewPagePointer(rootId);
        this.displayedJsonDAL.set(pagePointer, {});
        updateDisplayedJsonInPagesDataByPointer.call(this, pagePointer, activeModes);
    }

    function updateDisplayedJsonInPagesDataByPointer(pointer, activeModes) {
        var nodePath = this.fullCache.getPath(pointer);

        var pagePath = _.take(nodePath, 2);
        var pageId = _.last(pagePath);
        var fullStructureNode = _.get(this.fullJson, nodePath);

        if (isInPagesDataPath(nodePath) && !isDataPointer(pointer)) {
            activeModes[pageId] = resolveAndUpdateActiveModes.call(this, fullStructureNode, activeModes[pageId], pageId);
            var displayedDataAndStructure = getDisplayedJson(fullStructureNode, activeModes, pageId);
            setStructureAndData.call(this, pointer, displayedDataAndStructure, pagePath);
            if (this.pointers.page.isPointerPageType(pointer)) {
                createPageAnchorsIfNeeded.call(this, pageId);
            }
        } else {
            this.displayedJsonDAL.set(pointer, fullStructureNode);
        }
    }

    function createPageAnchorsIfNeeded(rootId) {
        var siteData = this.displayedJsonDAL.jsonData;
        var pageStructure = siteData.getPageData(rootId).structure;
        var isRootIgnoreBottomBottom = siteData.isRootIgnoreBottomBottom(rootId);
        var generatedAnchorsExist = _.get(siteData, ['anchorsMap', rootId, siteData.getViewMode()]);
        if (generatedAnchorsExist || utils.layoutAnchors.shouldCreateAnchorsForPage(pageStructure, siteData.isMobileView(), isRootIgnoreBottomBottom)) {
            this.createPageAnchors(pageStructure);
        }
    }

    function resolveAndUpdateActiveModes(fullStructureNode, rootActiveModes, pageId) {
        var compTreeActiveModes = utils.modes.resolveCompActiveModesRecursive(fullStructureNode, rootActiveModes, pageId);
        _.assign(rootActiveModes, compTreeActiveModes);
        var activeModesPointer = this.pointers.general.getActiveModes();
        var pageActiveModesPointer = this.pointers.getInnerPointer(activeModesPointer, pageId);
        this.displayedJsonDAL.set(pageActiveModesPointer, rootActiveModes);
        return rootActiveModes;
    }

    /**
     * Updates by path must update entire pages, since the path is different between full and displayed json, below the page level, and it can't be used to find the updated node.
     * @param path
     * @param activeModes
     */
    function updateDisplayedJsonByPath(path, activeModes) {
        var pageId = path[1];
        if (isPageStructurePath(path)) {
            var pageComponentPointer = this.pointers.components.getPage(pageId, utils.constants.VIEW_MODES.DESKTOP);
            updateDisplayedJsonInPagesDataByPointer.call(this, pageComponentPointer, activeModes);
        } else if (isPagePath(path)) {
            var pagePointer = this.pointers.page.getPagePointer(pageId) || this.pointers.page.getNewPagePointer(pageId);
            updateDisplayedJsonInPagesDataByPointer.call(this, pagePointer, activeModes);
        } else if (isPagesDataPath(path)) {
            var fullPagesData = _.get(this.fullJson, path);
            updateDisplayedPagesData.call(this, fullPagesData, activeModes);
        } else {
            // paths out of pagesData
            var valueFromFullJson = _.get(this.fullJson, path);
            this.displayedJsonDAL.setByPath(path, valueFromFullJson);
        }
    }

    function setStructureAndData(pointer, displayedStructureAndData, pagePath) {
        if (!isPagePointer.call(this, pointer)) {
            this.displayedJsonDAL.set(pointer, displayedStructureAndData.structure);
        } else if (!_.get(this.displayedJsonDAL.jsonData, pagePath)) {
            this.displayedJsonDAL.set(pointer, displayedStructureAndData);
        } else {
            var currentMobileComponents = _.get(this.displayedJsonDAL.jsonData, pagePath.concat(['structure', 'mobileComponents']));
            if (currentMobileComponents) {
                displayedStructureAndData.structure.mobileComponents = currentMobileComponents;
            }
            this.displayedJsonDAL.merge(pointer, displayedStructureAndData);
        }
    }

    function getDisplayedJson(node, activeModes, rootId) {
        return utils.siteRenderPrivateStuff.fullToDisplayedJson.getDisplayedJson(node, activeModes, rootId);
    }

    function createMasterPageAnchors(siteData, masterPageStructure, theme, viewMode) {
        var isMobileView = (viewMode === utils.constants.VIEW_MODES.MOBILE);
        var regularMasterPageAnchorsMap = utils.layoutAnchors.createPageAnchors(masterPageStructure, theme, isMobileView);
        var landingPageMasterPageAnchorsMap = getAnchorsForLandingPageMasterPage();

        _.set(siteData, ['anchorsMap', masterPageStructure.id, viewMode], regularMasterPageAnchorsMap);
        _.set(siteData, ['anchorsMap', 'defaultMasterPage', viewMode], regularMasterPageAnchorsMap);
        _.set(siteData, ['anchorsMap', 'landingPageMasterPage', viewMode], landingPageMasterPageAnchorsMap);
    }

    function getAnchorsForLandingPageMasterPage() {
        return {
            PAGES_CONTAINER: [{
                distance: 0,
                locked: true,
                originalValue: 0,
                fromComp: 'PAGES_CONTAINER',
                targetComponent: "masterPage",
                type: "BOTTOM_PARENT"
            }],
            SITE_PAGES: [{
                distance: 0,
                locked: true,
                originalValue: 0,
                fromComp: 'SITE_PAGES',
                targetComponent: 'PAGES_CONTAINER',
                type: 'BOTTOM_PARENT'
            }]
        };

    }

    /**
     * DisplayedJsonUpdater
     * @param fullJson
     * @param displayedJsonDAL
     * @param fullJsonCache
     * @param displayedJsonCache
     * @param dataAccessPointers
     * @constructor
     */
    function DisplayedJsonUpdater(fullJson, displayedJsonDAL, fullJsonCache, displayedJsonCache, dataAccessPointers) {
        this.fullJson = fullJson;
        this.displayedJsonDAL = displayedJsonDAL;
        this.fullCache = fullJsonCache;
        this.displayedCache = displayedJsonCache;
        this.pointers = dataAccessPointers;
    }

    DisplayedJsonUpdater.prototype = {
        onPush: function (pointerToArray, index, item, pointerToPush, activeModes) {
            activeModes = activeModes || {};
            if (!isPointerPathToPagesData.call(this, pointerToArray)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }

            if (isPointerTypeCompOrCompPart.call(this, pointerToArray)) {
                var pointerRoot = this.pointers.getOriginalPointerFromInner(pointerToArray);
                updateDisplayedJsonByPointer.call(this, pointerRoot, activeModes);
                return;
            }
            this.displayedJsonDAL.push(pointerToArray, item, pointerToPush, index);
        },

        onMerge: function (pointer, activeModes) {
            activeModes = activeModes || {};
            var originalPointer = this.pointers.getOriginalPointerFromInner(pointer);
            if (!isPointerPathToPagesData.call(this, originalPointer)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }

            updateDisplayedJsonByPointer.call(this, originalPointer, activeModes);
        },

        onRemove: function (pointer, activeModes) {
            activeModes = activeModes || {};
            if (!isPointerPathToPagesData.call(this, pointer)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }
            if (isPointerTypeComponentPart.call(this, pointer)) {
                var originalCompPointer = this.pointers.getOriginalPointerFromInner(pointer);
                updateDisplayedJsonByPointer.call(this, originalCompPointer, activeModes);
                return;
            }
            this.displayedJsonDAL.remove(pointer);
        },

        onSet: function (pointer, activeModes) {
            activeModes = activeModes || {};
            var isModesPointer = this.pointers.getInnerPointerPathRoot(pointer) === 'modes';
            var pointerWithoutInnerPath = this.pointers.getOriginalPointerFromInner(pointer);
            var pointerToUpdate;
            if (isModesPointer) {
                var parent = this.pointers.full.components.getParent(pointerWithoutInnerPath);
                if (parent) {
                    pointerToUpdate = parent;
                } else {
                    pointerToUpdate = pointerWithoutInnerPath;
                }
            } else {
                pointerToUpdate = pointerWithoutInnerPath;
            }

            var nodePath = this.fullCache.getPath(pointerToUpdate);
            if (!isInPagesDataPath(nodePath)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }

            updateDisplayedJsonByPointer.call(this, pointerToUpdate, activeModes);
        },

        onSetByPath: function (path, activeModes) {
            activeModes = activeModes || {};
            if (!isInPagesDataPath(path)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }
            updateDisplayedJsonByPath.call(this, path, activeModes);
        },

        onRemoveByPath: function (path, activeModes) {
            activeModes = activeModes || {};
            if (!isInPagesDataPath(path)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }
            if (!_.isArray(path) || _.isEqual(path, ['pagesData'])) {
                throw new Error('path "' + path + '" is invalid or cant be removed');
            }
            if (isPagePath(path) || isPageDataPath(path)) {
                this.displayedJsonDAL.removeByPath(path, activeModes);
            } else if (isPageStructurePath(path)) {
                updateDisplayedJsonByPath.call(this, path, activeModes);
            }
        },

        onPushByPath: function (path, optionalIndex, activeModes) {
            activeModes = activeModes || {};
            if (!isInPagesDataPath(path)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }
            if (_.isArray(path) && isInPagesDataPath(path)) {
                updateDisplayedJsonByPath.call(this, path, activeModes);
                return;
            }
            var pathToValue = _.isNumber(optionalIndex) ? path.concat(optionalIndex) : path;
            var valueToPush = _.get(this.fullJson, pathToValue);
            this.displayedJsonDAL.pushByPath(path, valueToPush, optionalIndex);
        },

        onMergeByPath: function (path, activeModes) {
            activeModes = activeModes || {};
            if (!isInPagesDataPath.call(this, path)) {
                throw new Error(ERROR_MSG_FOR_ILLEGAL_PATH_TO_UPDATE);
            }
            if (_.isArray(path) && isInPagesDataPath(path)) {
                updateDisplayedJsonByPath.call(this, path, activeModes);
                return;
            }
            var valueInFullJson = _.get(this.fullJson, path);
            this.displayedJsonDAL.mergeByPath(path, valueInFullJson);
        },

        onModesChange: function (pointer, activeModes) {
            updateDisplayedJsonByPointer.call(this, pointer, activeModes);
        },

        updateDisplayedRoot: function (activeModes, fullPage) {
            var displayedDataAndStructure = getDisplayedJson(fullPage, activeModes, fullPage.structure.id);
            var rootId = fullPage.structure.id;
            var rootPointer = this.pointers.page.getPagePointer(rootId) || this.pointers.page.getNewPagePointer(rootId);
            var rootPath = this.fullCache.getPath(rootPointer);
            setStructureAndData.call(this, rootPointer, displayedDataAndStructure, rootPath);
            return displayedDataAndStructure;
        },

        createPageAnchors: function (pageStructure, forceMobileStructure) {
            var siteData = this.displayedJsonDAL.jsonData;
            var theme = siteData.getAllTheme();
            var viewMode = forceMobileStructure ? utils.constants.VIEW_MODES.MOBILE : siteData.getViewMode();
            var isMobileView = (viewMode === utils.constants.VIEW_MODES.MOBILE);
            if (pageStructure.id === utils.siteConstants.MASTER_PAGE_ID) {
                createMasterPageAnchors(siteData, pageStructure, theme, viewMode);
            } else {
                var rootAnchorsMap = utils.layoutAnchors.createPageAnchors(pageStructure, theme, isMobileView);
                _.set(siteData, ['anchorsMap', pageStructure.id, viewMode], rootAnchorsMap);
            }
        }
    };

    return DisplayedJsonUpdater;
});
