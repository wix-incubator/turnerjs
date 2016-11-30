/**
 * @class wysiwyg.editor.managers.UndoRedoManager
 */
define.Class('wysiwyg.editor.managers.UndoRedoManager', function(classDefinition, inheritStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.utilize([
        'wysiwyg.editor.managers.undoredomanager.LayoutChange',
        'wysiwyg.editor.managers.undoredomanager.PropertyChange',
        'wysiwyg.editor.managers.undoredomanager.PositionChange',
        'wysiwyg.editor.managers.undoredomanager.DataChange',
        'wysiwyg.editor.managers.undoredomanager.ScopeChange',
        'wysiwyg.editor.managers.undoredomanager.ComponentStyleChange',
        'wysiwyg.editor.managers.undoredomanager.ComponentAdvancedStyleChange',
        'wysiwyg.editor.managers.undoredomanager.ZOrderChange',
        'wysiwyg.editor.managers.undoredomanager.AddDeleteComponentChange',
        'wysiwyg.editor.managers.undoredomanager.ThemeDataChange',
        'wysiwyg.editor.managers.undoredomanager.TextDataChange',
        'wixapps.integration.managers.undoredomanager.AppBuilderChange',
        'wysiwyg.editor.managers.undoredomanager.RotationChange',
        'wysiwyg.editor.managers.undoredomanager.ComponentBehaviorsChange',
        'wysiwyg.editor.managers.undoredomanager.MobilePropertySplitChange',
        'wysiwyg.editor.managers.undoredomanager.TextScalingChange',
        'wysiwyg.editor.managers.undoredomanager.LockComponentChange',
        'wysiwyg.editor.managers.undoredomanager.CustomBackgroundChange'
    ]);

    def.resources(['W.Editor', 'W.Commands', 'W.CommandsNew', 'W.Preview', 'W.Utils', 'W.Config']);

    def.binds([
        '_onChange', '_getComponentDataManager', '_resetStacks', '_onSiteLoaded',
        'startTransaction', 'undo', 'redo', '_onPageChange', '_waitForModuleToFinish'
    ]);

    def.fields({
        _constants: {
            Modules: {
                LAYOUT_CHANGE: 'LayoutChange',
                COMP_DATA_CHANGE: 'PropertyChange',
                POSITION_CHANGE: 'PositionChange',
                DATA_CHANGE: 'DataChange',
                SCOPE_CHANGE: 'ScopeChange',
                COMPONENT_STYLE_CHANGE: 'ComponentStyleChange',
                COMPONENT_ADVANCED_STYLE_CHANGE: 'ComponentAdvancedStyleChange',
                Z_ORDER_CHANGE: 'ZOrderChange',
                ADD_DELETE_COMPONENT_CHANGE: 'AddDeleteComponentChange',
                THEME_DATA_CHANGE: 'ThemeDataChange',
                TEXT_DATA_CHANGE: 'TextDataChange',
                APP_BUILDER_CHANGE: 'AppBuilderChange',
                ROTATION_CHANGE: 'RotationChange',
                COMPONENT_BEHAVIORS_CHANGE: 'ComponentBehaviorsChange',
                MOBILE_PROPERTY_SPLIT_CHANGE: 'MobilePropertySplitChange',
                TEXT_SCALING_CHANGE: 'TextScalingChange',
                LOCK_COMPONENT_CHANGE: 'LockComponentChange',
                CUSTOM_BG_CHANGE: 'CustomBackgroundChange'
            },

            _prefix: 'wysiwyg.editor.managers.undoredomanager.',
            _wixapps_prefix: 'wixapps.integration.managers.undoredomanager.',

            PreliminaryActions: {
                SELECT_COMPONENT: 'selectComponent',
                OPEN_COMPONENT_PANEL: 'openComponentPanel',
                SELECT_ITEM_IN_DIALOG: 'selectItemInDialog',
                OPEN_BACKGROUND_EDITOR_PANEL: 'openBackgroundEditorPanel',
                OPEN_BACKGROUND_DESIGN_PANEL: 'openBackgroundDesignPanel',
                OPEN_COLORS_DESIGN_PANEL: 'openColorsDesignPanel',
                OPEN_FONTS_PANEL: 'openFontsPanel',
                OPEN_CUSTOMIZE_FONTS_PANEL: 'openCustomizeFontsPanel',
                OPEN_CUSTOMIZE_COLORS_PANEL: 'openCustomizeColorsPanel',
                CLOSE_CHOOSE_STYLE_DIALOG: 'closeChooseStyleDialog'
            },

            FinalizingActions: {
                CLOSE_ADVANCED_STYLE_DIALOG: 'closeAdvancedStyleDialog',
                CLEAR_REDO_STACK: 'clearHistoryTag',
                CLOSE_CHOOSE_STYLE_DIALOG: 'closeChooseStyleDialog'
            }
        }
    });

    /**
     * @lends wysiwyg.editor.managers.UndoRedoManager
     */
    def.methods({
        initialize: function() {
            this._undoStack = [];
            this._redoStack = [];
            this._transactionStack = [];
            this._checkIfToPerformPreliminaryAction = true;

            this._importDataRefs();

            this._isReady = false;
            this.isActionSupportedByURM = true;
            W.Commands.registerCommandListenerByName('EditorCommands.SiteLoaded', this, this._onSiteLoaded, null);
            this._isReady = true;
            this._transactionCounter = 0;
        },

        _importDataRefs: function() {
            this._layoutData = new this.imports.LayoutChange();
            this._positionData = new this.imports.PositionChange();
            this._compPropData = new this.imports.PropertyChange();
            this._compData = new this.imports.DataChange();
            this._scopeData = new this.imports.ScopeChange();
            this._componentStyleData = new this.imports.ComponentStyleChange();
            this._componentAdvancedStyleData = new this.imports.ComponentAdvancedStyleChange();
            this._zOrderData = new this.imports.ZOrderChange();
            this._addDeleteComponentData = new this.imports.AddDeleteComponentChange();
            this._themeData = new this.imports.ThemeDataChange();
            this._textData = new this.imports.TextDataChange();
            this._appBuilderData = new this.imports.AppBuilderChange();
            this._rotationData = new this.imports.RotationChange();
            this._componentBehaviorsData = new this.imports.ComponentBehaviorsChange();
            this._mobilePropertySplitData = new this.imports.MobilePropertySplitChange();
            this._textScalingData = new this.imports.TextScalingChange();
            this._lockComponentData = new this.imports.LockComponentChange();
            this._customBgChangeHandler = new this.imports.CustomBackgroundChange();
        },

        _setUndoRedoButtons: function() {
            var enableUndoButton = (this._undoStack.length > 0);
            var enableRedoButton = (this._redoStack.length > 0);
            this.injects().Commands.executeCommand('WEditorCommands.SetUndoButton', enableUndoButton);
            this.injects().Commands.executeCommand('WEditorCommands.SetRedoButton', enableRedoButton);
        },

        undo: function() {
            if (!this._isUndoable()) {
                return false;
            }

            this._isInUndoRedo = true;
            var changeData = this._undoStack[0];

            // wait for page transition to end before actual undo
            this._currentPageId = this._getCurrentPageId();
            if (this._currentPageId != changeData.pageId) {
                W.Preview.getPreviewManagers().Viewer.addEvent("pageTransitionEnded", this.undo);
                this.injects().Commands.executeCommand("EditorCommands.gotoSitePage", changeData.pageId);
                return;
            }
            else {
                W.Preview.getPreviewManagers().Viewer.removeEvent('pageTransitionEnded', this.undo);
            }

            var doNotProceedWithUndo = this._handlePreliminaryAction(changeData);
            if (doNotProceedWithUndo) {
                this._isInUndoRedo = false;
                return;
            }

            if (this._isTransactionData(changeData)) {
                this._undoTransaction(changeData.transaction);

                // TODO: Once LayoutManager is refactored, fix this. It's a bit of a hack, to override anchor's minimumValue -- Tomer
                var recentComp = this._getEditedComponent();
                if (recentComp && recentComp.getLogic) {
                    this.injects().Preview.getPreviewManagers().Layout.enforceAnchors([recentComp], true, false);
                }

            }
            else {
                this._applyChangeMap('undo', changeData, changeData.type);
            }

            this._redoStack.unshift(changeData);
            this._removeItemFromStack(this._undoStack);
            this._refreshComponentEditBox();
            this._checkIfToPerformPreliminaryAction = true;

            this._handleFinalizingActions(changeData);

            W.Editor.onComponentChanged(true);

            this._setUndoRedoButtons();
            this._isInUndoRedo = false;

            return true;
        },

        redo: function() {
            if (!this._isRedoable()) {
                return false;
            }

            this._isInUndoRedo = true;
            var changeData = this._redoStack[0];

            // wait for page transition to end before actual redo
            this._currentPageId = this._getCurrentPageId();
            if (this._currentPageId != changeData.pageId) {
                this.injects().Preview.getPreviewManagers().Viewer.addEvent("pageTransitionEnded", this.redo);
                this.injects().Commands.executeCommand("EditorCommands.gotoSitePage", changeData.pageId);
                return;
            }
            else {
                W.Preview.getPreviewManagers().Viewer.removeEvent('pageTransitionEnded', this.redo);
            }

            var doNotProceedWithRedo = this._handlePreliminaryAction(changeData);
            if (doNotProceedWithRedo) {
                this._isInUndoRedo = false;
                return;
            }

            if (this._isTransactionData(changeData)) {
                this._redoTransaction(changeData.transaction);
            }
            else {
                this._applyChangeMap('redo', changeData, changeData.type);
            }

            this._undoStack.unshift(changeData);
            this._removeItemFromStack(this._redoStack);
            this._refreshComponentEditBox();
            this._checkIfToPerformPreliminaryAction = true;

            W.Editor.onComponentChanged(true);

            this._setUndoRedoButtons();
            this._isInUndoRedo = false;

            return true;
        },

        _getEditedComponent: function () {
            return this.injects().Editor.getComponentEditBox()._editedComponent;
        },

        checkIfDataChangeSupportedByURM: function (e) {
            var isPropertyPanel, isSideContentPanel;

            if (!e || (!e.origEvent && !e.target)) {
                return;
            }
            var inputElement = this._getInputElement(e) || e.target;
            if (!inputElement) {
                return;
            }
            var inputElementParents = inputElement.getParents('[comp]');

            for (var i = 0; i < inputElementParents.length; i++) {
                var inputElementParent = inputElementParents[i];
                isPropertyPanel = this._isPropertyPanel(inputElementParent);
                isSideContentPanel = this._isSidePanel(inputElementParent);
                if (isPropertyPanel || isSideContentPanel) {
                    return true;
                }
            }
            return false;
        },

        _isPropertyPanel: function(node) {
            var isMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            if (isMobileMode && W.Editor.isSupportedByMobilePanelUndo()) {
                return node.get('comp') === 'wysiwyg.editor.components.panels.MobileComponentPanel';
            }
            else {
                return node.get('comp') === 'wysiwyg.editor.components.panels.ComponentPanel';
            }
        },

        _isSidePanel: function(node) {
            return node.getLogic().isInstanceOfClass('wysiwyg.editor.components.panels.SideContentPanel');
        },

        _getInputElement: function(e) {
            if (!e.origEvent) {
                return e.target;
            }
            return this._getInputElement(e.origEvent);
        },

        clear: function() {
            this._resetStacks();
        },

        isReady: function() {
            return this._isReady;
        },

//        clone:function () {
//            return new this.$class();
//        },

        _onSiteLoaded: function() {
            // listen to SITE_PAGE_CHANGED event
            this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onPageChange);

            // listen to dataChanged events on modules
            this._listenToDataChanges();

            // modules map
            this._mapModules();

            this._currentPageId = this._getCurrentPageId();
            this._setUndoRedoButtons();
        },

        _listenToDataChanges: function() {
            this._layoutData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._positionData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._compPropData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._compData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._scopeData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._zOrderData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._addDeleteComponentData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._componentStyleData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._componentAdvancedStyleData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._themeData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._textData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._appBuilderData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._rotationData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._componentBehaviorsData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._mobilePropertySplitData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._textScalingData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._lockComponentData.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
            this._customBgChangeHandler.addEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, this._onChange);
        },

        _mapModules: function() {
            this.modules = {};
            this.modules[this._constants.Modules.LAYOUT_CHANGE] = this._layoutData;
            this.modules[this._constants.Modules.POSITION_CHANGE] = this._positionData;
            this.modules[this._constants.Modules.COMP_DATA_CHANGE] = this._compPropData;
            this.modules[this._constants.Modules.DATA_CHANGE] = this._compData;
            this.modules[this._constants.Modules.SCOPE_CHANGE] = this._scopeData;
            this.modules[this._constants.Modules.Z_ORDER_CHANGE] = this._zOrderData;
            this.modules[this._constants.Modules.ADD_DELETE_COMPONENT_CHANGE] = this._addDeleteComponentData;
            this.modules[this._constants.Modules.COMPONENT_STYLE_CHANGE] = this._componentStyleData;
            this.modules[this._constants.Modules.COMPONENT_ADVANCED_STYLE_CHANGE] = this._componentAdvancedStyleData;
            this.modules[this._constants.Modules.THEME_DATA_CHANGE] = this._themeData;
            this.modules[this._constants.Modules.TEXT_DATA_CHANGE] = this._textData;
            this.modules[this._constants.Modules.APP_BUILDER_CHANGE] = this._appBuilderData;
            this.modules[this._constants.Modules.ROTATION_CHANGE] = this._rotationData;
            this.modules[this._constants.Modules.COMPONENT_BEHAVIORS_CHANGE] = this._componentBehaviorsData;
            this.modules[this._constants.Modules.MOBILE_PROPERTY_SPLIT_CHANGE] = this._mobilePropertySplitData;
            this.modules[this._constants.Modules.TEXT_SCALING_CHANGE] = this._textScalingData;
            this.modules[this._constants.Modules.LOCK_COMPONENT_CHANGE] = this._lockComponentData;
            this.modules[this._constants.Modules.CUSTOM_BG_CHANGE] = this._customBgChangeHandler ;
        },

        _onChange: function (dataObj) {
            if (dataObj && dataObj.sender === 'undo') {
                return;
            }

            this._resetFutureStack();

            if (this._isInTransaction) {
                var isContinuousChange = this._isContinuousChange(dataObj);
                if (isContinuousChange) {
                    this._numDataChangeInTransaction++;
                    W.Utils.callLater(this._onDataOrPropertyChange, [dataObj.type], this, 500);
                }

                this._transactionStack.unshift(dataObj);
            }
        },

        _isContinuousChange: function(dataObj) {
            return this._isDataOrPropertyChange(dataObj) || dataObj.type === 'wysiwyg.editor.managers.undoredomanager.TextScalingChange';
        },


        _onDataOrPropertyChange: function() {
            this._numDataChangeInTransaction--;
            if (this._numDataChangeInTransaction === 0) {
                this._checkIfUnifyDataChanges();
                this.endTransaction();
            }
        },

        _isDataOrPropertyChange: function(dataObj) {
            var dataChange = dataObj.type === 'wysiwyg.editor.managers.undoredomanager.DataChange';
            var propChange = dataObj.type === 'wysiwyg.editor.managers.undoredomanager.PropertyChange';
            var appBuilderChange = dataObj.type === 'wixapps.integration.managers.undoredomanager.AppBuilderChange';
            var themeDataChange = dataObj.type === 'wysiwyg.editor.managers.undoredomanager.ThemeDataChange';
            var isDataOrPropertyChange = (dataChange || propChange || themeDataChange || appBuilderChange);
            return isDataOrPropertyChange;
        },

        /**
         unify two adjacent changes t1 and t2 in this._transactionStack:
         t1.old == 'aa', t1.new == 'bb', t2.old =='bb', t2.new =='cc' ==> t3.old='aa', t3.new='cc'
         **/
        _checkIfUnifyDataChanges: function () {
            for (var i = this._transactionStack.length - 1; i > 0; i--) {
                var currentItem = this._transactionStack[i];
                var itemBefore = this._transactionStack[i - 1];

                if (!this._isContinuousChange(currentItem) || !this._isContinuousChange(itemBefore)) {
                    continue;
                }

                var adjacentChangesOfSameData, valueKey, adjacentChangesOfSameType = this._isAdjacentChangesOfSameType(currentItem, itemBefore);

                if (currentItem.changeType == "Customization") {
                    adjacentChangesOfSameData = (adjacentChangesOfSameType &&
                        Object.keys(currentItem.newValue).length == Object.keys(itemBefore.newValue).length &&
                        this.injects().Utils.areArraysContainSameElements(Object.keys(currentItem.newValue), Object.keys(itemBefore.newValue)) &&
                        currentItem.newValue.fieldId == itemBefore.newValue.fieldId);

                    valueKey = 'value';
                }
                else {
                    adjacentChangesOfSameData = adjacentChangesOfSameType &&
                        (currentItem.type === 'wysiwyg.editor.managers.undoredomanager.TextScalingChange' ||
                            (
                                Object.keys(currentItem.newValue).length == 1 &&
                                    Object.keys(itemBefore.newValue).length == 1 &&
                                    this.injects().Utils.areArraysContainSameElements(Object.keys(currentItem.newValue), Object.keys(itemBefore.newValue)) &&
                                    currentItem.dataItemId == itemBefore.dataItemId)
                            );

                    if (typeOf(this._transactionStack[i - 1].oldValue) === 'object') {
                        valueKey = Object.keys(this._transactionStack[i - 1].oldValue)[0];
                    }
                }

                if (adjacentChangesOfSameData) {
                    var earlierChangeOldValue = this._getItemOldValue(currentItem, valueKey);
                    var earlierChangeNewValue = this._getItemNewValue(currentItem, valueKey);
                    var laterChangeOldValue = this._getItemOldValue(itemBefore, valueKey);

                    if (earlierChangeNewValue == laterChangeOldValue) {
                        this._setItemOldValue(itemBefore, earlierChangeOldValue, valueKey);
                        this._transactionStack.splice(i, 1);
                    }
                }
            }
        },

        _isAdjacentChangesOfSameType: function(currentItem, itemBefore) {
            var compDataAdjacentChanges = (currentItem.type == 'wysiwyg.editor.managers.undoredomanager.DataChange' &&
                itemBefore.type == 'wysiwyg.editor.managers.undoredomanager.DataChange');
            var compPropertyAdjacentChanges = (currentItem.type == 'wysiwyg.editor.managers.undoredomanager.PropertyChange' &&
                itemBefore.type == 'wysiwyg.editor.managers.undoredomanager.PropertyChange' );
            var appBuilderAdjacentChanges = (currentItem.type == 'wixapps.integration.managers.undoredomanager.AppBuilderChange' &&
                itemBefore.type == 'wixapps.integration.managers.undoredomanager.AppBuilderChange' ) &&
                currentItem.changeType == itemBefore.changeType;

            var themeDataAdjacentChanges = (currentItem.type == 'wysiwyg.editor.managers.undoredomanager.ThemeDataChange' &&
                itemBefore.type == 'wysiwyg.editor.managers.undoredomanager.ThemeDataChange' );
            var textScalingDataAdjacentChanges = (currentItem.type == 'wysiwyg.editor.managers.undoredomanager.TextScalingChange' &&
                itemBefore.type == 'wysiwyg.editor.managers.undoredomanager.TextScalingChange' );

            return (compDataAdjacentChanges || compPropertyAdjacentChanges || appBuilderAdjacentChanges || themeDataAdjacentChanges || textScalingDataAdjacentChanges);
        },

        _getItemOldValue: function(item, key) {
            var oldValue = (item.type === 'wysiwyg.editor.managers.undoredomanager.TextScalingChange') ?
                item.oldValue :
                item.oldValue && item.oldValue[key];
            return oldValue;
        },

        _getItemNewValue: function(item, key) {
            var newValue = (item.type === 'wysiwyg.editor.managers.undoredomanager.TextScalingChange') ?
                item.newValue :
                item.newValue && item.newValue[key];
            return newValue;
        },

        _setItemOldValue: function(item, value, key) {
            if (item.type === 'wysiwyg.editor.managers.undoredomanager.TextScalingChange') {
                item.oldValue = value;
            }
            else {
                item.oldValue[key] = value;
            }
        },

        _checkIfUnifyLayoutChanges: function() {
            for (var earlierIndex = this._transactionStack.length - 1; earlierIndex > 0; earlierIndex--) {
                for (var laterIndex = earlierIndex - 1; laterIndex >= 0; laterIndex--) {
                    var areBothLayoutChanges = (
                        this._transactionStack[earlierIndex].type == 'wysiwyg.editor.managers.undoredomanager.LayoutChange' &&
                        this._transactionStack[laterIndex].type == 'wysiwyg.editor.managers.undoredomanager.LayoutChange'
                        );
                    if (!areBothLayoutChanges) {
                        continue;
                    }
                    var earlierNewAnchors = this._transactionStack[earlierIndex].newAnchors;
                    var laterOldAnchors = this._transactionStack[laterIndex].oldAnchors;
                    if (this.injects().Utils.areObjectsEqual(earlierNewAnchors, laterOldAnchors)) {
                        this._transactionStack[laterIndex].oldAnchors = this._transactionStack[earlierIndex].oldAnchors;
                        this._transactionStack.splice(earlierIndex, 1);
                        break; //break inner loop
                    }
                }
            }

        },

        _handlePreliminaryAction: function(changeData) {
            var i = 0;
            if (this._checkIfToPerformPreliminaryAction) {

                var preliminaryActions = [];
                var changedComponents = [];
                for (i = 0; i < changeData.transaction.length; i++) {
                    var singleTransaction = changeData.transaction[i];
                    var curPreliminaryActions = this.modules[this._getType(singleTransaction.type)].getPreliminaryActions(changeData.transaction[i]);
                    if (curPreliminaryActions) {
                        preliminaryActions = preliminaryActions.concat(curPreliminaryActions);

                        if (singleTransaction.changedComponentIds) {
                            var transactionChangedComponents = singleTransaction.changedComponentIds.map(function(changedCompId) {
                                return this.resources.W.Preview.getCompLogicById(changedCompId);
                            }.bind(this));

                            changedComponents = changedComponents.concat(transactionChangedComponents);
                        }
                    }
                }

                var uniqueChangedComponents = W.Utils.getUniqueArray(changedComponents);
                if (changeData.preliminaryActionsIgnoredComponentId){
                    uniqueChangedComponents = _.filter(uniqueChangedComponents,function(comp){
                        return comp.getComponentId() !== changeData.preliminaryActionsIgnoredComponentId;
                    });
                }

                var isSomeActionPerformed = false;
                var uniquePreliminaryActions = this.resources.W.Utils.getUniqueArray(preliminaryActions);
                if (uniquePreliminaryActions.length > 0) {
                    for (i = 0; i < uniquePreliminaryActions.length; i++) {
                        var isActionPerformed = this._performPreliminaryAction(uniquePreliminaryActions[i], uniqueChangedComponents);
                        isSomeActionPerformed = isSomeActionPerformed || isActionPerformed;
                    }

                    if (isSomeActionPerformed) {
                        this._checkIfToPerformPreliminaryAction = false;
                        return true;
                    }
                }
            }

        },

        _performPreliminaryAction: function(action, changedComponents) {
            switch (action) {
                case this._constants.PreliminaryActions.SELECT_COMPONENT:
                    var editedComponent = this.resources.W.Editor.getEditedComponent();
                    var allSelectedComps = this.resources.W.Editor.getAllSelectedComponents();
                    if (this.resources.W.Utils.areArraysContainSameElements(allSelectedComps, changedComponents)) {
                        return false;
                    }
                    this.resources.W.Editor.setSelectedComps(changedComponents);
                    //this was changed by Ido&Nadav for mobile.
                    return false;

                case this._constants.PreliminaryActions.OPEN_COMPONENT_PANEL:
                    if (this.resources.W.Editor.getEditorUI().getSkinPart('propertyPanel').getIsDisplayed()) {
                        return false;
                    }
                    var editorUI = this.resources.W.Editor.getEditorUI();
                    editorUI.getPanelsLayer().showPropertyPanel();
                    return true;

                case this._constants.PreliminaryActions.OPEN_BACKGROUND_EDITOR_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.BackgroundEditorPanel', 'WEditorCommands.ShowBackgroundEditorPanel', {args: null, canGoBack: true, name: "Background", skinPart: "backgroundDesign", state: "designPanel"});

                case this._constants.PreliminaryActions.OPEN_BACKGROUND_DESIGN_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.BackgroundDesignPanel', 'WEditorCommands.ShowBackgroundDesignPanel', {args: null, canGoBack: false, name: "Design", skinPart: "design", state: "designPanel"});

                case this._constants.PreliminaryActions.OPEN_COLORS_DESIGN_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.ColorsDesignPanel', 'WEditorCommands.ShowColorsPanel');

                case this._constants.PreliminaryActions.OPEN_FONTS_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.FontsPanel', 'WEditorCommands.ShowFontsPanel');

                case this._constants.PreliminaryActions.OPEN_CUSTOMIZE_FONTS_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.CustomizeFontsPanel', 'WEditorCommands.CustomizeFonts');

                case this._constants.PreliminaryActions.OPEN_CUSTOMIZE_COLORS_PANEL:
                    return W.Utils.openSidePanel('wysiwyg.editor.components.panels.DynamicPalettePanel', 'WEditorCommands.CustomizeColors');

                case this._constants.PreliminaryActions.CLOSE_CHOOSE_STYLE_DIALOG:
                    return W.EditorDialogs.closeDialogById('_chooseStyle');

                default:
                    throw new Error("UndoRedoManager._performPreliminaryAction: preliminary action: " + action + ' is not supported.');
            }
        },

        _undoTransaction: function(transactionData) {
            this._commitTransaction(transactionData, 0, 'undo');
        },

        _redoTransaction: function(transactionData) {
            this._commitTransaction(transactionData, 0, 'redo');
        },

        _commitTransaction: function(transactionData, i, undoOrRedoCommand) {
            i = i || 0;
            var dataType, isModuleFinished;
            for (i; i < transactionData.length; ++i) {
                dataType = transactionData[i].type;
                isModuleFinished = this._applyChangeMap(undoOrRedoCommand, transactionData[i], dataType);
                if (isModuleFinished === false) {
                    this._waitForModuleToFinish(dataType, transactionData, i, undoOrRedoCommand);
                    return;
                }
            }

            if (i === transactionData.length) {
                this._performPostEnforceAnchors(transactionData);
                this._notifyUndoRedoCompleted(undoOrRedoCommand);
            }
        },

        _notifyUndoRedoCompleted: function(undoOrRedoCommand) {
            switch (undoOrRedoCommand) {
                case 'undo':
                    this.fireEvent(Constants.UrmEvents.UNDO_COMPLETE);
                    break;
                case 'redo':
                    this.fireEvent(Constants.UrmEvents.REDO_COMPLETE);
                    break;
            }
        },

        _performPostEnforceAnchors: function(transactionData) {
            for (var i = 0; i < transactionData.length; i++) {
                var dataType = transactionData[i].type;
                var module = this.modules[this._getType(dataType)];
                module.postEnforceAnchors(transactionData[i]);
            }
        },

        _waitForModuleToFinish: function(dataType, transactionData, i, undoOrRedoCommand) {
            var isModuleFinished = this.modules[this._getType(dataType)].getModuleFinished();
            if (isModuleFinished) {
                this._commitTransaction(transactionData, i + 1, undoOrRedoCommand);
            }
            else {
                this.injects().Utils.callLater(this._waitForModuleToFinish, [dataType, transactionData, i, undoOrRedoCommand], 70);
            }
        },

        startTransaction: function(uniqueTransactionOwner) {
            if (this._isInTransaction || this._isInUndoRedo) {
                return;
            }

            if (!this.isActionSupportedByURM) {
                return;
            }

            if (uniqueTransactionOwner) {
                this._uniqueTransactionId = uniqueTransactionOwner;
            }

            // start listening to data managers
            this._startListen();

            this._numDataChangeInTransaction = 0;

            this._isInTransaction = true;
            this._transactionStack = [];
            this._overridePreliminaryActionsIgnoredCompId = null;
        },

        _startListen: function() {
            this._layoutData.startListen();
            this._positionData.startListen();
            this._scopeData.startListen();
            this._compData.startListen();
            this._compPropData.startListen();
            this._zOrderData.startListen();
            this._addDeleteComponentData.startListen();
            this._componentStyleData.startListen();
            this._componentAdvancedStyleData.startListen();
            this._themeData.startListen();
            this._textData.startListen();
            this._appBuilderData.startListen();
            this._rotationData.startListen();
            this._componentBehaviorsData.startListen();
            this._mobilePropertySplitData.startListen();
            this._textScalingData.startListen();
            this._lockComponentData.startListen();
            this._customBgChangeHandler.startListen();
        },

        endTransaction: function(uniqueTransactionOwner) {
            if (this._isInUndoRedo) {
                return;
            }

            // reset stacks for enableTransaction===null (overrides addPage)
            if (this._resetAfterTransaction) {
                this._resetAfterTransaction = false;
                this._resetStacks();
                return;
            }

            this.isActionSupportedByURM = true;
            if (!this._isInTransaction || (this._uniqueTransactionId && this._uniqueTransactionId !== uniqueTransactionOwner)) {
                return;
            }

            //RichText Experiment
            var richTextEditor = this._getRichTextEditor();
            if (richTextEditor.isInEditingMode) {
                return;
            }

            this._isInTransaction = false;
            this._uniqueTransactionId = null;

            // stop listening to data managers
            this._stopListen();

            if (!this._transactionStack.length) {
                return;
            }

            this._rearrangeTransactionOrderIfNeeded();

            this._checkIfUnifyLayoutChanges();

            this._transactionCounter++;

            var transaction = {
                constructor: function Transaction() {
                },
                transaction: this._transactionStack,
                pageId: this._getCurrentPageId(),
                id: this._transactionCounter
            };

            this._undoStack.unshift(transaction);

            if (this._overridePreliminaryActionsIgnoredCompId){
                this._undoStack[0].preliminaryActionsIgnoredComponentId = this._overridePreliminaryActionsIgnoredCompId;
            }
            this._overridePreliminaryActionsIgnoredCompId = null;

            this._transactionStack = [];

            this._setUndoRedoButtons();

            return transaction.id;
        },

        _getRichTextEditor: function() {
            var componentEditBox = this.resources.W.Editor.getComponentEditBox();
            return componentEditBox._skinParts.richTextEditor;
        },

        overrideCurrentTransactionPreliminaryActionsIgnoredComponent: function(componentId){
            if (this._isInUndoRedo || !this._isInTransaction){
                return;
            }
            this._overridePreliminaryActionsIgnoredCompId = componentId;
        },

        _rearrangeTransactionOrderIfNeeded: function() {
            var textModuleIndex = this._transactionStack.map(function(transaction) {
                return transaction.type;
            }).indexOf('wysiwyg.editor.managers.undoredomanager.TextDataChange');
            var transactionStackLastIndex = this._transactionStack.length - 1;
            if (textModuleIndex > -1 && textModuleIndex < transactionStackLastIndex) {
                this._transactionStack = W.Utils.moveItemInArray(this._transactionStack, textModuleIndex, transactionStackLastIndex);
            }
        },

        _stopListen: function() {
            this._layoutData.stopListen(); // use Preview Layout manager if possible; Nadav?
            this._positionData.stopListen(); // use Preview Layout manager if possible; Nadav?
            this._scopeData.stopListen();
            this._componentStyleData.stopListen();
            this._componentAdvancedStyleData.stopListen();
            this._compData.stopListen();
            this._compPropData.stopListen();
            this._zOrderData.stopListen();
            this._addDeleteComponentData.stopListen();
            this._themeData.stopListen();
            this._textData.stopListen();
            this._appBuilderData.stopListen();
            this._rotationData.stopListen();
            this._componentBehaviorsData.stopListen();
            this._mobilePropertySplitData.stopListen();
            this._textScalingData.stopListen();
            this._lockComponentData.stopListen();
            this._customBgChangeHandler.stopListen();
        },

        _isTransactionData: function(changeMap) {
            return changeMap.transaction && typeOf(changeMap.transaction) == "array";
        },

        _applyChangeMap: function(command, changeMap, type) {
            var result;
            try {
                result = this.modules[this._getType(type)][command](changeMap);
            } catch (error) {
                LOG.reportError(wixErrors.UNDO_RETURNED_ERROR_WHILE_TRYING_TO_APPLY_CHANGE, 'UndoRedoManager', '_applyChangeMap', {c1: command + ', ' + type, desc: JSON.stringify(error)});
            }
            return result;
        },

        _getType: function(dataType) {
            return  dataType.replace(this._constants._prefix, '').replace(this._constants._wixapps_prefix, '');
        },

        _resetFutureStack: function() {
            if (this._isRedoable()) {
                this._redoStack = [];
            }
        },

        _isUndoable: function() {
            return this._undoStack.length > 0;
        },

        _isRedoable: function() {
            return this._redoStack.length > 0;
        },

        _removeItemFromStack: function(stack) {
            stack.splice(0, 1);
        },

        _refreshComponentEditBox: function() {
            var Editor = this.injects().Editor;

            if (Editor.getSelectedComp()) {
                Editor.getComponentEditBox().fitToComp();
            }
        },

        _resetStacks: function() {
            this._isInTransaction = false;
            this._transactionStack = [];
            this._redoStack = [];
            this._undoStack = [];
            this._setUndoRedoButtons();
        },

        _onPageChange: function(pageId) {
            this._currentPageId = pageId;
        },

        _getCurrentPageId: function() {
            return this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
        },

        _getComponentPropDataManager: function() {
            return this.injects().Preview.getPreviewManagers().ComponentData;
        },

        _getComponentDataManager: function() {
            return this.injects().Preview.getPreviewManagers().Data;
        },

        getURMVersion: function() {
            return null;
        },

        cancelCurrentTransaction: function () {
            if (this._isInUndoRedo || !this._isInTransaction) {
                return;
            }

            this._isInTransaction = false;
            this._uniqueTransactionId = null;

            // stop listening to data managers
            this._stopListen();

            this._transactionStack = [];
        },

        _handleFinalizingActions: function(changeData) {
            var actions = [],
                changedComponents = [],
                transActions,
                uniqueActions,
                utils = this.resources.W.Utils;

            function getActionsFromTransactions() {
                var res = [],
                    i,
                    m,
                    singleTransaction;

                for (i = 0; i < changeData.transaction.length; i++) {
                    singleTransaction = changeData.transaction[i];
                    m = this.modules[this._getType(singleTransaction.type)];
                    if (typeof m.getFinalizingActions === 'function') {
                        transActions = m.getFinalizingActions(singleTransaction);
                        if (transActions) {
                            res = res.concat(transActions);
                        }
                    }
                }
                return res;
            }

            if (!changeData.transaction) {
                return;
            }

            actions = getActionsFromTransactions.call(this);
            uniqueActions = utils.getUniqueArray(actions);
            uniqueActions.forEach(this._performFinalizingAction.bind(this));
        },

        _performFinalizingAction: function (action) {
            var fActions = this._constants.FinalizingActions;

            switch (action) {
                case fActions.CLOSE_CHOOSE_STYLE_DIALOG:
                    W.EditorDialogs.closeDialogById('_chooseStyle');
                    break;

                case fActions.CLOSE_ADVANCED_STYLE_DIALOG:
                    W.EditorDialogs.closeDialogById('_advancedStyleDialog', 'CANCEL');
                    break;

                case fActions.CLEAR_REDO_STACK:
                    //this._removeItemFromStack(this._redoStack);
                    this._resetFutureStack();
                    break;

                default:
                    throw new Error("UndoRedoManager._performFinalizingAction: preliminary action: " + action + ' is not supported.');
            }
        },

        getCurrentTransactionId: function () {
            return this._transactionCounter;
        },

        /**
         * Removes specific transaction from the history
         * @param transId id of transaction
         */
        removeTransaction: function (transId) {
            function removeFrom(list, id) {
                var i = -1;
                list.some(function (item, index) {
                    if (item.id === id) {
                        i = index;
                        return true;
                    }
                    return false;
                });
                if (i > -1) {
                    list.splice(i, 1);
                    return true;
                }
                return false;
            }

            if (!removeFrom(this._undoStack, transId)) {
                removeFrom(this._redoStack, transId);
            }

            this._setUndoRedoButtons();
        },
        /**
         * Removes all transaction from the history starting with given
         * @param transId first transaction id to remove
         */
        removeTransactionAndAfter: function (transId) {
            function removeAllFrom(list) {
                var i = 0;
                while (i < list.length) {
                    if (list[i].id >= transId) {
                        list.splice(i, 1);
                    } else {
                        ++i;
                    }
                }
            }


            if (this._isInUndoRedo) {
                return;
            }
            removeAllFrom(this._undoStack);
            removeAllFrom(this._redoStack);

            this._setUndoRedoButtons();
        }
    });
});
