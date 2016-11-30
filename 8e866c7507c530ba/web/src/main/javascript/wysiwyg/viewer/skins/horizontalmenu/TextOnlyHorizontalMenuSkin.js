define.skin('wysiwyg.viewer.skins.horizontalmenu.TextOnlyHorizontalMenuSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TextOnlyMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TextOnlyMenuButtonSkin', styleGroup:'nav' }
    });
    def.html('<div skinPart="itemsContainer"></div><div skinPart="moreButton"></div>');
    def.css([
        '%itemsContainer% { position:relative; overflow:hidden;}'
    ]);
});