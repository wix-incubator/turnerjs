define.skin('mock.wysiwyg.viewer.skins.PageGroupSkin', function(SkinDefinition) {

	/** @type core.managers.skin.SkinDefinition */

	var def=SkinDefinition;

	def.inherits('mobile.core.skins.BaseSkin');

	def.skinParams([
	    {
	        "id": "tdr",
	        "type": Constants.SkinParamTypes.URL,
	        "defaultTheme": "BASE_THEME_DIRECTORY"
	    },
	    {
	        "id": "pos",
	        "type": Constants.SkinParamTypes.OTHER,
	        "defaultValue": "position:absolute; top:0; bottom:0; left:0; right:0;"
	    },
	    {
	        "id": "$overlayColor",
	        "type": "cssBgColor",
	        "defaultValue": "#000000AA",
	        "name": ""
	    }
	]);

	def.html(
		'<div skinPart="inlineContent">' +
		'</div>' +
		'<div skinPart="overlay">' +
		'</div>' +
		'<div skinPart="grid">' +
		'<div skinPart="gridHeader" class="horz">' +
		'</div>' +
		'<div skinPart="gridBodyRight" class="vert">' +
		'</div>' +
		'<div skinPart="gridBodyLeft" class="vert">' +
		'</div>' +
		'<div skinPart="gridFooter" class="horz">' +
		'</div>' +
		'</div>');

	def.css([

	]);

});