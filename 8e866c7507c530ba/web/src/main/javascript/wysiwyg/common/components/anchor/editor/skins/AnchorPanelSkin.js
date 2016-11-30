define.skin('wysiwyg.common.components.anchor.editor.skins.AnchorPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);

    def.compParts({
        anchorName:{skin:Constants.PanelFields.Input.skins["default"]},
        info: {skin: Constants.PanelFields.Label.skins["default"]}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="anchorName"></div>' +
            '</fieldset>' +
            '<div skinpart="info"></div>'+
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%info% {font-size: 14px;}'
    ]);
});