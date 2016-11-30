define.skin('wysiwyg.common.components.domainsearchbar.editor.skins.DomainSearchBarPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({});

    def.html(
            '<div skinPart="content">' +
            '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
    ]);
});