define.component('wysiwyg.editor.components.panels.WRichTextPanel', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onComponentScaleChanged']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['RichText', 'Text', 'StyledText']);
    def.resources(['W.UndoRedoManager']);

    def.methods({
        _createFields: function () {
            this.addInputGroupField(function () {
                this.addButtonField(null, this._translate('EDIT_RICH_TEXT')).addEvent(Constants.CoreEvents.CLICK, function () {
                    this.injects().Commands.executeCommand(Constants.EditorUI.START_EDIT_RICH_TEXT, {"source": "settingspanel"});
                });
            }).hideOnMobile();

            this.addAnimationButton().hideOnMobile();

            if (W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._splitPreviewComponentProperties();
                this._createMobilePanelFields();
            }
        },

        _splitPreviewComponentProperties: function() {
            var currentPanel = this.resources.W.Editor.getPanelsLayer();
            var arePropertiesSplit =  currentPanel.areComponentPropertiesSplit(this._previewComponent);
            if (arePropertiesSplit) {
                return;
            }
            currentPanel.splitMobilePropertiesFromDesktop(this._previewComponent);
            this._previewComponent.setIsPropertiesSavedInServer();
        },

        _createMobilePanelFields: function() {
            var panel = this;
            this.addInputGroupField(function() {
                panel._createTextSizeInputs(this);
                this.addBreakLine('15px');
                panel._createTextBrightnessInputs(this);
            });
        },

        _createTextSizeInputs: function(inputGroup) {
            var scaleValue = this._previewComponent.getScale(),
                textSizeBeforeScaling = this._previewComponent.getMostCommonTextSizeBeforeScaling(),
                that = this;

            this._previewComponent.addEvent('autoSized', this._onComponentScaleChanged);

            this._slider = inputGroup.addSliderFieldWithIcons(this._translate('MOBILE_TEXT_SCALING_LABEL'), 13, 150, 1, false, false, false, 'Mobile_text_scaling_ttid', 'px', 'button/small_textSize.png', 'button/bigIcon_textSize.png')
                .runWhenReady(function(slider) {
                    slider.setValue(textSizeBeforeScaling * scaleValue);
                    slider.on('sliderMouseUp', that, that._reportScalingBI);
                })
                .addEvent('inputChanged', function(evt){
                    if (evt.value !== this._getMostCommonTextCurrentSize()) {
                        scaleValue = evt.value/textSizeBeforeScaling;
                        W.Commands.executeCommand('WEditorCommands.WComponentTextSizeChanged', scaleValue);
                    }
                }.bind(this));
        },

        _getMostCommonTextCurrentSize: function() {
            var currentFontSize = Math.round(this._previewComponent.getMostCommonTextSizeBeforeScaling() * this._previewComponent.getScale());
            return Math.round(currentFontSize);
        },

        _onComponentScaleChanged: function(params) {
            var presentedTextSize;
            if (!params || !params.wasScaleChanged) {
                return;
            }
            presentedTextSize = this._getMostCommonTextCurrentSize();
            if (this._slider.getValue() !== presentedTextSize) {
                this._slider.setValue(presentedTextSize);
            }
        },

        _createTextBrightnessInputs: function(inputGroup) {
            var that = this;
            inputGroup.addSliderFieldWithIcons(this._translate('MOBILE_TEXT_BRIGHTNESS_LABEL'), 50, 150, 1, false, false, false, null, '%', 'button/small_brightness.png', 'button/big_brightness.png')
                .bindHooks(this._convertPercentageToNumber, this._convertNumberToPercentage)
                .runWhenReady(function(slider){
                    slider.on('sliderMouseUp', that, that._reportBrightnessBI);
                })
                .bindToProperty('brightness');
        },

        _convertPercentageToNumber: function(percentage) {
            return percentage / 100;
        },

        _convertNumberToPercentage: function(number) {
            return number * 100;
        },

        _reportScalingBI: function(params) {
            var value = params && params.data && params.data.value;
            LOG.reportEvent(wixEvents.MOBILE_TEXT_SCALING_CHANGED, {c1: value + 'px'});
        },

        _reportBrightnessBI: function(params) {
            var value = params && params.data && params.data.value;
            LOG.reportEvent(wixEvents.MOBILE_TEXT_BRIGHTNESS_CHANGED, {c1: value + '%'});
        },

        dispose: function() {
            this._previewComponent.removeEvent('autoSized', this._onComponentScaleChanged);
            this.parent();
        }
    });
});
