define.skin('wysiwyg.common.components.areatooltip.viewer.skins.AreaTooltipSkin', function (skinDefinition) {
	/** @type core.managers.skin.SkinDefinition */
	var def = skinDefinition;

	def.inherits('core.managers.skin.BaseSkin2');

	def.iconParams(
		{'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0}
	);

	def.skinParams([
		{
			"id": "bgcolor",
			"type": Constants.SkinParamTypes.OTHER,
			"defaultValue": "#fffedf"
		},
		{
			"id": "txtcolor",
			"type": Constants.SkinParamTypes.OTHER,
			"defaultValue": "#656565"
		},
		{
			"id": "fnt",
			"type": Constants.SkinParamTypes.OTHER,
			"defaultValue": "font-family: \"Helvetica Neue\",\"HelveticaNeueW01-55Roma\",\"HelveticaNeueW02-55Roma\",\"HelveticaNeueW10-55Roma\", Helvetica, Arial,sans-serif; font-size:12px; line-height:16px; "
		},
		{
			"id": "shd",
			"type": Constants.SkinParamTypes.BOX_SHADOW,
			"defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);"
		},
		{
			"id": "rd",
			"type": Constants.SkinParamTypes.BORDER_RADIUS,
			"defaultValue": "5px"
		},
		{
			"id": "max",
			"type": Constants.SkinParamTypes.OTHER,
			"defaultValue": "min-height:10px; min-width:10px; max-width:300px;"
		},
		{
			'id': 'tdr',
			'type':Constants.SkinParamTypes.URL,
			'defaultTheme': 'WEB_THEME_DIRECTORY'
		}
	]);

	def.html('' +
		'<div skinpart="tooltip">' +
			'<div skinpart="content" class="content"></div>' +
			'<div skinpart="arrow" class="arrow"></div>'+
		'</div>' +
		'<div skinpart="tooltipArea">&nbsp;</div>'
	);

	def.css([
		'%tooltip% { display:none; position:absolute; width:400px; z-index:999; white-space: pre-line;  }',
		'.highligthed { border: 1px dashed #35eaff; }',
		'%content% { [fnt][rd][shd][max] color:[txtcolor]; background:[bgcolor]; padding: 20px 10px; top:0px; left: 0px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25); border: 1px solid #999; background-image: -moz-linear-gradient(bottom, rgba(207, 229, 250, 0.1) 0px, #ffffff 10px); background-image: -webkit-linear-gradient(bottom, rgba(207, 229, 250, 0.1) 0px, #ffffff 10px);  background-image: -o-linear-gradient(bottom, rgba(207, 229, 250, 0.1) 0px, #ffffff 10px);  background-image: linear-gradient(bottom, rgba(207, 229, 250, 0.1) 0px, #ffffff 10px); background-position: bottom; max-width: 400px; position: relative; display: inline-block; overflow:hidden; }',

		' .content.left { float:right; }',

		'%tooltip% .arrow { position:absolute; bottom:-6px; left:1px; width: 14px; height: 9px; ' +
			'background-repeat: no-repeat; background-image:url([tdr]light-arrows.png); background-position: -5px -5px; }',

		'%tooltip% .arrow.right {  top: 50%; height: 15px; left: -8px; margin-top: -6px; ' +
			'background-image:url([tdr]light-arrows.png); background-position: -29px -5px; }',

		'%tooltip% .arrow.bottom { height: 15px; top: -2px; left: 8px; margin-top: -6px; ' +
			'background-image:url([tdr]light-arrows.png); background-position: -67px -5px; }',

		'%tooltip% .arrow.left {  top: 50%; height: 15px; right: -13px; left:auto; margin-top: -6px; ' +
			'background-image:url([tdr]light-arrows.png); background-position: -48px -5px; }',

		' { background-color: rgba(0, 0, 0, 0); zoom:1; display:block; }',

		'p {display:block; margin:0; }',
		'strong, b, i, big { font-size:12px; }',
		'%tooltipArea% { width:100%; height:100%; zoom:1; display:block; position:absolute; background:url([tdr]transparent.gif) repeat; }'
	]);
});