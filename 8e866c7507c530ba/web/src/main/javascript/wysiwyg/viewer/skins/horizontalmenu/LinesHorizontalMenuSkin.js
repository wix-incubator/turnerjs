define.skin('wysiwyg.viewer.skins.horizontalmenu.LinesHorizontalMenuSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.LinesHorizontalMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.LinesHorizontalMenuButtonSkin', styleGroup:'nav' }
    });
    def.skinParams([
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'},
        {'id':'bgc','type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color7'}
    ]);
    def.html('<div skinPart="itemsContainer"></div><div skinPart="moreButton"></div>');
    def.css([
        '%itemsContainer% { position:relative; overflow:hidden; min-height:30px; [bgc][rd] }'
    ]);
});