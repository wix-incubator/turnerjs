define.component('wysiwyg.editor.components.panels.ChangeGalleryPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SelectableListPanel');

    def.resources(['W.Data']);

    def.binds(['_resetData']);

    def.skinParts({
        content: { type: 'htmlElement' },
        scrollableArea: { type: 'htmlElement' },
        selectionList: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataType: 'SelectableList',
            argObject: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonMenuSkin'},
            hookMethod: '_createDataItem'
        }
    });

    /**
     * @lends wysiwyg.editor.components.panels.ChangeGalleryPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._args = args;
            this._generateImageRefsArray(args.itemIds);
            this._componentTypes = this.resources.W.Data.getDataByQuery('#COMPONENT_TYPES');
            this._oldData = [];
            this._selectedItem = 0;
        },
        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.scrollableArea.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.injects().Utils.stopMouseWheelPropagation);
            this._skinParts.selectionList.setSelectedItemByIndex(this._selectedItem);
        },
        _generateImageRefsArray: function(dataItemIds){
            var dataMgr = this.resources.W.Preview.getPreviewManagers().Data;
            this._dataRefs = {items: { isList: true, items: []}};
            dataItemIds.forEach(function(dataItemId){
                var rawData = _.clone(dataMgr.getDataByQuery(dataItemId).getData());
                this._dataRefs.items.items.push({
                    data: rawData
                });
            }, this);
        },

        /*override*/
        _createDataItem: function (definition) {
            var items = this._getGalleryItems();
            items.forEach(this._setGalleryItems, this);

            definition.dataItem = this.resources.W.Data.createDataItem({type: 'SelectableList', items: items, selected: null});
            return definition;
        },

        _setGalleryItems: function(gallery, index){
            var compType = gallery._data.commandParameter.compType,
                compItem = this._componentTypes._data.items[compType],
                compData = compItem && compItem.component;

            if(!compData){
                return;
            }

            this._oldData.push({
                command: gallery._data.command,
                commandParameter: gallery._data.commandParameter,
                dataRefs: Object.clone(compData.dataRefs)
            });


            if(typeof compData === 'function'){
                gallery._data.commandParameter.compData = compData();
            } else {
                gallery._data.commandParameter.compData = compData;
            }

            if(gallery._data.commandParameter.compData.comp === this._args.galleryClass){
                this._selectedItem = index;
            }

            gallery._data.command = 'ChangeGallery.AddNewGallery';
            gallery._data.commandParameter.compData.dataRefs = this._dataRefs;
        },

        _getGalleryItems: function() {
            var categoryItems = this.resources.W.Editor.getAddMenuData().get('items');
            var galleryDataItems = _.find(categoryItems,function (categoryItem) {
                return categoryItem.get('name') === 'gallery';
            }, this).get('items');
            return _.map(galleryDataItems, function(item){
                 var rawData = _.clone(item.getData());
                return this.resources.W.Data.createDataItem(rawData);
            }, this);
        },

        reset: function(){
            var items = this._getGalleryItems();
            items.forEach(this._resetData, this);
        },
        _resetData: function(gallery, index){
            var oldData = this._oldData[index],
                compType;

            if(!oldData){
                return;
            }

            compType = oldData.commandParameter.compType;
            delete oldData.commandParameter.compData;

            gallery.set('command', oldData.command);
            gallery.set('commandParameter', oldData.commandParameter);

            this._componentTypes.get('items')[compType].component.dataRefs = oldData.dataRefs;
        }
    });
});