define.component('wysiwyg.viewer.components.inputs.TextAreaInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.inputs.TextInput');
    def.skinParts({
        'textarea':{type:"htmlElement"},
        'errorMessage':{type:"htmlElement", optional:true}
    });
    def.binds(['_checkMaxLength']);
    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._maxLength = args.maxLength || "";
        },

        _onAllSkinPartsReady:function () {
            var textarea = this._skinParts.textarea;
            textarea.set('value', this.getDataItem().get('text'));
            this.addEvent('inputChanged', function (evt) {
                this.getDataItem().set('text', evt.value);
            }.bind(this));

            if (this._maxLength) { // IE doesn't support the "maxlength" property on TextAreas, need to do it by myself
                textarea.setProperty('maxlength', this._maxLength);
                if (Browser.ie) {
                    textarea.addEvent(Constants.CoreEvents.KEY_UP, this._checkMaxLength);
                }
            }

            this._listenToInput();
        },

        _checkMaxLength:function (e) {
            var textValue = this._skinParts.textarea.get('value');
            var textLen = textValue.length;
            if (textValue.length > this._maxLength) {
                var diff = this._maxLength - textLen;
                textValue = textValue.slice(0, diff);
                this._skinParts.textarea.set('value', textValue);
            }
        },

        _changeEventHandler:function (e) {
            // DONT Submit on Enter
            if (e.code == 13) {
                return false;
            }
            this.parent(e);
        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput:function () {
            this._skinParts.textarea.addEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.textarea.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        },

        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput:function () {
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.textarea.removeEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        },

        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        _getValue:function () {
            var textarea = this._skinParts.textarea;
            return textarea.get('value');
        }
    });
});

