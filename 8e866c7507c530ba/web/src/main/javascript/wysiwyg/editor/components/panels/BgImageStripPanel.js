define.component('wysiwyg.editor.components.panels.BgImageStripPanel', function(componentDefinition){
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Resources']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.dataTypes(['Image']);
    def.propertiesSchemaType('BgImageStripProperties');
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this.trans = {
                'labelAddImage': this._translate('BG_STRIP_CUSTOMIZE'),
                'btnAddImage': this._translate('BG_STRIP_UPLOAD'),
                'btnChangeImage': this._translate('PHOTO_REPLACE_IMAGE'),
                'btnRemoveImage': this._translate('IMAGE_REMOVE'),
                'bgSize': this._translate('BG_STRIP_SIZE'),
                'bgRepeat': this._translate('BG_STRIP_REPEAT'),
                'bgPos': this._translate('BG_STRIP_POS')
            };
            this._imgField = null;
        },

        _updateDataOnDelete: function(){
            this.getDataItem().set('uri', '');
        },

        _updateFakeThumb: function(){
            var thumb = this._imgField._getTargetLogic()._skinParts.image.$view;

            setTimeout(function() {
                thumb.style.backgroundPosition = '0 0';
                thumb.style.backgroundSize     = '65px 65px';
            }, 100);

        },

        _isDisplayCondition: function () {
            var uri = this._data.get('uri');
            var isFake = ( /add\_image\_thumb\.png/.test(uri));
            var isEmpty = ( uri === '' );

            if (this._imgField && this._imgField._getTargetLogic()) {
                this._imgField._getTargetLogic()._skinParts.changeButton.setLabel((isEmpty || isFake) ? this.trans.btnAddImage : this.trans.btnChangeImage);

                if (isFake) {
                    this._updateFakeThumb();
                }

            }
            return !(isEmpty || isFake);
        },

        _fixStyle: function(logic){
            logic._skinParts.button._view.style.color = '#aa0000';
            logic._skinParts.button._view.style.fontSize = '0.83em';
            logic._view.style.textAlign = 'right';
            logic._view.style.marginTop = '-5px';
        },

        _createFields: function() {

            var panel = this;
            var schema = this.getComponentProperties()._schema;

            var bgPosition = _.map( schema.bgPosition.enum, function ( label, key ) {
                var icon_id = key%2 ? 'empty' : label.replace(' ', '_');
                return { value: label, dimensions: {w: '22px', h: '22px'}, icon: 'icons/bg_align_' + icon_id + '.png' };
            });

            this.addInputGroupField(function() {
                var img = this.addImageField(panel.trans.labelAddImage, null, null, panel.trans.btnAddImage, 'backgrounds', null, undefined, null, null, 'backgrounds', 'background', null, null, null, null, 'free').bindToDataItem(panel.getDataItem());
                panel._imgField = img;
                var btnDel = this.addInlineTextLinkField(null, null, panel.trans.btnRemoveImage).addEvent('click', _.bind(panel._updateDataOnDelete, panel));
                btnDel.runWhenReady(panel._fixStyle);
                this.addVisibilityCondition( btnDel, panel._isDisplayCondition.bind(panel));
            });

            var bgOptions1 = this.addInputGroupField(function() {
                var bgSizeOptions = [
                    {label: this._translate("BG_STRIP_SIZE_auto"), value: "auto"},
                    {label: this._translate("BG_STRIP_SIZE_cover"), value: "cover"},
                    {label: this._translate("BG_STRIP_SIZE_contain"), value: "contain"}
                ];

                this.addComboBoxField( panel.trans.bgSize, bgSizeOptions, schema.bgSize['default'] ).bindToProperty('bgSize');
            });
            var bgOptions2 = this.addInputGroupField(function() {

                this.setNumberOfItemsPerLine(2);
                this._addField( 'wysiwyg.editor.components.inputs.RadioButtons', this.getSkinFromSet('RadioButtons'), {
                    labelText: panel.trans.bgRepeat,
                    presetList: [
                        {label: this._translate("BG_STRIP_REPEAT_no_repeat"), value: "no-repeat"},
                        {label: this._translate("BG_STRIP_REPEAT_repeat_x"),  value: "repeat-x "},
                        {label: this._translate("BG_STRIP_REPEAT_repeat_y"),  value: "repeat-y "},
                        {label: this._translate("BG_STRIP_REPEAT_repeat"),    value: "repeat"}
                    ],
                    defaultValue: schema.bgRepeat['default']
                }).bindToProperty('bgRepeat');
                this._addField( 'wysiwyg.editor.components.inputs.RadioImages', 'wysiwyg.editor.skins.inputs.BgStripRadioImagesSkin', {
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
