/**
 * @Class wysiwyg.editor.components.inputs.font.FontPresetSelector
 * @extends wysiwyg.editor.components.WButton
 */
define.component('wysiwyg.editor.components.inputs.font.FontPresetSelector', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.skinParts({
        label: {type: 'htmlElement'},
        paragraph: {type: 'htmlElement'}
        //icon: {type: 'htmlElement', optional: 'true'},
    });

    def.dataTypes(['']);

    def.fields({
        _triggers : ['click']
    });

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontPresetSelector
     */
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
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;
            this._cssManager = this.injects().Css;
            this._title     = {font: 'font_0', size: 22};
            this._paragraph = {font: 'font_7', size: 14};
            this.fontData = args;
        },

        render : function() {

            // var title = this._data.get('name');
            var title = this.injects().Resources.get('EDITOR_LANGUAGE', 'FONT_PRESET_TITLE');
            var paragraph = this.injects().Resources.get('EDITOR_LANGUAGE', 'FONT_PRESET_SUB_TITLE');
            // var titleFont = new W.Font(this._data.get(this._title.font), this._themeManager);
            var titleFont = new this.imports.Font(this.fontData[this._title.font], this._themeManager);
            titleFont.setSize(this._title.size);
            // var paragraphFont = new W.Font(this._data.get(this._paragraph.font), this._themeManager);
            var paragraphFont = new this.imports.Font(this.fontData[this._paragraph.font], this._themeManager);
            paragraphFont.setSize(this._paragraph.size);

            this._cssManager.loadFont(titleFont.getFontFamily());
            this._cssManager.loadFont(paragraphFont.getFontFamily());

            this._skinParts.label.set('text', title);
            this._skinParts.label.setStyles({'font': titleFont.getCssValue()});

            this._skinParts.paragraph.set('text', paragraph);
            this._skinParts.paragraph.setStyles({'font': paragraphFont.getCssValue()});
            delete this.fontData["name"];

            this._fontTags = this._fontTags || this.fontData["tags"];
            delete this.fontData["tags"];
        },

//         _onClick:function(e){
//            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
//             var fontWithoutColors = this._discardFontColor(this.fontData);
//            for (var font in fontWithoutColors) {
//                if (font) {
//                    themeManager.setProperty(font, fontWithoutColors[font]);
//                }
//            }
//            this.parent();
//        },

        getFonts: function() {
            return this.fontData;
        },

        getFontTags:function(){
            return this._fontTags;
        },

        /* Override */
        _onDataChange: function(){}
    });
});