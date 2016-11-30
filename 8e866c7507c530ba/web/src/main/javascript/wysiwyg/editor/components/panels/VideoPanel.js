define.component('wysiwyg.editor.components.panels.VideoPanel', function (componentDefinition) {
	/** @type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');


	def.utilize([]);
	def.resources(['W.Utils', 'W.Config']);
	def.binds(['_getVideoDataFromVideoUrl', '_getVideoUrlFromVideoData', '_videoUrlValidationMessage']);
	def.traits(['core.editor.components.traits.DataPanel']);

	def.resources(['W.Commands', 'W.EditorDialogs', 'W.Config', 'W.Utils', 'W.Editor', 'W.UndoRedoManager', 'topology']);

	def.propertiesSchemaType('VideoProperties');

	def.skinParts({
		videoUrl: {
			type: Constants.PanelFields.SubmitInput.compType,
			argObject: {
				labelText: 'VIDEO_INSERT_URL',
				placeholderText: 'VIDEO_URL_PLACE_HOLDER',
				buttonLabel: 'GENERAL_UPDATE'
			},
			bindToData: ['videoId', 'videoType'],
			bindHooks: [ '_getVideoDataFromVideoUrl', '_getVideoUrlFromVideoData' ],
			hookMethod: '_addUrlValidator'
		},

		chooseMedia: {
			type: Constants.PanelFields.ButtonField.compType,
			argObject: {
				buttonLabel: 'VIDEO_SEARCH_VIDEOS',
				command: 'WEditorCommands.ShowVideoSearchDialog'
			},
			hookMethod: '_getSearchDialogUrl'
		},

		controlBar: {
			type: Constants.PanelFields.ComboBox.compType,
			argObject: {
				labelText: 'VIDEO_PLAYER_CONTROLS'
			},
			dataProvider: [
				{ label: W.Resources.get('EDITOR_LANGUAGE', "EDIT_FIELD_PANEL_VideoControls_Show"), value: 'always_show' },
				{ label: W.Resources.get('EDITOR_LANGUAGE', "EDIT_FIELD_PANEL_VideoControls_Hide"), value: 'always_hide' },
				{ label: W.Resources.get('EDITOR_LANGUAGE', "EDIT_FIELD_PANEL_VideoControls_AutoHide"), value: 'temp_show' }
			],
			bindToProperty: 'showControls'
		},

		autoplay: {
			type: Constants.PanelFields.CheckBox.compType,
			argObject: {
				labelText: 'VIDEO_PLAYER_AUTO_PLAY'
			},
			bindToProperty: 'autoplay'
		},

		loop: {
			type: Constants.PanelFields.CheckBox.compType,
			argObject: {
				labelText: 'VIDEO_PLAYER_LOOP'
			},
			bindToProperty: 'loop'
		},

		showTitleBar: {
			type: Constants.PanelFields.CheckBox.compType,
			argObject: {
				labelText: 'VIDEO_TITLE'
			},
			bindToProperty: 'showinfo'
		},

		lightControlBar: {
			type: Constants.PanelFields.CheckBox.compType,
			argObject: {
				labelText: 'VIDEO_PLAYER_LIGHT_THEME'
			},
			bindToProperty: 'lightTheme'
		},

		changeStyle: {
			type: Constants.PanelFields.ButtonField.compType,
			argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
		},
		addAnimation: {
			type: Constants.PanelFields.ButtonField.compType
		}

	});


	def.dataTypes(['Video']);

	def.fields({
		_videoUrl: {
			"YOUTUBE": 'http://youtu.be/',
			"VIMEO": 'http://vimeo.com/'
		}
	});

	def.methods({

		/**
		 * @param compId
		 * @param viewNode
		 * @param extraArgs
		 */
		initialize: function (compId, viewNode, extraArgs) {
			this.parent(compId, viewNode, extraArgs);

			// Listen to component deletion event to remove the post message event listener
			var panel = this;
			var component = this.resources.W.Editor.getSelectedComp();

			// Listen to messages from search dialog iframe (sends the selected URI)
			window.addEventListener('message', (panel._onMessageFromDialog).bind(panel), false);

			// Remove listener if viewer component removed from stage
			if (component) {
				component.addEvent(Constants.ComponentEvents.DISPOSED, function (e) {
					window.removeEventListener('message', panel._onMessageFromDialog, false);
				});
			}

		},

		_onAllSkinPartsReady: function () {
			this._skinParts.chooseMedia.$view.addEventListener('click', function () {
				LOG.reportEvent(wixEvents.VIDEO_SEARCH_BUTTON, {});
			});

			this.id = this.getID();

		},


		/**
		 * Validation for VideoUrl entry
		 * @param definition
		 * @returns {*}
		 * @private
		 */
		_addUrlValidator: function (definition) {
			definition.argObject.validatorArgs = {validators: [this._videoUrlValidationMessage.bind(this)]};
			return definition;
		},

		/**
		 * Construct dialog iframe url based on definition
		 * @param definition
		 * @returns {*}
		 * @private
		 */
		_getSearchDialogUrl: function (definition) {
			var iframeBaseUrl = this.resources.topology.wysiwyg + '/html/external/VideoSearch/index.html?';
			var fontFaceUrl = this.resources.W.Config.getServiceTopologyProperty('publicStaticsUrl') + "css/Helvetica/fontFace.css";
			var params = [
					'id=' + this.getID(),
					'lang=' + this.resources.W.Config.getLanguage(),
					'fontFaceUrl=' + encodeURIComponent(fontFaceUrl)
			];

			definition.argObject.commandParameter = {
				'iframeUrl': iframeBaseUrl + params.join('&'),
				'title': 'VideoPlayer_DIALOG_TITLE'
			};

			return definition;
		},

		/**
		 * Handler for postMessage event from Dialog
		 * @param e
		 * @private
		 */
		_onMessageFromDialog: function (e) {
			var msgData;
			var biEventParams;

			try { // error handling for good JSON
				msgData = JSON.parse(e.data);
			} catch (ee) {
				return;
			}

			if (this.id !== msgData.id) {
				return;
			}

			// get video uri from dialog
			if (msgData.uri) {
				this.resources.W.UndoRedoManager.startTransaction();

				if (this._skinParts.videoUrl) {
					this._skinParts.videoUrl._resetInvalidState();
				}

				if (msgData.type) {
					biEventParams = {c1: msgData.type};

					LOG.reportEvent(wixEvents.VIDEO_VIDEOURL_UPDATED, biEventParams);
				}

				this.getDataItem().set('videoId', msgData.uri);
			}


			// any custom action needed
			if (msgData.action) {

				if (msgData.action === 'bi' && msgData.state === 'searching') {
					LOG.reportEvent(wixEvents.VIDEO_SEARCHING, {});
				}

				// previewing item
				if (msgData.action === 'previewItem' && msgData.state) { // open preview
					this._addSimulatedBlockLayer();
				} else if (msgData.action == 'previewItem' && !msgData.state) { // close preview
					this._removeSimulatedBlockLayer();
				}
			}

			// closing dialog
			if (msgData.closeSearchDialog) {
				this.resources.W.EditorDialogs.VideoSearchDialog.getLogic().closeDialog();
			}
		},

		/**
		 * Create additional overlay (block layer for popup) in order
		 * to hide popup title and controls when any additional popup
		 * is shown.
		 *
		 * @private
		 */
		_addSimulatedBlockLayer: function () {

			var el = document.createElement('div');

			el.style.backgroundColor = 'rgba(0, 0, 0, 0.50)';
			el.style.display = 'block';
			el.style.position = 'fixed';
			el.style.top = '0';
			el.style.bottom = '0';
			el.style.left = '0';
			el.style.right = '0';
			el.style.visibility = 'visible';
			el.style.zoom = '1';

			el.className = 'additionalBlockLayer';

			this.resources.W.EditorDialogs.VideoSearchDialog.getLogic()._skinParts.dialogBox.appendChild(el);
		},

		/**
		 * Remove additional overlay (block layer for popup)
		 * @private
		 */
		_removeSimulatedBlockLayer: function () {
			var dialogBox = this.resources.W.EditorDialogs.VideoSearchDialog.getLogic()._skinParts.dialogBox;

			dialogBox.removeChild(dialogBox.querySelector('.additionalBlockLayer'));
		},


		_getVideoType: function () {
			return  this._data && this._data.get('videoType');
		},

		/**
		 * @override
		 * @param value
		 * @returns {*}
		 * @private
		 */
		_videoUrlValidationMessage: function (value) {
			var isUrl = this.resources.W.Utils.isValidUrl(value);
			var isId = this._getYoutubeId(value) || this._getVimeoId(value);

			LOG.reportEvent(wixEvents.VIDEO_UPDATE_BUTTON, {});

			if (isUrl && isId) {
				return false;
			}

			return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'VIDEO_VALIDATION_ERR');
		},

		_getYoutubeId: function (url) {
			var videoId = '';

			// Test for long youtube url: http://youtube.com/watch?[...&]v=[VIDEO_ID]
			var YTLongUrl = /(?:youtube\.com\/watch[^\s]*[\?&]v=)([\w-]+)/g;
			// Test for short youtube url: http://youtu.be/[VIDEO_ID]
			var YTShortUrl = /(?:youtu\.be\/)([\w-]+)/g;

			var match = YTLongUrl.exec(url) || YTShortUrl.exec(url);
			if (match && match.length && match[1]) {
				//if there is a match, the second group is the id we want
				videoId = match[1];
			}
			return videoId;
		},

		_getVimeoId: function (url) {
			var videoId = '';

			var VimeoUrl = /vimeo\.com\/(\d+)$/gi;

			var match = VimeoUrl.exec(url);
			if (match && match.length && match[1]) {
				//if there is a match, the second group is the id we want
				videoId = match[1];
			}
			return videoId;
		},

		// Has side-effect - saves video type!
		_getVideoDataFromVideoUrl: function (url) {
			var videoType = null;

			var videoId = this._getYoutubeId(url);
			if (videoId) {
				videoType = "YOUTUBE";
			} else {
				videoId = this._getVimeoId(url);
				if (videoId) {
					videoType = "VIMEO";
				}
			}

			if (videoId && videoType) {
				return {videoId: videoId, videoType: videoType};
			}
			else {
				return {};
			}
		},

		_getVideoUrlFromVideoData: function (videoDataObj) {
			var videoId = videoDataObj.videoId;
			var videoType = videoDataObj.videoType;
			if (!videoId || !videoType) {
				return '';
			}

			return this._videoUrl[ videoType  ] + videoId;
		}
	});
});
