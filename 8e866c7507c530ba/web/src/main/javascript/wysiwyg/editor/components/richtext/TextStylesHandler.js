/**
 * @class wysiwyg.editor.components.richtext.TextStylesHandler
 */
define.Class('wysiwyg.editor.components.richtext.TextStylesHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        _ckEditor: null,
        _compStylesMap: null,
        _CssClassToTagsMap: null
    });

    def.binds(['_fontSelectorConverter']);

    def.resources(['W.Preview', 'W.Data']);

    def.utilize(['core.utils.css.Color']);

    def.methods({

        initialize: function (addTextBackground) {
            this._addTextBackground = addTextBackground;
            this.resources.W.Preview.getPreviewManagersAsync(function (managers) {
                this._viewer = {
                    theme: managers.Theme,
                    css: managers.Css
                };
            }, this);
        },

        setCkEditorInstance: function (editor) {
            this._ckEditor = editor;
        },

        setStylesMapsToCk: function (styleMapId) {
            this.resources.W.Data.getDataByQuery('#' + styleMapId, function (ckObjectsMap) {
                this._compStylesMap = ckObjectsMap.get('items');
                this._updateCkEditorConfig();
            }.bind(this));
        },

        appendCssToCkEditor: function (styleMapId) {
            this.resources.W.Data.getDataByQuery('#' + styleMapId, function (ckObjectsMap) {
                this._compStylesMap = ckObjectsMap.get('items');
                var cssString = this._getCssString();
                this._ckEditor.document.appendStyleText(cssString);
            }.bind(this));
        },

        _updateCkEditorConfig: function () {
//            this._ckEditor.config.stylesMap = this._getFontTagToClassMap();
            this._ckEditor.config.stylesMap = this._compStylesMap;
            this._ckEditor.config.colorsMap = this._getColorsMap();
            this._ckEditor.config.bgColorsMap = this._getColorsMap('back');
            CKEDITOR.plugins.wixParser.resetTheMaps(this._ckEditor.config);
        },

        _getColorsMap: function (classNamePrefix) {
            var map = {};
            var colors = this._viewer.theme.getPropertiesAccordingToType('color');
            for (var i = 0; i < colors.length; i++) {
                var colorClassName = colors[i];
                if (colorClassName.indexOf('color_') == 0) {
                    map[(classNamePrefix || '') + colorClassName] = this._viewer.theme.getProperty(colorClassName).getHex();
                }
            }
            return map;
        },

        _getCssString: function () {
            this._CssClassToTagsMap = this._getCssClassToTagsMap();
            var css = '';
            css += this._getThemePropertiesCss('font', this._fontSelectorConverter);
            css += this._getThemePropertiesCss('color');
            return css;
        },

        _getThemePropertiesCss: function (propertyType, selectorConverter) {
            var properties = this._viewer.theme.getPropertiesAccordingToType(propertyType);
            var css = '';
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].indexOf(propertyType + '_') == 0) {
                    css += this._getPropertyCssString(properties[i], propertyType, selectorConverter);
                }
            }
            return css;
        },

        _getPropertyCssString: function(property, propertyType, selectorConverter){
            var cssClassDefs = this._viewer.css.getThemeGlobalPropertyCssRules(property, propertyType);
            var cssString = '';
            var clr = new this.imports.Color();
            var addBkg = this._addTextBackground;
            cssClassDefs.forEach(function (cssDef) {
                var selector = selectorConverter ? selectorConverter(cssDef.selector) : cssDef.selector;
                if(addBkg && cssDef.rules.indexOf('color: #')!=-1)
                {
                    colorStr = cssDef.rules.substr(cssDef.rules.indexOf('color: #')+7,7);
                    clr.setHex(colorStr);
                    if(clr.getBrightness()>50)
                    {
                        cssDef.rules = cssDef.rules.replace('color: '+colorStr,'color: '+colorStr+'; background-color:#666666');
                    }
                }
                cssString += selector + '{' + cssDef.rules + '}';
            });
            return cssString;
        },
        _isCloseToWhite:function(){

        },

        _fontSelectorConverter: function (fontSelector) {
            var className = fontSelector.replace('.', '');
            return (this._CssClassToTagsMap[className] ? this._CssClassToTagsMap[className].join(',') + ', ' : '') + fontSelector;
        },

        _getCssClassToTagsMap: function () {
            var map = {};
            for (var tag in this._compStylesMap) {
                var styleEntry = this._compStylesMap[tag];
                if (!map[styleEntry.cssClass]) {
                    map[styleEntry.cssClass] = [];
                }
                map[styleEntry.cssClass].push(tag);
            }
            return map;
        }
    });
});