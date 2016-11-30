define.experiment.component('Editor.wysiwyg.viewer.components.menus.DropDownMenu.Dropdownmenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.dropdownmenu.editor.DropDownMenuPanel',
        skin: 'wysiwyg.common.components.dropdownmenu.editor.skins.DropDownMenuPanelSkin'
    });

    def.styles(3);

    def.helpIds({
        componentPanel: '/node/7794',
        advancedStyling: '/node/7771',
        chooseStyle: '/node/7771'
    });

    def.toolTips({
        "Menu_Settings_More_menu_button_ttid": {
            "isMoreLess": false,
            "isDontShowAgain": false,
            "content": "[MENU_MORE_BUTTON_TT]",
            "isPublished": true,
            "help": {
                "isMoreHelp": false,
                "text": null,
                "url": ""
            }
        }
    });

    def.resources(['W.Utils', 'W.Commands']);

    def.binds(strategy.merge(['_onEditModeChange']));

    def.traits([
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MenuPropertiesHandler',
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MoreButtonHandler',
        'wysiwyg.common.components.dropdownmenu.editor.traits.MenuDomBuilder',
        'wysiwyg.common.components.dropdownmenu.editor.traits.MenuDataHandler'
    ]);

    def.methods({

        initialize: strategy.after(function (compId, viewNode, args) {
            this.EDITOR_META_DATA = {
                general: {
                    settings: true,
                    design: true
                },
                custom: [
                    {
                        label:'FPP_RENAME_PAGES_LABEL',
                        command:'WEditorCommands.PageSettings',
                        commandParameter:{BIsrc:'DropDownMenuFPP', parentPanel: 'pagesPanel'}
                    },
                    {
                        label:  "FPP_NAVIGATE_LABEL",
                        command: "WEditorCommands.Pages",
                        commandParameter: {
                            skinPart: "pagesPanel"
                        }
                    }
                ],
                dblClick: {
                    command: "WEditorCommands.Pages",
                    commandParameter: "pagesPanel"
                }
            };
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);
        }),

        isRenderNeeded: strategy.around(function (originalFunction, invalidations) {
            var renderTriggers = this._getRenderTriggers();
            return invalidations.isInvalidated(renderTriggers) || originalFunction(invalidations);
        }),

        _getRenderTriggers: function () {
            return [this.INVALIDATIONS.PART_SIZE, 'buttonsSizeChange'];
        },

        _onRender: function (renderEvent) {
            this.parent(renderEvent);
            if (this._isFirstRender(renderEvent)) {
                this._setDirectionToOpenSubMenu();
                this._setLineHeight(this.getHeight());
            }

            this._debounceMarkWideSubmenus();

            var alignTextChange = this._getTextAlignChange(renderEvent);
            if(alignTextChange){
                this._handleAlignTextState(alignTextChange);
            }

            var hasFontChange = this._hasFontChange(renderEvent);
            if(hasFontChange){
                this._initButtonsWidthMap();
                this._arrangeMenuAccordingToNewWidth();
                this._setLineHeight(this.getHeight());
            }

            var widthChange = this._getWidthChange(renderEvent);
            if (widthChange) {
                this._arrangeMenuAccordingToNewWidth(widthChange);
                this._currentWidth = widthChange;
            }
            var heightChange = this._getHeightChange(renderEvent);
            if (heightChange) {
                this._currentHeight = heightChange;
            }
            var buttonsSizeChange = this._getButtonsSizeChange(renderEvent);
            if (buttonsSizeChange && !widthChange) {
                this._handleButtonsSizeChange(buttonsSizeChange);
            }
            var propertyChange = this._getPropertyChange(renderEvent);
            if (propertyChange) {
                var propertyValue = propertyChange.field && propertyChange.value[propertyChange.field];
                this.setMenuProperty(propertyChange.dataItem, propertyChange.field, propertyValue);
                this._setLineHeight(this.getHeight());
            }
            var menuContainerWidthChange = this._getMenuContainerWidthChange(renderEvent);
            if (menuContainerWidthChange) {
                this._handleMenuContainerSizeChange();
                this._arrangeMenuAccordingToNewWidth();
            }

            var menuContainerHeightChange = this._getMenuContainerHeightChange(renderEvent);
            if (menuContainerHeightChange && !this._skinParts.hasExtraDecorations) {
                this.setHeight(menuContainerHeightChange);
            }

            if (renderEvent.data.invalidations.isInvalidated([this.INVALIDATIONS.POSITION])) {
                this._setDirectionToOpenSubMenu();
            }
        },

        _hasFontChange: function (renderEvent) {
            var invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.STYLE_PARAM_CHANGE);
            var request = invalidationObj && invalidationObj[0];
            return request && request.properties && request.properties.fnt === 'font';
        },

        _getWidthChange: function (renderEvent) {
            var invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.WIDTH_REQUEST);
            var widthRequest = invalidationObj && invalidationObj[0];
            return widthRequest && widthRequest.width;
        },

        _getHeightChange: function (renderEvent) {
            var invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.HEIGHT_REQUEST);
            var heightRequest = invalidationObj && invalidationObj[0];
            return heightRequest && heightRequest.height;
        },

        _getButtonsSizeChange: function (renderEvent) {
            var invalidationObj = renderEvent.data.invalidations.getInvalidationByType('buttonsSizeChange');
            var buttonsSizeChange = invalidationObj && invalidationObj[0];
            if (buttonsSizeChange) {
                return (buttonsSizeChange.width !== this._currentWidth || buttonsSizeChange.height > this._currentHeight) && buttonsSizeChange;
            }
        },

        _getTextAlignChange: function (renderEvent) {
            var dataChange = renderEvent.data.invalidations._invalidations.dataChange;
            var invalidationObj = dataChange && dataChange[0];
            if (invalidationObj && invalidationObj.field === 'alignText'){
                return invalidationObj.value.alignText;
            }

            return null;
        },

        _getMenuContainerWidthChange: function (renderEvent) {
            var styleParamArray = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.PART_SIZE);
            var wasWidthChangeRequested = !!this._getWidthChange(renderEvent);
            return !wasWidthChangeRequested && styleParamArray && styleParamArray[0] && styleParamArray[0].current.width !== styleParamArray[0].old.width && styleParamArray[0].current.width;
        },

        _getMenuContainerHeightChange: function (renderEvent) {
            var styleParamArray = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.PART_SIZE);
            var wasHeightChangeRequested = !!this._getHeightChange(renderEvent);
            return !wasHeightChangeRequested && styleParamArray && styleParamArray[0] && styleParamArray[0].current.height !== styleParamArray[0].old.height && styleParamArray[0].current.height;
        },

        _arrangeMenuAccordingToNewWidth: function (newWidth) {
            this._moveButtonsToAndFromMoreSubMenuIfNeeded(newWidth);
            this._updateComponentAccordingToLayoutAffectingProperties();
            if (this._menuContainer.getChildren().length === 1) {
                this._setMenuMinWidth();
            }
        },

        _handleButtonsSizeChange: function (buttonsSizeChange) {
            if (buttonsSizeChange.width) {
                this.setWidth(this._currentWidth);
            }
            if (buttonsSizeChange.height) {
                this.setHeight(buttonsSizeChange.height);
            }
        },

        _handleMenuContainerSizeChange: function () {
            var labelElement, buttonWidthInformation;
            _.forEach(this._menuContainer.getElements('li'), function (button) {
                labelElement = this.getLabelElement(button);
                buttonWidthInformation = this._buttonsWidthMap[this._getButtonIdentifier(button)];
                this._updateButtonsWidthMap(button, labelElement.getWidth() + (buttonWidthInformation ? buttonWidthInformation.extraWidth : 0));
            }, this);
        },

        _handleAlignTextState: function(align){
            this.setState('text-align-' + align);
        },

        _updateMenuDimensionsAccordingToButtons: function () {
            var dimensionsChange = {};
            var widthChange = this._getMenuWidthChange();
            var heightChange = this._getMenuHeightChange();
            if (widthChange) {
                dimensionsChange.width = widthChange;
            }
            if (heightChange) {
                dimensionsChange.height = heightChange;
            }
            if (!_.isEmpty(dimensionsChange)) {
                this._handleButtonsSizeChange(dimensionsChange);
            }
        },

        _updateComponentAccordingToLayoutAffectingProperties: function () {
            var componentProperties = this.getComponentProperties();
            var layoutAffectingProperties = ['alignButtons', 'alignText', 'sameWidthButtons', 'stretchButtonsToMenuWidth'];
            layoutAffectingProperties.forEach(function (propertyName) {
                this.setMenuProperty(componentProperties, propertyName, componentProperties.get(propertyName));
            }, this);
        },

        _getViewNodeByHref: function (href) {
            return _.first(this._getViewNodesByHref(href));
        },

        _getMenuWidthChange: function () {
            var firstLevelButtons = this._menuContainer.getChildren();
            var buttonsWidth = this._getButtonsTotalWidth(firstLevelButtons);
            var currentMenuWidth = this.getWidth();
            if (buttonsWidth > currentMenuWidth || (buttonsWidth + (firstLevelButtons.length * 2) < currentMenuWidth && this._properties.get('stretchButtonsToMenuWidth'))) {
                return buttonsWidth;
            }
            return null;
        },

        _getMenuHeightChange: function () {
            var buttonsLabelHeight = this.getLabelElement(this._menuContainer.getFirst()).getHeight();
            if (buttonsLabelHeight > this._currentHeight) {
                return buttonsLabelHeight;
            }
            return null;
        },

        _updateButtonsWidthMap: function (button, minWidth, extraWidthFromSkin) {
            var identifier = this._getButtonIdentifier(button);
            if(!this._buttonsWidthMap[identifier]){
                this._buttonsWidthMap[identifier] = {};
            }
            this._buttonsWidthMap[identifier].minWidth = minWidth;
            if (extraWidthFromSkin) {
                this._buttonsWidthMap[identifier].extraWidth = extraWidthFromSkin;
            }
        },

        exterminate: function () {
            this.resources.W.Viewer.removeEvent('pageTransitionStarted', this._onSelectedPageChanged);
            this.parent();
        },
        /**
         * Invoked when switching between editor & preview modes.
         * Setting the sub-menu direction because the menu might be inside a container and didn't get position change invalidation
         * @param mode
         * @private
         */
        _onEditModeChange: function (mode) {
            if(mode === 'PREVIEW') {
                this._setDirectionToOpenSubMenu();
            }
        }
    });

});