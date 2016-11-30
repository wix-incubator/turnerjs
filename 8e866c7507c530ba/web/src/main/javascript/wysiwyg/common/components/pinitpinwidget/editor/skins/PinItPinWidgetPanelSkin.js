define.skin('wysiwyg.common.components.pinitpinwidget.editor.skins.PinItPinWidgetPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({
        pinId:  { skin:Constants.PanelFields.SubmitInput.skins.default},
        HowToGetlink:{ skin: Constants.PanelFields.InlineTextLinkField.skins["default"] }
    });

    def.html(        
    	'<div skinPart="content">' +
            '<fieldset>' +
               '<div skinpart="pinId"></div>' +

            '</fieldset>' +
            '<div skinpart="HowToGetlink"></div>' +
         '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%HowToGetlink% {font-size:14px; padding-left:2px; margin-top:14px;}'
    ]);
});