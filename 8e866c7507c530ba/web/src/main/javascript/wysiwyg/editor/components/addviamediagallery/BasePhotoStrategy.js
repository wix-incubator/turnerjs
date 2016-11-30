define.Class('wysiwyg.editor.components.addviamediagallery.BasePhotoStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BaseStrategy');

    def.statics({
        MAX_IMG_WIDTH: 600
    });

    def.methods({
        extractMediaGalleryData: function (rawData) {
            return {
                description: rawData.description || "",
                height: rawData.height,
                width: rawData.width,
                uri: rawData.fileName,
                title: "",
                alt: ""
            };
        },
        computeLayout: function (rawData) {
            var layout = this.parent(rawData);

            if (layout.width > this.MAX_IMG_WIDTH) {
                layout.height *= this.MAX_IMG_WIDTH / layout.width;
                layout.width = this.MAX_IMG_WIDTH;
            }

            layout.width = Math.max(1, Math.round(layout.width));
            layout.height = Math.max(1, Math.round(layout.height));

            return layout;
        }
    });
});
