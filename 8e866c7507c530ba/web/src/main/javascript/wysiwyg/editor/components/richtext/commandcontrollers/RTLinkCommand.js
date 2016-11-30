define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTLinkCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand');

    def.resources(['W.Preview', 'W.UndoRedoManager', 'W.Commands']);

    def.binds(['_linkDialogCallback']);

    def.fields({
        /** the user can remove a link in the link dialog */
        _unlinkCommandInstance: null,
        /** a function used to generate the ling data item id (Apps) */
        _generateLinkIdFunc: null,
        /** is data persistent (Apps) */
        _isPersistent: true
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
        },

        setExtraParameters: function(unlinkCommandInstance, generateLinkIdFunc , isPersistent) {
            this._unlinkCommandInstance = unlinkCommandInstance;
            this._generateLinkIdFunc = generateLinkIdFunc;
            this._isPersistent = isPersistent;
        },

        getUserActionEventName: function() {
            return Constants.CoreEvents.CLICK;
        },

        executeCommand: function(event) {
            LOG.reportEvent(wixEvents.TXT_EDITOR_LINK);
            var element = CKEDITOR.plugins.wixlink.getSelectedLink(this._editorInstance);
            var dataQuery, linkData;
            if (element) {
                dataQuery = element.getAttribute("dataquery");
                if (dataQuery) {
                    linkData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(dataQuery);
                    //this is a workaround for old links that were saved with ## by accident
                    if (!linkData) {
                        dataQuery = "#" + dataQuery;
                        linkData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(dataQuery);
                        if (!linkData) {
                            LOG.reportError(wixErrors.LINK_DATA_ITEM_DOESNT_EXIST, "WRichTextEditor", "_ckEditorLinkSelected", dataQuery);
                        }
                    }
                }
            }

            var undoRedoManager = this.resources.W.UndoRedoManager;
            undoRedoManager.isActionSupportedByURM = undoRedoManager.checkIfDataChangeSupportedByURM(event);
            this._openLinkDialog(linkData, dataQuery);

        },

        _openLinkDialog: function (linkDataItem, ref) {
            var linkDataId;
            var viewerDataManager = this.resources.W.Preview.getPreviewManagers().Data;

            //Create helper (dummy data item to send to the link dialog)
            //If there is already a link item - reference it from this dummy item
            var dataItem = viewerDataManager.createDataItem({
                link: (linkDataItem) ? linkDataItem.get('id') : null
            }, 'StyledTextLinkHelper');

            //The dialog creates unique ids for new link items
            //If a function is provided - pass the pre-generated link to the dialog (he'll use it)
            if (this._generateLinkIdFunc) {
                linkDataId = this._generateLinkIdFunc();
            }

            this.resources.W.Commands.executeCommand('WEditorCommands.OpenLinkDialogCommand',
                { /* args */
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    data: dataItem,
                    state: (linkDataItem && linkDataItem.getType) ? linkDataItem.getType() : Constants.LinkState.NO_LINK,
                    linkDataId: linkDataId,
                    closeCallback: this._linkDialogCallback
                });
        },

        _linkDialogCallback: function(state, linkData, closeEvent) {
            var ref = null;

            if (closeEvent.result == W.EditorDialogs.DialogButtons.CANCEL) {
                return;
            }

            if (!linkData || state == Constants.LinkState.NO_LINK) {
                this._unlinkCommandInstance.executeCommand();
            }
            else {
                linkData.setMeta('isPersistent', this._isPersistent);
                ref = '#' + linkData.get('id');
                this.executeLinkCommand({"dataQuery": ref});
            }
        },

        executeLinkCommand: function (value) {
            if (!this._editorInstance) {
                //bi error?
                return;
            }
            var isUnderlined = this._editorInstance.getCommand('underline').state === Constants.CkEditor.TRISTATE.ON;

            this._editorInstance.execCommand(this._commandName, value);
            if (!isUnderlined) {
                this._editorInstance.execCommand('underline');
            }
        }
    });
});