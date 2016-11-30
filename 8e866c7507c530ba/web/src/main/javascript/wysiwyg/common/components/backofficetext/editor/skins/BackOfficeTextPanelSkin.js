define.skin('wysiwyg.common.components.backofficetext.editor.skins.BackOfficeTextPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({
        keyLabel:{skin:Constants.PanelFields.Label.skins["bold"]},
        changeStyle:{skin:Constants.PanelFields.ButtonField.skins.blueWithArrow},
        setAlignment:{skin:Constants.PanelFields.RadioImages.skins["default"]},
        setMargin:{skin:Constants.PanelFields.Slider.skins["default"]}
    });

    def.html(
        '<div skinPart="content">'+
            '<fieldset>' +
                '<div skinpart="keyLabel"></div>' +
            '</fieldset>' +
            '<fieldset skinpart="settingsPanel">' +
                '<div skinpart="setAlignment"></div>' +
                '<div skinpart="setMargin"></div>' +
            '</fieldset>'+
            '<fieldset>' +
                '<div skinpart="changeStyle"></div>' +
            '</fieldset>' +
         '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
    ]);
});