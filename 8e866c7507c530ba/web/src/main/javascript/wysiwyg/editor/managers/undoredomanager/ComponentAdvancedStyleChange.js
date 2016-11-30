define.Class('wysiwyg.editor.managers.undoredomanager.ComponentAdvancedStyleChange', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');
    def.resources(['W.Commands', 'W.Utils', 'W.Preview', 'W.EditorDialogs']);

    def.methods({
        initialize: function(){
        },

        startListen: function(){
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ComponentAdvancedStyleChanged', this, this._onChange);
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.AdvancedStylePopupOpened', this,
                function (openedEvent) {
                    openedEvent.data.popupOpenedEvent = true;
                    this._onChange({
                        data: openedEvent.data
                    });
                }.bind(this)
            );
        },

        stopListen: function(){
            this.resources.W.Commands.unregisterListener(this);
        },

        getPreliminaryActions: function(data) {
            var urmPreliminaryActions = W.UndoRedoManager._constants.PreliminaryActions;
            if (data.subType == 'wixApps'){
                //currently do nothing, eventually find a way to set the edited component
                return null;
            }

            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        getFinalizingActions: function (data) {
            if (data.popupOpenedEvent) {
                var urmFinalizingActions = W.UndoRedoManager._constants.FinalizingActions;
                return [urmFinalizingActions.CLOSE_ADVANCED_STYLE_DIALOG, urmFinalizingActions.CLEAR_REDO_STACK];
            }
        },

        getModuleFinished:function () {
            return this._moduleFinished;
        },

        undo: function(changeData){
            this._moduleFinished = false;

            if (changeData.popupOpenedEvent) {
                return;
            }

            this.resources.W.Preview.getPreviewManagers().Theme.getStyle(changeData.styleId, function (style) {
                this._setStyle(style, changeData.oldState.styleData, changeData.oldState.skinName);
            }.bind(this));
        },

        redo: function(changeData){
            this._moduleFinished = false;

            // this
            if (changeData.popupOpenedEvent) {
                return;
            }

            this.resources.W.Preview.getPreviewManagers().Theme.getStyle(changeData.styleId, function(style){
                this._setStyle(style, changeData.newState.styleData, changeData.newState.skinName);
            }.bind(this));
        },

        _setStyle: function(style, styleData, skinName){
            this.resources.W.Preview.getPreviewManagers().Skins.getSkin(skinName, function(skin){
                style.resetStyleFromData(styleData, skin);
                this._moduleFinished = true;
            });

        }


    });

});