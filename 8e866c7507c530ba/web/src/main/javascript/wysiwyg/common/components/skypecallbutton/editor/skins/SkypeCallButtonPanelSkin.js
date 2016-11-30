define.skin('wysiwyg.common.components.skypecallbutton.editor.skins.SkypeCallButtonPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" }
    ]);

    def.compParts({
        enterSkypeName: { skin: Constants.PanelFields.SubmitInput.skins.default         },
        importantNote: { skin: Constants.PanelFields.Label.skins.default               },
        chooseButton: { skin: Constants.PanelFields.ComboBox.skins.default            },
        chooseColor: { skin: Constants.PanelFields.ComboBox.skins.default            },
        chooseSize: { skin: Constants.PanelFields.ComboBox.skins.default            },
        donthave: { skin: Constants.PanelFields.InlineTextLinkField.skins.default },
        addAnimation: {skin: Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="enterSkypeName"></div>' +
            '</fieldset>' +
            '<div skinpart="importantNote"></div>' +
            '<fieldset>' +
                '<div skinpart="chooseButton"></div>' +
                '<div skinpart="chooseColor"></div>' +
                '<div skinpart="chooseSize"></div>' +
            '</fieldset>' +
            '<div skinpart="donthave"></div>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%importantNote% .bold { font-weight: bold; }',
        '%importantNote% .hoverable { color: #379ACF; border-bottom: dotted 1px; cursor: help; }',
        '%importantNote% .rollover { display: none; position: absolute; z-index: 1; margin-top: 20px; left: 10px; width: 519px; height: 346px; ' +
            'border: 2px solid white; box-shadow: 0 2px 3px rgba(0,0,0,0.4); ' +
            'background: transparent url([webThemeDir]skypecallbutton/skype-tooltip.jpg) }',
        '%importantNote% .hoverable:hover+.rollover { display: inline-block; }',
        '%donthave% { margin: 10px 0 }',
        '%donthave% a:hover { text-decoration: underline; }'
    ]);
});
