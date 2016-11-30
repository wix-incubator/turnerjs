define.Class('wysiwyg.editor.components.dialogs.utils.ChooseStyleChangeTracker', function(classDefinition){
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Utils', 'W.UndoRedoManager']);

    def.methods({
        initialize: function(previewComponent, subType) {
            this._previewComponent = previewComponent;
            this._subType = subType;
            this._urm = this.injects().UndoRedoManager;
            this._utils = this.resources.W.Utils;
            this._commands = this.injects().Commands;

            this._trackingStarted = false;
            this._styleChangedListeners = [];

            this._currentStyleId = null;

            this._isUpdatingUIFromStyle = false;
            this._isUpdatingStyleFromUI = false;
        },

        _writeChangesToHistory: function (newStyleId) {
            var oldStyleId = this._currentStyleId,
                transId;

            if (!this._trackingStarted) {
                return;
            }

            if (oldStyleId === newStyleId) {
                return;
            }

            transId = this._commitHistoryTransaction(oldStyleId, newStyleId);

            this._updateCurrents(newStyleId);

            return transId;
        },

        _commitHistoryTransaction: function (oldStyleId, newStyleId) {
            var data = {
                    data: {
                        subType: this._subType,
                        changedComponentIds: [this._previewComponent.getComponentId()],
                        oldState           : { style: oldStyleId },
                        newState           : { style: newStyleId }
                    }
                };

            this._urm.startTransaction();
            this._commands.executeCommand('WEditorCommands.ComponentStyleChanged', data);
            return this._urm.endTransaction();
        },

        _getComponentsStyleId: function () {
            return this._previewComponent.getStyle().getId();
        },

        _updateCurrents: function (newStyleId) {
            this._currentStyleId = newStyleId || this._getComponentsStyleId();
        },

        /**
         * Adds new handler of the style change event
         * @param updaterFn ui update function
         */
        addFromStyleToUiUpdater: function (updaterFn) {
            var wrapper = function styleChangedHandlerWrapper(eventData) {
                if (this._isUpdatingStyleFromUI) {
                    return;
                }

                this._updateCurrents(eventData.styleName);

                this._isUpdatingUIFromStyle = true;
                updaterFn.apply(this, arguments);
                this._isUpdatingUIFromStyle = false;
            }.bind(this);

            this._styleChangedListeners.push(wrapper);
            this._previewComponent.addEvent('UndoRedoComponentStyle', wrapper);
        },

        writeStateToHistory: function (newStyleId) {
            var transId;
            if (this._isUpdatingUIFromStyle) {
                return;
            }
            this._isUpdatingStyleFromUI = true;
            transId = this._writeChangesToHistory(newStyleId);
            this._isUpdatingStyleFromUI = false;

            return transId;
        },

        clearUIUpdateHandlers: function () {
            this._styleChangedListeners.forEach(function (handler) {
                this._previewComponent.removeEvent('UndoRedoComponentStyle', handler);
            }.bind(this));
            this._styleChangedListeners = [];
        },

        startTracking: function () {
            this._updateCurrents();
            this._trackingStarted = true;
        },

        stopTracking: function () {
            this._trackingStarted = false;
            this.clearUIUpdateHandlers();
        }
    });
});