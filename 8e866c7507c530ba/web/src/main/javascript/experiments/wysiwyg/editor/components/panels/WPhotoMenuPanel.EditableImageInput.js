define.experiment.component('wysiwyg.editor.components.panels.WPhotoMenuPanel.EditableImageInput', function (componentDefinition, strategy) {
    var def = componentDefinition;

    def.methods({
        _addImageField: function () {
            this.addInputGroupField(function(panel){
                this.addEditableImageInput(null, null, null, null, false,
                    this._translate('PHOTO_REPLACE_IMAGE'),
                    this._translate('IMAGEINPUTNEW_IMAGE_EFFECTS'),
                    this._translate('PHOTO_REVERT_IMAGE'),
                    '', '', panel._galleryConfigName, 'single_image', true, panel._mediaGalleryCallback, 'photos', null, 'panel', null, undefined).bindToDataItem(this._data);
            });

            this.addInputGroupField(function (panel) {
                var combo,
                    inputToDataHook = function (data) {
                        if (data === 'fitWidth' && panel._previewComponent.getHorizontalGroup()) {
                            combo.setValue('fill');
                            return 'fill';
                        }
                        return data;
                    };

                combo = this.addComboBoxField(this._translate('PHOTO_IMAGE_SCALING'), panel._getCropModesList(), undefined, '', 'Image_Settings_Image_Scaling_ttid').bindToProperty('displayMode').bindHooks(inputToDataHook);
            });
        }
    });
});
