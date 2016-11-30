define.experiment.newClass('wysiwyg.common.components.dropdownmenu.viewer.traits.MoreButtonHandler.Dropdownmenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function() {
            this._isMoreButtonVisible = false;
            this._moreButtonData = null;
        },

        _moveButtonsToAndFromMoreSubMenuIfNeeded: function(newWidth) {
            var moreSubMenuDataItems;
            var moreButton = this._menuContainer.getLast();
            var dataItems = this._menuDataNP.get('items');
            var moreButtonIdentifier = this.MORE_ELEMENT_SELECTOR;

            newWidth = newWidth || this.getWidth();

            if (!this._isMoreButtonVisible) {
                var shouldCreateMoreButton = (newWidth < this._menuContainer.getWidth());
                if (shouldCreateMoreButton) {
                    this._createMoreButtonDataItem();
                    this.buildItemList();

                    moreButton = this._menuContainer.getLast();
                    var moreLabelElement = this.getLabelElement(moreButton);

                    this._buttonsWidthMap[moreButtonIdentifier] = {};
                    this._buttonsWidthMap[moreButtonIdentifier].minWidth = this._getButtonWidth(moreButton);
                    this._buttonsWidthMap[moreButtonIdentifier].extraWidth = this._buttonsWidthMap[moreButtonIdentifier].minWidth - moreLabelElement.getWidth();
                    this._isMoreButtonVisible = true;
                }
                else {
                    this.buildItemList();
                    this._handleTextWidth();
                    return;
                }
            }

            var moreButtonMinWidth = this._getButtonMinWidth(moreButton);
            var index = this._getButtonIndexThatExceedsMenuWidth(newWidth - moreButtonMinWidth, moreButtonMinWidth);
            if (index !== null) {
                moreSubMenuDataItems = this._getDataItemsForMoreSubMenu(index);
                this._moveButtonDataItemsUnderMoreDataItem(moreSubMenuDataItems);
            }
            else {
                var moreButtonIndex = dataItems.length - 1;
                dataItems.splice(moreButtonIndex, 1);
                this._moveDeletedItemSubItemsUnderItemParent(this._moreButtonData.get('items'), dataItems, moreButtonIndex);
                this._resetMoreButton(moreButtonIdentifier);
            }

            this.buildItemList();
            this._handleTextWidth();
        },

        _resetMoreButton: function(moreButtonIdentifier) {
            this._isMoreButtonVisible = false;
            this._moreButtonData = null;
            delete this._buttonsWidthMap[moreButtonIdentifier || this.MORE_ELEMENT_SELECTOR];
        },

        _getMenuMinWidth: function() {
            var sum = 0,
                buttons = buttons || this._menuContainer.getChildren();
            _(buttons).forEach(function(button) {
                sum += this._getButtonMinWidth(button);
            }, this);
            return sum;
        },

        _getDataItemsForMoreSubMenu: function(index) {
            var firstLevelDataItems = this._menuDataNP.get('items');
            var moreButtonDataItems = this._moreButtonData.get('items');
            var items = firstLevelDataItems.slice(0, firstLevelDataItems.length - 1).concat(moreButtonDataItems);
            return items.slice(index, items.length);
        },

        _getButtonIndexThatExceedsMenuWidth: function(newWidth, moreButtonWidth) {
            var children = this._menuContainer.getChildren();
            var firstLevelItems = children.slice(0, children.length - 1);
            var totalWidth = 0, i= 0, itemWidth;
            var moreButton = this._menuContainer.getLast();

            //if menu size was reduced
            for (i; i<firstLevelItems.length; i++) {
                itemWidth = this._getButtonMinWidth(firstLevelItems[i]);
                totalWidth = this._calculateTotalWidth(itemWidth, totalWidth, i);
                if (totalWidth > newWidth) {
                    return i;
                }
            }

            //if menu was enlarged
            var moreSubMenuItems = this.getListElement(moreButton).getChildren();
            for (var j=0; j<moreSubMenuItems.length; j++) {
                if (j+i === firstLevelItems.length + moreSubMenuItems.length - 1) {
                    newWidth += moreButtonWidth;
                }
                itemWidth = this._getButtonMinWidth(moreSubMenuItems[j]);
                totalWidth = this._calculateTotalWidth(itemWidth, totalWidth, i + j);
                if (totalWidth > newWidth) {
                    return j + i;
                }
            }
            return null;
        },

        _calculateTotalWidth: function(itemWidth, totalWidth, index) {
            if (this._properties.get('sameWidthButtons')) {
                return (index + 1) * itemWidth;
            }
            return totalWidth + itemWidth;
        },

        _moveButtonDataItemsUnderMoreDataItem: function(subMenuDataItems) {
            var dataItems = this._menuDataNP.get('items');
            var moreButtonIndex = dataItems.length - 1;
            var itemList = dataItems.slice(0, moreButtonIndex).concat(this._moreButtonData.get('items'));
            this._moreButtonData.set('items', subMenuDataItems);
            _(subMenuDataItems).forEach(function(dataItem) {
                var dataItemIndex = itemList.indexOf(dataItem);
                if (dataItemIndex > -1) {
                    itemList.splice(dataItemIndex, 1);
                }
            });
            this._menuDataNP.set('items', itemList.concat(this._moreButtonData));
        },

        _createMoreButtonDataItem: function() {
            this._moreButtonData = this.resources.W.Data.createDataItem({type: 'list', items: []});
            this._moreButtonData.setMeta('isPersistent', false);
            this._menuDataNP.get('items').push(this._moreButtonData);
        },

        _moveDeletedItemSubItemsUnderItemParent: function(oldItemList, newItemList, newIndex) {
            _.forEach(oldItemList, function(subItem, index) {
                newItemList.splice(newIndex + index, 0, subItem);
            });
            oldItemList = [];
        }
    });
});