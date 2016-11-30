define.Class("wysiwyg.editor.managers.background.BackgroundVersionHandler", function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        /**
         * C'tor
         * @param resources resources including managers s.a. Commands, Data, Preview, etc...
         * @param upgradeFunctions a mapping of versions to the functions to apply when upgrading.
         */
        initialize: function(resources, upgradeFunctions) {
            this.resources  = resources ;
            this._upgraders = upgradeFunctions ;

            this._upgradersVersions = this._getSortedUpgradersVersions() ;
            this.resources.W.Commands.registerCommandAndListener("EditorCommands.SiteLoaded", this, this._onSiteLoaded);
        },

        _getSortedUpgradersVersions: function() {
            var versions = _.keys(this._upgraders) ;
            return _.sortBy(versions) ;
        },

        _onSiteLoaded: function() {
            var pagesIds                    = this._getPagesIds();
            var upgradeVersionTarget        = Constants.Background.BGPP_LATEST_VERSION;
            var pagesIdsToUpgradeBackground = this._getPagesIdsToUpgradeBackground(pagesIds, upgradeVersionTarget);
            var shouldUpgrade = !_.isEmpty(pagesIdsToUpgradeBackground);
            if(shouldUpgrade) {
                this._upgradeBackgroundPerPageData(pagesIdsToUpgradeBackground, upgradeVersionTarget);
            }
        },

        _getPagesIdsToUpgradeBackground: function(pagesIds, upgradeToVersion) {
            if(!pagesIds || !upgradeToVersion) {
                return null ;
            }
            var pagesVersions   = {};
            for(var i=0; i < pagesIds.length; i++) {
                var pageId              = pagesIds[i];
                var pageDataItem        = this._getPageDataItem(pageId);
                var pageBackgrounds     = pageDataItem.get("pageBackgrounds");
                var pageVersion         = this._getPageBackgroundsVersion(pageBackgrounds, upgradeToVersion);
                var shouldPageUpgrade   = pageVersion < upgradeToVersion ;
                if(shouldPageUpgrade) {
                    var pagesToUpgradeFromVersion = pagesVersions[pageVersion] ;
                    if(!pagesToUpgradeFromVersion) {
                        pagesToUpgradeFromVersion = [] ;
                        pagesVersions[pageVersion] = pagesToUpgradeFromVersion ;
                    }
                    pagesToUpgradeFromVersion.push(pageId);
                }
            }
            return pagesVersions;
        },

        _getPagesIds: function () {
            return _.keys(this.resources.W.Preview.getPreviewManagers().Viewer.getPagesData());
        },

        _getPageDataItem: function(pageId) {
            if(!pageId) {
                return null ;
            }
            pageId = this._getPreviewDataManager().normalizeQueryID(pageId) ;
            return this._getPreviewDataManager().getDataByQuery(pageId) ;
        },

        _getPageBackgroundsVersion: function(pageBackgrounds, upgradeToVersion) {
            var pageVersion = upgradeToVersion;
            if(pageBackgrounds) {
                var previewDataManager = this._getPreviewDataManager();
                for(var device in pageBackgrounds) {
                    if(pageBackgrounds.hasOwnProperty(device)) {
                        var customBGQueryId = pageBackgrounds[device].ref;
                        if(customBGQueryId && previewDataManager.getDataByQuery(customBGQueryId)) {
                            var customBG    = previewDataManager.getDataByQuery(customBGQueryId);
                            if(Number(pageVersion) > Number(customBG.getMeta("schemaVersion"))) {
                                pageVersion = customBG.getMeta("schemaVersion") ;
                            }
                        }
                    }
                }
            }
            return pageVersion;
        },

        _upgradeBackgroundPerPageData: function (versionToPagesIds, targetVersion) {
            if(_.isEmpty(versionToPagesIds) || isNaN(Number(targetVersion))) {
                return ;
            }
            for(var version in versionToPagesIds) {
                if(Number(version) < Number(targetVersion)) {
                    var pageIds                 = versionToPagesIds[version] ;
                    var startFromUpgradeVersion = this._upgradersVersions.indexOf(version) ;
                    if(!_.isEmpty(pageIds) && startFromUpgradeVersion >= 0) {
                        for(; startFromUpgradeVersion < this._upgradersVersions.length; startFromUpgradeVersion++) {
                            var upgraderVersion = this._upgradersVersions[startFromUpgradeVersion];
                            if(Number(upgraderVersion) < Number(targetVersion)) {
                                var upgrader = this._upgraders[upgraderVersion] ;
                                upgrader.apply(this, [pageIds, Constants.ViewerTypesParams.TYPES.DESKTOP]) ;
                                upgrader.apply(this, [pageIds, Constants.ViewerTypesParams.TYPES.MOBILE]) ;
                            } else {
                                break ;
                            }
                        }
                        this._upgradeSchemaVersionForBackgrounds(pageIds, targetVersion) ;
                    }
                }
            }
        },

        _upgradeSchemaVersionForBackgrounds: function(pageIdsWithCustomBGs, versionToSet) {
            for(var i=0; i < pageIdsWithCustomBGs.length; i++) {
                var pageDataItem = this._getPageDataItem(pageIdsWithCustomBGs[i]) ;
                if(pageDataItem) {
                    var pageBackgrounds = pageDataItem.get("pageBackgrounds") ;
                    this._setMetaVersionForAllPageBGs(pageBackgrounds, versionToSet);
                }
            }
        },

        _setMetaVersionForAllPageBGs: function (pageBackgrounds, versionToSet) {
            if(pageBackgrounds) {
                for (var device in pageBackgrounds) {
                    if (pageBackgrounds.hasOwnProperty(device)) {
                        var customBGQueryId = pageBackgrounds[device].ref;
                        this._setMetaVersionToDataItem(customBGQueryId, versionToSet);
                    }
                }
            }
        },

        _setMetaVersionToDataItem: function(dataItemId, versionToSet) {
            if(dataItemId) {
                var dataItem = this._getPreviewDataManager().getDataByQuery(dataItemId) ;
                if (dataItem) {
                    dataItem.setMeta("schemaVersion", versionToSet, false);
                    dataItem.markDataAsDirty();
                }
            }
        },

        _getPreviewDataManager: function () {
            return this.resources.W.Preview.getPreviewManagers().Data;
        }
    }) ;
}) ;