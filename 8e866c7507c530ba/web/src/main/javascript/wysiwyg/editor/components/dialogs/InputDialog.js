/**
 * this dialog has an input field. when the ok button is pressed, the given callback runs with
 * the value of the input field.
 *
 * the args that are used in this dialog:
 * a. labelText: the label of the input field
 * b. placeholderText: the default text of the input field
 * c. okCallback: the callback to be run with the input field's value, when the ok button is clicked
 *
 */

define.component('wysiwyg.editor.components.dialogs.InputDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onDialogClosing', '_inputChanged']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.args = args;

            this.addEvent('dialogClosed', this._onDialogClose);
        },

        _onAllSkinPartsReady: function (args) {
            this.parent();

            this._labelText = this.args.labelText;
            this._placeholderText = this.args.placeholderText;
            this._dialogWindow = this.args.dialogWindow;
            this._okCallback = this.args.okCallback;
            this._inputValue = this._placeholderText;

            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },

        _onDialogClosing: function (event) {
            if (event.result == "OK") {
                if (this._okCallback) {
                    this._okCallback(this._inputValue);
                }
            }
        },

        _createFields: function () {
            this.addInputField(this._labelText, this._placeholderText).addEvent('inputChanged', this._inputChanged);
        },

        _inputChanged: function (event) {
            this._inputValue = event.value;
        }
    });

});
