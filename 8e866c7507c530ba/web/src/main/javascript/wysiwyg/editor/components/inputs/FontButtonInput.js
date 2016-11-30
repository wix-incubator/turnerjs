define.component('wysiwyg.editor.components.inputs.FontButtonInput', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.ButtonInput');

    def.resources(['W.Preview', 'W.UndoRedoManager']);

    def.skinParts({
        label: {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.FontButton'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'editable': ['disabled', 'enabled']});

    def.fields({
        _styleHighlightHoverClass: 'styleHighlightHoverClass',
        _cssRuleTemplate: '.%fontClass%, .%fontClass% .label {background-color: rgba(252,253,70,0.4) !important}'
    });

    def.binds(['_addHighlightClass', '_removeHighlightClass']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._name  = args.name || '';
            this._label = args.label || args.buttonLabel || '';
            this._font  = args.font || '';
            this._className = args.className;
            this._currentHighlightedStyle = null;
        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            this._skinParts.button.setLabel(this._label);
            this._skinParts.button.setFont(this._font);
            this._skinParts.button.setName(this._name);

        },

        /**
         * Set the value of the input field, MANDATORY
         * @param font The text to set
         */
        setValue: function(font){
            this._font = font;
            this._renderIfReady();
        },

        /**
         * Returns the value of the input field
         */
        getValue: function(){
            return this._font;
        },

        /**
         * The change event handler of the input.
         * Must fire 'inputChanged' event to communicate
         * @param e
         */
        _changeEventHandler: function(e) {
            if (e && e.font){
                this.setValue(e.font);
            }
            var value = this.getValue();
            if (typeof value == 'string'){
                value = this.injects().Utils.convertToHtmlText(value);
            }

            var fontData = e.fontDetails;
            if (fontData) {
                var newValue = {}, oldValue = {};
                newValue[this._dataFieldName] = fontData.newFont;
                oldValue[this._dataFieldName] = fontData.oldFont;
                this.resources.W.Preview.getPreviewManagers().Theme.fireEvent('undoDataChangedEvent', [undefined, newValue, oldValue, this]);
                this.resources.W.UndoRedoManager.endTransaction();
            }
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },

        /**
         * @override
         */
        _listenToInput: function() {
            this._skinParts.button.addEvent('change', this._changeEventHandler);
            this._skinParts.button.addEvent('click', this._tunnelButtonEvent);
            this._skinParts.button.addEvent('over', this._tunnelButtonEvent);
            this._skinParts.button.addEvent('up', this._tunnelButtonEvent);
        },
        /**
         * @override
         */
        _stopListeningToInput: function() {
            this._skinParts.button.removeEvent('change', this._changeEventHandler);
            this._skinParts.button.removeEvent('click', this._tunnelButtonEvent);
            this._skinParts.button.removeEvent('over', this._tunnelButtonEvent);
            this._skinParts.button.removeEvent('up', this._tunnelButtonEvent);
        },

        _onAllSkinPartsReady:function () {
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._addHighlightClass);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._removeHighlightClass);
            this.parent();
        },

        /**
         * Adds highlight class
         *
         * @private
         */
        _addHighlightClass: function() {
            if (this._currentHighlightedStyle) {
                return;
            }

            var className = this._className,
                cssRule = this._cssRuleTemplate.replace(/%fontClass%/g, className),
                viewerHead = W.Preview.getPreviewSite().document.head,
                styleNode = document.createElement('style');

            styleNode.type = 'text/css';
            styleNode.className = this._styleHighlightHoverClass;
            styleNode.appendChild(document.createTextNode(cssRule));
            viewerHead.appendChild(styleNode);

            this._currentHighlightedStyle = className;
        },

        /**
         * Remove highlight class
         *
         * @private
         */
        _removeHighlightClass: function() {
            var viewerHead = W.Preview.getPreviewSite().document.head,
                mockStyles = viewerHead.getChildren('.' + this._styleHighlightHoverClass);

            mockStyles.destroy();
            this._currentHighlightedStyle = null;
        }
    });
});