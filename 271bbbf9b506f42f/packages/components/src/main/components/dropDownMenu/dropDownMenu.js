define(['lodash', 'reactDOM', 'utils', 'core', 'zepto'
], function (_, ReactDOM, utils, /** core */ core, $) {
    'use strict';

    var mixins = core.compMixins;
    var menuUtils = utils.menuUtils;

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function getVisibleMenuItems(menuItemsData) {
        return _.filter(menuItemsData, 'isVisible');
    }

    function calculateLineHeight(overrideLineHeight, menuHeight, paramsFromSkins) {
        return overrideLineHeight ? "100%" :
            utils.style.unitize(menuHeight - paramsFromSkins.menuBorderY - paramsFromSkins.labelPad - paramsFromSkins.ribbonExtra - paramsFromSkins.ribbonEls - paramsFromSkins.menuBtnBorder);
    }

    function createItemsToShowOnMore(itemsArr, measureMap, id) {
        var items = _.cloneDeep(itemsArr);
        if (!measureMap || !measureMap.custom[id]) {
            return items;
        }
        var isMoreShown = measureMap.custom[id].isMoreShown;
        var realWidths = measureMap.custom[id].realWidths;
        if (!isMoreShown) {
            return items;
        }
        var firstIndexThatIsHidden = realWidths.indexOf(0);
        items = items.splice(firstIndexThatIsHidden);
        return items;

    }

    function decideOnMenuPosition(id, measureMap, menuItemsIds, hoveredId, hoveredListPosition, menuHeight, alignButtons, hoveredItem, moreContainerWidth, siteData) {

        var menuItemsIdsWithMore = menuItemsIds.concat("__more__");
        var customMeasure = measureMap.custom[id];
        var realWidths = customMeasure.realWidths;
        var extraPixels = customMeasure.menuItemContainerExtraPixels;
        var menuWidth = measureMap.width[id];
        var hoverIndex = _.findIndex(menuItemsIdsWithMore, function (itemId) {
            return itemId === hoveredId;
        });

        if (hoverIndex >= 0 && realWidths) {
            var siteX = Math.abs(siteData.getSiteX());
            var menuLeft = siteX + measureMap.absoluteLeft[id];
            var menuRight = menuLeft + menuWidth;

            var menuPosition = getMenuPosition(extraPixels, alignButtons, moreContainerWidth, menuWidth, hoveredListPosition, hoveredItem, menuLeft, menuRight, measureMap.clientWidth);

            return {
                left: menuPosition.moreContainerLeft,
                right: menuPosition.moreContainerRight,
                bottom: customMeasure.needToOpenMenuUp ? menuHeight + "px" : "auto"
            };
        }
    }

    function getMenuPosition(menuExtraPixels, alignButtons, moreContainerWidth, menuWidth, hoveredListPosition, hoveredItem, menuLeft, menuRight, clientWidth) {

        var moreContainerLeft = "0px";
        var moreContainerRight = "auto";
        var hoveredNode = ReactDOM.findDOMNode(hoveredItem);
        var hitArea = hoveredItem.refs.hitArea ? ReactDOM.findDOMNode(hoveredItem.refs.hitArea) : null;
        var hoveredNodeLeftOffset = hoveredNode.offsetLeft + (hitArea ? hitArea.offsetLeft : 0);
        var hoveredNodeWidthOffset = hitArea && hitArea.offsetWidth || hoveredNode.offsetWidth;
        if (alignButtons === "left") {
            if (hoveredListPosition === "left") {
                moreContainerLeft = 0;
            } else {
                moreContainerLeft = (hoveredNodeLeftOffset + menuExtraPixels.left) + "px";
            }
        } else if (alignButtons === "right") {
            if (hoveredListPosition === "right") {
                moreContainerRight = 0;
            } else {
                moreContainerRight = (menuWidth - hoveredNodeLeftOffset - hoveredNodeWidthOffset - menuExtraPixels.right) + "px";
            }
            moreContainerLeft = "auto";
        } else if (hoveredListPosition === "left") {  //center
            moreContainerLeft = hoveredNodeLeftOffset + ((hoveredNodeWidthOffset + menuExtraPixels.left) - moreContainerWidth) / 2 + "px";
        } else if (hoveredListPosition === "right") {
            moreContainerLeft = "auto";
            moreContainerRight = ((hoveredNodeWidthOffset + menuExtraPixels.right) - (moreContainerWidth + menuExtraPixels.width)) / 2 + "px";
        } else {
            moreContainerLeft = menuExtraPixels.left + hoveredNodeLeftOffset + (hoveredNodeWidthOffset - (moreContainerWidth + menuExtraPixels.width)) / 2 + "px";
        }

        if (moreContainerLeft !== 'auto') {
            var subMenuLeft = menuLeft + parseInt(moreContainerLeft, 10);
            moreContainerLeft = subMenuLeft < 0 ? 0 : moreContainerLeft;
        }

        if (moreContainerRight !== 'auto') {
            var subMenuRight = menuRight - parseInt(moreContainerRight, 10);
            moreContainerRight = subMenuRight > clientWidth ? 0 : moreContainerRight;
        }

        return {moreContainerLeft: moreContainerLeft, moreContainerRight: moreContainerRight};
    }

    function getLabelLineHeight(moreContainer, paramsFromSkins) {
        if (moreContainer.childElementCount > 0) {
            var p = $(moreContainer.firstChild).find("p");
            if (p) {
                var currentLineHeight = parseInt(window.getComputedStyle(p[0]).lineHeight, 10);
                return currentLineHeight + 15 + paramsFromSkins.menuBorderY + paramsFromSkins.labelPad + paramsFromSkins.menuBtnBorder;
            }
        }
        return 0;
    }

    function getButtonPositionInList(menuPages, dropDown, stretch, buttonAlign, rtl, index) {
        if (index === (menuPages.length - 1)) {
            if (menuPages.length === 1) {
                return "dropLonely";
            }
            if (dropDown) {
                return "bottom";
            }
            if (!stretch && buttonAlign !== 'right') {
                return 'center';
            }
            return rtl ? 'left' : 'right';
        }
        if (index === 0) {
            if (dropDown) {
                return "top";
            }
            if (!stretch && buttonAlign !== "left") {
                return 'center';
            }
            return rtl ? 'right' : 'left';
        }
        return dropDown ? "dropCenter" : "center";
    }

    function getMenuItemIsSelectedPredicat(siteData, menuPages, siteAPI) {
        var currentUrlPageId = siteData.getCurrentUrlPageId();
        var openedPopupId = siteData.getCurrentPopupId();
        var hasLinkToOpenedPopup = _.some(menuPages, 'link.pageId.id', openedPopupId);
        var activeAnchor;
        var isSelectedMap = {
            'AnchorLink': function (link) {
                return (_.has(link.anchorDataId, 'id') ? link.anchorDataId.id : link.anchorDataId) === activeAnchor;
            },
            'PageLink': function (link) {
                if (!activeAnchor) {
                    if (link.pageId.isPopup) {
                        return link.pageId.id === openedPopupId;
                    } else if (!hasLinkToOpenedPopup){
                        return link.pageId.id === currentUrlPageId;
                    }
                }

                return false;
            }
        };

        if (menuUtils.shouldHighlightAnchorInPage(siteData)) {
            activeAnchor = utils.menuUtils.getActiveAnchorInPage(siteAPI, menuPages, siteData);
        }

        return function (link) {
            var isSelectedPredicate = link && isSelectedMap[link.type];

            return isSelectedPredicate ? isSelectedPredicate(link) : false;
        };
    }

    function getMenuBtnState (siteAPI, menuPages, dropDown, stretch, buttonAlign, siteData, rtl) {
            return _.map(menuPages, function (item, index) {
                var link = item.link;
                var isSelected = getMenuItemIsSelectedPredicat(siteData, menuPages, siteAPI);

                return {
                    isContainer: Boolean(dropDown),
                    isSelected: isSelected(link),
                    positionInList: getButtonPositionInList(menuPages, dropDown, stretch, buttonAlign, rtl, index)
                };
            });
        }

    /**
     * @class components.DropDownMenu
     * @extends {core.skinBasedComp}
     * @extends {core.timeoutsMixin}
     * @extends {core.skinInfo}
     */
    return {
        displayName: 'DropDownMenu',
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, mixins.skinInfo],
        getInitialState: function () {
            this.shouldChildrenUpdate = false;

            return {
                hover: null,
                hoverListPosition: null,
                activeAnchor: null,
                $dropAlign: this.props.compProp.alignButtons,
                $mobile: (this.props.siteData.isMobileDevice() || this.props.siteData.isMobileView() || this.props.siteData.isTabletDevice()) ? "mobile" : "notMobile"
            };
        },
        componentDidMount: function () {
            if (menuUtils.shouldHighlightAnchorInPage(this.props.siteData)) {
                var siteAPI = this.props.siteAPI;
                siteAPI.getSiteAspect('anchorChangeEvent').registerToAnchorChange(this);
            }
        },
        componentDidUpdate: function () {
            var moreContainer = ReactDOM.findDOMNode(this.refs.moreContainer);
            var menuItemsIds = menuUtils.nonHiddenPageIdsFromMainMenu(this.props.siteData);
            var subItemsIndex = menuItemsIds.indexOf(this.state.hover);
            var measureMap = this.props.siteData.measureMap;
            if (isNumber(this.state.hover) || this.state.hover === "__more__") {
                if (!measureMap || !measureMap.custom[this.props.id]) {
                    return;
                }
                var measureMapRealWidths = measureMap.custom[this.props.id].realWidths;
                if (!measureMapRealWidths) {
                    return;
                }

                var $moreContainer = $(moreContainer);
                var $children = $moreContainer.children();
                var $p = $children.find("p");

                $p.css({"line-height": "100%"});
                $children.css({"min-width": "0px"});

                var hoveredItem = this.refs[this.state.hover];
                var hitArea = hoveredItem.refs.hitArea ? ReactDOM.findDOMNode(hoveredItem.refs.hitArea) : null;
                var hitAreaOffset = hitArea ? hitArea.offsetLeft : 0;

                var measureMapRealWidth;
                if (subItemsIndex !== -1) {
                    measureMapRealWidth = measureMapRealWidths[subItemsIndex];
                } else {
                    measureMapRealWidth = measureMapRealWidths[measureMapRealWidths.length - 1];
                }
                measureMapRealWidth -= hitAreaOffset;

                var moreContainerWidth = Math.max(moreContainer.offsetWidth, measureMapRealWidth);
                var menuPosition = decideOnMenuPosition(this.props.id, measureMap, menuItemsIds, this.state.hover, this.state.hoverListPosition, this.props.style.height, this.props.compProp.alignButtons, hoveredItem, moreContainerWidth, this.props.siteData);
                var newSubItemsLineHeight = getLabelLineHeight(moreContainer, this.getParamsFromSkins());
                $moreContainer.css({left: menuPosition.left, right: menuPosition.right});
                $moreContainer.parent().css({
                    left: menuPosition.left,
                    right: menuPosition.right,
                    bottom: menuPosition.bottom
                });
                $children.css({"min-width": moreContainerWidth + "px"});
                $p.css({"line-height": newSubItemsLineHeight + "px"});
            }
        },
        componentWillUnmount: function () {
            if (menuUtils.shouldHighlightAnchorInPage(this.props.siteData)) {
                this.props.siteAPI.getSiteAspect('anchorChangeEvent').unregisterToAnchorChange(this);
            }
        },
        convertItemsToChildren: function (items, childBase, overrideLineHeight, dropDown, paramsFromSkins) {
            var menuPages = getVisibleMenuItems(items);
            childBase = childBase || {};
            childBase.style = childBase.style || {};

            var cssStates = getMenuBtnState(this.props.siteAPI, menuPages, dropDown, this.props.compProp.stretchButtonsToMenuWidth, this.props.compProp.alignButtons, this.props.siteData, this.props.compProp.rtl);

            return _.map(menuPages, function (item, index) {
                var key = (dropDown ? this.state.hover : "") + (childBase.prefix || "") + index;
                return this.createChildComponent(item, "core.components.MenuButton",
                    "repeaterButton",
                    _.merge({
                        isContainer: cssStates[index].isContainer,
                        isSelected: cssStates[index].isSelected,
                        positionInList: cssStates[index].positionInList,
                        id: this.props.id + key,
                        ref: key,
                        key: key,
                        refInParent: key,
                        lineHeight: calculateLineHeight(overrideLineHeight, this.props.style.height, paramsFromSkins),
                        mouseEnterHandler: this.mouseEnterHandler,
                        mouseLeaveHandler: this.mouseLeaveHandler,
                        isDropDownButton: dropDown,
                        onMouseClick: this.onMouseClick,
                        menuBtnPageId: (item.link && item.link.type === 'PageLink' && item.link.pageId) ? item.link.pageId.id : ""
                    }, childBase));
            }, this);
        },
        onMouseClick: function (event, ref, isSubMenuButton) {
            var compDataVisiblePages = getVisibleMenuItems(menuUtils.getSiteMenuWithRender(this.props.siteData, false, this.props.rootNavigationInfo));
            if (!isSubMenuButton) {
                var visibleSubItems = [];
                if (ref !== "__more__") {
                    var subItems = compDataVisiblePages[ref].items;
                    visibleSubItems = getVisibleMenuItems(subItems);
                }
                var hasChildren = visibleSubItems.length > 0 || ref === "__more__";
                var currentDropdownOwnerRef = this.state.hover;
                if (!this.dropDownOpen && hasChildren) {
                    this.mouseEnterHandler(ref);
                    event.preventDefault();
                    event.stopPropagation();
                } else if (this.dropDownOpen && !this.isDropdownOwner(ref, currentDropdownOwnerRef) && hasChildren) {
                    this.mouseLeaveHandler();
                    event.preventDefault();
                    event.stopPropagation();
                    this.mouseEnterHandler(ref);
                } else if (this.dropDownOpen) {
                    this.mouseLeaveHandler();
                }
            } else {
                this.mouseLeaveHandler();
            }
        },

        onAnchorChange: function (newActiveAnchor) {
            if (newActiveAnchor !== this.state.activeAnchor) {
                this.setState({activeAnchor: newActiveAnchor});
            }
        },

        isDropdownOwner: function (currentClickRef, openDropdownOwnerRef) {
            return currentClickRef === openDropdownOwnerRef;
        },
        createMoreButton: function (paramsFromSkins, rtl) {
            var itemId = "__more__";
            var positionInList = rtl ? "left" : "right";
            var buttonAlign = this.props.compProp.alignButtons;
            var stretch = this.props.compProp.stretchButtonsToMenuWidth;
            if (!stretch && buttonAlign !== "right") {
                positionInList = "center";
            }
            return this.createChildComponent({id: itemId, label: this.props.compProp.moreButtonLabel},
                "core.components.MenuButton",
                "repeaterButton",
                {
                    isSelected: false,
                    positionInList: positionInList,
                    id: this.props.id + itemId,
                    ref: itemId,
                    lineHeight: calculateLineHeight(false, this.props.style.height, paramsFromSkins),
                    mouseEnterHandler: this.mouseEnterHandler,
                    mouseLeaveHandler: this.mouseLeaveHandler,
                    onMouseClick: this.onMouseClick,
                    isDropDownButton: false,
                    menuBtnPageId: "",
                    display: "inline-block"
                });
        },
        mouseEnterHandler: function (childId, hoverListPos) {
            this.hovering = true;
            this.lastHovered = this.getCurrentTime();
            var newHoverChildId = childId.replace(this.props.id, "");
            var menuItemsIds = menuUtils.nonHiddenPageIdsFromMainMenu(this.props.siteData).concat("__more__");
            var childIndex = menuItemsIds.indexOf(newHoverChildId);
            if ((childIndex !== -1 && (isNumber(newHoverChildId) || utils.stringUtils.startsWith(childId, "__"))) && childId !== this.state.hover) {
                if (this.state.hover) {
                    this.refs[this.state.hover].setIdleState();
                }
                this.registerReLayout(); //needed in order to calculate if the hover is opened up/down
                this.setState({hover: childId, hoverListPosition: hoverListPos});
            }
        },
        getCurrentTime: function () {
            return Date.now();
        },
        mouseLeaveHandler: function () {
            this.hovering = false;
            this.lastHovered = this.getCurrentTime();
            if (!this.dropDownOpen && this.state.hover) {
                this.refs[this.state.hover].setIdleState();
            }
            this.setTimeout(function () {
                var timeSinceLastHovered = this.getCurrentTime() - this.lastHovered;
                if (!this.hovering && this.state.hover && timeSinceLastHovered >= 1000) {
                    this.refs[this.state.hover].setIdleState();
                    this.dropDownOpen = false;
                    this.setState({hover: null, hoverListPosition: null});
                }
            }.bind(this), 1000);
        },
        getParamsFromSkins: function () {
            return {
                menuBorderY: this.getSumParamValue("menuTotalBordersY", this.props.skin),
                menuBtnBorder: this.getSumParamValue("menuButtonBorders", this.getSkinExports().repeaterButton.skin),
                ribbonEls: this.getParamFromDefaultSkin("ribbonEls").value ? parseInt(this.getParamFromDefaultSkin("ribbonEls").value, 10) : 0,
                labelPad: this.getFromExports("labelPad"),
                ribbonExtra: this.getFromExports("ribbonExtra") ? (Math.abs(parseInt(this.getFromExports("ribbonExtra"), 10))) : 0
            };
        },
        getSkinProperties: function () {
            var compDataVisiblePages = getVisibleMenuItems(menuUtils.getSiteMenuWithRender(this.props.siteData, false, this.props.rootNavigationInfo));
            var paramsFromSkins = this.getParamsFromSkins();
            var children = this.convertItemsToChildren(compDataVisiblePages, {display: "inherit"}, null, null, paramsFromSkins);
            var hoverChildren = [];
            var moreVisibility = "hidden";
            children.push(this.createMoreButton(paramsFromSkins, this.props.compProp.rtl));
            if (this.props.compProp.rtl) {
                children.reverse();
            }
            if (isNumber(this.state.hover) || this.state.hover === "__more__") {
                var measureMap = this.props.siteData.measureMap;
                hoverChildren = this.convertItemsToChildren(isNumber(this.state.hover) ? compDataVisiblePages[this.state.hover].items : createItemsToShowOnMore(compDataVisiblePages, measureMap, this.props.id), {
                    style: {width: "100%"},
                    display: "block",
                    prefix: "_",
                    subMenu: true
                }, true, true, paramsFromSkins);
                if (hoverChildren.length > 0) {
                    moreVisibility = "inherit";
                    this.dropDownOpen = true;
                }
            }
            return {
                "": {
                    id: this.props.id,
                    key: this.props.refInParent,
                    ref: this.props.refInParent,
                    'data-menuborder-y': paramsFromSkins.menuBorderY,
                    'data-menubtn-border': paramsFromSkins.menuBtnBorder,
                    'data-ribbon-els': paramsFromSkins.ribbonEls,
                    'data-label-pad': paramsFromSkins.labelPad,
                    'data-ribbon-extra': paramsFromSkins.ribbonExtra
                },
                "itemsContainer": {
                    children: children,
                    style: {
                        height: this.props.style.height - paramsFromSkins.menuBorderY - paramsFromSkins.ribbonExtra - paramsFromSkins.ribbonEls,
                        display: "inline-block",
                        textAlign: this.props.compProp.alignButtons,
                        overflow: "visible"
                    }
                },
                "back": {
                    style: {
                        height: this.props.style.height - paramsFromSkins.menuBorderY - paramsFromSkins.labelPad
                    }
                },
                "moreContainer": {
                    children: hoverChildren,
                    "data-hover": this.state.hover,
                    style: {visibility: moreVisibility}
                },
                "dropWrapper": {
                    style: {visibility: moreVisibility},
                    "data-drophposition": this.state.hover ? this.state.hoverListPosition : "",
                    "data-dropalign": this.props.compProp.alignButtons
                }
            };
        }

    };
});
