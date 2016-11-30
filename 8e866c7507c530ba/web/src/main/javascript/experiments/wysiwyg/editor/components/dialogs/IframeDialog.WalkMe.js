define.experiment.newComponent('wysiwyg.editor.components.IframeDialog.WalkMe', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.Iframe');

    def.skinParts({
        iframe:{type:'htmlElement'}
    });

    def.states({hidden:['hidden', 'visible']});

    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            if (args.dialogWindow) {
                args.dialogWindow.addEvent('onDialogClosing', this._onClosing.bind(this));
            }
        },

        setCloseCallBack:function (callback) {
            this._closeCallback = callback;
        },

        _onClosing:function (event) {
            if (this._closeCallback) {
                this._closeCallback();
            }
        }
    });
});
