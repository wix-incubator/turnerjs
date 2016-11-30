/**
 * @class wysiwyg.editor.utils.PageConfigurationFactory
 */
define.Class("wysiwyg.editor.utils.PageConfigurationFactory", function(classDefinition){
    /**
     * @type bootstrap.managers.classmanager.ClassDefinition
     */
    var def = classDefinition;

    def.utilize([
        "wysiwyg.editor.utils.PageConfiguration"
    ]);

    def.resources([ "W.Preview", "W.Classes" ]);

    /**
     * @lends wysiwyg.editor.utils.PageConfigurationFactory
     */
    def.fields({
        _pageConfigRepo: null
    });

    /**
     * @lends wysiwyg.editor.utils.PageConfigurationFactory
     */
    def.methods({

        initialize: function () {
            this.resources.W.Preview.getPreviewManagersAsync(function (previewManagers) {
                this._pageConfigRepo = previewManagers.Viewer.getPageConfigurationRepository();
            }, this);
        },

        /**
         * @param page
         * @returns {Q} a promise for a PageConfiguration object
         */
        getPageConfigPromise: function (page) {
            var config = this._pageConfigRepo.getConfig(page);

            var ret = Q.defer();

            this.resources.W.Classes.getClass(config.type, function (ClassCtor) {
                var instance = new ClassCtor(page, config.options);
                ret.resolve(instance);
            });

            return ret.promise;
        },

        /**
         * @param pageId
         * @returns {Q} a promise for a PageConfiguration object
         */
        getPageConfigPromiseById: function (pageId) {
            var config = this._pageConfigRepo.getConfigById(pageId);

            var ret = Q.defer();

            this.resources.W.Classes.getClass(config.type, function (ClassCtor) {
                var instance = new ClassCtor(page, config.options);
                ret.resolve(instance);
            });

            return ret.promise;
        },

        /**
         * @param pageKey
         * @param { { type, options } } config
         */
        registerConfig: function (pageKey, config) {
            this._pageConfigRepo.registerConfig(pageKey, config);
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
            this._pageConfigRepo.registerPageType(pageType, getConfigKeyFunc);
        }

    });
});
