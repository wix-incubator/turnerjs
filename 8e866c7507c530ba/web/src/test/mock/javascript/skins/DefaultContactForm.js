define.skin('wysiwyg.viewer.skins.contactform.DefaultContactForm', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'fnt', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_7'},
            {'id':'bg1','type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
            {'id':'bg2','type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
            {'id':'txt1',  'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_15'},
            {'id':'txt2',  'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_15'},
            {'id':'brd',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
            {'id':'brw', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0px'},
            {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'},
            {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);'},
            {'id':'pos', 'type':Constants.SkinParamTypes.OTHER,  'defaultValue': ' position:absolute; top:0; bottom:0; left:0; right:0;'}
        ]
    );

    def.fields({
        hidePlaceholders: false
    });
    def.compParts();
    def.html(
        '<label skinPart="nameLabel"></label>' +
        '<input skinPart="name" type="text"/>' +
        '<label skinPart="emailLabel"></label>' +
        '<input skinPart="email" type="text"/>' +
        '<label skinPart="subjectLabel"></label>' +
        '<input skinPart="subject" type="text"/>' +
        '<label skinPart="messageLabel"></label>' +
        '<textarea skinPart="message"></textarea>' +
        '<span skinPart="notifications"></span>' +
        '<button skinPart="send"></button>'
    );
    def.css(
        [

            'input    { [rd][shd][bg1][fnt] color:[txt1]; padding:5px; border:[brw] solid [brd]; width:100%;}',
            'textarea { [rd][shd][bg1][fnt] color:[txt1]; padding:5px; border:[brw] solid [brd]; width:100%; [pos] resize:none;}',
            'button   { [rd][shd][bg2][fnt] color:[txt2]; padding:5px; border:none; margin:3px 0 0 10px; float:right; cursor:pointer; }',
            '%notifications% { padding:5px;  }'
        ]
    );
});
