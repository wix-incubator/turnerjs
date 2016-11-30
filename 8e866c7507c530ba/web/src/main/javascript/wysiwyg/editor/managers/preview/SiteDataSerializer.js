/** @class wysiwyg.editor.managers.preview.SiteDataSerializer */
define.Class('wysiwyg.editor.managers.preview.SiteDataSerializer', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_handleSingleSiteProperty']);

    /** @lends wysiwyg.editor.managers.preview.SiteDataSerializer */
    def.methods({
        serializeDataDelta: function (site) {
            return {
                document_data: this.serializeSiteData(site),
                theme_data: this._getSiteThemeData(site),
                component_properties: this._getSiteComponentProperties(site),
                detached_pages_to_update: this._getPagesThatHaveInterestOnDirtyComponents(site)
            };
        },

        _getPagesThatHaveInterestOnDirtyComponents: function(site) {
            var result = [] ;
            var dirtyData               = _.values(site.W.Data.getDirtyDataObjectsMap());
            var pagesFromDocData        = this._getPagesCompsFromDirtyComponentsWithInterest(dirtyData) ;

            var dirtyPropertyComponents = _.values(site.W.ComponentData.getDirtyDataObjectsMap());
            var pagesFromPropData       = this._getPagesCompsFromDirtyComponentsWithInterest(dirtyPropertyComponents) ;

            result = _.union(result, pagesFromDocData);
            result = _.union(result, pagesFromPropData);
            return result ;
        },

        _getPagesCompsFromDirtyComponentsWithInterest: function (dirtyComponents) {
            if(_.isEmpty(dirtyComponents)) {
                return null ;
            }
            var serializedPageCache     = {};

            var componentsWithInterest  = this._getCompsWithInterest(dirtyComponents);
            var pagesIds                = this._getPagesIdsFromComponents(componentsWithInterest);
            pagesIds                    = _.unique(pagesIds);

            var pagesIdsWithInterest    = this._getPagesIdsWithInterest(dirtyComponents);
            pagesIdsWithInterest        = _.difference(pagesIdsWithInterest, pagesIds) ;
            return _.compact(_.map(pagesIdsWithInterest, function (pageId) {
                return this._resolveSerializedUnloadedPages(pageId, serializedPageCache);
            }, this));
        },

        _getCompsWithInterest: function (dataObjects) {
            var componentsWithInterest = [];
            _.forOwn(dataObjects, function (dataItem) {
                if (dataItem && dataItem.componentsWithInterest) {
                    componentsWithInterest = _.union(componentsWithInterest, dataItem.componentsWithInterest);
                }
                return true ;
            });
            return componentsWithInterest;
        },

        _getPagesIdsFromComponents: function(componentsWithInterest) {
            return _.unique(_.compact(_.map(componentsWithInterest, function(comp) {
                return comp && comp.$view && comp.$view.$pageId ;
            }))) ;
        },

        _getPagesIdsWithInterest: function(dataObjects) {
            var pageIdsWithInterest = [];
            _.forOwn(dataObjects, function (dataItem) {
                if (dataItem && dataItem.pageIdsWithInterest) {
                    pageIdsWithInterest = _.union(pageIdsWithInterest, dataItem.pageIdsWithInterest);
                }
                return true ;
            });
            return _.unique(pageIdsWithInterest);
        },

        _resolveSerializedUnloadedPages: function(pageId, cache) {
            var result = cache && cache[pageId];
            if(!result) {
                var siteDataHandler = W.Preview.getPreviewManagers().Viewer.getSiteDataHandlerSync();
                result              = siteDataHandler.getSerializedPageById(pageId);
                if(cache) {
                    cache[pageId]   = result ;
                }
            }
            return result ;
        },

        /**
         *  Function: serializeSiteData
         *      parse a site's dirty objects for server update
         *
         *  Parameters:
         *      site - window object containing site's data.
         *
         *  Returns:
         *      a clone of data, replacing the member SITE_STRUCTURE with minimal document data..
         */
        serializeSiteData : function(site){
            var data = site.W.Data.getDirtyDataObjectsMap();
            return Object.map(data, this._handleSingleDataItem);
        },

        _handleSingleDataItem: function (item, key) {
            var text;
            var dataQueries;
            var getDataQueriesFromText = function(text) {
                var dataQueryExtractorRegEx = new RegExp('<a[^>]+dataquery=\"([^"]+)\"', 'igm');
                var tempMatch;
                var dataQueries = [];

                while (tempMatch = dataQueryExtractorRegEx.exec(text)) {
                    dataQueries.push(tempMatch[1]);
                }

                return dataQueries;
            };
            var filterRealDataItems = function(dataQueries) {
                var previewDataManager = W.Preview.getPreviewManagers().Data;
                var filteredDataQueries;
                var dataItem;

                filteredDataQueries =_.filter(dataQueries, function(dataRef){
                    dataItem = previewDataManager.getDataByQuery(dataRef);
                    return validateLinkDataItem(dataItem);
                }, this);

                return filteredDataQueries;
            };
            var validateLinkDataItem = function(dataItem) {
                return !!dataItem;
            };

            if(item.getType() === 'StyledText') {
                dataQueries = getDataQueriesFromText(item.get('text'));
                dataQueries = filterRealDataItems(dataQueries);

                item.setFields({
                    linkList: _.unique(dataQueries)
                });
            }

            if (item.getType() === 'Page') {
                var data = item.cloneData();
                delete data.pageSecurity.passwordDigest;
                return data;
            }

            if (key === 'SITE_STRUCTURE') {
                return {
                    'renderModifiers': item.getData().renderModifiers,
                    'siteName': item.getData().siteName,
                    'mainPage': item.getData().mainPage,
                    'mainPageId': item.getData().mainPageId || undefined,
                    'characterSets': item.getData().characterSets,
                    'usedFonts': item.getData().usedFonts,
                    'type': 'Document'
                };
            } else {
                return item.cloneData();
            }
        },

        _getSiteThemeData : function(site){
            if (!site.W.Theme.hasDirtyObjects()) {
                return {};
            }
            var themeDataObjectsMap = site.W.Theme.getDirtyDataObjectsMap();
            var themeDataMap = this.serializeThemeData(themeDataObjectsMap);
            return themeDataMap ? themeDataMap : {};
        },

        /**
         * THIS FUNCTION IS OBSOLETE!!! DON'T USE IT!!!
         */
        serializeThemeData: function(data) {
            var result = Object.map(data, function(item, key) {
                var d = Object.clone(item.getData());
                // TODO: implement a better copying method for the properties
                if (d.skin) {
                    d.skin = W.CompSerializer.unmigrateToOldName(d.skin);
                }
                delete(d.metaData);
                return d;
            }.bind(this));
            return result;
        },

        _getSiteComponentProperties : function(site){
            var propertiesObjectsMap = site.W.ComponentData.getDirtyDataObjectsMap();
            var propertiesMap = this.serializeSiteProperties(propertiesObjectsMap);
            return propertiesMap  ? propertiesMap  : {};
        },

        /**
         * remove all 'metaData' and 'id' from all properties in the object
         * @param data object - map of data items
         */
        serializeSiteProperties: function(data){
            return Object.map(data, this._handleSingleSiteProperty);
        },

        /**
         * Removes 'metaData' and 'id' from the object.
         * @param item object - properties object
         */
        _handleSingleSiteProperty : function(item){
            var filteredItemSchema = this._filterItemSchemaProperties(item);
            this._filterItemMetaData(filteredItemSchema);
            return filteredItemSchema;
        },

        _filterItemSchemaProperties: function(item) {
            return Object.filter(item.getData(), function(value, key){
                var isPropertiesSpecificMetaData = key !== 'metaData' || value.autoGenerated !== undefined;
                return isPropertiesSpecificMetaData && key !== 'id';
            });
        },

        //currently the only meta data that is in use in properties is "autoGenerated".
        _filterItemMetaData: function(filteredItem) {
            _.forEach(filteredItem, function(fieldValue, fieldName) {
                if (fieldName === 'metaData') {
                    filteredItem[fieldName] = Object.filter(fieldValue, function(value, key){
                        return key === 'autoGenerated';
                    });
                }
            });
        }
    });

});