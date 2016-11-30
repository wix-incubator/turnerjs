define.Class('wysiwyg.editor.managers.undoredomanager.PropertyChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.binds(['_onDataChange', '_getDataItemById']);

    def.resources(['W.Editor', 'W.Preview', 'W.Utils']);

    def.methods({
        startListen: function() {
            this._dataManager = this.resources.W.Preview.getPreviewManagers().ComponentData;
            this._dataManager.addEvent(Constants.UrmEvents.DATA_CHANGED_EVENT, this._onDataChange);
        },

        stopListen: function() {
            this._dataManager.removeEvent(Constants.UrmEvents.DATA_CHANGED_EVENT, this._onDataChange);
        },


        getPreliminaryActions: function() {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT, urmPreliminaryActions.OPEN_COMPONENT_PANEL];
        },

        getModuleFinished: function() {
            return true;
        },

        postEnforceAnchors: function() {
            // do nothing
        },

        _reportChange: function(data) {
            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, data);
        },

        _onDataChange: function(dataItem, newValue, oldValue, sender) {
            var editedComponent = this.resources.W.Editor.getEditedComponent();
            if (!editedComponent) {
                return;
//                if (!sender || !sender.isInstanceOfClass('mobile.core.components.base.BaseComponent')) {
//                    return;
//                }
//                else {
//                    editedComponent = sender;
//                }
            }
            var changeData = {
                type: this.className,
                changedComponentIds: [editedComponent.getComponentId()],
                sender: sender || null,
                dataItemId: dataItem.getData().id,
                newValue: newValue,
                oldValue: oldValue
            };

            if (typeof changeData.newValue === "undefined" && typeof changeData.oldValue === "undefined") {
                return;
            }

            this._reportChange(changeData);

            return changeData; // returns value for spec's sake
        },

        _applyValue: function(dataItemId, value) {
            var componentLogicById = this.resources.W.Preview.getCompLogicById(dataItemId);
            var componentLogicByPropertyQuery = this.resources.W.Preview.getCompLogicBySelector('[propertyquery="#'+ dataItemId +'"]');
            if (!componentLogicById && !componentLogicByPropertyQuery) {
                return;
            }
            var dataItem = this._getDataItemById(dataItemId);
            var changeKey = Object.keys(value)[0];
            var changeValue = value[changeKey];
            dataItem.set(changeKey, changeValue, false, "undo"); // don't fire changeEvent
         },

        undo: function(changeData) {
            this._applyValue(changeData.dataItemId, changeData.oldValue);
        },

        redo: function(changeData) {
            this._applyValue(changeData.dataItemId, changeData.newValue);
        },

        _getDataItemById: function(dataItemId) {
            return this._dataManager.getDataByQuery('#'+dataItemId);
        }

    });
});
