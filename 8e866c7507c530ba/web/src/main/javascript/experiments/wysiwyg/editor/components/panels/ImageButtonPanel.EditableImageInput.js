define.experiment.component('wysiwyg.common.components.imagebutton.editor.ImageButtonPanel.EditableImageInput', function (def, strategy) {
     def.skinParts(strategy.merge({
         uploadDefaultImage: {
             type: Constants.PanelFields.ImageFieldNew.compType,
             skin: Constants.PanelFields.ImageFieldNew.skins["default"],
             argObject: {
                 galleryConfigID: 'clipart',
                 publicMediaFile: 'clipart',
                 i18nPrefix: 'single_image',
                 labelText: 'ImageButton_DEFAULT_VIEW',
                 editText: 'IMAGEINPUTNEW_IMAGE_EFFECTS',
                 buttonText: 'ImageButton_CHANGE_IMAGE',
                 selectionType: 'single',
                 hasDelete: false
             },
             bindToData: 'defaultImage',
             bindHooks: ['_defaultImageInputToData', '_defaultImageDataToInput']
         },
         uploadHoverImage: {
             type: Constants.PanelFields.ImageFieldNew.compType,
             skin: Constants.PanelFields.ImageFieldNew.skins["default"],
             argObject: {
                 galleryConfigID: 'clipart',
                 publicMediaFile: 'clipart',
                 i18nPrefix: 'single_image',
                 labelText: 'ImageButton_MOUSEOVER_VIEW',
                 editText: 'IMAGEINPUTNEW_IMAGE_EFFECTS',
                 buttonText: 'ImageButton_CHANGE_IMAGE',
                 selectionType: 'single',
                 hasDelete: false
             },
             bindToData: 'hoverImage',
             bindHooks: ['_hoverImageInputToData', '_hoverImageDataToInput']
         },
         uploadActiveImage: {
             type: Constants.PanelFields.ImageFieldNew.compType,
             skin: Constants.PanelFields.ImageFieldNew.skins["default"],
             argObject: {
                 galleryConfigID: 'clipart',
                 publicMediaFile: 'clipart',
                 i18nPrefix: 'single_image',
                 labelText: 'ImageButton_CLICKED_VIEW',
                 editText: 'IMAGEINPUTNEW_IMAGE_EFFECTS',
                 buttonText: 'ImageButton_CHANGE_IMAGE',
                 selectionType: 'single',
                 hasDelete: false
             },
             bindToData: 'activeImage',
             bindHooks: ['_activeImageInputToData', '_activeImageDataToInput']
         },
         addAnimation: {
             type: Constants.PanelFields.ButtonField.compType,
             argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
         }
     }));

     def.methods({
        _handleImageInputToData: function (imageInput, refName) {
            var ref = this._data.get(refName),
                dataManager = this._getViewDataManager(),
                dataItem = dataManager.getDataByQuery(ref);

            dataItem.setFields(_.omit(imageInput, 'id', 'type', 'alt'));
            return ref;
        }
     });
});

define.experiment.skin('wysiwyg.common.components.imagebutton.editor.skins.ImageButtonPanelSkin.EditableImageInput', function (def, strategy) {
    def.compParts(strategy.merge({
        addAnimation: { skin: Constants.PanelFields.ButtonField.skins.withArrow }
    }));

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="uploadDefaultImage"></div>' +
                '<div skinpart="uploadHoverImage"></div>' +
                '<div skinpart="uploadActiveImage"></div>' +
                '<div skinpart="selectAnimation"></div>' +
                '<div skinpart="clickToPreview"></div>' +
            '</fieldset>' +
            '<div skinpart="resetButtonSize"></div>' +
            '<fieldset>' +
                '<div skinpart="linkTo"></div>' +
                '<div skinpart="altText"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
         '</div>'
    );
});
