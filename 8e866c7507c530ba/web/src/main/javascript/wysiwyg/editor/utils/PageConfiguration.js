/**
 * @class wysiwyg.editor.utils.PageConfiguration
 */
define.Class("wysiwyg.editor.utils.PageConfiguration", function(classDefinition){
    /**
     * @type bootstrap.managers.classmanager.ClassDefinition
     */
    var def = classDefinition;

    /**
     * @lends wysiwyg.editor.utils.PageConfiguration
     */
    def.fields({
        _config: {},
        _pageData: null
    });

    /**
     * @lends wysiwyg.editor.utils.PageConfiguration
     */
    def.methods({

        initialize: function (pageData, options) {
            this._pageData = pageData;
            this._config = Object.merge(this._config, options);
        },

        /**
         * return the appPageId from the page data - if it exists
         * @returns {string}
         */
        getAppPageId: function () {
            return this._pageData.appPageId;
        },

        /**
         * @returns {string}
         */
        getPageId: function () {
            return this._pageData.id;
        },

        getPageTitle: function () {
            return this._pageData.title;
        },

        getPageLink: function () {
            return "#!" + this._pageData.pageUriSEO + "/" + this._pageData.id;
        },

        /**
         * @returns {boolean}
         */
        canBeDeleted: function () {
            return this._config.canBeDeleted;
        },

        /**
         * @returns {boolean}
         */
        canBeDuplicated: function () {
            return this._config.canBeDuplicated;
        },

        /**
         * @returns {boolean}
         */
        showSeoSettings: function () {
            return this._config.showSeoSettings;
        },

        /**
         * @returns {boolean}
         */
        isHidden: function () {
            if (this._config.hasOwnProperty("isHidden")) {
                return this._config.isHidden;
            }
            return this._pageData.hidePage;
        },

        /**
         * @returns {boolean}
         */
        canBeHidden: function () {
            return this._config.canBeHidden;
        },

        /**
         * @returns {boolean}
         */
        canBeReordered: function () {
            return this._config.canBeReordered;
        },

        /**
         * @returns {boolean}
         */
        canHaveChildren: function () {
            return this._config.canHaveChildren;
        },

        /**
         * @returns {boolean}
         */
        canBeAddedFromMenu: function () {
            return this._config.canBeAddedFromMenu;
        },

        /**
         * @returns {boolean}
         */
        canBeSetAsHomePage: function () {
            return this._config.canBeSetAsHomePage;
        },

        /**
         * @returns {boolean}
         */
        canBeProtected: function () {
            return this._config.canBeProtected;
        },

        /**
         * @returns {boolean}
         */
        showBasicSettings: function () {
            return this._config.showBasicSettings;
        },

        /**
         * @returns {boolean}
         */
        isAppPage: function () {
            return this._pageData.type === "AppPage";
        },

        /**
         * @returns {string}
         */
        getPageIcon: function () {
            return this._config.pageIcon;
        },

        /**
         * @returns {boolean}
         */
        isRepeaterPage: function() {
            return this._config.repeaterPage;
        },

        canBeLinkedTo: function () {
            return this._config.canBeLinkedTo;
        }
    });
});
