/**
 * @class wysiwyg.viewer.components.menus.DropDownMenu
 */
define.component('wysiwyg.viewer.components.menus.DropDownMenu', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.BaseRepeater');

    def.utilize(['core.components.BaseList', 'core.components.SimpleButton', 'wysiwyg.viewer.components.menus.DropDownController']);

    def.skinParts( {
        'repeaterButton':{ type:'core.components.MenuButton', repeater:true, inlineDataField:'items', repeaterDataQueryField:'refId', container:'itemsContainer', argObject:{listSubType:'PAGES'} },
        'moreButton':{ type:'core.components.MenuButton' },
        'itemsContainer':{ type:'htmlElement' },
        'moreContainer':{ type:'htmlElement' },
        'dropWrapper':{ type:'htmlElement' }
    });

    def.binds(['_onButtonDataChange', '_onThemeChange', '_arrangeButtons', '_onButtonClick', "_onPageChanged", '_resetTestOverFlowCount']);

    def.dataTypes(['Menu']);

    def.propertiesSchemaType('HorizontalMenuProperties');

    def.fields({
        _renderTriggers:[ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED, Constants.DisplayEvents.SKIN_CHANGE],
        _prevButtonsWidth:0,
        _testOverFlowCount:50,
        _buttonsPadding:{}
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:true
            },
            custom:[
                {
                    label:'FPP_RENAME_PAGES_LABEL',
                    command:'WEditorCommands.PageSettings',
                    commandParameter:{BIsrc:'DropDownMenuFPP', parentPanel: 'pagesPanel'}
                },
                {
                    label:'FPP_NAVIGATE_LABEL',
                    command:'WEditorCommands.Pages'
                }
            ],
            dblClick:{
                command:'WEditorCommands.Pages'
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.menus.DropDownMenu
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.injects().Theme.addEvent('propertyChange', this._onThemeChange);
            // field vars initialization
            this._arrangeWaitID = -1;
            this.injects().Viewer.addEvent('pageTransitionStarted', this._onPageChanged);
            this._usesExternalData = true;
            this._staticWidth = 0;
            this._aspectRatio = -1;
            // With modifiers are functions that accept a list of buttons and apply some type of modification to them.
            // preWidthModifier is called before the buttons are arranged (can be used to set some static width to all buttons)
            this._preWidthModifier = this._nullModifier;
            // postWidthModifier is called after the buttons are arranged (can be used to determine what to do with the remaining space, like stretch buttons to fill it).
            this._postWidthModifier = this._nullModifier;
            this._hiddenButtonsContainer = new Element("div", {"id":"hiddenButtonsContainer", "style":"visibility:hidden"});
            this._hiddenButtonsContainer.inject(this.getViewNode());
            this._flatButtons = [];
            this._arrangeDone = false;
            this._treeConstructionDone = false;
            this.$view.addClass('visuallyHidden');
            this._resetTestOverFlowCount();
        },

        setWidth:function (value, forceUpdate, triggersOnResize, checkAspectRatio) {
            if (checkAspectRatio == undefined) {
                checkAspectRatio = true;
            }
            if (checkAspectRatio && this._aspectRatio != -1) {
                var newHeight = value / this._aspectRatio;
                if (newHeight < this.getSizeLimits().minH) {
                    newHeight = this.getSizeLimits().minH;
                    value = newHeight * this._aspectRatio;
                }
                this.setHeight(newHeight, true, false, false);
            }
            this.parent(value, forceUpdate, triggersOnResize);
        },

        setHeight:function (value, forceUpdate, triggersOnResize, checkAspectRatio) {
            if (checkAspectRatio == undefined) {
                checkAspectRatio = true;
            }
            if (checkAspectRatio && this._aspectRatio != -1) {
                var newWidth = value * this._aspectRatio;
                if (newWidth < this.getSizeLimits().minW) {
                    newWidth = this.getSizeLimits().minW;
                    value = newWidth / this._aspectRatio;
                }
                this.setWidth(newWidth, true, false, false);
            }
            this.parent(value, forceUpdate, triggersOnResize);

        },

        _onAllSkinPartsReady:function () {
            this.parent();
            this._dropDown = new this.imports.DropDownController(this);
            this._registerButton(this._skinParts.moreButton);
        },

        _registerButton:function (button) {
            button.setMenu(this);
            button.addEvent("dataChanged", this._onButtonDataChange);
            button.dropdownMode = true;
        },

        getItemsContainer:function () {
            var ret = null;
            if (this._skinParts) {
                ret = this._skinParts.itemsContainer;
            }
            return ret;
        },

        getMoreContainer:function () {
            var ret = null;
            if (this._skinParts) {
                ret = this._skinParts.moreContainer;
            }
            return ret;
        },

        getDropWrapper:function () {
            var ret = null;
            if (this._skinParts) {
                ret = this._skinParts.dropWrapper;
            }
            return ret;
        },

        getMenuExtraPixels:function () {
            return this.getDivExtraPixels(this._skinParts.itemsContainer, true);
        },

        arrangeDone:function () {
            return this._arrangeDone;
        },

        _resetTestOverFlowCount: function() {
            this._testOverFlowCount = 5;
        },

        _testOverFlow:function () {
            var buttonsWidth = this._getButtonsWidth();
            this.injects().Utils.clearCallLater(this._overflowID);
            if (this._prevButtonsWidth == 0) {
                this._prevButtonsWidth = buttonsWidth;
            }
            if (buttonsWidth != this._prevButtonsWidth) {
                this._arrangeButtons();
            } else {
                if (this._testOverFlowCount > 0) {
                    this._testOverFlowCount--;
                    this._overflowID = this.callLater(this._testOverFlow, [], 100);
                }
            }
        },

        // used to highlight the button that's related to the currently viewed page.
        _onPageChanged:function (pageID) {
            var i;
            var button;
            // in case we get here after we're disposed
            if (this._skinParts == null) {
                return;
            }
            this._selectActiveButton(pageID);
        },

        _selectActiveButton:function (pageID) {
            if (this._flatButtons) {
                for (var i = 0; i < this._flatButtons.length; i++) {
                    button = this._flatButtons[i];
                    if (button.getID() == pageID) {
                        button.setSelected(true);
                    } else {
                        button.setSelected(false);
                    }
                    this.injects().Utils.forceBrowserRepaint(button.getViewNode());
                }

            }
        },

        _onThemeChange:function () {
            this._resetTestOverFlowCount();

            this._changeTriggeredBy = "themeChange";

            this._arrangeButtonsDelayed();
        },

        _beforeRepeatersCreation:function () {
            this._rootButtons = [];
            this._flatButtons = [];
            this._flatButtons.push(this._skinParts.moreButton);
        },

        _onRepeaterItemReady:function (repeaterDefinition, itemLogic, itemData, newItem) {
            if (newItem) {
                itemLogic.addEvent('click', function () {
                    this._onButtonClick(itemData);
                }.bind(this));
            }
            this._rootButtons.push(itemLogic);
            this._flatButtons.push(itemLogic);
            itemLogic.getViewNode().setStyle("visibility", "hidden");
            this._registerButton(itemLogic);
            this.parent(repeaterDefinition, itemLogic, itemData, newItem);
        },

        _onRepeaterReady:function (repeaterDefinition) {
            this.addEvent(Constants.PropertyEvents.PROPERTY_CHANGED, function() {
                this._resetTestOverFlowCount();
                this._arrangeButtons();
            }.bind(this));
            this._treeConstructionDone = false;
            this._arrangeButtonAccordingToData();
            this._constructButtonsTree();
        },

        _constructButtonsTree:function () {
            var i;
            var j;
            var rootButtons = this._data.get("items");
            var owner;
            var children;
            var def;
            var that = this;
            var creationList = [];
            for (i = 0; i < rootButtons.length; i++) {
                owner = null;
                for (j = 0; j < this._rootButtons.length; j++) {
                    if (this._rootButtons[j].compareRefID(rootButtons[i].get("refId"))) {
                        owner = this._rootButtons[j];
                        break;
                    }
                }
                if (owner) {
                    owner.children = [];
                    children = this._data.getSubItems(rootButtons[i]);
                    for (j = 0; j < children.length; j++) {
                        def = Object.clone(this._repeaterDefinitions[0]);
                        def.dataQuery = children[j].get("refId");
                        creationList.push({owner:owner, def:def});
                    }
                }
            }
            var count = creationList.length;
            if (count == 0) {
                this._constructionDone();
            } else {
                for (i = 0; i < creationList.length; i++) {
                    var itemDefinition = creationList[i].def;
                    creationList[i].owner.createSubButton(this._createComponentbyDefinition.bind(this), itemDefinition, function (logic) {
                        that._registerButton(logic);
                        that._flatButtons.push(logic);
                        logic.addEvent('click', function () {
                            that._onButtonClick(logic._data);
                        }.bind(that));
                        count--;
                        if (count == 0) {
                            that._constructionDone();
                        }
                    });
                }
            }
        },


        //Arrange menu buttons according to data arrangement
        _arrangeButtonAccordingToData:function (buttons) {
            var dataItems = this._data.get("items");
            var arrangedButtons = [];
            for (var i = 0; i < dataItems.length; i++) {
                var dataRefId = dataItems[i].get('refId').substr(1);
                arrangedButtons.push(
                    this._rootButtons.filter(function (button, index) {
                        return button.getDataItem().get('id') == dataRefId;
                    })[0]
                );
            }
            this._rootButtons = arrangedButtons;
        },

        _constructionDone:function () {
            this._treeConstructionDone = true;
            this._arrangeButtons();
        },

        render:function () {
            this.parent();
            if (this._changeTriggeredBy == "styleChange") {
                // When the component's CSS is changed, I need to wait a frame in order to get the most updated results.
                // If I don't wait, I'll get wrong values when querying the css, and my calculation will be wrong.
                this._arrangeButtonsDelayed();
            } else {
                // I don't want to wait the frame when it's not necessary, so when the change is not via style, I'm free to calculate immediately.
                this._arrangeButtons();
            }
        },

        setSkin:function (skin) {
            // Skins may define a static width for their buttons. Obtain this value here if it exists (will also cause every other width modifiers to stop working)
            this._staticWidth = skin.staticWidth || 0;
            this._aspectRatio = parseFloat(skin.aspectRatio, 10) || -1;
            this.parent(skin);
        },

        _onButtonDataChange:function (dataItem) {
            this._changeTriggeredBy = "dataChange";
            this.render();
        },

        _onDataChange:function (dataItem) {
            var props = this.getComponentProperties();
            if (props) {
                props.removeField('spacing'); // property no longer used - remove it if it exists to clean up the DB.
            }
            this._changeTriggeredBy = "dataChange";
            this.parent();
        },

        _applySettings:function () {
            this._preWidthModifier = this._nullModifier;
            this._postWidthModifier = this._nullModifier;
            if (this._staticWidth > 0) {
                this._preWidthModifier = this._staticWidthModifier;
            } else {
                if (this.getComponentProperty("sameWidthButtons")) {
                    this._preWidthModifier = this._sameWidthModifier;
                }
                if (this.getComponentProperty("stretchButtonsToMenuWidth")) {
                    this._postWidthModifier = this._stretchToFillModifier;
                }
            }
        },

        _skinSizeChange:function () {
            this._changeTriggeredBy = "styleChange";
            this.parent();
        },

        _skinParamsChange:function (changePropertiesMap) {
            this._changeTriggeredBy = "styleChange";
            this.parent(changePropertiesMap);
        },


        _arrangeButtonsDelayed:function () {
            this._arrangeDone = false;
            if (this._arrangeWaitID != -1) {
                this.injects().Utils.clearCallLater(this._arrangeWaitID);
            }
            // causes all errors in calculations that wait until the next arrange to be hidden, thus more elegant.
            this._arrangeWaitID = this.callLater(this._arrangeButtonsCapture, [], 100);
            this._changeTriggeredBy = "";
            this._skinParts.itemsContainer.setStyle("overflow", "hidden");
        },

        _arrangeButtonsCapture:function () {
            this._arrangeButtons();
            if (this._arrangeWaitID != -1) {
                this._arrangeButtonsDelayed();
            }
        },

        _arrangeButtons:function () {
            this._arrangeDone = false;
            if (!this._treeConstructionDone || this._skinParts == undefined || !this._rootButtons || this._rootButtons.length == 0 || !this._isDisplayed || !this.isReady()) {
                return;
            }
            if (this._skinParts.moreButton.className == "") {  // apparently sometimes moreButton can be received as a simple dom element and not a class..
                return;
            }
            var buttonsReady = this._hideButtonsOfHiddenPages();
            if (!buttonsReady) {
                return;
            }
            this.$view.removeClass('visuallyHidden');
            this.injects().Utils.clearCallLater(this._overflowID);
            this._prevButtonsWidth = 0;
            this._arrangeWaitID = -1;
            this._applySettings();
            this._initItemsContainer();
            this._initMoreButton();
            // Main arrangement body
            var buttons = this._getDisplayedButtons();
            if (!buttons.length) {
                return;
            }
            buttons.push(this._skinParts.moreButton);
            this._preArrangeButtons(this._flatButtons);
            var buttonSample = this._getSampleButton();

            this._sampleButtonBorder(buttonSample);
            this._setMinimumDimensions(buttonSample);
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].getViewNode().inject(this._skinParts.itemsContainer);
                buttons[i].getViewNode().setProperty("container", "menu");
            }
            this._preWidthModifier(buttons);
            // remove buttons until overflow no longer occurs
            this._calculateButtonsAmount(buttons);
            this.setMinW(buttons[0].getViewNode().offsetWidth);
            this._postWidthModifier(buttons);
            buttons = this._getDisplayedButtons();
            buttons.push(this._skinParts.moreButton);
            // go over all the buttons, and align them according to the settings.
            this._alignButtonsText(buttons);
            this._restoreTransition(this._flatButtons);
            // Once the arrangement algorithm is done, we can turn off overflow, so that worst case, buttons will not go to a new row
            this._skinParts.itemsContainer.setStyle("overflow", "visible");
            this._skinParts.itemsContainer.setStyle("display", "inherit");
            this._skinParts.itemsContainer.setStyle("white-space", "nowrap");
            this._testOverFlow();
            this._arrangeDone = true;
            this._selectActiveButton(this.injects().Viewer.getCurrentPageId());
            this.fireEvent("ready");
        },

        arrangeDropButtons:function (buttons) {
            var i, j;
            for (i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.getViewNode().setStyle("visibility", "inherit");
                var addToHeight = this._skin.more_vPadding || 15;
                this._setButtonHeight(button, this._getButtonMinimalHeight(button) + addToHeight);
            }
        },

        _calculateButtonsAmount:function (buttons) {
            buttons = this._arrangementAlgorithm(buttons);
            // If after arranging we don't need the more button (i.e. all buttons fit), remove it from the buttons list and move it to the hidden buttons container.
            if (this._skinParts.moreButton.skipMe) {
                this._skinParts.moreButton.getViewNode().setStyle("visibility", "hidden");
                //this._skinParts.moreButton.getViewNode().setStyle("display", "none");
                this._skinParts.moreButton.getViewNode().inject(this._hiddenButtonsContainer);
                if (buttons[buttons.length - 1] === this._skinParts.moreButton) {
                    buttons.pop();
                }
            }
        },

        _getButtonsWidth:function () {
            var childrenWidth = 0;
            for (var i = 0; i < this._skinParts.itemsContainer.children.length; i++) {
                childrenWidth += this._skinParts.itemsContainer.children[i].getLogic().getWidthOnLayout();
            }
            return childrenWidth;
        },

        _hideButtonsOfHiddenPages:function () {
            var buttonsReady = true;
            for (var i = 0; i < this._flatButtons.length; i++) {
                if (this._flatButtons[i] != this._skinParts.moreButton) {
                    if (this._flatButtons[i].getDataItem()) {
                        if (this._flatButtons[i].isHidden()) {
                            this._flatButtons[i].getViewNode().setStyle("visibility", "inherit");
                            this._flatButtons[i].getViewNode().inject(this._hiddenButtonsContainer);
                        }
                    }
                    else {
                        buttonsReady = false;
                        break;
                    }
                }
            }
            return buttonsReady;
        },

        _getDisplayedButtons:function () {
            var displayedButtons = [];
            for (var i = 0; i < this._rootButtons.length; i++) {
                if (!this._rootButtons[i].getDataItem()._data.hidePage) {
                    displayedButtons.push(this._rootButtons[i]);
                }
            }
            return displayedButtons;
        },

        // Set the list positions of the buttons in the main menu (top level)
        _setMenuListPositions:function (buttons) {
            var i;
            var button;
            var position;
            if (buttons.length == 1) {
                button = buttons[0];
                button.getViewNode().setProperty("listposition", "lonely");
                button.getViewNode().setProperty("container", "menu");
            } else {
                for (i = 0; i < buttons.length; i++) {
                    button = buttons[i];
                    if (i == 0 && this._setPositionForFirst()) {
                        position = "left";
                    } else if (i == buttons.length - 1 && this._setPositionForLast()) {
                        position = "right";
                    } else {
                        position = "center";
                    }
                    button.getViewNode().setProperty("listposition", position);
                    button.getViewNode().setProperty("container", "menu");
                }
            }
        },
        _setPositionForFirst:function () {
            var ret = false;
            if (this._postWidthModifier == this._stretchToFillModifier) {
                ret = true;
            } else if (this.getComponentProperty("alignButtons") == "left") {
                ret = true;
            }
            return ret;
        },

        _setPositionForLast:function () {
            var ret = false;
            if (this._postWidthModifier == this._stretchToFillModifier) {
                ret = true;
            } else if (this.getComponentProperty("alignButtons") == "right") {
                ret = true;
            }
            return ret;
        },

        _getSampleButton:function () {
            // If button 0 is on stage, use it. Otherwise, use the More button
            // sample button is used when we need to get parameters that are defined in the skin (and therefore shared with all buttons).
            if (this._rootButtons[0].getViewNode().getStyle("visibility") == "visible") {
                return this._rootButtons[0];

            } else {
                return this._skinParts.moreButton;
            }
        },

        _sampleButtonBorder:function (buttonSample) {
            // if a borderWrapper skinPart exists, use it. Otherwise, use the button's root.
            if (buttonSample._skinParts.borderWrapper) {
                this._buttonsBorder = this._getBorder(buttonSample._skinParts.borderWrapper);
            } else {
                this._buttonsBorder = this._getBorder(buttonSample.getViewNode());
            }
        },

        _setMinimumDimensions:function (buttonSample) {
            this.setMinH(this._getButtonMinimalHeight(buttonSample));
        },

        _getButtonMinimalHeight:function (button) {
            button._skinParts.label.setStyle("line-height", "100%");
            var addToMinH = 0;
            if (button.getSkin() && !isNaN(button.getSkin().addToMinH)) {
                addToMinH = button.getSkin().addToMinH;
            }
            var border = this._getBorder(this._skinParts.itemsContainer).y + this._buttonsBorder.y;
            return addToMinH + border + parseInt(button._skinParts.label.getComputedStyle("line-height"));
        },

        _initItemsContainer:function () {
            this._skinParts.itemsContainer.setStyle("text-align", this.getComponentProperty("alignButtons"));
            var targetHeight = this.getHeight() - this._getBorder(this._skinParts.itemsContainer).y - this._getMargin(this._skinParts.itemsContainer).y;
            var targetWidth = this.getWidth() - this._getBorder(this._skinParts.itemsContainer).x - this._getMargin(this._skinParts.itemsContainer).x;
            this._skinParts.itemsContainer.setStyle("height", targetHeight + "px");
            if(window.Browser && window.Browser.safari && window.Browser.version < 6){
                this._skinParts.itemsContainer.setStyle("width", "100%");
            } else {
                this._skinParts.itemsContainer.setStyle("width", targetWidth + "px");
            }
            // The arrangement algorithm requires overflow to be active
            this._skinParts.itemsContainer.setStyle("overflow", "hidden");
            this._skinParts.itemsContainer.setStyle("white-space", "normal");
        },

        _initMoreButton:function () {
            this._skinParts.moreButton.setLabel(this.getComponentProperty('moreButtonLabel'));
            this._skinParts.moreButton.skipMe = true;
            this._skinParts.moreButton.children = [];
            this._skinParts.moreButton.getViewNode().inject(this._skinParts.itemsContainer);
        },

        _preArrangeButtons:function (buttons) {
            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                buttons[i].getViewNode().setStyle("position", "relative");
                button.getViewNode().setStyle("visibility", "inherit");
                button.disableTransition();
                button._skinParts.bg.setStyle("padding", "0px " + "0px");
            }
        },

        _restoreTransition:function (buttons) {
            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.enableTransition();
            }
        },

        _alignButtonsText:function (buttons) {
            for (var i = 0; i < buttons.length; i++) {
                var buttonDiv = buttons[i].getViewNode();
                var padding = parseInt(buttonDiv.getLogic()._skinParts.bg.getComputedStyle("padding-left")) + parseInt(buttonDiv.getLogic()._skinParts.bg.getComputedStyle("padding-right"));
                buttons[i].setPadding(padding);
            }
        },

        _arrangementAlgorithm:function (buttons) {
            var success = false;
            while (!success) {
                success = this._arrangementIteration(buttons);
                if (!success) {
                    if (buttons.length == 1) {
                        success = true;
                    } else {
                        this._skinParts.moreButton.skipMe = false;
                        var button = buttons.splice(buttons.length - 2, 1)[0];
                        button.getViewNode().setStyle("visibility", "inherit");
                        button.getViewNode().dispose();
                        this._skinParts.moreButton.children.unshift(button);
                    }
                }
            }
            return buttons;
        },

//        _stretchToFillModifier:function (buttons, deltaMod) {
//            deltaMod = deltaMod || 0;
//            var saveCurrentPadding = false;
//            if (deltaMod == 0) {
//                saveCurrentPadding = true;
//                this._buttonsPadding = {};
//            }
//            var childrenWidth = this._getButtonsWidth();
//            var i;
//            var itemsContainerWidth = parseInt(this._skinParts.itemsContainer.getStyle("width"));
//            var delta = itemsContainerWidth - childrenWidth - deltaMod;
//            if (Browser.ie) {
//                delta = delta - 1;
//            }
//
//            delta = Math.max(delta, 0);
//
//            var that = this;
//
//            function addPadding(button, paddingSide) {
//                if (count > 0) {
//                    var toAdd = Math.ceil(delta / count);
//                    delta -= toAdd;
//                    var currentPad = parseInt(button._skinParts.bg.getStyle(paddingSide));
//                    if (saveCurrentPadding) {
//                        if (!that._buttonsPadding[button]) {
//                            that._buttonsPadding[button] = {};
//                        }
//                        that._buttonsPadding[button][paddingSide] = currentPad;
//                    }
//                    button._skinParts.bg.setStyle(paddingSide, (currentPad + toAdd) + "px");
//                    count--;
//
//                }
//            }
//
//            if (buttons.length > 0) {
//                var count = buttons.length * 2;
//                for (i = 0; i < buttons.length / 2; i++) {
//                    var button1 = buttons[i];
//                    var button2 = buttons[buttons.length - i - 1];
//                    addPadding(button1, "padding-left");
//                    addPadding(button2, "padding-right");
//                    addPadding(button1, "padding-right");
//                    addPadding(button2, "padding-left");
//                }
//            }
//            if ((this._skinParts.itemsContainer.scrollHeight - buttons[0].getViewNode().offsetHeight) >= buttons[0].getViewNode().offsetHeight) {
//                for (i = 0; i < buttons.length; i++) {
//                    var button = buttons[i];
//                    button._skinParts.bg.setStyle("padding-left", this._buttonsPadding[button]["padding-left"]);
//                    button._skinParts.bg.setStyle("padding-right", this._buttonsPadding[button]["padding-left"]);
//                }
//                if (deltaMod < 20) {
//                    this._stretchToFillModifier(buttons, deltaMod + 1);
//                }
//            }
//            for (i = 0; i < buttons.length; i++) {
//                var button = buttons[i];
//                button.alignText();
//            }
//
//        },

        /** _stretchToFillModifier was merged from experiment DropDownMenuSafari5Fix on 15.12.13 @ 11:06 **/
        _stretchToFillModifier:function (buttons, deltaMod) {
            deltaMod = deltaMod || 0;
            var saveCurrentPadding = false;
            if (deltaMod == 0) {
                saveCurrentPadding = true;
                this._buttonsPadding = {};
            }
            var childrenWidth = this._getButtonsWidth();
            var i;
            var itemsContainerWidth = this._skinParts.itemsContainer.getWidth();
            var delta = itemsContainerWidth - childrenWidth - deltaMod;
            if (Browser.ie) {
                delta = delta - 1;
            }

            delta = Math.max(delta, 0);

            var that = this;

            function addPadding(button, paddingSide) {
                if (count > 0) {
                    var toAdd = Math.ceil(delta / count);
                    delta -= toAdd;
                    var currentPad = parseInt(button._skinParts.bg.getStyle(paddingSide));
                    if (saveCurrentPadding) {
                        if (!that._buttonsPadding[button]) {
                            that._buttonsPadding[button] = {};
                        }
                        that._buttonsPadding[button][paddingSide] = currentPad;
                    }
                    button._skinParts.bg.setStyle(paddingSide, (currentPad + toAdd) + "px");
                    count--;

                }
            }

            if (buttons.length > 0) {
                var count = buttons.length * 2;
                for (i = 0; i < buttons.length / 2; i++) {
                    var button1 = buttons[i];
                    var button2 = buttons[buttons.length - i - 1];
                    addPadding(button1, "padding-left");
                    addPadding(button2, "padding-right");
                    addPadding(button1, "padding-right");
                    addPadding(button2, "padding-left");
                }
            }
            if ((this._skinParts.itemsContainer.scrollHeight - buttons[0].getViewNode().offsetHeight) >= buttons[0].getViewNode().offsetHeight) {
                for (i = 0; i < buttons.length; i++) {
                    var button = buttons[i];
                    button._skinParts.bg.setStyle("padding-left", this._buttonsPadding[button]["padding-left"]);
                    button._skinParts.bg.setStyle("padding-right", this._buttonsPadding[button]["padding-left"]);
                }
                if (deltaMod < 20) {
                    this._stretchToFillModifier(buttons, deltaMod + 1);
                }
            }
            for (i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.alignText();
            }
        },

        _sameWidthModifier:function (buttons) {

            var widest = 0;
            var i;
            var button;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                var myWidth = parseInt(button.getViewNode().offsetWidth - this._buttonsBorder.x);
                if (!isNaN(myWidth)) {
                    widest = Math.max(widest, myWidth);
                }
            }
            if (widest > 0) {
                for (i = 0; i < buttons.length; i++) {
                    button = buttons[i];
                    button.fillWidthByPadding(widest);
                }
            }
        },

        _staticWidthModifier:function (buttons) {
            var i;
            var button;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                if (button.offsetWidth < this._staticWidth) {
                    button.fillWidthByPadding(this._staticWidth);
                } else {
                    button.getViewNode().setStyle("width", this._staticWidth + "px");
                }
            }
        },

        _nullModifier:function (buttons) {
            // do nothing - placeholder instead of null.
        },

        _arrangementIteration:function (buttons) {
            var targetHeight;
            var includedButtons = [];
            var button;
            var i;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                if (!button.skipMe) {
                    includedButtons.push(button);
                } else {
                    button.collapse();
                }
            }
            this._setMenuListPositions(includedButtons);
            for (i = 0; i < includedButtons.length; i++) {
                button = includedButtons[i];
                button.uncollapse();
                button.getViewNode().setStyle("visibility", "visible");
                button.getViewNode().inject(this._skinParts.itemsContainer);
                targetHeight = parseInt(this._skinParts.itemsContainer.getStyle("height")) - this._buttonsBorder.y;
                this._setButtonHeight(button, targetHeight);
                button._skinParts.label.setStyle("width", "auto");

            }
            return (this._skinParts.itemsContainer.scrollHeight - buttons[0].getViewNode().offsetHeight) < buttons[0].getViewNode().offsetHeight;
        },

        _setButtonHeight:function (button, targetHeight) {
            if (button._skinParts.labelPad != undefined) {
                targetHeight = targetHeight - button._skinParts.labelPad.offsetHeight;
            }
            button._skinParts.label.setStyle("line-height", targetHeight + "px");
        },

        _getBorder:function (div) {
            var x = 0;
            var y = 0;
            if (div) {
                x = parseInt(div.getStyle("border-left-width")) + parseInt(div.getStyle("border-right-width"));
                y = parseInt(div.getStyle("border-top-width")) + parseInt(div.getStyle("border-bottom-width"));
            }
            return {
                x:x,
                y:y
            };
        },

        _getMargin:function (div) {
            var x = 0;
            var y = 0;
            if (div) {
                x = parseInt(div.getStyle("margin-left")) + parseInt(div.getStyle("margin-right"));
                y = parseInt(div.getStyle("margin-top")) + parseInt(div.getStyle("margin-bottom"));
            }
            return {
                x:x,
                y:y
            };
        },

        _onResize:function () {
            this._resetTestOverFlowCount();
            this._arrangeButtons();
        },

        _onButtonClick:function (dataItem) {
            this.injects().Viewer.goToPage(dataItem.get("id"));
            // If we;'re in an IOS environment, close dropdown after click since it won't close itself with focus events.
            this.callLater(function () {
                if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                    this._dropDown.closeDropDown(true);
                }
            }.bind(this), [], 100);
        },

        dispose:function () {
            this.injects().Viewer.removeEvent('pageTransitionStarted', this._onPageChanged);
            this.injects().Theme.removeEvent('propertyChange', this._onThemeChange);
            this.parent();
        }
    });

});