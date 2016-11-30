define.component('wysiwyg.editor.components.panels.navigation.TreeStructureEditor', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.resources(['W.Classes', 'W.Commands']);
    def.binds(['createTreeItemsFromDataItems', '_createSingleTreeItem', '_onButtonReady', 'updatePanel', '_reorderTree']);
    def.skinParts({
        container: { type: 'htmlElement'}
    });
    def.dataTypes(['Menu', '']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Classes.get('wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler', function (TreeStructureDragHandler) {
                this._dragHandler = new TreeStructureDragHandler();
            }.bind(this));

            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.TreeItemMoved', this, this._reorderTree);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.TreeItemStateChanged', this, this._ItemStateChanged);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.TreeItemDrop', this, this._executeDataReorder);
        },

        _onAllSkinPartsReady: function () {
            this._treeButtons = [];
        },

        setScrollContainer: function (scrollArea) {
            this._scrollContainer = scrollArea;
        },

        setSingleItemComponentType: function (compName, compSkin) {
            this._itemCompName = compName;
            this._compSkin = compSkin;
        },

        createTreeItemsFromDataItems: function (dataItems, level, parentItem) {
            for (var i = 0; i < dataItems.length; i++) {
                var currentItem = dataItems[i];
                this._createSingleTreeItem(currentItem, level, parentItem);

                var subItems = currentItem.get('items');
                if (subItems && subItems.length > 0) {
                    this.createTreeItemsFromDataItems(subItems, level + 1, currentItem);
                }
            }
        },

        _createSingleTreeItem: function (itemData, itemLevel, parentItem) {
            return this.injects().Components.createComponent(
                this._itemCompName,
                this._compSkin,
                itemData,
                null,
                null,
                function (treeItem) {
                    this._onButtonReady(treeItem, itemLevel, parentItem);
                }.bind(this)

            );
        },

        /**
         * Called when the panel should be updated according to the data
         * @param param
         */
        updatePanel: function (param) {
            var cause = param.cause;
            var item = param.item;
            var parentItem = param.parentItem;
            if (cause == "CREATED_AND_ADDED") {
                this._addItemToTree(item, parentItem);
            } else if (cause == "DELETE") {
                this._removeItemFromTree(item);
            } else if (cause == "MOVE") { //move that was not from the panel
                var newItemIndex = param.newIndex;
                this._moveItemInTree(item, parentItem, newItemIndex);
            }
        },

        /**
         * an item should be added to the tree
         * @param item
         * @param parentItem
         */
        _addItemToTree: function (item, parentItem) {
            var level = this._data.getItemLevel(item);
            this._createSingleTreeItem(item, level, parentItem);
            if (!parentItem) {
                this._addedNew = true;
            }
        },

        /**
         * an item should be removed from the tree
         * @param item
         */
        _removeItemFromTree: function (item) {
            var btnToDelete = this._findButtonByData(item);
            if (!btnToDelete) {
                return;
            }
            var btnIndex = this._findButtonIndex(btnToDelete);
            var subItems = this._getSubItems(btnToDelete);
            if (subItems && subItems.length > 0) {
                for (var i = 0; i < subItems.length; i++) {
                    var subItem = subItems[i];
                    subItem.setAsParentItem();
                }
            }
            this._treeButtons.erase(btnToDelete);
            btnToDelete.dispose();
            this.drawPanel();
        },

        /**
         * an item should be moved in the tree to the new index
         * @param item
         * @param parentItem
         * @param newItemIndex
         */
        _moveItemInTree: function (item, parentItem, newItemIndex) {
            if (!this._moveDoneInPanel) {
                var itemToMove = this._findButtonByData(item);
                var btnIndex = this._findButtonIndex(itemToMove);
                this._reorderSingleItem(itemToMove, newItemIndex, btnIndex);

                var parentBtn = this._findButtonByData(parentItem);
                if (itemToMove.isSubItem() && !parentBtn) {
                    itemToMove.setAsParentItem();
                }
            } else {
                //by default should be false - assume move for outside of editor.
                // should return to default value after move inside panel
                this._moveDoneInPanel = false;
            }
        },

        _onButtonReady: function (treeItem, itemLevel, parentItem) {
            this._updateButtons(treeItem, itemLevel, parentItem);
            if (this._treeButtons.length == this._data.getAllItems().length) {
                this.drawPanel();
            }

            var handler = function (e) {
                this._setDragContainerOnce();
                this._dragHandler.setScrollContainer(this._scrollContainer);
                var treeItemIndex = this._findButtonIndex(treeItem);
                var subItems = this._getSubItems(treeItem);
                if (treeItem.isSubItem() && !this._isLastSubItem(treeItemIndex)) {
                    this._dragHandler.forceToBeSubItem(true);
                } else {
                    this._dragHandler.forceToBeSubItem(false);
                }
                this._dragHandler.onItemDrag(e, treeItem, treeItemIndex, subItems);
            }.bind(this);
            treeItem.registerDragHandler(handler);
        },

        _updateButtons: function (treeItem, itemLevel, parentItem) {
            if (parentItem) {
                treeItem.setAsSubItem();
                var parentButton = this._findButtonByData(parentItem);
                var parentIndex = this._findButtonIndex(parentButton);
                var numOfChildren = this._getSubItems(parentButton).length;
                this._treeButtons.splice(parentIndex + numOfChildren + 1, 0, treeItem);
            } else {
                this._treeButtons.push(treeItem);
            }
        },

        _getSubItems: function (treeItem) {
            if (treeItem.isSubItem()) {
                return [];
            }
            var itemIndex = this._findButtonIndex(treeItem);
            var subItems = [];
            for (var i = itemIndex + 1; i < this._treeButtons.length; i++) {
                if (!this._treeButtons[i].isSubItem()) {
                    break;
                } else {
                    subItems.push(this._treeButtons[i]);
                }
            }
            return subItems;

        },

        drawPanel: function () {
            var currentScroll = this._scrollContainer.scrollTop;
            this._skinParts.container.empty();
            for (var i = 0; i < this._treeButtons.length; i++) {
                this._treeButtons[i]._view.insertInto(this._skinParts.container);
            }
            if (this._addedNew) {
                this._scrollContainer.scrollTop = this._skinParts.container.clientHeight - this._scrollContainer.clientHeight;
                this._addedNew = false;
            } else {
                this._scrollContainer.scrollTop = currentScroll;
            }
        },

        //        _reorderPanel:function(newIndex, oldIndex) {
        //            var container = this._skinParts.container;
        //            var childNodes = container.childNodes;
        //            if(newIndex > oldIndex){ //moving down
        //                container.insertBefore(childNodes[oldIndex], childNodes[newIndex + 1]);
        //            }else{ //moving up
        //                container.insertBefore(childNodes[oldIndex], childNodes[newIndex]);
        //            }
        //        },
        //
        //        _deleteButtonFromPanel:function(buttonToDeleteIndex){
        //            var container = this._skinParts.container;
        //            var childNodes = container.childNodes;
        //            container.removeChild(childNodes[buttonToDeleteIndex]);
        //
        //        },

        /**
         * Find all the possible Drop Indexes for the item that is being dragged
         * @param itemBeingDragged
         * @param direction
         */
        _locateDropIndexes: function (itemBeingDragged, direction) {
            var allowedIndexes = [];
            var itemIndex = this._findButtonIndex(itemBeingDragged);
            var isSubItem = itemBeingDragged.isSubItem();
            var subItems = this._getSubItems(itemBeingDragged);
            //the item being dragged is a subItem or an item without any children
            if (isSubItem || (!isSubItem && subItems.length == 0)) {
                for (var i = 0; i < this._treeButtons.length; i++) {
                    allowedIndexes.push(i);
                }
                return allowedIndexes;
            }
            var j;
            if (direction == "UP") {
                for (j = 0; j < this._treeButtons.length; j++) {
                    var currentItem = this._treeButtons[j];
                    if (!currentItem.isSubItem()) {
                        allowedIndexes.push(j);
                    }
                }
            } else {
                for (j = 0; j < this._treeButtons.length; j++) {
                    var itemLastChildIndex = itemIndex + subItems.length;
                    if (j <= itemIndex || j > itemLastChildIndex) {
                        var currentItem = this._treeButtons[j];
                        if ((this._getSubItems(currentItem).length == 0 && !currentItem.isSubItem()) || (currentItem.isSubItem() && this._isLastSubItem(j))) {
                            allowedIndexes.push(j);
                        }
                    }
                }
            }

            return allowedIndexes;
        },

        /**
         * tree reordering
         * Reorders the tree according to the moved item status (with/without sub items)
         * @param params
         */
        _reorderTree: function (params) {
            var itemToMove = params.sourceItem;
            var newIndex = params.newIndex;
            var subItems = this._getSubItems(itemToMove) || [];
            var oldIndex = this._findButtonIndex(itemToMove);

            if (subItems.length == 0) {
                this._reorderSingleItem(itemToMove, newIndex, oldIndex);
            } else {
                this._reorderWithSubItems(itemToMove, newIndex, oldIndex);
            }

            this._dragHandler.setSourceItemIndex(newIndex);
            //this._reorderPanel(newIndex, oldIndex);
            this.drawPanel();
        },


        /**
         * moves an item with its sub items according to the direction
         * @param itemToMove
         * @param newIndex - this index does not take in consideration sub-children, therefore when moving an item with
         * its sub items DOWN we will have to add the length of the subItems to the newIndex inorder to receive the real
         * Button index
         * @param oldIndex
         */
        _reorderWithSubItems: function (itemToMove, newIndex, oldIndex) {
            var subItems = this._getSubItems(itemToMove) || [];
            var allowedIndices;
            var newRelativeIndex;
            if (newIndex > oldIndex) { //moving down
                allowedIndices = this._locateDropIndexes(itemToMove, "DOWN");
                newRelativeIndex = newIndex + subItems.length;
            } else { // moving up
                allowedIndices = this._locateDropIndexes(itemToMove, "UP");
                newRelativeIndex = newIndex;
            }
            if (!allowedIndices.contains(newRelativeIndex)) {
                return;
            }

            this._moveSingleItem(newRelativeIndex, oldIndex);
            this._reorderSubItems(subItems, newRelativeIndex, oldIndex);
        },

        /**
         * Moves the sub-items according to the parents old and new indexes
         * @param items
         * @param newIndex
         * @param oldIndex
         */
        _reorderSubItems: function (items, newIndex, oldIndex) {
            if (newIndex < oldIndex) { //moving up
                for (var i = 0; i < items.length; i++) {
                    this._moveSingleItem(newIndex + i + 1, oldIndex + i + 1);
                }
            } else {
                for (var i = 0; i < items.length; i++) {
                    this._moveSingleItem(newIndex, oldIndex);
                }
            }
        },

        /**
         * Moves a single items. Either an item that does not have children or an item that is a sub-child
         * @param itemToMove
         * @param newIndex
         * @param oldIndex
         */
        _reorderSingleItem: function (itemToMove, newIndex, oldIndex) {
            var currentItemAtNewIndex = this._treeButtons[newIndex];
            if (!currentItemAtNewIndex) return;

            //If the item should be turned into a sub item - it is being dragged into a group of subItems
            if (!itemToMove.isSubItem() && (currentItemAtNewIndex.isSubItem() || this._getSubItems(currentItemAtNewIndex).length > 0)) {
                this._dragHandler.setAsSubItem(true);
            }

            this._moveSingleItem(newIndex, oldIndex);

            if (itemToMove.isSubItem()) {
                if (newIndex == 0) {
                    this._dragHandler.setAsParentItem();
                }
                //The last item in a group of sub items is the only one that can be turned into a parent item.
                //The rest of the items are forced to be sub-items.
                if (this._isLastSubItem(newIndex)) {
                    this._dragHandler.forceToBeSubItem(false);
                } else {
                    this._dragHandler.forceToBeSubItem(true);
                }
            }
        },

        _moveSingleItem: function (newIndex, oldIndex) {
            this._treeButtons.splice(newIndex, 0, this._treeButtons.splice(oldIndex, 1)[0]);
        },


        _ItemStateChanged: function (params) {
            var itemToMove = params.sourceItem;
            var isSubItem = params.isSubItem;
            var itemIndex = this._findButtonIndex(itemToMove);
            if (isSubItem) {
                this._treeButtons[itemIndex].setAsSubItem();
            } else {
                this._treeButtons[itemIndex].setAsParentItem();
            }
        },

        _executeDataReorder: function (params) {
            var itemToMove = params.sourceItem;
            var itemIndex = this._findButtonIndex(itemToMove);
            var parentData;
            if (itemToMove.isSubItem()) {
                this._treeButtons[itemIndex].setAsSubItem();
                var parentButton = this._getParentButton(itemIndex);
                parentData = parentButton.getDataItem();
                var parentIndex = this._findButtonIndex(parentButton);
                itemIndex = itemIndex - parentIndex - 1;
            } else {
                var countSubItemsBeforeItem = 0;
                this._treeButtons[itemIndex].setAsParentItem();
                for (var i = itemIndex - 1; i >= 0; i--) {
                    var btn = this._treeButtons[i];
                    //if(btn.getState('page') != 'subPage'){
                    if (btn.isSubItem()) {
                        countSubItemsBeforeItem++;
                    }
                }
                itemIndex = itemIndex - countSubItemsBeforeItem;
            }

            this._moveDoneInPanel = true;
            this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemMoveComplete', {sourceItem: itemToMove, parentData: parentData, index: itemIndex});

        },

        _getParentButton: function (itemIndex) {
            for (var i = itemIndex - 1; i >= 0; i--) { //find the parent of the item that was moved
                var btn = this._treeButtons[i];
                if (!btn.isSubItem()) {
                    return btn;
                }
            }
        },

        _isLastSubItem: function (itemIndex) {
            var parentItem = this._getParentButton(itemIndex);
            var parentIndex = this._findButtonIndex(parentItem);
            for (var i = parentIndex + 1; i < this._treeButtons.length; i++) {
                if (i == itemIndex && (!this._treeButtons[i + 1] || !this._treeButtons[i + 1].isSubItem())) {
                    return true;
                }
            }
            return false;
        },

        _findButtonIndex: function (button) {
            for (var i = 0; i < this._treeButtons.length; i++) {
                if (this._treeButtons[i] == button) {
                    return i;
                }
            }
        },

        _findButtonByData: function (dataItem) {
            for (var i = 0; i < this._treeButtons.length; i++) {
                if (this._treeButtons[i].getDataItem() == dataItem) {
                    return this._treeButtons[i];
                }
            }
        },

        getTreeButtons: function () {
            return this._treeButtons;
        },

        _setDragContainerOnce: function () {
            if (!this._dragContainerSet) {
                this._dragHandler.setDragContainer(this._skinParts.container);
                var containerPosition = this._skinParts.container.getPosition();
                if (containerPosition.y != 0 || containerPosition.x != 0) {
                    this._dragContainerSet = true;
                }
            }
        }
    });
});
