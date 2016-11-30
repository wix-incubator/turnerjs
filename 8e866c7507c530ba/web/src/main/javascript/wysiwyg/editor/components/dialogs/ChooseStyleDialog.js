define.component('wysiwyg.editor.components.dialogs.ChooseStyleDialog', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Editor', 'W.UndoRedoManager']);

    def.utilize(['wysiwyg.editor.components.dialogs.utils.ChooseStyleChangeTracker']);

    def.binds(['_itemOver', '_itemOut', '_itemClick', '_customItemClick', '_onDialogClosing', '_onDialogOpened', '_validateStyle', '_editStyleClicked', '_advancedStyleClosingCallback']);

    def.dataTypes(['StyleList', 'map']);

    def.methods({

        initialize: function(compId, viewNode, args){
            //Wixapps proxies still send the component instance and not its id because their ids in mobile don't have the "mobile_" prefix so we can't find them in dom
            var selectedComponent = args.selectedComponent || (args.selectedComponentId && W.Preview.getCompLogicById(args.selectedComponentId));
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._setEditedComponent(selectedComponent); //this must be before the events below!
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);

            this.getViewNode().on(Constants.CoreEvents.MOUSE_ENTER, this, function() {
                W.Editor.getComponentEditBox().setState('styleChangeOpacity', 'opacityLevel');
            });
            this.getViewNode().on(Constants.CoreEvents.MOUSE_LEAVE, this, function() {
                W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');
            });

            this._openDialogUndoRedoId = null;
            this._changeTracker = new this.imports.ChooseStyleChangeTracker(this._editedComponent, args.undoRedoSubType);
            this._undoRedoSubType = args.undoRedoSubType;
        },

        _setSelectedSkinInGallery: function (skinName) {
            var sList,
                i,
                toSelect = -1;

            if (!this._predefinedButtonsList) {
                return;
            }

            sList = this._predefinedButtonsList.getDataProviderItems();

            for (i = 0; i < sList.length; i++) {
                if (sList[i].getData().commandParameter === skinName) {
                    toSelect = i;
                    break;
                }
            }

            if (toSelect === -1) {
                this._predefinedButtonsList.clearSelection();
            } else {
                this._predefinedButtonsList._selectCompAtIndex(toSelect);
            }
        },

        getInlineContentContainer: function(){
            return this._view;
        },

        _createFields: function(){
            this._customStyleClass = null;
            this._originalStyleClass = this._editedComponent.getStyle();
            this._originalStyle = this._originalStyleClass.getId();
            this._styleToApply = this._originalStyle;
            this._currentlySelectedStyle = this._styleToApply;

            this._buildCustomStyleButton();
            this.addBreakLine('5px');
            this.addLabel(this._translate('CHOOSE_STYLE_APPLY_PRESET', 'Or apply a preset style below'), null, 'small', null, null, null, 'choose_style_ttid');
            this.addBreakLine('20px'); //this is a temporary fix for WOH-1290 in which in DE/FR langs, the tooltip for the above label was not reachable.
            this._buildStyleButtons();

        },

        setEditedComponent: function(comp){
            this.disposeFields();

            this._editedComponent = comp;
            this._originalStyle = comp.getStyle().getId();
            this._currentlySelectedStyle = comp.getStyle().getId();
            var styleNameSpace = this._editedComponent.getStyleNameSpace();
            var styleItems = this._data.get('styles') || this._data.get("styleItems");
            var items = [];
            var compStyles = styleItems[styleNameSpace] || styleItems;
            var selectedStyleIndex;

            for (var i = 0; i < compStyles.length; i++){
                var di = W.Data.createDataItem({type: 'Button', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'COMPONENT_STYLE_' + compStyles[i]), commandParameter: compStyles[i]}, 'Button');
                if (compStyles[i] == this._originalStyle){
                    selectedStyleIndex = i;
                }
                items.push(di);
            }

            var listArgs = {
                selectedIndex: selectedStyleIndex
            };

            this.addSelectionListInputField("", items, listArgs, {
                type              : 'wysiwyg.editor.components.ChooseStyleButton',
                skin              : 'wysiwyg.editor.skins.buttons.ChooseStyleButtonSkin',
                numRepeatersInLine: 1
            }).runWhenReady(function(logic){
                    logic.addEvent('itemOver', this._itemOver);
                    logic.addEvent('itemOut', this._itemOut);
                    logic.addEvent('inputChanged', this._itemClick);
                    logic.addEvent('editStyleClicked', this._editStyleClicked);
                }.bind(this));
        },

        _setEditedComponent: function(comp){
            this._editedComponent = comp || W.Editor.getEditedComponent();
        },

        _buildStyleButtons: function(){
            var styleNameSpace = this._editedComponent.getStyleNameSpace();
            var styleItems = this._data.get('styles') || this._data.get("styleItems");
            var items = [];
            var compStyles = styleItems[styleNameSpace] || styleItems;
            var selectedStyleIndex = -1;
            var listArgs = {};
            var dataItem = null;

            for (var i = 0; i < compStyles.length; i++){
                dataItem = null;
                dataItem = W.Data.createDataItem({
                    type            : 'Button',
                    label           : this._translate('COMPONENT_STYLE_' + compStyles[i]),
                    commandParameter: compStyles[i]
                }, 'Button');

                if (compStyles[i] == this._originalStyle){
                    selectedStyleIndex = i;
                }
                items.push(dataItem);
            }

            listArgs.selectedIndex = selectedStyleIndex;

            this.addSelectionListInputField("", items, listArgs, {
                type              : 'wysiwyg.editor.components.ChooseStyleButton',
                skin              : 'wysiwyg.editor.skins.buttons.ChooseStyleButtonSkin',
                numRepeatersInLine: 1
            }).runWhenReady(function(logic){
                    this._predefinedButtonsList = logic;
                    logic.addEvent('itemOver', this._itemOver);
                    logic.addEvent('itemOut', this._itemOut);
                    logic.addEvent('inputChanged', this._itemClick);
                    logic.addEvent('editStyleClicked', this._editStyleClicked);
                }.bind(this));

            this._changeTracker.addFromStyleToUiUpdater(function styleDataChanged(eventData) {
                this._currentlySelectedStyle = this._styleToApply = eventData.styleName;
                this._setSelectedSkinInGallery(eventData.styleName);
            }.bind(this));
        },

        _buildCustomStyleButton: function(){
            var dataItem = null;
            var selectedStyleIndex = -1;
            var listArgs = {};
            var styleId = null;
            var isCustom = this._editedComponent.getStyle().getIsCustomStyle();

            if (isCustom){
                selectedStyleIndex = 0;
                this._customStyleClass = this._editedComponent.getStyle();
                styleId = this._customStyleClass.getId();
            }

            listArgs.selectedIndex = selectedStyleIndex;

            dataItem = W.Data.createDataItem({
                type            : 'Button',
                label           : this._translate('CHOOSE_STYLE_COMPONENT_'+ this._editedComponent.$className.split('.').getLast()),//, 'Personalize this element'),
                commandParameter: styleId || ''
            }, 'Button');

            this.addSelectionListInputField("", [dataItem], listArgs, {
                type              : 'wysiwyg.editor.components.ChooseStyleButton',
                skin              : 'wysiwyg.editor.skins.buttons.ChooseCustomStyleButtonSkin',
                numRepeatersInLine: 1
            }).runWhenReady(function(logic){
                    this._customButtonsList = logic;
                    //                logic.addEvent('itemOver', this._customItemOver);
                    //                logic.addEvent('itemOut', this._customItemOut);
                    logic.addEvent('inputChanged', this._customItemClick);
                    //                logic.addEvent('editStyleClicked', this._editStyleClicked);
                }.bind(this));
        },

        _editStyleClicked: function(eventData){
            if (eventData.type==="editStyleClicked") { //this means it was by clicking on one of the preset style buttons' Edit Style link. I want to ignore the cases where this is from 'Personalize this <component>'
                LOG.reportEvent(wixEvents.EDIT_PRESET_STYLE_CLICK, {c1: this._editedComponent && typeof this._editedComponent.$className==='string' && this._editedComponent.$className.split('.').getLast() || ''});
            }

            var cmd = W.Commands.getCommand("WEditorCommands.CustomizeComponentStyle");
            eventData.params.editedComponent = this._editedComponent;
            eventData.params.closeCallback = this._advancedStyleClosingCallback;
            eventData.params.undoRedoSubType = this._undoRedoSubType;
            cmd.execute(eventData.params);
        },

        _itemOver: function(event){
            this._styleToApply = event.data.commandParameter;
            this._invalidateStyle();
        },

        _itemOut: function(event){
            this._styleToApply = this._currentlySelectedStyle;
            this._invalidateStyle();
        },

        _itemClick: function(buttonDataItem){
            if (!(buttonDataItem && buttonDataItem.value && buttonDataItem.value.get)) {
                return;
            }
            this._customButtonsList && this._customButtonsList.clearSelection();
            this._styleToApply = buttonDataItem.value.get('commandParameter');

            this._setStyleByID(this._styleToApply, true);
            this._currentlySelectedStyle = this._styleToApply;

            if(this._customStyleClass){
                this._customStyleClass.getDataItem().markDataAsClean();
                this._customStyleClass = null;
            }
        },

        _customItemClick: function(buttonDataItem){
            if (!(buttonDataItem && buttonDataItem.value && buttonDataItem.value.get)) {
                return;
            }

            LOG.reportEvent(wixEvents.PERSONALIZE_COMP_STYLE_CLICK, {c1: this._editedComponent && typeof this._editedComponent.$className==='string' && this._editedComponent.$className.split('.').getLast() || ''});

            if (!this._customStyleClass || this._styleToApply !== this._customStyleClass.getId()){

                this._predefinedButtonsList.clearSelection();

                this._customStyleClass = this.injects().Preview.getPreviewManagers().Theme.cloneStyle(this._editedComponent.getStyle(), this._editedComponent.getID());
                this._customStyleClass.getDataItem().markDataAsDirty();
                buttonDataItem.value.set('commandParameter', this._customStyleClass.getId());

                this._setCustomComponentStyle(this._customStyleClass, this._editedComponent.$className);
                this._styleToApply = this._customStyleClass.getId();
                this._currentlySelectedStyle = this._styleToApply;

                this._changeTracker.writeStateToHistory(this._styleToApply);
            }

            this._openAdvancedStylingDialog();

        },
        /**
         *
         * @param {core.managers.style.SkinParamMapper} style
         * @param {string} compClassName
         * @private
         */
        _setCustomComponentStyle: function(style, compClassName){
            this._setComponentStyle(style);
            style.setIsCustomStyle(true);
            style.setCompClassName(compClassName);
            style.setCompId(this._editedComponent.getID());
        },

        _openAdvancedStylingDialog: function(){
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            this._editStyleClicked({params: {left: pos.x}});

        },

        _invalidateStyle: function(){
            if (!this._styleRenderCall){
                this._styleRenderCall = this.injects().Utils.callLater(this._validateStyle, undefined, undefined, 150);
            }
        },

        _validateStyle: function(){
            this._setStyleByID(this._styleToApply);
            delete this._styleRenderCall;
        },

        //Experiment StyleNS.New was promoted to feature on Mon Aug 20 19:25:58 IDT 2012
        _setStyleByID : function(styleName, writeToHistory){
            var themeManager = this.injects().Preview.getPreviewManagers().Theme,
                styleAvailable = themeManager.isStyleAvailable(styleName);

            var styleSetter = function setStyle( style) {
                this._setComponentStyle(style);
                if (writeToHistory) {
                    this._changeTracker.writeStateToHistory(styleName);
                }
            }.bind(this);

            if (styleAvailable){
                themeManager.getStyle(styleName, styleSetter);
            } else {
                var styleNameSpace = this._editedComponent.getStyleNameSpace();
                var defaultSkin = W.Editor.getDefaultSkinForStyle(styleName) || W.Editor.getDefaultSkinForComp(styleNameSpace) || this._editedComponent.getSkin().className;
                themeManager.createStyle(styleName, styleNameSpace, defaultSkin, styleSetter);
            }
        },

        _updatePreviousStyleSelection: function(){
            if(typeof this._previousStyleIndex === "number"){
                this._predefinedButtonsList._selectCompAtIndex(this._previousStyleIndex);
                this._previousStyleIndex = null;
            }
        },

        _getCurrentStyleIndex: function(){
            var styleNameSpace = this._editedComponent.getStyleNameSpace();
            var styleItems = this._data.get('styles') || this._data.get("styleItems");
            var compStyles = styleItems[styleNameSpace] || styleItems;

            var previousStyleIndex = -1;
            _.forEach(compStyles, function(style, index){
                if(style === this._styleToApply){
                    previousStyleIndex = index;
                    return false; //break early
                }
            }, this);

            return previousStyleIndex;
        },

        _onDialogOpened: function (event) {
            var style = this._editedComponent.getStyle();

            this._changeTracker.startTracking();

            this._updateOriginalStyleAndSkin(Object.clone(style.getRawData()), this._editedComponent.getSkin().$class);
            this._previousStyleIndex = this._getCurrentStyleIndex();

            this._openDialogUndoRedoId = this._commitDialogOpenedTransaction(event.dialog);
            W.Editor.setKeysEnabled(true);
        },

        _onDialogClosing: function(event){
            var urm = this.injects().UndoRedoManager;

            this._changeTracker.stopTracking();

            if (event.result && event.result === 'CANCEL') {
                this._updatePreviousStyleSelection();
                var style = this._editedComponent.getStyle();
                style.resetStyleFromData(this._originalStyleData, this._originalSkinClass);
                urm.removeTransactionAndAfter(this._openDialogUndoRedoId);
            } else {
                urm.removeTransaction(this._openDialogUndoRedoId);
            }

            W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');
        },

        _commitDialogOpenedTransaction: function (dialog) {
            var data = {
                    data: {
                        subType: this._undoRedoSubType,
                        changedComponentIds: [this._editedComponent.getComponentId()],
                        dialog: dialog
                    }
                },
                transOwner = {},
                urm = this.injects().UndoRedoManager,
                commands = this.injects().Commands;

            urm.startTransaction(transOwner);
            commands.executeCommand('WEditorCommands.ChooseStylePopupOpened', data);
            return urm.endTransaction(transOwner);
        },

        _advancedStyleClosingCallback: function(event){
            if (event.result && event.result !== 'CANCEL'){
                // TODO: decide what to do with changes from Advanced Style
                //this._updateOriginalStyleAndSkin(event.currentStyleData, event.currentSkinClass);
                this._previousStyleIndex = this._getCurrentStyleIndex();
            }
        },
        _updateOriginalStyleAndSkin: function(rawStyleData, skinClass){
            this._originalStyleData = rawStyleData;
            this._originalSkinClass = skinClass;
        },

        //Experiment StyleNS.New was promoted to feature on Mon Aug 20 19:25:58 IDT 2012
        _setComponentStyle: function(style){
            this._editedComponent.setStyle(style);
        }

    });
});