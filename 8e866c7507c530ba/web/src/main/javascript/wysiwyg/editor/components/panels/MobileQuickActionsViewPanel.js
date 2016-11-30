define.component('wysiwyg.editor.components.panels.MobileQuickActionsViewPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.skinParts({
        panelLabel  : { type: 'htmlElement', autoBindDictionary: 'MOBILE_ACTION_BAR_TITLE' },
        help        : { type: 'htmlElement' },
        close       : { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'done', command: 'this._closeCommand' },
        content     : { type: 'htmlElement' }
    });

    def.resources(["W.Editor", "W.Commands", "W.Resources", "W.Data", "W.Utils"]);

    def.dataTypes('QuickActions');

    def.binds(['_onToggleActivateQuickActions', '_updateMobilePreview', '_reportDataChangeToBI']);

    def.methods({

        _onSubPanelOpened: function(panel){
            this.fireEvent('mobileViewPanelOpened', this._contactInformationData);

            this.removeEvents('activateQuickActionsToggled');
            this.removeEvents('checkIfValueNotEmpty');

            if(!this._wasPanelPreviouslyOpen){
                this._wasPanelPreviouslyOpen = true;
                return;
            }
            if (this._checkBoxListInputGroup && this._checkBoxListInputGroup._fieldsProxies && this._checkBoxListInputGroup._fieldsProxies.length>0) {
                for (var i=0;i<this._checkBoxListInputGroup._fieldsProxies.length;i++) {
                    this._checkBoxListInputGroup._fieldsProxies[i].dispose();
                }
                this._checkBoxListInputGroup._fieldsProxies = [];
                this._createCheckBoxList();
            }
        },

        _onAllSkinPartsReady: function() {
            this.parent();
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._updateMobilePreview);
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._reportDataChangeToBI);
        },

        _updateCheckBoxProperties: function () {
            this._checkBoxProperties =  {
                NAVIGATION_MENU_CHECKBOX_PROPERTIES: {
                    spriteOffsetY: '0px',
                    title: this._translate('MOBILE_VIEW_PANEL_NAVIGATION_MENU_LABEL'),
                    checkBoxHasData: false,
                    textWhenNoDataAvailable: this._translate('MOBILE_VIEW_PANEL_NAVIGATION_MENU_DESCRIPTION'),
                    contactInformationDataField: null,
                    data: null,
                    showDetails: true,
                    commandToExecuteWhenLinkClicked: null,
                    quickActionField: 'navigationMenuEnabled',
                    enableCheckBox: true,
                    checkBoxToolTipId: null
                },
                PHONE_NUMBER_CHECKBOX_PROPERTIES: {
                    spriteOffsetY: '-18px',
                    title: this._translate('MOBILE_VIEW_PANEL_PHONE_NUMBER_LABEL'),
                    checkBoxHasData: true,
                    textWhenNoDataAvailable: this._translate('MOBILE_VIEW_PANEL_PHONE_NUMBER_ADD_YOURS'),
                    contactInformationDataField: 'phone',
                    data: this._contactInformationData.get('phone'),
                    showDetails: true,
                    commandToExecuteWhenLinkClicked: 'WEditorCommands.ShowContactInformation',
                    quickActionField: 'phoneEnabled',
                    enableCheckBox: this._contactInformationData.get('phone'),
                    checkBoxToolTipId: 'Mobile_preview_phone_checkbox_disabled_ttid'
                },
                EMAIL_ADDRESS_CHECKBOX_PROPERTIES: {
                    spriteOffsetY: '-36px',
                    title: this._translate('MOBILE_VIEW_PANEL_EMAIL_ADDRESS_LABEL'),
                    checkBoxHasData: true,
                    textWhenNoDataAvailable: this._translate('MOBILE_VIEW_PANEL_EMAIL_ADDRESS_ADD_YOURS'),
                    contactInformationDataField: 'email',
                    data: this._contactInformationData.get('email'),
                    showDetails: true,
                    commandToExecuteWhenLinkClicked: 'WEditorCommands.ShowContactInformation',
                    quickActionField: 'emailEnabled',
                    enableCheckBox: this._contactInformationData.get('email'),
                    checkBoxToolTipId: 'Mobile_preview_email_checkbox_disabled_ttid'
                },
                ADDRESS_CHECKBOX_PROPERTIES: {
                    spriteOffsetY: '-54px',
                    title: this._translate('MOBILE_VIEW_PANEL_BUSINESS_ADDRESS_LABEL'),
                    checkBoxHasData: true,
                    textWhenNoDataAvailable: this._translate('MOBILE_VIEW_PANEL_BUSINESS_ADDRESS_ADD_YOURS'),
                    contactInformationDataField: 'address',
                    data: this._contactInformationData.get('address'),
                    showDetails: true,
                    commandToExecuteWhenLinkClicked: 'WEditorCommands.ShowContactInformation',
                    quickActionField: 'addressEnabled',
                    enableCheckBox: this._contactInformationData.get('address'),
                    checkBoxToolTipId: 'Mobile_preview_address_checkbox_disabled_ttid'
                },

                SOCIAL_LINKS_CHECKBOX_PROPERTIES: {
                    spriteOffsetY: '-72px',
                    title: this._translate('MOBILE_VIEW_PANEL_SOCIAL_MEDIA_PROFILE_LABEL'),
                    checkBoxHasData: true,
                    textWhenNoDataAvailable: this._translate('MOBILE_VIEW_PANEL_SOCIAL_MEDIA_PROFILE_ADD_YOURS'),
                    contactInformationDataField: null,
                    data: null,
                    showDetails: false,
                    commandToExecuteWhenLinkClicked: 'WEditorCommands.ShowSocialMedia',
                    quickActionField: 'socialLinksEnabled',
                    enableCheckBox: this.resources.W.Editor.isSomeSocialMediaAdded(this._socialLinksData),
                    checkBoxToolTipId: 'Mobile_preview_social_links_checkbox_disabled_ttid'
                }
            };
        },

      _createFields: function() {
          this._getContactInformationAndSocialLinksData(function() {
                this._createHeaderSection();
                this.addBreakLine(8, '1px solid #D6D5C3', 8);
                this._createMainSection();
            }.bind(this));
        },

        _getContactInformationAndSocialLinksData: function(callback) {
            var that = this;
            this.resources.W.Data.getDataByQuery('#CONTACT_INFORMATION', function(contactInformationData) {
                that._contactInformationData = contactInformationData;
                that.resources.W.Data.getDataByQuery('#SOCIAL_LINKS', function(socialLinksData) {
                    that._socialLinksData = socialLinksData;
                    callback();
                });
            });
        },

        _createHeaderSection: function() {
             this.addBreakLine(8);
             this.addInputGroupField(function(panel){
                this.addLabel(this._translate('MOBILE_VIEW_PANEL_DESCRIPTION'));

                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(2, "5px");
                    this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover")
                        .bindToField('quickActionsMenuEnabled')
                        .addEvent('inputChanged', panel._onToggleActivateQuickActions);
                    this.addLabel(panel._getDisplayOrNotDisplayLabel(), {'height': '20px', 'font-size': '14px', 'color': '#686868'}, null, null, null, null)
                        .runWhenReady(function(logic){
                            panel._displayLabelLogic = logic;
                        }.bind(panel));
                }, 'skinless');
            }, 'skinless');
        },

        _onToggleActivateQuickActions: function() {
            var displayOrNotDisplayLabel =  this._getDisplayOrNotDisplayLabel();
            if (this._displayLabelLogic) {
                this._displayLabelLogic.setLabel(displayOrNotDisplayLabel);
            }
            this._enableOrDisableMainSectionGroup();

            this.fireEvent('activateQuickActionsToggled');

            if (!this._alreadyToggledInThePast) {
                this._alreadyToggledInThePast = true;
                this.fireEvent('checkIfValueNotEmpty');
            }

        },

        //tested
        _getDisplayOrNotDisplayLabel: function() {
            var quickActionsMenuEnabled = this._data.get('quickActionsMenuEnabled');
            var displayOrNotDisplayLabel = quickActionsMenuEnabled ? this._translate('MOBILE_VIEW_PANEL_DISPLAY_MOBILE_ACTION_BAR_ON_MOBILE_SITE') : this._translate('MOBILE_VIEW_PANEL_DONT_DISPLAY_MOBILE_ACTION_BAR_ON_MOBILE_SITE');
            return displayOrNotDisplayLabel;
        },

        //tested
        _enableOrDisableMainSectionGroup: function (logic) {
            this._mainSectionGroupLogic = this._mainSectionGroupLogic || logic;
            if (!this._mainSectionGroupLogic) {
                return;
            }

            if (this._data.get('quickActionsMenuEnabled')) {
                this._mainSectionGroupLogic.enable();
            }
            else {
                this._mainSectionGroupLogic.disable();
            }
        },

        _createMainSection: function() {
            this.addInputGroupField(function(panel){
                this.addBreakLine(5);
                this.addLabel(this._translate('MOBILE_VIEW_PANEL_MAIN_SECTION_DESCRIPTION'));
                this.addBreakLine(5);
                this.addInputGroupField(function(panel){
                    panel._mainSectionGroupInput = this;
                    this.setNumberOfItemsPerLine(2, '6px');
                    panel._createCheckBoxListSection();
                    panel._createMobileAppearanceSection();
                }, 'skinless');
            }, 'skinless')
            .runWhenReady(function(logic){
                this._enableOrDisableMainSectionGroup(logic);
            }.bind(this));

        },

         _createCheckBoxListSection: function() {
            this._mainSectionGroupInput.addInputGroupField(function(panel){
                panel._checkBoxListInputGroup = this;
                this.setNumberOfItemsPerLine(1, '0px');
                panel._createCheckBoxList();
            }, 'skinless');
        },

        _createCheckBoxList: function (panel) {
            this._updateCheckBoxProperties();
            this._createCheckBoxItem(this._checkBoxProperties.NAVIGATION_MENU_CHECKBOX_PROPERTIES);
            this._createCheckBoxItem(this._checkBoxProperties.PHONE_NUMBER_CHECKBOX_PROPERTIES);
            this._createCheckBoxItem(this._checkBoxProperties.EMAIL_ADDRESS_CHECKBOX_PROPERTIES);
            this._createCheckBoxItem(this._checkBoxProperties.ADDRESS_CHECKBOX_PROPERTIES);
            this._createCheckBoxItem(this._checkBoxProperties.SOCIAL_LINKS_CHECKBOX_PROPERTIES);
        },

         _createCheckBoxItem: function(checkBoxItemProperties) {
            this._checkBoxListInputGroup.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(3, '5px');
//                var checkBoxToolTipId = panel._getCheckBoxToolTipId(checkBoxItemProperties);
//                this.addCheckBoxField(null, checkBoxToolTipId, null, true, 'view').bindToField(checkBoxItemProperties.quickActionField)
                this.addCheckBoxField(null, null, true).bindToField(checkBoxItemProperties.quickActionField)
                .omitEnableDisableUpdate()
                .runWhenReady(function(checkBoxLogic) {
                    panel._updateCheckBoxToolTipId(checkBoxLogic, checkBoxItemProperties);

                    panel.addEvent('activateQuickActionsToggled', function(){
                        panel._disableCheckBox(checkBoxLogic, checkBoxItemProperties.enableCheckBox);
                        panel._updateCheckBoxToolTipId(checkBoxLogic, checkBoxItemProperties);
                    });
                    panel.addEvent('checkIfValueNotEmpty', function(){
                        if (checkBoxItemProperties.enableCheckBox) {
                            this._data.set(checkBoxItemProperties.quickActionField, true);
                        }
                    });

                    panel._disableCheckBox(checkBoxLogic, checkBoxItemProperties.enableCheckBox);
                });
                
                this.addIcon('icons/mobile-icons-sprite.png', {x: "0px", y: checkBoxItemProperties.spriteOffsetY}, {width: "18px", height: "18px"});
                
                this.addInputGroupField(function(panel){
                    this.addLabel(checkBoxItemProperties.title ,{'font-size': '14px', 'color': '#373737', padding: '0px'}, 'default', null, null, null, null, {'margin-bottom':'0px'});
                    panel._addDetailsField(this, checkBoxItemProperties);
                }, 'skinless');
            }, 'default', null, null, {width: "490px"}, null, null, null, {'padding': '12px'})
            .runWhenReady(function(group){
                if (group.getDataItem().get('quickActionsMenuEnabled')) {
                    group.enable();
                } else {
                    group.disable();
                }
            });
        },

        _updateCheckBoxToolTipId: function (checkBoxLogic, checkBoxItemProperties) {
            checkBoxLogic._toolTipAsQuestionMark = false;
            var checkBoxToolTipId;
            if (this._data.get('quickActionsMenuEnabled')) {
                checkBoxToolTipId = checkBoxItemProperties.enableCheckBox ? null : checkBoxItemProperties.checkBoxToolTipId;
            }
            else {
                checkBoxToolTipId = 'Mobile_view_panel_all_checkboxes_disabled_ttid';
            }
            checkBoxLogic.removeToolTip(checkBoxLogic.getViewNode());
            checkBoxLogic.addToolTip(checkBoxToolTipId, false, checkBoxLogic.getViewNode());
        },


        /**
         * Override AutoPanel function, don't enable all children on render
         * @private
         */
        //tested
        _updateChildrenState:function(){
            //Do Nothing
        },

        _disableCheckBox: function(checkBoxLogic, enable) {
            if (!enable) {
//                this.resources.W.Utils.callLater(function(){
                    checkBoxLogic.disable();
//                })
            }
        },

        _updateMobilePreview: function() {
            this._mobilePreview.setValue(this.getDataItem().getData());
            this._onToggleActivateQuickActions();

        },

        _reportDataChangeToBI: function(data, changedDataField, newValue, oldValue) {
            LOG.reportEvent(wixEvents.EDITOR_QUICK_ACTIONS_MODIFIED, {g1: changedDataField, c1: newValue[changedDataField].toString(), c2:oldValue[changedDataField].toString()});
        },

        _addDetailsField: function(targetInputGroup, checkBoxItemProperties) {
            var that = this;
            if (!checkBoxItemProperties.checkBoxHasData) {
                targetInputGroup.addLabel(checkBoxItemProperties.textWhenNoDataAvailable, {'font-size': '12px', 'color': '#999999'}, 'default', null, null, null, null, {'margin-bottom':'0px'});
            }

            else {
                var label, skinGroup;
                if (checkBoxItemProperties.showDetails && checkBoxItemProperties.data) {
                    label = checkBoxItemProperties.data;
                    skinGroup = 'withEditIcon';
                }
                else {
                    label = checkBoxItemProperties.textWhenNoDataAvailable;
                    skinGroup = null;
                }

                targetInputGroup.addInlineTextLinkField(undefined, undefined, label, undefined, undefined, undefined, skinGroup)
                    .addEvent(Constants.CoreEvents.CLICK, function() {
                        W.Commands.executeCommand(checkBoxItemProperties.commandToExecuteWhenLinkClicked, {closeCommand: "WEditorCommands.ShowMobileQuickActionsView"});
                    })
                    .runWhenReady(function(inlineTextLinkLogic) {
                        that.addEvent('activateQuickActionsToggled', function(){
                            inlineTextLinkLogic.enable();
                        });
                        inlineTextLinkLogic.enable();
                    });
            }

        },

        _createMobileAppearanceSection: function() {
            this._mainSectionGroupInput.addInputGroupField(function(panel){
                panel._appearanceInputGroup = this;
                panel._createColorSchemeSection();
                this.addBreakLine(0, '1px solid #D6D5C3', 0);
                panel._createMobileImageSection();
            }, 'default', null, null, null, null, null, null, {'padding': '4px 0px 4px 0px'});
        },

        _createColorSchemeSection: function() {
            this._appearanceInputGroup.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(2, '10px');
                this.addLabel(this._translate('MOBILE_VIEW_PANEL_COLOR_SCHEME'));
                var bg = 'radiobuttons/mobilePreview/color_scheme_sprite.png';
                var bgDimensions = {w: '42px', h: '34px'};
                var colorSchemeOptions = {
                    options: [
                        {value: 'light',   image: bg, dimensions: bgDimensions, icon: 'radiobuttons/mobilePreview/color_scheme_light.png'},
                        {value: 'dark', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/mobilePreview/color_scheme_dark.png'}
                    ],
                    display: 'inline',
                    defaultValue: 'light',
                    group: ''
                };
                this.addRadioImagesField(null,
                        colorSchemeOptions.options, colorSchemeOptions.defaultValue, colorSchemeOptions.group, colorSchemeOptions.display)
                        .bindToField('colorScheme');
            }, 'skinless', null, null, null, null, null, null, {'padding': '12px 12px 5px 12px'});
        },

        _createMobileImageSection: function() {
            this._appearanceInputGroup.addInputGroupField(function(panel){
                panel._mobilePreview = this.addMobilePreview();
                panel._updateMobilePreview();
            }, 'skinless', null, null, null, null, null, null, {'padding': '0px 9px 14px 11px'});
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_MOBILE_VIEW');
        }


    });

});
