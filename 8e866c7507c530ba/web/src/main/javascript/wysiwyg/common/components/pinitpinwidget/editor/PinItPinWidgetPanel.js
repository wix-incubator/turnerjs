define.component('wysiwyg.common.components.pinitpinwidget.editor.PinItPinWidgetPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['PinItPinWidget']);

    def.binds(['_addPinIdValidator' ]);

    def.resources(['W.Commands', 'W.Resources','W.Utils']);

    def.skinParts({
        pinId: {
            type: Constants.PanelFields.SubmitInput.compType,
            argObject: {
                labelText: 'PinterestPinItPinWidget_pinId',
                placeholderText: 'http://www.pinterest.com/pin/204421270559483222/',
                buttonLabel: 'PinterestPinItPinWidget_pinIdBtn',
                maxLength: '100',
                toolTip: Constants.PanelFields.ComboBox.args.toolTip('PinItPinWidget_insetPinUrl_ttid')
            },
            bindToData: 'pinId',
            hookMethod: '_addPinIdValidator'
        },
        HowToGetlink: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'PinItPinWidget_HOW_GET_PIN',
                command: 'WEditorCommands.ShowHelpDialog',
                commandParameter:'/node/21923'
            }
        }
    });

    def.methods({
       _addPinIdValidator : function (definition){
          definition.argObject.validatorArgs = {validators: [this._pinIdValidation]};
            return definition;
        },
        _pinIdValidation: function(pinIdUrl) {
            pinIdUrl = pinIdUrl.trim();
            if(!pinIdUrl || pinIdUrl.length == 0 ) {
             return W.Resources.get('EDITOR_LANGUAGE', 'PinItPinWidget_PIN_ERROR', 'PinItPinWidget_PIN_ERROR');
           }

            pinIdUrl=  pinIdUrl.toLowerCase();
            var isUrl = W.Utils.isValidUrl(pinIdUrl);
            if (!isUrl){
                return W.Resources.get('EDITOR_LANGUAGE', 'PinItPinWidget_PIN_NOT_URL', 'PinItPinWidget_PIN_NOT_URL');

           }

            var testPinUrl=/^https?:\/\/www\.pinterest\.com+\/(pin)/;
            var isPinUrl = testPinUrl.test(pinIdUrl);
            if (!isPinUrl){
                return W.Resources.get('EDITOR_LANGUAGE', 'PinItPinWidget_PIN_NOT_PINTEREST', 'PinItPinWidget_PIN_NOT_PINTEREST');
            }
            var pinId = pinIdUrl.split("/")[4];
            if (!/^\d+$/.test(pinId)){
                return W.Resources.get('EDITOR_LANGUAGE', 'PinItPinWidget_PIN_NOT_NUM_ERROR', 'PinItPinWidget_PIN_NOT_NUM_ERROR');
            }
        },
        _onAllSkinPartsReady:function (){
            this._skinParts.pinId._skinParts.button._skinParts.view.style.marginTop = "5px";
            this._skinParts.pinId._skinParts.input.style.marginTop = "3px"

        }
    })
});
