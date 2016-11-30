define.skin('wysiwyg.common.components.disquscomments.viewer.skins.DisqusCommentsSkin', function(skinDefinition){

	/** @type core.managers.skin.SkinDefinition */
	var def = skinDefinition;

	def.inherits('core.managers.skin.BaseSkin2');

	def.html('' +
		'<div skinPart="disqus"></div>' +
		'<div skinPart="disqusDemoMessage"></div>');

	def.css([
		'%disqus%, %disqus% iframe { border:none; box-sizing:border-box; width:100%; height:100%; overflow-x: hidden; overflow-y: hidden; position:relative; }',
		'%disqusDemoMessage% { position:absolute; height:100%; width:100%; top:0; left:0; z-index:0; }'
	]);

});