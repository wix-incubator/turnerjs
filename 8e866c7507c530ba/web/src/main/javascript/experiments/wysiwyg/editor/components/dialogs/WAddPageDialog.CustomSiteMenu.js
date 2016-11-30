define.experiment.component('wysiwyg.editor.components.dialogs.WAddPageDialog.CustomSiteMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({
        /**
         *  Function: initialize
         */
        initialize: function(compId, viewNode, arg){
            this.parent(compId, viewNode);

            this._dialogWindow = arg.dialogWindow;
            this._dialogOptionsSet = false;
            this._selectedPageId = "#" + this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
            this._defaultPage = 'ADD_PAGE_ABOUT1_NAME';

            //fetches the menu data in order to set the dialog up correctly.
            //if selected page is a sub page, the checkbox should be selected automatically and new page should receive same parent
            var menuData = W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            this._isCurrentPageSubPage = menuData.isSubItemByRefId(this._selectedPageId);
            if (this._isCurrentPageSubPage){
                var currentPageParent = menuData.getItemParentByRefId(this._selectedPageId);
                this._currentPageParentRef = '#' + currentPageParent.get('id');
                this._isSubPage = true;
            } else {
                this._isSubPage = false;
            }

            //create an unbound callback function so we can get the "currentTarget"
            var that = this;
            this._linkListener = function(ev){
                if (ev.type === 'click'){
                    that._onItemClick(this);
                }
                else {
                    that._onItemDoubleClick(this);
                }
            };

            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);

            //Get page types list from editor-data
            this.filterEditorDataListByTags('#PAGE_TYPES', 'pagesFilterTags', 'tags', this._setPageTypesList);
        }
    });

});
