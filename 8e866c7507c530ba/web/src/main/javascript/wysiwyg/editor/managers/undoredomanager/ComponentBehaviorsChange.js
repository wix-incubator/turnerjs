define.Class('wysiwyg.editor.managers.undoredomanager.ComponentBehaviorsChange', function(classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');
    def.resources(['W.Commands', 'W.Preview']);
    def.methods({
        initialize: function() {
        },

        startListen: function() {
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ComponentBehaviorsChanged', this, this._onChange);
        },

        stopListen: function() {
            this.resources.W.Commands.unregisterListener(this);
        },

        getPreliminaryActions: function(data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;

//            if (data.subType == 'wixApps') {
//                //currently do nothing, eventually find a way to set the edited component
//                return null;
//            }
            if (data.subType == 'AnimationChangeByDelete') {
                return null;
            }

            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        /**
         * @param changeData.oldState expect structure of {<compId> :{<actions>}}
         */
        undo: function(changeData) {
            this._setActionsByCompIds(changeData.oldState, changeData.changedComponentIds);

        },

        /**
         * @param changeData.newState expect structure of {<compId> :{<actions>}}
         */
        redo: function(changeData) {
            this._setActionsByCompIds(changeData.newState, changeData.changedComponentIds);
        },

        _setActionsByCompIds: function(actions, compIds) {
            this._actionsManager = this._actionsManager || this.resources.W.Preview.getPreviewManagers().Actions;
            if (!actions) {
                return;
            }
            _.forEach(actions, function(behaviors, action) {
                var behaviorsBySourceId = null;

                if (!_.isEmpty(behaviors)) {
                    behaviorsBySourceId = _.groupBy(behaviors, 'sourceId');

                    _.forEach(behaviorsBySourceId, function(compBehaviors, sourceId) {
                        this._actionsManager.setBehaviorsForComponentAction(sourceId, action, compBehaviors);
                    }, this);
                } else {
                    _.forEach(compIds, function(compId) {
                        this._actionsManager.setBehaviorsForComponentAction(compId, action, null);
                    }, this);
                }
            }, this);
            this.resources.W.Commands.executeCommand('WEditorCommands.AnimationUpdated', {sourceIds: actions, name: 'multiple'});
        }
    });
});