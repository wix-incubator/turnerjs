/**
 * @class wysiwyg.viewer.components.WTwitterFollow
 */
define.component('wysiwyg.viewer.components.WTwitterFollow', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SocialBaseComponent');

    def.skinParts({
        twitter: {type: 'htmlElement'}
    });

    def.dataTypes(['TwitterFollow']);

    def.propertiesSchemaType('WTwitterFollowProperties');

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({

        render: function () {
            this._screenName = this._getScreenName();
            this._showCount = this.getComponentProperty('showCount');
            this._showScreenName = this.getComponentProperty('showScreenName');
            this.parent();
        },

        _getScreenName: function () {
            var data = this.getDataItem(),
                twitterAccount;

            twitterAccount = data ? data.get('accountToFollow') : '';
            return twitterAccount.replace('@', '');
        },

        _getIframeContainer: function () {
            return this._skinParts.twitter;
        },

        _getPageName: function () {
            return "twfollow.html";
        },

        _getUrlParams: function () {
            var screenName = this._screenName || this._getScreenName();

            return {
                'screen_name': screenName,
                'href': 'https://twitter.com/' + screenName,
                'show_count': this._showCount,
                'show_screen_name': this._showScreenName,
                'lang': this.getComponentProperty('dataLang'),
                'align': 'left'
            };
        },

        _getSizeAccordingToProperties: function () {
            var w = 80;
            var h = 20;
            if (this._showCount) {
                w += 85;
            }

            if (this._showScreenName) {
                w += (this._screenName.length * 6);
            }

            return {'w': w, 'h': h};
        }

    });
});