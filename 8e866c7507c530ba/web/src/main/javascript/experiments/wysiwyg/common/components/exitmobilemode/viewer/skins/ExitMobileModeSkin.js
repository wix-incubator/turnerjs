define.skin('wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */

    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {
            "id": "clr",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_13"
        },
        {
            "id": "fnt",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_8"
        },
        {
            "id": "pos",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "position:absolute; top:0px; bottom:0px; left:0px; right:0px;"
        }
    ]);

    def.html(
        '<a skinPart="link">' +
            '<span skinPart="label">' +
            '</span>' +
        '</a>');

    def.css([
        '%link%    { [pos]; opacity:0; }',
        '%label%   { [fnt]color:[clr]; white-space:nowrap; text-decoration:underline; }'
    ]);
});
