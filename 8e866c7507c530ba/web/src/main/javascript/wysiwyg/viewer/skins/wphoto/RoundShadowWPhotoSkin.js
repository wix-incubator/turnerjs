define.skin('wysiwyg.viewer.skins.wphoto.RoundShadowWPhotoSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'brc','type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_1'},
        {'id':'pos','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute; top:0; bottom:0; left:0; right:0;'},
        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 0 3px rgba(0, 0, 0, 0.5);'},
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0.6em 0.6em 0.6em 0.6em'}
    ]);
    def.html(
        '<div skinPart="wrp">'+
        '<div skinPart="img" skin="mobile.core.skins.ImageSkin"></div>' +
        '</div>'
    );
    def.css([
        '%wrp% {[rd][pos][shd] border:3px solid [brc];background-color:[brc]; overflow:hidden;}',
        '%img% {[rd] height:100%;}'

    ]
    );
});