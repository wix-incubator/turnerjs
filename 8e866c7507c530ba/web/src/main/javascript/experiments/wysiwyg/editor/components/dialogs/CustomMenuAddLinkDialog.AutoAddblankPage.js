define.experiment.component('wysiwyg.editor.components.dialogs.CustomMenuAddLinkDialog.AutoAddBlankPage', function (def, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */

    def.methods({
        _addItemPageClickListener: function(){
            var pageData = Object.clone( _.find(W.Data.getDataByQuery('#PAGE_TYPES')._data.items, {'name':'ADD_PAGE_BLANK_NAME'} ));
            pageData.name = "New Page";
            var command = "WEditorCommands.AddPage";
            var params = {page: pageData};
            W.Commands.executeCommand(command, params);
            this._dialogWindow.endDialog();
        }
    });

});
