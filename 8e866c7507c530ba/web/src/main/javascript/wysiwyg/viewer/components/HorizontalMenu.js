/**
 * @class wysiwyg.viewer.components.HorizontalMenu
 */
define.component('wysiwyg.viewer.components.HorizontalMenu', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.BaseRepeater');

    def.utilize(['core.components.BaseList', 'core.components.SimpleButton']);

    def.skinParts({
        'repeaterButton':{ type:'core.components.MenuButton', repeater:true, dataRefField:'pages', container:'itemsContainer', hookMethod:'_changePagesRefData', argObject:{listSubType:'PAGES'} },
        'moreButton':{ type:'core.components.MenuButton' },
        'itemsContainer':{ type:'htmlElement' },
        'moreContainer':{ type:'htmlElement' }
    });

    def.binds(['_onButtonDataChange', '_onMoreButtonClick', '_onThemeChange', '_arrangeButtons', '_onButtonClick', '_onMoreButtonOver', "_onMoreButtonOut", "_onMoreContainerOver", "_onMoreContainerOut", "_closeMoreMenu", "_onPageChanged"]);

    def.dataTypes(['Document']);

    def.propertiesSchemaType('HorizontalMenuProperties');

    def.fields({
        _renderTriggers:[ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED, Constants.DisplayEvents.SKIN_CHANGE],
        _moreButtonClicked:false,
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
     * @lends wysiwyg.viewer.components.HorizontalMenu
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
            // With modifiers are functions that accept a list of buttons and apply some type of modification to them.
            // preWidthModifier is called before the buttons are arranged (can be used to set some static width to all buttons)
            this._preWidthModifier = this._nullModifier;
            // postWidthModifier is called after the buttons are arranged (can be used to determine what to do with the remaining space, like stretch buttons to fill it).
            this._postWidthModifier = this._nullModifier;
            this._hiddenButtonsContainer = new Element("div", {"id":"hiddenButtonsContainer", "style":"visibility:hidden"});
            this._hiddenButtonsContainer.inject(this.getViewNode());
            this.getViewNode().setStyle("opacity", "0");
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
                this._testOverFlowCount--;
                if (this._testOverFlowCount > 0) {
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
            if (this._allButtons) {
                for (i = 0; i < this._allButtons.length; i++) {
                    if (this._allButtons[i] && this._allButtons[i].getViewNode()) {
                        button = this._allButtons[i];
                        if (button.getID() == pageID) {
                            button.setState("selected");
                        } else {
                            button.removeState("selected");
                        }
                        this.injects().Utils.forceBrowserRepaint(button.getViewNode());
                    }
                }

            }
        },

        _onThemeChange:function () {
            this._changeTriggeredBy = "themeChange";

            this._arrangeButtonsDelayed();
        },

        _beforeRepeatersCreation:function () {
            this._allButtons = [];
        },

        _onRepeaterItemReady:function (repeaterDefinition, itemLogic, itemData, newItem) {
            if (newItem) {
                itemLogic.addEvent('click', function () {
                    this._onButtonClick(itemData);
                }.bind(this));
            }
            this._allButtons.push(itemLogic);
            this.parent(repeaterDefinition, itemLogic, itemData, newItem);
        },

        _onRepeaterReady:function (repeaterDefinition) {
            this.addEvent(Constants.PropertyEvents.PROPERTY_CHANGED, this._arrangeButtons);
            this._addPartsListeners();
            this._arrangeButtons();
        },

        _addPartsListeners:function () {
            this._skinParts.moreButton.addEvent('over', this._onMoreButtonOver);
            this._skinParts.moreButton.addEvent('out', this._onMoreButtonOut);
            this._skinParts.moreButton.addEvent("click", this._onMoreButtonClick);
            this._skinParts.moreContainer.addEvent("mouseover", this._onMoreContainerOver);
            this._skinParts.moreContainer.addEvent("mouseout", this._onMoreContainerOut);
            var i;
            for (i = 0; i < this._allButtons.length; i++) {
                if (this._allButtons[i] && this._allButtons[i].getViewNode()) {
                    this._allButtons[i].getViewNode().uncollapse();
                    this._allButtons[i].addEvent("dataChanged", this._onButtonDataChange);
                }
            }
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
            this.parent(skin);

        },

        _onButtonDataChange:function (dataItem) {
            this._changeTriggeredBy = "dataChange";
            this.render();
        },

        _onDataChange:function (dataItem) {
            this.getComponentProperties().removeField('spacing'); // property no longer used - remove it if it exists to clean up the DB.
            this._changeTriggeredBy = "dataChange";
            this.parent(dataItem);
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
            if (this._skinParts == undefined || !this._allButtons || this._allButtons.length == 0 || !this._isDisplayed || !this.isReady()) {
                return;
            }
            this.getViewNode().setStyle("opacity", "1");
            this.injects().Utils.clearCallLater(this._overflowID);
            this._prevButtonsWidth = 0;
            this._arrangeWaitID = -1;
            this._applySettings();
            var transDuration = (this._allButtons[0] && this._allButtons[0].getViewNode()) ? this._allButtons[0].getViewNode().getStyle("-webkit-transition-duration") : 0;
            this._initItemsContainer();
            this._skinParts.itemsContainer.setStyle("overflow", "hidden");
            this._skinParts.itemsContainer.setStyle("white-space", "normal");
            this._initMoreContainer();

            this._skinParts.moreButton.setLabel(this.getComponentProperty('moreButtonLabel'));
            this._skinParts.moreButton.skipMe = true;

            // Main arrangement body
            var buttons = this._getDisplayedButtons();
            if (!buttons.length) {
                return;
            }
            buttons.push(this._skinParts.moreButton);
            var buttonSample = this._getSampleButton();

            this._sampleButtonBorder(buttonSample);
            this._setMinimumDimensions(buttonSample);
            this._preArrangeButtons(buttons);
            this._preWidthModifier(buttons);
            this._calculateButtonsAmount(buttons);
            this.setMinW(buttons[0].getViewNode().offsetWidth);
            this._postWidthModifier(buttons);
            this._arrangeMoreContainer();
            buttons = this._getDisplayedButtons();
            buttons.push(this._skinParts.moreButton);
            // go over all the buttons, and align them according to the settings.
            this._alignButtonsText(buttons);
            // Turn on transition
            var i;
            for (i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.getViewNode().setStyle("-webkit-transition-duration", transDuration);
            }
            this._skinParts.itemsContainer.setStyle("overflow", "visible");
            this._skinParts.itemsContainer.setStyle("white-space", "nowrap");
            this._setListPositions();
            this._testOverFlow();
        },

        _calculateButtonsAmount:function (buttons) {
            buttons = this._arrangementAlgorithm(buttons);
            // If after arranging we don't need the more button (i.e. all buttons fit), remove it from the buttons list and move it to the moreContainer.
            if (this._skinParts.moreButton.skipMe) {
                this._skinParts.moreButton.getViewNode().setStyle("visibility", "hidden");
                this._skinParts.moreButton.getViewNode().inject(this._skinParts.moreContainer);
                if (buttons[buttons.length - 1] === this._skinParts.moreButton) {
                    buttons.pop();
                }
            }
        },

        _getButtonsWidth:function () {
            var childrenWidth = 0;
            var altWidth = 0;
            for (var i = 0; i < this._skinParts.itemsContainer.children.length; i++) {
                childrenWidth += this._skinParts.itemsContainer.children[i].getLogic().getWidthOnLayout();
            }
            return childrenWidth;
        },

        _getDisplayedButtons:function () {
            var displayedButtons = [];
            var i;
            for (i = 0; i < this._allButtons.length; i++) {
                if (this._allButtons[i] && this._allButtons[i].getDataItem() && !this._allButtons[i].getDataItem()._data.hidePage) {
                    displayedButtons.push(this._allButtons[i]);
                } else {
                    if (this._allButtons[i] && this._allButtons[i].getViewNode()) {
                        this._allButtons[i].getViewNode().setStyle("visibility", "inherit");
                        this._allButtons[i].getViewNode().inject(this._hiddenButtonsContainer);
                    }
                }
            }
            return displayedButtons;
        },

        _setListPositions:function () {
            var i;
            var button;
            var position;
            for (i = 0; i < this._skinParts.itemsContainer.children.length; i++) {
                button = this._skinParts.itemsContainer.children[i];
                if (i == 0 && this._setPositionForFirst()) {
                    position = "first";
                } else if (i == this._skinParts.itemsContainer.children.length - 1 && this._setPositionForLast()) {
                    position = "last";
                } else {
                    position = "center";
                }
                button.setProperty("listposition", position);
            }
            for (i = 0; i < this._skinParts.moreContainer.children.length; i++) {
                button = this._skinParts.moreContainer.children[i];
                button.setProperty("listposition", "more");
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
            if (this._allButtons[0] && this._allButtons[0].getViewNode() && this._allButtons[0].getViewNode().getStyle("visibility") == "visible") {
                return this._allButtons[0];

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
            buttonSample._skinParts.label.setStyle("line-height", "100%");
            var addToMinH = 0;
            if (buttonSample.getSkin() && !isNaN(buttonSample.getSkin().addToMinH)) {
                addToMinH = buttonSample.getSkin().addToMinH;
            }
            var border = this._getBorder(this._skinParts.itemsContainer).y + this._buttonsBorder.y;
            this.setMinH(addToMinH + border + parseInt(buttonSample._skinParts.label.getComputedStyle("line-height"), 10));
        },

        _initItemsContainer:function () {
            this._skinParts.itemsContainer.setStyle("text-align", this.getComponentProperty("alignButtons"));
            var targetHeight = this.getHeight() - this._getBorder(this._skinParts.itemsContainer).y - this._getMargin(this._skinParts.itemsContainer).y;
            var targetWidth = this.getWidth() - this._getBorder(this._skinParts.itemsContainer).x - this._getMargin(this._skinParts.itemsContainer).x;
            this._skinParts.itemsContainer.setStyle("height", targetHeight + "px");
            this._skinParts.itemsContainer.setStyle("width", targetWidth + "px");

        },

        _initMoreContainer:function () {
            this._skinParts.moreContainer.setStyle("visibility", "hidden");
            this._skinParts.moreContainer.setStyle("opacity", "0");
            this._skinParts.moreContainer.setStyle("width", "0px");
            this._skinParts.moreContainer.setStyle("left", "0px");
        },

        _preArrangeButtons:function (buttons) {
            var i;
            for (i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.getViewNode().setStyle("visibility", "inherit");
                button.getViewNode().setStyle("-webkit-transition-duration", "0s");
                button.getViewNode().inject(this._skinParts.moreContainer);
                button._skinParts.bg.setStyle("padding", "0px " + "0px");
            }
        },

        _arrangeMoreContainer:function () {
            // Set width of buttons in more container to fit the widest among them or of the more button, whichever is widest.
            var widest = this._skinParts.moreButton.getViewNode().offsetWidth;
            var i;
            var button;
            for (i = 0; i < this._skinParts.moreContainer.children.length; i++) {
                button = this._skinParts.moreContainer.children[i];
                widest = Math.max(widest, button.offsetWidth);
            }
            this._skinParts.moreContainer.setStyle("width", widest + "px");
            for (i = 0; i < this._skinParts.moreContainer.children.length; i++) {
                button = this._skinParts.moreContainer.children[i];
                this._fillWidthByPadding(button, widest);
            }
            // Set position of the more container right below the more button.
            var moreContainerPosition = this._skinParts.moreButton.getViewNode().offsetLeft;
            if (!isNaN(moreContainerPosition)) {
                this._skinParts.moreContainer.setStyle("left", moreContainerPosition + "px");
            }

        },

        _alignButtonsText:function (buttons) {
            var i;
            for (i = 0; i < buttons.length; i++) {
                var buttonDiv = buttons[i].getViewNode();
                var padding = parseInt(buttonDiv.getLogic()._skinParts.bg.getComputedStyle("padding-left"), 10) + parseInt(buttonDiv.getLogic()._skinParts.bg.getComputedStyle("padding-right"), 10);
                switch (this.getComponentProperty("alignText")) {
                    case "left":
                        buttonDiv.getLogic()._skinParts.bg.setStyle("padding-left", "0px");
                        buttonDiv.getLogic()._skinParts.bg.setStyle("padding-right", padding + "px");
                        break;
                    case "right":
                        buttonDiv.getLogic()._skinParts.bg.setStyle("padding-left", padding + "px");
                        buttonDiv.getLogic()._skinParts.bg.setStyle("padding-right", "0px");
                        break;
                }
            }
        },

        _setPadding:function (buttonDiv, padding) {
            buttonDiv.getLogic()._skinParts.bg.setStyle("padding", "0px " + padding + "px");
        },

        _fillWidthByPadding:function (buttonDiv, targetWidth) {
            var currentPadding = parseInt(buttonDiv.getLogic()._skinParts.bg.getComputedStyle("padding-left"), 10);
            var targetPadding = currentPadding + Math.floor((targetWidth - buttonDiv.offsetWidth) / 2);
            this._setPadding(buttonDiv, targetPadding);
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
                        button.getViewNode().inject(this._skinParts.moreContainer, "top");
                    }
                }
            }
            return buttons;
        },



        _stretchToFillModifier:function (buttons, deltaMod) {
            deltaMod = deltaMod || 0;
            var saveCurrentPadding = false;
            if (deltaMod == 0) {
                saveCurrentPadding = true;
                this._buttonsPadding = {};
            }
            var childrenWidth = this._getButtonsWidth();
            var i;
            var itemsContainerWidth = parseInt(this._skinParts.itemsContainer.getStyle("width"), 10);
            var delta = itemsContainerWidth - childrenWidth - deltaMod - 1;
            if (Browser.ie) {
                delta = delta - 1;
            }

            delta = Math.max(delta, 0);

            var that = this;

            function addPadding(button, paddingSide) {
                if (count > 0) {
                    var toAdd = Math.floor(delta / count);
                    var currentPad = parseInt(button._skinParts.bg.getStyle(paddingSide), 10);
                    if (saveCurrentPadding) {
                        if (!that._buttonsPadding[button]) {
                            that._buttonsPadding[button] = {};
                        }
                        that._buttonsPadding[button][paddingSide] = currentPad;
                    }
                    button._skinParts.bg.setStyle(paddingSide, (currentPad + toAdd) + "px");
                    count--;
                    delta -= toAdd;
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
                    button._skinParts.bg.setStyle("padding-left", /*  paddingLeft*/ this._buttonsPadding[button]["padding-left"]);
                    button._skinParts.bg.setStyle("padding-right", /*paddingRight*/ this._buttonsPadding[button]["padding-left"]);
                }
                if (deltaMod > 20) {
                    return;
                }
                this._stretchToFillModifier(buttons, deltaMod + 1);
            }

        },

        _sameWidthModifier:function (buttons) {

            var widest = 0;
            var i;
            var button;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                var myWidth = parseInt(button.getViewNode().offsetWidth - this._buttonsBorder.x, 10);
                if (!isNaN(myWidth)) {
                    widest = Math.max(widest, myWidth);
                }
            }
            if (widest > 0) {
//                if (widest<=this._skinParts.itemsContainer.offsetWidth){
                for (i = 0; i < buttons.length; i++) {
                    button = buttons[i];
                    this._fillWidthByPadding(button.getViewNode(), widest);
                }
//                }
            }
        },

        _staticWidthModifier:function (buttons) {
            var i;
            var button;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                if (button.offsetWidth < this._staticWidth) {
                    this._fillWidthByPadding(button.getViewNode(), this._staticWidth);
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
            var i;
            for (i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                if (button.skipMe) {
                    button.collapse();
                    continue;
                }
                button.uncollapse();
                button.getViewNode().setStyle("visibility", "visible");
                button.getViewNode().inject(this._skinParts.itemsContainer);
                targetHeight = parseInt(this._skinParts.itemsContainer.getStyle("height"), 10) - this._buttonsBorder.y;
                button.getViewNode().setStyle("height", targetHeight + "px");
                if (button._skinParts.labelPad != undefined) {
                    targetHeight = targetHeight - button._skinParts.labelPad.offsetHeight;
                }
                button._skinParts.label.setStyle("line-height", targetHeight + "px");
                button._skinParts.label.setStyle("width", "auto");

            }
            return (this._skinParts.itemsContainer.scrollHeight - buttons[0].getViewNode().offsetHeight) < buttons[0].getViewNode().offsetHeight;
        },

        _getBorder:function (div) {
            var x = 0;
            var y = 0;
            if (div) {
                x = parseInt(div.getStyle("border-left-width"), 10) + parseInt(div.getStyle("border-right-width"), 10);
                y = parseInt(div.getStyle("border-top-width"), 10) + parseInt(div.getStyle("border-bottom-width"), 10);
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
                x = parseInt(div.getStyle("margin-left"), 10) + parseInt(div.getStyle("margin-right"), 10);
                y = parseInt(div.getStyle("margin-top"), 10) + parseInt(div.getStyle("margin-bottom"), 10);
            }
            return {
                x:x,
                y:y
            };
        },

        _onResize:function () {
            this._arrangeButtons();
        },

        _onButtonClick:function (dataItem) {
            this.injects().Viewer.goToPage(dataItem.get("id"));
        },

        _openMoreMenu:function () {
            this._skinParts.moreButton.setState("selected");
            this._skinParts.moreContainer.setStyle("visibility", "visible");
            this._skinParts.moreContainer.setStyle("opacity", "1");
            this._isMoreContainerOpen = true;
            this._toCloseMoreMenu = false;
            this.injects().Utils.forceBrowserRepaint(this._skinParts.moreButton.getViewNode());
            this.injects().Utils.forceBrowserRepaint(this._skinParts.moreContainer);
        },

        _closeMoreMenuTimer:function () {
            this.injects().Utils.clearCallLater(this._closeMoreMenuTimerID);
            this._closeMoreMenuTimerID = this.injects().Utils.callLater(this._closeMoreMenu, [], this, 500);
        },

        _closeMoreMenu:function (forceClose) {
            if (forceClose || this._toCloseMoreMenu) {
                this._skinParts.moreButton.removeState("selected");
                this._skinParts.moreContainer.setStyle("visibility", "hidden");
                this._skinParts.moreContainer.setStyle("opacity", "0");
                this._toCloseMoreMenu = false;
                this._isMoreContainerOpen = false;
                this._moreButtonClicked = false;
            }
        },

        _forceCloseMoreMenu:function () {
            this._closeMoreMenu(true);
        },

        _onMoreButtonOver:function () {
            this._toCloseMoreMenu = false;
            if (!this._moreButtonClicked) {
                this._openMoreMenu();
            }
        },

        _onMoreButtonOut:function () {
            this._toCloseMoreMenu = true;
            this._closeMoreMenuTimer();
        },

        _onMoreContainerOver:function () {
            this._toCloseMoreMenu = false;
        },



        _onMoreButtonClick:function () {
            this._moreButtonClicked = true;
            if (this._isMoreContainerOpen === false) {
                this._openMoreMenu();
            } else {
                this._forceCloseMoreMenu();
            }
        },


        _onMoreContainerOut:function () {
            this._toCloseMoreMenu = true;
            this._closeMoreMenuTimer();
        },

        dispose:function () {
            this.injects().Viewer.removeEvent('pageTransitionStarted', this._onPageChanged);
            this.injects().Theme.removeEvent('propertyChange', this._onThemeChange);
            this.parent();
        }
    });

});