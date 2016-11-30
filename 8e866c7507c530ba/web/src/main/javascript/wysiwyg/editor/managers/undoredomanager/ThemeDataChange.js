define.Class('wysiwyg.editor.managers.undoredomanager.ThemeDataChange', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition  */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview']);

    def.methods({

        startListen:function () {
            this._themeManager = this.resources.W.Preview.getPreviewManagers().Theme;
            this._themeManager.addEvent('undoDataChangedEvent', this._onChange);
        },

        stopListen:function () {
            this._themeManager.removeEvent('undoDataChangedEvent', this._onChange);
        },

        getPreliminaryActions:function (data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.BackgroundDesignPanel') {
                return [urmPreliminaryActions.OPEN_BACKGROUND_DESIGN_PANEL];
            }
            else if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.BackgroundEditorPanel') {
                return [urmPreliminaryActions.OPEN_BACKGROUND_EDITOR_PANEL];
            }
            else if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.ColorsDesignPanel') {
                return [urmPreliminaryActions.OPEN_COLORS_DESIGN_PANEL];
            }
            else if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.FontsPanel') {
                return [urmPreliminaryActions.OPEN_FONTS_PANEL];
            }
            else if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.CustomizeFontsPanel') {
                return [urmPreliminaryActions.OPEN_CUSTOMIZE_FONTS_PANEL];
            }
            else if (data.sender && data.sender.getOriginalClassName() === 'wysiwyg.editor.components.panels.DynamicPalettePanel') {
                return [urmPreliminaryActions.OPEN_CUSTOMIZE_COLORS_PANEL];
            }
            else {
                return null;
            }
        },

        _onChange:function (dataItem, newValue, oldValue, sender) {
            if (sender && sender.className === 'wysiwyg.editor.components.inputs.SelectionListInput') {
                this._originalList = sender;
            }
            var changeData = {
                type: this.className,
                sender: this._getParentPanel(sender),
                newValue: newValue,
                oldValue: oldValue
            };

            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
            return changeData; // returns value for spec's sake
        },

        _getParentPanel: function(parentComponent) {
            if (!parentComponent) {
                return null;
            }
            if (parentComponent.isInstanceOfClass('wysiwyg.editor.components.panels.SideContentPanel') ||
                parentComponent.isInstanceOfClass('wysiwyg.editor.components.panels.ComponentPanel')) {
                return parentComponent;
            }

            return this._getParentPanel(parentComponent.getParentComponent());
        },


        undo:function (changeData) {
            this._applyValue(changeData.oldValue);
        },

        redo:function (changeData) {
            this._applyValue(changeData.newValue);
        },

        _applyValue:function (value) {
            var dataItem = this._themeManager.getDataItem();

            if (this._originalList) {
                this._originalList._disableReRender = true;
            }

            Object.forEach(value, function(changeValue, key) {
                var valueToApply = (typeof changeValue === 'string' || !changeValue.toString) ? changeValue : changeValue.toString();
                dataItem.set(key, valueToApply, false, "undo");
            });
        }

    });

});
