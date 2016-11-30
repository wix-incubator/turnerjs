define.experiment.Class('wysiwyg.common.components.verticalmenu.editor.traits.MenuDataHandler.CustomSiteMenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        _onMainMenuDataChange: function() {
            this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
            this.buildItemList();
            this._setItemsHeight(true);
        }
    });
});