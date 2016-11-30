define.experiment.component("wysiwyg.viewer.components.mobile.TinyMenu.CustomSiteMenu", function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function() {
            this._NO_LINK_PROPAGATION = true;
            this._linkRenderer = this.resources.W.Viewer.getLinkRenderer();
        }),

        render: function () {
            var childrenIds = this._data.getItems(true),
                currentPageId = this.resources.W.Viewer.getCurrentPageId();

            this._asyncGetChildren(childrenIds,  function(data){
                var container = this._skinParts.menuContainer;

                this._clearOldContent(container);

                if(_.isEmpty(data)){
                    this._mainMenu = undefined;
                    return false;
                }

                this._mainMenu = this._initMenu(data, container);


                this._setCurrentPage(this._mainMenu, currentPageId);
            }.bind(this));

            this.parent();
        },

        _addItems: function addItems(itemsData, menu){
            var toggleButton, subMenu;

            itemsData.forEach(function(basicMenuItem){
                var item;

                if(!basicMenuItem.isVisibleMobile()){
                    return;
                }
                item = this._buildItem(basicMenuItem);

                if(basicMenuItem.hasVisibleItemsMobile()){
                    toggleButton = this._buildToggleButton();
                    subMenu = this._buildMenu(basicMenuItem.getItems());

                    this._addElement(item, toggleButton);
                    this._addElement(item, subMenu);
                }

                this._addElement(menu, item);
            }.bind(this));
        },

        _buildItem: function buildItem(basicMenuItem){
            var listItem = new Element("li");
            if(basicMenuItem.hasItems()) {
                listItem.setAttribute('class', 'hasChildren');
            }
            var link = this._buildLink(basicMenuItem);
            listItem = this._addElement(listItem, link);
            return listItem;
        },

        _buildLink: function buildLink(dataItem){
            var link = new Element("a"),
                linkedDataItem = dataItem.getLinkedDataItem();
            link.innerHTML = dataItem.getLabel();
            link.addEvent('click', this._closeMainMenu.bind(this));

            if(linkedDataItem && linkedDataItem.getType() === 'PageLink' && linkedDataItem.get('pageId')){
                link.setAttribute('data-refid', linkedDataItem.get('pageId').replace('#', ''));
            }

            if(linkedDataItem){
                this._linkRenderer.renderLink(link, linkedDataItem, this);
            }
            return link;
        },

        _asyncGetSinglePage: function (dataItem, callback) {
            if (!dataItem.isVisibleMobile()) {
                callback(null);
                return;
            }

            callback(dataItem);
        },

        _getItemData: function getItemData(dataItem){
            var item = {};
            item.link = dataItem.get('link');
            item.name = dataItem.get('label');
            item.children = [];
            return item;
        }
    });
});
