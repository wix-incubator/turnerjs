define.component('wysiwyg.editor.components.panels.ContactInformationPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.resources(['W.Utils', 'W.Commands']);

    def.binds(['_validateEmail', '_reportLogoChangeToBI']);

    def.skinParts({
        panelLabel  : { type: 'htmlElement', autoBindDictionary: 'CONTACT_INFO' },
        help       : { type: 'htmlElement' },
        close       : { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'BACK_TO_MOBILE_ACTION_BAR', command: 'this._closeCommand' },
        content     : { type: 'htmlElement' }
    });

    def.dataTypes(['ContactInformation']);

    def.methods({

        _onAllSkinPartsReady: function() {
            this.parent();
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._reportLogoChangeToBI);
        },

        _createFields: function() {
            var panel = this;

            var validateHtml = this._inputValidators.htmlCharactersValidator;

            this.addBreakLine('15px');

            this.addSubLabel(this._translate('QUICK_ACTIONS_PANEL_DESCRIPTION'), null);

            this.addInputField(this._translate('QUICK_ACTIONS_PANEL_PHONE_NUMBER'),
                null, null, 50, {validators: [validateHtml]}).bindToField('phone')
                .addEvent('blur', this._onInputBlur);

            this.addBreakLine('7px');

            this.addInputField(this._translate('QUICK_ACTIONS_PANEL_EMAIL_ADDRESS'),
                null, null, 50, {validators: [panel._validateEmail]})
                .bindToField('email').addEvent('blur', this._onInputBlur);

            this.addBreakLine('7px');

            this.addInputField(this._translate('QUICK_ACTIONS_PANEL_ADDRESS'),
                null, null, 200, {validators: [validateHtml]})
                .bindToField('address').addEvent('blur', this._onInputBlur);

            this.addBreakLine('7px');

            this.addInputField(this._translate('QUICK_ACTIONS_PANEL_FAX'),
                null, null, 50, {validators: [validateHtml]})
                .bindToField('fax').addEvent('blur', this._onInputBlur);
        },

        _onInputBlur: function(event) {
            if (event.wasDataChanged) {
                LOG.reportEvent(wixEvents.EDITOR_CONTACT_INFORMATION_MODIFIED, {g1: this._dataFieldName, c1: event.newValue, c2:event.oldValue});
            }
        },


        _reportLogoChangeToBI: function(data, changedDataField, newValue, oldValue) {
            if (changedDataField=='logoUrl') {
                var newUri = newValue[changedDataField]? newValue[changedDataField].uri.toString() : "";
                var oldUri = oldValue[changedDataField]? oldValue[changedDataField].uri.toString() : "";
                LOG.reportEvent(wixEvents.EDITOR_CONTACT_INFORMATION_MODIFIED, {g1: changedDataField, c1: newUri, c2: oldUri});
            }
        },


        _validateEmail: function (value) {
            var isEmail = this.resources.W.Utils.isValidEmail(value);
            return (isEmail || !value) ? null: this._translate('QUICK_ACTIONS_PANEL_INVALID_EMAIL');
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_CONTACT_INFORMATION');
        }

    });

});
