define.skin('wysiwyg.common.components.imagebutton.editor.skins.ImageButtonPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" },
        { "id": "$BorderRadius", "type": Constants.SkinParamTypes.BORDER_RADIUS, "defaultValue": "5px" }
    ]);
	
	def.compParts({
        uploadDefaultImage: { skin: Constants.PanelFields.ImageField.skins.default          },
        uploadHoverImage:   { skin: Constants.PanelFields.ImageField.skins.default          },
        uploadActiveImage:  { skin: Constants.PanelFields.ImageField.skins.default          },
        clickToPreview:     { skin: Constants.PanelFields.InlineTextLinkField.skins.default },
        resetButtonSize:    { skin: Constants.PanelFields.InlineTextLinkField.skins.default },
        linkTo:             { skin: Constants.PanelFields.Input.skins.default               },
        altText:            { skin: Constants.PanelFields.Input.skins.default               },
        selectAnimation:    { skin: Constants.PanelFields.ComboBox.skins.default            },
        addAnimation:       { skin: Constants.PanelFields.ButtonField.skins.withArrow       }
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="uploadDefaultImage"></div>' +
                '<div skinpart="uploadHoverImage"></div>' +
                '<div skinpart="uploadActiveImage"></div>' +
                '<div skinpart="selectAnimation"></div>' +
                '<div skinpart="clickToPreview"></div>' +
            '</fieldset>' +
            '<div skinpart="resetButtonSize"></div>' +
            '<fieldset>' +
                '<div skinpart="linkTo"></div>' +
                '<div skinpart="altText"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
         '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%uploadDefaultImage% { margin-bottom: 10px; }',
        '%uploadHoverImage%   { margin-bottom: 10px; }',
        '%uploadActiveImage%  { margin-bottom: 10px; }',
        '%selectAnimation%    { margin-bottom: 10px; }',
        '%resetButtonSize%    { margin-bottom: 10px; }'
    ]);
});
