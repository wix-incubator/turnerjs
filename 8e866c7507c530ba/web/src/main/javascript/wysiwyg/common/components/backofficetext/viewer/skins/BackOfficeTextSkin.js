define.skin('wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

    def.skinParams([
        {
            "id": "txth",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_15"
        },
        {
            "id": "txt",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_15"
        },
        {
            "id": "fnt",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_5"
        },
        {
            "id": "trans",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "color 0.4s ease 0s"
        }
    ]);

    def.html(
        '<div skinPart="label"></div>'
    );

    def.css([
        '%label%   { [fnt] color:[txt]; white-space:nowrap; [trans] }',
        ':hover %label%   { color:[txth]; [trans] }'
    ]);
});