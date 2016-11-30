define.component('wysiwyg.editor.components.dialogs.ChangeGalleryDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.resources(['W.UndoRedoManager', 'W.CompDeserializer', 'W.CompSerializer', 'W.CommandsNew']);

    def.binds(['_whenListIsReady', '_onGalleryReady', '_onDialogClosing', '_onAddGalleryRequest']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._container = args.selectedComp.getParentComponent();
            this._originalGallery = args.selectedComp;
            this._selectedGallery = args.selectedComp;
            this._dialogWindow = args.dialogWindow;
            this._originalGalleryArgs = {
                itemIds: args.selectedComp._data._data.items,
                layout: args.selectedComp.getPosition(),
                galleryClass: args.selectedComp.$className
            };
            this._galleryReadyQ = Q.defer();
            this._dialogClosingQ = Q.defer();

            this._dialogWindow._skinParts.dialogDescription.setStyle('font-size', '13px');

            this._startListeners();
            //this._saveOriginalGalleryInfo();
            this._saveOriginalGalleryJson();
        },
        /*_saveOriginalGalleryInfo: function(){
            var position = this._originalGallery.getPosition(),
                globalPosition = this._originalGallery.getGlobalPosition(),
                editBox = this.resources.W.Editor.getEditingFrame();

            this._originalGalleryInfo = {
                position: position,
                globalPosition: globalPosition,
                container: editBox.getEditedComponentContainerInPosition(globalPosition.x, globalPosition.y, editBox._getContainersGeometryOfCurrentPageAndMasterPage())
            };
        },*/
        _saveOriginalGalleryJson: function() {
            var gallery = this._originalGallery,
                changedComponentData = this.resources.W.CompSerializer.serializeComponents([gallery.getViewNode()], true),
                transactionData = {
                    componentData: changedComponentData,
                    data: {
                        changedComponentIds: [gallery.getComponentId()],
                        oldState: {
                            parentId: gallery.getParentComponent().getComponentId(),
                            changedComponentData: changedComponentData
                        },
                        newState: {
                            parentId: null,
                            changedComponentData: null
                        }
                    }
                };

            this._originalGalleryJson = transactionData;
        },
        _createFields: function(){
            this._galleryListProxy = this._addField(
                'wysiwyg.editor.components.panels.ChangeGalleryPanel',
                'wysiwyg.editor.skins.panels.SelectableListPanelSkin',
                this._originalGalleryArgs
            );
            this._galleryListProxy.runWhenReady(this._whenListIsReady);
        },
        _whenListIsReady: function(listLogic){
            this._galleryListLogic = listLogic;
            this._galleryReadyQ.resolve(this);
        },
        _onAddGalleryRequest: function(params){
            this.resources.W.Editor.doDeleteSelectedComponent(true);
            this.resources.W.Editor.resetNumOfNewComponentsWithoutComponentMovement();
            this.resources.W.CommandsNew.executeCommand('WEditorCommands.AddComponent', params, this);
        },
        _onGalleryReady: function(gallery){
            LOG.reportEvent(window.wixEvents.CHANGE_GALLERY, {c1: gallery.$className, c2: this._selectedGallery.$className});
            this._selectedGallery = gallery;
            //this._moveGalleryToOriginalLocation();
        },
        /*_moveGalleryToOriginalLocation: function(){
            var editBox = this.resources.W.Editor.getEditingFrame();

            editBox.addEditedComponentToContainer(this._originalGalleryInfo.container.htmlNode, null, this._originalGalleryInfo.globalPosition);
            this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", this._originalGalleryInfo.position, this);
        },*/
        _onDialogClosing: function(event){
            if(this._selectedGallery === this._originalGallery){
                this._clearListeners();
                this._dialogWindow.closeDialog();
                return;
            }
            switch (event.result){
                case W.EditorDialogs.DialogButtons.CANCEL:
                    this._onCancelRequested();
                    break;
                case Constants.DialogWindow.CLICK_OUTSIDE:
                    this._onOkRequested();
                    break;
                case W.EditorDialogs.DialogButtons.OK:
                    this._onOkRequested();
                    break;
            }
            this._clearListeners();
            this._dialogWindow.closeDialog();
            this._galleryListLogic.reset();
        },
        _onCancelRequested: function(){
            this.resources.W.Editor.doDeleteSelectedComponent(true);
            this._restoreOriginalGallery();
            this._dialogClosingQ.resolve(this._originalGallery);
        },
        _onOkRequested: function(){
            this.resources.W.UndoRedoManager.startTransaction();
            this._commitDeleteOriginalGalleryTransaction();
            this._commitAddSelectedGalleryTransaction(this._selectedGallery);
            this.resources.W.UndoRedoManager.endTransaction();
            this._dialogClosingQ.resolve(this._selectedGallery);
        },
        _restoreOriginalGallery: function(){
            var oldState = this._originalGalleryJson.data.oldState,
                parent = W.Preview.getCompLogicById(oldState.parentId);

            this.resources.W.CompDeserializer.createAndAddComponents(parent.getViewNode(), oldState.changedComponentData, true, true, undefined, undefined, true, true, true);
        },
        /**
         * AddComponent action is NOT registered to UndoRedoManager by default,
         * So we have to implement the transaction manually.
         *
         * @param gallery
         * @private
         */
        _commitAddSelectedGalleryTransaction: function(gallery){
            var changedComponentData = this.resources.W.CompSerializer.serializeComponents([gallery.getViewNode()], true),
                transactionData = {
                    changedComponentIds: [gallery.getComponentId()],
                    oldState: {
                        parentId: null,
                        changedComponentData: null
                    },
                    newState: {
                        parentId: gallery.getParentComponent().getComponentId(),
                        changedComponentData: changedComponentData
                    }
                };

            this.resources.W.CompDeserializer.fireEvent('onComponentAdd', transactionData);
        },
        _commitDeleteOriginalGalleryTransaction: function(){
            this.resources.W.Editor.fireEvent('onComponentDelete', this._originalGalleryJson);
        },
        _startListeners: function(){
            this.resources.W.Commands.registerCommandAndListener('ChangeGallery.AddNewGallery', this, this._onAddGalleryRequest);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.ComponentReady', this, this._onGalleryReady);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },
        _clearListeners: function(){
            this.resources.W.Commands.unregisterCommand('WEditorCommands.ComponentReady');
            this.resources.W.Commands.unregisterCommand('ChangeGallery.AddNewGallery');
            this.resources.W.Commands.unregisterListener(this._onGalleryReady);
            this.resources.W.Commands.unregisterListener(this._onAddGalleryRequest);
            this._dialogWindow.removeEvent('onDialogClosing', this._onDialogClosing);
        }
    });
});