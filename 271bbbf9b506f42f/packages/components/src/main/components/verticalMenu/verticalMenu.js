define([
    'zepto',
    'lodash',
    'react',
    'core',
    'utils',
    'components/components/verticalMenu/verticalMenuItem',
    'reactDOM'
], function($, _, React, /** core */core, utils, verticalMenuItem, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;

    var verticalMenuItemInstance = React.createFactory(React.createClass(verticalMenuItem));

    function getScreenHeight() {
        return window.innerHeight || window.document.documentElement.clientHeight || window.document.body.clientHeight;
    }

    function getOpenDirection(menuPosY) {
        var viewPortHeight = getScreenHeight(),
            viewPortMiddle = Math.floor(viewPortHeight / 2);

        return viewPortMiddle > menuPosY ? 'down' : 'up';
    }

    function onMouseClick(event) {
        var liParent = getLIParent(event.target);
        var newHoverId = liParent.id;
        var hasVisibleItems = $(liParent).find('ul')[0].children.length > 0;
        var isAlreadyHovered = newHoverId === this.state.hoverId;

        if (hasVisibleItems) {
            if (isAlreadyHovered) {
                this.setState({hoverId: null});
            } else {
                this.setState({hoverId: newHoverId});
                event.preventDefault();
            }
        } else {
            this.setState({hoverId: null});
        }
    }

    function onMouseEnter(event) {
        var hoveredNodeId = getLIParent(event.target).id;
        if (hoveredNodeId !== this.state.hoverId) {
            this.setState({hoverId: hoveredNodeId});
        }
    }

    function onMouseLeave() {
        this.setState({hoverId: null});
    }

    function getLIParent(node) {
        while (node.tagName !== 'LI') {
            node = node.parentElement;
        }

        return node;
    }

    /**
     * @class components.verticalMenu
     * @extends {core.skinBasedComp}
     * @extends {core.skinInfo}
     */
    return {
        displayName: 'VerticalMenu',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],
        getInitialState: function () {
            return {
                $subMenuOpenSide: 'subMenuOpenSide-' + this.props.compProp.subMenuOpenSide,
                $subMenuOpenDirection: 'subMenuOpenDir-up',
                $itemsAlignment: 'items-align-' + this.props.compProp.itemsAlignment,
                $subItemsAlignment: 'subItems-align-' + this.props.compProp.itemsAlignment,
                hoverId: null
            };
        },
        componentWillReceiveProps: function (nextProps) {
            if (nextProps.compProp.itemsAlignment !== this.props.compProp.itemsAlignment) {
                this.setState({$itemsAlignment: 'items-align-' + nextProps.compProp.itemsAlignment,
                    $subItemsAlignment: 'subItems-align-' + nextProps.compProp.itemsAlignment});
            }
            if (nextProps.compProp.subMenuOpenSide !== this.props.compProp.subMenuOpenSide) {
                this.setState({$subMenuOpenSide: 'subMenuOpenSide-' + nextProps.compProp.subMenuOpenSide});
            }
        },
        updateDirection: function () {
            var top = this.props.siteData.measureMap && this.props.siteData.measureMap.absoluteTop[this.props.id] || this.props.style.top;
            var openDirection = 'subMenuOpenDir-' + getOpenDirection(top - window.pageYOffset);
            if (openDirection !== this.state.$subMenuOpenDirection) {
                this.setState({$subMenuOpenDirection: openDirection});
            }
        },
        updateDOMDataAttributes: function () {
            var domNode = ReactDOM.findDOMNode(this);
            var params = this.getParamValues();
            this.lastParams = params;
            this.updateDirection();
            domNode.setAttribute('data-param-border', params.border);
            domNode.setAttribute('data-param-separator', params.separator);
            domNode.setAttribute('data-param-padding', params.padding);
        },
        componentDidMount: function () {
            this.updateDOMDataAttributes();
        },
        componentDidUpdate: function () {
            if (!_.isEqual(this.getParamValues(), this.lastParams)) {
                this.updateDOMDataAttributes();
            }
        },
        getParamValues: function () {
            var separatorParam = this.getParamFromDefaultSkin('separatorHeight') || this.getParamFromDefaultSkin('sepw');
            var paddingParam = this.getParamFromDefaultSkin('textSpacing');
            var borderParam = this.getParamFromDefaultSkin('brw');

            return {
                separator: separatorParam ? parseInt(separatorParam.value, 10) : 0,
                border: borderParam ? parseInt(borderParam.value, 10) : 0,
                padding: paddingParam ? parseInt(paddingParam.value, 10) : 0
            };
        },
        getSkinProperties: function () {
            var params = this.getParamValues();
            var skinExports = this.getSkinExports();
            var siteMenu = utils.menuUtils.getSiteMenuWithRender(this.props.siteData, false, this.props.rootNavigationInfo);
            var itemsCount = utils.verticalMenuCalculations.getVisibleItemsCount(siteMenu);
            var itemHeight = utils.verticalMenuCalculations.getItemHeight(this.props.style.height, params.separator, itemsCount, skinExports);
            return {
                "": {
                    onMouseEnter: this.updateDirection
                },
                menuContainer: {
                    parentConst: verticalMenuItemInstance,
                    data: siteMenu,
                    skin: this.props.skin,
                    classPrefix: this.props.styleId,
                    currentUrlPageId: this.props.currentUrlPageId,
                    heights: {
                        separator: skinExports && skinExports.separatorNotIncludedInLineHeight ? 0 : params.separator,
                        line: utils.verticalMenuCalculations.getLineHeight(itemHeight, params.separator, params.border, skinExports),
                        item: itemHeight
                    },
                    callbacks: {
                        click: onMouseClick.bind(this),
                        enter: onMouseEnter.bind(this),
                        leave: onMouseLeave.bind(this)
                    },
                    hoverId: this.state.hoverId,
                    isDesktop: !(this.props.siteData.mobile.isMobileDevice() || this.props.siteData.mobile.isTabletDevice()),
                    isIE: !!this.props.siteData.getBrowser().ie
                }
            };
        }
    };
});
