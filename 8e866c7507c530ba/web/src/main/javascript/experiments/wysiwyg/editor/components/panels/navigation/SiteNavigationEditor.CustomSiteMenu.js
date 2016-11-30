/**@Class wysiwyg.editor.components.panels.navigation.SiteNavigationEditor*/
define.experiment.component('wysiwyg.editor.components.panels.navigation.SiteNavigationEditor.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.customizeField(function(bindArr) {
        bindArr.push('_reorderItemsData');
        return _.filter(bindArr, function(methodName){
            return methodName !== '_reorderPagesData';
        });
    }));

    def.methods({

        initMenu: function (dataQuery, buttonType, args) {
            dataQuery = dataQuery || '#MAIN_MENU';
            buttonType = buttonType || Constants.NavigationButtons.CUSTOM_SITE_MENU_NAVIGATION_BUTTON;

            this._isMainMenu = (dataQuery === '#MAIN_MENU');

            if (this._isMainMenu) {
                this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onSitePageChanged);
            }

            var dataItem = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(dataQuery);

            this._handleMenuData(dataItem);
            this._initTreeStructure(buttonType, args);
        }
    });
});
