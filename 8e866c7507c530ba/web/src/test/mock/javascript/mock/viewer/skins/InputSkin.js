define.skin('mock.viewer.skins.InputSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id': '$borderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '3px'},
            {'id': 'shadowColor', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultValue': '0,0,0,.1'}
        ]
    );
    def.html(
        '<div class="clearfix">' +
            '<label skinpart="label"></label>' +
            '<input skinpart="input" type="text" />' +
            '<div skinpart="message"></div>' +
        '</div>'
    );
    def.css(
        [
            'input%input% {width:100%; margin:0 0 5px 0; padding: 0 3px; line-height: 1.1em; height: 1.8em; font-size:1em; [$borderRadius]; border: 1px solid #b4b4b4; box-shadow: 0 1px 1px 0 [shadowColor] inset;}',
            '%input%:hover{border-color: #a3d9f6; cursor:pointer}',
            '%input%:focus{border-color: #19a0e9; cursor:text }',
            '[state~="hasLabel"] %label% {display:block; padding-bottom: 5px;}',
            '[disabled] %label% {opacity:0.5}',
            '[state~="invalid"] input%input%{background: #fdd; border-color: #900}',
            '[state~="invalid"] %message% {color: #600; font-size: .916em;}',
            //For IE8 placeholder polyfill
            'input%input%.isPlaceholder{color: #999;}'
        ]
    );
});
