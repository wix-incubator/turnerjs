define.component('wysiwyg.editor.components.panels.MobilePreloader', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.resources(['W.Utils', 'W.Commands', 'W.Data']);

    def.skinParts({
        panelLabel  : { type: 'htmlElement', autoBindDictionary: 'MOBILE_PRELOADER' },
        help       : { type: 'htmlElement' },
        close       : { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'done', command: 'this._closeCommand' },
        content     : { type: 'htmlElement' }
    });

    def.binds(['_enableOrDisablePreloaderGroup', '_enableOrDisablePreloaderCheckBox', '_updateCheckBoxToolTip']);

    def.dataTypes(['ContactInformation']);

    def.methods({

        _onAllSkinPartsReady: function() {
            this.parent();
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._reportLogoChangeToBI);

            var multipleStructureConfiguration = this.resources.W.Data.getDataByQuery('#MULTIPLE_STRUCTURE');
            multipleStructureConfiguration.on(Constants.DataEvents.DATA_CHANGED, this, function (eventInfo){
                var oldValue = eventInfo.data.oldValue;
                var newValue = eventInfo.data.newValue;
                var changedDataField = eventInfo.data.field;
                if(changedDataField !== 'hasMobileStructure'){
                    return;
                }
                if(_.isEqual(newValue, oldValue) || !_.isObject(newValue)){
                    return;
                }
                this._enableOrDisablePreloaderGroup(undefined);
                this._enableOrDisablePreloaderCheckBox(undefined, newValue.hasMobileStructure);
            });
        },

        _createFields: function() {
            var panel = this;

            var validateHtml = this._inputValidators.htmlCharactersValidator;

            this.addBreakLine('15px');
            this.addSubLabel(this._translate('MOBILE_PRELOADER_PANEL_DESCRIPTION'), null);

            this.addBreakLine('10px');

            this.addCheckBoxField(this._translate('MOBILE_PRELOADER_ENABLE')).bindToField("preloaderEnabled")
                .addEvent('inputChanged', panel._enableOrDisablePreloaderGroup)
                .runWhenReady(function(logic){
                    var multipleStructureConfiguration = this.resources.W.Data.getDataByQuery('#MULTIPLE_STRUCTURE');
                    this._enableOrDisablePreloaderCheckBox(logic, multipleStructureConfiguration.get('hasMobileStructure'));
                }.bind(this));

            this.addInputGroupField(function(panel){
                panel._preloaderGroupLogic = this;
                this.addBreakLine('10px');

                this.addInputField(this._translate('QUICK_ACTIONS_PANEL_COMPANY_NAME'),
                    null, null, 50, {validators: [validateHtml]})
                    .bindToField('companyName').addEvent('blur', this._onInputBlur);

                this.addBreakLine('10px');

                this.addInputGroupField(function(){
                    this.addImageField(this._translate('MOBILE_PRELOADER_LOGO_DESCRIPTION') + this._translate('MOBILE_PRELOADER_LOGO_MAX_SIZE'), 256,256, this._translate("QUICK_ACTIONS_PANEL_LOGO_UPLOAD_BUTTON"), null, this._translate("IMAGE_REMOVE"), "siteLogo").bindToField('logoUrl');
                    this.addBreakLine('7px');
                });
            }, 'skinless')
                .runWhenReady(function(logic){
                    this._enableOrDisablePreloaderGroup(logic);
                }.bind(this));
        },

        _onInputBlur: function(event) {
            if (event.wasDataChanged) {
                LOG.reportEvent(wixEvents.EDITOR_CONTACT_INFORMATION_MODIFIED, {g1: this._dataFieldName, c1: event.newValue, c2:event.oldValue});
            }
        },

        _enableOrDisablePreloaderGroup: function(logic){
            this._preloaderGroupLogic = this._preloaderGroupLogic || logic;
            if (!this._preloaderGroupLogic) {
                return;
            }

            if (this._data.get('preloaderEnabled')) {
                this._preloaderGroupLogic.enable();
            } else {
                this._preloaderGroupLogic.disable();
            }
        },

        _enableOrDisablePreloaderCheckBox: function(logic, mobileOptimizedOn){
            this._preloaderCheckBox = this._preloaderCheckBox || logic;
            if (!this._preloaderCheckBox) {
                return;
            }

            if (mobileOptimizedOn) {
                this._preloaderCheckBox.enable();
            } else {
                this._preloaderCheckBox.disable();
            }

            this._updateCheckBoxToolTip(this._preloaderCheckBox, !mobileOptimizedOn);
        },

        _updateChildrenState:function(){
            //Do Nothing
        },

        _updateCheckBoxToolTip: function (checkBoxLogic, isShowToolTip) {
            checkBoxLogic._toolTipAsQuestionMark = false;
            if (isShowToolTip) {
                checkBoxLogic.addToolTip('Mobile_preloader_panel_preloader_checkbox_disabled_ttid', false, checkBoxLogic.getViewNode());
            } else {
                checkBoxLogic.removeToolTip(checkBoxLogic.getViewNode());
            }
        },

        _reportLogoChangeToBI: function(data, changedDataField, newValue, oldValue) {
            if (changedDataField=='logoUrl') {
                var newUri = newValue[changedDataField]? newValue[changedDataField].uri.toString() : "";
                var oldUri = oldValue[changedDataField]? oldValue[changedDataField].uri.toString() : "";
                LOG.reportEvent(wixEvents.EDITOR_CONTACT_INFORMATION_MODIFIED, {g1: changedDataField, c1: newUri, c2: oldUri});
            }
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_PRELOADER');
        }

    });

});
