/**
 * @class wysiwyg.viewer.components.WFacebookLike
 */
define.component('wysiwyg.viewer.components.WFacebookLike', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SocialBaseComponent');

    def.resources(['W.Utils', 'W.Viewer', 'W.Config']);

    def.propertiesSchemaType('WFacebookLikeProperties');

    def.skinParts( {
        facebook:{type:'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : false
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode, extraArgs) {
            this.resources.W.Utils.hash.addEvent('change', function() {
                // When hash changes we need to update the href property
                this.callRenderLater( 500 );
            }.bind(this));

            this.parent(compId, viewNode, extraArgs);
        },

        render: function() {
            this._layout = this.getComponentProperty('layout');
            this._showFaces = this.getComponentProperty('show_faces');
            this._action = this.getComponentProperty('action');
            this._colorScheme = this.getComponentProperty('colorScheme');
            this._send = this.getComponentProperty('send');

            this.parent();
        },

        _getIframeContainer: function(){
            return this._skinParts.facebook;
        },

        _getPageName: function() {
            return "fblike.html";
        },

        _getUrlParams: function() {
            return {
                'href': this._getLikeUrl(),
                'layout': this._layout,
                'show_faces': this._showFaces,
                'action': this._action,
                'colorscheme': this._colorScheme,
                'send' :  this._send,
                'width': this._getSizeAccordingToProperties().x
            };
        },


        //Experiment WFacebookLikeWidthFix.New was merged on January 27 2014 by DenisH

        _getLikeUrl: function() {
            if(this.resources.W.Config.env.$isPublicViewerFrame) {
                var baseUrl = window["publicModel"] ? window["publicModel"]["externalBaseUrl"] : undefined;
                baseUrl = baseUrl || location.protocol + '//' + location.host + location.pathname;
                if(this.resources.W.Viewer.isHomePage() || this._isComponentInHeaderOrFooter(this)) {
                    return baseUrl;
                } else {
                    return baseUrl + location.hash;
                }
            } else {
                return "http://www.wix.com/create/website";
            }
        },

        _isComponentInHeaderOrFooter: function(obj){
            if(obj === null || undefined){
                return false;
            }
            if(obj.className === "wysiwyg.viewer.components.HeaderContainer" ||
                obj.className === "wysiwyg.viewer.components.FooterContainer"){
                return true;
            }

            return this._isComponentInHeaderOrFooter(obj.getParentComponent());

        },

//        layout - there are three options.
//standard - displays social text to the right of the button and friends' profile photos below. Minimum width: 225 pixels. Minimum increases by 40px if action is 'recommend' by and increases by 60px if send is 'true'. Default width: 450 pixels. Height: 35 pixels (without photos) or 80 pixels (with photos).
//button_count - displays the total number of likes to the right of the button. Minimum width: 90 pixels. Default width: 90 pixels. Height: 20 pixels.
//box_count - displays the total number of likes above the button. Minimum width: 55 pixels. Default width: 55 pixels. Height: 65 pixels.

        _getSizeAccordingToProperties: function () {
            var w, h;
            if (this._layout == "standard") {
                w = 250;
                if (this._action == "recommend") {
                    w += 40;
                }
                if (this._showFaces) {
                    h = 85;
                } else {
                    h = 40;
                }
            }
            else if (this._layout == "button_count") {
                w = 137;
                h = 20;
                if (this._action == "recommend") {
                    w += 35;
                }
            }
            else if (this._layout == "box_count") {
                w = 85;
                if (this._action == "recommend") {
                    w += 40;
                }
                h = 65;
            }

            return {'w': w, 'h': h};
        }
    });
});