define.component('wysiwyg.common.components.basicmenu.viewer.BasicMenu', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.dataTypes(['Menu', 'MenuDataRef']);

    def.traits(['wysiwyg.common.components.basicmenu.viewer.traits.MenuElementsParser',
                'wysiwyg.common.components.basicmenu.viewer.traits.BasicMenuDataHandler',
                'wysiwyg.common.components.basicmenu.viewer.traits.MenuDomBuilder']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']);

    def.resources(['W.Viewer', 'W.Data']);

    def.skinParts({
        menuContainer: {type: 'htmlElement'}
    });

    def.statics({
       ASPECT_RATIO_LIMIT: 0.0
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._linkRenderer = new this.imports.LinkRenderer();
            this._menuDataItem = null;
        },

        _onRender: function(renderEvent) {
            if (this._isFirstDataChange(renderEvent)) {
                this._handleFirstDataChange();
            }
            if (this._hasSkinChanged(renderEvent) || this._hasCompBeenDisplayed(renderEvent)) {
                this._handleSkinChange();
            }
        },

        /* Should be implemented!*/
        getItemLabel: function(dataItem){},

        /* Should be implemented!*/
        getSelectedLinkId: function(){},

        _isFirstDataChange: function(renderEvent){
            var dataChange = this._getDataChange(renderEvent);
            return !!(this._isFirstRender(renderEvent) && dataChange);
        },

        _isFirstRender: function(renderEvent) {
            return !!renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.FIRST_RENDER);
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
            this._renderLinks(this._menuContainer.getChildren(), this._menuDataNP.get('items'));

            this._handleAspectRatioLimit();
        },

        _handleAspectRatioLimit: function(){
            if(!this._skinParts.limitAspectRatio || !this.ASPECT_RATIO_LIMIT){
                return;
            }

            this._sizeLimits = this._sizeLimits || {};
            this._sizeLimits.maxH = this.getWidth() * this.ASPECT_RATIO_LIMIT;
        },

        setWidth: function(width){
            this.parent(width);
            this._handleAspectRatioLimit();
        },

        _renderLinks: function(viewNodes, dataNodes) {
            _.forEach(dataNodes, function(dataNode) {
                if (!this.isItemVisible(dataNode)) {
                    return;
                }

                var linkId = dataNode.get('link');
                if (!linkId) {
                    return;
                }
                var linkDataItem = this.resources.W.Data.getDataByQuery(linkId);
                var viewNodes = this._getViewNodesByLinkId(linkId);

                _.forEach(viewNodes, function (viewNode) {
                    var labelElement = this.getLabelElement(viewNode);

                    //Render link for current item
                    if(labelElement) {  //TODO: Remove this when done working with XSkin
                        this._linkRenderer.renderLink(labelElement, linkDataItem, this);
                    }

                    //Render links for sub items
                    var subMenuDataNodes = dataNode.get('items');
                    var subMenuViewNodes = this.getListElement(viewNode).getChildren();
                    if (subMenuViewNodes.length && subMenuDataNodes.length) {
                        this._renderLinks(subMenuViewNodes, subMenuDataNodes);
                    }
                }, this);
            }, this);
        },

        _hasSkinChanged: function(renderEvent) {
            return !!renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.SKIN_CHANGE);
        },

        _hasCompBeenDisplayed: function(renderEvent) {
            return !!renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.DISPLAY);
        },

        _getDataChange: function(renderEvent, isPropertyChange) {
            var isPropertyItem, invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.DATA_CHANGE);
            return _(invalidationObj).find(function(singleItem){
                isPropertyItem = singleItem.dataItem.$className === 'core.managers.data.PropertiesItem';
                return isPropertyChange ? isPropertyItem : !isPropertyItem;
            });
        },

        _getPropertyChange: function(renderEvent) {
            return this._getDataChange(renderEvent, true);
        },

        dispose: function(){
            if(this._mainMenuData){
                this._mainMenuData.removeEvent(Constants.DataEvents.DATA_CHANGED, this._onMainMenuDataChange);
            }
            this.parent();
        }
    });
});