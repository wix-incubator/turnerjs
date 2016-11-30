define.Class('wysiwyg.editor.managers.undoredomanager.ComponentStyleChange', function (classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');
    def.resources(['W.Commands', 'W.Utils', 'W.Preview']);
    def.methods({
        initialize: function() {
        },

        startListen: function() {
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ComponentStyleChanged', this, this._onChange);
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ChooseStylePopupOpened', this,
                function (openedEvent) {
                    openedEvent.data.popupOpenedEvent = true;
                    this._onChange({
                        data: openedEvent.data
                    });
                }.bind(this)
            );
        },

        stopListen: function() {
            this.resources.W.Commands.unregisterListener(this);
        },


        getPreliminaryActions: function(data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;

            if (data.subType == 'wixApps') {
                //currently do nothing, eventually find a way to set the edited component
                return null;
            }
            else if (data.subType == 'StyleChangeByDelete') {
                return null;
            }

            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        getFinalizingActions: function (data) {
            if (data.popupOpenedEvent) {
                var urmFinalizingActions = W.UndoRedoManager._constants.FinalizingActions;
                return [urmFinalizingActions.CLOSE_CHOOSE_STYLE_DIALOG, urmFinalizingActions.CLEAR_REDO_STACK];
            }
        },

        undo: function(changeData) {
            if (changeData.popupOpenedEvent) {
                return;
            }

            var oldStateStyle = Array.isArray(changeData.oldState.style)? changeData.oldState.style: [changeData.oldState.style];
            var newStateStyle = Array.isArray(changeData.newState.style)? changeData.newState.style: [changeData.newState.style];

            for (var i=0; i<changeData.changedComponentIds.length; i++) {
                var curChangedElement = this.injects().Preview.getCompLogicById(changeData.changedComponentIds[i]);
                this._setStyleByID(curChangedElement, oldStateStyle[i], newStateStyle[i], changeData);
            }
        },

        redo: function(changeData) {
            if (changeData.popupOpenedEvent) {
                return;
            }

            var oldStateStyle = Array.isArray(changeData.oldState.style)? changeData.oldState.style: [changeData.oldState.style];
            var newStateStyle = Array.isArray(changeData.newState.style)? changeData.newState.style: [changeData.newState.style];

            for (var i=0; i<changeData.changedComponentIds.length; i++) {
                var curChangedElement = this.injects().Preview.getCompLogicById(changeData.changedComponentIds[i]);
                this._setStyleByID(curChangedElement, newStateStyle[i], oldStateStyle[i], changeData);
            }
        },

        _setStyleByID: function(changedElement, toStyle, fromStyle, changeData){
            var toStyleAvailable = toStyle && this.injects().Preview.getPreviewManagers().Theme.isStyleAvailable(toStyle);
            var fromStyleAvailable = fromStyle && this.injects().Preview.getPreviewManagers().Theme.isStyleAvailable(fromStyle);

            if (toStyleAvailable) {
                this.injects().Preview.getPreviewManagers().Theme.getStyle(toStyle, function(style) {
                    changedElement.setStyle(style);
                    if (style.getIsCustomStyle()){
                        style.getDataItem().markDataAsDirty();
                    }
                    changedElement.fireEvent('UndoRedoComponentStyle', {
                        styleName: toStyle
                    });
                }.bind(this));
            }

            if (fromStyleAvailable) {
                this.injects().Preview.getPreviewManagers().Theme.getStyle(fromStyle, function(style) {
                    if (style.getIsCustomStyle()){
                        style.getDataItem().markDataAsClean();
                    }
                }.bind(this));
            }

            else if (changeData.subType == 'wixApps') {
                this.injects().Commands.executeCommand('WEditorCommands.ApplyTextStyle', { appPart: changeData.sender._appPart, comp: changedElement, styleName: styleName });
            }
        }
    });
});