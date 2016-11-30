define.Class('wysiwyg.editor.managers.undoredomanager.ScopeChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Editor', 'W.Utils', 'W.Commands', 'W.Preview']);

    def.methods({

        initialize: function() {
            this.resource.getResourceValue('W.Preview', function(preview) {
                this._preview = preview;
            }.bind(this));
        },

        startListen: function() {
            this._preview.getPreviewManagers().Layout.addEvent('reparentComponent', this._onChange);
        },

        stopListen: function() {
            this._preview.getPreviewManagers().Layout.removeEvent('reparentComponent', this._onChange);
        },

        getPreliminaryActions: function(data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            if (data.subType == 'showOnAllPagesChange') {
                return [urmPreliminaryActions.SELECT_COMPONENT, urmPreliminaryActions.OPEN_COMPONENT_PANEL];
            }
            else {
                return [urmPreliminaryActions.SELECT_COMPONENT];
            }

        },

        undo: function(changeData) {
            this._addChildrenComponentsToScope(changeData.oldState, changeData.changedComponentIds);
            this._triggerComponentScopeChange(changeData.oldState.parentId);
            return true;
        },

        redo: function(changeData) {
            this._addChildrenComponentsToScope(changeData.newState, changeData.changedComponentIds);
            this._triggerComponentScopeChange(changeData.newState.parentId);
            return true;
        },

        _addComponentToScope: function(state, componentToAdd){
            var parentComponent = this.resources.W.Preview.getCompLogicById(state.parentId);
            parentComponent.addChild(componentToAdd);
            // set Editor's editMode (MASTER_PAGE/CURRENT_PAGE), in case there was a change in SOAP
            this.resources.W.Editor.setEditMode(this.resources.W.Editor.getComponentScope(parentComponent));
        },

        _addChildrenComponentsToScope: function(state, childrenIds) {
            for (var i = 0; i < childrenIds.length; i++) {
                var curChangedElement = this.resources.W.Preview.getCompLogicById(childrenIds[i]);
                this._addComponentToScope(state, curChangedElement);
            }
        },

        _triggerComponentScopeChange: function(parentId) {
            var parentComponent = this.resources.W.Preview.getCompLogicById(parentId);
            var componentScope = this.resources.W.Editor.getComponentScope(parentComponent);
            this.resources.W.Commands.executeCommand('WEditorCommands.componentScopeChange', componentScope);
        }

    });
});

