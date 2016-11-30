define.skin('wysiwyg.common.components.anchor.viewer.skins.AnchorSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams(
        {'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0}
    );

    def.skinParams([
        { "id": "tdr", "type": Constants.SkinParamTypes.URL, "defaultTheme": "BASE_THEME_DIRECTORY"}
    ]);

    def.html(
        '<hr skinPart="line">' +
        '<div skinPart="anchorFrame">' +
            '<div skinPart="anchorName"></div>' +
        '</div>'
    );

    def.css([
        '{height: 21px;}',
        '[state~=visible] {visibility: visible !important;}',
        '[state~=hidden] {visibility: hidden !important;}',
        '%line% {border-top: 1px solid #35EAFF; margin: 0; border-bottom: 0px; width: 100%; position: absolute;}',
        '%anchorFrame% {height: 21px; width: 122px; position: absolute; overflow: hidden; background: transparent url([tdr]anchor_sprite.png) no-repeat 0 0;}',
        '%anchorName% {width: 75px; position: absolute; left: 35px; overflow: hidden; line-height: 21px; text-align: left; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;}'
    ]);
});