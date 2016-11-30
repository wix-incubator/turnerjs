define.experiment.Class('wysiwyg.editor.managers.serverfacade.ServerFacade.RedirectFeature301Data', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({

        _getMetaSiteDto: function() {
            //Meta site data
            var dataItem = W.Data.getDataByQuery('#SITE_SETTINGS');
            var dto = {};

            // Thumbnail
            if (this._isValidItem(dataItem.get("thumbnail"))) {
                dto.thumbnail = dataItem.get("thumbnail");
            }

            // Favicon
            if (this._isValidItem(dataItem.get("favicon"))) {
                dto.favicon = dataItem.get("favicon");
            }

            // Title
            this._addMetaSiteTitle(dataItem, dto);

            // Indexable
            if (this._isValidItem(dataItem.get("allowSEFindSite"))) {
                dto.indexable = dataItem.get("allowSEFindSite");
            }

            // Suppress Tracking Cookies (EU Laws)
            if (this._isValidItem(dataItem.get("suppressTrackingCookies"))) {
                dto.suppressTrackingCookies = dataItem.get("suppressTrackingCookies");
            }

            // FB Admin username
            if (this._isValidItem(dataItem.get("fbAdminsUserId"))) {
                dto.metaTags = dto.metaTags || [];
                dto.metaTags.push({"name": "fb_admins_meta_tag", "value": dataItem.get("fbAdminsUserId")});
            }

            // Keywords
            if (this._isValidItem(dataItem.get("keywordsSEO"))) {
                dto.metaTags = dto.metaTags || [];
                dto.metaTags.push({"name": "keywords", "value": dataItem.get("keywordsSEO")});
            }

            this._add301RedirectList(dataItem, dto);

            // Description
            this._addMetaSiteDescription(dataItem, dto);

            return dto;
        },

        _add301RedirectList:function(dataItem, dto){
            var externalUriMappings = dataItem.get("externalUriMappings");
            if (this._isValidItem(externalUriMappings)) {
                dto.externalUriMappings = dto.externalUriMappings || [];
                var oldUrl;
                var destinationUrl;
                _.forEach(externalUriMappings, function(item) {
                    oldUrl = item.fromExternalUri;
                    var pageData = W.Preview.getPreviewManagers().Viewer.getPageData(item.toWixUri);
                    if (pageData) {
                        var pageAddress = pageData.get('pageUriSEO');
                        destinationUrl = pageAddress + '/' + item.toWixUri;
                        dto.externalUriMappings.push({"fromExternalUri":oldUrl,"toWixUri":destinationUrl});
                    }

                }.bind(this));
            }
        }
    });
});
