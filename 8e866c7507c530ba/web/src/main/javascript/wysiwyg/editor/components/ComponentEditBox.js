define.component('wysiwyg.editor.components.ComponentEditBox', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.utilize(['wysiwyg.editor.managers.MouseComponentModifier']);

    def.resources(['W.Classes', 'W.Editor', 'W.Preview', 'W.Commands', 'W.UndoRedoManager', 'W.Config']);

    def.binds(['_mouseDownHandler', '_startDrag','fitToComp',
        '_onScreenResize', '_doubleClickHandler', '_editRichText',
        'showAnchorsHandler', '_onCompAutoSized', '_updateControllersDisplay',
        '_onComponentMoveEnd', '_onComponentMoved', '_onComponentResizeEnd','_onComponentResize',
        '_clearAnchorGuides','_handleRightClick', '_hideTextEditing', '_onSelectedComponentChange',
        'fitToComp','_onComponentRotate', '_onComponentRotateEnd','_preRotateOperations',
        '_toggleRulersVisibilityState', '_onMoveToFooterButtonClicked', '_handleUpdatedPageHeight',
        '_drawComponentBorder'
    ]);
    def.skinParts({
        rotatablePart: {'type': 'htmlElement'},
        nonRotatablePart: {'type': 'htmlElement'},
        unlockHandle: {'type': 'htmlElement'},
        topLeft: { 'type': 'htmlElement'},
        left: { 'type': 'htmlElement'},
        bottomLeft: { 'type': 'htmlElement'},
        bottom: { 'type': 'htmlElement'},
        pushKnob: { 'type': 'htmlElement'},
        bottomRight: { 'type': 'htmlElement'},
        right: { 'type': 'htmlElement'},
        topRight: { 'type': 'htmlElement'},
        top: { 'type': 'htmlElement'},
        minHeightMark: { 'type': 'htmlElement'},
        anchorGuides: { 'type': 'htmlElement'},
        topKnob: { 'type': 'htmlElement'},
        topRightKnob: { 'type': 'htmlElement'},
        rightKnob: { 'type': 'htmlElement'},
        bottomRightKnob: { 'type': 'htmlElement'},
        bottomKnob: { 'type': 'htmlElement'},
        bottomLeftKnob: { 'type': 'htmlElement'},
        leftKnob: { 'type': 'htmlElement'},
        topLeftKnob: { 'type': 'htmlElement'},
        // editButton: { 'type': 'htmlElement'},
        //returnButton: {'type':'htmlElement'},
        dragHandle: {'type': 'htmlElement'},
        multiSelectLayer: {'type': 'htmlElement'},
        richTextEditor: {'type': 'wysiwyg.editor.components.richtext.WRichTextEditor', 'argObject': {isEditorText: true}},
        posSizeIndicator: { 'type': 'htmlElement'},
        rotateHandle: { 'type': 'htmlElement'},
        rotationResetHandle: { 'type': 'htmlElement'},
        moveToFooterButton: { type: 'wysiwyg.editor.components.MoveToFooterButton'}
        //toolBar: {type:'wysiwyg.editor.components.RichTextToolBar'}
    });
    def.states({
        lockedComponent:['unlocked','locked'],
        editMode: ['normalEdit', 'inPlaceEdit', 'differentScopeEdit', 'nonDragEdit'],
        isMasterPage: ['masterPage', 'notMasterPage'],
        isSiteSegment: ['siteSegment', 'notSiteSegment'],
        isFixed:['fixed', 'notFixed'],
        structureState:['desktop', 'mobile'],
        rotationState:['rotated', 'notRotated'],
        rotationSection:['rotationSection0','rotationSection1', 'rotationSection2', 'rotationSection3', 'rotationSection4', 'rotationSection5', 'rotationSection6','rotationSection7', 'rotationSection8', 'rotationSection9', 'rotationSection10', 'rotationSection11'],
        paddingFromComponent: ['noPadding', 'topBottomPadding', 'leftRightPadding'],
        opacityLevel: ['fullOpacity', 'styleChangeOpacity']
    });

    def.statics({
        MAX_HEIGHT: 60000,
        MIN_HEIGHT: 500
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this._UPH = W.Editor.userPreferencesHandler;
            this._gridLines = args.gridLines ;
            this.resources.W.Editor.registerEditorComponent('editingFrame', this);

            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WToggleRulers", this, this._toggleRulersVisibilityState);

            if (this.resources.W.Preview && this.resources.W.Preview.isSiteReady && this.resources.W.Preview.isSiteReady()){
                this.getLockedComponentsDataAndUpdate();
            }
            else{
                this._previewReadyCommand = this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._onPreviewIsReady);
            }

            //Super
            this.parent(compId, viewNode, args);

            //Save a reference to Container class definition for serialization purposes
            this.resources.W.Classes.get("core.components.Container", function (classDef) {
                this._containerBaseClass = classDef;
            }.bind(this));

            this.setMaxH(this.MAX_HEIGHT + 50);
            this.setMaxW(10000);

            this._previewManager = this.resources.W.Preview;
            this._mouseComponentModifier = new this.imports.MouseComponentModifier();

            this._initEventRegistration();

            this._$width = this._$height = 1;

            this._initLockComponent();

            this.resources.W.Editor.addEvent("draggedComponentUpdatedPageHeight", this._handleUpdatedPageHeight);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.DrawComponentBorder", this, this._drawComponentBorder);
        },

        _initLockComponent:function(){
            this._lockedComponents = {};
            this._componentsThatCanotBeLocked = {
                'wysiwyg.viewer.components.HeaderContainer' : 1,
                'wysiwyg.viewer.components.PagesContainer' : 1,
                'wysiwyg.viewer.components.FooterContainer' : 1,
                'wysiwyg.viewer.components.ScreenWidthContainer' : 1
            };
        },

        isComponentLocked: function () {
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                return false;
            }
            var selectedComps = this.resources.W.Editor.getArrayOfSelectedComponents();
            var compId;
            for(var i=0; i<selectedComps.length; i++){
                compId = selectedComps[i].getComponentId();
                if(this._lockedComponents[compId]){
                    return true;
                }
            }
            return false;
        },

        _saveLockedComponentsDataToPrefs: function(){
            this._UPH.setData('locked', this._lockedComponents, {key: 'masterPage'});
        },

        _onPreviewIsReady:function(){
            this._previewReadyCommand.unregisterListener(this);
            this.getLockedComponentsDataAndUpdate();
        },

        getLockedComponentsDataAndUpdate: function(){
            // will be saved globally and not per page, because some of elements could be locked and shown on all pages
            var pageId = "masterPage";
            this._UPH.getData('locked', {key: pageId})
                .then(function(data){
                    this._lockedComponents = data;
                }.bind(this));
        },

        _toggleRulersVisibilityState: function() {
            this._areRulersVisible = !this._areRulersVisible ;
        },

        _initEventRegistration: function () {
            this._registerExternalEvents();
            var commands = this.resources.W.Commands;
            commands.registerCommandAndListener(Constants.EditorUI.RESIZE_HANDLES_CHANGED, this, this._updateControllersDisplay);
            commands.registerCommandAndListener(Constants.EditorUI.START_EDIT_RICH_TEXT, this, this._editRichText);

            commands.registerCommandListenerByName('WEditorCommands.componentScopeChange', this, function (componentScope) {
                this._setIsMasterPage(componentScope == this.resources.W.Editor.EDIT_MODE.MASTER_PAGE);
            }.bind(this));
            commands.registerCommandAndListener('WEditorCommands.SelectedComponentChange', this, this._onSelectedComponentChange);
            commands.registerCommandAndListener("EditorCommands.gotoSitePage", this, this.getLockedComponentsDataAndUpdate);
            commands.registerCommandAndListener("WEditorCommands.BeforeSaveUserPrefs", this, this._saveLockedComponentsDataToPrefs);
        },

        _registerExternalEvents: function(){
            // Listen to screen resize event
            var editor = this.resources.W.Editor;
            editor.addEvent(editor.SCREEN_RESIZE_EVENT, this._onScreenResize);
        },

        _onScreenResize: function () {
            var _this = this;
            clearTimeout(this._onScreenResizeTimeout);
            this._onScreenResizeTimeout = setTimeout(function(){
                _this.fitToComp();
            },220);
        },

        /**
         * When skin is ready tell Preview Manager to inject the preview site IFrame into
         * the site container skin part. This allows for preview skin to be replaced without reloading
         * the site.
         */
        _onAllSkinPartsReady: function () {
            this.collapse();
            this._addToolTipToSkinPart(this._skinParts.dragHandle, 'Boundary_box_drag_handle_ttid');
            this._addToolTipToSkinPart(this._skinParts.pushKnob, 'Boundary_box_push_knob_ttid');
            this._addActionsMapToTextIgnoreList();
            this._skinParts.richTextEditor.addEvent('endEditing', this._hideTextEditing);
            this._addToolTipToSkinPart(this._skinParts.unlockHandle, 'Boundary_box_unLock_button_ttid');
        },

        /**
         * so that text editing won't close when resizing and such.
         * @private
         */
        _addActionsMapToTextIgnoreList: function(){
            var ignoreList = [];
            var skinPartNames = [
                'leftKnob', 'left', 'rightKnob', 'right', 'bottomLeft','bottomLeftKnob','bottomRight','bottomRightKnob',
                'dragHandle','pushKnob','bottom','topLeft','topLeftKnob','topRight','topRightKnob','top','topKnob','bottomKnob',
                'rotateHandle', 'rotationResetHandle'
            ];
            for (var i=0;i<skinPartNames.length; i++) {
                ignoreList.push(this._skinParts[skinPartNames[i]]);
            }
            this._skinParts.richTextEditor.setClosingTriggersIgnoreList(ignoreList);
        },

        _getEditModeState: function () {
            return this.getState('editMode');
        },

        _setEditModeState: function (value) {
            this.setState(value, 'editMode');
        },

        editComponent: function (startDrag, event) {
            this._showPotentialHGroups = false;

            if (typeof this._editedComponent.shouldBeFixedPosition === 'function' && this._editedComponent.shouldBeFixedPosition()) {
                this.setState('fixed', 'isFixed');
            } else {
                this.setState('notFixed', 'isFixed');
            }

            if (this._editedComponent.isSiteSegment()) {
                this.setState('siteSegment', 'isSiteSegment');
            }
            else {
                this.setState('notSiteSegment', 'isSiteSegment');
            }


            this._setEditModeState('normalEdit');

            this.fitToComp();
            this.uncollapse();

            this._updateControllersDisplay();
            this._listenToUserEvents();
            this._editedComponent.addEvent('autoSizeChange', this._onCompAutoSized);

            /*Handle Drag*/
            if (startDrag) {
                this._startDrag(event, false);
            }

            this.resources.W.Editor.showEditedComponentInViewPort();

            this.refreshMultiSelect();

            this._originalContainer = this._editedComponent.getParentComponent();

            var editingStructure = this.resources.W.Config.env.isViewingSecondaryDevice() ? 'mobile' : 'desktop';
            this.setState(editingStructure,'structureState');
        },

        cleanPreviousEditState: function(){
            //bugfix: when resizing, mouse up outside the window, and then moving a page,
            //it doesn't remove the resizing mousemove and mousup events, so it moves the page.
            //in order to avoid that, for safely reasons, we remove those event anyway.
            this._mouseComponentModifier.removeEvent("componentResized", this._onComponentResize);
            this._mouseComponentModifier.removeEvent("resizeEnd", this._onComponentResizeEnd);

            this._stopListeningToComp();
        },

        _onSelectedComponentChange: function(cmdEvent){
            var comp = cmdEvent.comp;
            this._editedComponentChanged = this._editedComponent !== this.resources.W.Editor.getEditedComponent();
            this._editedComponent = comp;
            this._draggedComponentTouchedPageBottom = false;
            this._skinParts.moveToFooterButton.collapse();
            this._isEditedComponentHidden = this.resources.W.Editor.isEditedComponentHidden();
            if(this._editedComponent) {
                this._setEditBoxPaddingState(this._editedComponent);
            }
        },

        _setEditBoxPaddingState: function(editedComponent) {
            var editedComponentView = editedComponent.getViewNode(),
                isLeftRightPaddingNeeded = (editedComponentView.getWidth() <= editedComponent.MINIMUM_WIDTH_DEFAULT),
                isTopBottomPaddingNeeded = (editedComponentView.getHeight() <= editedComponent.MINIMUM_HEIGHT_DEFAULT);

            if(isLeftRightPaddingNeeded) {
                this.setState('leftRightPadding', 'paddingFromComponent');
            } else if(isTopBottomPaddingNeeded) {
                this.setState('topBottomPadding', 'paddingFromComponent');
            } else {
                this.setState('noPadding', 'paddingFromComponent');
            }
        },

        _updateControllersDisplay: function () {
            this._view.set('rotatable', this._editedComponent.isRotatable());
            var enabledSides = this._getEnabledSides();
            /** @type Boolean*/
            this._topEnabled = enabledSides.contains(Constants.BaseComponent.ResizeSides.TOP);
            /** @type Boolean*/
            this._bottomEnabled = enabledSides.contains(Constants.BaseComponent.ResizeSides.BOTTOM);
            /** @type Boolean*/
            this._rightEnabled = enabledSides.contains(Constants.BaseComponent.ResizeSides.RIGHT);
            /** @type Element*/
            this._leftEnabled = enabledSides.contains(Constants.BaseComponent.ResizeSides.LEFT);

            this._setIsMasterPage();

            this._view.set('topEnabled', this._topEnabled);
            this._view.set('rightEnabled', this._rightEnabled);
            this._view.set('bottomEnabled', this._bottomEnabled);
            this._view.set('leftEnabled', this._leftEnabled);
            this._view.set('topRightEnabled', this._topEnabled && this._rightEnabled);
            this._view.set('bottomRightEnabled', this._bottomEnabled && this._rightEnabled);
            this._view.set('bottomLeftEnabled', this._bottomEnabled && this._leftEnabled);
            this._view.set('topLeftEnabled', this._topEnabled && this._leftEnabled);

            //            this._showControllers(this._leftEnabled, this._rightEnabled, this._topEnabled, this._bottomEnabled);
            this._showControllers();

        },

        _getEnabledSides:function(){
            return this.isComponentLocked() ? [] : this._editedComponent.getResizableSides();
        },

        _setIsMasterPage: function () {
            var isPagesContainer = this._editedComponent.isInstanceOfClass('wysiwyg.viewer.components.PagesContainer');
            var editedCompScope = this.resources.W.Editor.getComponentScope(this._editedComponent);
            var isMasterPage = !isPagesContainer && editedCompScope == "MASTER_PAGE" ? 'masterPage' : 'notMasterPage';
            this.setState(isMasterPage, 'isMasterPage');
        },

        _drawComponentBorder: function(params){
            var compCoordiantes = params.compCoordiantes;
            this._skinParts.boundingLeft.setStyles({backgroundColor: params.borderColor, left: compCoordiantes.x, top: compCoordiantes.y, height: compCoordiantes.h, width: 1});
            this._skinParts.boundingRight.setStyles({backgroundColor: params.borderColor, left: compCoordiantes.x + compCoordiantes.w, top: compCoordiantes.y, height: compCoordiantes.h, width: 1});
            this._skinParts.boundingTop.setStyles({backgroundColor: params.borderColor, left: compCoordiantes.x, top: compCoordiantes.y, height: 1, width: compCoordiantes.w});
            this._skinParts.boundingBottom.setStyles({backgroundColor: params.borderColor, left: compCoordiantes.x, top: compCoordiantes.y + compCoordiantes.h, height: 1, width: compCoordiantes.w});
        },

        _showControllers: function () {
            var unlockHandle = this._skinParts.unlockHandle;
            if (this.isComponentLocked()) {
                unlockHandle.uncollapse();
                this.setState('locked', 'lockedComponent');
            } else {
                unlockHandle.collapse();
                this.setState('unlocked', 'lockedComponent');
            }

            this._skinParts.topLeftKnob.uncollapse();
            this._skinParts.topRightKnob.uncollapse();
            this._skinParts.bottomLeftKnob.uncollapse();
            this._skinParts.bottomRightKnob.uncollapse();
            this._skinParts.pushKnob.uncollapse();

            if (!this._leftEnabled) {
                this._skinParts.leftKnob.collapse();
                this._skinParts.topLeftKnob.collapse();
                this._skinParts.bottomLeftKnob.collapse();
            } else {
                this._skinParts.leftKnob.uncollapse();
            }

            if (!this._rightEnabled) {
                this._skinParts.rightKnob.collapse();
                this._skinParts.topRightKnob.collapse();
                this._skinParts.bottomRightKnob.collapse();
            } else {
                this._skinParts.rightKnob.uncollapse();
            }

            if (!this._topEnabled) {
                this._skinParts.topKnob.collapse();
                this._skinParts.topLeftKnob.collapse();
                this._skinParts.topRightKnob.collapse();
            } else {
                this._skinParts.topKnob.uncollapse();
            }

            if (!this._bottomEnabled) {
                this._skinParts.pushKnob.collapse();
                this._skinParts.bottomKnob.collapse();
                this._skinParts.bottomLeftKnob.collapse();
                this._skinParts.bottomRightKnob.collapse();
            } else {
                this._skinParts.bottomKnob.uncollapse();
            }

            if (this.getState('isSiteSegment') == 'siteSegment') {
                this._skinParts.bottomKnob.collapse();
                this._skinParts.bottomLeftKnob.collapse();
                this._skinParts.bottomRightKnob.collapse();
            }

            this._skinParts.dragHandle.uncollapse();
            if(this._isDragHandlesShouldBeHidden()){
                this._skinParts.dragHandle.collapse();
            }

            this._skinParts.rotateHandle.uncollapse();
            this._skinParts.rotationResetHandle.uncollapse();
            if (this._isRotateHandlesShouldBeHidden()){
                this._skinParts.rotateHandle.collapse();
                this._skinParts.rotationResetHandle.collapse();
            }
            this.modifyControllersToRotation();

            this._skinParts.right.uncollapse();
            this._skinParts.top.uncollapse();
            this._skinParts.bottom.uncollapse();
            this._skinParts.left.uncollapse();

            this._skinParts.moveToFooterButton.collapse();
            this._hideBoundingContainer();

            if (!this.isComponentLocked() && ((!this._leftEnabled && !this._leftEnabled) || (!this._topEnabled && !this._bottomEnabled))) {
                this._skinParts.topLeft.collapse();
                this._skinParts.bottomLeft.collapse();
                this._skinParts.topRight.collapse();
                this._skinParts.bottomRight.collapse();
            } else {
                this._skinParts.topLeft.uncollapse();
                this._skinParts.bottomLeft.uncollapse();
                this._skinParts.topRight.uncollapse();
                this._skinParts.bottomRight.uncollapse();
            }
        },

        _isDragHandlesShouldBeHidden:function(){
            var editedComponent = this._editedComponent;
            var compType = editedComponent.$className;
            return (compType == 'wysiwyg.viewer.components.PagesContainer' ||
                    this.isComponentLocked() ||
                    typeof this._editedComponent.shouldBeFixedPosition==='function' && this._editedComponent.shouldBeFixedPosition() );
        },

        _isRotateHandlesShouldBeHidden:function(){
            return !this._editedComponent.isRotatable() || this.isComponentLocked();
        },

        _hideShowMoveToFooterButton: function(){
            if (this._draggedComponentTouchedPageBottom){
                this._skinParts.moveToFooterButton.uncollapse();
            } else {
                this._skinParts.moveToFooterButton.collapse();
            }
        },

        _hideControllers: function () {
            this._skinParts.dragHandle.collapse();
            this._skinParts.leftKnob.collapse();
            this._skinParts.topLeftKnob.collapse();
            this._skinParts.bottomLeftKnob.collapse();
            this._skinParts.rightKnob.collapse();
            this._skinParts.topRightKnob.collapse();
            this._skinParts.bottomRightKnob.collapse();
            this._skinParts.topKnob.collapse();
            this._skinParts.topLeftKnob.collapse();
            this._skinParts.topRightKnob.collapse();
            this._skinParts.pushKnob.collapse();
            this._skinParts.bottomKnob.collapse();
            this._skinParts.bottomLeftKnob.collapse();
            this._skinParts.bottomRightKnob.collapse();
            this._skinParts.rotateHandle.collapse();
            this._skinParts.rotationResetHandle.collapse();
            this._skinParts.right.collapse();
            this._skinParts.top.collapse();
            this._skinParts.bottom.collapse();
            this._skinParts.left.collapse();
            this._skinParts.moveToFooterButton.collapse();
            this._hideBoundingContainer();
        },

        _showBoundingContainer: function(){
            this._skinParts.boundingLeft.uncollapse();
            this._skinParts.boundingRight.uncollapse();
            this._skinParts.boundingTop.uncollapse();
            this._skinParts.boundingBottom.uncollapse();
        },

        _hideBoundingContainer: function(){
            this._skinParts.boundingLeft.collapse();
            this._skinParts.boundingRight.collapse();
            this._skinParts.boundingTop.collapse();
            this._skinParts.boundingBottom.collapse();
        },

        //overrides baseComponent
        _rotateComponent: function(angle){
            if (angle !== 0){
                this._skinParts.rotatablePart.style.webkitBackfaceVisibility = 'hidden';
            } else {
                this._skinParts.rotatablePart.style.webkitBackfaceVisibility = '';
            }
            var transformPrefix = W.Utils.getCSSBrowserFeature('transform');
            if (!transformPrefix && angle !== 0){
                // For IE 8 that doesn't support transform
                this._rotateIEComponent();
                return;
            }
            if (angle === 0){
                this._skinParts.rotatablePart.style[transformPrefix] = '';
            } else {
                this._skinParts.rotatablePart.style[transformPrefix] = 'rotate(' + angle + 'deg)';
            }
        },

        //overrides baseComponent
        _rotateIEComponent: function(){
            var cosAlpha = Math.cos(W.Utils.Math.degreesToRadians(this._$angle)),
                sinAlpha = Math.sin(W.Utils.Math.degreesToRadians(this._$angle));
            var matrixDx = (this._$width + this._$height*sinAlpha - this._$width*cosAlpha)*0.5;
            var matrixDy = (this._$height - this._$height*cosAlpha - this._$width*sinAlpha)*0.5;
            this._skinParts.rotatablePart.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + cosAlpha + ", M12="+ (-sinAlpha) + ", M21=" + sinAlpha +  ", M22=" + cosAlpha + ", Dx=" + matrixDx + ", Dy=" + matrixDy + ",sizingMethod='auto expand')";
            this._skinParts.rotatablePart.style.zIndex = 1;
            this._updateIE8FilterAdjustments();
            this._setCoordinate("_$x", "left", this.getX(), false);
            this._setCoordinate("_$y", "top", this.getY(), false);
        },

        _setCoordinate: function(coordinate, styleAttrib, value, isEventFired) {
            var number = parseInt(value, 10);
            var isIE8 = !W.Utils.getCSSBrowserFeature('transform');
            if(this[coordinate] != number || isIE8)
            {
                if(isNaN(number))
                {
                    W.Utils.debugTrace('WbaseComp','setCoordinate',"NaN passed as value");
                    return;
                }
                this[coordinate] = number;
                // for IE 8 rotation fix
                if (isIE8){
                    switch (styleAttrib) {
                        case 'left':
                            if (this._$leftAdjustment){
                                number += this._$leftAdjustment;
                            }
                            break;
                        case 'top':
                            if (this._$topAdjustment){
                                number += this._$topAdjustment;
                            }
                            break;
                    }
                }
                this._skinParts.rotatablePart.setStyle(styleAttrib, ''.concat(number, "px"));
                if(isEventFired) {
                    this.onMovement();
                }
            }
        },

        setWidth: function (value, forceUpdate, triggersOnResize) {
            if (triggersOnResize !== false) {
                triggersOnResize = true;
            }
            value = parseInt(value, 10);
            if (isNaN(value)) {
                W.Utils.debugTrace('WbaseComp', 'setWidth', "NaN passed as value");
                return;
            }
            value = this._limitWidth(value);
            if (this._$width != value || forceUpdate) {
                this._$width = value;
                this._skinParts.rotatablePart.setStyle("width", value + "px");
                if (triggersOnResize) {
                    this._onResize();
                }
                this.flushMinPhysicalHeightCache();
                this.flushPhysicalHeightCache();
            }
        },

        setHeight: function (value, forceUpdate, triggersOnResize) {
            if (triggersOnResize !== false) {
                triggersOnResize = true;
            }
            value = parseInt(value, 10);
            if (isNaN(value)) {
                W.Utils.debugTrace('WbaseComp', 'setHeight', "NaN passed as value");
                return;
            }
            value = this._limitHeight(value);
            if (this._$height != value || forceUpdate) {
                this._$height = value;
                this._skinParts.rotatablePart.setStyle("min-height", this._$height + "px");
                this.flushPhysicalHeightCache();
                if (triggersOnResize) {
                    this._onResize();
                }
            }
        },

        _handleUpdatedPageHeight: function(pageHeightData){
            var pageComp = pageHeightData.pageComp;
            var compBottom = pageHeightData.draggedComponentBottom;
            var pageHeight = pageComp.getHeight();

            //this was added since a lot of page skins define their inline content with a bottom of 20px
            //and we couldn't change their skin definition but want to show the button
            var pageInlineContainerBottom = parseInt(pageComp.getInlineContentContainer().getStyle('bottom'), 10);
            if (pageInlineContainerBottom){
                pageHeight -= pageInlineContainerBottom;
            }

            this._draggedComponentTouchedPageBottom = this._shouldCheckForCompBottomChange() &&
                this._isDraggedComponentTouchedPageBottom(compBottom, pageHeight);
        },

        _shouldCheckForCompBottomChange: function(){
            return (!this.resources.W.Config.env.isViewingSecondaryDevice() && this._duringDrag &&
                this._editedComponent.canMoveToOtherScope() && this._editedComponent.getShowOnAllPagesChangeability());
        },

        _isDraggedComponentTouchedPageBottom: function(compBottom, pageHeight){
            return (compBottom > 0 && compBottom + this._skinParts.moveToFooterButton.MOVEMENT_TOLERANCE >= pageHeight);
        },

        lockComponent: function (source, components) {
            var selectedComps = components ? components : this.resources.W.Editor.getArrayOfSelectedComponents();
            var compId;
            var componentsForLockStatus = [];
            this.resources.W.UndoRedoManager.startTransaction();
            for(var i=0; i<selectedComps.length; i++){
                compId = selectedComps[i].getComponentId();
                componentsForLockStatus.push({
                    component: selectedComps[i],
                    oldLockStatus: this._lockedComponents[compId] ? true: false
                });
                this._lockedComponents[compId] = 1;
            }
            this._reportLogEvent(selectedComps, source, 1);
            this._skinParts.unlockHandle.uncollapse();
            this._updateControllersDisplay();
            this.updateUndoRedoForLockStatus(componentsForLockStatus, source, true);
            this.resources.W.UndoRedoManager.endTransaction();
        },

        unlockComponent: function (source, components) {
            var selectedComps = components ? components : this.resources.W.Editor.getArrayOfSelectedComponents();
            var compId;
            var componentsForLockStatus = [];
            this.resources.W.UndoRedoManager.startTransaction();
            for(var i=0; i<selectedComps.length; i++){
                compId = selectedComps[i].getComponentId();
                componentsForLockStatus.push({
                    component: selectedComps[i],
                    oldLockStatus: this._lockedComponents[compId] ? true: false
                });
                if(this._lockedComponents[compId]){
                    delete this._lockedComponents[compId];
                }
            }
            this._reportLogEvent(selectedComps, source, 0);
            this._updateControllersDisplay();
            this.updateUndoRedoForLockStatus(componentsForLockStatus, source, false);
            this.resources.W.UndoRedoManager.endTransaction();
        },

        _lockComponent:function(source, components){
            this.injects().Commands.executeCommand('EditCommands.Lock', {components:components, source:source});
        },

        _unlockComponent:function(source, components){
            this.injects().Commands.executeCommand('EditCommands.Unlock', {components:components, source:source});
        },

        updateUndoRedoForLockStatus:function(componentsForLockStatus, source, newLockStatus){
            if(!source){
                return;
            }
            var changeData = {
                data: {
                    componentsForLockStatus: componentsForLockStatus,
                    newLockStatus: newLockStatus
                }
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.ComponentLockStatusChanged', changeData);
        },

        undoComponentsLockStatus:function(changeData){
            for(var i=0; i<changeData.componentsForLockStatus.length; i++){
                if(changeData.componentsForLockStatus[i].oldLockStatus){
                    this._lockComponent(null, [changeData.componentsForLockStatus[i].component]);
                }
                else {
                    this._unlockComponent(null, [changeData.componentsForLockStatus[i].component]);
                }
            }
        },

        redoComponentsLockStatus:function(changeData){
            var components = [];
            for(var i=0; i<changeData.componentsForLockStatus.length; i++){
                components.push(changeData.componentsForLockStatus[i].component);
            }

            if(changeData.newLockStatus){
                this._lockComponent(null, components);
            }
            else {
                this._unlockComponent(null, components);
            }
        },

        _reportLogEvent:function(selectedComps, source, isLocked){
            if(source){
                var compName = selectedComps.length > 1 ? 'multiselect' : selectedComps[0].$className;
                LOG.reportEvent(wixEvents.LOCK_COMPONENT, {i1: isLocked, c1:compName, c2:source});
            }
        },

        isSelectedComponentsCanBeLocked:function(){
            var selectedComps = this.resources.W.Editor.getArrayOfSelectedComponents();
            return _.every(selectedComps, this._canComponentBeLocked, this);
        },

        _canComponentBeLocked:function(component){
            var state = !(this._componentsThatCanotBeLocked[component.$className] ||
                component.$className.toLowerCase().indexOf('strip') >= 0 ||
                this.resources.W.Config.env.isViewingSecondaryDevice());
            return state;
        },

        _onCompAutoSized: function () {
            this.fitToComp();
            this.refreshMultiSelect();
        },

        fitToComp: function () {
            if (this._editedComponent == null){
                return;
            }
            //var editedComponentNode = this._editedComponent.getViewNode();
            var position = {};
            position.y = this._editedComponent.getSelectableY();
            position.x = this._editedComponent.getSelectableX();

            var offset = {x:0,y:0};
            if (!(typeof this._editedComponent.shouldBeFixedPosition === 'function' && this._editedComponent.shouldBeFixedPosition())) {
                offset = this._editedComponent.getViewNode().getParent().getPosition();
            }

            position.x += offset.x;
            position.y += offset.y;
            this.resources.W.Preview.previewToEditorCoordinates(position);
            //    = this._previewManager.previewToEditorCoordinates( this._editedComponent.getGlobalPosition());
//            this._previewManager.getNodeGlobalPosition(editedComponentNode.getLogic().getEditBoxReferenceNode());
            var componentPhysicalHeight = this._editedComponent.getSizeRefNode().y;
            //var componentPhysicalHeight = this._editedComponent.getPhysicalHeight();
            var componentMinHeight = this._editedComponent.getHeight() + this._editedComponent.getExtraPixels().height;

            this.setX(position.x - 5);
            this.setY(position.y - 5);
            this.setWidth(this._editedComponent.getSelectableWidth() + 10);
            this.setHeight(componentPhysicalHeight + 10);

            //Minimum height mark
            if (this._editedComponent.isResizable() && componentMinHeight < componentPhysicalHeight) {
                this._showMinHeightMark(componentMinHeight);
            }
            else {
                this._hideMinHeightMark();
            }

            this._updateAnchorGuides();

            var rotationAngle = this._editedComponent.getAngle();
            this.setAngle(rotationAngle);

            var transformPrefix = W.Utils.getCSSBrowserFeature('transform');
            this._skinParts.posSizeIndicator.style[transformPrefix] =  'rotate(' + (360-this._editedComponent.getAngle()) + 'deg)';

            this._skinParts.moveToFooterButton.updateButtonPosition(this.getBoundingX(), this.getBoundingY() + this.getBoundingHeight());
            this._hideShowMoveToFooterButton();
        },

        exitEditMode: function () {

            this._stopListeningToComp();
            this._stopListeningToUserEvents();

            this.collapse();
            this._editedComponent = null;
        },

        _stopListeningToComp: function () {
            if (this._editedComponent != null) {
                this._editedComponent.removeEvent('autoSizeChange', this._onCompAutoSized);
            }
        },

        /**
         *
         * @param componentMinHeight
         */
        _showMinHeightMark: function (componentMinHeight) {
            // stop showing MinHeightMark
            return;
        },

        _hideMinHeightMark: function () {
            this._skinParts.minHeightMark.collapse();
        },


        // Global mouse event handlers

        _listenToUserEvents: function () {
            this._stopListeningToUserEvents();
            /* EVENT DELEGATION */
            this._view.addEvent("mousedown", this._mouseDownHandler);
            this._view.addEvent("dblclick", this._doubleClickHandler);
            this._view.addEvent('contextmenu', this._handleRightClick);
        },

        _stopListeningToUserEvents: function () {
            this._view.removeEvent("mousedown", this._mouseDownHandler);
            this._view.removeEvent("dblclick", this._doubleClickHandler);
            this._view.removeEvent('contextmenu', this._handleRightClick);
        },

        _handleRightClick: function(event){
            this.resources.W.Editor.openComponentPropertyPanels(event.page, true, this.resources.W.Editor.isForcePropertyPanelVisible());
            if (!window.enableRightClickContextMenu){
                return false;
            }
        },

        _enabledSides: function (mapObj) {
            return this._editedComponent.getResizableSides().contains(mapObj);
        },

        _mouseDownHandler: function(event) {
            // this addition is in the end case, where a comp is dragged outside the window,
            // then outside the mouse is released, and then the cursor is returned to the window.
            // in that case, we miss the upHandler (which originally suppose to turn of the gridlines.
            // in this case, we use the mouseDownHandler to turn off the gridlines.
            this._disablePredraggingOperations();
            var targetSkinPart = this._getTargetSkinPart(event);
            switch(targetSkinPart){
                case 'rotateHandle':
                    this._startRotate(event);
                    break;
                case 'rotationResetHandle':
                    this._resetRotation();
                    break;
                case 'unlockHandle':
                    this._unlockComponent('EditBoxUnLockButton');
                    break;
                case 'moveToFooterButton':
                    this._onMoveToFooterButtonClicked(event);
                    break;
                default:
                    this._startResizeOrDragAction(targetSkinPart, event);
                    break;
            }
            //set the edited component to be not hidden for next mouse action, that way only the first action on hidden element is captured
            this._isEditedComponentHidden = false;
            this.resources.W.Editor.setEditedComponentHidden(false);
        },

        _onMoveToFooterButtonClicked: function(event){
            this._skinParts.moveToFooterButton.$view.fireEvent(Constants.CoreEvents.CLICK, event);
        },

        _startResizeOrDragAction:function(targetSkinPart, event){
            var resizeActionProperties = this._checkResizeAction(targetSkinPart, event);
            if (resizeActionProperties) {
                this._startResize(resizeActionProperties, event);
            }
            else {
                this._prepareForStartDrag(event);
            }
        },

        _startRotate: function(event) {
            if (!this._editedComponent._reportStartRotate){
                this._editedComponent._reportStartRotate = true;
                this._reportStartRotate();
            }
            this._preRotateOperations(event);
            this._skinParts.posSizeIndicator.uncollapse();
            this._mouseComponentModifier.startRotate();
            this._updateRotationDisplay();
        },

        _reportStartRotate: function(){
            var params = {
                c1: this._editedComponent.className,
                c2: this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId()
            };
            LOG.reportEvent(wixEvents.COMPONENT_ROTATED, params);
        },

        _preRotateOperations: function(event) {
            this._clearAnchorGuides();
            this._hideMinHeightMark();

            this._skinParts.rotationResetHandle.collapse();
            this.setState('rotated', 'rotationState');
            this._mouseComponentModifier.addEvent("componentRotated", this._onComponentRotate);
            this._mouseComponentModifier.addEvent("rotateEnd", this._onComponentRotateEnd);
        },

        _resetRotation: function() {
            this.resources.W.UndoRedoManager.startTransaction();
            var coordinates = {
                rotationAngle:0,
                updateLayout:true,
                allowPageShrink: true,
                warningIfOutOfGrid: true,
                updateControllers: true
            };
            this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompRotationAngle", coordinates, this);
            this.resources.W.UndoRedoManager.endTransaction();
            this._editedComponent._unlockSafe(true);
            if (!this._editedComponent._reportRotationReset){
                this._editedComponent._reportRotationReset = true;
                this._reportResetRotation();
            }

        },

        _reportResetRotation: function(){
            var params = {
                c1: this._editedComponent.className,
                c2: this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId()
            };
            LOG.reportEvent(wixEvents.ROTATION_RESET, params);
        },

        /**
         * Defines the CSS states of rotation for mouse cursors and layout handles.
         */
        modifyControllersToRotation: function(){
            if (this._editedComponent.getAngle() !== 0) {
                this.setState('rotated', 'rotationState');
            } else {
                this.setState('notRotated', 'rotationState');
            }

            var rotationSectionNumber = Math.floor(this._editedComponent.getAngle() / 30);
            if (rotationSectionNumber >=0 && rotationSectionNumber < 12){
                this.setState('rotationSection' + rotationSectionNumber, 'rotationSection');
            } else {
                this.setState('rotationSection0', 'rotationSection');
            }
        },

        _onComponentRotate: function(){
            this._updateRotationDisplay();
        },

        _onComponentRotateEnd: function(){
            if (this._editedComponent){
                this._skinParts.rotationResetHandle.uncollapse();
                this._skinParts.posSizeIndicator.collapse();

                this.modifyControllersToRotation();

                this._mouseComponentModifier.removeEvent("componentRotated", this._onComponentRotate);
                this._mouseComponentModifier.removeEvent("rotateEnd", this._onComponentRotateEnd);

                this._updateAnchorGuides();


            }
        },

        _updateRotationDisplay: function(){
            var str = this._editedComponent.getAngle() + "º";
            this._skinParts.posSizeIndicator.innerHTML = str;
            this._adjustPosSizeIndicatorPosition();
        },

        _getTargetSkinPart: function (event) {
            var targetElement = event.target;
            var moveToFooterButton;

            if (targetElement.$logic !== this && targetElement !== this._skinParts.rotatablePart &&
                targetElement !== this._skinParts.nonRotatablePart && !targetElement.getParent('[skinpart="rotatablePart"]')){

                //this was added because we want the target to be the button even if the actual target was one of his skinparts
                moveToFooterButton = targetElement.getParent('[comp="wysiwyg.editor.components.MoveToFooterButton"]');
                if (moveToFooterButton){
                    targetElement = moveToFooterButton;
                }
            }
            return targetElement.get('skinPart');
        },

        _prepareForStartDrag: function(event) {
            var res =this._prepareForStartDragValidation(event);
            if (res){
                return;
            }
            if(this._editedComponent.isMultiSelect || this._isEditedComponentHidden) {
                this._editedComponentChanged = false;
                this._startDrag(event, false);
                return;
            }
            var component = this._getComponentFromGlobalCoordinates(event);
            this._editedComponentChanged = this._editedComponent !== component;
            if(component && component !== this._editedComponent) {
                this.resources.W.Editor.handleComponentClicked(component, event);
            } else {
                this._startDrag(event, false);
            }
        },

        _prepareForStartDragValidation : function (event){
            var targetSkinPart = this._getTargetSkinPart(event);
            if(targetSkinPart =='dragHandle'){
                this._startDrag(event, true);
                return true;
            }

            if(this._isMouseOnRichTextToolBar(event)){
                return true;
            }
            return false;
        },

        _isMultiselectionKeyWasPressed:function(event){
            return event.control || event.shift;
        },

        _checkResizeAction: function(targetSkinPart) {
            switch (targetSkinPart) {
                case 'top':
                case 'topKnob':
                    return {
                        'resizeType': 'top',
                        'snapDirections': { top: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.TOP
                    };
                case 'topRight':
                case 'topRightKnob':
                    return {
                        'resizeType': 'topRight',
                        'snapDirections': { top: true, right: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.RIGHT
                    };
                case 'right':
                case 'rightKnob':
                    return {
                        'resizeType': 'right',
                        'snapDirections': { right: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.RIGHT
                    };
                case 'bottomRight':
                case 'bottomRightKnob':
                    return {
                        'resizeType': 'bottomRight',
                        'snapDirections': { bottom: true, right: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.RIGHT
                    };
                case 'bottom':
                case 'bottomKnob':
                    return {
                        'resizeType': 'bottom',
                        'snapDirections': { bottom: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.BOTTOM
                    };
                case 'pushKnob':
                    return {
                        'resizeType': 'bottomPush',
                        'snapDirections': { bottom: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.BOTTOM
                    };
                case 'bottomLeft':
                case 'bottomLeftKnob':
                    return {
                        'resizeType': 'bottomLeft',
                        'snapDirections': { bottom: true, left: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.LEFT
                    };
                case 'left':
                case 'leftKnob':
                    return {
                        'resizeType': 'left',
                        'snapDirections': { left: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.LEFT
                    };
                case 'topLeft':
                case 'topLeftKnob':
                    return {
                        'resizeType': 'topLeft',
                        'snapDirections': { top: true, left: true },
                        'resizeSideConstraint': Constants.BaseComponent.ResizeSides.LEFT
                    };
                default:
                    return null;
            }
        },

        _startResize: function(resizeActionProperties, event) {
            if(!this._enabledSides(resizeActionProperties.resizeSideConstraint)) {
                return;
            }

            if(this._validatePosSizeDisplay()){
                this._skinParts.posSizeIndicator.uncollapse();
                this._updateSizeDisplay();
            }

            this._preResizeOperations(event);
            this._mouseComponentModifier.startResize(resizeActionProperties.resizeType, event, resizeActionProperties.snapDirections);
        },

        _preResizeOperations: function(event) {
            this._clearAnchorGuides();
            this._hideMinHeightMark();

            this._mouseComponentModifier.addEvent("componentResized", this._onComponentResize);
            this._mouseComponentModifier.addEvent("resizeEnd", this._onComponentResizeEnd);
        },

        _onComponentResize: function(params) {
            //update MinHeightMark in case of BottomResize:
            if (this._editedComponent && params.context) {
                var componentMinHeight = this._editedComponent.getHeight() + this._editedComponent.getExtraPixels().height;
                var componentPhysicalHeight = this._editedComponent.getViewNode().getSize().y;

                if (componentMinHeight < componentPhysicalHeight) {
                    this._showMinHeightMark(componentMinHeight);
                }
            }
            if(this._validatePosSizeDisplay()){
                this._updateSizeDisplay();
            }
        },

        _onComponentResizeEnd: function() {
            if (this._editedComponent){

                this._mouseComponentModifier.removeEvent("componentResized", this._onComponentResize);
                this._mouseComponentModifier.removeEvent("resizeEnd", this._onComponentResizeEnd);

                this._updateAnchorGuides();
                this._skinParts.posSizeIndicator.collapse();
            }
            this._editedComponent.getViewNode().setStyle("z-index", 'auto');
        },


        _enablePredraggingOperations: function() {
            this._preDraggingOperationsEnabled = true;
            this.resources.W.Editor.disableEditCommands();

            if (!this._isDragHandleUsed) {
                this._hideControllers();
            }

            if (this._turnOffAfterDrag) {
                this._gridLines.hideAllGridLines() ;
            }

            //make the moved component to be above all the rest, especially above components which are in master mode:
            this._editedComponent.getViewNode().setStyle("z-index", 999999);

            this._draggingIsInProcess = true;

            if(this._validatePosSizeDisplay()){
                this._skinParts.posSizeIndicator.uncollapse();
                this._updatePositionDisplay();
            }
            this._isEditedComponentInMasterPage = (this.resources.W.Editor.getComponentScope(this._editedComponent) == this.resources.W.Editor.EDIT_MODE.MASTER_PAGE);
        },


        _disablePredraggingOperations: function() {
            this._preDraggingOperationsEnabled = false;
            this.resources.W.Editor.enableEditCommands();

            if (!this._isDragHandleUsed) {
                this._showControllers();
            }
            this._turnOffAfterDrag = !this._gridLines.areGridLinesTurnedOn() ;

            if (!this._turnOffAfterDrag) {
                this._gridLines.showAllGridLines() ;
            }

            this._editedComponent.getViewNode().setStyle("z-index", 'auto');
            this._editedComponent.getViewNode().setStyle("position", "absolute");

            this._draggingIsInProcess = false;

            if (typeof this._editedComponent.shouldBeFixedPosition === 'function' && this._editedComponent.shouldBeFixedPosition()) {
                this._editedComponent.getViewNode().setStyle("position", "fixed");
            }
        },

        _validatePosSizeDisplay: function() {
            return this._areRulersVisible ;
        },

        _startDrag: function(event, isDragHandleUsed) {
            if (!isDragHandleUsed && !this._editedComponent.isDraggable()) {
                this._openSiteSegmentPropertyPanel(event);
                return;
            }

            // Drag start points
            if (!event || event.rightClick) {
                return;
            }

            if (!this.resources.W.Editor.getEditorUI().getSkinPart('gridLines')) {
                this._gridLinesStateBeforeCompMovement = this._gridLines.getState();
            }

            this._saveMouseDownInitState(event);

            this._isDragHandleUsed = isDragHandleUsed;
            if (!isDragHandleUsed) {
                this._cacheInformationRelevantForRegularDrag();
            }

            this._mouseComponentModifier.addEvent("componentMoved", this._onComponentMoved);
            this._mouseComponentModifier.addEvent("componentMoveEnd", this._onComponentMoveEnd);

            this._mouseComponentModifier.startComponentMove(event, isDragHandleUsed);

            this.resources.W.Editor.hideFloatingPanel();
        },

        _onComponentMoved: function(params) {
            this._duringDrag = true;
            this._clearAnchorGuides();

            if (!this._preDraggingOperationsEnabled) {
                this._enablePredraggingOperations();
            }

            if(!this._isDragHandleUsed) {
                this._containersGeometryOfCurrentPageAndMasterPage = this._getContainersGeometryOfCurrentPageAndMasterPage();

                //in case the last Container is page, we need to recalculate it every time, since its height may enlarge if we drag
                //the component to the footer
                if (this._lastContainerContainingComponent && this._lastContainerContainingComponent.logic.isInstanceOfClass("core.components.Page")) {
                    this._lastContainerContainingComponent = this._getLastContainerContainingComponent();
                }
                this._handlePossibleContainerDragOver(params.event.client.x, params.event.client.y);
                this._showBoundingContainer();
            }

            // Listening to mouse move changes for Grid.
            // TODO: handle this with an event
            this._gridLines._refreshGridLines();

            if(this._validatePosSizeDisplay()){
                this._updatePositionDisplay();
            }

            this.fireEvent("componentEditBoxMoved");
            this._editedComponent.fireEvent('componentMoveStart');
        },

        _onComponentMoveEnd: function(params) {
            this._disablePredraggingOperations();

            var editedComponentIsBelowPage = (params.event.page.y > this._pageBottomAbs);
            this._editedComponent.setShowOnAllPagesChangeability(!editedComponentIsBelowPage);

            if(!this._isDragHandleUsed && params.isMoveThresholdReached){
                // Filthy hack to make this work with FPP, that overrides _handlePossibleDropInsideContainer
                // and adds arguments to it. do not delete!!
                this._handlePossibleDropInsideContainer(params.event, this.injects().Editor.isForcePropertyPanelVisible());
            }

            this._mouseComponentModifier.removeEvent("componentMoved", this._onComponentMoved);
            this._mouseComponentModifier.removeEvent("componentMoveEnd", this._onComponentMoveEnd);

            this._onCompMoveEndReportLayoutAndUndo();

            if(!this._editedComponent) {
                return;
            }

            //un-highlight highlighters
            this.resources.W.Editor.highlightContainer();
            this.resources.W.Editor.highlightParentContainer();


            // Handle deselection: if you press control, and you didn't move - deselect the component
            // you are on. this is most useful for multiselection, to unselect one of the comps
            var control = this._isMultiselectionKeyWasPressed(params.event) || params.event.event.metaKey;
            if(control && !params.isMoveThresholdReached) {
                var component = this.resources.W.Preview.componentFromGlobalCoordinates(params.event.client.x, params.event.client.y, W.Preview.selectionFilter);
                this.resources.W.Editor.handleComponentClicked(component, params.event);
            }
            else{
                this.reopenPanelForNonDragClick(params);
            }

            if (this._editedComponent) {
                this._updateAnchorGuides();
            }

            var event = params.event;
            var mouseX = event.page.x;
            var mouseY = event.page.y;
            var dX = mouseX - this._mouseStartPoint.x;
            var dY = mouseY - this._mouseStartPoint.y;
            var newXpos = this.resources.W.Editor.roundToGrid(this._compStartPoint.x + dX, event.control);
            var newYpos = this.resources.W.Editor.roundToGrid(this._compStartPoint.y + dY, event.control);
            var commandParams = {event:event, componentX:newXpos, componentY:newYpos};
            W.Commands.executeCommand("WEditorCommands.mouseUpOnSelectedComponent", commandParams);
            this._skinParts.posSizeIndicator.collapse();

            this._editedComponent.fireEvent('componentMoveEnd');

            this._duringDrag = false;
            this._hideBoundingContainer();
        },


        _onCompMoveEndReportLayoutAndUndo: function(){
            //TODO
            //reportMove, onComponentChanged and endTransaction were originally in MouseComponentModifier._endComponentMove, which is the correct
            //place for them. However, since the handling of the component scope changes is still handled in ComponentEditBox,
            //those operations MUST be run after the scope change changes (made by _handlePossibleDropInsideContainer), hence,
            //until _handlePossibleDropInsideContainer is moved to the proper class (i.e. InterfaceManager), we cannot put
            //it in MCM and we are forced to put it here.
            if (this._editedComponent.getX() != this._compStartPoint.x || this._editedComponent.getY() != this._compStartPoint.y) {
                this.resources.W.Preview.getPreviewManagers().Layout.reportMove(this.resources.W.Editor.getArrayOfSelectedComponents());
            }

            if (!this.resources.W.Editor.arePageCompsDraggableToFooter()) {
                this.resources.W.Editor.onComponentChanged(true, this._editedComponent);
            }

            this.resources.W.UndoRedoManager.endTransaction();
            //end of TODO
        },


        // Handle reopen property panel for a none drag click on a component
        reopenPanelForNonDragClick:function(params){
            if (!params.isMoveThresholdReached && this._getEditModeState() != 'inPlaceEdit') {
                var propertyPanelDisplayed = this.resources.W.Editor.getPropertyPanel().getIsDisplayed();
                var showPropertyPanel = this.resources.W.Editor.isForcePropertyPanelVisible() || (propertyPanelDisplayed && !this._editedComponentChanged);
                this.resources.W.Editor.openComponentPropertyPanels(params.event.page, true, showPropertyPanel);
            }
        },


        _cacheInformationRelevantForRegularDrag: function () {
            this._containersGeometryOfCurrentPageAndMasterPage = this._getContainersGeometryOfCurrentPageAndMasterPage();
            this._lastContainerContainingComponent = this._getLastContainerContainingComponent();
            this._containerGloballyBelowDraggedComponentAtStartDrag = this.getEditedComponentContainerInPosition(this._mouseStartPoint.x, this._mouseStartPoint.y, this._containersGeometryOfCurrentPageAndMasterPage);

            this._previewOffset = this.resources.W.Preview.getPreviewPosition().y;

            var pageNode = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            this._pageBottomAbs = this.resources.W.Editor.arePageCompsDraggableToFooter() ? pageNode.getPosition().y + pageNode.getLogic().getHeight() + this._previewOffset : Number.MAX_VALUE;

            this._isStartOfDragBelowPage = this._mouseStartPoint.y > this._pageBottomAbs;
        },

        _getLastContainerContainingComponent: function () {
            var componentParentLogic = this._editedComponent.getParentComponent();
            if (componentParentLogic.getViewNode() == this.resources.W.Preview.getPreviewManagers().Viewer.getSiteNode()) {
                return null;
            }

            return this._getContainerData(componentParentLogic);
        },

        _getContainerData: function (containerLogic) {
            var referenceNode = containerLogic._getEditBoxReferenceNode();
            var position = this._previewManager.getNodeGlobalPosition(referenceNode);
            var size = referenceNode.getSize();
            return {
                "htmlNode": containerLogic.getViewNode(),
                "logic": containerLogic,
                "x": position.x,
                "y": position.y,
                "width": size.x,
                "height": size.y
            };
        },


        _isMouseOnRichTextToolBar: function (event) {
            return this._skinParts.richTextEditor.isMouseDownEventOnTextEditor(event);
        },

        showAnchorsHandler: function (ev) {
            this._showPotentialHGroups = !this._showPotentialHGroups;
            this._updateAnchorGuides();
        },

        /**
         *Start editing richtext in place
         */
        _editRichText: function (args) {
            this._isEditingText = true;
            this.setState('inPlaceEdit', 'editMode');
            this._skinParts.richTextEditor.startEditingComponent(this._editedComponent);
            this.injects().Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
            LOG.reportEvent(wixEvents.TXT_EDITOR_OPEN_PANEL, {c1: args.source});
        },

        _hideTextEditing: function(){
            if(this._isEditingText){
                this._isInScope = true;
                this.setState('normalEdit', 'editMode');
                this._skinParts.richTextEditor.collapse();
            }
        },

        _doubleClickHandler: function(event){
            var component = this._previewManager.componentFromGlobalCoordinates(event.client.x, event.client.y, W.Preview.selectionFilter);
            var isMobileMode = this.resources.W.Config.env.isViewingSecondaryDevice();
            var compMetaData;
            var command, params;

            if (component && component === this._editedComponent){
                compMetaData = this.injects().Editor.getComponentMetaData(this._editedComponent, this.injects().Preview.translateEditorClickPosition(event.page));
                //TODO: What does this if do?
                //                if(!this._enabledSides(W.BaseComponent.ResizeSides.BOTTOM)) {
                //                    return;
                //                }

                //if "dblClick.forceNoDoubleClick" id truthy do nothing
                if (compMetaData && compMetaData.dblClick && compMetaData.dblClick.forceNoDoubleClick){
                    return;
                }

                if (component.getOriginalClassName() == 'wysiwyg.viewer.components.WRichText' && !isMobileMode){
                    this._editRichText({source: "doubleclick"});
                    this.injects().Editor.hideFloatingPanel();
                }
                //else, check for doubleclick in meta data
                else if (compMetaData && compMetaData.dblClick && compMetaData.dblClick.command && !isMobileMode){
                    command = compMetaData.dblClick.command;
                    params = compMetaData.dblClick.commandParameter || {};
                    params.selectedComp = this._editedComponent;
                    if (compMetaData.dblClick.commandParameterDataRef == 'SELF'){
                        params.data = this._editedComponent.getDataItem();
                    }
                    this.injects().Commands.executeCommand(command, params);
                    this.injects().Editor.hideFloatingPanel();
                }
                else if (isMobileMode && compMetaData && compMetaData.mobile && compMetaData.mobile.dblClick && compMetaData.mobile.dblClick.command){
                    command = compMetaData.mobile.dblClick.command;
                    params = compMetaData.mobile.dblClick.commandParameter || {};
                    params.selectedComp = this._editedComponent;
                    if (compMetaData.mobile.dblClick.commandParameterDataRef == 'SELF'){
                        params.data = this._editedComponent.getDataItem();
                    }
                    this.injects().Commands.executeCommand(command, params);
                    this.injects().Editor.hideFloatingPanel();
                }
                //else show property panel if hidden
                else {
                    this.injects().Editor.openComponentPropertyPanels(event.page, true, true);
                }
            }
        },

        _saveMouseDownInitState: function(event) {
            this._mouseStartPoint = {"x": event.page.x, "y": event.page.y};
            this._compStartPoint = {"x":this._editedComponent.getX(),"y":this._editedComponent.getY()};
            this._originalContainer = this._editedComponent.getParentComponent();
            //allows us to start dragging only when the user moved his mouse more then 5 pixels
            this._minY = this._editedComponent.getMinDragY();

            var pageNode = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            this._previewOffset = this.resources.W.Preview.getPreviewPosition().y;
            this._pageBottomAbs = pageNode.getPosition().y + pageNode.getLogic().getHeight() + this._previewOffset;

        },

        _openSiteSegmentPropertyPanel: function (event) {
            this.resources.W.Editor.openComponentPropertyPanels(event.page, true, this.resources.W.Editor.isForcePropertyPanelVisible());
        },


        _getContainersGeometryOfCurrentPageAndMasterPage: function () {
            var masterPageContainers = this.getContainersGeometry(this.resources.W.Editor.getScopeNode(this.resources.W.Editor.EDIT_MODE.MASTER_PAGE), true);
            var currentPageContainers = this.getContainersGeometry(this.resources.W.Editor.getScopeNode(this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE), false);

            if (this._isReturnEitherPageOrMasterPageContainers()){
                if (this._isEditedComponentInMasterPage){
                    return masterPageContainers;
                } else {
                    return currentPageContainers;
                }
            }

            return currentPageContainers.concat(masterPageContainers);
        },

        _isReturnEitherPageOrMasterPageContainers: function() {
            return this.resources.W.Config.env.isViewingSecondaryDevice() || !this._editedComponent.getShowOnAllPagesChangeability();
        },

        _clearAnchorGuides: function () {
            this._skinParts.anchorGuides.empty();
        },

        _updateAnchorGuides: function () {

            var circSize = 2;
            var lockSize = 20;
            var lockWidth = 40;
            var lockHeight = 20;
            this._clearAnchorGuides();
            var optionalAnchors = this.resources.W.Preview.getPreviewManagers().Layout.getOptionalBottomLocks(this._editedComponent);
            var thisB = this._editedComponent.getPhysicalHeight();
            var thisX = 20;
            var counter = 0;
            optionalAnchors.forEach(function (option) {
                if (option.locked === false && !this._showPotentialHGroups) {
                    return;
                }
                counter++;
                thisX += 10;
                var currTarget = option.target;
                var toPos = this.resources.W.Preview.getNodeGlobalPosition(currTarget.getViewNode());
                var toB = toPos.y + currTarget.getPhysicalHeight() - this.getY();
                var toX = toPos.x + currTarget.getWidth() / 2 - this.getX();
                var lowestB = Math.max(thisB, toB) + 30 + 20 * counter;
                var leftest = Math.min(toX, thisX);
                var rightest = Math.max(toX, thisX);

                var lineCls = option.locked ? "connectedAnchor" : "suggestedAnchor";
                var lockCls = option.locked ? "connectedAnchorLock" : "suggestedAnchorLock";


                var fromLineCls, toLineCls;
                if (leftest == thisX) {
                    //line is going right
                    fromLineCls = lineCls + 'Left';
                    toLineCls = lineCls + 'Right';
                } else {
                    fromLineCls = lineCls + 'Right';
                    toLineCls = lineCls + 'Left';
                }

                var fromLine = new Element('div', {'class': fromLineCls});
                fromLine.setStyles({position: "absolute", left: thisX, top: thisB + 10, height: lowestB - thisB - 10, width: circSize});
                this._skinParts.anchorGuides.adopt(fromLine);
                var sideLine = new Element('div', {'class': lineCls + 'Bottom'});
                sideLine.setStyles({position: "absolute", left: leftest - 1, top: lowestB, height: circSize, width: rightest - leftest + 2});
                this._skinParts.anchorGuides.adopt(sideLine);
                var toLine = new Element('div', {'class': toLineCls});
                toLine.setStyles({position: "absolute", left: toX - 2, top: toB + lockSize, height: lowestB - toB - lockSize, width: circSize});
                this._skinParts.anchorGuides.adopt(toLine);

                var boxMargin = 5;

                var y1 = toPos.y - this.getY() - boxMargin;
                var x1 = toPos.x - this.getX() - boxMargin;
                var y2 = y1 + currTarget.getPhysicalHeight() + boxMargin * 2;
                var x2 = x1 + currTarget.getWidth() + boxMargin * 2;

                var leftLine = new Element('div', {'class': lineCls + 'Left'});
                leftLine.setStyles({position: "absolute", left: x1, top: y1, height: y2 - y1, width: circSize});
                this._skinParts.anchorGuides.adopt(leftLine);
                var topLine = new Element('div', {'class': lineCls + 'Top'});
                topLine.setStyles({position: "absolute", left: x1, top: y1, height: circSize, width: x2 - x1});
                this._skinParts.anchorGuides.adopt(topLine);
                var rightLine = new Element('div', {'class': lineCls + 'Right'});
                rightLine.setStyles({position: "absolute", left: x2, top: y1, height: y2 - y1, width: circSize});
                this._skinParts.anchorGuides.adopt(rightLine);
                var bottomLine = new Element('div', {'class': lineCls + 'Bottom'});
                bottomLine.setStyles({position: "absolute", left: x1, top: y2, height: circSize, width: x2 - x1});
                this._skinParts.anchorGuides.adopt(bottomLine);


                var lock = new Element('div', {'class': lockCls});
                lock.setStyles({position: "absolute", left: (toX - lockHeight), top: toB, height: lockSize, width: lockSize * 2});
                this._skinParts.anchorGuides.adopt(lock);

                lock.addEvent('mousedown', function (ev) {
                    this.resources.W.Preview.getPreviewManagers().Layout.toggleHGroup(this._editedComponent, currTarget, option.locked);
                    ev.stopPropagation();
                    this._updateAnchorGuides();
                }.bind(this));

            }, this);
        },

        getContainersGeometry: function (scope, isMasterPageScope) {
            var editor = this.resources.W.Editor;
            isMasterPageScope = typeof(isMasterPageScope) === 'boolean' ? isMasterPageScope : this.resources.W.Config.env.$editorMode === editor.EDIT_MODE.MASTER_PAGE;
            var _containersGeometry = [];

            //Standard containers
            //var allComponents = this.resources.W.Editor.getEditingScope().getElements("[comp]");
            var allComponents = scope.getElements("[comp]");
            if (!isMasterPageScope) {
                allComponents.unshift(scope);
            }

            var selectedComps = this.resources.W.Editor.getArrayOfSelectedComponents();

            for (var i = 0; i < allComponents.length; i++) {
                var componentViewNode = allComponents[i];
                //we might get here things that aren't really components, anything with comp attribute
                if (!componentViewNode.getLogic) {
                    continue;
                }
                var componentLogic = componentViewNode.getLogic();

                //If we're on "MasterPage" edit mode, don't include children of
                if (!isMasterPageScope ||
                    componentViewNode.getParent("[comp=wysiwyg.viewer.components.PageGroup]") == null) {
                    // Get all instances for Container and it's subclasses
                    if (componentLogic.IS_CONTAINER && componentLogic.isContainer() && !this._logicArrayContains(selectedComps, componentLogic)) {
                        _containersGeometry.push(this._getContainerData(componentLogic));
                    }
                }
            }
            return _containersGeometry;
        },


        _logicArrayContains: function (arr, comp) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].getViewNode().contains(comp.getViewNode())) {
                    return true;
                }
            }
            return false;
        },

        _handlePossibleDropInsideContainer: function (event, isPropertyPanelVisible) {
            event = event || {};

            if(!this._editedComponent.canBeDraggedIntoContainer()){
                return;
            }

            if (this._draggedOverContainer) {
                if (this._isAttachCompToCurContainer()) {
                    this.addEditedComponentToContainer(this._draggedOverContainer.htmlNode, null, event.page);
                } else {
                    this.addEditedComponentToContainer(this._editedComponent.getParentComponent().getViewNode(), null, event.page);
                }
            } else {
                var isEditedComponentInMasterScope = this.resources.W.Editor.getComponentScope(this._editedComponent) == this.resources.W.Editor.EDIT_MODE.MASTER_PAGE;
                if (isEditedComponentInMasterScope) {
                    var globalPosition = this.resources.W.Preview.getGlobalRefNodePositionInEditor(this._editedComponent);
                    this.addEditedComponentToContainer(this.resources.W.Editor.getScopeNode(this.resources.W.Editor.EDIT_MODE.MASTER_PAGE), globalPosition, event.page);
                } else {
                    this.addEditedComponentToContainer(this._editedComponent.getParentComponent().getViewNode(), null, event.page);
                }
            }
        },

        _isDraggingPageCompToFooter: function(draggedOverContainer){
            return this.resources.W.Editor.getComponentScope(this._editedComponent) === this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE &&
                    draggedOverContainer.logic.isInstanceOfClass('wysiwyg.viewer.components.FooterContainer');
        },

        _isDraggingToDifferentParent: function(draggedOverContainer){
            var draggingOverSameContainerAsStart = this._areContainersEqual(draggedOverContainer, this._containerGloballyBelowDraggedComponentAtStartDrag),
                isComponentChildOfMasterPage = this._lastContainerContainingComponent === null;
            return !draggingOverSameContainerAsStart || !isComponentChildOfMasterPage;
        },

        _isAttachCompToCurContainer: function () {
            return !!this._draggedOverContainer &&
                !this._isDraggingPageCompToFooter(this._draggedOverContainer) &&
                this._isDraggingToDifferentParent(this._draggedOverContainer);
        },

        _areContainersEqual: function (containerA, containerB) {
            return (containerA !== undefined && containerB !== undefined &&
                    containerA !== null && containerB !== null &&
                    containerA.logic === containerB.logic);
        },

        _handlePossibleContainerDragOver: function (x, y) {
            if(!this._editedComponent.canBeDraggedIntoContainer()){
                return;
            }

            //!!!
            var masterPageState;
            this._draggedOverContainer = this.getEditedComponentContainerInPosition(x + window.pageXOffset, y + window.pageYOffset, this._containersGeometryOfCurrentPageAndMasterPage);
            this._omitReparentingWhenOutOfGridLinesInMobileEditor(x);
            this.resources.W.Editor.highlightParentContainer(this._lastContainerContainingComponent);

            if (this._isAttachCompToCurContainer()){

                this.resources.W.Editor.highlightContainer(this._draggedOverContainer);
                this.resources.W.Editor.highlightParentContainer();

                if (this._draggedOverContainer){
                    masterPageState = (this.resources.W.Editor.getComponentScope(this._draggedOverContainer.logic) === this.resources.W.Editor.EDIT_MODE.MASTER_PAGE) ? "masterPage" : "notMasterPage";
                    this.setState(masterPageState, 'isMasterPage');
                }
            } else {
                this.resources.W.Editor.highlightContainer();
                var isEditedComponentInMasterScope = this.resources.W.Editor.getComponentScope(this._editedComponent) === this.resources.W.Editor.EDIT_MODE.MASTER_PAGE;
                masterPageState = isEditedComponentInMasterScope ? "masterPage" : "notMasterPage";
                this.setState(masterPageState, 'isMasterPage');
            }

            var curMouseXWithScroll = x + window.getScroll().x;
            var curMouseYWithScroll = y + window.getScroll().y;
            if (curMouseYWithScroll > this._pageBottomAbs){
                this.setState('masterPage', 'isMasterPage');
            }
        },

        _omitReparentingWhenOutOfGridLinesInMobileEditor: function(x){
            if (this.resources.W.Config.env.isViewingSecondaryDevice()){
                var pageComp = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().getLogic();
                var mouseXRelativeToPage = x - W.Preview.getGlobalRefNodePositionInEditor(pageComp).x;
                if (mouseXRelativeToPage < 0 || mouseXRelativeToPage > this.resources.W.Preview.getPreviewManagers().Viewer.getDocWidth()){
                    this._draggedOverContainer = null;
                }
            }
        },

        _showDraggingRelatedToolTip: function (curMouseXWithScroll, curMouseYWithScroll) {
            var ttid = this._checkIfToShowMakePageLongerToolTip(curMouseYWithScroll);


            var areContainersEqual = this._areContainersEqual(this._draggedOverContainer, this._lastContainerContainingComponent);
            //                var areContainersOnSameScope = this._draggedOverContainer && this._lastContainerContainingComponent && this.resources.W.Editor.getComponentScope(this._draggedOverContainer.logic) == this.resources.W.Editor.getComponentScope(this._lastContainerContainingComponent.logic);
            var areContainersOnSameScope = this._draggedOverContainer && this.resources.W.Editor.getComponentScope(this._draggedOverContainer.logic) == this.resources.W.Editor.getComponentScope(this._editedComponent);
            var editedComponentIsBelowPage = (curMouseYWithScroll > this._pageBottomAbs);


            if (this._isAttachCompToCurContainer()) {

                if (!ttid && editedComponentIsBelowPage && !this._isStartOfDragBelowPage) {
                    ttid = 'drag_to_footer_and_change_state_ttid';
                }

                else if (!ttid && this._draggedOverContainer && !areContainersEqual && !areContainersOnSameScope) {
                    var containerLogic = this._draggedOverContainer.logic;

                    if (containerLogic.isInstanceOfClass('wysiwyg.viewer.components.HeaderContainer')) {
                        ttid = 'drag_to_header_and_change_state_ttid';
                    }
                    else if (containerLogic.isInstanceOfClass('core.components.Page')) {
                        ttid = 'drag_to_page_and_change_state_ttid';
                    }
                    //                    else if (container.isInstanceOfClass('wysiwyg.viewer.components.FooterContainer')) {
                    //                        ttid = 'drag_to_footer_and_change_state_ttid';
                    //                    }
                    else {
                        ttid = this.resources.W.Editor.getComponentScope(this._draggedOverContainer.logic) == this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE ? 'drag_to_container_on_page_and_change_state_ttid' : 'drag_to_container_on_all_pages_and_change_state_ttid';
                    }
                }

            }
            if (ttid) {
                this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: ttid}, this._editedComponent);
            }
            else {
                this.resources.W.Commands.executeCommand('Tooltip.CloseTip');
            }
        },

        _checkIfToShowMakePageLongerToolTip: function (y) {
            var offset = 20;
            var isEditedComponentInPageScope = this.resources.W.Editor.getComponentScope(this._editedComponent) == this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE;
            if (isEditedComponentInPageScope && y > this._pageBottomAbs - offset && y < this._pageBottomAbs + offset) {
                return "try_to_make_the_page_longer_ttid";
            }
            else {
                return null;
            }
        },



        addEditedComponentToContainer: function (container, componentPosition, mousePosition, isPanelOpen, isSOAPChange) {
            /** fix for wrong component in scope of MCM in specific scenarios **/
            this._mouseComponentModifier.setEditedComponent();
            var editedComponentViewNode = this._editedComponent.getViewNode();
            if (editedComponentViewNode == container || editedComponentViewNode.getParent('[comp]') == container) {
                return;
            }

            this._mouseComponentModifier.addComponentToContainer(container, this._originalContainer, componentPosition, isSOAPChange);

                this.resources.W.Editor.setSelectedComp(this._editedComponent);
                //Show both panels after changing scope:
                this.resources.W.Editor.openComponentPropertyPanels(mousePosition, !!mousePosition, isPanelOpen || this.resources.W.Editor.isForcePropertyPanelVisible());
        },

        getEditedComponentContainerInPosition: function (x, y, containersGeometry) {
            var draggedOverContainer;
            var editedComponentNode;

            draggedOverContainer = null;
            editedComponentNode = this._editedComponent.getViewNode();

            for (var i = 0; i < containersGeometry.length; i++) {
                var container = containersGeometry[i];

                if (editedComponentNode != container.htmlNode) {
                    var useWindowWidth = container.logic.isInstanceOfClass('wysiwyg.viewer.components.ScreenWidthContainer') || container.logic.isInstanceOfClass('core.components.Page');
                    if ((useWindowWidth || (x > container.x && x < (container.x + container.width))) &&
                        y > container.y && y < (container.y + container.height)) {
                        var containerLogic = container.logic;
                        if (this._editedComponent.isContainable(containerLogic)) {
                            draggedOverContainer = container;
                        }
                    }
                }
            }
            return draggedOverContainer;
        },

        refreshMultiSelect: function () {
            this.clearMultiSelectDisplay();
            if (this._editedComponent && this._editedComponent.isMultiSelect) {
                var currentSelection = this._editedComponent.getSelectedComps();
                for (var i = 0; i < currentSelection.length; i++) {
                    this._buildMultiSelectionBox(currentSelection[i]);
                }
            }
        },
        _buildMultiSelectionBox: function (compLogic) {
            var pos = this.resources.W.Preview.getNodeGlobalPosition(compLogic.getViewNode());
            var extraPixels = compLogic.getExtraPixels();

            var selectionNode = new Element('div', {state: 'selected'});
            selectionNode.setStyles({
                'left': pos.x - this.getX() + extraPixels.left,
                'top': pos.y - this.getY() + extraPixels.top,
                'width': compLogic.getWidth() + extraPixels.width,
                'height': compLogic.getPhysicalHeight()
            });

            selectionNode.insertInto(this._skinParts.multiSelectLayer);
        },
        clearMultiSelectDisplay: function () {
            this._skinParts.multiSelectLayer.empty();
        },

        highlightEditingFrame: function () {
            //            setTimeout(function(){
            //                this._blink(200,3);
            //            }.bind(this), 1000);
        },

        _updatePositionDisplay: function(){
            var str = "";
            str = str + "X:" + this._editedComponent.getBoundingX() + " ";
            str = str + "Y:" + this._editedComponent.getBoundingY();
            this._skinParts.posSizeIndicator.innerHTML = str;
            this._adjustPosSizeIndicatorPosition();
        },

        _updateSizeDisplay: function(){
            var str = "";
            str = str + "W:" + this._editedComponent.getWidth() + " ";
            str = str + "H:" + this._editedComponent.getHeight();
            this._skinParts.posSizeIndicator.innerHTML = str;
            this._adjustPosSizeIndicatorPosition();
        },

        _adjustPosSizeIndicatorPosition: function(){
            if(this._skinParts.posSizeIndicator.getWidth() > this.getWidth()){
                this._skinParts.posSizeIndicator.style.left = "1px";
                this._skinParts.posSizeIndicator.style.right = "";
            } else {
                this._skinParts.posSizeIndicator.style.right = "1px";
                this._skinParts.posSizeIndicator.style.left = "";
            }
            if (this._editedComponent.getAngle() !== 0){
                this._skinParts.posSizeIndicator.style.top = -21 + this._skinParts.posSizeIndicator.getWidth()/(-2) + 'px';
            } else {
                this._skinParts.posSizeIndicator.style.top = -23 + 'px';
            }
        },

        _blink: function (blinkDuration, numTimes) {
            var counter = 0;
            for (var i = 0; i < numTimes; i++) {
                counter = counter + blinkDuration;
                setTimeout(function () {
                    this.hide();
                }.bind(this), counter);
                counter = counter + blinkDuration;
                setTimeout(function () {
                    this.show();
                }.bind(this), counter);
            }
        },

        _getCompScopeId: function () {
            return this.resources.W.Editor.getSelectedComp().getParentComponent().getComponentId();
        },

        _getComponentFromGlobalCoordinates: function (event) {
            var component;

            if (this._isMultiselectionKeyWasPressed(event) && this._editedComponent) {
                // Get selection scope in multi selection mode
                var scope = this._editedComponent.getViewNode().getParent();
                component = this.resources.W.Preview.componentInScopeFromGlobalCoordinates(event.client.x, event.client.y, this.resources.W.Preview.selectionFilter, scope);
            } else {
                component = this.resources.W.Preview.componentFromGlobalCoordinates(event.client.x, event.client.y, this.resources.W.Preview.selectionFilter);
            }

            return component;
        }
    });


});
