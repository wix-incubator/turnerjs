define.skin('wysiwyg.viewer.skins.horizontalmenu.TabsHorizontalMenuSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' }
    });
    def.skinParams([
        {'id':'c','type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_10'}
]);
    def.html('<div skinPart="itemsContainer"></div><div skinPart="moreButton"></div>');
    def.css([
        '%itemsContainer% { border-bottom:1px solid [c];}'
    ]);
});