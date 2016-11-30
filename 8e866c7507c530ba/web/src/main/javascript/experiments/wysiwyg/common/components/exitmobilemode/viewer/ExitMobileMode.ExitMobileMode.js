define.experiment.newComponent('wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode.ExitMobileMode', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SiteButton');

    def.traits(["wysiwyg.viewer.components.traits.CustomPreviewBehavior"]);

    def.resources(['W.Viewer', 'W.Commands']);

    def.propertiesSchemaType('ButtonProperties');

    def.skinParts( {
        label:{type:'htmlElement'},
        link:{type:'htmlElement'}
    });

    def.binds(['_onSiteReady', '_renderOnSiteReady']);

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            mobile:{
                custom:[
                ],
                isTextScalable: true,
                forceRemoveIconOnHide: true,
                disablePropertySplit: true,
                dontOpenPanelOnDelete: true
            }
        }
    });

    def.helpIds({
        componentPanel: '/node/769'
    });

    def.methods({

        _onClick: function (e) {
            if(this.isEnabled()) {
                if (W.Config.env.$isPublicViewerFrame) {
                    this._exitMobileMode();
                }
            }

            return this._cancelEvent(e);
        },

        _onRender: function () {
            this.parent();
            this._createClickOverlayForPreviewMode("MOBILE_EXIT_MOBILE_BUTTON_PREVIEW_CLICK_OVERLAY_ttid");

            // TODO: remove this ugly event dependent HACK someday (!)
            var viewer = this.resources.W.Viewer;
            if(viewer.isSiteReady()) {
                this._renderOnSiteReady();
            } else {
                viewer.getSiteView(Constants.ViewerTypesParams.TYPES.MOBILE).addEvent('SiteReady', this._renderOnSiteReady);
            }
        },

        _renderOnSiteReady: function(){
            var viewer = this.resources.W.Viewer;
            viewer.getSiteView(Constants.ViewerTypesParams.TYPES.MOBILE).removeEvent('SiteReady', this._renderOnSiteReady);
            setTimeout(function(){
                this._skinParts.link.style.opacity = 1;
            }.bind(this), 1000);
        },

        _exitMobileMode: function(){
            var viewer = this.resources.W.Viewer;
            viewer.getSiteNode().$logic.collapse();
            if(W.Config.env.$viewingDevice !== Constants.ViewerTypesParams.TYPES.DESKTOP){
                viewer.initiateSite(Constants.ViewerTypesParams.TYPES.DESKTOP);
                viewer.getSiteView(Constants.ViewerTypesParams.TYPES.DESKTOP).addEvent('SiteReady', this._onSiteReady);
            }
        },

        _onSiteReady: function(viewerMode) {
            var viewer = this.resources.W.Viewer;
            viewer.getSiteView(Constants.ViewerTypesParams.TYPES.DESKTOP).removeEvent('SiteReady', this._onSiteReady);
            viewer.getSiteView(Constants.ViewerTypesParams.TYPES.DESKTOP).changePageWithTransition(viewer.getCurrentPageId());
//            viewer.getSiteNode().$logic._bgNode.setStyles({'position':'fixed', 'width':'100%', 'height':'100%'});
        },

        _createComponentProperties: function(){
            this.parent();
            this._properties.setIsPersistent(true);
        }

    });
});

