define.component('wysiwyg.editor.components.dialogs.ColorAdjuster', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize(['core.utils.css.Color']);
    def.resources(['W.Utils', 'W.Preview', 'W.Commands', 'W.EditorDialogs']);
    def.binds(['_onChange', '_onDialogClosing' ]);
    def.traits([]);
    def.skinParts({
        color: { type: 'htmlElement' },
        oldColor: { type: 'htmlElement' },
        content: { type: 'htmlElement' }
    });
    def.dataTypes(['']);
    def.states(); //Obj || Array
    def.propertiesSchemaType("");
    def.statics({});
    def.fields({});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._originalColor = args.color;
            //alpha can be 0
            if (!args.alpha && args.alpha != 0) {
                this._alpha = this._originalAlpha = 100;
            } else {
                this._alpha = this._originalAlpha = args.alpha * 100;
            }

            this._dialogWindow = args.dialogWindow;
            this._onClose = args.closeCallback;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            this._changeCB = args.onChange;
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.color.addEvent('mouseenter', function () {
                this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: 'Customize_Color_color_area_right_ttid'}, this._skinParts.color);
            }.bind(this));
            this._skinParts.color.addEvent('mouseleave', function () {
                this.resources.W.Commands.executeCommand('Tooltip.CloseTip');
            }.bind(this));

            this._skinParts.oldColor.addEvent('mouseenter', function () {
                this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: 'Customize_Color_color_area_left_ttid'}, this._skinParts.oldColor);
            }.bind(this));
            this._skinParts.oldColor.addEvent('mouseleave', function () {
                this.resources.W.Commands.executeCommand('Tooltip.CloseTip');
            }.bind(this));
        },

        _createFields: function () {
            //this._skinParts.color.setStyles({'background-color':this._color.getHex()});
            this._onChange();
            this._setOriginalColor();

            var DELTA_AMOUNT = 30;
            var sliderLabel = this.injects().Resources.get('EDITOR_LANGUAGE', 'ADJUST_DIALOG_OPACITY');
            var colorOpacitySlider = this.addSliderField(sliderLabel, 0, 100, 1, false, false, true).addEvent('inputChanged', function (e) {
                this._alpha = Number(e.value);
                this._onChange();
            }.bind(this));
            colorOpacitySlider.setValue(this._alpha);
        },

        _refreshColor: function () {
            this._color = new this.imports.Color(this._originalColor);
            this._color.setAlpha(this._alpha / 100);
        },

        _setOriginalColor: function () {
            var oldColor = new this.imports.Color(this._originalColor);
            oldColor.setAlpha(this._originalAlpha / 100);
            // Set color display
            this._skinParts.oldColor.setStyles({'background-color': oldColor.getHex()});
            if (!window.Browser.ie) {
                this._skinParts.oldColor.setStyle('opacity', oldColor.getAlpha());
            } else {
                this._skinParts.oldColor.setStyle('filter', 'alpha(opacity=' + oldColor.getAlpha() * 100 + ')');
            }
        },

        _onChange: function () {
            //update color according to params
            this._refreshColor();
            // Set color display
            this._skinParts.color.setStyles({'background-color': this._color.getHex()});
            if (!window.Browser.ie) {
                this._skinParts.color.setStyle('opacity', this._color.getAlpha());
            } else {
                this._skinParts.color.setStyle('filter', 'alpha(opacity=' + this._color.getAlpha() * 100 + ')');
            }
            // Notify change to callback

            this._changeCB({'alpha': this._alpha / 100});

            //TODO: Ugly Safari hack by Tom B. Ido we need to move it to somewhere normal.
            this.resources.W.Preview.getPreviewManagers().Utils.forceBrowserRepaint();
        },

        _onDialogClosing: function (param) {
            if (param.result == this.resources.W.EditorDialogs.DialogButtons.CANCEL) {
                this._changeCB({'alpha': this._originalAlpha / 100});
            }
            if (param.result == this.resources.W.EditorDialogs.DialogButtons.OK || param.result == Constants.DialogWindow.CLICK_OUTSIDE) {
                this._onClose({alpha: this._alpha / 100});
            }
        }
    });
});