define.experiment.newComponent('wysiwyg.common.components.dropdownmenu.editor.DropDownMenuPanel.Dropdownmenu', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['MenuDataRef']);

    def.binds(['_isStretchPropertyOn', '_isSameWidthPropertyOn']);

    def.skinParts({
        buttonsAlignment: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {labelText: 'MENU_BUTTONS_ALIGNMENT', display: 'inline', presetList: Constants.PanelFields.RadioImages.args.presetList},
            bindToProperty: 'alignButtons',
            visibilityCondition: function(){
                return !this._isStretchPropertyOn();
            }
        },
        textAlignment: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {labelText: 'MENU_BUTTON_TEXT_ALIGNMENT', display: 'inline', presetList: Constants.PanelFields.RadioImages.args.presetList},
            bindToProperty: 'alignText',
            visibilityCondition: function(){
                return this._isStretchPropertyOn() || this._isSameWidthPropertyOn();
            }
        },
        buttonsConstantWidth: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'MENU_BUTTONS_CONSTANT_WIDTH'},
            bindToProperty: 'sameWidthButtons'
        },
        buttonsFillMenuWidth: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'MENU_BUTTONS_FILL_MENU_WIDTH'},
            bindToProperty: 'stretchButtonsToMenuWidth'
        },
        moreButtonLabel: {
            type: Constants.PanelFields.Input.compType,
            argObject: {labelText: 'MENU_MORE_BUTTON_LABEL', placeHolderText: 'Label Text', maxLength: '100', validatorArgs: {validators: ['htmlCharactersValidator']},
                toolTip: Constants.PanelFields.Input.args.toolTip('Menu_Settings_More_menu_button_ttid')},
            bindToProperty: 'moreButtonLabel'
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        _isStretchPropertyOn: function(){
            return this._previewComponent.getComponentProperty('stretchButtonsToMenuWidth');
        },
        _isSameWidthPropertyOn: function(){
            return this._previewComponent.getComponentProperty('sameWidthButtons');
        }
    });
});
