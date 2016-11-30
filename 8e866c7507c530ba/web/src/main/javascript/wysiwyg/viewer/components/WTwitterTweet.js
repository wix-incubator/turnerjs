/**
 * @class wysiwyg.viewer.components.WTwitterTweet
 */
define.component('wysiwyg.viewer.components.WTwitterTweet', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SocialBaseComponent');

    def.resources(['W.Utils', 'W.Viewer']);

    def.skinParts({
        twitter: {type: 'htmlElement'}
    });

    def.dataTypes(['TwitterTweet']);

    def.propertiesSchemaType('WTwitterTweetProperties');

    def.fields({
        SIZES: {
            DESKTOP: {
                NONE: {
                    WIDTH: 60,
                    HEIGHT: 20
                },
                HORIZONTAL: {
                    WIDTH: 100,
                    HEIGHT: 20
                },
                VERTICAL: {
                    WIDTH: 60,
                    HEIGHT: 62
                }
            },

            MOBILE: {
                NONE: {
                    WIDTH: 80,
                    HEIGHT: 30
                },
                HORIZONTAL: {
                    WIDTH: 110,
                    HEIGHT: 30
                },
                VERTICAL: {
                    WIDTH: 85,
                    HEIGHT: 32
                }
            }
        }
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode, extraArgs) {
            this.resources.W.Utils.hash.addEvent('change', function () {
                // When hash changes we need to update the href property
                this.callRenderLater(500);
            }.bind(this));

            this.parent(compId, viewNode, extraArgs);
            this._isMobileView = (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE);
        },

        _getIframeContainer: function () {
            return this._skinParts.twitter;
        },

        _getPageName: function () {
            return "twtweet.html";
        },

        _getUrlParams: function () {
            var params = {
                'href': 'https://twitter.com/share',
                'count': this.getComponentProperty('dataCount'),
                'lang': this.getComponentProperty('dataLang'),
                'url': location.href,
                'text': this._data.get('defaultText'),
                'related': this._data.get('accountToFollow'),
                'counturl': location.href
            };

            if (this._isMobileView) {
                params.size = 'l';
            }
            return params;
        },

        _getSizeAccordingToProperties: function () {
            var count = this.getComponentProperty('dataCount').toUpperCase();
            var prefix = this._isMobileView ? 'MOBILE' : 'DESKTOP';
            var sizes = this.SIZES[prefix];
            var w = sizes[count].WIDTH;
            var h = sizes[count].HEIGHT;

            return {'w': w, 'h': h};
        }

    });
});
