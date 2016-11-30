define.skin('wysiwyg.viewer.skins.horizontalmenu.RectangleHorizontalMenuSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.RectangleMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.RectangleMenuButtonSkin', styleGroup:'nav' }
    });
    def.skinParams([
        {'id':'bgc','type':Constants.SkinParamTypes.BG_COLOR,'defaultTheme':'color_10'} ,
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS,'defaultValue':'3px'},
        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW,'defaultValue':'0 -1px 1px rgba(0, 0, 0, 0.6) inset, 0 1px 1px rgba(255, 255, 255, 0.6) inset;'}

    ]);
    def.html('<div skinPart="itemsContainer"></div><div skinPart="moreButton"></div>');
    def.css([
        '%itemsContainer% { position:relative; overflow:hidden; [bgc][shd][rd]}'
    ]);
});