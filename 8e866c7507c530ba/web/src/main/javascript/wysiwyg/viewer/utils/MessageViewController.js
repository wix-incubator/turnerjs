define.Class("wysiwyg.viewer.utils.MessageViewController", function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.binds(['_showMessageBox', '_messageBoxClosed', '_showMessageBoxWithSuspendedOk']);
    def.resources(["W.Components", 'W.Config', 'W.Theme']);
    def.inherits('bootstrap.managers.BaseManager');
    def.methods({
        initialize:function () {
            this._messagesQueue = [];
            this.BETWEEN_MESSAGES_DELAY = 700;
            W.Commands.registerCommandListenerByName("WPreviewCommands.ViewerStateChanged", this, this._onViewerStateChanged); // DE <-> ME
            W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onViewerStateChanged); //editor <-> preview
            this._overlay = null ;
        },

        /**
         * Adds a message to the messages queue, and tries to show it.
         * @param msgTitle the title of the message
         * @param msgBody the text of the message
         * @param suspensionInMillis the suspension until the 'ok' button is enabled.
         * @param tryAgainFunc the response of the message
         */
        showTryAgainMessage:function (msgTitle, msgBody, suspensionInMillis, tryAgainFunc) {
            var message = {};
            message.msgTitle        = msgTitle;
            message.msgBody         = msgBody;
            message.okCaption       = "Try Again";
            message.messageDelay    = suspensionInMillis;
            message.cb              = tryAgainFunc;
            this._messagesQueue.push(message);
            var viewBoxSettings     = this._getTryAgainDialogDefinition() ;
            this._initIfNeededMessageView(this._showMessageBoxWithSuspendedOk, viewBoxSettings);
        },

        _getTryAgainDialogDefinition: function () {
            var logicClass  = "wysiwyg.viewer.components.TryAgainMessageView" ;
            var skinClass   = "wysiwyg.viewer.skins.TryAgainMessageViewSkin" ;
            if (this._isMobileMode()) {
                skinClass = "wysiwyg.viewer.skins.MobileTryAgainMessageViewSkin" ;
            }
            return {
                comp: logicClass,
                skin: skinClass
            };
        },

        /**
         * Takes the next message from the messages queue, and shows it to the user
         */
        _showMessageBoxWithSuspendedOk: function () {
            if ((this._messagesQueue.length > 0) && (!this._messageBox.getLogic().visible())) {
                var message = this._messagesQueue.shift();
                this._messageBox.getLogic().hideMessage() ;
                this._handleSuspendedMessage(message) ;
            }
        },

        _handleSuspendedMessage: function(message) {
            if(message.messageDelay && message.messageDelay > 0) {
                this._showSpinner() ;
                setTimeout(function() {
                    this._hideSpinner() ;
                    this._messageBox.getLogic().showMessage(message);
                }.bind(this), message.messageDelay) ;
            }
        },

        _showSpinner: function() {
            if(!this._overlay) {
                this._overlay = this._createOverlay() ;
            }
            window.document.body.appendChild(this._overlay) ;
        },

        _hideSpinner: function() {
            if(this._overlay) {
                window.document.body.removeChild(this._overlay) ;
            }
        },

        _createOverlay: function() {
            var overlay = new Element("div", {
                styles: {
                    "position": "fixed",
                    "width": "100%",
                    "height": "100%",
                    "top": "0",
                    "left": "0",
                    "background-color": "rgba(0,0,0,0.5)"
                }
            });

            var spinner = this._createSpinner();
            overlay.appendChild(spinner);
            return overlay;
        },

        _createSpinner: function () {
            var spinner = new Element("div", {
                styles: {
                    "width": "100%",
                    "height": "100%",
                    "top": "0",
                    "left": "-15px",
                    "position": "fixed",
                    "margin-left": "50%",
                    "margin-top": "25%"
                }
            });

            var spinnerImg = new Image();
            spinnerImg.src = this.resources.W.Theme.getProperty("BG_DIRECTORY") + "full_preloader.gif";
            spinner.appendChild(spinnerImg);
            return spinner ;
        },

        _onViewerStateChanged: function () {
            if(this._messageBox){
                this._messageBox.getLogic().hideMessage();
                this._messagesQueue.empty();
            }
        },

        _getMessageViewSettings: function () {
            if (this._isMobileMode()) {
                return {
                    comp: "wysiwyg.viewer.components.MessageView",
                    skin: "wysiwyg.viewer.skins.MobileMessageViewSkin"
                };
            }
            return {
                comp: "wysiwyg.viewer.components.MessageView",
                skin: "wysiwyg.viewer.skins.MessageViewSkin"
            };
        },

        _isMobileMode:function(){
            return this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE;
        },

        /**
         * Creates the a MessageView singelton, if it doesn't exists. In any case, it calls
         * the provided function.
         * @param callbackWhenBoxReady the function that is called after the singelton is ready.
         */
        _initIfNeededMessageView:function (callbackWhenBoxReady, customDialogSettings) {
            if(!customDialogSettings) {
                customDialogSettings = this._getMessageViewSettings();
            }

            // In case we have different message-box types we check to see if the required comp or skin
            // are different from the current, in that case we kill the message box and create an other (for mobile)
            if (this._messageBox) {
                var currentSettings = {
                    comp: this._messageBox.getAttribute("comp"),
                    skin: this._messageBox.getAttribute("skin")
                };
                if (currentSettings.comp !== customDialogSettings.comp || currentSettings.skin !== customDialogSettings.skin) {
                    this.kill();
                }
            }

            if (!this._messageBox) {
                this.resources.W.Components.createComponent(customDialogSettings.comp, customDialogSettings.skin, null, null,
                    function (compLogic) {
                        this._messageBox = compLogic.getViewNode();
                        this._messageBox.insertInto(document.body);
                        compLogic.addEvent("complete", this._messageBoxClosed);
                        callbackWhenBoxReady();
                    }.bind(this)
                );
            }
            else if (callbackWhenBoxReady) {
                callbackWhenBoxReady();
            }
        },

        /**
         * Adds an error message to the messages queue, and tries to show it.
         * @param msgTitle the title of the message
         * @param msgBody the text of the message
         */
        showError:function (errTitle, errBody) {
            var errMessage = {};
            errMessage.msgTitle = errTitle;
            errMessage.msgBody = errBody;
            this._messagesQueue.push(errMessage);
            this._initIfNeededMessageView(this._showMessageBox);
        },

        /**
         * Adds a message to the messages queue, and tries to show it.
         * @param msgTitle the title of the message
         * @param msgBody the text of the message
         * @param callback the response of the message
         */
        showMessage:function (msgTitle, msgBody, callback) {
            var message = {};
            message.msgTitle = msgTitle;
            message.msgBody = msgBody;
            message.cb = callback;
            this._messagesQueue.push(message);
            this._initIfNeededMessageView(this._showMessageBox);
        },

        /**
         * Takes the next message from the messages queue, and shows it to the user
         */
        _showMessageBox:function () {
            if ((this._messagesQueue.length > 0) && (!this._messageBox.getLogic().visible())) {
                this._messageBox.getLogic().showMessage(this._messagesQueue.shift());
            }
        },

        /**
         * This function is the handler for the "complete" event of the message.
         * It should be called when an error message is closed.
         * It sets a timeout, and then calls
         */
        _messageBoxClosed:function () {
            setTimeout(function () {
                this._showMessageBox();
            }.bind(this), this.BETWEEN_MESSAGES_DELAY);
        },

        kill:function () {
            if (this._messageBox) {
                this._messageBox.dispose();
                this._messageBox.removeFromDOM();
                this._messageBox = null;
            }
        },
        isReady:function () {
            return true;
        },

        clone:function (newDefine) {
            return this.parent(newDefine);
        }
    });
});
