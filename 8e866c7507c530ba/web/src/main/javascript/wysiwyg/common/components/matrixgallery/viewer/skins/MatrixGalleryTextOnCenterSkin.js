define.skin('wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGalleryTextOnCenterSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def = SkinDefinition;

    def.statics({
        "heightDiff": 25
    });

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({
        'hidden'      : false,
        'index'       : 1,
        'description': 'Text On Center'
    });

    def.compParts({
        "imageItem": {
            "skin": "wysiwyg.common.components.matrixgallery.viewer.skins.MatrixDisplayerTextOnCenterSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        {
            "id": "fntds",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_9"
        },
        {
            "id": "showMoreColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_11",
            "lang": "showMoreColor"
        }
    ]);

    def.html(
            '<div skinPart="itemsContainer">' +
            '</div>' +
            '<div class="pos">' +
            '<div skinPart="showMore" hightDiff="true">' +
            'Show More</div>' +
            '</div>');

    def.css([
        '%.pos% { height: 2.3em; position:absolute; right:0; bottom:0; left:0; text-align:center; }',
        '%showMore% { cursor: pointer; display:inline-block; line-height: 2.3em !important;  padding: 0 10px; text-decoration: underline !important; color:[showMoreColor]; [fntds] }',
        '%itemsContainer% { position: absolute; left: 0; right: 0; top: 0; bottom: 2.3em; }',
        '%showMore%:hover { }',
        '[state~=fullView] %showMore% { display: none }'
    ]);

});