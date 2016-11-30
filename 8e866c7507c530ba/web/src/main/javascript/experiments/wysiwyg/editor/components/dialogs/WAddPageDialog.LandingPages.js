define.experiment.component('wysiwyg.editor.components.dialogs.WAddPageDialog.LandingPages', function (def) {
    def.methods({

        _reportSelectedLink: function () {
            var pageData = Object.clone (this._selectedItem._data.get('additionalObj'));
            var name = this._skinParts.nameYourPageInput.getValue() || W.Resources.get('EDITOR_LANGUAGE', pageData.group);

            var command = pageData.command ||  "WEditorCommands.AddPage";
            var params;
            if (pageData.commandParameter) {
                params = pageData.commandParameter;
                params.name = name;
            } else {
                pageData.name = name;
                params = {page: pageData};
                if (this._isSubPage && !this._selectedItem._data.get('additionalObj').onlyPrimaryPage) {
                    if (this._isCurrentPageSubPage) {
                        params.parent = this._currentPageParentRef;
                    } else {
                        params.parent = this._selectedPageId;
                    }
                }
            }

            if(pageData.addPageCompletedCommand){
                var _this = this;
                var afterAddPage = function afterAddPage(){
                    var command = W.Commands.getCommand('WEditorCommands.AddPageCompleted');
                    command.unregisterListener(_this);
                    W.Commands.executeCommand(pageData.addPageCompletedCommand);
                };
                W.Commands.registerCommandAndListener('WEditorCommands.AddPageCompleted', this, afterAddPage);
            }

            W.Commands.executeCommand(command, params);

            //report bi event
            try {
                var logParams = {
                    c1: pageData.previewPic.replace('.png',''),
                    c2: pageData.group.replace('ADD_PAGE_','').replace('_GROUPNAME',''),
                    g1: pageData.name,
                    i1: this._isSubPage
                };
                LOG.reportEvent(wixEvents.PAGE_ADDED, logParams);
            }
            catch (e) {
                LOG.reportEvent(wixEvents.PAGE_ADDED, {c1: 'error'});
            }
        }
    });

});
