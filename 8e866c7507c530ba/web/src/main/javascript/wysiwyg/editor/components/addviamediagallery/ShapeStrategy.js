define.Class('wysiwyg.editor.components.addviamediagallery.ShapeStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BaseStrategy');

    def.fields({
        compType: 'addSvgShape',
        compClass: 'wysiwyg.viewer.components.svgshape.SvgShape',
        _fileName: ''
    });

    def.methods({
        extractMediaGalleryData: function (rawShapeData) {
            this._fileName = rawShapeData ? rawShapeData.fileName : '';

            if (!this._fileName || this._fileName.indexOf('_svgshape.v1.') === -1 ||
                this._fileName.lastIndexOf('.js') !== (this._fileName.length - 3)) {
                console.error('invalid shape data received from media gallery: ', rawShapeData);
            }

            return { width: 1, height: 1 };
        },
        _getSkinNameFromFileName: function (fileName) {
            //Example fileName: shapes/1d23a4adcc180e6168c9eb24b62ae238_svgshape.v1.CartIcon.js
            //Example skinName: svgshape.v1.svg_1d23a4adcc180e6168c9eb24b62ae238.CartIcon

            var regEx = /^shapes\/([a-z0-9]{32})_svgshape\.(v\d)\.([A-Z][A-Za-z0-9_]*)\.js$/i,
                partsArr = regEx.exec(fileName),
                md5Hash = partsArr[1],
                version = partsArr[2],
                name = partsArr[3];

            return (['svgshape', version, 'svg_' + md5Hash, name].join('.'));
        },
        applyToPreset: function (preset) {
            var skin = this._getSkinNameFromFileName(this._fileName);
            preset.compData.skin = skin;
            preset.compData.styleData.skin = skin;
        }
    });
});
