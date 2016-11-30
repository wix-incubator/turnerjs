define.experiment.skin('wysiwyg.common.components.verticalmenu.editor.skins.VerticalMenuPanelSkin.CustomMenu', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({
        editMenu: {skin: Constants.PanelFields.ButtonField.skins.blueWithArrow},
        connectedTo: {skin: Constants.PanelFields.Label.skins["default"]},
        menuName: {skin: Constants.PanelFields.Label.skins["default"]},
        detach: {skin: Constants.PanelFields.InlineTextLinkField.skins["default"]},
        menuItemsAlignment:{skin:Constants.PanelFields.RadioImages.skins["default"]},
        subMenuOpenSide: {skin: Constants.PanelFields.RadioButtons.skins["default"] },
        changeStyle:{skin:Constants.PanelFields.ButtonField.skins.blueWithArrow},
        addAnimation:{skin:Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(        
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div>' +
                    '<div skinpart="connectedTo" class="inline"></div>' +
                    '<div skinpart="menuName" class="inline"></div>' +
                '</div>' +
                '<div skinpart="editMenu"></div>' +
                '<div skinpart="detach"></div>' +
            '</fieldset>' +
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
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%.inline% {display: inline-block;}',
        '%menuName% {margin-left: 5px}',
        '%detach% {text-align: right}'
    ]);
});