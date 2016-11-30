define.component('wysiwyg.common.components.skypecallbutton.editor.SkypeCallButtonPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['SkypeCallButton']);

    def.skinParts({
        enterSkypeName: {
            type: Constants.PanelFields.SubmitInput.compType,
            bindToData: 'skypeName',
            bindHooks: ['_skypeInputToData', '_skypeDataToInput'],
            argObject: {
                labelText: 'SkypeCallButton_ENTER_SKYPENAME',
                buttonLabel: 'SkypeCallButton_UPDATE',
                maxLength: '50'
            },
            hookMethod: '_addSkypeNameValidator'
        },
        importantNote: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: '<span class="bold">' + W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_IMPORTANT') + '</span> ' +
                           W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_NEED_TO_UPDATE') +
                           ' <span class="hoverable">' + W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_SEE_HOW') + '</span>' +
                           ' <div class="rollover"></div>'
            }
        },
        chooseButton: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SkypeCallButton_CHOOSE_BUTTON' },
            bindToData: 'buttonType',
            dataProvider:  function() {
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_BUTTON_CALL'), value: 'call' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_BUTTON_CHAT'), value: 'chat' }
                ];
            }
        },
        chooseColor: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SkypeCallButton_CHOOSE_COLOR' },
            bindToProperty: 'imageColor',
            dataProvider:  function() {
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_COLOR_BLUE'), value: 'blue' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_COLOR_WHITE'), value: 'white' }
                ];
            }
        },
        chooseSize: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'SkypeCallButton_CHOOSE_SIZE' },
            bindToProperty: 'imageSize',
            dataProvider:  function() {
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_SIZE_SMALL'), value: 'small' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_SIZE_MEDIUM'), value: 'medium' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_SIZE_LARGE'), value: 'large' }
                ];
            }
        },
        donthave: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                prefixText: 'SkypeCallButton_DONTHAVE_ACCOUNT',
                buttonLabel: 'SkypeCallButton_CLICK_HERE',
                command: 'WEditorCommands.OpenExternalLink',
                commandParameter: {
                    href: 'https://login.skype.com/join'
                }
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        _onAllSkinPartsReady: function () {
            this.parent();

            this._forceSkypeNameValidation();
        },
        _forceSkypeNameValidation: function () {
            var input = this._skinParts.enterSkypeName,
                skypeName = this._data.get('skypeName'),
                validationMessage = this._skypeNameValidator(skypeName);

            if (validationMessage) {
                input._showValidationMessage(validationMessage);
                input._validationFailCallback(validationMessage);
            }
        },
        _skypeInputToData: function (input) {
            return (input || "").trim();
        },
        _skypeDataToInput: function (data) {
            return (data || "").trim();
        },
        _addSkypeNameValidator: function (definition) {
            definition.argObject.validatorArgs = { validators: [this._skypeNameValidator] };
            return definition;
        },
        _skypeNameValidator: function (skypeName) {
            var empty_regex = /^\s*$/,
                starts_with_a_letter = /^\s*[A-Za-z]/,
                validation_regex = /^\s*[\w\.\-]+\s*$/;

            if (typeof skypeName !== "string" || empty_regex.test(skypeName)) {
                return W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_VALIDATION_REQUIRED');
            }

            if (!starts_with_a_letter.test(skypeName)) {
                return W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_VALIDATION_CAN_START');
            }

            if (!validation_regex.test(skypeName)) {
                return W.Resources.get('EDITOR_LANGUAGE', 'SkypeCallButton_VALIDATION_FAILED');
            }
        }
    });
});
