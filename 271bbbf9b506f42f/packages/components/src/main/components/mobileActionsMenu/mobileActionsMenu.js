define(['lodash', 'react', 'core', 'utils', 'components/bi/events.json', 'components/components/mobileActionsMenu/mobileActionsMenuItem'
], function (_, React, core, utils, biEvents, mobileActionsMenuItem) {
    'use strict';

    function _buildPagesList(items, currentPage, styleId, siteAPI, siteData, closeMenu) {
        function createMenuItemForItem(level, item) {
            return _createPageMenuItem(item, currentPage, level, siteAPI, siteData, styleId, closeMenu);
        }

        return _(items)
            .filter('isVisibleMobile')
            .reduce(function (children, item) {
                var subPages = _(item.items)
                    .filter('isVisibleMobile')
                    .map(createMenuItemForItem.bind(null, 2))
                    .value();
                return children
                    .concat([createMenuItemForItem(1, item)])
                    .concat(subPages);
            }, []);
    }

    function _createPageMenuItem(menuItemData, currentPage, level, siteAPI, siteData, styleId, closeMenu) { //eslint-disable-line react/display-name
        var href = menuItemData.link ? menuItemData.link.render.href : null;
        var label = menuItemData.label;
        var target = href ? "page" : null;
        return React.createElement(mobileActionsMenuItem, {
            label: label,
            href: href,
            target: target,
            "data-anchor": _.get(menuItemData, "link.render.data-anchor"),
            closeMenu: closeMenu,
            level: level,
            hasChildren: menuItemData.items && menuItemData.items.length > 0,
            isSelected: ("#" + currentPage) === menuItemData.link ? menuItemData.link.pageId : false,
            siteAPI: siteAPI,
            siteData: siteData,
            styleId: styleId
        });
    }

    function _buildSocialList(items, styleId, siteAPI, siteData) {
        return _.map(items, function (item) {
            return _createSocialMenuItem(item.id, item.url, siteAPI, siteData, styleId);
        });
    }

    function _createSocialMenuItem(itemId, url, siteAPI, siteData, styleId) { //eslint-disable-line react/display-name
        return React.createElement(mobileActionsMenuItem, {
            label: _getSocialLinkLabel(itemId),
            href: url,
            target: "window",
            siteAPI: siteAPI,
            siteData: siteData,
            styleId: styleId
        });
    }

    function _getSocialLinkLabel(socialId) {
        var socialNameMap = {
            'facebook': 'Facebook',
            'twitter': 'Twitter',
            'pinterest': 'Pinterest',
            'google_plus': 'Google+',
            'tumblr': 'Tumblr',
            'blogger': 'Blogger',
            'linkedin': 'LinkedIn',
            'youtube': 'YouTube',
            'vimeo': 'Vimeo',
            'flickr': 'Flickr',
            '': ''
        };
        return socialNameMap[socialId] || socialId;
    }

    /**
     * @class components.MobileActionsMenu
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "MobileActionsMenu",
        mixins: [core.compMixins.skinBasedComp],

        getInitialState: function () {
            return {
                $display: "closed", // drawer is closed/opened - start opened
                $theme: this.props.userColorScheme || "dark", // dark/light
                $list: "nolist", // current open list (nolist/pages/social),
                zoom: 1
            };
        },

        componentDidLayout: function () {
            _.delay(function () {
                var currentZoom = this.props.siteData.mobile.getInvertedZoomRatio();
                this.setState({
                    zoom: currentZoom
                });
            }.bind(this), 1000);
        },

        getSkinProperties: function () {
            var rootStyle = {};
            var siteMetaData = this.props.siteData.rendererModel.siteMetaData;
            var quickActionsData = siteMetaData.quickActions;

            var pageItems = utils.menuUtils.getSiteMenuWithRender(this.props.siteData, false, this.props.rootNavigationInfo);
            var socialItems = quickActionsData.socialLinks;

            var pagesListChildren = this.state.$list === "pages" ? _buildPagesList(pageItems, this.props.currentUrlPageId, this.props.styleId, this.props.siteAPI, this.props.siteData, this.onListCloseClick) : [];
            var socialListChildren = this.state.$list === "social" ? _buildSocialList(socialItems, this.props.styleId, this.props.siteAPI, this.props.siteData) : [];

            var menuItems = [];

            if (quickActionsData.configuration.navigationMenuEnabled) {
                menuItems.push(React.DOM.li({
                    className: this.props.styleId + "_navigation",
                    onClick: this.onMenuItemClick.bind(this, "pages")
                }, React.DOM.a()));
            }
            if (quickActionsData.configuration.phoneEnabled) {
                menuItems.push(React.DOM.li({
                    className: this.props.styleId + "_phone",
                    onClick: this.onMenuItemClick.bind(this, "phone")
//                        onTouchEnd: function(url){window.open(url);}.bind(this, "tel:" + siteMetaData.contactInfo.phone)
                }, React.DOM.a()));
            }
            if (quickActionsData.configuration.emailEnabled) {
                menuItems.push(React.DOM.li({
                    className: this.props.styleId + "_email",
                    onClick: this.onMenuItemClick.bind(this, "email")
//                        onTouchEnd: function(url){window.open(url);}.bind(this, "mailto:" + siteMetaData.contactInfo.email)
                }, React.DOM.a()));
            }
            if (quickActionsData.configuration.addressEnabled) {
                menuItems.push(React.DOM.li({
                    className: this.props.styleId + "_address",
                    onClick: this.onMenuItemClick.bind(this, "address")
                }, React.DOM.a()));
            }
            if (quickActionsData.configuration.socialLinksEnabled) {
                menuItems.push(React.DOM.li({
                    className: this.props.styleId + "_socialLinks",
                    onClick: this.onMenuItemClick.bind(this, "social")
                }, React.DOM.a()));
            }

            if (menuItems.length === 0) {
                rootStyle.display = 'none';
            }

            rootStyle.zoom = this.state.zoom;

            return {
                "": {
                    style: rootStyle
                },
                "wrapper": {
                    onSwipeUp: this.onTouchSwipeUp,
                    onSwipeDown: this.onTouchSwipeDown,
                    style: {className: "mobile-actions-menu-wrapper"}
                },
                "knobContainer": {},
                "knob": {
                    onClick: this.onKnobClick
                },
                "menuContainer": {
                    children: React.DOM.ul({children: menuItems}),
                    style: {}
                },
                "lists": {},
                "listTitle": {
                    children: this.state.$list === "pages" ? "Pages" : "See me on..."
                },
                "pagesList": {
                    children: React.DOM.ul({children: pagesListChildren})
                },
                "socialList": {
                    children: React.DOM.ul({children: socialListChildren})
                },
                "closeBtn": {
                    onClick: this.onListCloseClick,
                    onTouchEnd: this.onListCloseClick
                }
            };
        },

        componentWillReceiveProps: function (props) {
            if (this.props.currentUrlPageId !== props.currentUrlPageId) {
                this.setState({$list: "nolist"});
            }
        },

        onKnobClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.props.siteAPI.reportBI(biEvents.MOBILE_ACTION_BAR_TOGGLE, {
                site_id: this.props.siteData.rendererModel.siteInfo.siteId,
                status: this.state.$display !== "opened"
            });

            this.setState({$display: this.state.$display === "opened" ? "closed" : "opened"});
        },

        onTouchSwipeUp: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (this.state.$display !== "opened") {
                this.setState({$display: "opened"});
            }
        },

        onTouchSwipeDown: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (this.state.$display !== "closed") {
                this.setState({$display: "closed"});
            }
        },

        onMenuItemClick: function (id, evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.props.siteAPI.reportBI(biEvents.MOBILE_ACTION_BAR_USAGE, {
                site_id: this.props.siteData.rendererModel.siteInfo.siteId,
                button_name: id
            });

            var siteMetaData = this.props.siteData.rendererModel.siteMetaData;
            switch (id) {
                case "pages":
                    this.setState({$list: "pages"});
                    break;
                case "address":
                    window.location.href = "http://maps.apple.com/?q=" + siteMetaData.contactInfo.address;
                    break;
                case "phone":
                    window.location.href = "tel:" + siteMetaData.contactInfo.phone;
                    break;
                case "email":
                    window.location.href = "mailto:" + siteMetaData.contactInfo.email;
                    break;
                case "social":
                    this.setState({$list: "social"});
                    break;
                default:
                    break;
            }
        },

        onListCloseClick: function () {
            this.setState({$list: "nolist"});
            return false;
        }
    };
});
