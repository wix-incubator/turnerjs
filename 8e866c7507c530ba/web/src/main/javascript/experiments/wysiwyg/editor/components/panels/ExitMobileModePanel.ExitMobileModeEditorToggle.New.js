define.experiment.newComponent("wysiwyg.editor.components.panels.ExitMobileModePanel.ExitMobileModeEditorToggle.New", function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.binds(['_updateFieldsAccessibility', '_updateColorSelector', '_updatePanelFieldsDelayed', '_updateLabelFieldAfterDataChange']);//, '_onDialogOpened', '_onDialogClosing']);

    def.resources(['W.UndoRedoManager']);

    def.dataTypes(['LinkableButton']);

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._updateCurrentData();
        },

        _updateCurrentData: function(){
            var exitMobileButton = this._getExitMobileButton();
            if(exitMobileButton) {
                this._previewComponent = exitMobileButton.$logic;
                this._compData = this._previewComponent.getDataItem();
                this._compData.addEvent(Constants.DataEvents.DATA_CHANGED, this._updateLabelFieldAfterDataChange);
                this._compStyle = this._previewComponent.getStyle();
                this._compStyle.addEvent(Constants.StyleEvents.STYLE_CHANGED, this._updatePanelFieldsDelayed);
                this._oldCompStyle = Object.clone(this._compStyle.getRawData());
            } else {
                this._previewComponent = null;
                this._compData = null;
                this._compStyle = null;
                this._oldCompStyle = null;
            }
        },

        dispose: function() {
            this.parent();
            if(this._compStyle) {
                this._compData.removeEvent(Constants.DataEvents.DATA_CHANGED, this._updateLabelFieldAfterDataChange);
                this._compStyle.removeEvent(Constants.StyleEvents.STYLE_CHANGED, this._updatePanelFieldsDelayed);
            }
            this._previewComponent = null;
            this._compData = null;
            this._compStyle = null;
            this._oldCompStyle = null;
        },

        _createFields: function () {
            this._addButtonTextInput();
            this._addStyleInput();
            setTimeout(function(){this._updateFieldsAccessibility();}.bind(this), 200);
        },

        _addButtonTextInput: function() {
            this.addInputGroupField(function (panel) {
                panel._exitMobileLabel =
                    this.addInputField(this._translate("MOBILE_EXIT_MOBILE_BUTTON_PANEL_LINK_TEXT"),
                    this._translate("ExitMobileMode_DEFAULT_LABEL"),
                    null, null,
                    {validators: [panel._inputValidators.htmlCharactersValidator]},
                    null, null
                    );
                panel._exitMobileLabel.addEvent("inputChanged", function (e) {
                        var val = e.value;
                        if(val==="" || !val) {
                            val = panel._translate("ExitMobileMode_DEFAULT_LABEL");
                        }
                        this.resources.W.UndoRedoManager.startTransaction();
                        panel._compData.set("label", val);
                        this.resources.W.UndoRedoManager.endTransaction();
                    }.bind(panel));
            });
        },

        _addStyleInput: function() {
            this._exitMobileStyle = this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(1, "2px");
                // FONT =========================================================================
                panel._fontSelectorField = this.addFontSelectorField(
                    panel._translate("MOBILE_EXIT_MOBILE_BUTTON_PANEL_FONT"),
                    panel._compStyle ? panel._compStyle.getProperty("fnt") : "font_8"
                );
                panel._fontSelectorField.getHtmlElement().setStyle("margin-top", "-5px");
                panel._fontSelectorField.addEvent('fontChanged', function(event) {
                    var font = event ? event.value : "";
                    if (font){
                        var source = (font && font.indexOf("font_") == -1)? "value":"theme";
                        panel._compStyle.changePropertySource("fnt", font,source);
                    }
                    panel._reportStyleDataChange();
                }.bind(panel));

                this.addBreakLine(12);

                // COLOR ========================================================================
                panel._colorSelectorField = this.addColorSelectorField(
                    panel._translate("MOBILE_EXIT_MOBILE_BUTTON_PANEL_TEXT_COLOR")
                );
                panel._colorSelectorField.addEvent("colorChanged", function (event) {
                    panel._compStyle.setPropertyExtraParamValue("clr", "alpha", -1, true);
                    panel._compStyle.changePropertySource("clr", event.color.toString(), event.source);
                    panel._reportStyleDataChange();
                }.bind(panel));
                panel._colorSelectorField.getHtmlElement().setStyle("margin-top", "-3px");
                panel._colorSelectorField.runWhenReady(panel._updateColorSelector);
            });
        },

        _reportStyleDataChange: function () {
            var styleId = this._compStyle.getId();
            var skinClassName = this._previewComponent.getSkin().$className;
            var newStyle = Object.clone(this._compStyle.getRawData());
            var data;

            if (this.resources.W.Utils.areObjectsEqual(this._oldCompStyle, newStyle)) {
                return;
            }

            this.injects().UndoRedoManager.startTransaction();

            data = {
                data: {
                    changedComponentIds: [this._previewComponent.getComponentId()],
                    styleId: styleId,
                    oldState: {styleData: this._oldCompStyle, skinName: skinClassName},
                    newState: {styleData: newStyle, skinName: skinClassName}
                }
            };

            this.injects().Commands.executeCommand('WEditorCommands.ComponentAdvancedStyleChanged', data);
            this.injects().UndoRedoManager.endTransaction();
            this._oldCompStyle = newStyle;
        },

        _updateLabelFieldAfterDataChange: function() {
            var inputValue = this._exitMobileLabel.getValue("label");
            var dataValue = this._compData.get("label");
            var defaultValue = this._translate("ExitMobileMode_DEFAULT_LABEL");
            if(inputValue!==dataValue && dataValue!==defaultValue) {
                this._exitMobileLabel.setValue(dataValue);
            }
        },

        _updatePanelFieldsDelayed: function() {
            setTimeout(function(){
                this._updateColorSelector();
                this._updateFontSelector();
            }.bind(this), 200);
        },

        _updateColorSelector: function () {
            var colorValue = this._compStyle ? this._compStyle.getProperty("clr") : "color_13";
            var colorSource = this._compStyle ? this._compStyle.getPropertySource("clr") : "theme";
            if (this._colorSelectorField) {
                this._colorSelectorField.getHtmlElement().$logic.setColor(colorValue, colorSource);
                this._colorSelectorField.getHtmlElement().$logic.setAlpha(-1);
            }
        },

        _updateFontSelector: function () {
        },

        _getExitMobileButton: function () {
            var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
            var siteNode = viewer.getSiteNode();
            if(siteNode){
                var items = siteNode.getElements("div[comp=wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode]");
                return items.length > 0 ? items[0] : null;
            }
            return null;
        },

        _updateFieldsAccessibility: function() {
            var exitMobileButton = this._getExitMobileButton();
            if(exitMobileButton) {
                this._updateCurrentData();
                this._exitMobileLabel.enable();
                this._exitMobileStyle.enable();
                this._exitMobileLabel.setValue(this._compData.get("label"));
            } else {
                this._exitMobileLabel.disable();
                this._exitMobileStyle.disable();
                this._exitMobileLabel.setValue(this._translate("ExitMobileMode_DEFAULT_LABEL"));
            }
        }

    });
});
