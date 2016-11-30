define.component('wysiwyg.previeweditorcommon.components.SiteFeedbackButton', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Utils', 'W.Config', 'W.Resources']);

    def.binds(['_onOver', '_onOut', '_onMouseDown', '_onMouseUp', '_onClick']);

    def.states({
        mouseState: ['up', 'over', 'selected', 'pressed'],
        buttonIcon: ['noIcon', 'withIcon', 'iconHidden'],
        enabled: ['disabled', 'enabled']
    });

    def.fields({});

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({

        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            // stores the width of the button when it is changed via the editing frame.
            this._userSelectedWidth = 0;
            this._resizeTriggeredByData = false;
            this._label = this._translate(attr.label);
            this._hasIcon = attr.hasIcon;
            this._enabled = attr.enabled;
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._skinParts.content.set('text', this._label);
            }

            if (this._hasIcon) {
                this.setState('withIcon', 'buttonIcon');
            }

            if (this._enabled) {
                this._onEnabled();
            }
        },

        setLabel: function (label) {
            this._label = this._translate(label, label);
        },

        render: function () {
            this._renderLabel();
        },

        _renderLabel: function () {
            this._skinParts.content.set('text', this._label || '');
        },

        _onOver: function (e) {
            if (this.isEnabled() && this.getState() !== 'selected') {
                this.fireEvent('over', e);
                this.setState('over', 'mouseState');
            }
        },

        _onOut: function (e) {
            if (this.isEnabled()) {
                this.fireEvent('up', e);
                this.setState('up', 'mouseState');
            }
        },

        _onMouseDown: function (e) {
            if (this.isEnabled()) {
                this.setState('pressed', 'mouseState');
                this.fireEvent(Constants.CoreEvents.MOUSE_DOWN, e);
            } else if (!this.isEnabled()) {
                return this._cancelEvent(e);
            }
        },

        _onMouseUp: function () {
            this.setState('up', 'mouseState');
        },

        _onEnabled: function () {
            var view = this.$view;
            this.setState('enabled', 'enabled');
            view.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onOver);
            view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onOut);
            view.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            view.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        },

        _onDisabled: function () {
            var view = this.$view;
            this.setState('disabled', 'enabled');
            view.removeEvent(Constants.CoreEvents.CLICK, this._onClick);
            view.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onOver);
            view.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onOut);
            view.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            view.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        },

        toggleEnabled: function (enabled) {
            this._enabled = enabled;
            if (enabled) {
                this._onEnabled();
            } else {
                this._onDisabled();
            }
        },

        isEnabled: function () {
            return this._enabled;
        },

        _onClick: function (e) {
            if (this.isEnabled()) {

                e = e || {};
                e.target = this.getViewNode();
                this.fireEvent(Constants.CoreEvents.CLICK, e);
                this.trigger(Constants.CoreEvents.CLICK, e);

                if (this._toggleMode) {
                    var state = (!this.getState().contains('selected')) ? 'selected' : 'over';
                    this.setState(state);
                }
            }
        },

        _translate: function (key, fallback) {
            this._bundleName = this._bundleName || (this.resources.W.Config.env.$isEditorlessPreview ? 'FEEDBACK_REVIEW' : 'EDITOR_LANGUAGE');
            return this.resources.W.Resources.get(this._bundleName, key, fallback);
        },

        hideIcon: function () {
            this.setState('iconHidden', 'buttonIcon');
        },

        clearIcon: function () {
            this.setState('noIcon', 'buttonIcon');
        },

        getRelativeIconPosition: function () {
            var contentPosition = this._skinParts.content.getBoundingClientRect();
            var buttonPosition = this.$view.getBoundingClientRect();
            return {
                left: contentPosition.left - buttonPosition.left,
                top: contentPosition.top - buttonPosition.top
            };
        },

        setTextOpacity: function (value) {
            this._skinParts.content.setStyle('opacity', value);
        }
    });
});