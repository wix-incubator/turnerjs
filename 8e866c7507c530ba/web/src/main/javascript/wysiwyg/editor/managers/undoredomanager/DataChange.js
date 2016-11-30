define.Class('wysiwyg.editor.managers.undoredomanager.DataChange', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition  */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview']);

    def.methods({

        startListen:function () {
            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;
            this._dataManager.addEvent('undoDataChangedEvent', this._onChange);
        },

        stopListen:function () {
            this._dataManager.removeEvent('undoDataChangedEvent', this._onChange);
        },

        _onChange:function (dataItem, newValue, oldValue, sender) {
            var editedComponent = this._getChangedComponent(dataItem, sender),
                componentIds, changeData;
            if (!editedComponent) {
                return;
            }

            if(!editedComponent.getComponentId){
                if(!!editedComponent.getSelectedCompsIds){
                    componentIds = editedComponent.getSelectedCompsIds();
                } else {
                    componentIds = editedComponent.getSelectedComps().map(function(comp){
                        return comp.getComponentId();
                    });
                }
            } else {
                componentIds = [editedComponent.getComponentId()];
            }

            changeData = {
                type:this.className,
                subType:(sender === 'wysiwyg.editor.components.dialogs.ListEditDialog') ? 'galleryDataChange' : null,
                changedComponentIds: componentIds,
                sender:sender || null,
                dataItemId:dataItem.getData().id,
                newValue:newValue,
                oldValue:oldValue
            };

            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
            return changeData; // returns value for spec's sake
        },

        _getChangedComponent: function(dataItem, sender) {
            var editedComponent = this.injects().Editor.getEditedComponent();
            if (dataItem.getType() === 'StyledText') {
                editedComponent = sender;
            }
            return editedComponent;
        },

        getPreliminaryActions:function (data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            if (data.subType == 'galleryDataChange') {
                return [urmPreliminaryActions.SELECT_COMPONENT];
            }
            else {
                return [urmPreliminaryActions.SELECT_COMPONENT, urmPreliminaryActions.OPEN_COMPONENT_PANEL];
            }
        },

        undo:function (changeData) {
            this._applyValue(changeData.dataItemId, changeData.oldValue);
        },

        redo:function (changeData) {
            this._applyValue(changeData.dataItemId, changeData.newValue);
        },

        _applyValue:function (dataItemId, value) {
            var changedProperties;
            var dataItem = this._dataManager.getDataByQuery('#' + dataItemId);
            if (!dataItem) {
                return;
            }

            if (dataItem.className === 'core.managers.data.DataItemWithSchema') {
                var dataSchemaKeys = Object.keys(dataItem.getSchema());
                changedProperties = Object.keys(value).filter(function(key) {
                    return dataSchemaKeys.contains(key);
                });
            }
            else {
                changedProperties = Object.keys(value);
            }
            for (var i = 0; i < changedProperties.length; i++) {
                var changeKey = changedProperties[i];
                var changeValue = value[changeKey];
                dataItem.set(changeKey, changeValue, false, "undo");
            }
        }

    });

});
