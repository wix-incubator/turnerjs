define.skin('wysiwyg.common.components.matrixgallery.viewer.skins.MatrixDisplayerSeparateTextBoxSkin', function(SkinDefinition){

    /** @type core.managers.skin.SkinDefinition */

    var def = SkinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.compParts({
        "image": {
            "skin": "mobile.core.skins.ImageSkin"
        }
    });

    def.statics({
        "heightDiff": 40
    });


    def.skinParams([
        { "id": "topPadding", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "13px", "range": { "min":0, "max":100}, "usedInLogic": true, lang: "spaceBetweenImageAndText" },
        { "id": "imgHeightDiff", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "80px", "range": { "min":50, "max":200}, "usedInLogic": true},
        { "id": "brw", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "0px" },
        { "id": "paddingSize", "type": Constants.SkinParamTypes.SIZE, "defaultValue": "10px", "range": { "min": 0, "max": 25} },
        { "id": "paddingBottom", "type": Constants.SkinParamTypes.SIZE, "defaultParam": "paddingSize" },
        { "id": "paddingTop", "type": Constants.SkinParamTypes.SIZE, "defaultParam": "paddingSize" },
        { "id": "rd", "type": Constants.SkinParamTypes.BORDER_RADIUS, "defaultValue": "0px" },
        { "id": "boxRd", "type": Constants.SkinParamTypes.BORDER_RADIUS, "defaultValue": "0px", lang: "TEXT_BOX_RADIUSES" },

        { "id": "bghClr", "type": Constants.SkinParamTypes.COLOR_ALPHA, "defaultTheme": "color_15", "styleDefaults": { "alpha": 0.8 }, lang: "bgh" },
        { "id": "brd", "type": Constants.SkinParamTypes.COLOR_ALPHA, "defaultTheme": "color_15"},
        { "id": "ttl2", "type": Constants.SkinParamTypes.COLOR, "defaultTheme": "color_15", "lang": "ttl" },
        { "id": "txt2", "type": Constants.SkinParamTypes.COLOR, "defaultTheme": "color_15", "lang": "descriptionTextColor" },
        { "id": "lnkClr", "type": Constants.SkinParamTypes.COLOR, "defaultTheme": "color_15", lang: "lnk" },
        { "id": "boxbg", "type": Constants.SkinParamTypes.COLOR_ALPHA, "defaultTheme": "color_12", "lang": "HTML_EDITOR_separateBoxColor" },
        //{ "id": "showMoreClr", "type": Constants.SkinParamTypes.COLOR, "defaultValue": "color_15", lang: "showMoreColor" },


        { "id": "fntt", "type": Constants.SkinParamTypes.FONT, "defaultTheme": "font_7" },
        { "id": "fntds", "type": Constants.SkinParamTypes.FONT, "defaultTheme": "font_9" },

        { "id": "pos", "type": Constants.SkinParamTypes.OTHER, "defaultValue": "position:absolute; top:0; bottom:0; left:0; right:0;" },
        { "id": "trans", "type": Constants.SkinParamTypes.TRANSITION, "defaultValue": "opacity 0.4s ease 0s" }
    ]);


    def.html(
        '<div skinPart="imageWrapper">' +
            '<div class="imgBorder">' +
            '   <div skinPart="image">' +
            '   </div>' +
            '</div>' +
        '   <div skinPart="zoom">' +
        '   </div>' +
        '</div>' +
        '<div class="panel" skinpart="panel">' +
        '   <div class="panelWrap">' +
        '       <h6 skinPart="title"></h6>' +
        '       <span skinPart="description"></span>' +
        '       <a skinPart="link">Go to link</a>' +
        '   </div>'+
        '</div>'
    );


    def.css([
        '{ [pos] overflow:hidden;}',
        '%imageWrapper% { [pos] [rd] background-color: [brd]}',
        '%.imgBorder% { [pos] [rd] border:[brd] solid [brw];}',
        '%image% { [rd] }',
        '%zoom% { position:absolute; top:[brw]; bottom:[brw]; left:[brw]; right:[brw]; background: [bghClr]; [rd] filter: alpha(opacity=0); opacity: 0; [trans] }',

        '%title% { [fntt] color: [ttl2]; white-space:nowrap; display: block;}',
        '%description% { color: [txt2]; [fntds] display: block; margin-top: 0.05em; }',
        '%link% {[fntds] display: block; color: [lnkClr]; position: static !important; margin-top: 0.2em; }',

        ' %.panel%     { [boxRd] height: [imgHeightDiff]; position:absolute; bottom:0; left:0; right:0; overflow:hidden; box-sizing:border-box; background: [boxbg]}',
        ' %.panelWrap% { position:absolute; left:[paddingSize]; right:[paddingSize]; top:[paddingTop]; bottom:[paddingBottom]; overflow:hidden; }',
        ' a          { position:absolute; left:[paddingSize]; right:[paddingSize]; bottom:[paddingSize]; overflow:hidden; text-decoration: underline !important; }',

        '[state~=alignLeft] %title% { text-align:left;}',
        '[state~=alignCenter] %title% { text-align:center; }',
        '[state~=alignRight] %title% { text-align:right; }',
        '[state~=alignLeft] %description% { text-align:left }',
        '[state~=alignCenter] %description% { text-align:center; }',
        '[state~=alignRight] %description% { text-align:right; }',
        '[state~=alignLeft] %link% { text-align:left; }',
        '[state~=alignCenter] %link% { text-align:center; }',
        '[state~=alignRight] %link% { text-align:right; }',

        ' [state~=noLink] %link%             { display: none; }',

        ' [state~=noLink] %.panelWrap%     { bottom:[paddingSize];}',

        ':hover %zoom% { filter: alpha(opacity=100); opacity: 1; [trans] }'
    ]);
});