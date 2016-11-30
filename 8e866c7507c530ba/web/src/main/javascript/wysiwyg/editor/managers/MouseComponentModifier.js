define.Class('wysiwyg.editor.managers.MouseComponentModifier', function (classDefinition) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');
    def.binds(['_whileComponentMove', '_endComponentMove', '_resizeMouseMoveHandler', '_resizeMouseUpHandler', '_dragMouseBlurHandler',
        '_getRightResizeResultingChanges', '_getLeftResizeResultingChanges', '_getTopResizeResultingChanges', '_getBottomResizeResultingChanges',
        '_getTopLeftResizeResultingChanges', '_getTopRightResizeResultingChanges',
        '_getBottomLeftResizeResultingChanges', '_getBottomRightResizeResultingChanges', '_onSelectedComponentChange',
        '_rotateMouseMoveHandler','_rotateMouseUpHandler'
    ]);

    def.resources(['W.Editor','W.UndoRedoManager','W.Preview', 'W.Commands', 'W.Config','W.Utils']);

    def.statics({
        SNAP_DISTANCE: 5
    });

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this._editedComponent = undefined;
            this._siteBody = $$("body");
            this._registerCommandListeners();
            var aMarker = this.resources.W.Utils.getQueryParam("align_marker");
            var aBorder = this.resources.W.Utils.getQueryParam("align_border");
            this.ALIGN_MARKER_COLOR = (aMarker === ""? "#ff00ff" : "#" + aMarker);
            this.ALIGNED_BORDER = (aBorder === ""? "#00ffff" : "#" + aBorder);
            this.ALIGNED_MASTER_BORDER = (aBorder === ""? "#ff9900" : "#" + aBorder);
            this._snapDirections = { };
        },
        _getCurrentPageCoordinates: function() {
            var curPage = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().$logic;
            var  curPageCoordinates = this._getEditorComponentCoordinates(curPage);
            curPageCoordinates.x += 1; //fix left by 1 pixel looks better -> the marker is on top of grid line
            return curPageCoordinates;
        },
        _onStartAlingnment: function (snapDirections) {
            this._windowTop = this.resources.W.Editor.getEditorUI().getMainBarHeight();
            this._siteBottom = this.resources.W.Preview.getPreviewManagers().Viewer.getSiteHeight();
            this._windowLeft = this.resources.W.Utils.getWindowSize().width;

            this._curPageCoordinates = this._getCurrentPageCoordinates();
            this.resources.W.Commands.executeCommand("Graphics.Clear");

            this._snapToObjectEnabled = W.Editor.isSnapToObjectEnabled();

            this._snapDirections = snapDirections;

            this._prevDX = 0;
            this._prevDY = 0;
        },
        _onEndAlignment: function () {
            this.resources.W.Commands.executeCommand("Graphics.Clear");
        },
        _isHighSpeed: function (dX, dY) {
            return Math.abs(dX - this._prevDX) > this.SNAP_DISTANCE ||
                Math.abs(dY - this._prevDY) > this.SNAP_DISTANCE;
        },
        _registerCommandListeners: function(){
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SelectedComponentChange", this, this._onSelectedComponentChange);
        },

        _onSelectedComponentChange: function(){
            this.setEditedComponent();
        },

        getEditedComponent: function() {
            return this._editedComponent;
        },

        setEditedComponent: function() {
            this._editedComponent = this.resources.W.Editor.getEditedComponent();
        },

        //---------------------------------------------------------------------------------------
        //----------------------------- resize --------------------------------------------------
        //---------------------------------------------------------------------------------------

        _getResultingChangesFunc: function(resizeType) {
            switch (resizeType) {
                case 'top':
                    return this._getTopResizeResultingChanges;
                case 'topRight':
                    return this._getTopRightResizeResultingChanges;
                case 'right':
                    return this._getRightResizeResultingChanges;
                case 'bottomRight':
                    return this._getBottomRightResizeResultingChanges;
                case 'bottom':
                    return this._getBottomResizeResultingChanges;
                case 'bottomPush':
                    return this._getBottomPushResizeResultingChanges;
                case 'bottomLeft':
                    return this._getBottomLeftResizeResultingChanges;
                case 'left':
                    return this._getLeftResizeResultingChanges;
                case 'topLeft':
                    return this._getTopLeftResizeResultingChanges;
            }
        },

        startResize: function(resizeType, event, snapDirections) {
            if(this._isSelectedComponentLocked()){
                return;
            }
            this._getResultingChanges = this._getResultingChangesFunc(resizeType);

            this.resources.W.UndoRedoManager.startTransaction();

            this.setEditedComponent();

            if(!this._pushResize) {
                this._editedComponent.disableReportLayoutChange();
            }

            var resizeTypesToResetMinHeight = ['top', 'bottomPush', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft'];
            if (resizeTypesToResetMinHeight.contains(resizeType)) {
                this._setComponentMinimumHeightToPhysicalHeight();
            }

            this.resources.W.Preview.getPreviewManagers().Layout.reportResizeStart();

            // Save initial values
            this._editedComponent.saveCurrentDimensions();
            this._resizeMouseStartPoint = {"x": event.page.x, "y": event.page.y};

            this._resizeStartComponentGeometry = {
                "x": this._editedComponent.getX(),
                "y": this._editedComponent.getY(),
                "width": this._editedComponent.getWidth(),
                "height": this._editedComponent.getHeight()
            };

            this._editedComponent.trigger('resizeStart', {'resizeType': resizeType});
            this.resources.W.Preview.getPreviewManagers().Layout.fireEvent('layoutResizeStart', this._resizeStartComponentGeometry);

            //Set event handlers
            this._siteBody.addEvent("mousemove", this._resizeMouseMoveHandler);
            this._siteBody.addEvent("mouseup", this._resizeMouseUpHandler);

            this._saveMouseDownInitState(event);
            this._onStartAlingnment(snapDirections);
        },

        _setComponentMinimumHeightToPhysicalHeight: function () {
            this._editedComponent.setHeight(this._editedComponent.getViewNode().getSize().y - this._editedComponent.getExtraPixels().bottom);
        },


        _resizeMouseMoveHandler: function(e) {
            var mouseDelta = this._calcDeltaFromStartPosition(e),
                isHighSpeed = this._isHighSpeed(mouseDelta.x, mouseDelta.y),
                editedComponentIsRotated = this._editedComponent.getAngle() > 0,
                targetCompCoordinates = this._getResultingChanges(e),
                snapValues = { },
                newPosition = {
                    x: targetCompCoordinates.x || this._editedComponent.getX(),
                    y: targetCompCoordinates.y || this._editedComponent.getY()
                },
                newDimensions = {
                    width: targetCompCoordinates.width || this._editedComponent.getWidth(),
                    height: targetCompCoordinates.height || this._editedComponent.getHeight()
                };

            this._clearMarkers();

            this._updateSvgContainerPositionIfNeeded();

            if(!isHighSpeed && !editedComponentIsRotated) {
                var closestComponentDistance = this._findClosestComponentDistance(e, newPosition, newDimensions);
                snapValues = this._getSnapValues(targetCompCoordinates, closestComponentDistance);
                this._fixCoordinatesAccordingToSnapValuesIfNeeded(targetCompCoordinates, snapValues);
            }

            this._fixCoordinatesAccordingToRatioIfNeeded(targetCompCoordinates, snapValues);

            this._setSelectedCompPositionSize(targetCompCoordinates);

            this._reportComponentResized(targetCompCoordinates);

            if(!editedComponentIsRotated) {
                this._displayMarkers(e, isHighSpeed);
            }

            this._prevDX = mouseDelta.x;
            this._prevDY = mouseDelta.y;
        },

        _reportComponentResized:function(params){
            if (this._editedComponent){
                params.editedComponent = this._editedComponent;
                this.fireEvent('componentResized', params);
            }
        },

        _resizeMouseUpHandler: function() {
            this._pushResize = false;
            this._editedComponent.enableReportLayoutChange();
            this._siteBody.removeEvent("mousemove", this._resizeMouseMoveHandler);
            this._siteBody.removeEvent("mouseup", this._resizeMouseUpHandler);
            this.injects().Preview.getPreviewManagers().Layout.reportResize([this._editedComponent]);
            if (this._editedComponent){
                this._editedComponent.enableReportLayoutChange();
                this._editedComponent.fireEvent("resizeEnd");
                this._editedComponent.trigger('resizeEnd');
                window.fireEvent("resizeEnd");
                this.fireEvent("resizeEnd");
            }

            this.resources.W.Preview.getPreviewManagers().Layout.fireEvent('layoutResizeStop');

            if (!this.injects().Editor.arePageCompsDraggableToFooter()) {
                this.injects().Editor.onComponentChanged(true, this._editedComponent);
            }

            this._onEndAlignment();

            this.resources.W.UndoRedoManager.endTransaction();
        },

        /**
         * initiate the angle calculations of mouse movement.
         */
        startRotate: function(){
            this.resources.W.UndoRedoManager.startTransaction();

            this.setEditedComponent();
            this._editedComponent.disableReportLayoutChange();
            this._setHorizontalCompAngle();
            this._setRotationCenter();

            this._siteBody.addEvent("mousemove", this._rotateMouseMoveHandler);
            this._siteBody.addEvent("mouseup", this._rotateMouseUpHandler);

            this.resources.W.Preview.getPreviewManagers().Layout.reportRotateStart();
        },

        /**
         * Calculates the angle from component center to top-right corner, when component is horizontal.
         * @private
         */
        _setHorizontalCompAngle: function(){
            var componentWidth = this._editedComponent.getWidth(),
                componentHeight = this._editedComponent.getPhysicalHeight(),
                tanAngle = componentHeight / componentWidth,
                angle = this.resources.W.Utils.Math.radiansToDegrees(Math.atan(tanAngle));
            this._horizontalCompAngle = angle;
        },

        _setRotationCenter: function(){
            var componentGlobalPos = this.resources.W.Preview.getGlobalRefNodePositionInEditor(this._editedComponent),
                width =  this._editedComponent.getBoundingWidth(),
                height = this._editedComponent.getBoundingHeight();
            this._rotatingCenter = {
                x: componentGlobalPos.x + 0.5 * width,
                y: componentGlobalPos.y + 0.5 * height
            };
        },

        _rotateMouseMoveHandler: function(event){
            this._currentRotationAngle = this._getCurrentRotationAngle(event);
            this._setComponentRotationAngle(event.shift);
        },

        _getCurrentRotationAngle: function(moveEvent){
            var deltaY = -1*(moveEvent.page.y - this._rotatingCenter.y),
                deltaX = moveEvent.page.x - this._rotatingCenter.x;

            var angle = this.resources.W.Utils.Math.radiansToDegrees(Math.atan2(deltaY, deltaX));
            return  this._horizontalCompAngle - angle;
        },

        _setComponentRotationAngle:function(useRotationSteps){
            var params = {};
            if (this._editedComponent){
                params.rotationAngle = useRotationSteps ? this._snapAngleToRotationSteps(this._currentRotationAngle) : this._snapAngleToMainDirection(this._currentRotationAngle);
                params.editedComponent = this._editedComponent;
                this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompRotationAngle", params);
                this.fireEvent('componentRotated', params);
            }
        },

        _snapAngleToMainDirection: function(angle){
            var intAngle = parseInt(angle, 10);
            if (intAngle < 0){
                intAngle += 360;
            }

            //snap to main angles
            var angleFromMainDirection = intAngle % 90;
            if (angleFromMainDirection <= 3) {
                intAngle -= angleFromMainDirection;
            } else if ((angleFromMainDirection) >= 87){
                intAngle += (90 - (angleFromMainDirection));
            }

            return intAngle;
        },

        _snapAngleToRotationSteps: function(angle){
            var intAngle = parseInt(angle, 10);
            if (intAngle < 0){
                intAngle += 360;
            }
            //snap to rotation steps of 15 degrees
            intAngle = 15 * Math.floor((intAngle + 7.5) / 15);
            return intAngle;
        },


        _rotateMouseUpHandler: function(event){
            this._siteBody.removeEvent("mousemove", this._rotateMouseMoveHandler);
            this._siteBody.removeEvent("mouseup", this._rotateMouseUpHandler);
            this.injects().Preview.getPreviewManagers().Layout.reportRotate(this._editedComponent);
            this._editedComponent.enableReportLayoutChange();
            if (this._editedComponent){
                this._editedComponent.fireEvent("rotateEnd");
                this.fireEvent("rotateEnd");
            }

            if (!this.injects().Editor.arePageCompsDraggableToFooter()) {
                this.injects().Editor.onComponentChanged(true, this._editedComponent);
            }

            this.resources.W.UndoRedoManager.endTransaction();
            this._editedComponent._unlockSafe();
        },

        _getRightResizeResultingChanges: function(event) {
            var absoluteDX = event.page.x - this._resizeMouseStartPoint.x;
            var absoluteDY = this._resizeMouseStartPoint.y - event.page.y;
            var angleInRadians = this.resources.W.Utils.Math.degreesToRadians(this._editedComponent.getAngle());

            var deltaWidth = parseInt(absoluteDX * Math.cos(angleInRadians) - absoluteDY * Math.sin(angleInRadians),10);
            var newWidth = this.resources.W.Editor.roundToGrid(this._resizeStartComponentGeometry.width + deltaWidth, event.control);

            var changes = {
                width: newWidth
            };
            this._applyWidthSizeLimits(changes);
            return changes;
        },

        _getLeftResizeResultingChanges: function(event) {
            //positive iff we enlarge the box:
            var absoluteDX = this._resizeMouseStartPoint.x - event.page.x;
            var absoluteDY = this._resizeMouseStartPoint.y - event.page.y;
            var angleInRadians = this.resources.W.Utils.Math.degreesToRadians(this._editedComponent.getAngle());

            var deltaWidth = parseInt(absoluteDX * Math.cos(angleInRadians) + absoluteDY * Math.sin(angleInRadians),10);
            var newX = this.resources.W.Editor.roundToGrid(this._resizeStartComponentGeometry.x - deltaWidth, event.control);
            var dxAfterRounding = this._resizeStartComponentGeometry.x - newX;
            var newWidth = this._resizeStartComponentGeometry.width + dxAfterRounding;

            var changes = {
                x: newX,
                width: newWidth
            };
            this._applyWidthSizeLimits(changes);
            return changes;
        },

        _getTopResizeResultingChanges: function(event) {
            var absoluteDY = this._resizeMouseStartPoint.y - event.page.y,
                absoluteDX = this._resizeMouseStartPoint.x - event.page.x,
                angleInRadians = this.resources.W.Utils.Math.degreesToRadians(this._editedComponent.getAngle());

            var deltaHeight = parseInt(absoluteDY*Math.cos(angleInRadians) - absoluteDX*Math.sin(angleInRadians),10);
            var newY = this.resources.W.Editor.roundToGrid(this._resizeStartComponentGeometry.y - deltaHeight, event.control);
            var dyAfterRounding = this._resizeStartComponentGeometry.y - newY;
            var newHeight = this._resizeStartComponentGeometry.height + dyAfterRounding + this._editedComponent.getExtraPixels().height;

            var changes = {
                y:newY,
                height:newHeight
            };
            this._applyHeightSizeLimits(changes);
            return changes;
        },

        _getBottomPushResizeResultingChanges: function(event) {
            this._pushResize = true;
            return this._getBottomResizeResultingChanges(event);
        },

        _getBottomResizeResultingChanges: function(event) {
            var absoluteDY = event.page.y - this._resizeMouseStartPoint.y,
                absoluteDX = this._resizeMouseStartPoint.x - event.page.x,
                angleInRadians = this.resources.W.Utils.Math.degreesToRadians(this._editedComponent.getAngle());

            var deltaHeight = parseInt(absoluteDY * Math.cos(angleInRadians) + absoluteDX*Math.sin(angleInRadians),10);
            var newHeight = this.resources.W.Editor.roundToGrid(this._resizeStartComponentGeometry.height + deltaHeight, event.control);

            var changes = {
                height: newHeight,
                enforceAnchors:this._getEnforceAnchors(event),
                context:this
            };
            this._applyHeightSizeLimits(changes);
            return changes;
        },

        _getEnforceAnchors:function(e) {
            return this._pushResize || e.control || this._editedComponent.useLayoutOnResize();
        },

        _getTopRightResizeResultingChanges: function(event) {
            var topResizeChange = this._getTopResizeResultingChanges(event);
            var rightResizeChange = this._getRightResizeResultingChanges(event);
            return Object.merge(topResizeChange, rightResizeChange);
        },

        _getTopLeftResizeResultingChanges: function(event) {
            var topResizeChange = this._getTopResizeResultingChanges(event);
            var leftResizeChange = this._getLeftResizeResultingChanges(event);
            return Object.merge(topResizeChange, leftResizeChange);
        },

        _getBottomRightResizeResultingChanges: function(event) {
            var bottomResizeChange = this._getBottomResizeResultingChanges(event);
            var rightResizeChange = this._getRightResizeResultingChanges(event);
            return Object.merge(bottomResizeChange, rightResizeChange);
        },

        _getBottomLeftResizeResultingChanges: function(event) {
            var bottomResizeChange = this._getBottomResizeResultingChanges(event);
            var leftResizeChange = this._getLeftResizeResultingChanges(event);
            return Object.merge(bottomResizeChange, leftResizeChange);
        },

        //---------------------------------------------------------------------------------------
        //----------------------------- drag ----------------------------------------------------
        //---------------------------------------------------------------------------------------

        startComponentMove: function(event, verticalMovementAndInteractWithOtherComponents) {

            this.resources.W.UndoRedoManager.startTransaction();

            //bugfix: when resizing, mouse up outside the window, and then moving a page,
            //it doesn't remove the resizing mousemove and mouseup events, so it moves the page.
            //in order to avoid that, for safely reasons, we remove those event anyway.
            this._siteBody.removeEvent("mousemove", this._resizeMouseMoveHandler);
            this._siteBody.removeEvent("mouseup", this._resizeMouseUpHandler);

            this.setEditedComponent();

            this._saveMouseDownInitState(event);

            this._verticalMovementAndInteractWithOtherComponents = verticalMovementAndInteractWithOtherComponents;

            if (!this._verticalMovementAndInteractWithOtherComponents) {
                this._editedComponent.disableReportLayoutChange();
            }

            this._siteBody.addEvent("mousemove", this._whileComponentMove);
            this._siteBody.addEvent("mouseup", this._endComponentMove);
            window.addEvent(Constants.CoreEvents.BLUR, this._dragMouseBlurHandler);

            var snapDirections = {
                top: true,
                right: true,
                bottom: true,
                left: true,
                center_x: true,
                center_y: true
            };

            this._onStartAlingnment(snapDirections);
        },

        _saveMouseDownInitState: function(event) {
            this._mouseStartPoint = {"x": event.page.x, "y": event.page.y};
            this._compStartPoint = {"x":this._editedComponent.getX(),"y":this._editedComponent.getY()};
            //allows us to start dragging only when the user moved his mouse more then 5 pixels
            this._dragThresholdReached = false;
            this._minY = this._editedComponent.getMinDragY();

            var pageNode = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            this._previewOffset = this.resources.W.Preview.getPreviewPosition().y;
            this._pageBottomAbs = pageNode.getPosition().y + pageNode.getLogic().getHeight() + this._previewOffset;
        },

        _whileComponentMove: function(e) {
            if(this._isSelectedComponentLocked()){
                return;
            }

            this._clearMarkers();

            this._updateSvgContainerPositionIfNeeded();

            var mouseDelta = this._calcDeltaFromStartPosition(e);
            var isHighSpeed = this._isHighSpeed(mouseDelta.x, mouseDelta.y);

            this._dragThresholdReached = this._dragThresholdReached || Math.abs(mouseDelta.x)>5 ||Math.abs(mouseDelta.y)>5;

            if(!this._dragThresholdReached) {
                return;
            }

            var params = {
                editedComponent: this._editedComponent,
                event: e,
                isMoveThresholdReached: this._dragThresholdReached
            };

            if (e.shift){
                if (Math.abs(mouseDelta.x) > Math.abs(mouseDelta.y)){
                    mouseDelta.y = 0;
                } else {
                    mouseDelta.x = 0;
                }
            }

            var newPosition = {
                x: this._compStartPoint.x + mouseDelta.x,
                y: this._compStartPoint.y + mouseDelta.y
            };

            if (!isHighSpeed && !this._verticalMovementAndInteractWithOtherComponents) {
                var closestComponentDistance = this._findClosestComponentDistance(e, newPosition);
                var snapValues = this._getSnapValues(newPosition, closestComponentDistance);
                this._fixCoordinatesAccordingToSnapValuesIfNeeded(newPosition, snapValues);
            }

            if(this._verticalMovementAndInteractWithOtherComponents) {
                params.y = Math.max(newPosition.y,this._minY);
                params.enforceAnchors = true;
            } else {
                params.x = newPosition.x;
                params.y = newPosition.y;
            }

            this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", params);

            this.fireEvent('componentMoved', params);

            this._displayMarkers(e, isHighSpeed);

            this._setPreviousDelta(mouseDelta.x, mouseDelta.y);
        },

        _isSelectedComponentLocked:function(){
            var compEditBox = W.Editor.getComponentEditBox();
            if(compEditBox && compEditBox.isComponentLocked()){
                return true;
            }
            return false;
        },

        _endComponentMove: function(event) {
            this._siteBody.removeEvent("mousemove", this._whileComponentMove);
            this._siteBody.removeEvent("mouseup", this._endComponentMove);
            window.removeEvent(Constants.CoreEvents.BLUR, this._dragMouseBlurHandler);

            var params = {
                event: event,
                isMoveThresholdReached: this._dragThresholdReached
            };

            if(this._isSelectedComponentLocked()){
                W.Editor.getComponentEditBox().reopenPanelForNonDragClick(params);
                return;
            }

            this._editedComponent.enableReportLayoutChange();

            var curMouseYWithScroll =  event.client.y + window.getScroll().y;

            //we need to update _pageBottomAbs, since the page might been pushed by the dragged component:
            var pageNode = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            this._pageBottomAbs = pageNode.getPosition().y + pageNode.getLogic().getHeight() + this._topBarHeight;

            var editedComponentIsBelowPage = (curMouseYWithScroll > this._pageBottomAbs);
            this._editedComponent.setShowOnAllPagesChangeability(!editedComponentIsBelowPage);

            if ( this.resources.W.Config.env.isViewingDesktopDevice() && editedComponentIsBelowPage && this.injects().Editor.getComponentScope(this._editedComponent) === this.injects().Editor.EDIT_MODE.CURRENT_PAGE) {
                //the passed argument is made for compatibility with FPP
                this.resources.W.Editor.moveCurrentComponentToOtherScope(this.isPropertyPanelVisible(), event);
            }

            //TODO
            //reportMove, onComponentChanged and  endTransaction were moved to ComponentEditBox._onComponentMoveEnd, since it must be reported after possible scope change was made
            //--> the coordinates changes need to be relative of the new container
            //--> onComponentChange should be made after the reportChange
            //--> scope change should be recorded as well
            // should be changed back, when the scope change, will be handled in a place which is not CEB

//            if (this._editedComponent.getX() != this._compStartPoint.x || this._editedComponent.getY() != this._compStartPoint.y) {
//                this.resources.W.Preview.getPreviewManagers().Layout.reportMove(this.resources.W.Editor.getArrayOfSelectedComponents());
//            }

//            if (!this.resources.W.Editor.arePageCompsDraggableToFooter()) {
//                this.resources.W.Editor.onComponentChanged(true, this._editedComponent);
//            }

//            this.resources.W.UndoRedoManager.endTransaction();
            //end of TODO

            this.fireEvent('componentMoveEnd', params);
            this._onEndAlignment();
        },

        _getCompScopeId: function() {
//            return W.Editor.getSelectedComp().getParentComponent().getComponentId();
            return this._editedComponent.getParentComponent().getComponentId();
        },

        isPropertyPanelVisible: function() {
            var propertyPanel = this.injects().Editor.getPropertyPanel();
            return (propertyPanel && propertyPanel.isEnabled());
        },


        /**
         * The blur handler unregisters the mouse handlers, since no mouseup event will be
         * dispatched to release the editor from drag mode.
         */
        _dragMouseBlurHandler: function() {
            window.removeEvent(Constants.CoreEvents.BLUR, this._dragMouseBlurHandler);
            this._siteBody.removeEvent(Constants.CoreEvents.MOUSE_MOVE, this._whileComponentMove);
            this._siteBody.removeEvent(Constants.CoreEvents.MOUSE_UP, this._endComponentMove);
//            this._siteBody.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._dragMouseOutHandler);
        },

        //---------------------------------------------------------------------------------------
        //----------------------------- change scope --------------------------------------------
        //---------------------------------------------------------------------------------------

        addComponentToContainer: function (container, originalContainer, componentPosition, isSOAPChange) {
            var containerLogic = container.getLogic();
            var draggedComps = this.resources.W.Editor.getArrayOfSelectedComponents();

            var containerPosition = this.resources.W.Preview.getGlobalRefNodePositionInEditor(containerLogic);
            componentPosition = componentPosition || this.resources.W.Preview.getGlobalRefNodePositionInEditor(this._editedComponent);

            var oldContainerChildren = draggedComps[0].getParentComponent().getChildComponents();
            var oldContainerComponents = _.chain(oldContainerChildren).map(function (component) {
                return component.$logic;
            }).compact().value();

            var i, editedCompItem;
            for (i = 0; i < draggedComps.length; ++i) {
                editedCompItem = draggedComps[i];
                containerLogic.addChild(editedCompItem);
            }
            this.resources.W.Preview.getPreviewManagers().Layout.reportReparent(draggedComps, originalContainer, oldContainerComponents, isSOAPChange);

            var boundingSizes = {
                x: componentPosition.x - containerPosition.x,
                y: componentPosition.y - containerPosition.y
            };
            var params = {
                x: this._editedComponent.getX() + (boundingSizes.x - this._editedComponent.getBoundingX()),
                y: this._editedComponent.getY() + (boundingSizes.y - this._editedComponent.getBoundingY())
            };
            this._setSelectedCompPositionSize(params);
        },

        // will be overridden
        _fixCoordinatesAccordingToRatioIfNeeded: function(targetCompCoordinates, snapValues) {

        },

        _setSelectedCompPositionSize:function(params){
            params.changeComponentScope = true;
            this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", params);
        },

        _applyWidthSizeLimits: function (changes) {
            var sizeLimits = this._editedComponent.getSizeLimits();
            var updatedValue;
            var delta = 0;
            if (!_.isUndefined(changes.width)){
                updatedValue = this.resources.W.Utils.Math._enforceMinMax(changes.width, sizeLimits.minW, sizeLimits.maxW);
                delta = updatedValue - changes.width;
                if (!_.isUndefined(changes.x)){
                    changes.x -= delta;
                }
                changes.width = updatedValue;
            }
        },


        _applyHeightSizeLimits: function(changes){
            var sizeLimits = this._editedComponent.getSizeLimits();
            var updatedValue;
            var delta = 0;
            if (changes.height){
                updatedValue = this.resources.W.Utils.Math._enforceMinMax(changes.height, sizeLimits.minH, sizeLimits.maxH);
                delta = changes.height - updatedValue;
                if (changes.y){
                    changes.y += delta;
                }
                changes.height = updatedValue;
            }
        },
        _minAbsolute: function(array) {
            return _.min(array, function(value) {return Math.abs(value);});
        },
        _getEditedCompCoordinates: function (newPosition, dimensions) {
            var editedComp = this._editedComponent;

            var boundedNewPosition = {
                y: newPosition.y,
                x: newPosition.x
            };

            if (editedComp.getAngle() > 0) {
                boundedNewPosition.y = this.resources.W.Utils.Layout.getBoundingY(newPosition.y, editedComp.getHeight(), editedComp.getBoundingHeight());
                boundedNewPosition.x =  this.resources.W.Utils.Layout.getBoundingX(newPosition.x, editedComp.getWidth(), editedComp.getBoundingWidth());
            }
            return this._calcEditorCoordinates(editedComp, boundedNewPosition, dimensions);
        },
        _calcVerticalVirtualCoordinates: function (verticalGuideY) {
            var editorVerticalGuideY = verticalGuideY + this._windowTop - window.getScroll().y + 1;
            var verticalVirtualCoordinates = {
                y: editorVerticalGuideY,
                bottom: editorVerticalGuideY,
                center_y: editorVerticalGuideY
            };
            return verticalVirtualCoordinates;
        },
        _drawMarkers: function (markers2Draw, compCoordinates, svg, borderColor) {
            if (markers2Draw.length > 0) {
                this.resources.W.Commands.executeCommand("Graphics.HighlightComponent", {
                    component: compCoordinates.comp,
                    styles: {
                        borderColor: borderColor
                    }
                });
                _.forEach(markers2Draw, function (linePoint) {
                    this._drawSvgSolidLine({x: linePoint.from.x, y: linePoint.from.y}, { x: linePoint.to.x, y: linePoint.to.y}, svg, this.ALIGN_MARKER_COLOR);
                }, this);
            }
        },
        _alignToComp: function (editedCoordinates, compCoordinates, svg, borderColor) {
            var minX = this._getMinX(editedCoordinates, compCoordinates);
            var maxX = this._getMaxX(editedCoordinates, compCoordinates);
            var minY = this._getMinY(editedCoordinates, compCoordinates);
            var maxY = this._getMaxY(editedCoordinates, compCoordinates);

            var markers2Draw = [];

            //center
            if ((this._snapDirections.center_y && editedCoordinates.center_y === compCoordinates.center_y) || (this._snapDirections.center_x && editedCoordinates.center_x === compCoordinates.center_x)) {
                if (this._snapDirections.center_y && editedCoordinates.center_y === compCoordinates.center_y) {
                    markers2Draw.push({ from: {x: minX, y: editedCoordinates.center_y}, to: { x: maxX, y: compCoordinates.center_y }});
                }

                if (this._snapDirections.center_x && editedCoordinates.center_x === compCoordinates.center_x) {
                    markers2Draw.push({ from: {x: editedCoordinates.center_x, y: minY}, to: { x: compCoordinates.center_x, y: maxY }});
                }
            } else {
                //top
                if (this._snapDirections.top && this._isVerticalAligned(editedCoordinates.y, compCoordinates)) {
                    markers2Draw.push({ from: {x: minX, y: editedCoordinates.y}, to: { x: maxX, y: editedCoordinates.y }});
                }

                //bottom
                if (this._snapDirections.bottom && this._isVerticalAligned(editedCoordinates.bottom, compCoordinates)) {
                    markers2Draw.push({ from: {x: minX, y: editedCoordinates.bottom}, to: { x: maxX, y: editedCoordinates.bottom }});
                }

                //left
                if (this._snapDirections.left && this._isHorizontalAligned(editedCoordinates.x, compCoordinates)) {
                    markers2Draw.push({ from: {x: editedCoordinates.x, y: minY}, to: { x: editedCoordinates.x, y: maxY }});
                }

                //right
                if (this._snapDirections.right && this._isHorizontalAligned(editedCoordinates.right, compCoordinates)) {
                    markers2Draw.push({ from: {x: editedCoordinates.right, y: minY}, to: { x: editedCoordinates.right, y: maxY }});
                }
            }
            this._drawMarkers(markers2Draw, compCoordinates, svg, borderColor);
        },
        _calcHorizontalMarkers: function (editedCoordinates, compCoordinates) {
            var x_markers2Draw = [];

            //center
            if (editedCoordinates.center_x === compCoordinates.center_x) {
                x_markers2Draw.push(editedCoordinates.center_x);
            } else {
                //left
                if (this._isHorizontalAligned(editedCoordinates.x, compCoordinates)) {
                    x_markers2Draw.push(editedCoordinates.x);
                }

                //right
                if (this._isHorizontalAligned(editedCoordinates.right, compCoordinates)) {
                    x_markers2Draw.push(editedCoordinates.right);
                }
            }

            return x_markers2Draw;
        },
        _calcVerticalMarkers: function (editedCoordinates, compCoordinates) {
            var y_markers2Draw = [];

            //center
            if (editedCoordinates.center_y === compCoordinates.center_y) {
                y_markers2Draw.push(editedCoordinates.center_y);
            } else {
                //left
                if (this._isVerticalAligned(editedCoordinates.y, compCoordinates)) {
                    y_markers2Draw.push(editedCoordinates.y);
                }

                //right
                if (this._isVerticalAligned(editedCoordinates.bottom, compCoordinates)) {
                    y_markers2Draw.push(editedCoordinates.bottom);
                }
            }

            return y_markers2Draw;
        },
        _drawHorizontalMarkers: function (horizontalMarkers2Draw, svg) {
            if (horizontalMarkers2Draw.length > 0) {
                _.forEach(horizontalMarkers2Draw, function (horizontalMarker2Draw) {
                    this._drawSvgSolidLine({x: horizontalMarker2Draw, y: 0}, { x: horizontalMarker2Draw, y: this._siteBottom + this._windowTop}, svg, this.ALIGN_MARKER_COLOR, true);
                }, this);
            }
        },

        _drawVerticalMarkers: function (verticalMarkers2Draw, svg) {
            if (verticalMarkers2Draw.length > 0) {
                _.forEach(verticalMarkers2Draw, function (verticalMarker2Draw) {
                    this._drawSvgSolidLine({x: 0, y: verticalMarker2Draw}, { x: this._windowLeft, y: verticalMarker2Draw}, svg, this.ALIGN_MARKER_COLOR);
                }, this);
            }
        },
        _alignToCurrentPage: function(editedCoordinates, svg) {
            var x_markers2Draw = this._calcHorizontalMarkers(editedCoordinates, this._curPageCoordinates);
            this._drawHorizontalMarkers(x_markers2Draw, svg);
            var y_markers2Draw = this._calcVerticalMarkers(editedCoordinates, this._curPageCoordinates);
            this._drawVerticalMarkers(y_markers2Draw, svg);
        },
        _calcHorizontalVirtualCoordinates: function (horizontalGuideX, horizontalLeft) {
            var editorHorizontalGuideX = horizontalGuideX + horizontalLeft;

            var horizontalVirtualCoordinates = {
                x: editorHorizontalGuideX,
                right: editorHorizontalGuideX,
                center_x: editorHorizontalGuideX
            };
            return horizontalVirtualCoordinates;
        },

        _alignToGuides: function(editedCoordinates, svg) {
            var horizontalMarkers2Draw = [];
            var verticalMarkers2Draw = [];

            var rulerGuides = this.resources.W.Editor.getEditorUI().getRulerGuides();

            _.forEach(rulerGuides.horizontal, function(horizontalGuideX) {
                var horizontalVirtualCoordinates = this._calcHorizontalVirtualCoordinates(horizontalGuideX, rulerGuides.horizontalLeft);
                horizontalMarkers2Draw = horizontalMarkers2Draw.concat(this._calcHorizontalMarkers(editedCoordinates, horizontalVirtualCoordinates));
            }, this);

            _.forEach(rulerGuides.vertical, function(verticalGuideY) {
                var verticalVirtualCoordinates = this._calcVerticalVirtualCoordinates(verticalGuideY);
                verticalMarkers2Draw = verticalMarkers2Draw.concat(this._calcVerticalMarkers(editedCoordinates, verticalVirtualCoordinates));
            }, this);


            this._drawHorizontalMarkers(horizontalMarkers2Draw, svg);
            this._drawVerticalMarkers(verticalMarkers2Draw, svg);
        },
        _alignToCurrentPageComponents: function (editedCoordinates, svg) {
            _(this._calcVisiblePageComponentsCoordinates()).forEach(function (compCoordinates) {
                this._alignToComp(editedCoordinates, compCoordinates, svg, this.ALIGNED_BORDER);
            }.bind(this));
        },
        _alignToMasterPageComponents: function (editedCoordinates, svg) {
            _(this._calcVisibleMasterPageComponentsCoordinates()).forEach(function (compCoordinates) {
                this._alignToComp(editedCoordinates, compCoordinates, svg, this.ALIGNED_MASTER_BORDER);
            }.bind(this));
        },

        _drawEditedComponentBorder: function(compCoordiantes, borderColor) {
            var componentBorderCoordinates = _.clone(compCoordiantes);
            componentBorderCoordinates.y = componentBorderCoordinates.y + this._lastScroll; //perform yFix to scroll
            this.resources.W.Commands.executeCommand("WEditorCommands.DrawComponentBorder", {compCoordiantes : componentBorderCoordinates, borderColor: borderColor});
        },

        _displayMarkers: function (e, isHighSpeed) {
            if (this._verticalMovementAndInteractWithOtherComponents) { //when drag handle is used do not snapto or align
                return;
            }

            var editedComp = this._editedComponent;
            var editedCoordinates = this._getEditorComponentCoordinates(editedComp);
            this._drawEditedComponentBorder(editedCoordinates, this._getEditedComponentBorderColor());

            if (this._snapToObjectEnabled && !e.control && !isHighSpeed) {
                this._alignToCurrentPageComponents(editedCoordinates);
                this._alignToMasterPageComponents(editedCoordinates);
                this._alignToCurrentPage(editedCoordinates);
                this._alignToGuides(editedCoordinates);
            }
        },
        _getMinX: function(compCoordinates1, compCoordinates2) {
            return _.min([compCoordinates1.x, compCoordinates1.right, compCoordinates2.x, compCoordinates2.right]);
        },
        _getMinY: function(compCoordinates1, compCoordinates2) {
            return _.min([compCoordinates1.y, compCoordinates1.bottom, compCoordinates2.y, compCoordinates2.bottom]);
        },
        _getMaxX: function(compCoordinates1, compCoordinates2) {
            return _.max([compCoordinates1.x, compCoordinates1.right, compCoordinates2.x, compCoordinates2.right]);
        },
        _getMaxY: function(compCoordinates1, compCoordinates2) {
            return _.max([compCoordinates1.y, compCoordinates1.bottom, compCoordinates2.y, compCoordinates2.bottom]);
        },
        _isVisibleComp: function (comp) {
            return this.resources.W.Editor.isComponentVisibleInViewport(comp);
        },
        _calcAllVisibleComponentsCoordinates: function() {
            var pageComponents = this._calcVisiblePageComponentsCoordinates();
            var masterPageComponents = this._calcVisibleMasterPageComponentsCoordinates();
            return pageComponents.concat(masterPageComponents);
        },
        _calcVisiblePageComponentsCoordinates: function() {
            var pageComponents = this.resources.W.Preview.getPageComponents(W.Preview.getPreviewManagers().Viewer.getCurrentPageId(),W.Config.env.$viewingDevice);
            return this._calcVisibleComponentsCoordinates(pageComponents);
        },
        _calcVisibleMasterPageComponentsCoordinates: function() {
            var masterPageComponents = this.resources.W.Preview.getMasterComponents();
            return this._calcVisibleComponentsCoordinates(masterPageComponents);
        },
        _calcVisibleComponentsCoordinates: function(components) {
            var editedComp = this._editedComponent;
            var filtered = _.filter(components, function(comp) {
                return  comp.className != "wysiwyg.viewer.components.HeaderContainer" &&
                    comp.className != "wysiwyg.viewer.components.FooterContainer" &&
                    comp.className != "wysiwyg.viewer.components.ScreenWidthContainer" &&
                    comp.className != "wysiwyg.viewer.components.PageGroup" &&
                    comp.className != "wysiwyg.viewer.components.PagesContainer" &&
                    this._isVisibleComp(comp) &&
                    !this._isChildOf(editedComp, comp) &&
                    !this._isContained(editedComp, comp);
            }.bind(this));

            return _.map(filtered, this._getEditorComponentCoordinates.bind(this));
        },
        _isChildOf: function(parentComp, comp) {
            var tmpComp = comp;
            while (tmpComp != null) {
                if (parentComp === tmpComp) {
                    return true;
                }

                tmpComp = tmpComp.getParentComponent();
            }
        },
        _isContained: function(parentComp, comp) {
            return (parentComp.$class.name === "MultiSelectProxy") && _.contains(parentComp.getSelectedComps(), comp);
        },
        _updateSvgContainerPositionIfNeeded: function() {
            var currentScroll = window.getScroll().y;
            if (this._lastScroll != currentScroll) {
                this._lastScroll = currentScroll;
            }
        },
        _previewToEditor: function (comp, position) {
            var coordinates = {
                x: position.x,
                y: position.y
            };

            var offset = {x: 0, y: 0};
            if (!(typeof comp.shouldBeFixedPosition === 'function' && comp.shouldBeFixedPosition())) {
                offset = comp.getViewNode().getParent().getPosition();
            }

            coordinates.x += offset.x - window.getScroll().x;
            coordinates.y += offset.y - window.getScroll().y;

            this.resources.W.Preview.previewToEditorCoordinates(coordinates);

            return coordinates;
        },
        _calcEditorCoordinates: function(comp, position, dimensions) {
            return this.resources.W.Editor.calcEditorCoordinates(comp, position, dimensions);
        },
        _getEditorComponentCoordinates: function(comp) {
            return this.resources.W.Editor.calcEditorCoordinates(comp);
        },
        _clearMarkers: function() {
            this.resources.W.Commands.executeCommand("Graphics.Clear");
        },
        _isVerticalAligned: function (y, otherCoordinates) {
            return y === otherCoordinates.y || y === otherCoordinates.bottom;
        },
        _isHorizontalAligned: function (x, otherCoordinates) {
            return x === otherCoordinates.x || x === otherCoordinates.right;
        },
        _drawSvgSolidLine: function (point1, point2, svg, color, isAbsoluteY) {
            this.resources.W.Commands.executeCommand("Graphics.DrawLine", {
                point1: point1,
                point2: point2,
                color: color,
                isAbsoluteY: isAbsoluteY
            });
        },
        _getEditedComponentBorderColor: function() {
            var isEditBoxInMasterPageState = (W.Editor.getComponentEditBox().getState().indexOf("masterPage") > 0);
            return isEditBoxInMasterPageState ? this.ALIGNED_MASTER_BORDER : this.ALIGNED_BORDER;
        },



        _calcDeltaFromStartPosition: function(event) {
            return {
                x: event.page.x - this._mouseStartPoint.x,
                y: event.page.y - this._mouseStartPoint.y
            };
        },
        _setPreviousDelta: function(dX, dY) {
            this._prevDX = dX;
            this._prevDY = dY;
        },
        _findClosestComponentDistance: function(e, position, dimensions) {
            if (!this._snapToObjectEnabled || e.control) {
                return position;
            }

            var editedCoordinates = this._getEditedCompCoordinates(position, dimensions),
                minDistance = { x: Infinity, y: Infinity },
                allVisibleComponentsCoordinates = this._calcAllVisibleComponentsCoordinates(),
                rulerGuides = this.resources.W.Editor.getEditorUI().getRulerGuides();

            // Calc distance from visible components
            _.forEach(allVisibleComponentsCoordinates, function(compCoordinates) {
                minDistance.x = this._calcMinDistanceFromComponentOnXAxis(editedCoordinates, compCoordinates, minDistance);
                minDistance.y = this._calcMinDistanceFromComponentOnYAxis(editedCoordinates, compCoordinates, minDistance);
            }, this);

            // Calc distance from page - only X axis
            minDistance.x = this._calcMinDistanceFromComponentOnXAxis(editedCoordinates, this._curPageCoordinates, minDistance);
            minDistance.y = this._calcMinDistanceFromComponentOnYAxis(editedCoordinates, this._curPageCoordinates, minDistance);

            // Calc distance from horizontal ruler guides
            _.forEach(rulerGuides.horizontal, function(horizontalGuideX) {
                var horizontalVirtualCoordinates = this._calcHorizontalVirtualCoordinates(horizontalGuideX, rulerGuides.horizontalLeft);
                minDistance.x = this._calcMinDistanceFromComponentOnXAxis(editedCoordinates, horizontalVirtualCoordinates, minDistance);
            }, this);

            // Calc distance from vertical ruler guides
            _.forEach(rulerGuides.vertical, function(verticalGuideY) {
                var verticalVirtualCoordinates = this._calcVerticalVirtualCoordinates(verticalGuideY);
                minDistance.y = this._calcMinDistanceFromComponentOnYAxis(editedCoordinates, verticalVirtualCoordinates, minDistance);
            }, this);

            return minDistance;
        },

        _calcMinDistanceFromComponentOnYAxis: function(editedCoordinates, compCoordinates, currMinDistance) {
            var yDistancesArr = [ currMinDistance.y ];

            if(this._snapDirections.top) {
                yDistancesArr.push(compCoordinates.y - editedCoordinates.y);
                yDistancesArr.push(compCoordinates.bottom - editedCoordinates.y);
            }

            if(this._snapDirections.bottom) {
                yDistancesArr.push(compCoordinates.y - editedCoordinates.bottom);
                yDistancesArr.push(compCoordinates.bottom - editedCoordinates.bottom);
            }

            if(this._snapDirections.center_y) {
                yDistancesArr.push(compCoordinates.center_y - editedCoordinates.center_y);
            }

            return this._minAbsolute(yDistancesArr);
        },

        _calcMinDistanceFromComponentOnXAxis: function(editedCoordinates, compCoordinates, currMinDistance) {
            var xDistancesArr = [ currMinDistance.x ];

            if(this._snapDirections.left) {
                xDistancesArr.push(compCoordinates.x - editedCoordinates.x);
                xDistancesArr.push(compCoordinates.right - editedCoordinates.x);
            }

            if(this._snapDirections.right) {
                xDistancesArr.push(compCoordinates.right - editedCoordinates.right);
                xDistancesArr.push(compCoordinates.x - editedCoordinates.right);
            }

            if(this._snapDirections.center_x) {
                xDistancesArr.push(compCoordinates.center_x - editedCoordinates.center_x);
            }

            return this._minAbsolute(xDistancesArr);
        },

        _getSnapValues: function(targetCompCoordinates, closestComponentDistance) {
            var snapValues = { };

            if (Math.abs(closestComponentDistance.y) < this.SNAP_DISTANCE) {
                if(!_.isUndefined(targetCompCoordinates.y) && !_.isUndefined(targetCompCoordinates.height)) {
                    snapValues.y = closestComponentDistance.y;
                    snapValues.height = closestComponentDistance.y * (-1);
                } else if(!_.isUndefined(targetCompCoordinates.y)) {
                    snapValues.y = closestComponentDistance.y;
                } else if(!_.isUndefined(targetCompCoordinates.height)) {
                    snapValues.height = closestComponentDistance.y;
                }
            }

            if (Math.abs(closestComponentDistance.x) < this.SNAP_DISTANCE) {
                if(!_.isUndefined(targetCompCoordinates.x) && !_.isUndefined(targetCompCoordinates.width)) {
                    snapValues.x = closestComponentDistance.x;
                    snapValues.width = closestComponentDistance.x * (-1);
                } else if(!_.isUndefined(targetCompCoordinates.x)) {
                    snapValues.x = closestComponentDistance.x;
                } else if(!_.isUndefined(targetCompCoordinates.width)) {
                    snapValues.width = closestComponentDistance.x;
                }
            }

            return snapValues;
        },

        _fixCoordinatesAccordingToSnapValuesIfNeeded: function(targetCompCoordinates, snapValues) {
            if(!_.isEmpty(snapValues)) {
                _.forEach(snapValues, function(value, key) {
                    targetCompCoordinates[key] += value;
                });
            }
        }
    });

});
