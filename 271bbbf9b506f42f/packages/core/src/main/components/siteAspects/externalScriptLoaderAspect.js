define(['react', 'utils', 'lodash', 'core/core/siteAspectsRegistry', 'core/components/siteAspects/scriptClass'], function (React, utils, _, /** core.siteAspectsRegistry */ siteAspectsRegistry, scriptClass) {
    'use strict';

    var FACEBOOK_SDK_VERSION = 'v2.4';
    var FB_APP_ID = '304553036307597';
    var facebookSDKTemplate = _.template('//connect.facebook.net/<%= lang %>/sdk.js#xfbml=1&appId=<%= appId %>&version=<%= sdkVersion %>');

    /**
     * @constructor
     */
    function ExternalScriptLoader(siteAPI) {
        this.siteAPI = siteAPI;
        this.loadedScripts = {};
    }

    ExternalScriptLoader.prototype = {
        /**
         *
         * @returns {ReactComponent[]}
         */
        getReactComponents: function () {
            return _.map(this.loadedScripts, this.getNewScript, this);
        },

        /**
         * Load a specific script, if it hasn't been loaded before
         *
         * @param {string} name - script name
         * @param {function} callback - callback to be called after the script load
         * @param {Object} context - context to call callback function
         *
         */
        loadScript: function (name, callback, context) {
            var scriptData = this.loadedScripts[name];
            var callbackData;
            var scriptDescription;

            if (callback) {
                callbackData = {
                    callback: callback,
                    context: context
                };
            }

            if (scriptData && callbackData) {
                scriptData.callbacks.push(callbackData);
            } else {
                scriptDescription = this.getScriptDescription.apply(this, arguments);
                if (_.isFunction(scriptDescription.actionBefore)) {
                    scriptDescription.actionBefore();
                }
                this.loadedScripts[name] = {
                    script: scriptDescription,
                    callbacks: callbackData ? [callbackData] : []
                };
            }
        },

        /**
         * Unsubscribe from script load event. Use this method in subscriber.componentWillUnmount
         *
         * @param {string} name - script name
         * @param {function} callback - callback function that should be unsubscribed
         *
         */
        unsubscribe: function (name, callback) {
            var scriptData = this.loadedScripts[name];
            var callbacks;

            if (scriptData) {
                callbacks = scriptData.callbacks;

                callbacks.some(function (callbackData, i) { //eslint-disable-line array-callback-return
                    var found = callbackData.callback === callback;

                    if (found) {
                        callbacks.splice(i, 1);
                        return found;
                    }
                });
            }
        },

        getNewScript: function (scriptData, scriptName) { //eslint-disable-line react/display-name
            return React.createElement(scriptClass, {
                key: scriptName,
                ref: scriptName,
                scriptData: scriptData
            });
        },

        getScriptDescription: function (scriptName, callback, context) {
            if (scriptName === 'FACEBOOK') {
                return {
                    NAME: 'FacebookSDK',
                    SRC: facebookSDKTemplate({lang: this.getFacebookSdkLanguage(context), sdkVersion: FACEBOOK_SDK_VERSION, appId: FB_APP_ID})
                };
            }
            if (scriptName === 'GOOGLE') {
                return {
                    NAME: 'GoogleApi',
                    SRC: '//apis.google.com/js/plusone.js',
                    actionBefore: function () {
                        window.___gcfg = {
                            lang: utils.wixUserApi.getLanguage(context.cookie, context.currentUrl)
                        };
                    }
                };
            }
        },

        getFacebookSdkLanguage: function (context) {
            var languageDecode = {
                en: 'en_US',
                es: 'es_ES',
                pt: 'pt_BR',
                ru: 'ru_RU',
                fr: 'fr_FR',
                de: 'de_DE',
                ja: 'ja_JP',
                ko: 'ko_KR',
                it: 'it_IT',
                pl: 'pl_PL',
                tr: 'tr_TR',
                nl: 'nl_NL',
                sv: 'sv_SE',
                da: 'da_DK',
                no: 'nn_NO'
            };

            return languageDecode[utils.wixUserApi.getLanguage(context.cookie, context.currentUrl)] || languageDecode.en;
        }
    };

    siteAspectsRegistry.registerSiteAspect('externalScriptLoader', ExternalScriptLoader);
});
