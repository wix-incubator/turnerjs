define.experiment.component('wysiwyg.editor.components.panels.MobileQuickActionsViewPanel.MobileActionsMenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.resources(['W.EditorDialogs']);

    def.methods({

        _onAllSkinPartsReady: strategy.after(function() {
            this._data.set("mobileActionsMenuType", "VER2");
        }),

        _createMainSection: function() {
            this.addInputGroupField(function(panel){
                this.addBreakLine(5);
                this.addLabel(this._translate('MOBILE_VIEW_PANEL_MAIN_SECTION_DESCRIPTION'));
                this.addBreakLine(5);
                this.addInputGroupField(function(panel){
                    panel._mainSectionGroupInput = this;
                    this.setNumberOfItemsPerLine(2, '6px');
                    panel._createMobileAppearanceSection();
                    panel._createCheckBoxListSection();
                }, 'skinless');
                this.addBreakLine(8);
                this.addInputGroupField(function(panel){
                    this.addLabel(this._translate('MOBILE_VIEW_PANEL_MAIN_SECTION_PREVIEW_NOTE'));
                }, 'skinless');

            }, 'skinless')
                .runWhenReady(function(logic){
                    this._enableOrDisableMainSectionGroup(logic);
                }.bind(this));

        },

        _switchToPreviewMode: function () {
            if(W.Config.env.$editorMode.toUpperCase() !== "PREVIEW") {
                W.EditorDialogs.closeAllDialogs();
                W.Commands.executeCommand("WEditorCommands.WSetEditMode", {editMode:W.Editor.EDIT_MODE.PREVIEW}, null);
            }
        },

        _updateMobilePreview: function() {
            this._mobilePreview.getHtmlElement().$logic.updateQuickActionsData(this.getDataItem().getData());
        },

        _createMobileAppearanceSection: function() {
            this._mainSectionGroupInput.addInputGroupField(function(panel){
                panel._appearanceInputGroup = this;
                panel._createMobileImageSection();
            }, 'skinless', null, null, null, null, null, null, {}); //{'padding': '4px 0px 4px 0px'});
        },

        _createMobileImageSection: function() {
            this._appearanceInputGroup.addInputGroupField(function(panel){
                panel._mobilePreview = this.addMobileActionsMenuPreviewField(this.getDataItem().getData(), 1.4);
                panel._updateMobilePreview();
            }, 'skinless', null, null, null, null, null, null, {'padding': '0px 9px 14px 11px'});
        },

        _createColorSchemeSection: strategy.remove()
    });

});
