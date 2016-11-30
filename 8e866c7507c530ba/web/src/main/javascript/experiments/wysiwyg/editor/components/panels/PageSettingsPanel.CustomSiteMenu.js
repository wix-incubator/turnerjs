define.experiment.component('wysiwyg.editor.components.panels.PageSettingsPanel.CustomSiteMenu', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({

        _onDuplicateButtonClick: function () {
            var placeholderText = this._translate('DUPLICATE_PAGE_COPY_OF') + ' ' + this._data.get('title');
            this.resources.W.EditorDialogs.openInputDialog({
                'title': this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_DIALOG_DUPLICATE_PAGE'),
                'labelText': this._translate('PAGE_SETTINGS_PAGE_NAME_LABEL'),
                'placeholderText': placeholderText,
                'okCallback': function (newPageName) {
                    LOG.reportEvent(wixEvents.USER_REQUESTED_PAGE_DUPLICATE, {});
                    newPageName = newPageName ? newPageName.substr(0,40) : placeholderText.substr(0,40);
                    var menuData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
                    var pageId = this._data.get('id');
                    var currentPageItem = menuData.getItemByRefId("#" + pageId, true);
                    var isSubPage = menuData.getItemLevel(currentPageItem) !== 0;
                    var currentPageParentId;
                    if (isSubPage) {
                        var currentPageParent = menuData.getItemParentByRefId('#'+pageId);
                        currentPageParentId = '#' + currentPageParent.get('id');
                    }
                    //quick-fix for long names after duplicate causing save validation error:
                    this.resources.W.Commands.executeCommand("WEditCommands.DuplicatePage", {
                        pageHtmlId: pageId,
                        newPageName: newPageName,
                        pageParent: currentPageParentId
                    });
                }.bind(this)
            });
        }
    });
});