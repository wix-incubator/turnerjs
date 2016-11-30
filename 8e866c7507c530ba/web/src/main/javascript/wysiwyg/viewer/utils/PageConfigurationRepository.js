/**
 * @class wysiwyg.viewer.utils.PageConfigurationRepository
 */
define.Class("wysiwyg.viewer.utils.PageConfigurationRepository", function(classDefinition){
    /**
     * @type bootstrap.managers.classmanager.ClassDefinition
     */
    var def = classDefinition;

    def.resources([ "W.Utils" ]);

    /**
     * @lends wysiwyg.viewer.utils.PageConfigurationRepository
     */
    def.methods({

        initialize: function () {
            this._pageConfigMap = {};
            this._pageTypeMap = {};
            this._defaultConfig = {
                type: "wysiwyg.editor.utils.PageConfiguration",
                options: {
                    canBeDeleted: true,
                    canBeDuplicated: true,
                    showSeoSettings: true,
                    canBeHidden: true,
                    canBeReordered: true,
                    canHaveChildren: true,
                    canBeAddedFromMenu: true,
                    canBeSetAsHomePage: true,
                    showBasicSettings: true,
                    canBeProtected: true,
                    pageIcon: null,
                    repeaterPage: false,
                    canBeLinkedTo: true,
                    hideLayoutSettings: false
                }
            };
        },

        /**
         * @param pageKey
         * @param { { type, options } } config
         */
        registerConfig: function (pageKey, config) {
            // apply defaults
            config = Object.merge({}, this._defaultConfig, config);

            if (!this._pageConfigMap.hasOwnProperty(pageKey)) {
                this._pageConfigMap[pageKey] = config;
            }
//            else {
//                if (!this._areEqualConfigs(config.options, this._pageConfigMap[pageKey].options)) {
//                    throw "PageConfigurationRepository:: cannot register different configurations for the same page type [" + pageKey + "].";
//                }
//            }
        },

        /**
         * @param page
         * @returns {*}
         */
        getConfig: function (page) {
            var keyGetter = this._pageTypeMap[page.type];
            if (!keyGetter) {
                throw "PageConfigurationRepository:: cannot resolve key getter function for page type [" + page.type + "].";
            }

            var type = keyGetter(page);

            return this.getConfigById(type);
        },

        /**
         * @param pageId
         * @returns {*}
         */
        getConfigById: function (pageId) {
            var config = this._pageConfigMap[pageId];

            if (!config) {
                throw "PageConfigurationRepository:: configuration not found for page type [" + pageId + "].";
            }

            return config;
        },

        /**
         * registerPageType("Page",function (data) {return "Page";});
         * registerPageType("AppBuilderPage",function (data) {return "AppBuilderPage";});
         * registerPageType("AppPage",function (data) {return data.appPageId;});
         *
         * @param pageType
         * @param getConfigKeyFunc
         */
        registerPageType: function (pageType, getConfigKeyFunc) {
            if (!this._pageTypeMap.hasOwnProperty(pageType)) {
                this._pageTypeMap[pageType] = getConfigKeyFunc;
            }
//            else {
//                throw "PageConfigurationRepository:: cannot register different getter methods for the same page type [" + pageType + "].";
//            }
        },

        _areEqualConfigs: function (a, b) {
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);

            if (aKeys.length != bKeys.length) {
                return false;
            }

            for (var i = 0; i < aKeys.length; i++) {
                var key = aKeys[i];
                if (a[key] !== b[key]) {
                    return false;
                }
            }

            return true;
        }

    });
});
