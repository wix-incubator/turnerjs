/** @class wysiwyg.editor.components.panels.ComponentPanel */
define.component('wysiwyg.editor.components.panels.ComponentPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.skinParts({
        dataPanelContainer: { type: 'htmlElement' },
        panelLabel: { type: 'htmlElement' },
        panelDescription: { type: 'htmlElement' },
        xInput: { type: 'htmlElement' },
        yInput: { type: 'htmlElement' },
        wInput: { type: 'htmlElement' },
        hInput: { type: 'htmlElement' },
        help: { type: 'htmlElement' },
        close: { type: 'htmlElement', command: Constants.EditorUI.CLOSE_PROPERTY_PANEL },
        generalProperties: { type: 'htmlElement' },
        scopeButtonContainer: {type: 'htmlElement'},
        isInMasterCB: {type: 'wysiwyg.editor.components.inputs.CheckBox', argObject: {toolTip: {}}},
        allowAnchorsButton: { 'type': 'htmlElement'},
        aInput: {type: 'htmlElement'},
        angle: {type: 'htmlElement'},
        angleIcon: {type: 'htmlElement'},
        unLockButtonTitle: { 'type': 'htmlElement', autoBindDictionary: 'LOCK_COMPONENT_PANEL_BUTTON_TILE'},
        unLockButtonLink: { 'type': 'wysiwyg.editor.components.inputs.InlineTextLinkInput'},
        unLockButtonContainer: { 'type': 'htmlElement' },
        unLockButton: { 'type': 'htmlElement' },
        toolTip: { 'type': 'htmlElement' }
    });

    def.binds([ '_onUnLockButtonClick',
        '_onUnLockButtonLinkClick',
        '_componentIsLocked',
        '_componentIsUnlocked',
        '_onFieldChange',
        '_onKeyUp',
        '_setPanelHeightRelativeToWindowHeight',
        '_onAllowAnchorsButtonClick',
        '_closePanelOnX',
        '_moveCurrentComponentToOtherScope',
        '_enableDrag',
        '_setPanelScope']);

    def.states({
        'moveScope': ['moveToMaster', 'moveToPage', 'disabled', 'notChangeable'],
        'highlight': ['none', 'highlight'],
        'rotatable': ['rotatable', 'notRotatable']
    });

    def.statics({
        DRAG_OFFSET: 40
    });

    def.resources(["W.Preview", 'W.Config', 'W.Editor']);

    /**
     * @lends wysiwyg.editor.components.panels.ComponentPanel
     */
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.last = {x: -99999999, y: -99999999, width: -99999999, height: -99999999};
            this._heightCalcTimerCounter = 0;
            this._heightCalcTimerCounterMax = 10;
            this.setState('moveToMaster', 'moveScope');
            this._registerPanel();
            this.resources.W.Commands.registerCommandAndListener(Constants.EditorUI.HIGHLIGHT_PROPERTY_PANEL, this, this._highlightPropertyPanel);
        },

        _registerPanel: function () {
            this.resources.W.Editor.registerEditorComponent('propertyPanel', this);
        },

        render: function () {
            this.parent();
            this._setPanelHeightRelativeToWindowHeight();
            this._enableDrag();
        },

        exitEditMode: function () {
            this._disposeInnerDataPanel();
            this.injects().Commands.executeCommand(Constants.EditorUI.CLOSE_PROPERTY_PANEL);
        },
        updateEditedComponentPanel: function () {
            this._disposeInnerDataPanel();
            this._editedComponent = this.resources.W.Editor.getEditedComponent();

            if (!this._editedComponent) {
                return;
            }

            this._addToolTipToSkinPart(this._skinParts.allowAnchorsButton, 'Boundary_box_Anchor_button_ttid');
            this._setPanelTexts();
            this._setPanelScope();
            this._setPanelPartsFromData();
            this.updatePanelFields();
            this._setShowAnchorsButtonState(false);
            this._disableInputsAccordingToComponent();
            this._setPanelHeightRelativeToWindowHeight();
            this._enableAnchorsButton();
            this._manageLockComponentButtons();
            this._setScrollManager();
        },

        _setScrollManager: function () {
            if (this._editedComponentManagesOwnScroll) {
                this._skinParts.dataPanelContainer.setStyle('overflow', 'hidden');
                this._skinParts.dataPanelContainer.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.injects().Utils.stopMouseWheelPropagation);
            }
            else {
                this._skinParts.dataPanelContainer.setStyle('overflow', 'auto');
                this._skinParts.dataPanelContainer.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.injects().Utils.stopMouseWheelPropagation);
            }
        },

        _manageLockComponentButtons: function () {
            if (!this._editedComponent) {
                return;
            }
            var compEditBox = this.resources.W.Editor.getComponentEditBox();
            if (compEditBox.isComponentLocked()) {
                this._componentIsLocked();
            }
            else {
                this._componentIsUnlocked();
            }
        },

        setEditedComponent: function () {
            if (this._editedComponent === this.resources.W.Editor.getEditedComponent()) {
                this._setPanelScope();
                return;
            }
            this.updateEditedComponentPanel();
            if (!this._editedComponent) {
                return;
            }
            if (this._editedComponent.isRotatable()) {
                this.setState('rotatable', 'rotatable');
            } else {
                this.setState('notRotatable', 'rotatable');
            }
        },

        highlight: function () {
            this.setState('highlight', 'highlight');
            this.callLater(this.setState, ['none', 'highlight'], 300);
        },

        _setPanelTexts: function () {
            //note: please see what the function was before this commit.
            //this is here only until the correct 'basic' lang keys for fixedPosition are changed and re-translated, then it will be reverted back.
            var compLabel = this._getComponentLabel();
            var compDescriptionLabel = compLabel;
            if (this._editedComponent.canBeFixedPosition()) {
                compDescriptionLabel += '_fixedPosition';
            }
            var labelText = this.injects().Resources.get('EDITOR_LANGUAGE', 'COMP_' + compLabel);
            var descriptionText = this.injects().Resources.get('EDITOR_LANGUAGE', 'COMP_DESC_' + compDescriptionLabel);

            this._skinParts.panelLabel.set('html', labelText);
            this._skinParts.panelDescription.set('html', descriptionText);
        },

        _shouldMoveScopeBeDisabled: function () {
            return !this._editedComponent.canMoveToOtherScope() || this._isMobile();
        },

        _setPanelScope: function () {
            if (!this._editedComponent) {
                return;
            }
            if (this._shouldMoveScopeBeDisabled()) {
                this.setState('disabled', 'moveScope');
            } else {
                //                var isInPage = this._editorMode == this.injects().Editor.EDIT_MODE.CURRENT_PAGE;
                var currentEditMode = this.injects().Editor.getComponentScope(this._editedComponent);
                var isInPage = (currentEditMode == this.injects().Editor.EDIT_MODE.CURRENT_PAGE);
                this._skinParts.isInMasterCB.setValue(!isInPage);


                /**
                 * What was done here:
                 * 1. If the edited component can be fixed position, we add the checkbox to the Component Panel. Otherwise, we hide the checkbox
                 * 2. If the edited component is the child of the footer, we disable the show on all pages checkbox and add the relevant tooltip (as per product from long long ago, it just never worked properly)
                 * 3. If the edited component is the child of the header and the header is in fixed position, we disable the show on all pages checkbox and add the relevant tooltip (as per product)
                 */
                if (this._editedComponent.getShowOnAllPagesChangeability()) {
                    this.setState(isInPage ? 'moveToMaster' : 'moveToPage', 'moveScope');
                    if (this._editedComponent.isChildOfFixedPositionHeader()) {
                        this._disableSkinpartAndAddTooltip(this._skinParts.isInMasterCB, 'Component_In_Fixed_Position_Header_ttid', true);
                    } else if (this._editedComponent.isChildOfFooter()) {
                        this._disableSkinpartAndAddTooltip(this._skinParts.isInMasterCB, 'Component_Panel_is_in_master_not_changeable_ttid', true);
                    } else {
                        this._skinParts.isInMasterCB.enable();
                        this._skinParts.isInMasterCB.addToolTip('Component_Panel_is_in_master_ttid', true);
                    }
                } else {
                    this.setState('notChangeable', 'moveScope');
                    this._disableSkinpartAndAddTooltip(this._skinParts.isInMasterCB, 'Component_Panel_is_in_master_not_changeable_ttid', true);
                }
            }
        },

        _setPanelPartsFromData: function () {
            var dataItem = this._editedComponent.getDataItem();
            var dataType = (dataItem) ? dataItem.getType() : '';
            var dataPanelParts = this._editedComponent._panel_ || this.injects().Editor.getDataPanel(dataType, this._editedComponent.getOriginalClassName());
            if (dataPanelParts) {
                //manageOwnScroll means that the internal panel will manage scrolling and that the component panel should not try to control it.
                this._editedComponentManagesOwnScroll = dataPanelParts.manageOwnScroll;
                this._dataPanel = this.injects().Components.createComponent(dataPanelParts.logic, dataPanelParts.skin, this._editedComponent.getDataItem(), {previewComponent: this._editedComponent});
                this._dataPanel.insertInto(this._skinParts.dataPanelContainer);
            }
        },

        setPanelPosition: function (coordinates) {
            this._view.setStyles({left: coordinates.x + 'px', top: coordinates.y + 'px'});
        },

        _disposeInnerDataPanel: function () {
            // Old code used to call dispose on this._dataPanel which is an element
            // What we really want is to call the dispose of the logic
            // I'm not sure who might be dependant on the old behaviour so I keep the ugly ifs below.
            if (this._dataPanel) {
                if (this._dataPanel.$logic && this._dataPanel.$logic.dispose) {
                    this._dataPanel.$logic.dispose();
                }
                else {
                    this._dataPanel.dispose();
                }
            }
            this._dataPanel = null;
            this._editedComponent = null;
            this._skinParts.dataPanelContainer.empty();
        },

        _closePanelOnX: function () {
            this.injects().Commands.executeCommand(Constants.EditorUI.CLOSE_PROPERTY_PANEL, {stayClosed: true});
        },

        /**
         * Helper function - enable or disable allowAnchorsButton
         */
        _enableAnchorsButton: function () {
            this._enableLayoutLocks = !this._editedComponent.isMultiSelect && this._editedComponent.allowHeightLock();
            var compEditBox = this.resources.W.Editor.getComponentEditBox();
            if (this._enableLayoutLocks && this._editedComponent.getAngle() === 0 && !compEditBox.isComponentLocked()) {
                this._skinParts.allowAnchorsButton.removeAttribute('disabled');
            } else {
                this._skinParts.allowAnchorsButton.setAttribute('disabled', 'disabled');
            }
        },

        _reportPanelRotation: function (angle) {
            var params = {
                c1: this._editedComponent.className,
                c2: this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId(),
                i1: angle
            };
            LOG.reportEvent(wixEvents.CHANGE_ANGLE_THROUGH_PANEL, params);
        },

        hide: function () {
            this.fireEvent(Constants.EditorUI.PANEL_CLOSING, this);
        },

        updatePanelFields: function () {
            this._editedComponent = W.Editor.getEditedComponent();
            if (this._editedComponent) {
                this.last.x = this._editedComponent.getX();
                this.last.y = this._editedComponent.getY();
                this.last.width = this._editedComponent.getWidth();
                this.last.height = this._editedComponent.getHeight();
                this.last.angle = this._editedComponent.getAngle();

                this._skinParts.xInput.setProperty('value', this._editedComponent.getBoundingX());
                this._skinParts.yInput.setProperty('value', this._editedComponent.getBoundingY());
                this._skinParts.wInput.setProperty('value', this.last.width);
                this._skinParts.hInput.setProperty('value', this.last.height);
                this._skinParts.aInput.setProperty('value', this.last.angle);
            }
            this._enableAnchorsButton();
        },

        _onAllSkinPartsReady: function () {
            this.collapse();
            this.disable();

            this._bindInternalEvents();
            this._bindExternalEvents();
            this._addInMasterPageCheckBox();
            this._initLockComponentSkinParts();
            this._skinParts.toolTip.collapse();
        },

        _initLockComponentSkinParts: function () {
            this._skinParts.unLockButtonContainer.collapse();
            var unLockButtonLink = this._skinParts.unLockButtonLink;
            unLockButtonLink.setButtonLabel(this._translate('LOCK_COMPONENT_PANEL_LINK_TILE'));
            unLockButtonLink._skinParts.button._skinParts.label.setStyle('font-size', '12px');
            unLockButtonLink._skinParts.button.render();
            unLockButtonLink.addEvent(Constants.CoreEvents.CLICK, this._onUnLockButtonLinkClick);
            unLockButtonLink.addToolTip('Boundary_box_tooltip_in_panel_ttid', true, this._skinParts.toolTip);
            this._skinParts.unLockButtonTitle.setStyle('font-size', '12px');
        },

        removePanelEvents: function () {
            this._removeInternalEvents();
            this._removeExternalEvents();
        },

        _removeInternalEvents: function () {
            this._skinParts.xInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.yInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.wInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.hInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.xInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.yInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.wInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.hInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);

            this._skinParts.allowAnchorsButton.removeEvent(Constants.CoreEvents.CLICK, this._onAllowAnchorsButtonClick);

            this._skinParts.dataPanelContainer.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.injects().Utils.stopMouseWheelPropagation);

            this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, function () {
                this._onHelpClick();
            }.bind(this));

            this._skinParts.close.removeEvent(Constants.CoreEvents.CLICK, this._closePanelOnX);
            this._skinParts.aInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.aInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
        },

        _removeExternalEvents: function () {
            this.resources.W.Commands.unregisterListener(this);
        },

        /**
         * Helper function - Attach events to elements that are not part of the component
         */
        _bindExternalEvents: function () {
            window.addEvent(Constants.CoreEvents.RESIZE, this._setPanelHeightRelativeToWindowHeight);
            window.addEvent(Constants.CoreEvents.RESIZE, this._enableDrag);

            this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, function () {
                if (this._editedComponent) {
                    this.updatePanelFields();
                }
            }.bind(this));

            var commands = this.resources.W.Commands;
            commands.registerCommandListenerByName('WEditorCommands.SelectedComponentChange', this, this.setEditedComponent, null);
            commands.registerCommandListenerByName('WEditorCommands.componentScopeChange', this, this._setPanelScope, null);
            commands.registerCommandListenerByName('WEditorCommands.componentPosSizeChange', this, this.updatePanelFields, null);
            commands.registerCommandAndListener('WEditorCommands.UpdateEditedComponentPanel', this, this.updateEditedComponentPanel, null);
            commands.registerCommandListenerByName('EditCommands.Lock', this, this._componentIsLocked, null);
            commands.registerCommandListenerByName('EditCommands.Unlock', this, this._componentIsUnlocked, null);
        },

        /**
         * Helper function - Attach events to elements inside the component
         */
        _bindInternalEvents: function () {
            this._skinParts.xInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.yInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.wInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.hInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.xInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.yInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.wInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.hInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);

            this._skinParts.allowAnchorsButton.addEvent(Constants.CoreEvents.CLICK, this._onAllowAnchorsButtonClick);

            this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, function () {
                this._onHelpClick();
            }.bind(this));

            this._skinParts.close.addEvent(Constants.CoreEvents.CLICK, this._closePanelOnX);
            this._skinParts.aInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.aInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);

            this._skinParts.unLockButton.addEvent(Constants.CoreEvents.CLICK, this._onUnLockButtonClick);
        },

        _componentIsLocked: function () {
            this._skinParts.unLockButtonContainer.uncollapse();
            this._skinParts.generalProperties.setAttribute('disabled', 'disabled');
            this._skinParts.xInput.setAttribute('disabled', 'disabled');
            this._skinParts.yInput.setAttribute('disabled', 'disabled');
            this._skinParts.wInput.setAttribute('disabled', 'disabled');
            this._skinParts.hInput.setAttribute('disabled', 'disabled');
            this._skinParts.aInput.setAttribute('disabled', 'disabled');
            this._skinParts.allowAnchorsButton.setAttribute('disabled', 'disabled');
        },

        _componentIsUnlocked: function () {
            this._skinParts.unLockButtonContainer.collapse();
            this._skinParts.generalProperties.removeAttribute('disabled');
            this._disableInputsAccordingToComponent();
        },

        _onUnLockButtonClick: function () {
            this._onUnLockClick('PanelUnLockButton');
        },

        _onUnLockButtonLinkClick: function () {
            this._onUnLockClick('PanelUnLockLink');
        },

        _onUnLockClick: function (source) {
            this._componentIsUnlocked();
            this.resources.W.Commands.executeCommand('EditCommands.Unlock', {source: source});
        },

        /**
         * Add Master Page/Current Page checkbox if applicable.
         */
        _addInMasterPageCheckBox: function () {
            this._skinParts.isInMasterCB.addEvent('inputChanged', this._moveCurrentComponentToOtherScope);
            this._skinParts.isInMasterCB.setValue(false);
            this._skinParts.isInMasterCB.setLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'SHOW_ON_ALL_PAGES'));
        },

        _moveCurrentComponentToOtherScope: function (event) {
            this.injects().Commands.executeCommand('EditCommands.moveCurrentComponentToOtherScope', {event: event});
        },

        _onHelpClick: function () {
            var helpKey;

            if (this._editedComponent && this._editedComponent.getHelpId) {
                helpKey = this._editedComponent.getHelpId();
            } else if (this._editedComponent && this._editedComponent.isTpa) {
                // If the selected comp is TPA, direct to its specific help page using app's ID
                var appId = this._editedComponent.getAppData().appDefinitionId;
                helpKey = '/app/' + appId;
            } else {
                var componentInformation = W.Preview.getPreviewManagers().Components.getComponentInformation(this._editedComponent.$className);
                helpKey = (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').componentPanel) ||
                    'COMPONENT_PANEL_' + this._getComponentLabel();
            }

            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', helpKey || '');
        },

        /**
         * Make the panel dragable
         */
        _enableDrag: function () {
            var screenSize = window.getSize();
            window.limits = {
                x: [10, screenSize.x - this.DRAG_OFFSET],
                y: [this.DRAG_OFFSET, screenSize.y - this.DRAG_OFFSET]
            };
            this._drag = new Drag.Move(this._skinParts.view, {
                snap: 0,
                handle: this._skinParts.panelLabel,
                limit: window.limits

            });
        },

        _onAllowAnchorsButtonClick: function () {
            if (this._skinParts.allowAnchorsButton.getAttribute('disabled') === "disabled") {
                return;
            }
            this.resources.W.Editor.getComponentEditBox().showAnchorsHandler();
            this._setShowAnchorsButtonState(!this._isAllowAnchorsButtonClicked);
        },

        _setShowAnchorsButtonState: function (activateButton) {
            if (activateButton) {
                this._skinParts.allowAnchorsButton.addClass('selected');
                this._isAllowAnchorsButtonClicked = true;
            }
            else {
                this._skinParts.allowAnchorsButton.removeClass('selected');
                this._isAllowAnchorsButtonClicked = false;
            }
        },

        _getComponentLabel: function () {
            return this._editedComponent && this._editedComponent.getOriginalClassName() && this._editedComponent.getOriginalClassName().split('.').getLast();
        },

        _disableInputsAccordingToComponent: function () {
            if (!this._editedComponent.isHorizResizable()) {
                this._skinParts.wInput.setAttribute("disabled", "disabled");
            }
            else {
                this._skinParts.wInput.removeAttribute("disabled");
            }

            if (!this._editedComponent.isVertResizable()) {
                this._skinParts.hInput.setAttribute("disabled", "disabled");
            }
            else {
                this._skinParts.hInput.removeAttribute("disabled");
            }

            if (!this._editedComponent.isHorizontallyMovable()) {
                this._skinParts.xInput.setAttribute("disabled", "disabled");
            }
            else {
                this._skinParts.xInput.removeAttribute("disabled");
            }

            if (!this._editedComponent.isVerticallyMovable()) {
                this._skinParts.yInput.setAttribute("disabled", "disabled");
            }
            else {
                this._skinParts.yInput.removeAttribute("disabled");
            }

            if (!this._editedComponent.isRotatable()) {
                this._skinParts.aInput.setAttribute("disabled", "disabled");
            }
            else {
                this._skinParts.aInput.removeAttribute("disabled");
            }

            if (this._skinParts.allowAnchorsButton) {
                if (!this._editedComponent._isAllowAnchorsButtonClicked) {
                    this._skinParts.allowAnchorsButton.setAttribute("disabled", "disabled");
                }
                else {
                    this._skinParts.allowAnchorsButton.removeAttribute("disabled");
                }
            }
        },

        _onKeyUp: function (e) {
            if (e.key == 'enter') {
                this._onFieldChange(e);
            }
        },

        _onFieldChange: function (event) {
            var value = parseInt(event.target.getProperty('value'), 10);
            if (isNaN(value)) {
                this.updatePanelFields();
                return;
            }

            var coordinates = this._getCalculatedPosSizeChanges(event);
            if (coordinates) {
                coordinates.updateLayout = true;
                coordinates.allowPageShrink = true;
                coordinates.warningIfOutOfGrid = true;
                this.injects().UndoRedoManager.startTransaction();
                if (_.isUndefined(coordinates.rotationAngle)) {
                    this.injects().Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", coordinates, this);
                    if (coordinates.width || coordinates.height) {
                        this._editedComponent.fireEvent("resizeEnd");
                        this._editedComponent.trigger('resizeEnd');
                    }

                } else {
                    if (!this._editedComponent._reportPanelRotation && coordinates.rotationAngle !== this._editedComponent.getAngle()) {
                        this._editedComponent._reportPanelRotation = true;
                        this._reportPanelRotation(coordinates.rotationAngle);
                    }
                    coordinates.updateControllers = true;
                    this.injects().Commands.executeCommand("WEditorCommands.SetSelectedCompRotationAngle", coordinates, this);
                }
                this.injects().UndoRedoManager.endTransaction();
            }
        },

        _getCalculatedPosSizeChanges: function (event) {

            var coordinates = {};
            var value = parseInt(event.target.getProperty('value'), 10);
            var sizeLimits = this._getEditedComponentSizeLimits();

            switch (event.target) {
                case this._skinParts.xInput:
                    value = this._editedComponent.getX() + (value - this._editedComponent.getBoundingX());
                    coordinates.x = Math.min(Math.max(value, this.MINIMUM_X_DEFAULT), this.MAXIMUM_X_DEFAULT);
                    if (coordinates.x != this.last.x) {
                        this.last.x = coordinates.x;
                    }
                    break;
                case this._skinParts.yInput:
                    value = this._editedComponent.getY() + (value - this._editedComponent.getBoundingY());
                    coordinates.y = Math.min(Math.max(value, this.MINIMUM_Y_DEFAULT), this.MAXIMUM_Y_DEFAULT);
                    if (coordinates.y != this.last.y) {
                        this.last.y = coordinates.y;
                    }
                    break;
                case this._skinParts.wInput:
                    if (this._editedComponent && this._editedComponent.isHorizResizable()) {
                        coordinates.width = Math.min(Math.max(value, sizeLimits.minW), sizeLimits.maxW);
                        if (coordinates.width != this.last.width) {
                            this.last.width = coordinates.width;
                        }
                    }
                    break;
                case this._skinParts.hInput:
                    if (this._editedComponent && this._editedComponent.isVertResizable()) {
                        coordinates.height = Math.min(Math.max(value, sizeLimits.minH), sizeLimits.maxH);
                        if (coordinates.height != this.last.height) {
                            this.last.height = coordinates.height;
                        }
                    }
                    break;
                case this._skinParts.aInput:
                    if (this._editedComponent && this._editedComponent.isRotatable()) {
                        coordinates.rotationAngle = value;
                        if (coordinates.rotationAngle != this.last.angle) {
                            this.last.angle = coordinates.rotationAngle;
                        }
                    }
                    break;
            }
            return coordinates;
        },


        _getEditedComponentSizeLimits: function () {
            if (this._editedComponent) {
                return this._editedComponent.getSizeLimits();
            }
            return this.getSizeLimits();
        },

        _disableSkinpartAndAddTooltip: function (skinPart, tooltipId, shouldShowQuestionMark) {
            skinPart.disable();
            skinPart.addToolTip(tooltipId, shouldShowQuestionMark);
        },

        _measureHeightWithoutContent: function () {
            var measuredHeight = this._panelDetailsHeight ||
                this._skinParts.panelDescription.getSize().y +
                this._skinParts.topBar.getSize().y +
                this._skinParts.scopeButtonContainer.getSize().y +
                this._skinParts.generalProperties.getSize().y;

            return measuredHeight;
        },

        _setPanelHeightRelativeToWindowHeight: function () {
            var panelHeightConstant = 120;
            var panelHeight = 0;
            var actualHeight = 0;

            this._panelDetailsHeight = this._measureHeightWithoutContent();
            if (!this._panelDetailsHeight) {
                if (this._measureAgainLater()) {
                    return;
                }
            } else {
                this._heightCalcTimerCounter = 0;
            }

            panelHeight = window.getHeight() - this._panelDetailsHeight - panelHeightConstant;

            this._skinParts.dataPanelContainer.setStyle('height', panelHeight);

            if (this._getMaxHeight()) {
                actualHeight = this._getMaxHeight() >= panelHeight ? panelHeight : this._getMaxHeight();
            }
            else {
                actualHeight = panelHeight;
            }

            this.fireEvent(Constants.CoreEvents.RESIZE, actualHeight);
        },

        _getMaxHeight: function () {
            if (!this._maxHeight) {
                var maxHeight = this._skinParts.dataPanelContainer.getStyle('max-height');
                if (maxHeight) {
                    this._maxHeight = parseInt(maxHeight.replace('px', ''), 10);
                }
            }
            return this._maxHeight;
        },

        _measureAgainLater: function () {
            if (this._heightCalcTimerCounter < this._heightCalcTimerCounterMax) {
                this._heightCalcTimerCounter++;
                this._heightCalcTimer = setTimeout(this._setPanelHeightRelativeToWindowHeight, 100);
                return true;
            }
        },


        _isMobile: function () {
            return this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
        },

        setLabel: function (label) {
            this._skinParts.panelLabel.set("html", label);
        },

        setDescription: function (description) {
            this._skinParts.panelDescription.set("html", description);
        },

        _highlightPropertyPanel: function () {
            if (this.isEnabled()) {
                this.highlight();
            }
        },
        updateRotatbleState: function () {
            if (!this._editedComponent) {
                return;
            }
            if (this._editedComponent.isRotatable()) {
                this.setState('rotatable', 'rotatable');
            } else {
                this.setState('notRotatable', 'rotatable');
            }
            this._disableInputsAccordingToComponent();
        }
    });

});
