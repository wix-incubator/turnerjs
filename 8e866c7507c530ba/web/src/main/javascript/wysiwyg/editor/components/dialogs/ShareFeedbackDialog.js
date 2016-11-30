define.component("wysiwyg.editor.components.dialogs.ShareFeedbackDialog", function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Preview','W.Editor']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this.resources.W.Editor.Comments.markSiteShared();
            this.resources.W.Editor.Comments.getCommentsFromServer();
        },

        _createFields: function (panel) {
            this._createShareMainTitle();
            this._createShareSubTitle();
            this._createShareUrlLabel();
            var shareUrlInput = this._createShareUrlInput();
            this.addBreakLine('20px', '1px solid #D6D5C3', '5px');
            this._createShareOK();

            this.resources.W.Editor.Comments.getPreviewUrl(function(url){
                var previewUrl = url ? url : this._translate('SHARE_DIALOG_ERROR_MESSAGE','Failed to generate preview link');
                var inputElement = shareUrlInput.getHtmlElement().$logic._skinParts.input;
                inputElement.value = previewUrl;
                inputElement.select();
            }.bind(this));
        },
        _createShareMainTitle: function () {
            this.addLabel(this._translate("SHARE_DIALOG_MAIN_TITLE", "Share your site and get feedback!"), null, 'thin', 'getfeedback/Share_copy-link_icon.png', null, {width: '42px', height: '36px'}, null, {'font-size': ' 26px'}).runWhenReady(function (labelLogic) {
                labelLogic._skinParts.icon.style.margin = "-12px 15px 0px 9px";
                labelLogic._skinParts.label.style.paddingBottom = "0px";
            });
        },
        _createShareSubTitle: function () {
            var labelText = this._translate("SHARE_DIALOG_SUB_TITLE", "You can share your site whether it's live or not"),
                labelStyles = {
                    'margin-left': '67px',
                    'margin-top': '0px',
                    'margin-bottom': '20px',
                    'font-size': '16px'
                };
            this.addLabel(labelText, null, null, null, null, null, null, labelStyles);
        },
        _createShareUrlLabel: function () {
            var labelText = this._translate("SHARE_DIALOG_URL_TITLE", "To share your site click Copy Link, then send the link to whoever you want"),
                labelStyles = {
                    'font-size': '13px',
                    'margin-left': '9px'
                };
            this.addLabel(labelText, null, null, null, null, null, null, labelStyles);
        },
        _createShareUrlInput: function () {
            return this.addInputField().runWhenReady(function (logic) {
                logic.$view.style.margin = "0px 9px";
                logic.$view.style.cursor = "text";
                logic._skinParts.input.readOnly = "true";
                logic._skinParts.input.value = this._translate("SHARE_DIALOG_URL_CREATE", "Preparing link...");
                logic._skinParts.input.addClass('helvetica-neue-font-family');
                logic._skinParts.input.style.fontSize = '12px';
                logic._skinParts.input.style.marginBottom = '0px';

                logic.$view.onclick = function () {
                    this.$logic._skinParts.input.select();
                };
            }.bind(this));
        },
        _createShareOK: function () {
            this.addButtonField(null, this._translate("SHARE_DIALOG_OK", "Done"), null, null, 'blue').addEvent(Constants.CoreEvents.CLICK, function () {
                    this._dialogWindow.forceTriggerCancelButton();
                }.bind(this)).runWhenReady(function (logic) {
                    logic.$view.style.display = "inline-block";
                    logic.$view.style.float = "right";
                    logic.$view.style.fontSize = "13px";
                    logic.$view.style.marginBottom = "0px";
                });
        }
    });
});








