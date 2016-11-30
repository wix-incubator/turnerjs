define.skin('mock.viewer.skins.LayoutManagerContainerMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');
    def.skinParams([
        {
            "id": "$bgColor",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultValue": "0,0,0,1"
        },
        {
            "id": "$BorderRadius",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "10px"
        },
        {
            "id": "$boxShadow",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "inset 1px 1px 6px rgba(255, 255, 255, 0.9),inset -1px -1px 6px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.7)"
        }
    ]);

    def.html(
            '<div skinPart="bg">' +
            '</div>' +
            '<div skinPart="inlineContent">' +
            '</div>');

    def.css([
        '%bg% { position:absolute; top:0; bottom:0; left:0; right:0; [$BorderRadius] [$boxShadow] background-image:none; [$bgColor]}',
        '%inlineContent% { position:absolute; top:10px;bottom:10px; }'
    ]);



});