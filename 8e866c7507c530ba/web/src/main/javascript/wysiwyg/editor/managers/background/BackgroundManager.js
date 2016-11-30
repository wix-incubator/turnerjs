define.Class("wysiwyg.editor.managers.background.BackgroundManager", function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits("bootstrap.managers.BaseManager") ;

    def.binds(["_getPageDataItem", "_enableCustomBG"]) ;

    def.utilize(['core.utils.css.Background', 'core.utils.BackgroundHelper',
                 'wysiwyg.editor.managers.background.BackgroundVersionHandler']) ;

    def.resources(['W.Commands', 'W.Data', 'W.Preview', 'W.Config', 'W.Editor']) ;

    def.statics({
        IS_ONLY_CUSTOM_BG_SUPPORTED: true,
        THEME_MANAGER_MOBILE_BG_PROPERTY : 'mobileBg',
        THEME_MANAGER_DESKTOP_BG_PROPERTY : 'siteBg'
    }) ;

    def.methods({
        initialize: function() {
            this._previewThemeManager   = null;
            this._backgroundHelper      = new this.imports.BackgroundHelper();

            var cmdMgr = this.resources.W.Commands;
            cmdMgr.registerCommandAndListener('WEditorCommands.BeforeSave', this, this._handleCustomBGSaveToCrossSiteAsFallback);
            cmdMgr.registerCommandAndListener('WEditCommands.AfterDuplicatePage', this, this._handleDuplicatedPage) ;
            cmdMgr.registerCommandAndListener('WEditorCommands.AddPageCompleted', this, this._handleAddingNewPage) ;

            var upgraders = {"1.0": this._setThemeBackgroundOnPagesOnDevice.bind(this)};
            new this.imports.BackgroundVersionHandler(this.resources, upgraders) ;
        },

        _handleCustomBGSaveToCrossSiteAsFallback: function() {
            this._handlePagesWithoutCustomBG() ;

            var homePageId = this._getHomePageId() ;
            var homepageDesktopBG   = this.getBackgroundOnPageAndDevice(homePageId, Constants.ViewerTypesParams.TYPES.DESKTOP) ;
            var homepageMobileBG    = this.getBackgroundOnPageAndDevice(homePageId, Constants.ViewerTypesParams.TYPES.MOBILE) ;

            var param = {};
            param[this.THEME_MANAGER_DESKTOP_BG_PROPERTY]   = homepageDesktopBG;
            param[this.THEME_MANAGER_MOBILE_BG_PROPERTY]    = homepageMobileBG;
            this._getPreviewManagers().Theme.getDataItem().setFields(param, null);
        },

        _handlePagesWithoutCustomBG: function() {
            this._handlePagesWithoutCustomBGOnDevice(Constants.ViewerTypesParams.TYPES.DESKTOP) ;
            this._handlePagesWithoutCustomBGOnDevice(Constants.ViewerTypesParams.TYPES.MOBILE) ;
        },

        _handlePagesWithoutCustomBGOnDevice: function(device) {
            var pagesIdsWithoutCustomBG = this._getPagesIdsWithoutCustomBGInDevice(device) ;
            this._setThemeBackgroundOnPagesOnDevice(pagesIdsWithoutCustomBG, device) ;
        },

        _getPagesIdsWithoutCustomBGInDevice: function(device) {
            var result = [] ;
            if(device) {
                device = device.toLowerCase() ;
                var pages = this._getPreviewManagers().Viewer.getPagesData() ;
                _.forOwn(pages, function(page) {
                    var pagesBackgrounds  = page.get("pageBackgrounds");
                    var isPageBGDataExist = (pagesBackgrounds && pagesBackgrounds[device] && pagesBackgrounds[device].ref);
                    if(!isPageBGDataExist) {
                        result.push(page.get("id")) ;
                    }
                });
            }
            return result ;
        },

        _setThemeBackgroundOnPagesOnDevice: function(pagesIds, device) {
            if(pagesIds.length > 0) {
                var backgroundToKeep = this.getCrossSiteBGByDevice(device) ;
                if(backgroundToKeep) {
                    backgroundToKeep = backgroundToKeep.toString() ;
                    this._setCustomBackgroundToPagesOnDevice(pagesIds, device, backgroundToKeep) ;
                }
            }
        },

        _setCustomBackgroundToPagesOnDevice: function(pagesIds, device, backgroundToSet) {
            for(var i=0; i < pagesIds.length; i++) {
                this.setCustomBGOnDevicePage(pagesIds[i], device, backgroundToSet, true) ;
            }
        },

        _handlePagesBGsOnPublishTemplate: function() {
            var pages = _.toArray(this._getPreviewManagers().Viewer.getPagesData()) ;
            for(var i=0; i < pages.length; i++) {
                var pageDataItem    = pages[i];
                var pageId          = pageDataItem.get("id") ;
                var pageBackgrounds = this._getPageCustomBackgrounds(pageId) ;
                var shouldSetPageBackgrounds = false ;
                if(!pageBackgrounds) {
                    pageBackgrounds = this._createPageBackgrounds();
                    shouldSetPageBackgrounds = true ;
                } else {
                    for(var deviceName in pageBackgrounds) {
                        if(!pageBackgrounds[deviceName].isPreset) {
                            pageBackgrounds[deviceName].isPreset = true ;
                            shouldSetPageBackgrounds = true ;
                        }
                    }
                }
                if(shouldSetPageBackgrounds) {
                    this._setPageBackgrounds(pageDataItem, pageBackgrounds) ;
                }
            }
        },

        _getHomePageId: function () {
            var previewData = this._getPreviewDataManager() ;
            return previewData.getDataByQuery("#SITE_STRUCTURE").get("mainPage") ;
        },

        _handleAddingNewPage: function(commandParam) {
            if(commandParam && commandParam.page) {
                var addedPageDataItem       = commandParam.page.getDataItem();
                var duplicatedPageId        = commandParam.previousPageId ;
                var addedPageId             = addedPageDataItem.get("id");
                var duplicatedBackgrounds   = this._duplicatePageBackgroundsByPageId(addedPageId, duplicatedPageId) ;

                addedPageDataItem.set("pageBackgrounds", duplicatedBackgrounds) ;
            }
        },

        _handleDuplicatedPage: function(commandParam) {
            if(commandParam && commandParam.newPageId) {
                var originalPageId          = commandParam.oldPageId ;
                var newPageId               = commandParam.newPageId ;
                var duplicatedBackgrounds   = this._duplicatePageBackgroundsByPageId(newPageId, originalPageId);

                newPageId                   = this._getPreviewDataManager().normalizeQueryID(newPageId);
                var newPageDataItem         = this._getPreviewDataManager().getDataByQuery(newPageId) ;
                newPageDataItem.set("pageBackgrounds", duplicatedBackgrounds);
            }
        },

        _duplicatePageBackgroundsByPageId: function(pageId, duplicatedPageId) {
            var pageBackgroundsToDuplicate = this._getPageCustomBackgrounds(duplicatedPageId) ;
            return this._duplicatePageBackgrounds(pageId, pageBackgroundsToDuplicate) ;
        },

        _duplicatePageBackgrounds: function(pageIdWithInterest, pageBackgrounds) {
            var isCloneNeeded = this._isBGPPCloneNeeded(pageBackgrounds);
            if(isCloneNeeded) {
                var duplicatedPageBackgrounds   = this._createPageBackgrounds() ;
                for(var device in pageBackgrounds) {
                    var customBg                = this._getCustomBgOnDevice(pageBackgrounds, device) ;
                    if(customBg) {
                        var bgCloneData         = customBg.cloneData() ;
                        var duplicatedCustomBg  = this._createCustomBgDataItem(pageIdWithInterest) ;
                        duplicatedCustomBg      = duplicatedCustomBg.dataObject ;
                        var duplicatedBgId      = duplicatedCustomBg.get("id") ;
                        bgCloneData.id          = duplicatedBgId ;
                        duplicatedCustomBg.setData(bgCloneData) ;

                        duplicatedPageBackgrounds[device].ref = this.resources.W.Data.normalizeQueryID(duplicatedBgId) ;
                    }
                    duplicatedPageBackgrounds[device].custom    = pageBackgrounds[device].custom ;
                    duplicatedPageBackgrounds[device].isPreset  = pageBackgrounds[device].isPreset ;
                }
                return duplicatedPageBackgrounds ;
            } else {
                return pageBackgrounds ;
            }
        },

        _getCustomBgOnDevice: function(pageBackgrounds, device) {
            var pageBGInDevice      = pageBackgrounds[device] ;
            var customBGReference   = pageBGInDevice.ref ;
            if(customBGReference) {
                return this._getPreviewDataManager().getDataByQuery(customBGReference) ;
            }
            return null ;
        },

        _isBGPPCloneNeeded: function (pageBackgrounds) {
            var isCloneNeeded = false ;
            for (var device in pageBackgrounds) {
                if (!!pageBackgrounds[device].ref) {
                    isCloneNeeded = true;
                    break;
                }
            }
            return isCloneNeeded ;
        },

        isCurrentPageCustomBgEnabled: function(device) {
            var pageId = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            return this.isPageCustomBGEnabled(pageId, device) ;
        },

        isPageCustomBGEnabled: function(pageId, device) {
            var result = false ;
            device = device.toLowerCase() ;
            var customBackground = this.getCustomBGForPageOnDevice(pageId, device) ;
            if(customBackground) {
                result = customBackground.custom ;
            }
            result = !!result ;
            if(this._isOnlyCustomBGSupported() && this._shouldForceBGToCustom(result)) {
                this._forcePageDataItemToHaveCustomBG(pageId) ;
                result = true ;
            }
            return result ;
        },

        _shouldForceBGToCustom: function(isBGCustom) {
            return isBGCustom === false;
        },

        _forcePageDataItemToHaveCustomBG: function(pageId) {
            var pageDataItem = this._getPageDataItem(pageId) ;
            if(pageDataItem) {
                var pageCustomBGs   = this._getPageCustomBackgrounds(pageId) ;
                var isCustomFlagSet = false ;
                if(!pageCustomBGs) {
                    pageCustomBGs   = this._createPageBackgrounds() ;
                    isCustomFlagSet = true ;
                }
                for(var device in pageCustomBGs) {
                    var deviceProperties = pageCustomBGs[device] ;
                    if(!deviceProperties.custom) {
                        deviceProperties.custom = true ;
                        isCustomFlagSet = true ;
                    }
                }
                if(isCustomFlagSet) {
                    this._setPageBackgrounds(pageDataItem, pageCustomBGs) ;
                }
            }
        },

        setPresetOnPageDevice: function(pageId, device, isPreset) {
            if(pageId && device && isPreset) {
                var pageBackgrounds = this._getOrCreatePageCustomBackgrounds(pageId) ;
                device = device.toLowerCase() ;
                pageBackgrounds[device].isPreset = isPreset ;

                var pageDataItem = this._getPageDataItem(pageId) ;
                this._setPageBackgrounds(pageDataItem, pageBackgrounds, true);
            }
        },

        enableCustomBG: function(pageId, device, isUndoRedoAction) {
            if(pageId && device) {
                var currentStatusOfCustomBgOnPage = this.isPageCustomBGEnabled(pageId, device) ;
                if(currentStatusOfCustomBgOnPage === false) {
                    this._enableCustomBG(true, pageId, device, isUndoRedoAction) ;
                }
            }
        },

        disableCustomBG: function(pageId, device, isUndoRedoAction) {
            if(pageId && device) {
                var currentStatusOfCustomBgOnPage = this.isPageCustomBGEnabled(pageId, device) ;
                if(currentStatusOfCustomBgOnPage === true) {
                    this._enableCustomBG(false, pageId, device, isUndoRedoAction) ;
                }
            }
        },

        _enableCustomBG: function(isEnabled, pageId, device, isUndoRedoAction) {
            isEnabled = !!isEnabled ;
            if(device && pageId) {
                var customBGs       = this._getOrCreatePageCustomBackgrounds(pageId) ;
                var customBG        = customBGs[device.toLowerCase()];
                if(customBG.custom !== isEnabled) {
                    customBG.custom     = isEnabled ;
                    var pageDataItem    = this._getPageDataItem(pageId) ;
                    this._setPageBackgrounds(pageDataItem, customBGs, true) ;
                    this._fireCustomBGEnablementChange(isUndoRedoAction, isEnabled, pageId, device);
                }
            }
        },

        _fireCustomBGEnablementChange: function (isUndoRedoAction, isEnabled, pageId, device) {
            var commandParam = null;
            if (!isUndoRedoAction) {
                commandParam = {'isCustom': isEnabled, 'pageId': pageId, 'device': device};
            }
            this._getPreviewManagers().Commands.executeCommand('WPreviewCommands.CustomBackgroundChanged', commandParam);
        },

        getCurrentlyShowingBackground: function() {
            var pageId = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            var device = this.resources.W.Config.env.$viewingDevice.toLowerCase();
            return this.getBackgroundOnPageAndDevice(pageId, device) ;
        },

        getBackgroundOnPageAndDevice: function(pageId, device) {
            var background              = null;
            device                      = device.toLowerCase() ;
            var isPageCustomBGEnabled   = this.isPageCustomBGEnabled(pageId, device);
            if(isPageCustomBGEnabled) {
                background = this._getPageCustomBgOnDeviceAsCss(pageId, device) ;
            } else {
                background = this.getCrossSiteBGByDevice(device) ;
            }
            return background;
        },

        _isCustomBGPreset: function(pageId, device) {
            device = device.toLowerCase();
            var pageBackgrounds = this._getOrCreatePageCustomBackgrounds(pageId) ;
            return pageBackgrounds[device].isPreset ;
        },

        setCustomBGOnDevicePageAndUpdateUI: function(pageId, device, bgCssValue, isUndoRedoAction, sender) {
            if(pageId && device && bgCssValue) {
                device                  = device.toLowerCase() ;
                var pageBackgounds      = this._getOrCreatePageCustomBackgrounds(pageId) ;
                var oldCustomValue      = pageBackgounds[device].custom;
                var oldPresetValue      = pageBackgounds[device].isPreset;
                var oldCustomBgValue    = this._getPageCustomBgOnDeviceAsCss(pageId, device);
                this.setCustomBGOnDevicePage(pageId, device, bgCssValue);
                this._setCustomBGOnSecondaryDeviceIfPreset(pageId, device, bgCssValue);
                var undoRedoChangeData = null ;
                if(!isUndoRedoAction) {
                    undoRedoChangeData = {oldValue: oldCustomBgValue, newValue: bgCssValue, isPreset: oldPresetValue,
                                          isCustom: oldCustomValue, pageId: pageId, 'device': device, 'sender': sender};
                }
                this.fireCustomBackgroundChanged(undoRedoChangeData, isUndoRedoAction);
            }
        },

        setCustomBGOnDevicePage: function (pageId, device, bgCssValue, isKeepPreset) {
            var pageDataItem = this._getPageDataItem(pageId);
            if (pageDataItem && device) {
                device = device.toLowerCase();
                var pageCustomBGs       = this._getOrCreatePageCustomBackgrounds(pageId);
                var customBackground    = this._getCustomBackgroundRef(pageCustomBGs, device, pageId);
                var bgDataItem          = this._getPreviewDataManager().getDataByQuery(customBackground);
                if (bgDataItem) {
                    if(bgCssValue) {
                        this._setBackgroundCSSToDataItem(bgCssValue, bgDataItem);
                        this._addPageAsComponentWithInterestToDataItem(pageId, bgDataItem) ;
                        pageCustomBGs[device].ref = customBackground;
                        if(!isKeepPreset) {
                            pageCustomBGs[device].isPreset = false ;
                        }
                    } else {
                        pageCustomBGs[device].ref = null ;
                    }
                    this._setPageBackgrounds(pageDataItem, pageCustomBGs, true);
                    this._setCustomBGOnSecondaryDeviceIfPreset(pageId, device, bgCssValue) ;
                }
            }
        },

        _setCustomBGOnSecondaryDeviceIfPreset: function(pageId, device, bgCssValue) {
            if(pageId && this._isDesktopViewer(device) && this._isMobileViewerPresetOnPage(pageId)) {
                this.setCustomBGOnDevicePage(pageId, Constants.ViewerTypesParams.TYPES.MOBILE, bgCssValue, true);
            }
        },

        _isDesktopViewer: function(device) {
            return device && Constants.ViewerTypesParams.TYPES.DESKTOP.toLowerCase() === device.toLowerCase();
        },

        _isMobileViewerPresetOnPage: function(pageId) {
            return this._isCustomBGPreset(pageId, Constants.ViewerTypesParams.TYPES.MOBILE) ;
        },

        _getPageCustomBgOnDeviceAsCss: function(pageId, device) {
            if(pageId && device) {
                var customBgDataItem    = this.getOrCreateCustomBg(pageId, device) ;
                var background          = this._backgroundHelper.createBgCssValueFromDataItem(customBgDataItem.getData());
                return background ;
            } else {
                return "" ;
            }
        },

        getCustomBGForPageOnDevice: function(pageId, device) {
            var deviceCustomBG = null ;
            if(pageId && device) {
                device             = device.toLowerCase() ;
                var pageDataItem   = this._getPageDataItem(pageId) ;
                if(pageDataItem) {
                    deviceCustomBG = this._getDeviceCustomBG(pageDataItem, device) ;
                }
            }
            return deviceCustomBG ;
        },

        fireCustomBackgroundChanged: function(backgroundData, isUndoRedoAction) {
            this._getPreviewManagers().Commands.executeCommand('WPreviewCommands.CustomBackgroundChanged', {isFromUndoRedo: isUndoRedoAction}) ;
            if(!isUndoRedoAction) {
                this.resources.W.Commands.executeCommand("WEditorCommands.SetCustomBackground", backgroundData) ;
            }
        },

        getOrCreateCustomBg: function(pageId, device) {
            var pageCustomBgs       = this._getPageCustomBackgrounds(pageId) ;
            if(!pageCustomBgs) {
                var pageDataItem    = this._getPageDataItem(pageId) ;
                pageCustomBgs       = this._createPageBackgrounds() ;
                this._setPageBackgrounds(pageDataItem, pageCustomBgs) ;
            }
            var dataItemRef         = this._getCustomBackgroundRef(pageCustomBgs, device, pageId) ;
            return this._getPreviewDataManager().getDataByQuery(dataItemRef) ;
        },

        _getCustomBackgroundRef: function(pageCustomBGs, device, pageId) {
            var result = null ;
            device = device.toLowerCase() ;
            var deviceCustomBG = pageCustomBGs && pageCustomBGs[device] ;
            if(deviceCustomBG) {
                var ref = deviceCustomBG.ref ;
                if(!ref) {
                    var dataItemWithId = this._createCustomBgDataItem(pageId);
                    var dataItemId = dataItemWithId.id;
                    // initialize the custom BG if not yet existent to default to the CROSS BG.
                    var crossSiteBgCssValue = this.getCrossSiteBGByDevice(device).toString() ;
                    this._setBackgroundCSSToDataItem(crossSiteBgCssValue, dataItemWithId.dataObject) ;
                    // set the reference to the customBg.
                    deviceCustomBG.ref = this.resources.W.Data.normalizeQueryID(dataItemId) ;
                    ref = deviceCustomBG.ref ;
                }
                result = ref ;
            }
            return result ;
        },

        _createCustomBgDataItem: function (pageId) {
            var CUSTOM_BG_PREFIX = "customBgImg";
            var customBgDataItem = {type: 'BackgroundImage'};
            var dataItemWithId = this._getPreviewDataManager().addDataItemWithUniqueId(CUSTOM_BG_PREFIX, customBgDataItem);
            this._addPageAsComponentWithInterestToDataItem(pageId, dataItemWithId.dataObject);
            dataItemWithId.dataObject.setMeta("schemaVersion", Constants.Background.BGPP_LATEST_VERSION) ;
            return dataItemWithId ;
        },

        _addPageAsComponentWithInterestToDataItem: function (pageId, dataItem) {
            if (dataItem && pageId) {
                dataItem.addPageIdWithInterest(pageId);
            }
        },

        _setBackgroundCSSToDataItem: function (bgCssValue, bgDataItem) {
            var background = new this.imports.Background(bgCssValue, this._getPreviewThemeManager());
            bgDataItem.set("url", background.getImageId());
            var imageSize = background.getImageSize() ;
            imageSize = imageSize && imageSize.length > 1 ? imageSize : [0, 0] ;
            bgDataItem.set("imagesizew", parseInt(imageSize[0]));
            bgDataItem.set("imagesizeh", parseInt(imageSize[1]));
            bgDataItem.set("positionx", background.getPositionX());
            bgDataItem.set("positiony", background.getPositionY());
            bgDataItem.set("width", background.getWidth());
            var repeatX = this.normalizeRepeatValueToDataItem(background.getRepeatX());
            var repeatY = this.normalizeRepeatValueToDataItem(background.getRepeatY());
            bgDataItem.set("repeatx", repeatX);
            bgDataItem.set("repeaty", repeatY);
            bgDataItem.set("attachment", background.getAttachment());
            bgDataItem.set("color", background.getColorThemeValue());
        },

        normalizeRepeatValueToDataItem: function(repeatValue) {
            return this._backgroundHelper.normalizeRepeatValueToDataItem(repeatValue) ;
        },

        _getDeviceCustomBG: function (pageDataItem, device) {
            var pageCustomBGs = this._getPageCustomBackgrounds(pageDataItem.get('id')) ;
            if(pageCustomBGs) {
                return pageCustomBGs[device] ;
            } else {
                return null ;
            }
        },

        _getOrCreatePageCustomBackgrounds: function(pageId) {
            var pageBackgrounds = this._getPageCustomBackgrounds(pageId) ;
            if(!pageBackgrounds) {
                pageBackgrounds = this._createPageBackgrounds() ;
            }
            return pageBackgrounds ;
        },

        _getPageCustomBackgrounds: function(pageId) {
            if(pageId) {
                var pageDataItem = this._getPageDataItem(pageId) ;
                if(pageDataItem) {
                    return pageDataItem.get("pageBackgrounds") ;
                }
            }
            return null ;
        },

        _createPageBackgrounds: function() {
            var customValue     = this._isOnlyCustomBGSupported();
            var isMobilePreset  = true ;
            return {
                "desktop":  {"custom": customValue, "ref": undefined, isPreset: false},
                "mobile":   {"custom": customValue, "ref": undefined, isPreset: isMobilePreset}
            } ;
        },

        _setPageBackgrounds: function(pageDataItem, pageBackgrounds, dontFireChangeEvent) {
            if(pageDataItem && pageBackgrounds) {
                pageDataItem.set("pageBackgrounds", pageBackgrounds, dontFireChangeEvent) ;
                if(dontFireChangeEvent) {
                    pageDataItem.markDataAsDirty() ;
                }
            }
        },

        _getPageDataItem: function(pageId) {
            if(!pageId) {
                return null ;
            }
            pageId = this.resources.W.Data.normalizeQueryID(pageId) ;
            return this._getPreviewDataManager().getDataByQuery(pageId) ;
        },

        getCrossSiteBGByDevice: function(device) {
            var result = null ;
            if(device) {
                if(device.toUpperCase() === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                    result = this._getPreviewThemeManager().getProperty(this.THEME_MANAGER_DESKTOP_BG_PROPERTY) ;
                } else if(device.toUpperCase() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                    result = this._getPreviewThemeManager().getProperty(this.THEME_MANAGER_MOBILE_BG_PROPERTY) ;
                }
            }
            return result ;
        },

        _getPreviewThemeManager: function() {
            if(this._previewThemeManager === null) {
                this._previewThemeManager = this._getPreviewManagers().Theme ;
            }
            return this._previewThemeManager ;
        },

        _getPreviewDataManager: function () {
            return this._getPreviewManagers().Data;
        },

        _getPreviewManagers: function() {
            return this.resources.W.Preview.getPreviewManagers() ;
        },

        _isOnlyCustomBGSupported: function() {
            return this.IS_ONLY_CUSTOM_BG_SUPPORTED ;
        }
    }) ;
}) ;