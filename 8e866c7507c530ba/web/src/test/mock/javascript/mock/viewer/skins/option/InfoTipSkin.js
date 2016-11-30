define.skin('mock.viewer.skins.option.InfoTipSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'bgcolor',  'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'#fffedf'},
            {'id':'txtcolor', 'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'#656565'},
            {'id':'fnt', 'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'font-family: font-family: "Helvetica Neue", "HelveticaNeueW01-55Roma", "HelveticaNeueW02-55Roma", "HelveticaNeueW10-55Roma", Helvetica, Arial, sans-serif; font-size:12px; line-height:16px; '},
            {'id':'shd', 'type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);'},
            {'id':'rd',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'},
            {'id':'max', 'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'min-height:10px; min-width:10px; max-width:300px;'}
        ]
    );
    def.fields({
        _tags: []
    });
    def.html(
        '<div class="toolTipContainer">' +
            '<p skinPart="content"></p>' +
        '</div>'
    );
    def.css(
        '{  [fnt][rd][shd][max] color:[txtcolor]; background:[bgcolor]; position:absolute;  padding:5px; top:0px; left: 0px;}',

        'p {display:block; margin:0 0 5px 0; }',
        'strong, b, i, big { font-size:12px; }',
        '[state~="hidden"] {visibility:hidden!important;}'
    );
});
