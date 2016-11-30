define.component("wysiwyg.editor.components.panels.BackToTopButtonPanel", function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.resources(['W.EditorDialogs']);

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.DeletedComponentsListUpdated", this, this._handleDeletedComponents);
        },

        _createFields: function () {
            this._createAddButtonSwitch();
            this._createGIFAnimation();
            this._createPreviewLink();
        },

        _showHelp :function(){
            W.Commands.executeCommand("WEditorCommands.ShowHelpDialog", "BACK_TO_TOP_LearnMore");
        },

        _createAddButtonSwitch: function(){
            this.addInputGroupField(function(panel) {
                this.addBreakLine(4);
                this.addLabel(panel._translate("MOBILE_BACK_TO_TOP_BUTTON_PANEL_DESCRIPTION"), {}, "SubLabel");
                this.addBreakLine(5);
                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(2, "5px");
                    panel._backToTopOnOff = this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover").setValue(panel._getBackToTopButton());
                    this.addLabel(this._translate("MOBILE_BACK_TO_TOP_BUTTON_PANEL_CHECKBOX"), {}, null, null, null, null);
                }, "skinless");
                panel._backToTopOnOff.addEvent("inputChanged", function (e) {
                    if(e.value){
                        LOG.reportEvent(wixEvents.MOBILE_BACK_TO_TOP_BUTTON_TOGGLE, {"i1":1});
                        this._addBackToTopButton();
                    } else {
                        LOG.reportEvent(wixEvents.MOBILE_BACK_TO_TOP_BUTTON_TOGGLE, {"i1":0});
                        this._removeBackToTopButton();
                    }
                }.bind(panel));
                this.addBreakLine(7);
            }, "skinless");
        },

        _createGIFAnimation: function(){
            this.addInputGroupField(function(panel) {
                this.addBreakLine(6);
                this.addLabel("", {"text-align":"center"}, undefined, "backtotop/previewAnim2.gif", null, {"width":"89px", "height":"153px"}, null);
                this.addBreakLine(5);
            });
        },

        _createPreviewLink: function(){
            this.addInputGroupField(function(panel) {
                panel._previewLabel = this.addInlineTextLinkField(null,
                        this._translate("MOBILE_BACK_TO_TOP_BUTTON_PANEL_PREVIEW_LABEL_PRE"),
                        this._translate("MOBILE_BACK_TO_TOP_BUTTON_PANEL_PREVIEW_LABEL_LINK"),
                        this._translate("MOBILE_BACK_TO_TOP_BUTTON_PANEL_PREVIEW_LABEL_POST"),
                        false, null, "default")
                    .omitEnableDisableUpdate()
                    .addEvent(Constants.CoreEvents.CLICK, panel._switchToPreviewMode);
                panel._setFieldsAccessibility(panel._getBackToTopButton());
            }, "skinless");
        },

        _setFieldsAccessibility: function(bool) {
            var labelLogic = this._previewLabel.getHtmlElement().$logic;
            if(bool) {
                labelLogic.enable();
                labelLogic.$view.setStyle("color", "");
            } else {
                labelLogic.disable();
                labelLogic.$view.setStyle("color", "#BFBFBF");
            }
        },

        _switchToPreviewMode: function () {
            if(W.Config.env.$editorMode.toUpperCase() !== "PREVIEW") {
                LOG.reportEvent(wixEvents.MOBILE_BACK_TO_TOP_BUTTON_PREVIEW_CLICK);
                W.EditorDialogs.closeAllDialogs();
                W.Commands.executeCommand("WEditorCommands.WSetEditMode", {editMode:W.Editor.EDIT_MODE.PREVIEW}, null);
            }
        },

        _getBackToTopButton: function () {
            var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
            var items = viewer.getSiteNode().getElements("div[comp=wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton]");
            return items.length > 0 ? items[0] : null;
        },

        _addBackToTopButton: function () {
            W.UndoRedoManager.clear();
            this.resources.W.Commands.executeCommand("WEditorCommands.AddBackToTopButton", {});
            this._setFieldsAccessibility(true);
        },

        _removeBackToTopButton: function () {
            var button = this._getBackToTopButton();
            if(button){
                W.Editor.setSelectedComp(button.getLogic());
                W.Editor.doDeleteSelectedComponent(true, true);
                W.UndoRedoManager.clear();
            }
            this._setFieldsAccessibility(false);
        },

        _handleDeletedComponents: function () {
            var backToTopButton = this._getBackToTopButton();
            if(!backToTopButton) {
                this._backToTopOnOff.setValue(false);
            } else {
                this._backToTopOnOff.setValue(true);
            }
        },

        _onSubPanelOpened: function(panel){
            this._validateBackToTopDisplay();
        },

        _validateBackToTopDisplay:function(){
            if(!this._backToTopOnOff){
                return;
            }

            var backToTopButton = this._getBackToTopButton();
            this._backToTopOnOff.setValue(backToTopButton);
            this._setFieldsAccessibility(backToTopButton);
        }
    });
});
