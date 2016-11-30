define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.RedirectFeature301Data', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy ;

    def.utilize(strategy.merge(['wysiwyg.editor.managers.Redirect301Manager']));

    def.methods({
        initialize:strategy.after(function(){
            this.Redirect301 = new this.imports.Redirect301Manager(this);
        }),

        _setMetaSiteData: function() {
            if (window.editorModel && window.editorModel.metaSiteData) {
                var metaSiteData = window.editorModel.metaSiteData;

                var dataItem = {
                    "type": 'SiteSettings',
                    "siteName": metaSiteData.siteName,
                    "siteTitleSEO": metaSiteData.title,
                    "thumbnail": metaSiteData.thumbnail,
                    "favicon": metaSiteData.favicon,
                    "allowSEFindSite": metaSiteData.indexable,
                    "suppressTrackingCookies": metaSiteData.suppressTrackingCookies,
                    "externalUriMappings": this._removePageNameFromExternalUrlMapping(metaSiteData.externalUriMappings)
                };

                if (metaSiteData.metaTags) {
                    var i;
                    for (i = 0; i < metaSiteData.metaTags.length; i++) {
                        var tag = metaSiteData.metaTags[i];
                        if (tag.name == "keywords") {
                            dataItem.keywordsSEO = tag.value;
                        }
                        else if (tag.name == "description") {
                            dataItem.siteDescriptionSEO = tag.value;
                        }
                        else if (tag.name == "fb_admins_meta_tag") {
                            dataItem.fbAdminsUserId = tag.value;
                        }
                    }
                }

                W.Data.addDataItem('SITE_SETTINGS', dataItem);
            }
            else {
                W.Data.addDataItem('SITE_SETTINGS', {type: 'SiteSettings'});
            }

            this._handleMultipleStructureOffering();
        },

        _removePageNameFromExternalUrlMapping:function(externalUriMappings){
            _.forEach(externalUriMappings, function(item) {
                item.toWixUri = item.toWixUri.substring(item.toWixUri.indexOf('/')+1, item.toWixUri.length);
            }.bind(this));

            return externalUriMappings;
        }
    });
});


