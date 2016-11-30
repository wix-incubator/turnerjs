define.experiment.Class('wysiwyg.common.components.basicmenu.viewer.traits.MenuDomBuilder.CustomSiteMenu', function(classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({

        isItemVisible: function(dataItem) {
            return dataItem.get('isVisible');
        },

        getLabelElemParams: function(dataItem) {
            var href, label, link = dataItem.get('link'), linkedData;

            if(!link || link === '#CUSTOM_MENU_HEADER'){
                return {html: dataItem.get('label'), 'class': 'label'};
            }

            linkedData = dataItem.getLinkedDataItem();
            href = this.resources.W.Viewer.getLinkRenderer().renderLinkDataItem(linkedData);
            label = dataItem.get('label') || this.resources.W.Viewer.getLinkRenderer().renderLinkDataItemForCustomMenu(linkedData);

            return {html: label, href: href, 'class': 'label'};
        },

        buildItemList: function() {
            var items = this._menuDataNP.getVisibleItems();
            this._menuContainer.set('html', '');
            this._buildMenuDomAccordingToData(items, this._menuContainer);
            this._renderLinks(this._menuContainer.getChildren(), items);
            this._setMenuMinHeight();
            this._setSelectedButton(this.getSelectedLinkId());
        },

        _buildItem: function(dataItem, parent) {
            var elementInstance = this._getElementInstanceAccordingToTemplate(parent);
            var parsedElement = this.parseElement(elementInstance);

            this._arrangeLabel(parsedElement.label, dataItem);
            this._arrangeList(parsedElement.list);
            this._arrangeLinkAttribute(parsedElement.item, dataItem);
            this._arrangeItem(parsedElement.item, parent);

            return parsedElement.item;
        },

        _arrangeLinkAttribute: function (itemElement, dataItem) {
            itemElement.setAttribute('linkId', dataItem.get('link'));
            if(!dataItem.getLinkedDataItemType()){
                itemElement.addClass('noLink');
            }
        },

        _onMenuClicked: strategy.remove()
    });
});