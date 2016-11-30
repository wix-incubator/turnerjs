define.experiment.newSkin('wysiwyg.editor.skins.inputs.EditableImageInputSkin.EditableImageInput', function (skinDefinition) {
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {
            "id": "webThemeDir",
            "type": "themeUrl",
            "defaultTheme": "WEB_THEME_DIRECTORY"
        },
        {
            "id": "transparentPattern",
            'type': Constants.SkinParamTypes.OTHER,
            'defaultValue': 'panel/transparent_pattern_10x10.png'
        }
    ]);

    def.compParts({
        "image": {
            "skin": "mobile.core.skins.ImageSkin"
        },
        "changeButton": {
            "skin": "wysiwyg.editor.skins.buttons.ButtonBaseBlueSkin"
        },
        "editButton": {
            "skin": "wysiwyg.editor.skins.buttons.ButtonBaseSkin"
        },
        "deleteButton": {
            "skin": "wysiwyg.editor.skins.buttons.ButtonBaseTextLinkSkin"
        },
        "revertButton": {
            "skin": "wysiwyg.editor.skins.buttons.ButtonBaseTextLinkSkin"
        }
    });

    def.html(
        '<label skinpart="label"></label>' +
        '<div class="imageButtonsPosition">' +
            '<div skinpart="imageContainer">' +
                '<div skinPart="image"></div>' +
            '</div>' +
            '<div class="buttonsContainer">' +
                '<div skinpart="changeButton"></div>' +
                '<div skinpart="editButton"></div>' +
                '<div skinpart="revertButton"></div>' +
                '<div skinpart="deleteButton"></div>' +
            '</div>' +
        '</div>'
    );

    def.css([
        '%.imageButtonsPosition% { position: relative; min-height: 64px; }',
        '[state~="hasLabel"] %.imageButtonsPosition% { margin-top: 6px; }',
        '[state~="hasLabel"] %label% { display: block; }',
        '[disabled] { opacity: 0.5 }',
        '%.buttonsContainer% { right: 0; top: 0; margin-left: 76px; }',

        '%changeButton% { margin-bottom: 7px; }',
        '%editButton% [skinpart=label] { height: 25px; line-height: 25px; }',
        '%revertButton% { margin-top: 4px; text-align: right; }',
        '%deleteButton% { text-align: right; display: none; }',
        '[state~="hasDelete"] %deleteButton% { color: #a00; display: block; }',

        '%imageContainer% { width: 65px; height: 65px; position: absolute; cursor: pointer; background-image:url([webThemeDir][transparentPattern]); }',
        '[state~="missingImage"] %imageContainer% { background: url([webThemeDir]add_image_thumb.png) no-repeat 50% 50%; }',
        '[state~="missingImage"] %image% { display: none; }',
        '[state~="missingImage"] %deleteButton% { color: #898989; display: none; }'
    ]);

});
