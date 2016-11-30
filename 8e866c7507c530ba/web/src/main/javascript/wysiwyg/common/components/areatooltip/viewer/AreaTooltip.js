define.component('wysiwyg.common.components.areatooltip.viewer.AreaTooltip', function (componentDefinition) {
	/**@type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.resources(['W.Data', 'W.Config']);

	def.inherits('core.components.base.BaseComp');

	def.propertiesSchemaType('AreaTooltipProperties');

	def.dataTypes(['AreaTooltip']);

	def.skinParts({
		'tooltip': {
			type: 'htmlElement'
		},
		'content': {
			type: 'htmlElement'
		},
		'arrow': {
			type: 'htmlElement'
		},
		'tooltipArea': {
			type: 'htmlElement'
		}
	});

	def.statics({
		_useWidthOverMinWidth: true
	});

	def.methods({
		initialize: function (compId, viewNode, args) {

			this.parent(compId, viewNode, args);

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

		_onFirstRender: function () {

		},

		_onDataChange: function () {

			this._initializeTooTip(
				this._skinParts.tooltipArea,
				this.getDataItem().get('tooltipText'),
				this.getComponentProperties().get('tooltipPosition')
			);
		},

		_onEachRender: function () {

			if (!W.Config.env.isPublicViewer() && !W.Config.env.isEditorInPreviewMode()) {
				this.$view.addClass('highligthed');
			} else {
				this.$view.removeClass('highligthed');
			}

		},

		/**
		 * Initialize function for tooltip. Commonly subscribes to events
		 *
		 * @param element
		 * @param text
		 * @param position
		 * @private
		 */
		_initializeTooTip: function (element, text, position) {
			var tooltip = this._skinParts.tooltip,
				_this = this;

			if (text && text.trim().length > 0) {

				element.removeEvents('mouseover');
				element.removeEvents('mouseout');

				element.addEvent('mouseover', function (e) {
					_this._showToolTipCmd({source: _this._skinParts.tooltipArea, content: text, position: position});
				});

				element.addEvent('mouseout', function (e) {
					_this._closeToolTipCmd();
				});

				tooltip.addEvent('mouseover mouseenter', function (e) {
					_this._closeToolTipCmd();
				});

			}
		},

		_showToolTipCmd: function (config) {

			this._skinParts.content.innerHTML = config.content;

			this._skinParts.tooltip.style.display = 'block';
			this._setPosition(config.position);
			this._skinParts.tooltip.style.display = 'none';

			this._skinParts.tooltip.style.display = 'block';

		},

		_closeToolTipCmd: function () {
			this._skinParts.tooltip.style.display = 'none';

			this._skinParts.arrow.className = 'arrow';
			this._skinParts.content.removeClass('left');
		},

		_setPosition: function (position) {

			this._skinParts.arrow.addClass(position);

			var arrowOffset = 14;

			if (position === 'right') {
				this._skinParts.tooltip.set('styles', {
					'left': this.$view.clientWidth + arrowOffset,
					'top': (this.$view.offsetHeight / 2) - (this._skinParts.content.offsetHeight / 2)
				});
			}

			if (position === 'top') {
				this._skinParts.tooltip.set('styles', {
					'left': 0,
					'top': -this._skinParts.content.offsetHeight - arrowOffset
				});
			}

			if (position === 'left') {
				this._skinParts.tooltip.set('styles', {
					'left': -(400 + arrowOffset),
					'top': (this.$view.offsetHeight / 2) - (this._skinParts.content.offsetHeight / 2)
				});

				this._skinParts.content.addClass('left');
			}

			if (position === 'bottom') {
				this._skinParts.tooltip.set('styles', {
					'left': 0,
					'top': this.$view.offsetHeight + arrowOffset
				});
			}

		}

	});
});