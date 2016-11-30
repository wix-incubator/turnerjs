define.component('wysiwyg.editor.components.dialogs.VideoSearchDialog', function (componentDefinition) {
	//@type core.managers.component.ComponentDefinition
	var def = componentDefinition;

	def.inherits('mobile.core.components.base.BaseComponent');

	def.skinParts({
		'iframe': {type: 'htmlElement'}
	});

	def.resources(['W.Resources', 'W.Commands', 'W.EditorDialogs']);

	def.traits(['core.editor.components.traits.DataPanel']);

	def.statics({
		_translationKeys: [
			'VIDEOSEARCH_OK',
			'VIDEOSEARCH_CANCEL',
			'VIDEOSEARCH_SEARCH_PLACEHOLDER',
			'VIDEOSEARCH_LOADMORE',
			'VIDEOSEARCH_SUB_SEARCH_TEXT',
			'VIDEOSEARCH_WELCOME_TEXT',
			'VIDEOSEARCH_NORESULT',
			'VIDEOSEARCH_SEARCH_BUTTON'
		]
	});

	def.methods({
		initialize: function (compId, viewNode, args) {
			this.parent(compId, viewNode, args);
			this._iframeUrl = args.iframeUrl;
		},

		_getTranslation: function () {
			var keys = this._translationKeys,
				translator = this.resources.W.Resources,
				translation = {};

			keys.forEach(function (key) {
				translation[key] = translator.get('EDITOR_LANGUAGE', key);
			});

			return translation;
		},

		_onAllSkinPartsReady: function () {
			var _this = this;

			this._skinParts.iframe.setAttribute('src', this._iframeUrl);

			this._skinParts.iframe.style.visibility = 'hidden';

			this._skinParts.iframe.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);

			// create data for sending
			var msgData = JSON.stringify({
				translations: this._getTranslation()
			});

			this._skinParts.iframe.addEventListener('load', function () {
				_this._skinParts.iframe.contentWindow.postMessage(msgData, "*");

				setTimeout(function () {
					_this._skinParts.iframe.style.visibility = 'visible';
				}, 0);

			});

		}


	});
});





