/**
 * @class wysiwyg.common.utils.TextSimpleFormatMigration
 */
define.Class('wysiwyg.common.utils.TextSimpleFormatMigration', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.common.utils.TextMigrationDomHelper', 'wysiwyg.common.utils.TextMigrationStylesHelper']);

    def.methods({
        initialize: function(){
            this._domHelper = new this.imports.TextMigrationDomHelper();
            this._styleHelper = new this.imports.TextMigrationStylesHelper();
        },

        migrateElement: function(element){
            this._migrateBold(element);
            this._migrateItalic(element);
            this._migrateUnderline(element);
            this._migrateAlignRight(element);
            this._migrateAlignCenter(element);
            this._migrateJustify(element);
            this._migrateUl(element);
        },

        _migrateBold: function(element){
            var elements = element.getElements('.bold"');
            this._removeClassAddTag(elements, 'bold', 'strong');
        },

        _migrateItalic: function(element){
            var elements = element.getElements('.italic"');
            this._removeClassAddTag(elements, 'italic', 'em');
        },

        _migrateUnderline: function(element){
            var elements = element.getElements('.underline"');
            this._removeClassAddTag(elements, 'underline', 'u');
        },

        _migrateAlignRight: function(element){
            var elements = element.getElements('.alignRight"');
            this._removeClassAddInlineStyle(elements, 'alignRight', 'text-align', 'right');
        },

        _migrateAlignCenter: function(element){
            var elements = element.getElements('.alignCenter"');
            this._removeClassAddInlineStyle(elements, 'alignCenter', 'text-align', 'center');

        },

        _migrateJustify: function(element){
            var elements = element.getElements('.alignJustify"');
            this._removeClassAddInlineStyle(elements, 'alignJustify', 'text-align', 'justify');

        },

        _migrateUl: function(element) {
            var elements = element.getElements('ul, ol');
            elements.each(function(element) {
                if (!this._styleHelper.getElementStyleClass(element)) {
                    element.addClass(Constants.Theme.DEFAULT_STYLE_CLASS);
                }
            }, this);
        },

        _removeClassAddTag: function(elements, cssClass, tag){
            elements.forEach(function(el){
                var formatElement = new Element(tag);
                this._domHelper.moveChildren(el, formatElement);
                this._domHelper.removeClass(el, cssClass);
                if(this._domHelper.isElementHasAttributes(el) || el.nodeName.toLowerCase() !== 'span'){
                    el.adopt(formatElement);
                } else{
                    formatElement.replaces(el);
                }
            }, this);
        },

        _removeClassAddInlineStyle: function(elements, cssClass, styleKey, styleValue){
            elements.forEach(function(el){
                this._domHelper.removeClass(el, cssClass);
                el.setStyle(styleKey, styleValue);
            }, this);
        }
    });
});