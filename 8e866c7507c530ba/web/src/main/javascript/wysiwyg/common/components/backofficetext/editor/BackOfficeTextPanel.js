define.component('wysiwyg.common.components.backofficetext.editor.BackOfficeTextPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['BackOfficeText']);

    def.skinParts({
        keyLabel:{
            type: Constants.PanelFields.Label.compType
        },

        setAlignment: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {labelText: 'BUTTON_TEXT_ALIGN', display: 'inline', presetList: Constants.PanelFields.RadioImages.args.presetList},
            bindToProperty: 'align'
        },
        setMargin: {
            type: Constants.PanelFields.Slider.compType,
            argObject: {labelText: 'BUTTON_MARGIN', min: 1, max: 100, step: 1, noFloats: true},
            bindToProperty: 'margin'
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
        }
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

        },
        _onAllSkinPartsReady: function(){
            this._skinParts.keyLabel.setValue("Current key is: '" + this.getDataItem().get("key") + "'");
        }
    });

});
