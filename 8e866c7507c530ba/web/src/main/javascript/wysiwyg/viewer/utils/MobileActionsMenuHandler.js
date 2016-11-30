define.Class('wysiwyg.viewer.utils.MobileActionsMenuHandler', function (classDefinition) {
    var def = classDefinition;

    def.resources(['W.Data', 'W.Resources', 'W.Commands']);

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.binds(['_navigateToPage', '_createNavItemsFromDataItems', '_createSingleNavItem']);

    def.methods({
        handleMobileActionsMenu: function () {
            this._removePreloader();
            this._addPagesNavigation();
            this._addSocialNavigation();

            if(window.WMobileActionsMenu) {
                window.WMobileActionsMenu.updateDisplay();
            }

//            this.injects().Viewer.addEvent('SiteReady', this._onSiteReady);
        },

//        _onSiteReady: function () {
//            window.WMobileActionsMenu._options.enableAnimation = true;
//        },

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

        _addPagesNavigation: function () {
            var listsContainer = document.getElementById('mobileActionsMenuListsPages');
            if(!listsContainer){
                return;
            }

            this._pagesMap = {};
            this.resources.W.Commands.registerCommandAndListener("WViewerCommands.SelectedPageChanged", this, this._onSelectedPageChanged);
            var pagesList = new Element("ul");
//            listsContainer.className = "hasOverflow";
            listsContainer.appendChild(pagesList);
            this.resources.W.Data.getDataByQuery('#MAIN_MENU', function (mainMenuData) {
                var dataItems = mainMenuData.getItems();
                this._createNavItemsFromDataItems(pagesList, dataItems, 0);
//                this._addGapElement(pagesList);
            }.bind(this));
        },

        _addSocialNavigation: function () {
            var socialLinks;
            if(window.rendererModel.siteMetaData.quickActions && window.rendererModel.siteMetaData.quickActions.socialLinks) {
                socialLinks = window.rendererModel.siteMetaData.quickActions.socialLinks;
            } else {
                return;
            }

            var listsContainer = document.getElementById('mobileActionsMenuListsSocial');
            if(!listsContainer){
                return;
            }

            var socialList = new Element("ul");
//            socialList.className = "stickToBottom";
            listsContainer.appendChild(socialList);
            for(var i=0; i<socialLinks.length; i++)
            {
                var item = new Element("li");
                var anchor = item.appendChild(new Element("div")).appendChild(new Element("a"));
                anchor.setAttribute("href", "#");// socialLinks[i].url);
                anchor.setAttribute("target", "_blank");
                anchor.innerHTML = socialLinks[i].id;
                socialList.appendChild(item);
                window.Hammer(item).on("tap", function(event) {
                    this._hideMenu();
                    event.preventDefault();
                    event.stopPropagation();
                    event.gesture.preventDefault();
                    event.gesture.stopPropagation();
                }.bind(this));
            }
        },

//        _addGapElement: function(pagesList){
//            if(!pagesList){
//                return;
//            }
//            var emptyLI = document.createElement('li');
//            emptyLI.className = "quick-actions-drop-up-ugly-clearfix";
//            pagesList.appendChild(emptyLI);
//        },

        _createNavItemsFromDataItems: function (navGroup, dataItems, level, parentNode) {
            for (var i = 0; i < dataItems.length; i++) {
                var currentItem = dataItems[i];
                this._createSingleNavItem(navGroup, currentItem, level, parentNode);
            }
        },

        _createSingleNavItem: function (navGroup, dataItem, level) {
            var levelIndicator = '&nbsp;  ';
            var currentLevel = "";
            for (var i = 0; i < level; i++) {
                currentLevel = currentLevel + levelIndicator;
            }
            var item = document.createElement('li');
            var pageId = dataItem.get('refId');
            this._pagesMap[pageId] = item;
            var anchor = item.appendChild(new Element("div")).appendChild(new Element("a"));
            var alignHelper = new Element("span");
            alignHelper.className = "alignHelper";
            anchor.parentNode.appendChild(alignHelper);

            navGroup.appendChild(item);
            this.resources.W.Data.getDataByQuery(pageId, function (pageData) {
                var isHidden = pageData.get('hidePage');
                if(isHidden){
                    navGroup.removeChild(item);
                }else{
                    var pageTitle = pageData.get('title');
                    anchor.innerHTML = currentLevel + pageTitle;

                    var subItems = dataItem.get('items');
                    if (subItems && subItems.length > 0) {
                        item.setAttribute("class", "hasChildren");
                        var subMenu = new Element("ul");
                        subMenu.setAttribute("class", "subMenu");
                        var subMenuBtn = new Element("span");
                        subMenuBtn.setAttribute("id", "toggleBtn");
                        item.appendChild(subMenuBtn);
                        item.appendChild(subMenu);
                        this._createNavItemsFromDataItems(subMenu, subItems, level + 1, item);
                        window.Hammer(subMenuBtn).on("tap", function(event) {
                            var btn = event.currentTarget;
                            var container = btn.parentNode;
                            var list = container.children[2];
                            if (list.hasClass("open")) {
                                list.removeClass("open");
                                btn.removeClass("open");
                            } else {
                                list.addClass("open");
                                btn.addClass("open");
                            }
                            if(navGroup.parentNode.scrollHeight <= navGroup.clientHeight) {
                                item.parentNode.parentNode.addClass("hasOverflow");
                            } else {
                                item.parentNode.parentNode.removeClass("hasOverflow");
                            }
                            event.preventDefault();
                            event.stopPropagation();
                            event.gesture.preventDefault();
                            event.gesture.stopPropagation();
                        }.bind(this));

                    }

                    if(pageId && pageId.indexOf("#") === 0){
                        pageId = pageId.substr(1);
                    }

                    window.Hammer(item).on("tap", function(event) {
                        this._hideMenu();
                        this._navigateToPage(pageId);
                        event.preventDefault();
                        event.stopPropagation();
                        event.gesture.preventDefault();
                        event.gesture.stopPropagation();
                    }.bind(this));
                }

            }.bind(this));
        },

        _onSelectedPageChanged:function(newPageId){
//            var previousSelectedPage = this._pagesMap[this._currentPage];
//            if(previousSelectedPage){
//                previousSelectedPage.removeClass('selected');
//            }
//            this._currentPage = '#' + newPageId;
//            var selectedLI = this._pagesMap[this._currentPage];
//            selectedLI.addClass('selected');

        },

        _hideMenu: function(){
            if(window.WMobileActionsMenu) {
                window.WMobileActionsMenu.hideLists();
            }
        },

        _navigateToPage: function (pageId) {
            W.Viewer.goToPage(pageId);
        }
    });
});
