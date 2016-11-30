define.Class('wysiwyg.editor.managers.undoredomanager.AddDeleteComponentChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.binds(['_notifyModuleFinished']);

    def.resources(['W.Editor', 'W.CompDeserializer', 'W.Preview', 'W.Config']);

    def.methods({

        startListen:function () {
            this.resources.W.Editor.addEvent('onComponentDelete', this._onChange);
            this.resources.W.CompDeserializer.addEvent('onComponentAdd', this._onChange);
        },

        stopListen:function () {
            this.resources.W.Editor.removeEvent('onComponentDelete', this._onChange);
            this.resources.W.CompDeserializer.removeEvent('onComponentAdd', this._onChange);
        },

        getPreliminaryActions:function (data) {
            var componentId, isComponentInDom = true;
            var componentIds = data.changedComponentIds;
            for (var i = 0; i < componentIds.length; i++) {
                componentId = componentIds[i];
                isComponentInDom = W.Preview.getCompByID(componentId);
                if (!isComponentInDom) {
                    break;
                }
            }
            if (isComponentInDom) {
                var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
                return [urmPreliminaryActions.SELECT_COMPONENT];
            }
            return null;
        },

        getModuleFinished:function () {
            return this._moduleFinished;
        },

        undo:function (changeData) {

            var oldState = changeData.oldState;

            // true if the undo action is for Delete, false if the action is addComponent
            var isUndoDelete = (oldState.changedComponentData != null);

            if (isUndoDelete) {
                var changedCompsData = oldState.changedComponentData;
                var parent = W.Preview.getCompLogicById(oldState.parentId);
                return this._addComponents(changedCompsData, parent);
            }
            else {
                this._deleteComponents(changeData.changedComponentIds);
            }
        },

        redo:function (changeData) {
            var oldState = changeData.oldState;

            // true if the undo action is for Delete, false if the action is addComponent
            var isUndoDelete = (oldState.changedComponentData != null);

            if (isUndoDelete) {
                this._deleteComponents(changeData.changedComponentIds);
            }
            else {
                var newState = changeData.newState;
                var changedCompsData = newState.changedComponentData;
                var parent = W.Preview.getCompLogicById(newState.parentId);
                return this._addComponents(changedCompsData, parent);
            }
        },

        _notifyModuleFinished:function () {
            this._moduleFinished = true;
        },

        _addComponents:function (changedCompsData, parent) {
            this._moduleFinished = false;
            if (changedCompsData) {
                this.injects().CompDeserializer.createAndAddComponents(parent.getViewNode(), changedCompsData, true, true, undefined, this._notifyModuleFinished, true, true, true);

                if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                    var changedCompsIdsWithoutMobileToken = this._getChangedCompsIdsWithoutMobileToken(changedCompsData);
                    W.Commands.executeCommand("WEditorCommands.RemoveComponentsFromDeletedComponentMap", changedCompsIdsWithoutMobileToken);
                }

                return false;
            }
        },

        _getChangedCompsIdsWithoutMobileToken:function(changedCompsData){
            var result = [];
            for(var i=0; i<changedCompsData.length; i++){
                var currentComp = changedCompsData[i];
                if(currentComp.components){
                    result.push(this._getChangedCompsIdsWithoutMobileToken(currentComp.components));
                }
                var compId = currentComp.id;
                if(compId.indexOf(Constants.ViewerTypesParams.DOM_ID_PREFIX.MOBILE) > -1){
                    result.push(compId.substr(Constants.ViewerTypesParams.DOM_ID_PREFIX.MOBILE.length));
                }
            }
            return _.flatten(result);
        },

        _deleteComponents:function (changedComponentIds) {
            var changedComponents = changedComponentIds.map(function (changedCompId) {
                return this.injects().Preview.getCompLogicById(changedCompId);
            }.bind(this));

            this.injects().Editor.setSelectedComps(changedComponents);
            this.injects().Editor.doDeleteSelectedComponent(true);
        }
    });
});
