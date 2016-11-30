define.component('wysiwyg.common.components.imagebutton.editor.ImageButtonPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.resources(['W.Config', 'W.Data', 'W.Preview']);

    def.utilize(['wysiwyg.editor.utils.InputValidators']);

    def.dataTypes(['ImageButton']);

    def.skinParts({
        uploadDefaultImage: {
            type: Constants.PanelFields.ImageField.compType,
            argObject: {
                galleryConfigID: 'clipart',
                publicMediaFile: 'clipart',
                i18nPrefix: 'single_image',
                labelText: 'ImageButton_DEFAULT_VIEW',
                buttonText: 'ImageButton_CHANGE_IMAGE',
                selectionType: 'single'
            },
            bindToData: 'defaultImage',
            bindHooks: ['_defaultImageInputToData', '_defaultImageDataToInput']
        },
        uploadHoverImage: {
            type: Constants.PanelFields.ImageField.compType,
            argObject: {
                galleryConfigID: 'clipart',
                publicMediaFile: 'clipart',
                i18nPrefix: 'single_image',
                labelText: 'ImageButton_MOUSEOVER_VIEW',
                buttonText: 'ImageButton_CHANGE_IMAGE',
                selectionType: 'single'
            },
            bindToData: 'hoverImage',
            bindHooks: ['_hoverImageInputToData', '_hoverImageDataToInput']
        },
        uploadActiveImage: {
            type: Constants.PanelFields.ImageField.compType,
            argObject: {
                galleryConfigID: 'clipart',
                publicMediaFile: 'clipart',
                i18nPrefix: 'single_image',
                labelText: 'ImageButton_CLICKED_VIEW',
                buttonText: 'ImageButton_CHANGE_IMAGE',
                selectionType: 'single'
            },
            bindToData: 'activeImage',
            bindHooks: ['_activeImageInputToData', '_activeImageDataToInput']
        },
        selectAnimation: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'ImageButton_CHOOSE_TRANSITION' },
            bindToProperty: 'transition',
            dataProvider:  function() {
                return [
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'ImageButton_TRANSITION_none'),  value: 'none' },
                    { label: W.Resources.get('EDITOR_LANGUAGE', 'IMAGEBUTTON_TRANSITION_DISSOLVE'), value: 'fade' }
                ];
            }
        },
        resetButtonSize: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'ImageButton_RESET_BUTTON_SIZE',
                command: 'WEditorCommands.SetSelectedCompPositionSize',
                commandParameter: { },
                style: { textAlign: 'right' }
            }
        },
        linkTo: {
            type: Constants.PanelFields.Link.compType,
            bindToData: '*',
            argObject: {
                labelText: 'ImageButton_LINK_TO',
                placeholderText: 'ImageButton_LINK_TO_EG'
            },
            hookMethod: '_linkToHookMethod'
        },
        altText: {
            type: Constants.PanelFields.Input.compType,
            bindToData: 'alt',
            bindHooks: ['_altToData', '_dataToAlt'],
            hookMethod: '_addAltTextValidator',
            argObject: {
                labelText: 'ImageButton_ALT_TEXT',
                placeholderText: 'ImageButton_ALT_TEXT_EG'
            }
        },
        clickToPreview: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'IMAGEBUTTON_HOVER_OR_CLICK_HERE',
                prefixText: 'IMAGEBUTTON_TO_SEE_HOW'
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._inputValidators = new this.imports.InputValidators();
        },

        _onAllSkinPartsReady: function () {
            this._addPreviewHandlers();
        },

        _addPreviewHandlers: function () {
            var clickToPreview = this._skinParts.clickToPreview,
                link = clickToPreview._skinParts.button.$view,
                comp = this._previewComponent;

            link.addNativeListener('mouseover', comp.hover);
            link.addNativeListener('mouseout',  comp.unhover);

            link.addNativeListener('mousedown',  comp.press);
            link.addNativeListener('mouseup',    comp.unpress);
        },

        _linkToHookMethod: function (definition) {
            definition.argObject.previewData = this.getDataItem();
            return definition;
        },

        _addAltTextValidator: function (definition) {
            var validator = this._inputValidators.htmlCharactersValidator;
            definition.argObject.validatorArgs = { validators: [validator] };
        },

        _defaultImageInputToData: function (inputData) {
            this.updateOriginalSize(inputData);
            return this._handleImageInputToData(inputData, 'defaultImage');
        },

        _defaultImageDataToInput: function (ref) {
            return this._handleDataToImageInput(ref, true);
        },

        _hoverImageInputToData: function (inputData) {
            return this._handleImageInputToData(inputData, 'hoverImage');
        },

        _hoverImageDataToInput: function (ref) {
            return this._handleDataToImageInput(ref);
        },

        _activeImageInputToData: function (inputData) {
            return this._handleImageInputToData(inputData, 'activeImage');
        },

        _activeImageDataToInput: function (ref) {
            return this._handleDataToImageInput(ref);
        },

        _altToData: function (alt) {
            var dataManager = this._getViewDataManager(),
                imageButtonData = this.getDataItem(),
                refNames = ['defaultImage', 'hoverImage', 'activeImage'];

            refNames.forEach(function (refName) {
                var ref = imageButtonData.get(refName),
                    data = dataManager.getDataByQuery(ref);

                data.set('alt', alt);
            });

            return alt;
        },

        _dataToAlt: function (data) {
            return data;
        },

        // Returning the same ref value (the ref itself wasn't changed, only the actual data item)
        _handleImageInputToData: function (imageInput, refName) {
            var ref = this._data.get(refName),
                dataManager = this._getViewDataManager(),
                dataItem = dataManager.getDataByQuery(ref);

            delete imageInput.id;
            delete imageInput.type;
            delete imageInput.alt;

            dataItem.setFields(imageInput);
            return ref;
        },

        // Convert the ref to data object and pass it to the image input
        _handleDataToImageInput: function (ref, isDefault) {
            var dataManager = this._getViewDataManager(),
                dataItem = dataManager.getDataByQuery(ref);

            if (isDefault) {
                this.updateOriginalSize(dataItem._data);
            }

            return Object.merge({}, dataItem._data);
        },

        _getViewDataManager: function () {
            return this.resources.W.Preview.getPreviewManagers().Data;
        },

        updateOriginalSize: function (data) {
            var buttonResetSize = this._skinParts.resetButtonSize,
                commandParameter = buttonResetSize.getCommandParameter();

            commandParameter.width = data.width;
            commandParameter.height = data.height;
        }
    });
});
