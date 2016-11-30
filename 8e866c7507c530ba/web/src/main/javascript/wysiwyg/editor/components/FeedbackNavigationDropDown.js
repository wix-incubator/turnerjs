define.component('wysiwyg.editor.components.FeedbackNavigationDropDown', function(componentDefinition){
    //*@type core.managers.component.ComponentDefinition

    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.SiteNavigationDropDown');

    def.skinParts({
        label: { type: 'htmlElement', autoBindDictionary: "FEEDBACK_SHOW_COMMENTS_ON" }
    });

    def.resources(['W.Resources']);

    def.methods({
        _populateDropDown: function () {
            this.parent();
            var option = this._createOption(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ALL_PAGES'), "_allComments", false);
            this._skinParts.options.insertBefore(option, this._skinParts.options.firstChild);
            this._setSelected(option);
        },

        _gotoSelectedPage: function () {
            var id = this._skinParts.select.getAttribute('value');
            if (id != "_allComments") {
                this.resources.W.Commands.executeCommand("EditorCommands.gotoSitePage", id);
            }
            this.fireEvent("pageSelected", id);
        },

        isAllCommentsMode: function() {
            var id = this._skinParts.select.getAttribute('value');
            return (id === "_allComments");
        },

        /**
         * Change the selection according to the current page
         */
        _updateSelection: function () {
            if (!this.isAllCommentsMode()) {
                var currentPageId = this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var option = this._getOptionByValue(currentPageId);
                this._setSelected(option);
                this.fireEvent("pageSelected", currentPageId);
            }
        }
    });
});
