/**@class  wysiwyg.editor.components.panels.navigation.TreeStructureEditor*/
define.experiment.component('wysiwyg.editor.components.panels.navigation.TreeStructureEditor.SiteNavigationRefactor', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.statics({
        DEFAULT_MAX_SUBITEM_LEVEL: 1 // allowing single sub-item level
    });

    def.binds(strategy.merge(['_onItemLevelChangeRequest']));

    def.methods({

        /**
         * @override
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Classes.get('wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler', function (TreeStructureDragHandler) {
                this._dragHandler = new TreeStructureDragHandler();
                //this._dragHandler.setTreeStructure(this);
            }.bind(this));

            this._registerCommands();

            this._maxItemLevel = this.DEFAULT_MAX_SUBITEM_LEVEL;
        },

        _registerCommands: function(){
            this._dragHandler.on('TreeItemMoved', this, this._reorderTree);
            this._dragHandler.on('TreeItemLevelChangeRequest', this, this._onItemLevelChangeRequest);
            this._dragHandler.on('TreeItemLevelChanged', this, this._itemLevelChanged);
            this._dragHandler.on('TreeItemDrop', this, this._executeDataReorder);
        },

        unregisterCommands: function(){
            this._dragHandler.offByListener(this);
        },

        setMaxSubitemLevel: function(level) {
            this._maxItemLevel = level;
        },

        /**
         * @override
         *
         * tree reordering
         * Reorders the tree according to the moved item status (with/without sub items)
         * @param params
         */
        _reorderTree: function (params) {
            var itemToMove = params.data.sourceItem;
            var newIndex = params.data.newIndex;
            var subItems = this._getSubItems(itemToMove) || [];
            var oldIndex = this._findButtonIndex(itemToMove);

            if (subItems.length === 0) {
                this._reorderSingleItem(itemToMove, newIndex, oldIndex);
            } else {
                this._reorderWithSubItems(itemToMove, newIndex, oldIndex);
            }

            this._dragHandler.setSourceItemIndex(newIndex);
            this.drawPanel();
        },

        /**
         * @override
         *
         * Moves a single items. Either an item that does not have children or an item that is a sub-child
         * @param itemToMove
         * @param newIndex
         * @param oldIndex
         */
        _reorderSingleItem: function (itemToMove, newIndex, oldIndex) {
            var currentItemAtNewIndex = this._treeButtons[newIndex];
            if (!currentItemAtNewIndex) return;

            var currentItemLevel = currentItemAtNewIndex.getItemLevel();

            // stepping into new parent as its first child
            if (oldIndex < newIndex && this._getSubItems(currentItemAtNewIndex).length > 0) {
                this._dragHandler.setItemLevel(Math.min(currentItemLevel + 1, this._maxItemLevel));
            } else {
                this._dragHandler.setItemLevel(currentItemLevel);
            }

            this._moveSingleItem(newIndex, oldIndex);
        },

        /**
         * @override
         */
        _reorderWithSubItems: function (itemToMove, newIndex, oldIndex) {
            var subItems = this._getSubItems(itemToMove) || [];
            var itemToMoveNewLevel;

            // Calculate the item's intended index & level after the move
            if (newIndex < oldIndex) { // moving up
                itemToMoveNewLevel = this._treeButtons[newIndex].getItemLevel();
            }  else { //moving down
                newIndex = newIndex + subItems.length; // after all its subitems

                var itemAfterCurrInNewIndex = newIndex + 1 > this._treeButtons.length ? null : this._treeButtons[newIndex + 1];
                itemToMoveNewLevel = itemAfterCurrInNewIndex ? itemAfterCurrInNewIndex.getItemLevel() : 0;
            }

            // Verify that the item's subtree won't exceed the max allowed level in its new place
            var currentSubtreeLevel = this._getMaxTreeLevel(itemToMove);
            var itemToMoveOldLevel = itemToMove.getItemLevel();
            var newSubtreeLevel = currentSubtreeLevel + (itemToMoveNewLevel - itemToMoveOldLevel);
            if (newSubtreeLevel > this._maxItemLevel) {
                return;
            }

            this._dragHandler.setItemLevel(itemToMoveNewLevel);
            this._moveSingleItem(newIndex, oldIndex);
            this._reorderSubItems(subItems, newIndex, oldIndex);
        },

        /**
         * @override
         */
        _locateDropIndexes: strategy.remove(),

        /**
         * @override
         */
        _onButtonReady: function (treeItem, itemLevel, parentItem) {
            this._updateButtons(treeItem, itemLevel, parentItem);
            treeItem.setItemLevel(itemLevel);

            if (this._treeButtons.length === this._data.getAllItems(true).length) {
                this.drawPanel();
            }

            if (treeItem.registerDragHandler && typeof treeItem.registerDragHandler === 'function') {
                var handler = function (e) {
                    this._setDragContainerOnce();
                    this._dragHandler.setScrollContainer(this._scrollContainer);
                    var treeItemIndex = this._findButtonIndex(treeItem);
                    var subItems = this._getSubItems(treeItem);
                    var itemsCount = this._data.getAllItems(true).length;
                    this._dragHandler.onItemDrag(e, treeItem, treeItemIndex, subItems, itemsCount);
                }.bind(this);
                treeItem.registerDragHandler(handler);
            }
        },

        /**
         * @override
         * @param dataItems
         * @param level
         * @param parentItem
         * @param {Object=} args - if the object contains the 'itemSpecificArgs' key,
         *                          the data inside will be passed on to the specific item's button
         *                          according to the data item's refId:
         *                          { itemSpecificArgs: { '#mainPage': { arg1: 'value1' }}}
         *                          Used in CheckboxNavigationButton to pass the button's initial checked state
         */
        createTreeItemsFromDataItems: function (dataItems, level, parentItem, args) {
            for (var i = 0; i < dataItems.length; i++) {
                var currentItem = dataItems[i];
                var itemArgs = {};
                if (args && args.itemSpecificArgs && args.itemSpecificArgs[currentItem.get('refId')]) {
                    itemArgs = args.itemSpecificArgs[currentItem.get('refId')];
                }
                itemArgs.itemLevel = level;
                this._createSingleTreeItem(currentItem, level, parentItem, itemArgs);

                var subItems = currentItem.get('items');
                if (subItems && subItems.length > 0) {
                    this.createTreeItemsFromDataItems(subItems, level + 1, currentItem, args);
                }
            }
        },

        /**
         * @override
         */
        _createSingleTreeItem: function (itemData, itemLevel, parentItem, itemArgs) {
            return this.injects().Components.createComponent(
                this._itemCompName,
                this._compSkin,
                itemData,
                itemArgs,
                null,
                function (treeItem) {
                    this._onButtonReady(treeItem, itemLevel, parentItem);
                }.bind(this)
            );
        },

        _onItemLevelChangeRequest: function(params) {
            var item = params.data.sourceItem;
            var requestedLevel = params.data.requestedLevel;
            var callback = params.data.callback;

            var allowedLevel = this._getAllowedItemLevel(item, requestedLevel);

            callback(allowedLevel);
        },

        _getAllowedItemLevel: function(item, requestedLevel) {
            var currentLevel = item.getItemLevel();
            var itemIndex = this._findButtonIndex(item);
            var indexInParent = this._getItemIndexInParent(itemIndex);

            var allowedLevel = requestedLevel;

            if (requestedLevel < currentLevel) { // Trying to level-down

                // if not last item - can't be level-downed
                var nextSibling = this._getNextSiblingInParent(itemIndex);
                if (nextSibling) {
                    allowedLevel = currentLevel;
                }
            } else { // trying to level up

                if (indexInParent === 0) { // first item - can't be level-upped
                    allowedLevel = currentLevel;
                } else if (requestedLevel > this._treeButtons[itemIndex - 1].getItemLevel() + 1) { // about to be inserted into item a too-high level
                    allowedLevel = currentLevel;
                } else if (requestedLevel > this._maxItemLevel) { // item level exceeds max level
                    allowedLevel = currentLevel;
                } else { // check sub-items max-level
                    var maxLevel = this._getMaxTreeLevel(item);
                    var levelShift = requestedLevel - currentLevel;
                    if (maxLevel + levelShift > this._maxItemLevel) {
                        allowedLevel = currentLevel;
                    }
                }
            }

            return allowedLevel;
        },

        // Rename _ItemStateChanged --> _itemLevelChanged
        _ItemStateChanged: strategy.remove(),

        _itemLevelChanged: function (params) {
            var itemToMove = params.data.sourceItem;
            var newItemLevel = params.data.itemLevel;
            var originalItemLevel = itemToMove.getItemLevel();

            this._shiftSubtreeItemsLevel(itemToMove, newItemLevel - originalItemLevel);
        },

        _shiftSubtreeItemsLevel: function(root, indexShift) {
            var items = this._getSubItems(root);
            items.unshift(root);

            var itemIndex;
            var btn;

            for (var i = 0; i < items.length; i++) {
                itemIndex = this._findButtonIndex(items[i]);
                btn = this._treeButtons[itemIndex];
                btn.setItemLevel(btn.getItemLevel() + indexShift);
            }
        },


    /**
         * @override
         * @param treeItem
         * @param itemLevel
         * @param parentItem
         * @private
         */
        _updateButtons: function (treeItem, itemLevel, parentItem) {
            if (parentItem) {
                var parentButton = this._findButtonByData(parentItem);
                var parentIndex = this._findButtonIndex(parentButton);
                var numOfChildren = this._getSubItems(parentButton).length;
                this._treeButtons.splice(parentIndex + numOfChildren + 1, 0, treeItem);
            } else {
                this._treeButtons.push(treeItem);
            }

        this.trigger('buttonAdded', {
            treeItem: treeItem,
            itemLevel: itemLevel,
            parentItem: parentItem
        });
    },

        /**
         * @override
         * @param itemIndex
         * @returns {*}
         * @private
         */
        _getParentButton: function (itemIndex) {
            var itemLevel = this._treeButtons[itemIndex].getItemLevel();
            if (itemLevel === 0) return;

            for (var i = itemIndex - 1; i >= 0; i--) { //find the parent of the item that was moved
                var btn = this._treeButtons[i];
                if (btn.getItemLevel() < itemLevel) {
                    return btn;
                }
            }
        },

        /**
         * @override
         * @param treeItem
         * @param {Boolean=} bDirectSubitems - set to true to only get direct descendants
         * @returns {Array}
         * @private
         */
        _getSubItems: function (treeItem, bDirectSubitems) {
            var itemIndex = this._findButtonIndex(treeItem);
            var itemLevel = treeItem.getItemLevel();
            var subItemLevel;
            var subItems = [];
            for (var i = itemIndex + 1; i < this._treeButtons.length; i++) {
                subItemLevel = this._treeButtons[i].getItemLevel();
                if (subItemLevel <= itemLevel) { // break when you hit the next button who isn't a sub item of the current one
                    break;
                } else {
                    if (!bDirectSubitems || (subItemLevel - itemLevel === 1)) {
                        subItems.push(this._treeButtons[i]);
                    }
                }
            }
            return subItems;
        },

        /**
         * Get max level of a tree (or sub-tree)
         * @param root (optional) - a root to check sub-item levels from
         * @private
         */
        _getMaxTreeLevel: function(root) {
            var items, maxLevel;

            if (root) {
                items = this._getSubItems(root);
                maxLevel = root.getItemLevel();
            } else {
                items = this._treeButtons;
                maxLevel = 0;
            }

            for (var i = 0; i < items.length; i++) {
                maxLevel = Math.max(maxLevel, items[i].getItemLevel());
            }

            return maxLevel;
        },

        /**
         * @override
         * @param params
         * @private
         */
        _executeDataReorder: function (params) {
            var itemToMove = params.data.sourceItem;
            var itemIndex = this._findButtonIndex(itemToMove);
            var parentButton = this._getParentButton(itemIndex);
            var parentData = parentButton ? parentButton.getDataItem() : null;

            var itemIndexInParent = this._getItemIndexInParent(itemIndex);

            this._moveDoneInPanel = true;
            this.trigger('TreeItemMoveComplete', {sourceItem: itemToMove, parentData: parentData, index: itemIndexInParent});
        },

        _getItemIndexInParent: function(itemIndex) {
            var parentButton = this._getParentButton(itemIndex);
            var parentIndex = parentButton ? this._findButtonIndex(parentButton) : -1;

            var itemLevel = this._treeButtons[itemIndex].getItemLevel();
            var idx = 0;

            // count how many same-level siblings the item has before it in its parent
            for (var i = parentIndex + 1; i < itemIndex; i++) {
                if (this._treeButtons[i].getItemLevel() === itemLevel) {
                    idx++;
                }
            }

            return idx;
        },

        _getNextSiblingInParent: function(itemIndex) {
            if (!itemIndex) return;

            var itemLevel = this._treeButtons[itemIndex].getItemLevel();
            var level;

            // count how many same-level siblings the item has before it in its parent
            for (var i = itemIndex + 1; i < this._treeButtons.length; i++) {
                level = this._treeButtons[i].getItemLevel();
                if (level === itemLevel) {
                    return this._treeButtons[i];
                } else if (level < itemLevel) {
                    return;
                }
            }
        },

        /**
         * @override
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
                    var subItemLevel = subItem.getItemLevel();
                    subItem.setItemLevel(subItemLevel - 1);
                }
            }
            this._treeButtons.erase(btnToDelete);
            btnToDelete.dispose();
            this.drawPanel();
        },

        /**
         * @override
         *
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

                // Set item level according to parent
                var parentBtn = this._findButtonByData(parentItem);
                var level = parentBtn ? parentBtn.getItemLevel() + 1 : 0;
                itemToMove.setItemLevel(level);

            } else {
                //by default should be false - assume move for outside of editor.
                // should return to default value after move inside panel
                this._moveDoneInPanel = false;
            }
        }
    });
});
