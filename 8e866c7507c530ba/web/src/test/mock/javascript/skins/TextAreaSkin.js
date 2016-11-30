define.skin('wysiwyg.editor.skins.inputs.TextAreaSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    })
    def.skinParams(
        [
            {'id': '$borderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '3px'},
            {'id': 'shadowColor', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultValue': '0,0,0,.1'}
        ]
    );
    def.html(
        '<label skinpart="label"></label>' +
            '<textarea skinpart="textarea"></textarea>' +
            '<div skinpart="message"></div>'
    );
    def.css(
        [
            'textarea%textarea% {width:100%; max-width:100%; min-width:100%; margin:0 0 5px 0; padding: 3px; line-height: 1.2em; font-size:1em; [$borderRadius]; border: 1px solid #b4b4b4; box-shadow: 0 1px 1px 0 [shadowColor] inset;}',
            '%textarea%:hover{border-color: #a3d9f6 }',
            '%textarea%:focus{border-color: #19a0e9 }',
            '[state~="hasLabel"] %label% {display:block; padding-bottom: 5px;}',
            '[disabled] %label% {opacity:0.5}'
        ]
    );
});
