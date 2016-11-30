define.component('wysiwyg.editor.components.inputs.BorderRadiusInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.utilize(['core.utils.css.BorderRadius']);

    def.binds(['_cornersLockHandler']);

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.skinParts({
        label: {type: 'htmlElement'},
        topLeft: {type: 'wysiwyg.editor.components.inputs.TickerInput'},
        topRight: {type: 'wysiwyg.editor.components.inputs.TickerInput'},
        bottomRight: {type: 'wysiwyg.editor.components.inputs.TickerInput'},
        bottomLeft: {type: 'wysiwyg.editor.components.inputs.TickerInput'},
        topLeftUnit: {type: 'htmlElement'},
        topRightUnit: {type: 'htmlElement'},
        bottomRightUnit: {type: 'htmlElement'},
        bottomLeftUnit: {type: 'htmlElement'},
        topLeftPreview: {type: 'htmlElement'},
        topRightPreview: {type: 'htmlElement'},
        bottomRightPreview: {type: 'htmlElement'},
        bottomLeftPreview: {type: 'htmlElement'},
        lockCorners: {type: 'wysiwyg.editor.components.inputs.CheckBox'}
    });

    def.states({'label': ['hasLabel', 'noLabel']}); //Obj || Array

    def.methods({

        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._value = args.radiusString || '';
            this._unit = '';
            this._isCornersLocked = false;
            // this._themeManager = this.injects().Preview.getPreviewManagers().Theme;

        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function () {
            this.parent();
            var radius = new this.imports.BorderRadius(this._value);
            this._unit = radius.getUnits()[0];
            this._skinParts.topLeftPreview.setStyle('border-top-left-radius', radius.getTopLeft());
            this._skinParts.topRightPreview.setStyle('border-top-right-radius', radius.getTopRight());
            this._skinParts.bottomRightPreview.setStyle('border-bottom-right-radius', radius.getBottomRight());
            this._skinParts.bottomLeftPreview.setStyle('border-bottom-left-radius', radius.getBottomLeft());

            this._skinParts.topLeftUnit.set('text', this._unit);
            this._skinParts.topRightUnit.set('text', this._unit);
            this._skinParts.bottomRightUnit.set('text', this._unit);
            this._skinParts.bottomLeftUnit.set('text', this._unit);


            this._skinParts.topLeft.setValue(radius.getTopLeft());
            this._skinParts.topRight.setValue(radius.getTopRight());
            this._skinParts.bottomRight.setValue(radius.getBottomRight());
            this._skinParts.bottomLeft.setValue(radius.getBottomLeft());
            // If BorderRadius has one param, will be set to true
            this._isCornersLocked = radius.getIsLocked();
            this._skinParts.lockCorners.setValue(this._isCornersLocked);
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.lockCorners.setLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'BORDER_RADIUS_LOCK'));
            this.parent();
            if (this.isEnabled()) {
                this._skinParts.topLeft.enable();
                this._skinParts.topRight.enable();
                this._skinParts.bottomRight.enable();
                this._skinParts.bottomLeft.enable();
                this._skinParts.lockCorners.enable();
            } else {
                this._skinParts.topLeft.disable();
                this._skinParts.topRight.disable();
                this._skinParts.bottomRight.disable();
                this._skinParts.bottomLeft.disable();
                this._skinParts.lockCorners.disable();
            }
        },
        /**
         * @param value should be a W.Background string , array or obj
         */

        setValue: function (value) {
            var radius = new this.imports.BorderRadius(value);
            this._value = radius.getCssValue();
            this._unit = radius.getUnits()[0];
            this._renderIfReady();
        },
        getValue: function () {
            var size = null;
            if (this._isCornersLocked) {
                size = this._skinParts.topLeft.getValue() + this._unit;
            } else {
                size = [
                    this._skinParts.topLeft.getValue() + this._unit,
                    this._skinParts.topRight.getValue() + this._unit,
                    this._skinParts.bottomRight.getValue() + this._unit,
                    this._skinParts.bottomLeft.getValue() + this._unit
                ];
            }

            var radius = new this.imports.BorderRadius(size);

            this._value = radius.getThemeString();

            return this._value;
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function () {
            this.parent();
            this._skinParts.topLeft.enable();
            this._skinParts.topRight.enable();
            this._skinParts.bottomRight.enable();
            this._skinParts.bottomLeft.enable();
            this._skinParts.lockCorners.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function () {
            this.parent();
            if (this.isReady()) {
                this._skinParts.topLeft.disable();
                this._skinParts.topRight.disable();
                this._skinParts.bottomRight.disable();
                this._skinParts.bottomLeft.disable();
                this._skinParts.lockCorners.disable();
            }
        },
        _cornersLockHandler: function (e) {
            this._isCornersLocked = this._skinParts.lockCorners.getValue();
            if (this._isCornersLocked) {
                this.setValue(this._skinParts.topLeft.getValue() + this._unit);
            } else {
                this.setValue([this._skinParts.topLeft.getValue() + this._unit, this._skinParts.topLeft.getValue() + this._unit]);
            }
            e.compLogic = this._skinParts.topLeft;
            this._changeEventHandler(e);
        },
        _changeEventHandler: function (e) {
            e = e || {};
            if (this._isCornersLocked) {
                this.setValue(e.compLogic && e.compLogic.getValue() + this._unit);
            }
            this.parent(e);
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function () {
            this._skinParts.topLeft.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.topRight.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.bottomRight.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.bottomLeft.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.lockCorners.addEvent('inputChanged', this._cornersLockHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function () {
            this._skinParts.topLeft.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.topRight.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.bottomRight.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.bottomLeft.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.lockCorners.removeEvent('inputChanged', this._cornersLockHandler);

        }
    });
});
