/**
 * Created by IntelliJ IDEA.
 * User: roy.k
 * Date: 4/29/12
 * Time: 2:35 PM
 * To change this template use File | Settings | File Templates.
 */
/* Author: RoyK
    Instantiated by the DropDownMenu. Is in charge of displaying, populating, positioning and arranging the drop down component of the menu.
 */
define.Class('wysiwyg.viewer.components.menus.DropDownController', function(def){

    def.fields({
        _menu:null,
        _dropButtons:[],
        _dropContainer:null,
        _dropWrapper:null,
        _dropOwnerButton:null,
        _dropDownNeedsClosing:false,
        _closeTimerID:null
    });

    def.inherits('bootstrap.utils.Events');

    def.binds(["_onItemsContainerOver", "_onItemsContainerOut", "closeDropDown", "_onMoreContainerOver", "_onMoreContainerOut", "_onMoreContainerClick", "_onItemsContainerClick"]);

    def.methods({
        initialize:function(menuComponent){

            this._menu = menuComponent;
            this._init();
        },

        _init:function(){
            var itemsContainer  = this._menu.getItemsContainer();
            this._dropContainer = this._menu.getMoreContainer();

            // on mobile first click initiates onhover, second initiates onclick, no need for hover on mobile/tablet
            if (W.Config.mobileConfig.isTablet() || W.Config.mobileConfig.isMobile()) {
                itemsContainer.addEventListener('click', this._onItemsContainerClick, true);
                this._dropContainer.addEventListener("click", this._onMoreContainerClick, true);
            }
            else {
                itemsContainer.addEvent("mouseover", this._onItemsContainerOver);
                itemsContainer.addEvent("mouseout",  this._onItemsContainerOut);
            }

            this._dropWrapper   = this._menu.getDropWrapper();
            if (this._dropWrapper==null){
                this._dropWrapper = this._dropContainer;
            }
            this.closeDropDown(true);
            this._dropContainer.addEvent("mouseover", this._onMoreContainerOver);
            this._dropContainer.addEvent("mouseout", this._onMoreContainerOut);

        },

        openDropDown: function (ownerButton, dropButtons) {
            if (ownerButton == this._dropOwnerButton) {
                this._dropDownNeedsClosing = false;
                return;
            }
            while (this._dropContainer.children.length) {
                this._dropContainer.children[0].dispose();
            }
            var i;
            var displayedButtons = [];
            for (i = 0; i < dropButtons.length; i++) {
                if (dropButtons[i].isHidden() == false) {
                    displayedButtons.push(dropButtons[i]);

                }
            }
            if (displayedButtons.length > 0) {
                this._dropWrapper.setStyle("width", "auto");
                for (i = 0; i < displayedButtons.length; i++) {
                    displayedButtons[i].getViewNode().inject(this._dropContainer, "bottom");
                }
                this._setDropListPositions(displayedButtons);
                this._menu.arrangeDropButtons(displayedButtons);
                this._dropDownNeedsClosing = false;
                this._releasePreviousOwner();
                this._dropOwnerButton = ownerButton;
                this._dropButtons = displayedButtons;
                this._dropOwnerButton.setDropdownOpen(true);
                // make the dropdown container visible
                this._dropWrapper.setStyle("display", "block");
                this._dropWrapper.setStyle("opacity", "1");
                this._arrangeDropDown();
                // TODO: Use core to set the drop down above all components. The below code is considered a temporary hack, by orders of sir Rosenthal.
                this._dropWrapper.setStyle("z-index", "99999");
                // z-index hack ends here.
            }
        },

        // set the list positions of the buttons in the dropdown (sub level 1)
        _setDropListPositions: function (buttons) {
            var i;
            var button;
            var position;
            var lonely = buttons.length == 1;
            for (i = 0; i < buttons.length; i++) {
                button = buttons[i];
                if (i === 0) {
                    if (!lonely) {
                        position = "top";
                    } else {
                        position = "dropLonely";
                    }
                } else if (!lonely && i == buttons.length - 1) {
                    position = "bottom";
                } else {
                    position = "dropCenter";
                }
                button.getViewNode().setProperty("listposition", position);
                button.getViewNode().setProperty("container", "drop");
            }
        },

        closeDropDown:function(force){
            if (force || this._dropDownNeedsClosing){
                this._releasePreviousOwner();
                //this._dropContainer.setStyle("visibility", "inherit");
                this._dropWrapper.setStyle("display", "none");
                this._dropWrapper.setStyle("opacity", "0");
                this._dropDownNeedsClosing = false;

            }
        },

        _releasePreviousOwner:function(){
            if (this._dropOwnerButton){
                this._dropOwnerButton.setDropdownOpen(false);
                this.injects().Utils.forceBrowserRepaint(this._dropOwnerButton.getViewNode());
                this._dropOwnerButton = null;
            }
        },

        _closeDropDownTimer:function(){
            this.injects().Utils.clearCallLater(this._closeTimerID);
            this._closeTimerID = this.injects().Utils.callLater(this.closeDropDown, [], this, 500);
        },

        _arrangeDropDown:function(){
            var ownerPosition = this._dropOwnerButton.getViewNode().getProperty("listPosition");
            this._dropWrapper.setProperty("dropHPosition", ownerPosition);
            this._setDropDownWidth();
            this._setDropDownPosition();
        },

        _setDropDownWidth:function(){
            // merged from experiment wysiwyg.viewer.components.menus.DropDownController.FixMoreButton.New
            var i;
            var button;
            var widest = this._dropOwnerButton.getMinimalDropdownWidth();

            for (i=0; i<this._dropButtons.length; i++){
                button = this._dropButtons[i];
                widest = Math.max(widest, button.getMinimalWidth());
            }

            var dropExtraPixels = this._menu.getMenuExtraPixels(true);
            this._dropWrapper.setStyle("width", dropExtraPixels.left+dropExtraPixels.right+widest+"px");
        },

        _setDropDownPosition: function () {
            this._dropWrapper.setStyle("text-align", this._menu.getComponentProperty("alignText"));
            for (var i = 0; i < this._dropButtons.length; i++) {
                var button = this._dropButtons[i];
                button.setPadding(0);
                button.alignText();
            }
            this._setHorizontalPosition();
            this._setVerticalPosition();
        },

        _setHorizontalPosition:function(){
            // set the position of the container to be under the owner button
            // Use the menu's alignButton property to decide how it aligns against the owner button.
            var ownerOffset = this._dropOwnerButton.getOffsetLeft();
            var alignButtons = this._menu.getComponentProperty("alignButtons");
            this._dropWrapper.setProperty("dropAlign", alignButtons);
            var leftPosition = "0px";
            var rightPosition = "auto";
            var menuExtraPixels = this._menu.getMenuExtraPixels(true);
            var ownerPosition = this._dropOwnerButton.getViewNode().getProperty("listPosition");
            if (alignButtons=="left"){
                // The reason for this "if" is that the border of the menu affects only the first button (i.e. if we align to the first button, we actually align to the border and therefore don't need to add it to our offset)
                if (ownerPosition=="left"){
                    leftPosition = 0;
                }else{
                    leftPosition = (ownerOffset+menuExtraPixels.left)+"px";
                }
            }else
            if (alignButtons=="right"){
                // Again, in the right most button's case, we'll align to the border and not the button itself.
                if (ownerPosition=="right"){
                    rightPosition = 0;
                }else{
                    rightPosition = (this._menu.getWidth() - ownerOffset - this._dropOwnerButton.getOffsetWidth() - menuExtraPixels.right)+"px";
                }
                leftPosition = "auto";
            }else{ // center
                // Center alignment is a little more complex, because we need to treat the edge buttons as if their width include the container's border, and the center button as if their offset includes the container's border.
                var add = 0;
                if (ownerPosition=="left"){
                    leftPosition = ownerOffset + ((this._dropOwnerButton.getOffsetWidth() + menuExtraPixels.left) - this._dropWrapper.offsetWidth)/2+"px";
                }else
                if (ownerPosition=="right"){
                    leftPosition = "auto";
                    rightPosition = ((this._dropOwnerButton.getOffsetWidth() + menuExtraPixels.right) - parseInt(this._dropWrapper.getStyle('width'), 10))/2+"px";
                }else{
                    leftPosition = menuExtraPixels.left+ ownerOffset + ((this._dropOwnerButton.getOffsetWidth()) - this._dropWrapper.offsetWidth)/2+"px";
                }
            }
            this._dropWrapper.setStyle("left", leftPosition);
            this._dropWrapper.setStyle("right", rightPosition);

        },

        _setVerticalPosition:function(){
            // set the y axis (if there's no room on the bottom, open it up instead of down)
            var verticalPosition = "dropDown";

            if (this._needsToOpenUp()){
                verticalPosition = "dropUp";
                this._dropWrapper.setStyle("bottom", this._menu.getHeight()+"px");
            }else{
                this._dropWrapper.setStyle("bottom", "auto");
            }
            this._dropWrapper.setProperty("dropMode", verticalPosition);
        },

        _needsToOpenUp:function(){
            // Dropdown opens up if the menu is located at the lower half of the screen

            // Not working in ie8 - always return false (open down) for ie8
            if (navigator.userAgent.match(/MSIE 8.0/)) {
                return false;
            }
            var result = true;
            var viewPortHeight = window.innerHeight;
            var el = this._menu.getViewNode();
            var absTop = 0;
            do {
                absTop += el.offsetTop;
                el = el.offsetParent;
            } while (el != null);
            var menuVisualPosition = absTop - document.body.getScroll().y;
            if (menuVisualPosition <= viewPortHeight / 2) {
                result = false; // open down
            }
            return result;
        },


        _onItemsContainerOver:function(e){
            var button = this._findLogicParent(e.target);
            if (this._isValidButtonForDropDown(button)){
                if (button.children.length>0){
                    this.openDropDown(button, button.children);
                    e.stopPropagation();
                }

            }
        },

        _onItemsContainerOut:function(e){
            var button = this._findLogicParent(e.target);
            if (button && button==this._dropOwnerButton){
                this._dropDownNeedsClosing = true;
                this._closeDropDownTimer();
            }
        },

        _onMoreContainerOver:function(e){
            this._dropDownNeedsClosing = false;
        },

        _onMoreContainerOut:function(e){
            this._dropDownNeedsClosing = true;
            this._closeDropDownTimer();
        },

        // closes dropdown menu in mobile and tablet after click
        _onMoreContainerClick: function(e) {
            this._dropDownNeedsClosing = true;
            this._closeDropDownTimer();
        },

        _onItemsContainerClick: function(e) {
            var button = this._findLogicParent(e.target);
            if (this._isValidButtonForDropDown(button)) {
                // open if hidden
                if (!this._dropWrapper.isDisplayed() && this._dropOwnerButton !== button) {
                    if (!this._allSubMenuItemsHidden(button.children)) {
                        this._onItemsContainerOver(e);
                        return;
                    }
                }
                // close previous dropdown and open current buttons dropdown
                else if (this._dropWrapper.isDisplayed() && this._dropOwnerButton !== button && !this._allSubMenuItemsHidden(button.children)) {
                    this._onMoreContainerClick();
                    e.stopPropagation();
                    this._onItemsContainerOver(e);
                }
                else {
                    this._onMoreContainerClick(); // hide
                }
            }
        },

        _allSubMenuItemsHidden: function(buttons) {
            var allHidden = true;
            if (buttons.length > 0) {
                _.forEach(buttons, function(btn) {
                    if(!btn.isHidden()) {
                        allHidden = false;
                    }
                });
            }
            return allHidden;
        },

        _findLogicParent: function (root) {
            var found = false;
            while (found === false) {
                var isLogic = false;
                var logic;
                found = true;
                try {
                    // in ie8, hasOwnProperty explodes. Therefore just call getLogic, and if there's an exception, it means we didn't find the logic
                    if (navigator.userAgent.match(/MSIE 8.0/)) {
                        logic = root.getLogic();
                    } else {
                        // If we're not in IE8, we can avoid the exception by checking to see that we hav the function.
                        if (root.hasOwnProperty("getLogic") && root.getLogic()) {
                            logic = root.getLogic();
                        } else {
                            found = false;
                        }
                    }
                } catch (e) {
                    found = false;
                }
                if (found === false) {
                    root = root.getParent();
                    if (!root) {
                        found = true;
                    }
                } else {
                    root = logic;
                }
            }
            return root;
        },

        _isValidButtonForDropDown:function(button){
            if (button && button.className=="core.components.MenuButton"){
                return true;
            }
            return false;
        }


    });

});

