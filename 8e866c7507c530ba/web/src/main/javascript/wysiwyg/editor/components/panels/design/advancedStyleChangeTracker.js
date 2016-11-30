define.Class('wysiwyg.editor.components.panels.design.AdvancedStyleChangeTracker', function(classDefinition){
    var def = classDefinition,
        STYLE_CHANGE_EVENT = Constants.StyleEvents.STYLE_CHANGED,
        CONTROLS = 'controls',
        SKIN = 'skin';


    def.resources(['W.Commands', 'W.Utils', 'W.UndoRedoManager']);

    def.binds(['_writeChangesToHistory', '_prepareEnvBeforeUpdateUI']);


    def.methods({
        initialize: function(previewComponent, subType) {
            this._previewComponent = previewComponent;
            this._subType = subType;
            this._urm = this.injects().UndoRedoManager;
            this._utils = this.resources.W.Utils;
            this._commands = this.injects().Commands;

            this._trackingStarted = false;
            this._changeStyleListeners = [];
            this._styleData = null;
            this._skinNameHasChanged = false;
            this._originalStyleData = null;
            this._originalSkinClass = null;
            this._currentStyleData = null;
            this._currentSkinClass = null;
            this._isUpdatingUIFromStyleData = false;
            this._isUpdatingStyleDataFromUI = false;
        },

        _writeChangesToHistory: function () {
            var style,
                newStyleData,
                newSkin,
                newSkinName,
                oldSkinClass,
                oldStyleData,
                oldSkinName;

            if (!this._trackingStarted) {
                return;
            }


            style = this._styleData;

            newSkin = style.getRawSkin();
            newStyleData = Object.clone(style.getRawData());
            newSkinName = newSkin.$className;

            oldSkinClass = this._currentSkinClass;
            oldStyleData = this._currentStyleData;
            oldSkinName = oldSkinClass.$originalClassName;


            this._updateSkinNameHasChangedState();


            if (this._utils.areObjectsEqual(oldStyleData, newStyleData) && !this._skinNameHasChanged) {
                return;
            }


            this._commitHistoryTransaction(style.getId(), oldSkinName, oldStyleData, newSkinName, newStyleData);

            this._updateCurrentSkinAndStyle();
        },

        _commitHistoryTransaction: function (styleId, oldSkinName, oldStyleData, newSkinName, newStyleData) {
            var data = {
                    data: {
                        changedComponentIds: [this._previewComponent.getComponentId()],
                        changedComponent: this._previewComponent, // needed for StyleHighlight experiment
                        styleId: styleId,
                        subType: this._subType,
                        oldState: {
                            styleData: Object.clone(oldStyleData),
                            skinName: oldSkinName
                        },
                        newState: {
                            styleData: newStyleData,
                            skinName: newSkinName
                        }
                    }
                },
                urm = this._urm;

            urm.startTransaction();
            this._commands.executeCommand('WEditorCommands.ComponentAdvancedStyleChanged', data);
            urm.endTransaction();
        },

        _prepareEnvBeforeUpdateUI: function () {
            if (this._isUpdatingStyleDataFromUI) {
                return;
            }
            this._updateSkinNameHasChangedState();
            this._updateCurrentSkinAndStyle();
        },

        _watchStyleDataChangesUpdateUI: function () {
            this._styleData.addEvent(STYLE_CHANGE_EVENT, this._prepareEnvBeforeUpdateUI);
        },

        _updateCurrentSkinAndStyle: function () {
            var style = this._styleData,
                newStyleData = Object.clone(style.getRawData()),
                newSkin = style.getRawSkin();

            this._currentStyleData = Object.clone(newStyleData);
            this._currentSkinClass = newSkin.$class;
        },

        _calculateSkinNameHasChanged: function () {
            var newClassName = this._styleData.getSkinClassName(),
                currentClassName = this._currentSkinClass.$originalClassName;

            return currentClassName !== newClassName;
        },

        _updateSkinNameHasChangedState: function () {
            this._skinNameHasChanged = this._calculateSkinNameHasChanged();
        },

        _clearStyleDataHandlers: function() {
            if (!this._styleData) {
                return;
            }
            this._styleData.removeEvent(STYLE_CHANGE_EVENT, this._prepareEnvBeforeUpdateUI);
        },

        /**
         * Adds new handler of the style data change event
         * @param handlerFn
         * @param type
         */
        createFromStyleDataToUiUpdater: function (handlerFn, type) {
            var list = this._changeStyleListeners[type] = this._changeStyleListeners[type] || [];
            // undo/redo change whole style data so subscribe on style change
            var wrapper = function styleChangedHandlerWrapper() {
                var skinChanged = this._skinNameHasChanged;

                if (this._isUpdatingStyleDataFromUI) {
                    return;
                }
                if (type === CONTROLS && skinChanged || type === SKIN && !skinChanged) {
                    return;
                }

                this._isUpdatingUIFromStyleData = true;
                handlerFn();
                this._isUpdatingUIFromStyleData = false;
            }.bind(this);

            this._styleData.addEvent(STYLE_CHANGE_EVENT, wrapper);
            list.push(wrapper);
        },

        /**
         * Use it to create a wrapper over a function that writes changes to styleData
         * when some changes in UI ("inputChanged" for example)
         * @param fn function to wrap
         * @returns {function(this:*)|*}
         */
        createFromUiToStyleDataUpdater: function (fn) {
            return function fromUiToStyleDataUpdater(params) {
                if (this._isUpdatingUIFromStyleData) {
                    return;
                }
                this._isUpdatingStyleDataFromUI = true;
                fn.apply(null, arguments);
                this._writeChangesToHistory();
                this._isUpdatingStyleDataFromUI = false;
            }.bind(this);
        },

        clearUIUpdateHandlers: function (type) {
            if (!this._changeStyleListeners.hasOwnProperty(type)) {
                return;
            }
            this._changeStyleListeners[type].forEach(function (handler) {
                this._styleData.removeEvent(STYLE_CHANGE_EVENT, handler);
            }.bind(this));
            this._changeStyleListeners[type] = [];
        },

        setStyleData: function (value) {
            this._clearStyleDataHandlers();
            this._styleData = value;
            this._updateCurrentSkinAndStyle();
            this._watchStyleDataChangesUpdateUI();
        },

        startTracking: function () {
            var style = this._previewComponent.getStyle();

            this._originalStyleData = Object.clone(style.getRawData());
            this._originalSkinClass = this._previewComponent.getSkin().$class;

            this._updateCurrentSkinAndStyle();

            this._trackingStarted = true;
        },

        stopTracking: function () {
            this._trackingStarted = false;

            this.clearUIUpdateHandlers(CONTROLS);
            this.clearUIUpdateHandlers(SKIN);

            this._clearStyleDataHandlers();
        }
    });
});