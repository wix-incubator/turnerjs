define.component('wysiwyg.common.components.rssbutton.editor.RSSButtonPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.resources(['W.Config', 'W.Data', 'W.Preview']);

    def.utilize(['wysiwyg.editor.utils.InputValidators']);

    def.dataTypes(['RssButton']);

    def.skinParts({
        uploadDefaultImage: {
            type: Constants.PanelFields.ImageField.compType,
            argObject: {
                galleryConfigID: 'social_icons',
                publicMediaFile: 'social_icons',
                i18nPrefix: 'single_image',
                labelText: 'ImageButton_DEFAULT_VIEW',
                buttonText: 'ImageButton_CHANGE_IMAGE',
                selectionType: 'single'
            },
            bindToData: 'image',
            bindHooks: ['_defaultImageInputToData', '_defaultImageDataToInput']
        },
        resetButtonSize: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'ImageButton_RESET_BUTTON_SIZE',
                command: 'WEditorCommands.SetSelectedCompPositionSize',
                commandParameter: { updateLayout:true },
                style: { textAlign: 'right' }
            }
        },
        altText: {
            type: Constants.PanelFields.Input.compType,
            bindToData: 'image',
            bindHooks: ['_altToData', '_dataToAlt'],
            hookMethod: '_addAltTextValidator',
            argObject: {
                labelText: 'ImageButton_ALT_TEXT',
                placeholderText: 'ImageButton_ALT_TEXT_EG'
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

        _addAltTextValidator: function (definition) {
            var validator = this._inputValidators.htmlCharactersValidator;
            definition.argObject.validatorArgs = { validators: [validator] };
        },

        _defaultImageInputToData: function (inputData) {
            this.updateOriginalSize(inputData);
            return this._handleImageInputToData(inputData, 'image');
        },

        _defaultImageDataToInput: function (ref) {
            return this._handleDataToImageInput(ref, true);
        },

        _altToData: function (alt) {
            var dataManager = this._getViewDataManager(),
                imageButtonData = this.getDataItem();

                var ref = imageButtonData.get('image'),
                    data = dataManager.getDataByQuery(ref);

                data.set('alt', alt);

            return ref;
        },

        _dataToAlt: function () {
            var dataManager = this._getViewDataManager(),
                imageButtonData = this.getDataItem();

                var ref = imageButtonData.get('image'),
                    data = dataManager.getDataByQuery(ref);


            return data.get('alt');
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
