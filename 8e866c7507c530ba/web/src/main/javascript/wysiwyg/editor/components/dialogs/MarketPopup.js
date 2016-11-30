//TODO: remove this file when experiment TPAArtifactLeftovers2 is merged (need to take into account EditorUIRefactorPhase1 and EditorUIRefactorPhase2)
define.component('wysiwyg.editor.components.dialogs.MarketPopup', function (compDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = compDefinition;

    def.inherits('wysiwyg.editor.components.Iframe');

    def.resources(['W.Utils']);

    def.skinParts({
        iframe:{type:'htmlElement'}
    });
    def.binds(['_passOrigin', '_onBeforeClose']);
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._url = args.url;
            this._width = args.width;
            this._height = args.height;
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._origin = location.protocol + "//" + location.host;
            this._tests = this._getAppMarketTests();

            // register close listener
            var cmd = W.Commands.getCommand("WEditorCommands.closeMarketPopup");
            cmd.registerListener(this, this._closePopup);

           // Disable the mouse scroll of the window
            viewNode.addEvent(Constants.CoreEvents.MOUSE_WHEEL,this.resources.W.Utils.stopMouseWheelPropagation);
        },

        _getAppMarketTests: function() {
            var tests = Object.filter(editorModel.runningExperiments, function(value, key, object) {
                return key.toLowerCase().indexOf('appmarket') === 0;
            });

            var testsStr = Object.keys(tests).length > 0 ? Object.values(tests).join(',') : '';

            return testsStr;
        },

        _closePopup:function () {
            this._onBeforeClose();
            this._dialogWindow.closeDialog();
        },

        _onAllSkinPartsReady:function () {
            this._changeSize({w:this._width, h:this._height});
            this._skinParts.iframe.addEvent('load', this._passOrigin);

            // add editor origin
            var query = "eo=" + btoa(this._origin);
            // add current lang
            var lang = W.Config.getLanguage();
            query += "&lang=" + lang;

            // add app market tests
            if (this._tests && this._tests != '') {
                query += '&tests=' + this._tests;
            }

            query += "&compId=MarketPopup";

            var seperator = this._url.indexOf('?') > -1 ? '&' : '?';

            this.setUrl(this._url + seperator + query);
        },

        _passOrigin:function () {
            W.TPA.setMarketPopupWindow(this._skinParts.iframe.contentWindow);
            W.TPA.postMessageEvent('INIT', this._skinParts.iframe.contentWindow);
        },

        _onBeforeClose:function () {
            this._view.removeEvent(Constants.CoreEvents.MOUSE_WHEEL,this.resources.W.Utils.stopMouseWheelPropagation);
            W.TPA.postMessageEvent('ON_POPUP_CLOSE');
            W.Commands.unregisterListener(this);
        }
    });
});
