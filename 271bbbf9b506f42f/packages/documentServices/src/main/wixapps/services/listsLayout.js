define(
    ['lodash', 'utils', 'documentServices/wixapps/services/types', 'documentServices/wixapps/services/views', 'documentServices/wixapps/services/lists', 'documentServices/theme/theme', 'wixappsCore', 'documentServices/wixapps/utils/richTextFieldLayoutUtils', 'documentServices/wixapps/utils/appPart2LayoutUtils', 'documentServices/wixapps/utils/proxyUtils'],
    function (_, utils, types, views, lists, theme, wixappsCore, richTextFieldLayoutUtils, appPart2LayoutUtils, proxyUtils) {
        'use strict';

        var namePath = ['comp', 'name'];
        var hiddenPath = ['comp', 'hidden'];
        var hidePaginationPath = ['comp', 'hidePagination'];
        var itemsPerPagePath = ['comp', 'itemsPerPage'];
        var stylePath = ['comp', 'style'];
        var itemSpacingPath = ['vars', 'itemSpacing'];

        var pathFuncs = {
            itemSpacing: function () {
                return itemSpacingPath;
            },
            hidePagination: function (view) {
                return getPaginatedListViewPath(view).concat(hidePaginationPath);
            },
            itemsPerPage: function (view) {
                return getPaginatedListViewPath(view).concat(itemsPerPagePath);
            },
            hideSeparator: function (view) {
                return getHorizontalLineViewPath(view).concat(hiddenPath);
            },
            separatorStyle: function (view) {
                return getHorizontalLineViewPath(view).concat(stylePath);
            }
        };

        function getPaginatedListViewPath(view) {
            return utils.objectUtils.findPath(view, function (obj) {
                return _.get(obj, namePath) === 'PaginatedList';
            });
        }

        function getHorizontalLineViewPath(view) {
            return utils.objectUtils.findPath(view, function (obj) {
                return _.get(obj, namePath) === 'HorizontalLine';
            });
        }

        function get(ps, listId, format) {
            var viewName = lists.getListDef(ps, listId).viewName;
            var view = views.getView(ps, 'Array', viewName, format);
            var horizontalLineViewPath = getHorizontalLineViewPath(view);

            var horizontalLineView = _.get(view, horizontalLineViewPath);
            return {
                itemSpacing: wixappsCore.convertStringToPrimitive(_.get(view, pathFuncs.itemSpacing(view))),
                hidePagination: wixappsCore.convertStringToPrimitive(_.get(view, pathFuncs.hidePagination(view))),
                itemsPerPage: wixappsCore.convertStringToPrimitive(_.get(view, pathFuncs.itemsPerPage(view))),
                hideSeparator: wixappsCore.convertStringToPrimitive(_.get(view, pathFuncs.hideSeparator(view))) || false,
                separatorStyle: proxyUtils.getStyle(ps, horizontalLineView),
                separatorComponentType: proxyUtils.getCompProxyClass(horizontalLineView).componentType
            };
        }

        function set(ps, listId, layoutObject, format) {
            var viewName = lists.getListDef(ps, listId).viewName;
            var view = views.getView(ps, 'Array', viewName, format);

            _(pathFuncs)
                .pick(_.keys(layoutObject))
                .forEach(function (pathFunc, propertyName) {
                    views.setValueInView(ps, 'Array', viewName, pathFunc(view), layoutObject[propertyName].toString(), format);
                }).value();
        }

        return {
            get: get,
            set: set
        };
    });
