define.Class('wysiwyg.editor.managers.undoredomanager.ZOrderChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview']);

    def.methods({

        startListen:function () {
            this.resources.W.Preview.getPreviewManagers().Commands.registerCommandListenerByName('WViewerCommands.ComponentZIndexChanged', this, this._onChange);
        },

        stopListen:function () {
            this.resources.W.Preview.getPreviewManagers().Commands.unregisterListener(this);
        },


        getPreliminaryActions:function (data) {
            if (data.subType == 'zOrderChangeByDelete') {
                return null;
            }

            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        undo:function (changeData) {
            // todo: sort by index
            for (var i = 0; i < changeData.changedComponentIds.length; i++) {
                var changedComponent = this.injects().Preview.getCompLogicById(changeData.changedComponentIds[i]);
                this._changeComponentZOrder(changeData.oldState, changedComponent);
            }
        },

        redo:function (changeData) {
            for (var i = 0; i < changeData.changedComponentIds.length; i++) {
                var changedComponent = this.injects().Preview.getCompLogicById(changeData.changedComponentIds[i]);
                if (changedComponent) {
                    this._changeComponentZOrder(changeData.newState, changedComponent);
                }
            }
        },

        _onChange:function (param) {
            this.parent({data: param.urmData});
        },


        _changeComponentZOrder:function (newState, componentToMove) {
            var newComponentSiblings = newState.children.map(function (childId) {
                return this.injects().Preview.getCompLogicById(childId);
            }.bind(this));
            var oldComponentSiblings = componentToMove.getParentComponent().getChildComponents().map(function (child) {
                return child.getLogic();
            });
            var newComponentIndex = newComponentSiblings.indexOf(componentToMove);
            var oldComponentIndex = oldComponentSiblings.indexOf(componentToMove);

            componentToMove.getParentComponent().moveChildFromIndexToIndex(componentToMove, oldComponentIndex, newComponentIndex);

        }

    });
});

