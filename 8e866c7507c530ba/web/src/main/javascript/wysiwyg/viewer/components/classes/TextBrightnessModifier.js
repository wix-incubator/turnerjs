/**
 * Created by shaharz on 3/9/14.
 */
define.Class('wysiwyg.viewer.components.classes.TextBrightnessModifier', function(classDefinition) {
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.components.classes.TextModifierBase');

    def.resources(['W.Theme', 'W.Utils']);

    def.methods({

        initialize: function(initialBrightness, parentNode) {
            this.parent(initialBrightness, parentNode);
            this._brightness = initialBrightness;
        },

        _getNodeDesktopValue: function(node) {
            return this.resources.W.Utils.mobile.getFontColor(node, W.Theme);
        },

        setBrightness: function(brightness) {
            this._brightness = brightness;
        },

        _updateNodeNewValue: function(node, originalColor) {
            var wantedColor, fixedColor;
            if (originalColor) {
                fixedColor = this._brightColorIfNeeded(originalColor);
                wantedColor = this.resources.W.Utils.getNewColorAccordingToBrightness(fixedColor, this._brightness);
                node.setStyle('color', wantedColor);
            }
        },

        _brightColorIfNeeded: function(originalColor) {
            if (originalColor.getHex() === '#000000' && this._brightness > 1) {
                return this.resources.W.Theme.getColorClassInstance('#121212');
            }
            return originalColor;
        }
    });
});