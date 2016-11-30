define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownShadowCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand');

    def.methods({
        _getCssRgbRegEx: function() {
            if (!this._cssRgbRegEx) {
                this._cssRgbRegEx = new RegExp(/(rgba?\([^\)]*\))/g);
            }

            return this._cssRgbRegEx;
        },
        _getCssHexRgbRegEx: function() {
            if (!this._cssHexRgbRegEx) {
                this._cssHexRgbRegEx = new RegExp(/(#[0-9a-f]{3,6})/g);
            }

            return this._cssHexRgbRegEx;
        },
        /**
         * convert the css string to lower case, remove spaces and convert the hex color values (IE) to rgb functions
         */
        _normalizeString: function(cssString) {
            var noHexValues = this._hexToRGB(cssString);
            return noHexValues.replace(/\s+/g, '').toLowerCase();
        },
        _hexToRGB: function(cssString) {
            var hexValues = cssString.match(this._getCssHexRgbRegEx());
            var result = cssString;

            if (hexValues != null) {
                for (var i = 0; i < hexValues.length; i++) {
                    result = result.replace(hexValues[i], hexValues[i].hexToRgb()); //hexToRgb is a mootools function
                }
            }

            return result;
        },
        _compareRgbParts: function(cssShadow1, cssShadow2) {
            /*
             * mtach the rgba parts of both css's and check that they appear in the same order of parts in the string
             */
            var rgba1 = cssShadow1.match(this._getCssRgbRegEx());
            var rgba2 = cssShadow2.match(this._getCssRgbRegEx());

            return _.isEqual(rgba1, rgba2) || this._compareWithAlphaDiff(rgba1, rgba2);
        },
        _compareRgbaValues: function(rgba1Values, rgba2Values) {
            //compare rgb
            for (var i = 0; i < 3; i++) {
                if (rgba1Values[i] != rgba2Values[i]) {
                    return false;
                }
            }

            return (Math.floor(rgba1Values[3] * 1000) === Math.floor(rgba2Values[3] *1000));
        },
        _compareWithAlphaDiff: function(rgba1, rgba2) {
            if (rgba1.length != rgba2.length) {
                return false;
            }

            for (var j=0; j< rgba1.length; j++) {
                if (rgba1[j].indexOf("rgba") === 0 && rgba2[j].indexOf("rgba") === 0) {
                    var rgba1Values = this._parseRgba(rgba1[j]),
                        rgba2Values = this._parseRgba(rgba2[j]);

                    if (!this._compareRgbaValues(rgba1Values, rgba2Values)) {
                        return false;
                    }
                } else if (rgba1[j] != rgba2[j]) {
                    return false;
                }
            }

            return true;
        },
        _parseRgba: function(rgba) {
            return rgba.replace('rgba(', '').replace(')', '').split(',');
        },
        _compareNonRgbParts: function(cssShadow1, cssShadow2) {
            /*
             * remove the rgb\a parts form the css and test if the remaining is the same
             */
            var noRgb1 = cssShadow1.replace(this._getCssRgbRegEx(), ''),
                noRgb2 = cssShadow2.replace(this._getCssRgbRegEx(), '');

            return noRgb1 === noRgb2;
        },
        _compShadowCssCrossBrowsers: function(cssShadow1noSpaces, cssShadow2noSpaces) {
            return this._compareRgbParts(cssShadow1noSpaces, cssShadow2noSpaces) &&
                   this._compareNonRgbParts(cssShadow1noSpaces, cssShadow2noSpaces);
        },
        /**
         * The css text-shadow string value is different between browsers, you can check the spec - RTShadowDDSpec.js.
         *   Example:
         *       IE (value):     1px 1px 0px #c8c8c8, 0px 2px 0px #b4b4b4, 0px 3px 0px #a0a0a0, 0px 4px 0px rgba(140,140,140,0.498039), 0px 0px 0px #787878, 0px 5px 10px rgba(0,0,0,0.498039)
         *       Chrome (value): rgb(200, 200, 200) 1px 1px 0px, rgb(180, 180, 180) 0px 2px 0px, rgb(160, 160, 160) 0px 3px 0px, rgba(140, 140, 140, 0.498039) 0px 4px 0px, rgb(120, 120, 120) 0px 0px 0px, rgba(0, 0, 0, 0.498039) 0px 5px 10px
         *
         * This function will 'flip flop' the strings and will try to compare them together
         */
        _cssTextShadowCompare: function(cssShadow1, cssShadow2) {
            var cssShadow1noSpaces = this._normalizeString(cssShadow1),
                cssShadow2noSpaces = this._normalizeString(cssShadow2);

            return cssShadow1noSpaces === cssShadow2noSpaces || this._compShadowCssCrossBrowsers(cssShadow1noSpaces, cssShadow2noSpaces);
        },
        _getOptionFromMenu: function(value){
            var self = this;
            var _value = value;

            return this._optionsData.first(function(optionData){
                var optionValue = optionData.get(self._key);
                if (typeof _value === 'string' && typeof optionValue === 'string') {
                    return self._cssTextShadowCompare(_value, optionValue);
                }

                return _value === optionValue;
            });
        }
    });
});
