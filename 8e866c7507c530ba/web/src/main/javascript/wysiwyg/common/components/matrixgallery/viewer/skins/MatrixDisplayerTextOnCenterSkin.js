define.skin('wysiwyg.common.components.matrixgallery.viewer.skins.MatrixDisplayerTextOnCenterSkin', function(SkinDefinition){

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.compParts({
        "image": {
            "skin": "mobile.core.skins.ImageSkin"
        }
    });

    def.skinParams([
        {
            "id": "borderColor",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15",
            "lang": "brd"
        },
        {
            "id": "bgHover",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15",
            lang: "bgh",
            "styleDefaults": {
                "alpha": 0.8
            }
        },
        {
            "id": "titleColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_18",
            "lang": "ttl"
        },
        {
            "id": "descColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_11",
            "lang": "descriptionTextColor"
        },
        {
            "id": "brw",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "0px"
        },
        {
            "id": "rd",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "0px"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);",
            "styleDefaults": { "boxShadowToggleOn": "false" }
        },
        {
            "id": "fntds",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_9"
        },
        {
            "id": "fntt",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_7"
        },
        {
            "id": "pos",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "position:absolute; top:0; bottom:0; left:0; right:0;"
        },
        {
            "id": "trans",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.4s ease 0s"
        },
        {
            "id": "webThemeDir",
            "type": "themeUrl",
            "defaultTheme": "WEB_THEME_DIRECTORY"
        },
        {
            "id": "linkColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_11",
            "lang": "linkColor"
        },
        {
            "id": "linkHoverColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_12",
            "lang": "lbgh"
        }
    ]);

    def.html(
            '<div skinPart="imageWrapper">' +
            '   <div class="imgBorder">' +
            '       <div skinPart="image"></div>' +
            '       <div skinPart="zoom">' +
            '       <div class="zoomPadding">' +
            '       <div class="table">' +
            '           <div class="inner">' +
            '               <div skinPart="title"></div>' +
            '               <div skinPart="description"></div>' +
            '               <a skinPart="link"><div class="linkIcon"></div></a>' +
            '          </div>' +
            '       </div>' +
            '       </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');

    def.css([
        '%imageWrapper% {[pos] [shd] [rd]}',
        '%.imgBorder% { [pos][rd] border:solid [brw] [borderColor]; background:[borderColor];}',
        '%image% { [rd] }',

        '%zoom% { [pos] background: [bgHover]; [rd] padding: 0; filter: alpha(opacity=0); opacity: 0; [trans] overflow:hidden; }',
        '%.zoomPadding% { overflow: hidden; position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; }',
        '%title% { [fntt] color: [titleColor]; white-space: pre-line; line-height: 1.3em; max-height: 3.9em; }',
        '%description% { color: [descColor]; [fntds] white-space: pre-line; line-height: 1.3em; max-height: 3.9em; }',
        '%link% { display:block; [fntds] position: relative; display: block; width: 30px; }',
        '%.linkIcon% { background-color: [linkColor]; background-image: url([webThemeDir]gallery/link_icon.png); background-repeat:no-repeat !important; background-position: center center !important;  width: 30px; height: 30px;}',
        '%.linkIcon%:hover { background-color: [linkHoverColor]; }',

        '%title%:not(:empty) + %description%:not(:empty) { margin-top: 5px; }',
        '[state~=link] %title%:not(:empty) ~ %link%  { margin-top: 13px; }',
        '[state~=link] %description%:not(:empty) + %link%  { margin-top: 13px; }',

        '[state~=alignLeft] %link% { margin: 0 auto 0 0;}',
        '[state~=alignCenter] %link% { margin: auto; }',
        '[state~=alignRight] %link% { margin: 0 0 0 auto; }',

        '[state~=alignLeft] %zoom% { text-align:left;}',
        '[state~=alignCenter] %zoom% { text-align:center; }',
        '[state~=alignRight] %zoom% { text-align:right; }',

        ':hover %zoom% { filter: alpha(opacity=100); opacity: 1; [trans] }',
        '%.table% { display: table; height: 100%; table-layout: fixed; width: 100%; }',
        '%.inner% { vertical-align: middle; display: table-cell; }'


    ]);

});