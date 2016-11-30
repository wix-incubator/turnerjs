define.Class('wysiwyg.editor.managers.undoredomanager.PositionChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview', 'W.Commands']);

    def.methods({

        startListen:function () {
            this.resources.W.Preview.getPreviewManagers().Layout.addEvent('updatePosition', this._onChange);
            this.resources.W.Preview.getPreviewManagers().Layout.addEvent('updateSize', this._onChange);
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ComponentMoved', this, this._onChange);
        },

        stopListen:function () {
            this.resources.W.Preview.getPreviewManagers().Layout.removeEvent('updatePosition', this._onChange);
            this.resources.W.Preview.getPreviewManagers().Layout.removeEvent('updateSize', this._onChange);
            this.resources.W.Commands.unregisterListener(this);
        },

        undo: function (changeData) {
            this._updateComponentPositionAndDimensionsIfNeeded(changeData, changeData.oldCoordinates, changeData.oldDimensions);
        },

        redo: function (changeData) {
            this._updateComponentPositionAndDimensionsIfNeeded(changeData, changeData.newCoordinates, changeData.newDimensions);
        },

        _updateComponentPositionAndDimensionsIfNeeded: function(changeData, coordinatesToApply, dimensionsToApply) {
            var component = this._getComp(changeData.changedComponentIds[0]);
            if (this._hasCoordinates(changeData)) {
                this._updateComponentPosition(component, coordinatesToApply);
            }

            if (this._hasDimensions(changeData)) {
                this._updateComponentDimensions(component, dimensionsToApply);
                component.fireEvent('resizeEnd');
                component.trigger('resizeEnd');
            }
            this._commitTransaction();
        },

        getPreliminaryActions:function () {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        _commitTransaction:function () {
            this.injects().Commands.executeCommand('WEditorCommands.componentPosSizeChange');
            var editedComponent = this.injects().Editor.getEditedComponent();
            if (editedComponent) {
                editedComponent.fireEvent('autoSizeChange');
            }
        },

        postEnforceAnchors:function (changeData) {
            var changedComponents = changeData.changedComponentIds.map(function (compId) {
                return this.injects().Preview.getCompLogicById(compId);
            }.bind(this));

            var ySortedElements = changeData.ySortedElementIds.map(function (compId) {
                return this.injects().Preview.getCompLogicById(compId);
            }.bind(this));

            this.resources.W.Preview.getPreviewManagers().Layout.enforceAnchors(changedComponents, true, undefined, ySortedElements);
        },

        _updateComponentPosition:function (component, coordinates) {
            coordinates.x != null ? component.setX(coordinates.x) : false;
            coordinates.y != null ? component.setY(coordinates.y) : false;
            // reset coordinates
            component.saveCurrentCoordinates();
        },

        _updateComponentDimensions:function (component, dimensions) {
            dimensions.h != null ? component.setHeight(dimensions.h) : false;
            dimensions.w != null ? component.setWidth(dimensions.w) : false;
            // reset dimensions
            component.saveCurrentDimensions();
        },

        _getComp: function (compId) {
            return this.resources.W.Preview.getCompByID(compId).$logic;
        },

        _hasCoordinates: function (changeData) {
            return changeData.oldCoordinates && changeData.newCoordinates;
        },

        _hasDimensions:function (changeData) {
            return changeData.oldDimensions && changeData.newDimensions;
        }

    });
});
