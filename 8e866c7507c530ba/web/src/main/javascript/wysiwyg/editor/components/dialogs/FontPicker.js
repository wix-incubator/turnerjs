define.component('wysiwyg.editor.components.dialogs.FontPicker', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.UndoRedoManager']);
    def.binds(['_onBlur', '_onBeforeClose']);
    def.skinParts({
        // dragArea    : { type: 'htmlElement' },
        content: { type: 'htmlElement' }
        // header      : { type: 'htmlElement', autoBindDictionary : 'FONT_DIALOG_TITLE' },
        // xButton     : { type: 'htmlElement', command : 'this._closeCommand', commandParameter : 'cancel'},
        // okBtn       : { type: 'core.editor.components.EditorButton', command : 'this._closeCommand', commandParameter : 'ok', autoBindDictionary: 'FONT_SELECT'},
        // cancelBtn   : { type: 'core.editor.components.EditorButton', command : 'this._closeCommand', commandParameter : 'cancel',autoBindDictionary : 'CANCEL_BUTTON'}
    });
    def.dataTypes(['', 'Font']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            // Set font with default font
            args = args || {};
            this._font = args.font;
            this._originalFont = this._font;
            this._dialogWindow = args.dialogWindow;
            this._changeCB = args.onChange;
            this.setDataItem(this.injects().Data.createDataItem({font: this._font}, 'Font'));
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._fontDetails = {isFontChanged: false};
        },
        _createFields: function () {
            this.addInputGroupField(function () {
                this.addFontFamilyField(this.injects().Resources.get('EDITOR_LANGUAGE', 'FONT_FAMILY_LABEL')).bindToField('font');
            });
            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(3, '7px');

                this.addLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'FONT_STYLE_LABEL'));
                this.addBreakLine();

                this.addFontSizeField().bindToField('font');
                this.addFontStyleField().bindToField('font');
                this.addFontColorField().bindToField('font');
            });
        },

        _onBeforeClose: function(e){
            var cause = 'cancel';
            var font = this._originalFont;
            if (e && e.result == 'OK'){
                cause = 'ok';
                font = this._font;
            }
            if (e.result == 'OK' && this._fontDetails && this._fontDetails.isFontChanged) {
                this.resources.W.UndoRedoManager.startTransaction();
                this._changeCB({font: font, cause: cause, fontDetails: this._fontDetails});
                this._fontDetails.isFontChanged = false;
            }
            else {
                this._changeCB({font: font, cause: cause});
            }
        },

        _onDataChange: function(dataObj){
            var oldFont = this._font;
            this._font = dataObj.get('font');
            if (oldFont !== this._font) {
                this._fontDetails.isFontChanged = true;
                this._fontDetails.oldFont = this._fontDetails.newFont ? this._fontDetails.oldFont : oldFont;
                this._fontDetails.newFont = this._font;
            }

            this._changeCB({font: this._font, cause:'temp'});
        }
    });

});