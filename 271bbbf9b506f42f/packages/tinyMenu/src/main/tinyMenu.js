define([
    'react',
    'lodash',
    'core',
    'tinyMenu/components/tinyMenuItem',
    'reactDOM',
    'santaProps'
], function(
    React,
    _,
    core,
    TinyMenuItem,
    ReactDOM,
    santaProps) {
    'use strict';

        /**
     * @class components.TinyMenu
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "TinyMenu",
        mixins: [core.compMixins.skinBasedComp],

        propTypes: {
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo,
            id: santaProps.Types.Component.id,
            key: santaProps.Types.Component.key,
            style: santaProps.Types.Component.style,
            styleId: santaProps.Types.Component.styleId,
            skin: santaProps.Types.Component.skin,
            currentUrlPageId: santaProps.Types.Component.currentUrlPageId,
            siteWidth: santaProps.Types.siteWidth,
            browserFlags: santaProps.Types.Browser.browserFlags,
            anchorChangeEvent: santaProps.Types.SiteAspects.anchorChangeEvent,
            windowResizeEvent: santaProps.Types.SiteAspects.windowResizeEvent,
            siteScrollingBlocker: santaProps.Types.SiteAspects.siteScrollingBlocker,
            isTinyMenuOpenAllowed: santaProps.Types.RenderFlags.isTinyMenuOpenAllowed,
            siteMenuWithRender: santaProps.Types.Menu.siteMenuWithRender
        },

        statics: {
            useSantaTypes: true
        },

        isForcedOpen: function() {
            return _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState() === 'open';
        },

        getMenuState: function() {
            return this.isForcedOpen() ? "menuOpen" : this.state.menuState;
        },

        isMenuOpen: function() {
            return this.getMenuState() === "menuOpen";
        },

        getInitialState: function () {
            return {menuState: "menuInitial", timestamp: new Date()};
        },

        onOrientationChange: function() {
            this.registerReLayout();
            this.closeMenu();
        },

        onAnchorChange: function (newAnchor) {
            if (newAnchor !== this.state.currentAnchor) {
                this.setState({currentAnchor: newAnchor});
            }
        },

        onMouseClick: function () {
            if (this.isMenuOpen()) {
                this.closeMenu();
            } else {
                this.showMenu();
            }
        },

        onMenuStateChange: function() {
            this.registerReLayout();
            this.forceUpdate();
        },

        closeMenu: function () {
            this.timestamp = new Date();
            if (!this.isMenuOpen()) {
                return;
            }

            this.setState({menuState: "menuClosed"}, (function() {
                this.onMenuStateChange();
            }).bind(this));
        },

        showMenu: function () {
            if (!this.isEmpty) {
                this.setState({menuState: "menuOpen"}, this.onMenuStateChange);
            }
        },

        updateProps: function(props) {
            this.items = props.siteMenuWithRender;
            this.isEmpty = _.every(this.items, {isVisibleMobile: false});
            if (this.isClassicSkin()) {
                var schemaVersion = _.get(this.props, ["compProp", "metaData", "schemaVersion"]);
                this.preserveLegacySize = !schemaVersion || schemaVersion === "1.0";
            }

            this.siteWidth = props.siteWidth;
            this.forceMenuItemsScroll = props.browserFlags.forceOverflowScroll;
            this.animateSVG = props.browserFlags.animateTinyMenuIcon;
        },

        componentWillMount: function() {
            this.props.windowResizeEvent.registerToOrientationChange(this);
            this.props.anchorChangeEvent.registerToAnchorChange(this);
            this.updateProps(this.props);
        },

        componentWillUpdate: function() {
            this.currentAnchor = _.get(this.props.anchorChangeEvent.getActiveAnchor(), ["activeAnchorComp", "id"]);
        },

        isFixed: function() {
            return this.props.style.position === 'fixed';
        },

        isClassicSkin: function() {
            return this.props.skin === "wysiwyg.viewer.skins.mobile.TinyMenuSkin";
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.currentUrlPageId !== nextProps.currentUrlPageId ||
                (this.isMenuOpen() && !nextProps.isTinyMenuOpenAllowed)) {
                this.closeMenu();
            }

            this.updateProps(nextProps);
        },

        componentDidUpdate: function () {
            var isOpen = this.isMenuOpen();
            if (isOpen) {
                ReactDOM.findDOMNode(this.refs.menuContainer).scrollTop = 0;
            }
            if (!this.isClassicSkin() || this.isFixed()) {
                this.props.siteScrollingBlocker.setSiteScrollingBlocked(this, this.isMenuOpen());
            }
        },

        getRootStyle: function () {
            return this.getRootPosition ? {position: this.getRootPosition(this.props.style)} : {};
        },

        getDirection: function() {
            var directionFromCompProps = _.get(this, ["props", "compProp", "direction"], "left");
            return this.getStyleProperty('textAlignment', directionFromCompProps);
        },

        getSkinProperties: function () {
            var isOpen = this.isMenuOpen();
            var styleId = this.props.styleId;
            var classic = this.isClassicSkin();
            var fixed = this.isFixed();
            var stateClass = {};

            var options = {
                styleId: styleId,
                currentPage: this.props.currentUrlPageId,
                clickCallback: this.onMouseClick,
                currentAnchor: this.currentAnchor,
                timestamp: this.timestamp,
                useSeparators: !classic
            };

            var children = TinyMenuItem.buildChildren(this.items, options);
            var dir = 'dir-' + this.getDirection();

            if (classic) {
                stateClass['preserve-legacy-size'] = this.preserveLegacySize;

                if (fixed) {
                    this.props.style.zIndex = isOpen ? 1000 : 1;
                }
            }

            stateClass[this.getMenuState()] = true;
            stateClass[dir] = true;

            return {
                "": {
                    id: this.props.id,
                    key: this.props.key + "_" + this.props.skin,
                    ref: this.props.id,
                    style: this.getRootStyle()
                },

                fullScreenOverlay: {
                    ref: this.props.id + "fullScreenOverlay",
                    className: "fullScreenOverlay " + this.classSet(stateClass),
                    style: {top: 0},
                    onClick: this.closeMenu
                },
                fullScreenOverlayContent: {
                    className: "fullScreenOverlayContent",
                    style: {width: this.siteWidth, top: 0}
                },
                menuBackground: {
                   className: this.classSet(stateClass)
                },

                menuButton: {
                    ref: this.props.id + "menuButton",
                    onClick: this.onMouseClick,
                    className: this.classSet(_.assign({'preserve-legacy-size': this.preserveLegacySize, 'force-open': this.isForcedOpen(), 'no-animation': !this.animateSVG}, stateClass))
                },

                iconSVG: {
                    preserveAspectRatio: isOpen ? '' : "none"
                },

                menuContainer: {
                    children: React.DOM.ul({
                        children: children,
                        className: this.classSet({'top-menu': true, 'open': isOpen, 'force-scroll': this.forceMenuItemsScroll}),
                        ref: 'menuItems', id: this.props.id + 'menuItems'}),
                    className: this.classSet(stateClass)
                }
            };
        }
    };
});
