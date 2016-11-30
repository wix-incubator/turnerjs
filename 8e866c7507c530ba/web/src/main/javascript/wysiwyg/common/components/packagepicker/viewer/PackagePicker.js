define.component('wysiwyg.common.components.packagepicker.viewer.PackagePicker', function (componentDefinition) {
	/**@type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.resources(['W.Data', 'W.Config']);

	def.inherits('core.components.base.BaseComp');

	def.dataTypes(['PackagePicker']);

	def.utilize([
		'core.components.image.ImageSettings'
	]);

	def.propertiesSchemaType('PackagePickerProperties');

	def.fields({
		_request: null,
		_pageViewEventDisabled: false
	});

	def.statics({
		_useWidthOverMinWidth: true
	});

	def.skinParts({
		'radioElement': {
			type: 'htmlElement'
		},
		'placeholder': {
			type: 'htmlElement'
		},
		'actionButton': {
			type: 'htmlElement'
		},
		'tooltip': {
			type: 'wysiwyg.common.components.InfoTip'
		},
		'tooltipArea': {
			type: 'htmlElement'
		}
	});

	def.methods({

		initialize: function (compId, viewNode, args) {

			this.parent(compId, viewNode, args);

			this.resources.W.Commands.registerCommandAndListener('WViewerCommands.DeselectAllPackages', this, this._deselectAllOther);
			this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);

			this.resources.W.Commands.registerCommandAndListener('WViewerCommands.DisablePageViewEventFiring', this, this._disablePageViewEventFiring);

			this.on(Constants.EventDispatcher.Events.EXTERMINATING, this, this._onDestroy);
		},

		_onDestroy: function () {
			this.resources.W.Commands.unregisterListener(this._onEditModeChange);

			this.resources.W.Commands.unregisterCommand('WViewerCommands.DeselectAllPackages');
			this.resources.W.Commands.unregisterCommand('WViewerCommands.DisablePageViewEventFiring');

			this._skinParts.tooltip.dispose();
		},

		_onRender: function (renderEvent) {

			var invalidations = renderEvent.data.invalidations,
				FIRST_RENDER = [ this.INVALIDATIONS.FIRST_RENDER ],
				DATA_CHANGE = [ this.INVALIDATIONS.DATA_CHANGE ];

			if (invalidations.isInvalidated(FIRST_RENDER)) {
				this._onFirstRender();
				this._onDataChange(this.getDataItem());
			} else if (invalidations.isInvalidated(DATA_CHANGE)) {
				this._onDataChange(this.getDataItem());
			}

			this._onEachRender();
		},

		_initializeTooTip: function (element, text) {
			var tooltip = this._skinParts.tooltip,
				_this = this;

			element.removeEvents('mouseenter');
			element.removeEvents('mouseleave');

			if (text && text.trim().length > 0) {

				element.addEvent('mouseenter', function () {
					tooltip._showToolTipCmd({id: 1, content: text}, {source: _this._skinParts.tooltipArea});
//					tooltip._showToolTipCmd({id: 1, content: text}, {source: element});
				});

				element.addEvent('mouseleave', function () {
					tooltip._closeToolTipCmd();
				});

			}
		},

		_actionSelect: function () {
			this._skinParts.actionButton.removeClass('hidden');
			this._skinParts.radioElement.getElement('input').set('checked', true);

			this.resources.W.Commands.executeCommand('WViewerCommands.DeselectAllPackages', {
					compId: this.getComponentUniqueId()}, this
			);
		},

		_deselect: function () {
			this._skinParts.actionButton.addClass('hidden');
			this._skinParts.radioElement.getElement('input').set('checked', false);
		},

		_deselectAllOther: function (commandParams) {
			if (commandParams.compId !== this.getComponentUniqueId() && this.getIsDisplayed()) {
				this._deselect();
			}
		},

		_onDataChange: function (data) {
			var properties = this.getComponentProperties();
			var buttonTopOffset = parseInt(properties.get('buttonTopOffset') || data.get('buttonTopOffset'));
			var radioButtonGap = parseInt(properties.get('radioButtonGap')) || 0;

			if (data.get('buttonImageUrl')) {
				this._skinParts.actionButton.getElement('img')
					.set('src', this.resources.W.Config.getServiceTopologyProperty('staticMediaUrl') + '/' + data.get('buttonImageUrl'));
			}

			if (data.get('selectByDefault')) {
				this._actionSelect();
			} else {
				this._deselect();
			}

			if (!W.Config.env.isPublicViewer() && !W.Config.env.isEditorInPreviewMode()) {
				this._skinParts.actionButton.removeClass('hidden');
			}

			this._skinParts.radioElement.set('styles', { top: buttonTopOffset });
			this._skinParts.actionButton.set('styles', { top: buttonTopOffset + 20 + radioButtonGap });

//			this._initializeTooTip(this._skinParts.tooltipArea, this.getDataItem().get('tooltipText'));
			this._initializeTooTip(this.getViewNode(), this.getDataItem().get('tooltipText'));

		},

		_onEachRender: function () {
			// do nothing so far
		},

		_onFirstRender: function () {

			this._skinParts.placeholder.getElement('a.action').addEvent('click', function (e) {
				e.preventDefault();

				this._actionSelect();
			}.bind(this));


			this._skinParts.placeholder.getElement('a.buyaction').addEvent('click', function (e) {
				e.preventDefault();

				this._sendRequest();
			}.bind(this));

			if (!this._pageViewEventDisabled) {
				this._sendPageViewEvent();
			}

		},

		_sendRequest: function () {

			var params = this._getUrlParams(),
				data = this.getDataItem();

			this._request = new Request.JSON({
				url: '/_api/wix/wixPackagePickerSubmit',
				method: 'get',
				data: {
					paymentcycle: data.get('billingCycle').toLocaleUpperCase(),
					siteGuid: params.siteGuid,
					productid: data.get('packageId'),
					referral: params.referrer
				},
				onComplete: this._requestComplete
			}).send();

		},

		_requestComplete: function (data) {

			if (!!data && 'SUCCESS_NEW_PURCHASE' === data.resultType && data.url) {
				window.location.assign('https://premium.wix.com/wix/api/' + data.url);
			} else {

				// TODO send an error bi event

				window.location.replace('http://wix.com/upgrade/website' + window.location.search);
			}

		},

		_disablePageViewEventFiring: function () {
			this._pageViewEventDisabled = true;
		},

		_sendPageViewEvent: function () {

			var params = this._getUrlParams(),
				eventImg = document.createElement('img'),
				referral = params.referrer || '';

			if (params.siteGuid && params.referralAdditionalInfo) {

				eventImg.src = 'http://frog.wix.com/pre?evid=168' + '&' + 'msid=' + params.siteGuid + '&' + 'origin=' + params.referralAdditionalInfo + '&' + 'ref=' + referral;

				document.body.appendChild(eventImg);
			}


			this.resources.W.Commands.executeCommand('WViewerCommands.DisablePageViewEventFiring', {
					compId: this.getComponentUniqueId()}, this
			);
		},

		/**
		 * Handler for event "WPreviewCommands.WEditModeChanged"
		 * @param mode
		 * @param oldMode
		 * @private
		 */
		_onEditModeChange: function (mode, oldMode) {
			var modeChanged = this._isEditModeChangeToFromPreview(mode, oldMode),
				data = this.getDataItem();

			// emulate data change
			this._onDataChange(data);

		},

		_getUrlParams: function () {

			var params = {};
			var queries;
			var temp, i, l;

			if (window.location.search) {

				queries = window.location.search.substring(1).split("&");

				for (i = 0, l = queries.length; i < l; i++) {
					temp = queries[i].split('=');
					params[temp[0]] = temp[1];
				}

			}

			return params;

		}

	});
});