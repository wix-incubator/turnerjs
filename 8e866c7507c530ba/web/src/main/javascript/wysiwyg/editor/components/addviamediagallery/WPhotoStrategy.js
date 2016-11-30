define.Class('wysiwyg.editor.components.addviamediagallery.WPhotoStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BasePhotoStrategy');

    def.fields({
        compType: 'WPhoto',
        compClass: 'wysiwyg.viewer.components.WPhoto',
        options: {}
    });

    def.methods({
        applyToPreset: function (presetData) {
            var styleId = this.options.styleId;

            if (styleId === "wp1") {
                styleId = this._getStyleBasedOnImageType(presetData.compData.data.uri);
            }

            presetData.styleId = styleId;
        },
        _getStyleBasedOnImageType: function (imageUrl) {
            /*wp2 set the images with transparent background*/
            try {
                var urlArr = imageUrl.split(".");
                var fileExt = urlArr[urlArr.length - 1].toLowerCase();
                if (fileExt == "png" || fileExt == "gif") {
                    return "wp2";
                }
                return "wp1";
            } catch (e) {
                return "wp1";
            }
        }
    });
}); 
