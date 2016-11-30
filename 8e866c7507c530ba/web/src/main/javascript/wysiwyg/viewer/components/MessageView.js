define.component('wysiwyg.viewer.components.MessageView', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'blockingLayer':{'type':'htmlElement'},
        'okButton':{'type':'core.editor.components.EditorButton'},
        'title':{'type':'htmlElement'},
        'description':{'type':'htmlElement'},
        'dialog':{'type':'htmlElement'}
    });

    def.binds([ '_closeView' ]);

    def.resources(['W.Commands']);


    def.methods({

        _onAllSkinPartsReady:function (parts) {
            parts.okButton.setLabel("OK");
            parts.okButton.addEvent("buttonClick", this._closeView);
        },

        showMessage:function (message) {
            this.uncollapse();
            this._skinParts.title.set('html', message.msgTitle || '');
            this._skinParts.description.set('html', message.msgBody || '');
            this._visible = true;
        },

        hideMessage: function () {
            this.collapse();
            this._visible = false;
        },

        visible:function () {
            return this._visible;
        },

        _closeView:function () {
            this.hideMessage();
            this.fireEvent("complete");
        }

    });
});

