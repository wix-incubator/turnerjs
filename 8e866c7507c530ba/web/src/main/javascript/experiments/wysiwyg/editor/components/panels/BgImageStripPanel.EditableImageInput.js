define.experiment.component('wysiwyg.editor.components.panels.BgImageStripPanel.EditableImageInput', function (def, strategy) {
    def.methods({
        initialize: strategy.after(function () {
            this.trans.btnEditImage = this._translate('IMAGEINPUTNEW_IMAGE_EFFECTS');
        }),
        _isDisplayCondition: function () {
            var data = this.getDataItem();
                uri = data && data.get('uri');

            return data && uri && uri !== 'none';
        },
        _fixStyle: function () {},
        _updateDataOnDelete: function () {},
        _createFields: function () {
            var panel = this;
            var schema = this.getComponentProperties()._schema;

            var bgPosition = _.map( schema.bgPosition["enum"], function ( label, key ) {
                var icon_id = key%2 ? 'empty' : label.replace(' ', '_');
                return { value: label, dimensions: {w: '22px', h: '22px'}, icon: 'icons/bg_align_' + icon_id + '.png' };
            });

            /**
             * Adding startingTab parameter to addImageField()
             */
            this.addInputGroupField(function() {
                panel._imgField = this.addEditableImageInput(
                    panel.trans.labelAddImage,
                    null, null, null, true,
                    panel.trans.btnChangeImage,
                    panel.trans.btnEditImage,
                    panel.trans.revertToOriginal,
                    panel.trans.btnRemoveImage,
                    panel.trans.btnAddImage,
                    'backgrounds', 'background',
                    null, null,
                    'backgrounds', null,
                    null, null, 'free'
                ).bindToDataItem(panel.getDataItem());
            });

            var bgOptions1 = this.addInputGroupField(function() {
                var bgSizeOptions = [
                    { label: this._translate("BG_STRIP_SIZE_auto"), value: "auto" },
                    { label: this._translate("BG_STRIP_SIZE_cover"), value: "cover" },
                    { label: this._translate("BG_STRIP_SIZE_contain"), value: "contain" }
                ];

                this.addComboBoxField( panel.trans.bgSize, bgSizeOptions, schema.bgSize['default'] ).bindToProperty('bgSize');
            });

            var bgOptions2 = this.addInputGroupField(function() {
                this.setNumberOfItemsPerLine(2);

                this._addField( 'wysiwyg.editor.components.inputs.RadioButtons', this.getSkinFromSet('RadioButtons'), {
                    labelText: panel.trans.bgRepeat,
                    presetList: [
                        { label: this._translate("BG_STRIP_REPEAT_no_repeat"), value: "no-repeat" },
                        { label: this._translate("BG_STRIP_REPEAT_repeat_x"),  value: "repeat-x " },
                        { label: this._translate("BG_STRIP_REPEAT_repeat_y"),  value: "repeat-y " },
                        { label: this._translate("BG_STRIP_REPEAT_repeat"),    value: "repeat" }
                    ],
                    defaultValue: schema.bgRepeat['default']
                }).bindToProperty('bgRepeat');

                this._addField(
                    'wysiwyg.editor.components.inputs.RadioImages',
                    'wysiwyg.editor.skins.inputs.BgStripRadioImagesSkin',
                    {
                        labelText: panel.trans.bgPos,
                        presetList: bgPosition,
                        defaultValue: schema.bgPosition['default']
                    }).bindToProperty('bgPosition');
            });

            this.addVisibilityCondition( bgOptions1, this._isDisplayCondition.bind(this));
            this.addVisibilityCondition( bgOptions2, this._isDisplayCondition.bind(this));

            this.addStyleSelector();
            this.addAnimationButton();
        }
    });
});
