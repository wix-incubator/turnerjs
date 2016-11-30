define.skin('wysiwyg.common.components.verticalmenu.editor.skins.VerticalMenuPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({
        menuItemsAlignment:{skin:Constants.PanelFields.RadioImages.skins["default"]},
        subMenuOpenSide: {skin: Constants.PanelFields.RadioButtons.skins["default"] },
        changeStyle:{skin:Constants.PanelFields.ButtonField.skins.blueWithArrow},
        addAnimation:{skin:Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(        
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="menuItemsAlignment"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="subMenuOpenSide"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="changeStyle"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
         '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
    ]);
});