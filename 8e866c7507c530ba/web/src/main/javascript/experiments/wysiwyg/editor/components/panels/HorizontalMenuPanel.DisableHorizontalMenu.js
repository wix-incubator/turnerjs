define.experiment.component('wysiwyg.editor.components.panels.HorizontalMenuPanel.DisableHorizontalMenu', function (componentDefinition, experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({
        _createFields: strategy.around(function (originalFunction) {
            if(this._previewComponent.className === "wysiwyg.viewer.components.menus.DropDownMenu"){
                originalFunction();
            }
        })
    });
});