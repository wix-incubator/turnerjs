define.skin('wysiwyg.common.components.pinitpinwidget.viewer.skins.PinItPinWidgetSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY"}
    ]);

    def.html(
        '<iframe skinPart="iframe" src=""></iframe>'+
        '<div skinPart="errorDiv">'+
        '</div>'
    );

    def.css([
        '%iframe% {border: 0; background-color:transparent;width:100%;height:100%}',
        '[state~="noError"] %errorDiv% { display:none}',
        '[state~="error"] %errorDiv% {display:inline;position:absolute;height:274px;width:225px; background: transparent url([webThemeDir]pinWidget/pinWidgetError.png)}'
    ]);
});