define.experiment.Class('wysiwyg.editor.managers.WClipBoard.LandingPages', function (def) {
    def.methods({

        paste: function (pasteToAnotherPage, autoSelect) {
            if (autoSelect === undefined) {
                autoSelect = true;
            }

            var currentPageId = this.resources.W.Preview.getPreviewCurrentPageId();

            if (pasteToAnotherPage === undefined) {
                pasteToAnotherPage = this._pageSource && this._pageSource !== currentPageId;

                // from the next paste, it will act as it was copied from the same page
                this._pageSource = currentPageId;
            }

            if (this._currentClip) {
                var currentPasteScope = this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage() ? currentPageId : this._currentClipScope;
                var toHtmlNode = this.resources.W.Editor.getScopeNode(currentPasteScope);
                this.resources.W.UndoRedoManager.startTransaction();

                var compView = null;

                var pluginHook = this.getPluginMethod(this._currentClip.componentType, "interceptPaste");
                if (pluginHook) {
                    pluginHook(this._currentClip, toHtmlNode, pasteToAnotherPage, autoSelect);
                }
                else {
                    compView = this.pasteFromClip(toHtmlNode, pasteToAnotherPage, this._currentClip, autoSelect);
                }

                return compView;
            }
            else {
                return null;
            }
        }
    });

});
