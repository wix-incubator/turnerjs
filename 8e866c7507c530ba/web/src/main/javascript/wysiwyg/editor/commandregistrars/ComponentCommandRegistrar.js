define.Class('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar', function(classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands', 'W.Preview', 'W.Config', 'W.Utils', 'W.Data', 'W.EditorDialogs', 'W.AppStoreManager', 'W.TPA']);

    def.binds(['_onComponentReadyCallback']);

    def.fields({
        _nonAppStoreAppDefinitions: []
    });
    def.utilize(['wysiwyg.editor.components.AddComponentViaMediaGallery']);
    def.statics({
        MINIMAL_ALLOWED_COMPONENT_VISIBILITY_IN_MOBILE_EDITOR: 10
    });

    def.methods({
        initialize: function() {
            this._nonAppStoreAppDefinitions.push('ecommerceDefObj2G');
            this._nonAppStoreAppDefinitions.push('blogDefObj');
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:56 IST 2012
        registerCommands: function() {
            // add and edit component commands:
            //------------------------------------
            var commandMgr = this.resources.W.Commands;

            this._changeSelectedComponentPosSizeCommand = commandMgr.registerCommandAndListener("WEditorCommands.SetSelectedCompPositionSize", this, this._setSelectedComponentPosSize);
            this._moveSelectedComponentCommand = commandMgr.registerCommandAndListener("WEditorCommands.MoveSelectedComponent", this, this._moveSelectedComponent);
            this._changeSelectedComponentRotateCommand = commandMgr.registerCommandAndListener("WEditorCommands.SetSelectedCompRotationAngle", this, this._setSelectedComponentRotationAngle);
            this._addComponentCommand = W.CommandsNew.registerCommandListener("WEditorCommands.AddComponent", this, this._onAddComponent);
            this._addAppCommand = commandMgr.registerCommandAndListener("WEditorCommands.AddApp", this, this._onAddApp);
            this._addAppComponentCommand = commandMgr.registerCommandAndListener("WEditorCommands.AddAppComponent", this, this._onAddAppComponent);
            this._addComponentfullParamsCommand = commandMgr.registerCommandAndListener("WEditorCommands.AddComponentFullParams", this, this._onAddComponentFullParams);
            this._gridSnapToGridCommand = commandMgr.registerCommandAndListener("EditCommands.SnapToGrid", this, this._onSnapToGrid);
            this._moveComponentToOtherScopeCommand = commandMgr.registerCommandAndListener("EditCommands.moveCurrentComponentToOtherScope", this, this._moveCurrentComponentToOtherScopeCommand);
            this._componentScopeChangeCommand = commandMgr.registerCommand("WEditorCommands.componentScopeChange");
            this._componentCoordinatesSizeChangeCommand = commandMgr.registerCommand("WEditorCommands.componentPosSizeChange");
            this._addSMComponentCommand = commandMgr.registerCommandAndListener("WEditorCommands.AddSMDependantComponent", this, this._onAddSMDependantComponent);
            this.addWixAppPage = commandMgr.registerCommandAndListener("WEditorCommands.AddWixApp", this, this._onAddWixApp);
            this._componentMoveToFooterCommand = commandMgr.registerCommandAndListener("WEditorCommands.MoveComponentToFooter", this, this._moveComponentToFooter);
            this.addComponentViaMediaGalleryCommand = commandMgr.registerCommandAndListener("WEditorCommands.addComponentViaMediaGallery", this, this._onAddComponentViaMediaGallery);
            this._addComponentViaMediaGallery = new this.imports.AddComponentViaMediaGallery();

            commandMgr.registerCommand("WEditorCommands.SelectedComponentChange");
            commandMgr.registerCommand('WEditorCommands.ComponentMoved');
            commandMgr.registerCommand('WEditorCommands.ComponentStyleChanged');
            commandMgr.registerCommand('WEditorCommands.ThemeDataChanged');
            commandMgr.registerCommand('WEditorCommands.ComponentAdvancedStyleChanged');
            commandMgr.registerCommand('WEditorCommands.StopEditingText');
            commandMgr.registerCommand('WEditorCommands.TextDataChange');
            commandMgr.registerCommand('WEditorCommands.ComponentBehaviorsChanged');
            commandMgr.registerCommand('WEditorCommands.MobilePropertyDetach');
            commandMgr.registerCommand('WEditorCommands.MobilePropertyAttach');

            commandMgr.registerCommandAndListener("WEditorCommands.mouseUpOnSelectedComponent", this, this._mouseUpOnSelectedComponent);
            this._componentTextLargerCommand = commandMgr.registerCommandAndListener("WEditorCommands.WComponentTextLarger", this, this._setComponentTextLarger);
            this._componentTextSmallerCommand = commandMgr.registerCommandAndListener("WEditorCommands.WComponentTextSmaller", this, this._setComponentTextSmaller);
            this._componentTextSizeCommand = commandMgr.registerCommandAndListener("WEditorCommands.WComponentTextSizeChanged", this, this._setTextComponentScale);
            commandMgr.registerCommand('WEditorCommands.TextScalingChange');
            commandMgr.registerCommandAndListener("WEditorCommands.AddWixAppPage", this, this._onAddWixAppPage);
            commandMgr.registerCommandAndListener("EditCommands.SnapToObject", this, this._onSnapToObject);
            commandMgr.registerCommand('WEditorCommands.ComponentLockStatusChanged');

            commandMgr.registerCommand('WEditorCommands.AdvancedStylePopupOpened');
            commandMgr.registerCommand('WEditorCommands.ChooseStylePopupOpened');
        },
        _onSnapToObject: function(toggleOn) {
            W.Editor.toggleSnapToObject(toggleOn);
        },

        _provisionWixApp: function(type, appDefinitionData, widgetId, param, forceCreateIfExists) {
            var self = this;
            this.resources.W.AppStoreManager.provisionApp(type, appDefinitionData.appDefinitionId, widgetId, function(technicalData) {
                self.injects().AppsEditor.onProvisionCompleted(technicalData, "wixappsPage", appDefinitionData, widgetId, param, forceCreateIfExists);
            });
        },

        _onAddWixAppPage: function(param) {
            var widgetId = param.widgetId || null;
            var type = "wixappsPart";
            var appDefinitionData = this._getNonAppStoreAppDefinitionData(widgetId);

            var replaceApp = function(response) {
                if (response.result !== "YES") {
                    return;
                }
                this._provisionWixApp(type, appDefinitionData, widgetId, param, true);
            }.bind(this);

            if (this.injects().AppsEditor.isApplicationActive(appDefinitionData)) {
                this.resources.W.EditorDialogs.openPromptDialog(W.Resources.get('EDITOR_LANGUAGE', 'ADD_PAGE_BLOG_GROUPNAME'),
                    W.Resources.get('EDITOR_LANGUAGE', 'BLOG_ADD_PAGE_REPLACE_TEMPLATE'),
                    undefined,
                    this.resources.W.EditorDialogs.DialogButtonSet.YES_NO,
                    replaceApp);
            }
            else {
                this._reportWixAppAdded(widgetId, "Add Page Dialog");

                this._onAddWixApp(param, true);
            }
        },

        _moveComponentToFooter: function(params){
            var editedComponent = W.Editor.getEditedComponent();
            var footerId = "SITE_FOOTER";
            var footer = this.resources.W.Preview.getCompByID(footerId);
            if (!footer){
                return;
            }

            W.UndoRedoManager.startTransaction();
            W.UndoRedoManager.overrideCurrentTransactionPreliminaryActionsIgnoredComponent(footerId);
            this._addEditedComponentToFooterContainer(footer, editedComponent);
            this._enlargeFooterIfNeeded(footer, editedComponent);
            W.UndoRedoManager.endTransaction();
        },

        _addEditedComponentToFooterContainer: function(footer, editedComponent){
            W.Editor.getComponentEditBox().addEditedComponentToContainer(footer, undefined, undefined, undefined, true);
            var coordinates = {
                x: editedComponent.getX(),
                y: Constants.WEditManager.COMPONENT_MOVED_TO_FOOTER_MARGIN + editedComponent.getY() - editedComponent.getBoundingY(),
                updateLayout: true,
                enforceAnchors: false,
                warningIfOutOfGrid: true,
                allowPageShrink: true
            };
            this._setSelectedComponentPosSize(coordinates);
        },

        _enlargeFooterIfNeeded: function(footer, editedComponent){
            var footerMinimumHeight = editedComponent.getBoundingHeight() + 2 * Constants.WEditManager.COMPONENT_MOVED_TO_FOOTER_MARGIN;
            if (footer.$logic.getHeight() < footerMinimumHeight){
                var footerNewCoordinates = {
                    editedComponent: footer.$logic,
                    height: footerMinimumHeight,
                    updateLayout: true,
                    enforceAnchors: true,
                    warningIfOutOfGrid: true,
                    allowPageShrink: true
                };
                this._setSelectedComponentPosSize(footerNewCoordinates);
            }
        },

        _onAddComponentViaMediaGallery: function(param) {
            var compType = param.compType;
            var options = {};

            switch (compType) {
                case 'WPhoto':
                    options.compType = 'WPhoto';
                    options.styleId = param.styleId;
                    break;
                case 'addDocumentMedia':
                    options.compType = 'DocumentMedia';
                    break;
                case 'addSvgShape':
                    options.compType = 'Shape';
                    break;
                case 'addAudioPlayer':
                    options.compType = 'AudioPlayer';
                    break;
                case 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer':
                    options.compType = 'SingleAudioPlayer';
                    break;
                case 'ClipArt':
                    options.compType = 'ClipArt';
                    break;
                default:
                    return; //do nothing
            }

            this._addComponentViaMediaGallery.openMediaGallery(options);
        },


        //############################################################################################################
        //# A D D    A N D   E D I T    C O M P O N E N T    C O M M A N D S
        //############################################################################################################

        _mouseUpOnSelectedComponent: function(params) {
            var coordinates = {x: params.componentX, y: params.componentY};
            this._warningIfOutOfGrid(coordinates);
        },

        _warningIfOutOfGrid: function(coordinates) {
            var editedComponent = W.Editor.getEditedComponent();
            if (!editedComponent) {
                return;
            }
            if (this._dontShowWarningForEditedComponent(editedComponent.$className)) {
                return;
            }
            var pageComp = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().getLogic();
            var componentXRelativeToPage = W.Preview.getGlobalRefNodePositionInEditor(editedComponent).x - W.Preview.getGlobalRefNodePositionInEditor(pageComp).x;
            var editedNeedsLayoutOnDrag = editedComponent.useLayoutOnDrag();
            if (coordinates.y !== undefined) {
                if (editedNeedsLayoutOnDrag) {
                    coordinates.y = Math.max(editedComponent.getMinDragY(), coordinates.y);
                }
            }
            var compWidth = editedComponent.getBoundingWidth();
            var viewerMode = this.resources.W.Config.env.$viewingDevice;
            var warning;
            if (viewerMode === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                warning = this._getWarningIfOutOfGridDesktopEditor(componentXRelativeToPage, compWidth);
            }
            else if (viewerMode === Constants.ViewerTypesParams.TYPES.MOBILE) {
                warning = this._getWarningIfOutOfGridMobileEditor(componentXRelativeToPage, compWidth);
            }
            if (warning.icon && warning.description) {
                this._openWarningPopupIfElementOutOfGrid(warning.icon, warning.description);
            }
        },

        _getWarningIfOutOfGridDesktopEditor: function(componentXRelativeToPage, compWidth) {
            var docWidth = W.Preview.getPreviewManagers().Viewer.getDocWidth();

            var direction, description, iconUrl, icon;
            if (componentXRelativeToPage + (compWidth * 0.7) >= docWidth) {
                direction = 'right';
            }
            else if (componentXRelativeToPage <= -compWidth * 0.3) {
                direction = 'left';
            }
            if (direction) {
                iconUrl = direction === 'right' ? "icons/out_of_right_grid.png" : "icons/out_of_left_grid.png";
                description = "OUT_OF_SITE_GRID_WARNING_TEXT";
                icon = {x: 0, y: 0, width: 95, height: 84, url: iconUrl};
            }

            return {icon: icon, description: description};
        },

        _getWarningIfOutOfGridMobileEditor: function(componentXRelativeToPage, compWidth) {
            var docWidth = W.Preview.getPreviewManagers().Viewer.getDocWidth();
            var direction, description, iconUrl, icon;
            if (docWidth - componentXRelativeToPage <= 10) {
                direction = 'right';
            }
            else if (componentXRelativeToPage + compWidth <= 10) {
                direction = 'left';
            }
            if (direction) {
                iconUrl = direction === 'right' ? "mobile/out_of_320_right.png" : "mobile/out_of_320_left.png";
                description = "OUT_OF_SITE_GRID_WARNING_MOBILE_TEXT";
                icon = {x: 0, y: 0, width: 66, height: 99, url: iconUrl};
            }

            return {icon: icon, description: description};
        },

        _dontShowWarningForEditedComponent: function(className) {
            if (className === 'wysiwyg.viewer.components.WPhoto' ||
                className === 'wysiwyg.viewer.components.ClipArt') {
                return true;
            }
            return  false;
        },

        _openWarningPopupIfElementOutOfGrid: function(icon, description) {
            W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", 'Uh_oh', description, 480, 90, icon, true, 'ELEMENT_OUT_OF_SITE_GRID', 10);
        },

        _moveSelectedComponent: function(coordinates) {
            coordinates = coordinates || {};
            W.UndoRedoManager.startTransaction();
            var x = W.Editor.getEditedComponent().getX();
            var y = W.Editor.getEditedComponent().getY();
            var newCoordinates = {
                x: x + (coordinates.x || 0),
                y: y + (coordinates.y || 0),
                //If not enforce anchors, moving with arrows does not work
                updateLayout: true,
                warningIfOutOfGrid: true,
                allowPageShrink: coordinates.allowPageShrink
            };
            this._setSelectedComponentPosSize(newCoordinates);
            W.UndoRedoManager.endTransaction();
        },

        _isSelectedComponentLocked:function (coordinates) {
            var compEditBox = W.Editor.getComponentEditBox();
            return compEditBox && compEditBox.isComponentLocked() && !coordinates.changeComponentScope;
        },

        _setSelectedComponentPosSize: function(coordinates) {
            coordinates.editedComponent = coordinates.editedComponent || W.Editor.getEditedComponent();

            if (this._isSelectedComponentLocked(coordinates)) {
                return;
            }

            var editedComponent = coordinates.editedComponent;
            var propertyPanel = W.Editor.getPropertyPanel();
            var sizeLimits = editedComponent.getSizeLimits();
            var updateAnchors = coordinates.updateLayout;
            var editedNeedsLayoutOnDrag = editedComponent.useLayoutOnDrag();
            var value;

            this._handleComponentSizePosConstraints(coordinates);

            if ((coordinates.width || coordinates.height) && editedComponent.getAngle() !== 0) {
                this._handleRotatedComponentResize(coordinates, editedComponent);
            }

            if (coordinates.x !== undefined) {
                editedComponent.setX(coordinates.x);
            }
            if (coordinates.y !== undefined) {
                if (editedNeedsLayoutOnDrag) {
                    coordinates.y = Math.max(editedComponent.getMinDragY(), coordinates.y);
                }
                editedComponent.setY(coordinates.y);
            }
            if (coordinates.width !== undefined) {
                value = this.resources.W.Utils.Math._enforceMinMax(coordinates.width, sizeLimits.minW, sizeLimits.maxW);
                editedComponent.setWidth(value);
            }
            if (coordinates.height !== undefined) {
                value = this.resources.W.Utils.Math._enforceMinMax(coordinates.height, sizeLimits.minH, sizeLimits.maxH);
                editedComponent.setHeight(value);

                //PAGE_RESIZE
                //in case we change the height of a page container, we need to change the height of the
                //current page as well
                if (editedComponent.isInstanceOfClass('wysiwyg.viewer.components.PagesContainer')) {
                    var currentPage = W.Editor.getScopeNode(W.Editor.EDIT_MODE.CURRENT_PAGE);
                    currentPage.getLogic().setHeight(value);
                    this.resources.W.Preview.getPreviewManagers().Layout.reportResize([currentPage.getLogic()]);
                }
            }
            var changedComps = [editedComponent];
            if (editedComponent.isMultiSelect) {
                changedComps = editedComponent.getSelectedComps();
            }

            //editedNeedsLayoutOnDrag is for siteSegmentContainer, that when changing y by panel, it will move the page beneath it
            if (coordinates.enforceAnchors || editedNeedsLayoutOnDrag) {
                this.resources.W.Preview.getPreviewManagers().Layout.enforceAnchors(changedComps, true);
            }

            if (updateAnchors) {
                if (coordinates.width !== undefined || coordinates.height !== undefined) {
                    this.resources.W.Preview.getPreviewManagers().Layout.reportResize(changedComps);
                }
                else {
                    this.resources.W.Preview.getPreviewManagers().Layout.reportMove(changedComps);
                }
            }

            if (propertyPanel && propertyPanel.isEnabled()) {
                propertyPanel.updatePanelFields();
            }
            W.Editor.getEditingFrame().fitToComp();

            var allowPageShrink = coordinates.allowPageShrink || false;
            W.Editor.onComponentChanged(allowPageShrink, editedComponent);

            if (typeof(coordinates.warningIfOutOfGrid) === "boolean" && coordinates.warningIfOutOfGrid === true) {
                this._warningIfOutOfGrid(coordinates);
            }
        },

        _setSelectedComponentRotationAngle: function(params) {
            var editedComponent = params.editedComponent || W.Editor.getEditedComponent();

            var updateAnchors = params.updateLayout;

            var adjustedRotationAngle = this._adjustRotationValue(params.rotationAngle);
            editedComponent.setAngle(adjustedRotationAngle);

            if (updateAnchors) {
                this.resources.W.Preview.getPreviewManagers().Layout.reportRotate(editedComponent);
            }

            W.Editor.getEditingFrame().fitToComp();

            if (params.updateControllers) {
                W.Editor.getEditingFrame().modifyControllersToRotation();
            }
            var allowPageShrink = params.allowPageShrink || false;
            W.Editor.onComponentChanged(allowPageShrink, editedComponent);

            if (typeof(params.warningIfOutOfGrid) === "boolean" && params.warningIfOutOfGrid === true) {
                this._warningIfOutOfGrid(params);
            }
        },

        /**
         * Calculates deltaX and deltaY needed to avoid moving the component while resizing it.
         * Function assumption - resize is done from the right side of the component.
         * @param {Integer} quadrant - the component's rotation angle quadrant
         * @param {Object} deltaObj
         * @private
         */
        _ensureUninvolvedSidesStayStill: function(quadrant, initialBoundingSizes, newBoundingSizes) {

            var keepLeftSideStill = (quadrant === 0 || quadrant === 3);
            var keepRightSideStill = (quadrant === 1 || quadrant === 2);
            var keepTopSideStill = (quadrant === 0 || quadrant === 1);
            var keepBottomSideStill = (quadrant === 2 || quadrant === 3);

            var ret = {};

            if (keepLeftSideStill) {
                ret.deltaX = initialBoundingSizes.boundingX - newBoundingSizes.boundingX;
            }
            if (keepRightSideStill) {
                ret.deltaX = (initialBoundingSizes.boundingX + initialBoundingSizes.boundingWidth) - (newBoundingSizes.boundingX + newBoundingSizes.boundingWidth);
            }
            if (keepTopSideStill) {
                ret.deltaY = initialBoundingSizes.boundingY - newBoundingSizes.boundingY;
            }
            if (keepBottomSideStill) {
                ret.deltaY = (initialBoundingSizes.boundingY + initialBoundingSizes.boundingHeight) - (newBoundingSizes.boundingY + newBoundingSizes.boundingHeight);
            }

            return ret;
        },

        _handleRotatedComponentResize: function(coordinates, editedComponent) {
            var angle = editedComponent.getAngle();
            var angleInRadians = this.resources.W.Utils.Math.degreesToRadians(angle);
            var quadrant = Math.floor(angle / 90);
            var calculatedQuadrant;
            var newBoundingSizes;
            var lastCoordinates = editedComponent.getLastCoordinates();
            var lastDimensions = editedComponent.getLastDimensions();
            var initialComponentLayout = {
                x: lastCoordinates.x,
                y: lastCoordinates.y,
                height: lastDimensions.h,
                width: lastDimensions.w
            };
            var initialBoundingSizes = this._calculateBoundingSizes(initialComponentLayout, angleInRadians);
            var widthChangeCorrection = {
                deltaX: 0,
                deltaY: 0
            };
            var heightChangeCorrection = {
                deltaX: 0,
                deltaY: 0
            };

            if (coordinates.width) {
                coordinates.width = parseInt(coordinates.width, 10);
                newBoundingSizes = this._calculateBoundingSizesAfterSingleDimensionChange(initialComponentLayout, 'width', coordinates.width, angleInRadians);
                if (!isNaN(coordinates.x)) {
                    //left side resize - different quadrant
                    calculatedQuadrant = (quadrant + 2) % 4;
                }
                else {
                    //right side resize
                    calculatedQuadrant = quadrant;
                }
                widthChangeCorrection = this._ensureUninvolvedSidesStayStill(calculatedQuadrant, initialBoundingSizes, newBoundingSizes);
            }

            if (coordinates.height) {
                coordinates.height = parseInt(coordinates.height, 10);
                newBoundingSizes = this._calculateBoundingSizesAfterSingleDimensionChange(initialComponentLayout, 'height', coordinates.height, angleInRadians);
                if (!isNaN(coordinates.y)) {
                    //top side resize
                    calculatedQuadrant = (quadrant + 3) % 4;
                }
                else {
                    //bottom side resize
                    calculatedQuadrant = (quadrant + 1) % 4;
                }
                heightChangeCorrection = this._ensureUninvolvedSidesStayStill(calculatedQuadrant, initialBoundingSizes, newBoundingSizes);
            }

            var overallCorrectionFromResize = {
                deltaX: widthChangeCorrection.deltaX + heightChangeCorrection.deltaX,
                deltaY: widthChangeCorrection.deltaY + heightChangeCorrection.deltaY
            };

            coordinates.x = initialComponentLayout.x + overallCorrectionFromResize.deltaX;
            coordinates.y = initialComponentLayout.y + overallCorrectionFromResize.deltaY;
        },

        _calculateBoundingSizesAfterSingleDimensionChange: function(initialComponentLayout, changedDimension, changedDimensionNewValue, angleInRadians) {
            var updatedComponentLayout = _.clone(initialComponentLayout);
            updatedComponentLayout[changedDimension] = changedDimensionNewValue;
            return this._calculateBoundingSizes(updatedComponentLayout, angleInRadians);
        },

        _calculateBoundingSizes: function(componentLayout, angleInRadians) {
            var x = parseInt(componentLayout.x, 10);
            var y = parseInt(componentLayout.y, 10);
            var width = parseInt(componentLayout.width, 10);
            var height = parseInt(componentLayout.height, 10);
            var boundingWidth = this.resources.W.Utils.Layout.getBoundingWidth(width, height, angleInRadians);
            var boundingHeight = this.resources.W.Utils.Layout.getBoundingHeight(width, height, angleInRadians);

            return {
                boundingX: this.resources.W.Utils.Layout.getBoundingX(x, width, boundingWidth),
                boundingY: this.resources.W.Utils.Layout.getBoundingY(y, height, boundingHeight),
                boundingWidth: boundingWidth,
                boundingHeight: boundingHeight
            };
        },

        _adjustRotationValue: function(angle) {
            var intAngle = parseInt(angle, 10) % 360;
            if (intAngle < 0) {
                intAngle += 360;
            }

            return intAngle;
        },

        _handleComponentSizePosConstraints: function(coordinates) {
            this._handleContainerInnerContentConstraints(coordinates);
            this._handleComponentOutOfGridOnMobileEditor(coordinates);
        },

        _handleComponentOutOfGridOnMobileEditor: function(coordinates) {

            var minAllowedWidth;
            if (!coordinates.x && !coordinates.width) {
                return;
            }

            var viewerManager = this.resources.W.Preview.getPreviewManagers().Viewer;
            var isMobileEditor = (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE);
            if (!isMobileEditor) {
                return;
            }

            var editedComponent = coordinates.editedComponent || W.Editor.getEditedComponent();
            var pageComp = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().getLogic();
            var componentCurrentXRelativeToPage = this.resources.W.Preview.getGlobalRefNodePositionInEditor(editedComponent).x - this.resources.W.Preview.getGlobalRefNodePositionInEditor(pageComp).x;
            var dX = coordinates.x - editedComponent.getX();

            //change in x
            if (coordinates.x) {
                var maxAllowedDx = (viewerManager.getDocWidth() - this.MINIMAL_ALLOWED_COMPONENT_VISIBILITY_IN_MOBILE_EDITOR) - componentCurrentXRelativeToPage;
                if (dX > maxAllowedDx) {
                    coordinates.x = editedComponent.getX() + maxAllowedDx;
                }

                var minAllowedDx = 0 - (componentCurrentXRelativeToPage + editedComponent.getWidth()) + this.MINIMAL_ALLOWED_COMPONENT_VISIBILITY_IN_MOBILE_EDITOR;
                if (dX < minAllowedDx) {
                    coordinates.x = editedComponent.getX() + minAllowedDx;
                }
            }

            //right side resize
            if (coordinates.width && !coordinates.x) {
                if (componentCurrentXRelativeToPage < 0) {
                    minAllowedWidth = Math.abs(componentCurrentXRelativeToPage) + this.MINIMAL_ALLOWED_COMPONENT_VISIBILITY_IN_MOBILE_EDITOR;
                    if (coordinates.width < minAllowedWidth) {
                        coordinates.width = minAllowedWidth;
                    }
                }
            }

            //left side resize
            if (coordinates.width && coordinates.x) {
                var componentLeftSideExceedingGridLines = componentCurrentXRelativeToPage + editedComponent.getWidth() - viewerManager.getDocWidth();
                if (componentLeftSideExceedingGridLines > 0) {
                    minAllowedWidth = componentLeftSideExceedingGridLines + this.MINIMAL_ALLOWED_COMPONENT_VISIBILITY_IN_MOBILE_EDITOR;
                    if (coordinates.width < minAllowedWidth) {
                        coordinates.width = minAllowedWidth;
                    }
                }

            }
        },

        _handleContainerInnerContentConstraints: function(coordinates) {
            var editedComponent = coordinates.editedComponent || W.Editor.getEditedComponent();
            if (!editedComponent.isContainer || !editedComponent.isContainer()) {
                return;
            }
            var contentBoundingBox = this.getContentBoundingBox(editedComponent);
            if (coordinates.width !== undefined && !(coordinates.x)) {
                this._handleRightSideResize(coordinates, editedComponent, contentBoundingBox);
            }
            if (coordinates.width !== undefined && coordinates.x !== undefined) {
                this._handleLeftSideResize(coordinates, editedComponent, contentBoundingBox);
            }
            if (coordinates.height !== undefined && coordinates.y !== undefined) {
                this._handleTopSideResize(coordinates, editedComponent, contentBoundingBox);
            }
            if (coordinates.height !== undefined && !(coordinates.y)) {
                this._handleBottomSideResize(coordinates, editedComponent, contentBoundingBox);
            }
        },

        _handleRightSideResize: function(coordinates, container, contentBoundingBox) {
            var resizeLimit = (contentBoundingBox.right < 1) ? 0 : contentBoundingBox.right;
            var deltaWidth = container.getWidth() - coordinates.width;
            deltaWidth = Math.min(deltaWidth, resizeLimit);

            coordinates.width = container.getWidth() - deltaWidth;
        },

        _handleLeftSideResize: function(coordinates, container, contentBoundingBox) {
            var resizeLimit = (contentBoundingBox.left < 1) ? 0 : contentBoundingBox.left;
            var deltaWidth = container.getWidth() - coordinates.width;
            deltaWidth = Math.min(deltaWidth, resizeLimit);

            var innerComponents = container.getChildComponents();
            var innerCoordinates = {};
            for (var i = 0; i < innerComponents.length; i++) {
                if (innerComponents[i] && innerComponents[i].getLogic) {
                    var innerComponent = innerComponents[i].getLogic();
                    innerCoordinates.editedComponent = innerComponent;
                    innerCoordinates.x = innerComponent.getX() - deltaWidth;
                    this._setSelectedComponentPosSize(innerCoordinates);
                }
            }

            coordinates.x = container.getX() + deltaWidth;
            coordinates.width = container.getWidth() - deltaWidth;

        },

        _handleTopSideResize: function(coordinates, container, contentBoundingBox) {
            var resizeLimit = (contentBoundingBox.top < 1) ? 0 : contentBoundingBox.top;
            var deltaHeight = container.getPhysicalHeight() - coordinates.height;
            deltaHeight = Math.min(deltaHeight, resizeLimit);

            var innerComponents = container.getChildComponents(),
                innerCoordinates = {},
                innerComponent;
            for (var i = 0; i < innerComponents.length; i++) {
                if (innerComponents[i] && innerComponents[i].getLogic) {
                    innerComponent = innerComponents[i].getLogic();
                    innerCoordinates.editedComponent = innerComponent;
                    innerCoordinates.y = innerComponent.getY() - deltaHeight;
                    this._setSelectedComponentPosSize(innerCoordinates);
                }
            }

            coordinates.y = container.getY() + deltaHeight;
            coordinates.height = container.getPhysicalHeight() - deltaHeight;

        },

        _handleBottomSideResize: function(coordinates, container, contentBoundingBox) {
            var resizeLimit = (contentBoundingBox.bottom < 1) ? 0 : contentBoundingBox.bottom;
            var deltaHeight = container.getPhysicalHeight() - coordinates.height;
            deltaHeight = Math.min(deltaHeight, resizeLimit);

            coordinates.height = container.getPhysicalHeight() - deltaHeight;
        },

        /**
         * Calculates the resize limit for each side of the container. The returned numbers are the maximum resize allowed.
         * @param container
         * @returns {{top: *, bottom: *, right: *, left: *}}
         */
        getContentBoundingBox: function(container) {
            var containerHeight = container.getPhysicalHeight();
            var containerWidth = container.getWidth();
            var contentResizeBoundaries = {
                top: containerHeight,
                bottom: containerHeight,
                right: containerWidth,
                left: containerWidth
            };
            var innerComponent,
                comps = container.getChildComponents();

            for (var i = 0; i < comps.length; i++) {
                if (comps[i] && comps[i].getLogic) {
                    innerComponent = comps[i].getLogic();
                    contentResizeBoundaries.top = Math.min(contentResizeBoundaries.top, innerComponent.getBoundingY());
                    contentResizeBoundaries.bottom = Math.min(contentResizeBoundaries.bottom, containerHeight - innerComponent.getBoundingY() - innerComponent.getBoundingHeight());
                    contentResizeBoundaries.right = Math.min(contentResizeBoundaries.right, containerWidth - innerComponent.getBoundingX() - innerComponent.getBoundingWidth());
                    contentResizeBoundaries.left = Math.min(contentResizeBoundaries.left, innerComponent.getBoundingX());
                }

            }

            _.forOwn(contentResizeBoundaries, function(value, key) {
                this[key] = Math.max(value, 0);
            }, contentResizeBoundaries);
            return contentResizeBoundaries;
        },

        //Experiment TPA.New was promoted to feature on Sun Aug 05 17:02:29 IDT 2012
        _onAddComponentFullParams: function(def, cmd) {
            if (W.Editor._editMode != W.Editor.EDIT_MODE.CURRENT_PAGE) {
                this.resources.W.Commands.executeCommand("WEditorCommands.WSetEditMode", {editMode: W.Editor.EDIT_MODE.CURRENT_PAGE});
            }
            W.Editor.clearSelectedComponent();

            var componentCreationCallback = def.onCreation || function(logic) {
            };

            this._addComponentToCurrentScope(def.compDef, def.styleId, componentCreationCallback);
        },

        _addComponentToCurrentScope: function(compDef, styleId, callback) {
            /** @type ViewManager */
            var viewer = W.Preview.getPreviewManagers().Viewer;
            var parentNode;
            if (this.resources.W.Config.env.$editorMode === W.Editor.EDIT_MODE.CURRENT_PAGE) {
                /** @type Element */
                parentNode = viewer.getCompByID(viewer.getCurrentPageId());
            }
            else if (this.resources.W.Config.env.$editorMode === W.Editor.EDIT_MODE.MASTER_PAGE) {
                parentNode = viewer.getSiteNode();
            }
            //changes the format in editor data to the format used anywhere else
            if (compDef.comp) {
                compDef.componentType = compDef.comp;
            }

            return W.CompDeserializer.createAndAddComponent(parentNode, compDef, undefined, undefined, styleId, callback);
        },

        _onAddComponent: function(eventObj) {
            var compData;
            var params = eventObj.data.passedData;

            if (!W.Editor._componentData) {
                return;
            }
            if (!params) {
                return this.resources.W.Utils.debugTrace("WEditManager::_onAddComponent: Missing parameter");
            }

            compData = this._getCompData(params);
            return this._onAddComponentInternal(params, compData);
        },

        _getCompData: function(params) {
            var compData,
                compInfo,
                compType = params.compType,
                isTpaComponent = !!params.compData,
                oldFormatData = W.Editor._componentData[compType],
                isOldFormatComponent = !!oldFormatData;

            if (isTpaComponent) {
                compData = params.compData;
            }
            else if (isOldFormatComponent) {
                compData = oldFormatData;
            }
            else {
                compInfo = this._createComponentInformation(compType);
                compData = this._createComponentData(params, compInfo);
            }

            return compData;
        },

        _createComponentInformation: function(compType) {
            var componentManager = this._getComponentManager();
            var componentInformation = componentManager.getComponentInformation(compType);
            if (!componentInformation) {
                componentManager.addComponentToInfoMap(compType);
            }
            return componentInformation || componentManager.getComponentInformation(compType);
        },

        _getComponentManager: function() {
            if (!this._compManager) {
                this._compManager = this.resources.W.Preview.getPreviewManagers().Components;
            }
            return this._compManager;
        },

        _createComponentData: function(params, compInfo) {
            var compData = {};
            Object.forEach(params, function(value, key) {
                key = key == 'compType' ? 'comp' : key;
                compData[key] = value;
            });
            compData.data = compInfo.get('data');
            compData.skin = W.Editor.getComponentDefaultSkin(compInfo.get('skins'));
            compData.styleId = this._getComponentDefaultStyleId(compData.defaultStyleIndex || compData.styleId, compInfo);
            return compData;
        },

        _getComponentDefaultStyleId: function(styleIndex, compInfo) {
            var styleArray = compInfo.get('styles');
            var isStyleIndexOutOfBound = styleIndex >= styleArray.length;
            return isStyleIndexOutOfBound ? styleArray[0] : styleArray[styleIndex];
        },

        _onAddComponentInternal: function (param, compData) {
            if (!compData) {
                return this.resources.W.Utils.debugTrace("WEditManager::_onAddComponent: unknown component type " + param);
            }
            // Add meta data object if not set and add isPreset flag
            var presetData = compData.data;
            if (presetData) {
                presetData.metaData = presetData.metaData || {};
                presetData.metaData.isPreset = true;
            }
            if (param.showOnAllPagesByDefault) {
                this.resources.W.Commands.executeCommand("WEditorCommands.WSetEditMode", {editMode: W.Editor.EDIT_MODE.MASTER_PAGE});
            }
            else if (W.Editor._editMode != W.Editor.EDIT_MODE.CURRENT_PAGE) {
                this.resources.W.Commands.executeCommand("WEditorCommands.WSetEditMode", {editMode: W.Editor.EDIT_MODE.CURRENT_PAGE});
            }
            W.Editor.clearSelectedComponent();

            this._reportAddComponentBIEvent(compData, param);
        },

        _reportAddComponentBIEvent: function (compData, param) {
            var styleId = compData.styleId || param.styleId;
            var viewNode = this._addComponentToCurrentScope(compData, styleId, function (comp) {
                this._onComponentReadyCallback(comp, compData.isTPAExtension);
            }.bind(this));

            if (compData.isTPAExtension) {
                var pageId = this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var appData = this.resources.W.TPA.getAppData(compData.data.applicationId);
                var params = {
                    g1: appData.appDefinitionId,
                    g2: compData.data.widgetId,
                    c1: pageId,
                    c2: viewNode.htmlId,
                    src: 22
                };
                LOG.reportEvent(wixEvents.EXTENSION_COMP_INSTALLATION, params);
            } else {
                LOG.reportEvent(wixEvents.COMPONENT_ADDED, {c1: compData.comp, c2: styleId, i1: viewNode.htmlId});
            }
        },

        _onComponentReadyCallback: function(component, isTPAExtension) {
            if (component.isTpa) {
                this.resources.W.Commands.executeCommand('WEditorCommands.TPACompAdded', component);
            }

            if (!isTPAExtension) {
                component.fireEvent('addedToStage');
            }
        },

        _onSnapToGrid: function(toggleOn, source) {
            if (typeof toggleOn === 'undefined') {
                var newGridScale = W.Editor.getGridScale() != 1 ? 1 : Constants.WEditManager.DEFAULT_GRID_SCALE;
                W.Editor.setGridScale(newGridScale);
                return;
            }

            if (toggleOn) {
                W.Editor.setGridScale(Constants.WEditManager.DEFAULT_GRID_SCALE);
            }
            else {
                W.Editor.setGridScale(1);
            }
        },

        //Experiment TPA.New was promoted to feature on Sun Aug 05 17:02:29 IDT 2012
        _onAddAppComponent: function(param) {
            var appDefinitionData = param.appDefinitionDataObj;
            var widgetId = param.widgetId || null;
            var type = param.type;

            if (!appDefinitionData && param.type == "wixappsPart") {
                appDefinitionData = this._getNonAppStoreAppDefinitionData(widgetId);
            }

            var appDefinitionId = appDefinitionData.appDefinitionId;
            var appsOfThisType = this.injects().AppStoreManager.countAppElements(type, appDefinitionId);
            LOG.reportEvent(wixEvents.APPS_FLOW_APP_BUTTON_CLICKED, {g1: appDefinitionId, i1: appsOfThisType});

            W.EditorDialogs.openAddAppDialog(appDefinitionData, type, widgetId, function() {
                var page = "page/" + this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();

                this.injects().AppStoreManager.addComponent(type, appDefinitionData, widgetId);

            }.bind(this));
        },

        /**
         * Gets app definition data for widget ids which information doesn't come from app store
         * @param widgetId
         * @returns {Object|undefined} The data, or undefined if not found
         * @private
         */
        _getNonAppStoreAppDefinitionData: function(widgetId) {
            // bring the e-commerce application definition as a resource and test
            // that this is really an e-commerce widget
            var appDefinitionData;
            for (var i = 0; i < this._nonAppStoreAppDefinitions.length; i++) {
                this.resource.getResourceValue(this._nonAppStoreAppDefinitions[i], function(defObj) {
                    if (defObj.widgets[widgetId] !== undefined) {
                        appDefinitionData = defObj;
                    }
                });
            }
            return appDefinitionData || undefined;
        },

        _onAddApp: function(param) {
            var appDefinitionData = param.appDefinitionDataObj;
            var widgetId = param.widgetId || appDefinitionData.appDefinitionId || null;
            var type = param.type;
            var page = "page/" + this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
            this.injects().AppStoreManager.addComponent(type, appDefinitionData, widgetId);
        },

        _moveCurrentComponentToOtherScopeCommand: function(params) {
            W.UndoRedoManager.startTransaction();
            W.Editor.moveCurrentComponentToOtherScope(params.event);
            W.UndoRedoManager.endTransaction();
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:56 IST 2012
        _onAddSMDependantComponent: function(param, cmd) {
            W.SMEditor.provisionIfNeeded(function() {
                //test new commands
                var eventObj = {data: {passedData: param}};
                this._onAddComponent(eventObj);
            }.bind(this));
        },

        setKeyboardEvents: function() {
            var ib = W.InputBindings;
            var step = 1;
            var bigStep = 10;

            ib.addBinding("down", { command: this._moveSelectedComponentCommand, commandParameter: {y: step, allowPageShrink: true}});
            ib.addBinding("up", { command: this._moveSelectedComponentCommand, commandParameter: {y: -step, allowPageShrink: true}});
            ib.addBinding("right", { command: this._moveSelectedComponentCommand, commandParameter: {x: step, allowPageShrink: true}});
            ib.addBinding("left", { command: this._moveSelectedComponentCommand, commandParameter: {x: -step, allowPageShrink: true}});
            ib.addBinding(["ctrl+down", "command+down"], { command: this._moveSelectedComponentCommand, commandParameter: {y: bigStep, allowPageShrink: true}});
            ib.addBinding(["ctrl+up", "command+up"], { command: this._moveSelectedComponentCommand, commandParameter: {y: -bigStep, allowPageShrink: true}});
            ib.addBinding(["ctrl+right", "command+right"], { command: this._moveSelectedComponentCommand, commandParameter: {x: bigStep, allowPageShrink: true}});
            ib.addBinding(["ctrl+left", "command+left"], { command: this._moveSelectedComponentCommand, commandParameter: {x: -bigStep, allowPageShrink: true}});

        },

        enableEditCommands: function(isEnabled) {
            isEnabled = !!isEnabled; // convert to boolean
            var commands = [
                this._moveSelectedComponentCommand
            ];
            var i;
            for (i = commands.length - 1; i >= 0; --i) {
                commands[i].setState(isEnabled);
            }
        },

        _setComponentTextLarger: function(params) {
            this._setComponentText(true);
        },

        _setComponentTextSmaller: function(params) {
            this._setComponentText(false);
        },

        _setComponentText: function(isEnlarge) {
            var stepConst = 1.05;
            var changeScaleInPercentage = isEnlarge? stepConst :  1/stepConst;
            var editedComponent = W.Editor.getEditedComponent();
            var curScale = editedComponent.getScale();
            var normalizedScale = editedComponent.normalizeScaleIfNeeded(curScale * changeScaleInPercentage);

            this._setTextComponentScale(normalizedScale);
        },

        _setTextComponentScale: function (newScale) {
            var editedComponent = W.Editor.getEditedComponent();
            var oldScale = editedComponent.getScale();

            editedComponent.setScale(newScale);
            W.Editor.getEditingFrame().fitToComp();
            this._notifyUndoManager(newScale, oldScale);
        },

        _notifyUndoManager: function(newValue, oldValue) {
            if (oldValue === newValue) {
                return;
            }
            W.UndoRedoManager.startTransaction();
            this.resources.W.Commands.executeCommand('WEditorCommands.TextScalingChange', {newValue: newValue, oldValue: oldValue});
        },

        _onAddWixApp: function(param, quiet) {
            var widgetId = param.widgetId || null;
            var type = "wixappsPart";
            var appDefinitionData = this._getNonAppStoreAppDefinitionData(widgetId);
            var appsManager = this.resources.W.AppStoreManager.getAppManager();
            var isAppActive = appsManager ? appsManager.isApplicationActive(appDefinitionData) : null;

            this._provisionWixApp(type, appDefinitionData, widgetId, param);

            if (quiet !== true && appsManager && !isAppActive) {
                var source = param.commandSource === "APP_MARKET" ? "App Market" : "Add Component Panel";
                this._reportWixAppAdded(widgetId, source);
            }
        },

        _reportWixAppAdded: function(widgetId, source) {
            var params = {
                c1: widgetId,
                i1: source
            };

            var appManager = this.resources.W.AppStoreManager.getAppManager();
            if (appManager) {
                var logger = appManager.getLogger();
                logger.reportEvent(logger.Events.ADD_WIX_APP, params);
            }
        }
    });

});
