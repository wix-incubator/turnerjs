define.component('wysiwyg.editor.components.panels.MobileComponentPanel', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.ComponentPanel');

    def.traits(['wysiwyg.editor.components.panels.traits.MobileComponentPanelPropertySplitHandler']);

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
        close: {type: 'htmlElement'},
        aInput: {type: 'htmlElement'},
        angle: {type: 'htmlElement'},
        angleIcon: {type: 'htmlElement'},
        mobilePropertiesResetButton: {
            type: 'wysiwyg.editor.components.inputs.ButtonInput',
            argObject: {buttonLabel: 'COMP_MOBILE_BUTTON_LABEL_RESET',
                iconSrc: "mobile/reset-icon.png",
                iconSize: {width: 20, height: 20},
                toolTip: {
                    addQuestionMark: true,
                    toolTipId: 'Mobile_Comp_Props_Reset_ttid'
                }
            },
            hookMethod: '_translateButtonLabel'
        }
    });

    def.resources(['W.Resources']);

    def.methods({

        _registerPanel: function () {
            //do nothing (another option is to register it under a different name - mobilePropertyPanel and fix PanelPresenter._handleViewerModeChange accordingly)
        },

        _onAllSkinPartsReady: function () {
            this._initiatePanelHeader();
            this.collapse();
            this.disable();
        },

        setEditedComponent: function () {
            if (this._editedComponent === this.injects().Editor.getEditedComponent()) {
                this._setPanelScope();
                return;
            }
            this.updateEditedComponentPanel();
        },

        updateEditedComponentPanel: function () {
            this._disposeInnerDataPanel();
            this.createEditedComponentPanel();
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

        createEditedComponentPanel: function () {
            this._editedComponent = this.resources.W.Editor.getEditedComponent();
            if (!this._editedComponent) {
                return;
            }

            this._setPanelTexts();
            this._setPanelScope();
            this._setPanelPartsFromData();
            this._setMobileSplitProps();
            this.updatePanelFields();
            this._disableInputsAccordingToComponent();
            this._setPanelHeightRelativeToWindowHeight();
            this._setRotationState();
        },

        _setPanelTexts: function () {
            var descriptionText;
            var compLabel = this._getComponentLabel();
            var labelText = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'COMP_' + compLabel);
            var descriptionKey = this._getDescriptionKey(compLabel);

            descriptionText = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'COMP_DESC_' + descriptionKey);

            this._skinParts.panelLabel.set('html', labelText);
            this._skinParts.panelDescription.set('html', descriptionText);
        },

        _getDescriptionKey: function (compLabel) {
            var descriptionKey = compLabel;
            if (this._mobileComptPropHandler.isEnabled(this._editedComponent)) {
                descriptionKey = this._mobileComptPropHandler.areAllInputsHidden(this._editedComponent) ? 'MOBILE_NO_PROPERTIES' : 'MOBILE_CUSTOMIZE_PROPERTIES';
            }
            else if (this.resources.W.Resources.isKeyInBundle('EDITOR_LANGUAGE', 'COMP_DESC_MOBILE_' + descriptionKey)) {
                descriptionKey = 'MOBILE_' + descriptionKey;
            }
            return descriptionKey;
        },

        _measureHeightWithoutContent: function () {
            var resetPropsButtonNode = this._skinParts.mobilePropertiesResetButton.$view;
            return this._skinParts.panelDescription.getSize().y
                + this._skinParts.topBar.getSize().y
                + this._skinParts.generalProperties.getSize().y
                + (resetPropsButtonNode && resetPropsButtonNode.getParent().getSize().y) || 0;
        },

        _setPanelPartsFromData: function () {
            this._editedComponent = this.resources.W.Editor.getEditedComponent();
            var dataItem = this._editedComponent.getDataItem();
            var dataType = (dataItem) ? dataItem.getType() : '';
            var dataPanelParts = this._editedComponent._panel_ || this.injects().Editor.getDataPanel(dataType, this._editedComponent.getOriginalClassName());

            if (dataPanelParts) {

                //manageOwnScroll means that the internal panel will manage scrolling and that the component panel should not try to control it.
                this._editedComponentManagesOwnScroll = dataPanelParts.manageOwnScroll;
                var dataPanelParams = this._getDataPanelParams();
                var onInnerPanelReadyCallback = this._getInnerPanelReadyCallback();

                this._dataPanel = this.injects().Components.createComponent(dataPanelParts.logic, dataPanelParts.skin, this._editedComponent.getDataItem(), dataPanelParams, null, onInnerPanelReadyCallback);
                this.resources.W.Utils.callLater(function () {
                    // TODO: there is something very fishy here. if u remove the 'if' statement it will throw exception on this scenario:
                    // 1) go to mobile editor
                    // 2) delete a component from the page
                    // 3) undo (and it will come back)
                    // 4) redo (it will be deleted but get here with a null dataPanel)
                    if (this._dataPanel && this._skinParts.dataPanelContainer) {
                        this._dataPanel.insertInto(this._skinParts.dataPanelContainer);
                    }
                }.bind(this), null, this, 20); //trying to solve bug #MOB-1284
            }
        },

        _setRotationState: function () {
            if (this._editedComponent.isRotatable()) {
                this.setState('rotatable', 'rotatable');
            } else {
                this.setState('notRotatable', 'rotatable');
            }
        },

        _translateButtonLabel: function (definition) {
            var labelKey = definition.argObject.buttonLabel;
            definition.argObject.buttonLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', labelKey);
            return definition;
        },

        updatePanelFields: function () {
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
        },

        bindPanelEvents: function () {
            this._bindInternalEvents();
            this._bindExternalEvents();
        },

        _bindInternalEvents: function () {
            this._skinParts.xInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.yInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.wInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.hInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.xInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.yInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.wInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.hInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, function () {
                this._onHelpClick();
            }.bind(this));
            this._skinParts.close.addEvent(Constants.CoreEvents.CLICK, this._closePanelOnX);
            this._skinParts.aInput.addEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.aInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
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
            this._skinParts.dataPanelContainer.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.injects().Utils.stopMouseWheelPropagation);
            this._skinParts.close.removeEvent(Constants.CoreEvents.CLICK, this._closePanelOnX);
            this._skinParts.aInput.removeEvent(Constants.CoreEvents.BLUR, this._onFieldChange);
            this._skinParts.aInput.removeEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);

        },

        _removeExternalEvents: function () {
            window.removeEvent(Constants.CoreEvents.RESIZE, this._setPanelHeightRelativeToWindowHeight);
            window.removeEvent(Constants.CoreEvents.RESIZE, this._enableDrag);
            this.resources.W.Commands.unregisterListener(this);
        }
    });
});