define.component('wysiwyg.editor.components.BasicFontButton', function (compDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.utilize(['core.utils.css.Font']);

    def.inherits('wysiwyg.editor.components.WButton');

    def.skinParts({
        icon: {type: 'htmlElement', optional: 'true'},
        label: {type: 'htmlElement'},
        extraLabel : {type: 'htmlElement'},
        fontName: {type: 'htmlElement', optional: 'true'},
        fontTag: {type: 'htmlElement', optional: 'true'}
    });

    def.binds(['_onClick']);

    def.fields({_canFocus : true,
        _triggers: ['click'],
        MAX_FONT_SIZE: 20
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;
            this.parent(compId, viewNode, args);
            this.setName(args.name);
            this.setFont(args.font);

        },

        /** @override */
        _onDataChange: function(dataObj) {
            this.parent(dataObj);
            this._fontName = dataObj.get('cssClass');
            var seoTag = dataObj.get('seoTag') || '';
            this._fontTag = (/h[0-9]/).test(seoTag) ? seoTag.toUpperCase() : null;
            this._renderIfReady();
        },

        render: function() {
            this.parent();
            //var font = this._themeManager.getProperty(this._font);
            var font = this._fontName ? this._themeManager.getProperty(this._fontName) :
                new this.imports.Font(this._font, this._themeManager);
            if(!font){
                return;
            }
            var fontSize = font.getSize();
            this.injects().Css.loadFont(font.getFontFamily());

            this._skinParts.icon.uncollapse();
            this._skinParts.icon.setStyle('background-color', font.getColor());

            this._skinParts.extraLabel.set('text', fontSize);
            if (this._skinParts.fontName) {
                this._skinParts.fontName.set('text', font.getFontFamily());
            }
            if (this._skinParts.fontTag && this._fontTag) {
                this._skinParts.fontTag.set('text', '<' + this._fontTag + '>');
            }

            if (parseInt(fontSize) > this.MAX_FONT_SIZE){
                fontSize = this.MAX_FONT_SIZE + 'px';
                this._skinParts.extraLabel.addClass('fontSizeExceeded');
                this._skinParts.label.set('title', this.injects().Resources.get('EDITOR_LANGUAGE', 'FONT_PRESET_SIZE_WARNING'));

            }else{
                this._skinParts.extraLabel.removeClass('fontSizeExceeded');
                this._skinParts.label.set('title', '');
            }

            this._skinParts.label.setStyles({
                'fontFamily' : font.getFontFamilyWithFallbacks(),
                'fontStyle'  : font.getStyle(),
                'fontVariant': font.getVariant(),
                'fontWeight' : font.getWeight(),
                'fontSize'   : fontSize
            });

        },

        setName: function(label) {
            this._name = label;
            this._renderIfReady();
        },

        setFont: function(font){
            this._font = font;
            this._renderIfReady();
        },

        _onClick: function(e) {
            e.target = this.getViewNode();
            this.fireEvent(Constants.CoreEvents.CLICK, e);
        },

        _onEnabled: function(){
            var view = this._skinParts.view;
            view.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onOver);
            view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onOut);
            view.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            view.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        },

        _onDisabled: function(){
            var view = this._skinParts.view;
            view.removeEvent(Constants.CoreEvents.CLICK, this._onClick);
            view.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onOver);
            view.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onOut);
            view.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            view.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        }
    });
});