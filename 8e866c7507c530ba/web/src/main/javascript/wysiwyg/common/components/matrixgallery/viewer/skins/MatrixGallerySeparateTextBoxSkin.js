define.skin('wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGallerySeparateTextBoxSkin', function(SkinDefinition){

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.statics({
        "heightDiff": 40
    });

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({
        'hidden'      : false,
        'index'       : 0,
        'description': 'Separate Text Box Gallery'
    });

    def.compParts({
        "imageItem": {
            "skin": "wysiwyg.common.components.matrixgallery.viewer.skins.MatrixDisplayerSeparateTextBoxSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        { "id": "fntt", "type": Constants.SkinParamTypes.FONT, "defaultTheme": "font_7" },
        { "id": "fntds", "type": Constants.SkinParamTypes.FONT, "defaultTheme": "font_9" },
        { "id": "boxbg", "type": Constants.SkinParamTypes.COLOR, "defaultTheme": "color_12", "lang": "boxColor" },
        { "id": "showMoreClr", "type": Constants.SkinParamTypes.COLOR, "defaultTheme": "color_13", lang: 'showMoreColor' },
        //{ "id": "topPadding", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "10px", "range": { "min":0, "max": 50 }, "usedInLogic": true, lang: "spaceBetweenImageAndText" },
        { "id": "imgHeightDiff", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "80px", "range": { "min":5, "max": 200}, "usedInLogic": true},
        { "id": "paddingSize", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "10px", "range": { "min": 0, "max": 25} },
        { "id": "topPadding", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "13px", "range": { "min":0, "max":100}, "usedInLogic": true, lang: "spaceBetweenImageAndText" }
    ]);

    def.html(
            '<div skinPart="itemsContainer">' +
            '</div>' +
            '<div skinPart="showMore">' +
            'Show More</div>');


    def.css([
        '%showMore% { color:[showMoreClr]; [fntds] cursor:pointer; text-decoration: underline !important; height:30px; line-height:30px; position:absolute; bottom:0px; left:35%; right:35%; text-align:center; }',
        '[state~=fullView] %showMore% { display: none; }'
    ]);
});