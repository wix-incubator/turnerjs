define.experiment.component('wysiwyg.editor.components.panels.BackgroundDesignPanel.BgPanelRefactor', function(componentDefinition, strategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.binds(strategy.merge(['_onClick']));

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey  = "BACKGROUND_DESIGN_TITLE";
            this._descriptionKey = "BACKGROUND_DESIGN_DESCRIPTION2";
            this._panelName = "BACKGROUND_DESIGN_TITLE";

            this._themeManagerData = this.injects().Preview.getPreviewManagers().Theme.getDataItem();

        },

        _createFields: function() {
            var bgData = W.Data.getDataByQuery('#BACKGROUND_STYLES');
            var bgItems = bgData.get('items');
            var bgItem = null;

            this.setNumberOfItemsPerLine(3, 2);

            for(var i = 0; i < bgItems.length; i++){
                bgItem = bgItems[i];
                var buttonData = W.Data.createDataItem(bgItem);
                this.addBgPresetSelector(bgItem.thumbnail)
                    .bindToDataItem(buttonData)
                    .addEvent('inputChanged', this._onClick);
            }
        },

        _onClick: function(event){
            this.resources.W.UndoRedoManager.startTransaction();
            var data = event.compLogic.getDataItem();
            this._themeManagerData.setFields({'siteBg': data.get('siteBg'), 'color_0': data.get('color_0')}, this);
//            this._themeManagerData.set('siteBg', data.get('siteBg'));
//            this._themeManagerData.set('color_0', data.get('color_0'));
            this._onThemeDataChanged();
        },

        dispose:strategy.remove()
    });
});