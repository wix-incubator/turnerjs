define.experiment.component('wysiwyg.viewer.components.BgImageStrip.EditableImageInput', function (def, strategy) {
    def.methods({
        _setBgImage: function () {
            var bgStyle = this._skinParts.bg.style;

            if (this._isFakeOrEmptyUri()) {
                bgStyle.backgroundImage = '';
                this._data.set('uri', 'none');
                this._updateMobileInputs(true);
            } else {
                this._updateMobileInputs(false);
                bgStyle.backgroundImage = 'url(' + this._baseUrl + this._data.get('uri') + ')';
            }
        },
        _updateMobileInputs: function (value) {
            if (this.EDITOR_META_DATA) {
                this.EDITOR_META_DATA.mobile.allInputsHidden = value;
            }
        },
        _isFakeOrEmptyUri: function () {
            var uri = this._data.get('uri');
            return !uri || uri === 'none';
        },
        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                uri: rawData.fileName,
                originalImageDataRef: null
            });
        },
    });
});
