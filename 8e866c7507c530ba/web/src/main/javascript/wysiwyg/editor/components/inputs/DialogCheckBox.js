define.component('wysiwyg.editor.components.inputs.DialogCheckBox', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.CheckBox');

    def.binds(['_changeEventHandler']);

    def.skinParts({
        label:  {type: 'htmlElement'},
        checkBox: {type: 'htmlElement'},
        dialogLabel: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            if (args) {
                this._previewComponent = args.previewComponent;
                this.checkBoxlabelText = args.checkBoxlabelText;
                this._dialogHeight = args.dialogHeight;
                this._dialogWidth = args.dialogWidth;
                this._dialogClass = args.dialogClass;
                this._dialogSkin = args.dialogSkin;
                this._dialogTitle = args.dialogTitle;
            }
        },

        _onAllSkinPartsReady: function (parts) {
            this.parent(parts);
            this.setLabel( this.checkBoxlabelText );
            this._toggleDialogLinkLabel();
        },

        _listenToInput: function () {
            var $this = this;

            if (this._eventAdded) {
                return;
            }

            this._eventAdded = true;
            this._skinParts.dialogLabel.addEvent("click", function (evt) {
                if (evt.target == $this._skinParts.dialogLabel) {
                    evt.stopPropagation();

                    $this._openContextDialog(function onOK(checkboxState) {

                        $this.setChecked(checkboxState);

                        $this._toggleDialogLinkLabel();
                    }, function onCancel() {

                    });
                }
            });

            this.parent();
        },

        // Checkbox change
        _changeEventHandler: function(e) {
            var $this = this;
            if (this.getChecked()) {
                this._openContextDialog(
                    function onOK(state) {
                        $this.parent();
                        $this.setChecked(state) ;
                    },
                    function onCancel() {
                        $this.setChecked(false); //Dialog was opened with Check action, cancel should revert it
                    }
                );
            }
            else {
                this.parent();
            }
        },

        _toggleDialogLinkLabel: function() {
            if (this.getValue()) {
                this._skinParts.dialogLabel.set("html", this._translate("DIALOG_CB_EDIT_SETTINGS"));
            }
            else {
                this._skinParts.dialogLabel.set("html",this._translate("DIALOG_CB_ACTIVATE"));
            }
        },

        setValue: function (value) {
            this.parent( value );
            this._toggleDialogLinkLabel();
        },

        _openContextDialog: function( okCallback, cancelCallback ) {
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            var viewHeight = this._skinParts.view.getSize().y;
            this.injects().EditorDialogs.openContextDialog(
                this._dialogHeight,
                this._dialogWidth,
                this._dialogClass,
                this._dialogSkin,
                this._dialogTitle,
                { left: pos.x, top: pos.y + viewHeight },
                this._previewComponent,
                okCallback,
                cancelCallback
            );
        }
    });
});