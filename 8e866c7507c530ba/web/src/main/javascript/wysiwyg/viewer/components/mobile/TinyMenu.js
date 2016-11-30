define.component("wysiwyg.viewer.components.mobile.TinyMenu", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.resources(['W.Commands','W.Data','W.Viewer']);

    def.traits(['wysiwyg.viewer.components.traits.FixedComponentTrait']);

    def.skinParts({
        'menuButton'    :   { type:'htmlElement' },
        'menuContainer' :   { type:'htmlElement' }
    });

    def.dataTypes(['Menu']);

    def.propertiesSchemaType('TinyMenuProperties');

    def.binds(['_onEditModeChanged']);

    def.states({
        "direction": ["right", "left", "center"]
    });

    def.fields({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            mobile:{
                custom:[
                    {
                        label:'FPP_DESIGN_LABEL',
                        command: 'WEditorCommands.ShowMobileMenuPanel'
                    },
                    {
                        label:'FPP_NAVIGATE_LABEL',
                        command:'WEditorCommands.MobilePages',
                        commandParameter:{
                            galleryConfigID:'pagesPanel'
                        }
                    }
                ],
                disablePropertySplit: true
            }
        }
    });

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._resizableSides = [];
            this._usesExternalData = true;
        },

        _onAllSkinPartsReady:function(){
            this._skinParts.menuButton.addEvent('click', this._toggleMenu.bind(this));
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditModeChanged);
            this._skinParts.menuContainer.collapse();
        },

        render: function () {
            var childrenIds = this._data.getItems();
            this._asyncGetChildren(childrenIds,  function(data){
                var container = this._skinParts.menuContainer;

                this._clearOldContent(container);

                if(_.isEmpty(data)){
                    this._mainMenu = undefined;
                    return false;
                }

                this._mainMenu = this._initMenu(data, container);

                var currentPageId = this.resources.W.Viewer.getCurrentPageId();
                this._setCurrentPage(this._mainMenu, currentPageId);
            }.bind(this));

            this.parent();
        },

        isFixedPositioned: function() {
            return this._$pos === "fixed";
        },

        _clearOldContent: function _clearOldChildren(domElement){
            while (domElement.firstChild) {
                domElement.removeChild(domElement.firstChild);
            }
        },

        _onEditModeChanged: function(mode){
            this._closeMainMenu(mode);
            this.render();
        },

        _applyResponsiveStyling: function applyResponsiveStyling(menu){
            var margin = 20;
            var container = this._skinParts.menuContainer;
            var siteStructureNode = this.resources.W.Viewer.getCompByID('SITE_STRUCTURE');
            var siteWidth = _.parseInt(siteStructureNode.getStyle('width'));
            var siteLeft =  _.parseInt(siteStructureNode.getPosition().x);
            siteWidth = siteWidth - (margin * 2);
            container.setStyle("width",siteWidth);
            var buttonLeft = _.parseInt(this._view.getPosition().x);
                buttonLeft = buttonLeft - siteLeft - margin;
            var distanceLeftDelta = -1 * (buttonLeft);
            container.setStyle("left", distanceLeftDelta);
        },

        _initMenu: function initMenu(data, container){
            if(!data || _.isEmpty(data)){
                return;
            }

            var menu = this._buildMenu(data, true);

            this._addElement(container, menu);

            this._bindMenuEvents(menu);

            var state = this.getComponentProperty('direction');
            this.setState(state, "direction");

            return menu;
        },

        _bindMenuEvents: function bindMenuEvents(menu) {
            //Handle click on toggle buttons (open/close sub-menu)
            menu.addEvent('click', function(e){
                var elm = e.target;

                if(elm.className.indexOf('tiny-menu-toggle-items') > -1) {
                    var parentLi = elm.parentElement;
                    this._toggleClass(parentLi, 'tiny-menu-open');
                    this._setMinHeightFromMenu();
                }
            }.bind(this));


            this._setCurrentPageTracking(menu);
        },

        _toggleMenu: function menuButtonClickHandler() {
            var menuButton = this._skinParts.menuButton;

            if(menuButton.className.indexOf('tiny-menu-open') > -1) {
                this._closeMainMenu();
            }
            else {
                this._openMainMenu();
            }
        },

        _openMainMenu: function openMainMenu() {
            var menu = this._mainMenu;
            var menuButton = this._skinParts.menuButton;
            if (!menu) {
                return;
            }

            //Open parental section of current page, close others
            _.filter(menu.children, function(menuItem){
                var hasChildren = $(menuItem).hasClass('hasChildren');
                var subMenu = menuItem.getElementsByTagName('ul')[0];
                return hasChildren && subMenu;
            }).forEach(function(menuItem){
                var subMenu = menuItem.getElementsByTagName('ul')[0];
                var hasCurrentPageInSubMenu = subMenu.querySelector('li>.tiny-menu-current-page');
                if(hasCurrentPageInSubMenu){
                    $(menuItem).addClass('tiny-menu-open');
                } else {
                    $(menuItem).removeClass('tiny-menu-open');
                }
            });
            this._applyResponsiveStyling(menu);
            menu.addClass('tiny-menu-open');
            menuButton.addClass('tiny-menu-open');
            this._skinParts.menuContainer.uncollapse();

            this._setMinHeightFromMenu();
        },

        _closeMainMenu: function closeMainMenu(mode) {
            var menu = this._mainMenu;
            var menuButton = this._skinParts.menuButton;
            if (!menu) {
                return;
            }
            if (menu.hasClass('tiny-menu-open') || menuButton.hasClass('tiny-menu-open')){
                menu.removeClass('tiny-menu-open');
                menuButton.removeClass('tiny-menu-open');
                this._skinParts.menuContainer.collapse();

                if (!mode || mode === 'PREVIEW'){
                    this.resources.W.Viewer.getSiteNode().getLogic().resetMinHeightFromMenu();
                }
            }
        },

        _setMinHeightFromMenu: function(){
            var fullHeight = this._skinParts.menuContainer.getSize().y + this._skinParts.menuContainer.getPosition().y;
            this.resources.W.Viewer.getSiteNode().getLogic().setMinHeightFromMenu(fullHeight);
        },

        _buildMenu: function buildMenu(data, topLevel) {
            var menu;
            menu = new Element("ul");
            menu.setAttribute('class', ((topLevel) ? 'tiny-menu-top-menu' : 'tiny-menu-sub-menu'));
            this._addItems(data, menu);

            return menu;
        },

        _addItems: function addItems(itemsData, menu){
            _.forEach(itemsData, function(itemData){
                var item = this._buildItem(itemData);
                var children = itemData.children;
                if(children && _.isArray(children) && !_.isEmpty(children)){
                    var toggleButton = this._buildToggleButton();
                    this._addElement(item, toggleButton);
                    var subMenu = this._buildMenu(children);
                    this._addElement(item, subMenu);
                }
                this._addElement(menu, item);
            },this);
        },

        _buildItem: function buildItem(itemData){
            var name = itemData.name;
            var id = itemData.id;
            var children = itemData.children;
            var hasChildren = (children && _.isArray(children) && !_.isEmpty(children));
            var item = new Element("li");
            if(hasChildren) {
                item.setAttribute('class', 'hasChildren');
            }
            var link = this._buildLink(name, id);
            item = this._addElement(item, link);
            return item;
        },

        _buildLink: function buildLink(name, id){
            var link = new Element("a");
            link.innerHTML = name;
            link.setAttribute('data-refid',id);
            link = this._bindPageNavigation(link, id);
            var hashString = W.Utils.hash.getHashPartsString(id, name);
            link.setAttribute('link-ref', '#!' + hashString);
            return link;
        },

        _buildToggleButton: function buildToggleButton(){
            var button = new Element("span");
            button.setAttribute('class', 'tiny-menu-toggle-items');
            return button;
        },

        _bindPageNavigation: function bindPageNavigation(linkElement, id){
            linkElement.addEvent('click', function(){
                this._navigateToPage(id);
                this._closeMainMenu();  //Close the menu
            }.bind(this));
            return linkElement;
        },

        _setCurrentPageTracking: function(menu){
            this.resources.W.Commands.registerCommandAndListener("WViewerCommands.SelectedPageChanged",
                this,
                function (pageId) {
                    this._setCurrentPage(menu, pageId);
                });
        },

        _setCurrentPage: function setCurrentPage(menu, pageId) {
            if (menu){
                var previouslySelectedPage = menu.querySelector('.tiny-menu-current-page');
                if (previouslySelectedPage){
                    $(previouslySelectedPage).removeClass('tiny-menu-current-page');
                }
                var currentlySelectedPage = menu.querySelector("[data-refid="+pageId+"]");
                if(currentlySelectedPage){
                    $(currentlySelectedPage).addClass('tiny-menu-current-page');
                }
            }
        },

        _navigateToPage: function navigateToPage(id) {
            if (id.indexOf("#") === 0) {
                id = id.substr(1);
            }
            this.resources.W.Viewer.goToPage(id);
        },

        _asyncGetChildren: function(childrenIds, callback){
            if(!_.isArray(childrenIds) || _.isEmpty(childrenIds)){
                callback([]);
                return;
            }
            var counter = childrenIds.length;
            var pagesData = [];
            _.forEach(childrenIds, function (refId) {
                this._asyncGetSinglePage(refId, function (itemData) {
                    if (itemData) {
                        pagesData.push(itemData);
                    }
                    counter = counter - 1;
                    if (counter < 1) {
                        callback(pagesData);
                    }
                });
            }, this);
        },

        _asyncGetSinglePage: function (referencedItem, callback) {
            var refID = referencedItem.get('refId');
            var childrenIds = referencedItem.get('items');

            this.resources.W.Data.getDataByQuery(refID, function (pageData) {
                var isHidden = pageData.get('mobileHidePage');
                if (isHidden) {
                    callback(null);
                    return;
                }
                var itemData = this._getItemData(pageData);
                this._asyncGetChildren(childrenIds, function (children) {
                    itemData.children = children;
                    callback(itemData);
                });
            }.bind(this)
            );
        },

//        HELPERS

        _getItemData: function getItemData(complexData){
            var item = {};
            item.id = complexData.get('id');
            item.name = complexData.get('title');
            item.children = [];
            return item;
        },

        _addElement: function addElement(container, element){
            container.appendChild(element);
            return container;
        },

        _toggleClass: function toggleClass(element, className){
            var newClassName;

            if(element.className.indexOf(className) > -1) {
                newClassName = element.className.replace(' ' + className, '');
            }
            else {
                newClassName = element.className + ' ' + className;
            }
            element.setAttribute('class', newClassName);
        },

        _createComponentProperties: function(){
            this.parent();
            //To avoid garbage collection of the properties when mobile structure is disposed
            this._properties.setIsPersistent(true);
        }
    });
});
