define(['core', 'utils'], function (core, utils) {
    'use strict';

    var mixins = core.compMixins,
        userApi = utils.wixUserApi;

     return {
        displayName: 'BackOfficeText',
        mixins: [mixins.skinBasedComp],
        getSkinProperties: function () {
            var props = this.props.compProp;

            return {
                label: {
                    children: this.getDisplayedText(),
                    style: {
                        textAlign: this.props.compProp.align,
                        paddingLeft: props.align === 'left' ? utils.style.unitize(props.margin) : 0,
                        paddingRight: props.align === 'right' ? utils.style.unitize(props.margin) : 0
                    }
                }
            };
        },
        getDisplayedText: function () {
            var lang = this.getLanguage(),
                key = this.props.compData.key,
                value = this.getValueByLangAndKey(lang, key);

            if (value) {
                return value;
            }

            if (this.isWixUser()) {
                return key;
            }

            return '';
        },
        /**
         * Returns value by key according to this steps:
         *
         * 1. If key is found in lang, return value from lang.
         * 2. Else, if key is found in english, return value from english.
         * 3. Else, return null
         *
         * @param lang
         * @param key
         * @returns {*}
         */
        getValueByLangAndKey: function (lang, key) {
            var globals = this.props.siteData && this.props.siteData.componentGlobals,
                backOfficeText = globals ? globals.backOfficeText : null;

            if (backOfficeText) {
                if (backOfficeText[lang] && backOfficeText[lang][key]) {
                    return backOfficeText[lang][key];
                }

                if (backOfficeText.en) {
                    return backOfficeText.en[key];
                }
                return null;
            }
        },
        getLanguage: function () {
            var siteData = this.props.siteData;
            var lang = userApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);
            return lang && lang.toLowerCase();
        },
        isWixUser: function () {
            return !!userApi.getUsername(this.props.siteData);
        }
    };
});