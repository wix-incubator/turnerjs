define.component('wysiwyg.common.components.pinterestpinit.editor.PinterestPinItPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.utilize(['core.components.image.ImageUrlNew']);

    def.dataTypes(['PinterestPinIt']);

    def.propertiesSchemaType('PinterestPinItProperties');

    def.binds(['_dataChanged']);

    def.statics({
        _maxPreviewW: 200,
        _maxPreviewH: 250
    });

    def.skinParts({
        selectImage: {
            type: Constants.PanelFields.ImageField.compType,
            argObject: {
                labelText: 'PinterestPinIt_image',
                buttonText: 'PinterestPinIt_selectImage',
                galleryConfigID: 'photos',
                publicMediaFile: 'photos',
                i18nPrefix: 'single_image',
                mediaType: 'picture',
                selectionType: 'single'
            },
            bindToData: ['uri'],
            bindHooks: ['_imageInputToData', '_dataToImageInput']
        },
        description: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'PinterestPinIt_description'
            },
            bindToData: 'description',
            bindHooks: ['_descriptionInputToData', '_dataToDescriptionInput']
        },
        extraSets: {
            type: 'htmlElement',
            visibilityCondition: function(){
                return this.doesHaveRequiredData();
            }
        },
        counterPosition: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: {
                labelText: 'PinterestPinIt_counterPosition'
            },
            bindToProperty: 'counterPosition',
            dataProvider:  function(){
                var dataSchema = this._previewComponent.getComponentProperties().getFieldSchema('counterPosition'),
                    map = {
                        none: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_counterNotShown'),
                        above: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_counterAbove'),
                        beside: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_counterBeside')
                    };

                return this._populateSelectBox(dataSchema, map);
            }
        },
        size: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: {
                labelText: 'PinterestPinIt_size'
            },
            bindToProperty: 'size',
            dataProvider:  function(){
                var dataSchema = this._previewComponent.getComponentProperties().getFieldSchema('size'),
                    map = {
                        small: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_size_small'),
                        large: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_size_large')
                    };

                return this._populateSelectBox(dataSchema, map);
            }
        },
        color: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: {
                labelText: 'PinterestPinIt_color'
            },
            bindToProperty: 'color',
            dataProvider:  function(){
                var dataSchema = this._previewComponent.getComponentProperties().getFieldSchema('color'),
                    map = {
                        gray: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_color_gray'),
                        red: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_color_red'),
                        white: W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_color_white')
                    };

                return this._populateSelectBox(dataSchema, map);
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._imgUtils = new this.imports.ImageUrlNew();
        },

        _onAllSkinPartsReady: function(){
            var dataItem = this.getDataItem(),
                uri = dataItem.get('uri'),
                desc = dataItem.get('description');

            this._bindPreviewImg();
            this._pictureChanged(uri);
            this._descriptionChanged(desc);
            this.getDataItem().addEvent(Constants.DataEvents.DATA_CHANGED, this._dataChanged);
        },

        _dataChanged: function (dataItem, field, newValue, oldValue) {
            if (field == 'uri' || typeof field === 'object' && field.uri) {
                this._pictureChanged(newValue.uri);
            }
        },

        _populateSelectBox: function(dataSchema, labelMap){
            var dataFields = dataSchema.enum,
                fields = [];

            dataFields.forEach(function(v, k){
                fields.push({
                    label: labelMap[v],
                    value: v
                });
            });

            return fields;
        },

        doesHaveRequiredData: function(){
            return this._previewComponent._haveRequiredData();
        },

        _bindPreviewImg: function(){
            var preview = this._previewCont = this._skinParts.preview.querySelector('.frame'),
                img = this._previewImg = preview.querySelector('.img');

            img.addNativeListener('load', this._previewLoaded.bind(this, preview), false);
        },

        _pictureChanged: function(uri){
            if (uri) {
                var new_src = this._imgUtils.getImageUrlFromPyramidFirstTime({x: 200, y: 250}, uri).url;
                if (this._previewImg.src != new_src) {
                    this._previewImg.removeClass('animation end');
                    this._previewCont.removeClass('portrait'); //fix for chrome and opera 'display: inline-block' bug: inline-block div doesn't fit new child's width if class wasn't changed (chrome 32.0.1700.77, opera 19.0.1326.56)
                    this._previewImg.src = new_src;
                }
            } else {
                this._previewCont.addClass('empty');
                this._previewCont.removeClass('portrait');
                this._previewImg.src = '';
            }
        },

        _previewLoaded: function(preview, e){
            var img = e.currentTarget,
                h = img.naturalHeight,
                w = img.naturalWidth,
                dimensions = h / w;

            if (h < this._maxPreviewH){
                h = this._maxPreviewH;
                w = h / dimensions;
            }

            preview.removeClass('empty');

            if (h > w && w <= this._maxPreviewW){
                preview.addClass('portrait');
            } else{
                preview.removeClass('portrait');
            }

            img.addClass('animation end');
        },

        _descriptionChanged: function(text){
            var desc = this._skinParts.preview.querySelector('.desc');

            if (!text){
                text = W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_noDescription');
            }

            desc.innerHTML = text;
        },

        _imageInputToData: function (rawData) {
            return rawData;
        },

        _dataToImageInput: function (rawData) {
            return rawData;
        },

        _descriptionInputToData: function (rawData) {
            var data = _.escape(rawData);

            this._descriptionChanged(data);

            return data;
        },

        _dataToDescriptionInput: function (rawData) {
            this._descriptionChanged(rawData);

            return _.unescape(rawData);
        }

    });
});
