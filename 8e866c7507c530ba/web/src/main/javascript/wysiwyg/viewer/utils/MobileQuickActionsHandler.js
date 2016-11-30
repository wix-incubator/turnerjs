define.Class('wysiwyg.viewer.utils.MobileQuickActionsHandler', function (classDefinition) {
    var def = classDefinition;

    def.resources(['W.Data', 'W.Resources', 'W.Commands']);

    def.binds(['_navigateToPage', '_createNavItemsFromDataItems', '_createSingleNavItem']);

    def.methods({
        handleMobileQuickActions: function () {
            this._removePreloader();
            this._addNavigation();
        },

        _removePreloader: function () {
            var preloader = document.getElementById("viewer_preloader");
            if (preloader) {
                document.body.removeChild(preloader);
            }

            var fixedPreloader = document.getElementById(Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "viewer_preloader");
            if (fixedPreloader) {
                document.body.removeChild(fixedPreloader);
            }
        },

        _addNavigation: function () {
            var quickActions = document.getElementById('quick-actions');
            if(!quickActions){
                return;
            }
            var pagesButton = document.getElementById("quick-actions-pages-button");
            if (pagesButton) {
                this._pagesMap = {};
                this.resources.W.Commands.registerCommandAndListener("WViewerCommands.SelectedPageChanged", this, this._onSelectedPageChanged);
                var pagesTitle = document.getElementById("qa-drop-up-pages").querySelector(".quick-actions-drop-up-title");
                var pagesList = document.getElementById("qa-drop-up-pages-list");
                this.resources.W.Data.getDataByQuery('#MAIN_MENU', function (mainMenuData) {
                    var navigationLabel = "Pages";

                    pagesTitle.innerHTML = navigationLabel;

                    var dataItems = mainMenuData.getItems();

                    this._createNavItemsFromDataItems(pagesList, dataItems, 0);
                    this._addGapElement(pagesList);
                }.bind(this));
                pagesButton.className = pagesButton.className.replace("disabled", "");
            }
        },

        _addGapElement: function(pagesList){
            if(!pagesList){
                return;
            }
            var emptyLI = document.createElement('li');
            emptyLI.className = "quick-actions-drop-up-ugly-clearfix";
            pagesList.appendChild(emptyLI);
        },

        _createNavItemsFromDataItems: function (navGroup, dataItems, level, parentNode) {
            for (var i = 0; i < dataItems.length; i++) {
                var currentItem = dataItems[i];
                this._createSingleNavItem(navGroup, currentItem, level, parentNode);
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
                var isHidden = pageData.get('mobileHidePage');
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
        },

        _onSelectedPageChanged:function(newPageId){
            var previousSelectedPage = this._pagesMap[this._currentPage];
            if(previousSelectedPage){
                previousSelectedPage.removeClass('quick-actions-drop-up-selected');
            }
            this._currentPage = '#' + newPageId;
            var selectedLI = this._pagesMap[this._currentPage];
            if(selectedLI) {
                // TODO: Fixed without a JIRA task (add one)
                selectedLI.addClass('quick-actions-drop-up-selected');
            }

        },

        _hideMenu: function(){
            var hideClass = 'quick-actions-drop-up-wrapper-open';
            var menu = document.getElementById("qa-drop-up-pages");
            menu.removeClass(hideClass);
        },

        _navigateToPage: function (pageId) {
            W.Viewer.goToPage(pageId);
        }
    });
});
