define.skin('wysiwyg.common.components.packagepicker.viewer.skins.PackagePickerSkin', function(skinDefinition){
	/** @type core.managers.skin.SkinDefinition */
	var def = skinDefinition;

	def.inherits('core.managers.skin.BaseSkin2');

	def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

	def.skinParams([
		{
			'id': 'tdr',
			'type':Constants.SkinParamTypes.URL,
			'defaultTheme': 'WEB_THEME_DIRECTORY'
		}
	]);

	def.compParts({
		'tooltip': { skin: 'wysiwyg.viewer.skins.option.InfoTipArrowSkin' }
	});

	def.html(
		'<div skinpart="placeholder">' +
			'<div skinpart="tooltipArea"></div>'+
			'<div skinpart="tooltip"></div>' +

			'<a href="#" class="action">' +
			'<div skinpart="radioElement"><input type="radio"/></div>' +
			'</a>' +
			'<div skinpart="actionButton" class="hidden"> ' +
			'<a href="#" class="buyaction">' +
			'<img src="" alt=""/>'  +
			'</a> ' +
			'</div>' +

		'</div>');

	def.css([
		'%placeholder% a.action { display:block; width:100%; height:100%; position:relative; }',
		'%placeholder% { position:absolute; width:100%; height:100%; }',
		'%actionButton% { text-align:center; position:absolute; top:0px; width:100%; }',
		'%placeholder% .hidden { display:none; }',
		'%radioElement% { text-align:center; top:0px; position: relative; }',
		'%radioElement% input { display:inline-block; }',
		'%tooltip% { width:405px; margin-left: 205px; margin-top: -10px; position:absolute; z-index:99999; white-space: pre-wrap; }',
		'%tooltipArea% { height:100%; width:100%; position:absolute; top:0; left:0; zoom:1; display:block; background:url([tdr]transparent.gif) repeat; }'
	]);
});