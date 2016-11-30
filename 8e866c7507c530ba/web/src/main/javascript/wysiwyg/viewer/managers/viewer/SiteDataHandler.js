/** @class wysiwyg.viewer.managers.viewer.SiteDataHandler */
define.Class('wysiwyg.viewer.managers.viewer.SiteDataHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Data']);

    def.statics({
        PROPERTIES_OF_TYPE: {
            "wixapps.integration.components.AppPage": ['id', 'appPageId'],
            "wixapps.integration.components.AppPart2": ['id', 'appInnerID', 'appPartName']
        }
    });

    def.fields({
        _serializedStructureFromServer: null,
        _mobileSerializedStructureFromServer: null,
        _pageManager: null
    });

    /** @lends wysiwyg.viewer.managers.viewer.SiteDataHandler */
    def.methods({
        initialize: function (pageManager, localDataResolver) {
            this._pageManager = pageManager;
            this.updateServerData(localDataResolver);
        },

        /**
         * Update the server's serialized data using the given local data resolver.
         * @param {wysiwyg.viewer.managers.pages.data.LocalDataResolver} localDataResolver The local data resolver.
         */
        updateServerData: function (localDataResolver) {
            var serverStructure = localDataResolver.getSerializedStructureFromServer('DESKTOP');
            this._serializedStructureFromServer = _.clone(serverStructure.pages);
            this._serializedStructureFromServer.masterPage = serverStructure.masterPage;

            var mobileStructure = localDataResolver.getSerializedStructureFromServer('MOBILE');
            if(mobileStructure) {
                this._mobileSerializedStructureFromServer = _.clone(mobileStructure.pages);
                this._mobileSerializedStructureFromServer.masterPage = mobileStructure.masterPage;
            } else {
                this._mobileSerializedStructureFromServer = {};
            }
        },

        updateDeletedPage: function(pageDataQuery) {
            var pageToMarkAsDeleted =_.find(this._serializedStructureFromServer, function(serializedPage) {
                return serializedPage.dataQuery === '#' + pageDataQuery;
            });
            if (pageToMarkAsDeleted) {
                pageToMarkAsDeleted.isDeleted = true;
            }
        },

        /**
         * Get all desktop components of a certain type that are on a specific page
         * @param {String} compType the full component name
         * @param {String} pageId the page id.
         * @return {Array} the components id and dataQuery of that type that are on that page
         */
        getComponentOfTypeInPage: function (compType, pageId) {
            if (this._pageManager.isPageLoaded(pageId)) {
                // Get the components of this page from the page logic.
                var pageNode = this._pageManager.getPageNodes()[pageId];

                var pageComponents = pageNode.getLogic().getPageComponents();

                return _.filter(pageComponents, {className: compType})
                    .map(function (compLogic) {
                        // TODO: replace with json of the needed properties.
                        var componentDataItem = this.resources.W.Data.getDataByQuery(compLogic.$view.get('dataQuery'));
                        return this._convertToExternalData(compType, componentDataItem.getData(), pageId);
                    }, this);

            }
            else if (this._serializedStructureFromServer[pageId].isDeleted){
                return [];
            }
            else {
                // Get the components of this page from the server's data.
                return this._getServerComponentsOfTypeOnPage(compType, pageId);
            }
        },

        _getAllLoadedComponentsOfType: function (compType, viewerMode) {
            return _(W.Viewer.getSiteNode(viewerMode).getElements('[comp=' + compType + ']'))
                .filter(function(compNode){return !!compNode.$logic;})
                .map(function (compNode) {
                    // Gets the data of each pf the components
                    var dataQuery = compNode.get('dataQuery');
                    if (dataQuery) {
                        var data = this.resources.W.Data.getDataByQuery(dataQuery);
                        return data && this._convertToExternalData(compType, data.getData(), compNode.$pageId);
                    } else {
                        // The node element didn't wixified or has no dataQuery.
                        return null;
                    }
                }.bind(this))
                .compact()
                .value();
        },

        _getSerializedStructure: function (viewerMode) {
            return viewerMode === 'MOBILE' ? this._mobileSerializedStructureFromServer : this._serializedStructureFromServer;
        },

        /**
         * Get all desktop components of a certain type according to the current site state (merge of changes on loaded pages,
         * and server state of unloaded pages)
         * @param {String} compType the full component name
         * @param {'DESKTOP'|'MOBILE'} viewerMode the viewer mode.
         * @return {Array} the components id and dataQuery of that type from all site
         */
        getComponentsOfType: function (compType, viewerMode) {
            viewerMode = viewerMode || 'DESKTOP';
            var serializedStructure = this._getSerializedStructure(viewerMode);
            var notLoadedPageIds = _.difference(_.keys(serializedStructure), this._pageManager.getLoadedPageIds().concat('masterPage'));
            var result = _.reduce(notLoadedPageIds, function (result, pageId) {
                if (serializedStructure[pageId].isDeleted) {
                    return result;
                }
                if (pageId !== 'masterPage') {
                    var pageType = serializedStructure[pageId] && serializedStructure[pageId].componentType;
                    pageType = pageType || this._pageManager.getPageNodes()[pageId].$logic.$className;
                    if (pageType === compType) {
                        var dataQuery = serializedStructure[pageId].dataQuery;
                        var pageDataItem = this.resources.W.Data.getDataByQuery(dataQuery);
                        result.push(this._convertToExternalData(compType, pageDataItem.getData(), pageId));
                    }
                }

                return result.concat(this._getServerComponentsOfTypeOnPage(compType, pageId, viewerMode));
            }, [], this);

            return result.concat(this._getAllLoadedComponentsOfType(compType, viewerMode));
        },

        /**
         * get all components of a certain type (class name) that appear on a certain page on the server structure
         * @param compType the class name of the looked for components
         * @param pageId the id of the page in which to look for the components
         * @param {'DESKTOP'|'MOBILE'} viewerMode the viewer mode
         * @returns {Array} component definition of components with compType that appear on the page with pageId
         * @private
         */
        _getServerComponentsOfTypeOnPage: function (compType, pageId, viewerMode) {
            var serializedStructure = this._getSerializedStructure(viewerMode);
            return this._getChildrenComponentsOfType(compType, serializedStructure[pageId]);
        },

        /**
         * goes over a page structure recursively and find all components of a certain type (class name)
         * @param {String} compType class name of the looked for component
         * @param parent the parent component to look inside
         * @returns {Array} Data of all of parent's child components of type compType.
         * @private
         */
        _getChildrenComponentsOfType: function (compType, parent) {
            var children = parent.components || parent.children;
            return _.reduce(children, function (result, child) {
                if (child.componentType === compType) {
                    var componentDataItem = this.resources.W.Data.getDataByQuery(child.dataQuery);
                    result.push(this._convertToExternalData(compType, componentDataItem.getData(), parent.id));
                }

                return result.concat(this._getChildrenComponentsOfType(compType, child));
            }, [], this);
        },

        _convertToExternalData: function (compType, source, parentId) {
            var propertiesOfType = this.PROPERTIES_OF_TYPE[compType];
            if (propertiesOfType) {
                return _.pick(source, propertiesOfType);
            }

            source.pageId = parentId;

            return source;
        },

        getSerializedPageById: function(pageId) {
            var desktopStructure = null, mobileStructure = null;
            if(pageId !== 'master') {
                desktopStructure    = this._serializedStructureFromServer[pageId] ;
                mobileStructure     = this._mobileSerializedStructureFromServer[pageId] ;
            } else if(pageId === 'master') {
                desktopStructure    = this._serializedStructureFromServer.masterPage ;
                mobileStructure     = this._mobileSerializedStructureFromServer.masterPage ;
            }
            if(desktopStructure && mobileStructure) {
                desktopStructure.mobileComponents = mobileStructure.components;
            }
            return desktopStructure ;
        }
    });
});
