define.experiment.component('wysiwyg.common.components.basicmenu.viewer.BasicMenu.CustomSiteMenu', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.statics({
        ASPECT_RATIO_LIMIT: 0.0,
        _NO_LINK_PROPAGATION: true
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._linkRenderer = this.resources.W.Viewer.getLinkRenderer();
            this._menuDataItem = null;
        },

        _renderLinks: function(viewNodes, dataNodes) {
            var i, viewNode, dataNode, linkDataItem, subMenuViewNodes, subMenuDataNodes, labelElement;
            dataNodes = _.filter(dataNodes, this.isItemVisible);
            for(i = 0 ; i < viewNodes.length ; i++){
                viewNode = viewNodes[i];
                dataNode = dataNodes[i];

                if (!dataNode || !this.isItemVisible(dataNode)) {
                    continue;
                }

                linkDataItem = dataNode.getLinkedDataItem();
                labelElement = viewNode.getElement('.label');
                this._passChildClickToParent(viewNode, labelElement);
                if(linkDataItem){
                    this._linkRenderer.renderLink(labelElement, linkDataItem, this);
                } else {
                    labelElement.addEvent('click', function(e){
                        e.stopPropagation();
                    });
                }

                subMenuViewNodes = this.getListElement(viewNode).getChildren();
                subMenuDataNodes = dataNode.getVisibleItems();

                if (subMenuViewNodes.length && subMenuDataNodes.length) {
                    this._renderLinks(subMenuViewNodes, subMenuDataNodes);
                }


            }
        },

        _handleSkinChange: function() {
            if (!this._skinParts.menuItem) {
                throw new Error('Skin did not supply menuItem skinpart'); //should send to logger?
            }

            //Cloning the menuItem skinPart because IE deletes its content when clearing the menuContainer content (in buildItemList)
            //This skinPart is not in the DOM (only used as a template for generating other elements)
            this._skinParts.menuItem = this._skinParts.menuItem.cloneNode(true);
            if (this._skinParts.subMenuItem) {
                this._skinParts.subMenuItem = this._skinParts.subMenuItem.cloneNode(true);
            }

            this._menuContainer = this._skinParts.menuContainer;
            this.buildItemList();
            //is this needed? this function is being called from buildItemList
            this._renderLinks(this._menuContainer.getChildren(), this._menuDataNP.getVisibleItems());

            this._handleAspectRatioLimit();
        },

        _passChildClickToParent: function(parent, child){
            parent.removeEvents('click');
            parent.addEvent('click', function(){
                child.click();
                return false;
            });
        },

        _getDataChange: function(renderEvent, isPropertyChange) {
            var isPropertyItem, invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.DATA_CHANGE);
            return _(invalidationObj).find(function(singleItem){
                isPropertyItem = singleItem.dataItem && singleItem.dataItem.$className === 'core.managers.data.PropertiesItem';
                return isPropertyChange ? isPropertyItem : !isPropertyItem;
            });
        }
    });
});