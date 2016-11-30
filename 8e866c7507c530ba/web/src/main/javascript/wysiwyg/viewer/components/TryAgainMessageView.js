define.component('wysiwyg.viewer.components.TryAgainMessageView', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'blockingLayer':{'type':'htmlElement'},
        'okButton':{'type':'core.editor.components.EditorButton'},
        'backButton':{'type':'htmlElement'},
        'title':{'type':'htmlElement'},
        'description':{'type':'htmlElement'},
        'dialog':{'type':'htmlElement'}
    });

    def.binds(['_closeView', '_closeViewAndCallback']);

    def.statics({
        TRY_AGAIN_CAPTION: "Try Again",
        BACK_CAPTION: "Back"
    }) ;

    def.resources(['W.Commands']);

    def.methods({
        _onAllSkinPartsReady:function (parts) {
            parts.okButton.setLabel(this.TRY_AGAIN_CAPTION);
            parts.backButton.set('html', this.BACK_CAPTION);
            parts.backButton.addEvent("click", this._closeView);
        },

        showMessage:function (message) {
            this.uncollapse();
            this._skinParts.title.set('html', message.msgTitle || '');
            this._skinParts.description.set('html', message.msgBody || '');
            this._callbackOnRetry = message.cb ;
            this._skinParts.okButton.addEvent("buttonClick", this._closeViewAndCallback);
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
        },

        _closeViewAndCallback: function() {
            this._closeView() ;
            if(this._callbackOnRetry) {
                this._callbackOnRetry() ;
            }
        }
    }) ;
});

