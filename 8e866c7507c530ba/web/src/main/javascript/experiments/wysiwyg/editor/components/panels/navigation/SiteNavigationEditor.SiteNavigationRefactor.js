/**@Class wysiwyg.editor.components.panels.navigation.SiteNavigationEditor*/
define.experiment.component('wysiwyg.editor.components.panels.navigation.SiteNavigationEditor.SiteNavigationRefactor', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.customizeField(function(bindArr) {
        bindArr.push('_reorderItemsData');
        return _.filter(bindArr, function(methodName){
            return methodName !== '_reorderPagesData';
        });
    }));

    def.methods({

        initialize: strategy.after(function(compId, viewNode, args) {
            if (args && args.maxSubmenuLevels) {
                this._maxSubmenuLevels = args.maxSubmenuLevels;
            }
        }),

        _registerCommands: function(){
            this._treeEditor.on('TreeItemMoveComplete', this, function(params) {
                this._reorderItemsData(params.data);
            });
        },

        unregisterCommands: function(){
            this._treeEditor.offByListener(this);
            this._data.removeEvent(Constants.DataEvents.DATA_CHANGED, this._treeEditor.updatePanel);
            this._treeEditor.unregisterCommands();
        },

        /**
         * @override
         */
        _onAllSkinPartsReady: function () {
            this._treeEditor = this._skinParts.treeEditor;
            this._registerCommands();
        },

        /**
         * @override
         * @param {String} dataQuery - the Menu Data Item's data query
         * @param {Object=} buttonType - The Navigation Button type (defaults to SiteNavigationButton)
         * @param {Object=} args - arguments, passed on to the TreeStructureEditor init function
         */
        initMenu: function (dataQuery, buttonType, args) {
            dataQuery = dataQuery || '#MAIN_MENU';
            buttonType = buttonType || Constants.NavigationButtons.SITE_NAVIGATION_BUTTON;

            this._isMainMenu = (dataQuery === '#MAIN_MENU');

            if (this._isMainMenu) {
                this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onSitePageChanged);
            }

            var dataItem = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(dataQuery);

            this._handleMenuData(dataItem);
            this._initTreeStructure(buttonType, args);
        },

        /**
         * @override
         */
        //creates the tree according to the menu data
        _handleMenuData: function (menuData) {
            this.setDataItem(menuData);
            this._treeEditor.setDataItem(menuData);
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._treeEditor.updatePanel);
        },

        /**
         * @param buttonType
         * @param args - passed on to the TreeStructureEditor
         * @private
         */
        _initTreeStructure: function(buttonType, args) {
            var items = this._data.getItems(true);

            this._treeEditor.setSingleItemComponentType(buttonType.compType, buttonType.skin);
            this._treeEditor.createTreeItemsFromDataItems(items, 0, null, args);
            if (this._maxSubmenuLevels) {
                this._treeEditor.setMaxSubitemLevel(this._maxSubmenuLevels);
            }
        },

        // Rename _reorderPagesData --> _reorderItemsData
        _reorderPagesData: strategy.remove(),

        //reorder the data according to the new tree order
        _reorderItemsData: function (params) {
            var parentData = params.parentData,
                itemIndex = params.index,
                itemToMove = params.sourceItem,
                itemData = itemToMove.getDataItem();

            this._data.moveItemToParentAtIndex(itemData, parentData, itemIndex);

            if (this._isMainMenu) {
                //keep updating site structure for old menu purposes
                this._reorderSiteStructureData(itemToMove);
            }
        },

        _onSitePageChanged: function (pageId) {
            var treeButtons = this._treeEditor.getTreeButtons();
            for (var i = 0; i < treeButtons.length; i++) {
                var item = treeButtons[i];
                if (item.isSelected(pageId)) {
                    treeButtons[i].setState('selected');
                } else {
                    treeButtons[i].setState('up');
                }
            }
        },
    });
});
