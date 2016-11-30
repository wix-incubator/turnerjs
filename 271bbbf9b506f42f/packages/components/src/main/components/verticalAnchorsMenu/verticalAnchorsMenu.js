define(['zepto',
    'lodash',
    'react',
    'utils',
    'santaProps',
    'components/components/verticalAnchorsMenu/verticalAnchorsBaseMenu',
    'components/components/verticalMenu/verticalMenu',
    'components/bi/events'], function
    ($, _, React, utils,
     santaProps,
     verticalAnchorsBaseMenu,
     verticalMenu,
     biEvents) {
    'use strict';

    var ANCHOR_BI_DELAY_SECONDS = [3, 6, 10];

    var anchorBiIds = [];

    var anchorsUtils = utils.scrollAnchors;

    var verticalAnchorsBaseMenuClass = React.createClass(verticalAnchorsBaseMenu);
    var verticalMenuClass = React.createClass(verticalMenu);

    function resolveMenuClass(skin) {
        if (_.includes(skin, 'verticalanchorsmenu')) {
            return verticalAnchorsBaseMenuClass;
        } else if (_.includes(skin, 'verticalmenu')) {
            return verticalMenuClass;
        }
        return React.DOM.div(null, ['AnchorMenuSkin Not Found']);
    }

    function isFullCircleSkin(skinName) {
        return (_.includes(skinName, 'VerticalAnchorsMenuLinkedNoTextSkin'));
    }

    function getHiddenPageAnchorIds(compData, pageId) {
        var hiddenAnchors = null;
        if (compData.hiddenAnchorIds && pageId) {
            hiddenAnchors = compData.hiddenAnchorIds[pageId];
        }
        return hiddenAnchors;
    }

    function reportBI(siteData, siteAPI, activeAnchor) {
        if (activeAnchor) {
            _.forEach(anchorBiIds, function (id) {
                clearTimeout(id);
            });
            anchorBiIds = _.map(ANCHOR_BI_DELAY_SECONDS, function (delay) {
                return setTimeout(function () {
                    siteAPI.reportBI(biEvents.TIME_IN_FOLD, {
                        activeFold: activeAnchor.index,
                        totalFolds: activeAnchor.total,
                        timeInFold: delay
                    });
                }, delay * 1000);
            });
        }
    }

    return {
        displayName: 'VerticalAnchorsMenu',
        propTypes: _.assign(
            {},
            santaProps.santaTypesUtils.getSantaTypesByDefinition(verticalAnchorsBaseMenu),
            santaProps.santaTypesUtils.getSantaTypesByDefinition(verticalMenu)
        ),
        getInitialState: function () {
            var state = {
                isTablet: this.props.siteData.isTabletDevice(),
                activeAnchorId: null
            };

            if (this.props.compProp.autoColor) {
                state.overlappingElementInfo = null;
            }

            return state;
        },
        componentDidMount: function () {
            var scrollY = window && window.pageYOffset;
            var dynamicColorElementsAspect = this.props.siteAPI.getSiteAspect('dynamicColorElements');
            dynamicColorElementsAspect.registerObserver(this.handleDynamicColorElementUpdate);
            this.updateOverlappingElement(scrollY);
            this.props.siteAPI.getSiteAspect('windowScrollEvent').registerToScroll(this);
            this.updateActiveAnchor(scrollY);
        },
        componentWillUnmount: function () {
            this.props.siteAPI.getSiteAspect('windowScrollEvent').unregisterToScroll(this);
            var dynamicColorElementsAspect = this.props.siteAPI.getSiteAspect('dynamicColorElements');
            dynamicColorElementsAspect.unregisterObserver(this.handleDynamicColorElementUpdate);
        },
        componentDidUpdate: function () {
            var scrollY = $(window).scrollTop();
            this.updateActiveAnchor(scrollY);
            this.updateOverlappingElement(scrollY);
        },
        componentDidLayout: function () {
            var scrollY = $(window).scrollTop();
            this.updateActiveAnchor(scrollY);
            this.updateOverlappingElement(scrollY);
        },
        onScroll: function (scrollPosition) {
            var yPos = scrollPosition && scrollPosition.y || 0;
            this.updateActiveAnchor(yPos);
            this.updateOverlappingElement(yPos);
        },
        updateActiveAnchor: function (scrollPosition) {
            var currentPage = this.props.siteData.getPrimaryPageId();
            var hiddenAnchorsIds = getHiddenPageAnchorIds(this.props.compData, currentPage);
            var activeAnchor = anchorsUtils.getActiveAnchor(this.props.siteData, scrollPosition, hiddenAnchorsIds);
            var activeAnchorId = activeAnchor ? activeAnchor.activeAnchorComp.id : null;
            if (this.state.activeAnchorId !== activeAnchorId) {
                reportBI(this.props.siteData, this.props.siteAPI, activeAnchor);
                this.setState({activeAnchorId: activeAnchorId});
            }
        },
        handleDynamicColorElementUpdate: function (updatedDynamicColorElementInfos) {
            if (this.props.compProp.autoColor) {
                var overlappingElementId = _.get(this.state.overlappingElementInfo, 'id');
                var overlappingElementUpdatedInfo = _.find(updatedDynamicColorElementInfos, {id: overlappingElementId});
                if (overlappingElementUpdatedInfo) {
                    this.setState({overlappingElementInfo: overlappingElementUpdatedInfo});
                }
            }
        },
        getOverlappingDynamicElementInfo: function (scrollY) {
            var measureMap = this.props.siteData.measureMap;
            if (!measureMap) {
                return null;
            }

            var menuTop = scrollY + measureMap.absoluteTop[this.props.id];
            var menuHeight = measureMap.height[this.props.id];
            var menuLeft = measureMap.absoluteLeft[this.props.id] + this.props.siteData.getSiteX();
            var menuWidth = measureMap.width[this.props.id];
            var dynamicColorElementsAspect = this.props.siteAPI.getSiteAspect('dynamicColorElements');
            var colorElementsInfo = _.reject(dynamicColorElementsAspect.getInformation(), function (info) {
                    return !info.top || (info.alpha < 0.1);
                });

            var overlappingElementInfo = _(colorElementsInfo)
                .filter(function (elementInfo) {
                    var menuMinTopToOverlapStrip = elementInfo.top - (menuHeight / 2);
                    var menuMaxTopToOverlapStrip = (elementInfo.top + elementInfo.height) - (menuHeight / 2);
                    return (menuTop >= menuMinTopToOverlapStrip) &&
                        (menuTop <= menuMaxTopToOverlapStrip) &&
                        (menuLeft + menuWidth / 2 <= elementInfo.left + elementInfo.width) &&
                        (menuLeft >= elementInfo.left);
                })
                .sortBy(function (elementInfo) {
                    return elementInfo.width * elementInfo.height;
                })
                .first();

            return overlappingElementInfo;
        },
        updateOverlappingElement: function (scrollY) {
            if (this.props.compProp.autoColor) {
                var elementInfo = this.getOverlappingDynamicElementInfo(scrollY);
                var lastElementInfo = this.state.overlappingElementInfo;
                if ((lastElementInfo && lastElementInfo.id) !== (elementInfo && elementInfo.id)) {
                    this.setState({overlappingElementInfo: elementInfo});
                }
            }
        },
        getMenuItems: function () {
            var primaryPageId = this.props.siteData.getPrimaryPageId();
            var pageTopLabel = this.props.compData.pageTopLabel;
            var allAnchors = anchorsUtils.getPageAnchors(this.props.siteData, primaryPageId, pageTopLabel);
            var hiddenAnchors = getHiddenPageAnchorIds(this.props.compData, primaryPageId);
            var filteredAnchors = _.filter(allAnchors, function (anchor) {
                return !_.includes(hiddenAnchors, anchor.compId);
            });
            if (_.size(filteredAnchors) === 0) {
                filteredAnchors.push(allAnchors[0]);
            }
            return filteredAnchors;
        },
        isSelected: function (anchorId) {
            return this.state.activeAnchorId === anchorId;
        },
        render: function () {
            var menuProps = _.assign({}, this.props, {
                isSelectedFn: this.isSelected,
                menuItems: this.getMenuItems(),
                svgShapeName: isFullCircleSkin(this.props.skin) ? 'fullCircle' : 'circle',
                isTablet: this.state.isTablet
            });

            if (this.props.compProp.autoColor && _.get(this, 'props.structure.layout.fixedPosition')) {
                menuProps.overlappingBackgroundElementInfo = this.state.overlappingElementInfo;
            }
            var menuClass = resolveMenuClass(menuProps.skin);
            return React.createElement(menuClass, menuProps);
        }
    };
});
