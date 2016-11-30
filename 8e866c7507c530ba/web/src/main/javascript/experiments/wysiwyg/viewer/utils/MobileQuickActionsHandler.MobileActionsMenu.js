define.experiment.Class('wysiwyg.viewer.utils.MobileQuickActionsHandler.MobileActionsMenu', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        handleMobileQuickActions: function () {
            this._removePreloader();
            this._addNavigation();

            if(window.WMobileActionsMenu) {
                window.WMobileActionsMenu.updateDisplay();
            }
        },

        _createSingleNavItem: function (navGroup, dataItem, level) {
            var navigateToPage = this._navigateToPage;
            var hideMenu = this._hideMenu;
            var levelIndicator = '>  ';
            var currentLevel = "";
            for (var i = 0; i < level; i++) {
                currentLevel = currentLevel + levelIndicator;
            }
            var item = document.createElement('li');
            var pageId = dataItem.get('refId');
            this._pagesMap[pageId] = item;
            item.innerHTML = "<a href='#'>"+"</a>";
            navGroup.appendChild(item);
            this.resources.W.Data.getDataByQuery(pageId, function (pageData) {
                var isHidden = pageData.get('mobileHidePage'); //onMerge - that's the only difference
                if(isHidden){
                    navGroup.removeChild(item);
                }else{
                    var pageTitle = pageData.get('title');
                    item.firstChild.innerHTML = currentLevel + pageTitle;

                    var subItems = dataItem.get('items');
                    if (subItems && subItems.length > 0) {
                        this._createNavItemsFromDataItems(navGroup, subItems, level + 1, item);
                    }

                    if(pageId && pageId.indexOf("#") === 0){
                        pageId = pageId.substr(1);
                    }

                    item.addEventListener('click',function(e){
                        hideMenu();
                        navigateToPage(pageId);
                        e.stopPropagation();
                        e.preventDefault();
                    });
                }

            }.bind(this));
        }
    });
});
