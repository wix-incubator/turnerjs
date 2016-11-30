define.experiment.component('wysiwyg.editor.components.panels.ClipArtMenuPanel.EditableImageInput', function (componentDefinition, strategy) {
    var def = componentDefinition;

    def.methods({
        _createImageInput: function () {
            var thisPanel = this;

            this.addInputGroupField(function() {
                var changeImageCaption = this._translate('CLIP_ART_REPLACE_IMAGE'),
                    revertToOriginalCaption = this._translate('PHOTO_REVERT_IMAGE'),
                    editImageCaption = this._translate('IMAGEINPUTNEW_CLIPART_EFFECTS');

                this.addEditableImageInput(null, null, null, null, false, changeImageCaption, editImageCaption, revertToOriginalCaption, '', '', thisPanel._galleryConfigName, 'clipart', true, thisPanel._mediaGalleryCallback, 'clipart', null, 'panel', 'IMAGEINPUTNEW_CLIPART_EFFECTS', 'free').bindToDataItem(this._data);
            });
        },
        _createAspectRatioCheckbox: function () {
            var thisPanel = this;

            this.addInputGroupField(function () {
                var caption = this._translate('CLIP_ART_MAINTAIN_ASPECT_RATIO');
                this.addCheckBoxField(caption).
                     bindToProperty('displayMode').
                     bindHooks(
                         thisPanel._aspectRatioToDisplayMode,
                         thisPanel._displayModeToAspectRatio
                     );
            }).hideOnMobile();
        },
        _createLinkToField: function () {
            this.addInputGroupField(function(){
                this.addLinkField(this.injects().Resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO'),
                    this.injects().Resources.get('EDITOR_LANGUAGE', 'LINK_ADD_LABEL')).bindToDataItem(this.getDataItem());
            });
        },
        _createFields: function () {
            this._createImageInput();
            this._createAspectRatioCheckbox();
            this._createLinkToField();
            this.addAnimationButton();
        }
    });
});

