define.skin('wysiwyg.editor.skins.inputs.SliderSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        input: {skin: "wysiwyg.editor.skins.inputs.TickerInputSkin"}
    });
    def.skinParams(
        [
            {'id': 'webThemeDir', 'type':'themeUrl', 'defaultTheme': 'WEB_THEME_DIRECTORY'}
        ]
    );
    def.html(
        '<label skinpart="label"></label>' +
        '<div class="clearfix sliderArea">' +
        '<div skinpart="sliderContainer">' +
        '<div skinpart="leftCorner"></div>' +
        '<div skinpart="rightCorner"></div>' +
        '<div skinpart="sliderKnob"></div>' +
        '</div>' +
        '<div skinpart="input">' +
        '</div>'
    );
    def.css(
        [
            '[state~="hasLabel"] %label% {display:block;}',
            '[disabled] %label% {opacity:0.5}',
            '%.sliderArea%{position:relative;}',
            '%input% {position:absolute; right: 0; top: 2px;}',

            '%sliderContainer% {position: relative; height:26px; margin: 0 5.4em 0 4px; background:url([webThemeDir]button/slider_sprite.png) repeat-x 0 -26px;}',
            '%leftCorner% {position:absolute; height:26px; width: 4px;  top:0; left: -4px; background:url([webThemeDir]button/slider_sprite.png) no-repeat 100% -52px;}',
            '%rightCorner%{position:absolute; height:26px; width: 4px;  top:0; right: -4px; background:url([webThemeDir]button/slider_sprite.png) no-repeat 0 -78px;}',
            '%sliderKnob% {position:absolute; height:26px; width: 26px; top:0; left: 50%; margin-left: -13px; background:url([webThemeDir]button/slider_sprite.png) no-repeat 50% 0; cursor:pointer}'

        ]
    );
});
