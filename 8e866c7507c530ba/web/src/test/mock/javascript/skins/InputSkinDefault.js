define.skin('wysiwyg.viewer.skins.contactform.InputSkinDefault', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html(
        '<label skinpart="label"></label>' +
        '<input skinpart="input" type="text" />'+
        '<div skinpart="message"></div>'
    );
    def.css(
        ['input%input% { }',
            '[state~="hasLabel"] %label% {}',
            '[disabled] %label% {}',
            '[state~="invalid"] input%input%{ }',
            '[state~="invalid"] %message% {}'
            /*
             'input%input% {width:96%; margin:0 0 5px 0; padding: 4px; line-height: 26px; font-size:1em; line-height:18px; border:1px solid #ddd; border-top:1px solid #ccc; [$borderRadius]}',

             '[state~="hasLabel"] %label% {display:block; line-height:24px}',
             '[disabled] %label% {opacity:0.5}',
             '[state~="invalid"] input%input%{background: #fdd; border-color: #900}',
             '[state~="invalid"] %message% {color: #600; font-size: .916em;}',
             //For IE8 placeholder polyfill
             'input%input%.isPlaceholder{color: #999;}'  */
        ]
    );
});
