define.experiment.Class('wysiwyg.viewer.utils.MobileQuickActionsHandler.CustomSiteMenu', function (classDefinition) {

    var def = classDefinition;

    def.methods({
        _addNavigation: function () {
            var quickActions = document.getElementById('quick-actions');
            if (!quickActions) {
                return;
            }
            var pagesButton = document.getElementById("quick-actions-pages-button");
            if (pagesButton) {
                this._pagesMap = {};
                this.resources.W.Commands.registerCommandAndListener("WViewerCommands.SelectedPageChanged", this, this._onSelectedPageChanged);
                var pagesTitle = document.getElementById("qa-drop-up-pages").querySelector(".quick-actions-drop-up-title");
                var pagesList = document.getElementById("qa-drop-up-pages-list");

                var navigationLabel = "Pages";

                pagesTitle.innerHTML = navigationLabel;

                var dataItems = this.injects().Viewer.getMainMenu().getItems();

                this._createNavItemsFromDataItems(pagesList, dataItems, 0);
                this._addGapElement(pagesList);

                pagesButton.className = pagesButton.className.replace("disabled", "");
            }
        }
    });
});
