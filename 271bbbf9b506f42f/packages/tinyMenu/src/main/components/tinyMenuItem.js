define(['lodash', 'react', 'utils'], function (_, React, utils) {
    'use strict';

    var cssUtils = utils.cssUtils;

    function getPageId() {
        return _.get(this, ['link', 'pageId', 'id']);
    }

    function getState(props) {
        props = props || this.props;
        var curPage = props.options.currentPage;
        var isSubMenuOpen = _.some(props.menuItem.items, function(currSubItem) {
            var pageId = getPageId.call(currSubItem);
            return pageId === curPage;
        });

        return {isSubMenuOpen: isSubMenuOpen};
    }

    function buildChildren(items, options) { //eslint-disable-line react/display-name
        function isCurrentPage(e) { return e.isCurrentPage; }
        function isCurrentAnchor(e) { return e.isCurrentAnchor; }

        var children = _.chain(items)
            .filter('isVisibleMobile')
            .map(function(item) {
                var linkType = _.get(item, ['link', 'type']);
                var entry = {item: item};
                entry.isCurrentPage = linkType === 'PageLink' && getPageId.call(item) === options.currentPage;
                entry.isCurrentAnchor = options.currentAnchor && (linkType === 'AnchorLink' && _.get(item, ['link', 'anchorDataId', 'id']) === options.currentAnchor);
                return entry;
            })
            .reduce(function(result, entry) {
                if (options.currentAnchor) {
                    if (entry.isCurrentAnchor) {
                        var currentPageLink = _.find(result, isCurrentPage);
                        if (currentPageLink) {
                            currentPageLink.isCurrentPage = false;
                        }
                    } else if (entry.isCurrentPage) {
                        if (_.find(result, isCurrentAnchor)) {
                            entry.isCurrentPage = false;
                        }
                    }
                }

                result.push(entry);

                return result;
            }, [])
            .map(function (entry) {
                return React.createElement(TinyMenuItem, {
                    menuItem: entry.item,
                    current: entry.isCurrentPage || entry.isCurrentAnchor,
                    options: options,
                    key: 'item' + entry.item.id
                });
            })
            .value();

        if (options.useSeparators) {
            var childrenWithSeparators = [];
            for (var i = 0; i < children.length; ++i) {
                childrenWithSeparators.push(children[i]);
                if (i < children.length - 1) {
                    childrenWithSeparators.push(React.DOM.div({className: options.styleId + "_separator", key: "separator_" + i}));
                }
            }

            children = childrenWithSeparators;
        }

        return children;
    }

    var TinyMenuItem = React.createClass({
        displayName: 'TinyMenuItem',

        propTypes: {
            menuItem: React.PropTypes.object,
            options: React.PropTypes.object,
            current: React.PropTypes.bool
        },

        statics: {
            buildChildren: buildChildren
        },

        getInitialState: getState,

        onSubMenuToggle: function(e) {
            this.onSubMenuClick(e);
            e.stopPropagation();
        },

        onSubMenuClick: function (e) {
            this.setState({
                isSubMenuOpen: !this.state.isSubMenuOpen
            });

            if (!this.props.menuItem.link) {
                e.stopPropagation();
            }
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.options.timestamp !== nextProps.options.timestamp) {
                this.setState(getState(nextProps));
            }
        },

        render: function () {
            var menuItem = this.props.menuItem,
                hasSubMenu = _.some(menuItem.items, 'isVisibleMobile'),
                clickCallback = hasSubMenu ? this.onSubMenuClick : this.props.options.clickCallback,
                id = menuItem.id,
                options = this.props.options;

            function getClass(className) {
                return cssUtils.concatenateStyleIdToClassName(options.styleId, className);
            }

            var linkNode = React.DOM.a(_.merge({
                children: menuItem.label,
                className: cssUtils.concatenateStyleIdToClassList(options.styleId, ['link', this.props.current && 'current']),
                onClick: clickCallback,
                key: "link" + id
            }, _.get(menuItem, ['link', 'render'])));

            if (!hasSubMenu) {
                return React.DOM.li({
                    className: getClass('item')
                }, linkNode);
            }

            var subMenuToggleNode = React.DOM.span({
                className: cssUtils.concatenateStyleIdToClassList(options.styleId, ['toggler', this.props.current && 'current']),
                key: "toggler" + id,
                onClick: this.onSubMenuToggle
            });

            var subMenuNode = React.DOM.ul({
                ref: 'subMenuContainer',
                className: getClass('submenu')
            }, buildChildren(menuItem.items, _.defaults({useSeparators: false}, options)));

            var headerNodes = [linkNode, subMenuToggleNode];

            return React.DOM.li({
                key: "item" + this.props.menuItem.id,
                children: (options.useSeparators ? [
                    React.DOM.div({
                        className: getClass('header'),
                        key: "header" + id
                    }, headerNodes)
                ] : headerNodes).concat([subMenuNode]),
                className: cssUtils.concatenateStyleIdToClassList(options.styleId, ['item', 'has-children', this.state.isSubMenuOpen && 'open'])
            });
        }
    });


    return TinyMenuItem;
});
