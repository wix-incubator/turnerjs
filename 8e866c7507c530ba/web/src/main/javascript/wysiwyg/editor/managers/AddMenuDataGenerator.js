define.Class('wysiwyg.editor.managers.AddMenuDataGenerator', function(classDefinition) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Experiments', 'W.Data']);

    def.methods({

        initialize: function() {
            this._addMenuData = null;
            this.LEVELS = {};
            this.registerMenuLevel('categories', this._createCategoryItemDataObject);
            this.registerMenuLevel('components', this._createComponentItemDataObject);
            this.createAddMenuData();
        },

        getAddMenuData: function() {
            return this._addMenuData;
        },

        registerMenuLevel: function(levelName, itemCreationFunc) {
            this.LEVELS[levelName] = {};
            this.LEVELS[levelName].ITEM_CREATION_FUNC = itemCreationFunc;
        },

        createAddMenuData: function() {
            this.resource.getResourceValue('EditorMenu', function(menuRawData) {
                var categoriesList = this._createCategoriesData(menuRawData);
                var menuItems = this._createComponentsData(categoriesList);
                this._addMenuData = this.resources.W.Data.addDataItem('COMPONENT_CATEGORIES', {type: 'SelectableList', items: menuItems, selected: null});
            }.bind(this));
        },

        _createCategoriesData: function(rawData) {
            return this._createMenuButtonDataItems(rawData.items, 'categories');
        },

        _createComponentsData: function(categoryList) {
            var menuItems = [];
            _.forEach(categoryList, function(categoryItem) {
                if (categoryItem.get('items')) {
                    categoryItem._data.items = this._createMenuButtonDataItems(categoryItem.get('items'), 'components');
                }
                menuItems.push(categoryItem);
            }, this);
            return menuItems;
        },

        _createMenuButtonDataItems: function(items, levelName) {
            var singleOptionDataItemArray = [];
            _(items)
                .filter(function(item) {
                    return (!item.experimentInclude && !item.experimentExclude) ||
                        (item.experimentInclude && this._isExperimentOpen(item.experimentInclude)) ||
                        (item.experimentExclude && !this._isExperimentOpen(item.experimentExclude));
                }, this)
                .map(function(item) {
                    singleOptionDataItemArray.push(this._createSingleOptionDataItem(item, item.name, levelName));
                }, this);
            return singleOptionDataItemArray;
        },

        _isExperimentOpen: function(checkedExperiment) {
            return this.resources.W.Experiments.isDeployed(checkedExperiment);
        },

        _createSingleOptionDataItem: function (itemData, key, levelName) {
            var singleItemData = this.LEVELS[levelName].ITEM_CREATION_FUNC.apply(this, [itemData, key]);
            return this.resources.W.Data.createDataItem(singleItemData, 'Button');
        },

        _createCategoryItemDataObject: function(itemData, category) {
            var singleOptionData = {};
            for (var key in itemData) {
                singleOptionData[key] = itemData[key];
            }
            singleOptionData.type = 'Button';
            singleOptionData.command = this._getCategoryCommand(category);
            singleOptionData.commandParameter = this._getCategoryCommandParameter(category, singleOptionData);
            return singleOptionData;
        },

        _getCategoryCommand: function(category) {
            switch(category) {
                case 'listBuilder':
                    return 'WAppsEditor2Commands.CreateAppFromTemplate';
                case 'blog':
                    return 'WEditorCommands.AddWixApp';
                case 'Anchor':
                    return 'WEditorCommands.AddComponent';
            }
            return 'WEditorCommands.ShowComponentCategory';
        },

        _getCategoryCommandParameter: function(category, data) {
            switch(category) {
                case 'listBuilder':
                    return {
                        type: "list"
                    };
                case 'Anchor':
                    return data.preset;
                case 'blog':
                    return {
                        category: "blog",
                        showCategory: "blog",
                        widgetId: "31c0cede-09db-4ec7-b760-d375d62101e6",
                        items: data.items,
                        labels: {
                            active: "ADD_COMP_TITLE_blog",
                            notActive: "BLOG_PANEL_SECTIONS"
                        },
                        appPackageName: "blog"
                    };
            }
            return { category: category};
        },

        _createComponentItemDataObject: function(itemData) {
            var singleOptionData = {};
            for (var key in itemData) {
                if (key === 'preset') {
                    singleOptionData.commandParameter = itemData[key];
                }
                else {
                    singleOptionData[key] = itemData[key];
                }
            }
            singleOptionData.type = 'Button' ;
            singleOptionData.command = this._getComponentCommand(itemData);
            return singleOptionData;
        },

        _getComponentCommand: function(data) {
            var compType = data.preset.compType || data.preset.type;
            switch(compType) {
                case 'addLoginButton':
                    return 'WEditorCommands.AddSMDependantComponent';
                case 'wixappsPart':
                    data.preset.type = compType;
                    delete data.preset.compType;
                    return 'WEditorCommands.AddAppComponent';
                case 'openAppMarket':
                    return 'WEditorCommands.Market';
                case 'WPhoto':
                case 'ClipArt':
                case 'addDocumentMedia':
                case 'addAudioPlayer':
                case 'addSvgShape':
                case 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer':
                    return "WEditorCommands.addComponentViaMediaGallery";
            }
            return 'WEditorCommands.AddComponent';
        }
    });
});
