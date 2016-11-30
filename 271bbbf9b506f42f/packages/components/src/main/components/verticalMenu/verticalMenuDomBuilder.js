define(['react', 'lodash', 'zepto', 'utils'], function (React, _, $, utils) {
    'use strict';

    function isSelectedItem(dataItem, currentPage) {
        var i;

        if (dataItem.link && dataItem.link.type === 'PageLink' && dataItem.link.pageId.id === currentPage) {
            return true;
        }

        for (i = 0; i < dataItem.items.length; i++) {
            if (isSelectedItem(dataItem.items[i], currentPage)) {
                return true;
            }
        }

        return false;

    }

    function triggerClickOnAnchor(event) {
        var anchor = $(event.target).find('a')[0];

        if (anchor) {
            anchor.click();
            return false;
        }

        return true;
    }

    function getItemProperties(className, classPrefix, selected, menuItemHeight, id, hoverId, callbacks, hasVisibleItems, isDesktop) {
        var classSet = {};
        classSet[classPrefix + '_selected'] = selected;
        classSet[classPrefix + '_hover'] = utils.stringUtils.startsWith(hoverId, id);
        classSet[className] = true;

        var itemProperties = {
            className: utils.classNames(classSet),
            style: {
                height: menuItemHeight
            },
            onClick: hasVisibleItems ? callbacks.click : callbacks.leave,
            id: id,
            key: id
        };

        if (isDesktop) {
            _.assign(itemProperties, {
                onMouseEnter: callbacks.enter,
                onMouseLeave: callbacks.leave
            });
        }

        return itemProperties;
    }

    function getItemsContainerProperties(hasVisibleItems, className, classPrefix, separatorHeight) {
        return {
            style: {
                marginBottom: separatorHeight + 'px'
            },
            className: hasVisibleItems ? className : className + ' ' + classPrefix + '_emptySubMenu'
        };
    }

    function getLabelProperties(className, classPrefix, lineHeight, link, level, callbacks, hasVisibleItems) {
        var properties = {
            className: className + ' ' + classPrefix + '_label level' + level,
            style: {
                lineHeight: lineHeight + 'px'
            },
            onClick: hasVisibleItems ? callbacks.click : callbacks.leave
        };

        if (link) {
            _.merge(properties, link.render);
        }
        return properties;
    }

    function additionalActions(properties) {
        if (_.includes(properties.className, 'Wrapper')) {
            properties.onClick = triggerClickOnAnchor;
        }
    }

    var domBuilder = {
        getSkin: function (skinMap, skinName) {
            return skinMap[skinName];
        },
        buildTemplate: function (skinItem, classPrefix) {
            var rawItems = skinItem.slice(3, skinItem.length),
                items = [];

            _.forEach(rawItems, function (child) {
                if (_.isArray(child)) {
                    items.push(this.buildTemplate(child, classPrefix));
                }
            }, this);

            return {
                tag: skinItem[0].toLowerCase(),
                skinPart: skinItem[1],
                className: _.map(skinItem[2], function (currentClass) {
                    return classPrefix + currentClass;
                }),
                items: items
            };
        },
        buildDomItem: function (mainTemplate, template, dataItems, dataItem, classPrefix, currentPage, heights, level, parentId, hoverId, callbacks, isDesktop) {
            var tag = React.DOM[template.tag];
            var items = [];
            var properties = {
                className: template.className.concat(dataItem.link ? '' : classPrefix + '_noLink').join(' ')
            };
            var id = parentId + dataItems.indexOf(dataItem) + '_';
            var hasVisibleItems = _.filter(dataItem.items, {isVisible: true}).length > 0;

            switch (template.tag) {
                case 'a':
                    items.push(dataItem.label);
                    properties = getLabelProperties(properties.className, classPrefix, heights.line, dataItem.link, level, callbacks, hasVisibleItems);
                    break;
                case 'ul':
                    _.forEach(dataItem.items, function (subItem) { //eslint-disable-line lodash3/prefer-filter
                        if (subItem.isVisible) {
                            items.push(this.buildDomItem(mainTemplate, mainTemplate, dataItem.items, subItem, classPrefix, currentPage, heights, level + 1, id, hoverId, callbacks, isDesktop));
                        }
                    }, this);

                    properties = getItemsContainerProperties(hasVisibleItems, properties.className, classPrefix, heights.separator);
                    break;
                case 'li':
                    _.forEach(template.items, function (templateItem) {
                        items.push(this.buildDomItem(mainTemplate, templateItem, dataItems, dataItem, classPrefix, currentPage, heights, level, parentId, hoverId, callbacks, isDesktop));
                    }, this);
                    properties = getItemProperties(properties.className, classPrefix, isSelectedItem(dataItem, currentPage), heights.item, id, hoverId, callbacks, hasVisibleItems, isDesktop);
                    break;
                default:
                    _.forEach(template.items, function (templateItem) {
                        items.push(this.buildDomItem(mainTemplate, templateItem, dataItems, dataItem, classPrefix, currentPage, heights, level, parentId, hoverId, callbacks, isDesktop));
                    }, this);
                    break;
            }

            additionalActions(properties);

            if (template.tag === 'ul') {
                return tag(properties, items);
            }

            return tag.apply(null, [properties].concat(items));
        },
        buildDOMFromTemplate: function (template, dataItems, classPrefix, currentPage, heights, hoverId, callbacks, isDesktop) {

            var mainTemplate = template.items[0];
            var domItems = _(dataItems)
                .filter('isVisible')
                .map(function (item) {
                    return this.buildDomItem(mainTemplate, mainTemplate, dataItems, item, classPrefix, currentPage, heights, 0, 'root', hoverId, callbacks, isDesktop);
                }, this).value();

            return React.DOM.ul({
                className: classPrefix + 'menuContainer'
            }, domItems);
        }
    };

    return domBuilder;
});
