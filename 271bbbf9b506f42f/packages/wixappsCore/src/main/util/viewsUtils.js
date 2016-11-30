define(["lodash", 'wixappsCore/core/expressions/expression'], function (_, expression) {
    "use strict";
    function fillMissingIdsForItem(itemDef, indexAtView) {
        itemDef.id = itemDef.id || itemDef.data || 'def_' + indexAtView;
        var ret = indexAtView + 1;

        // look for other item definitions recursively (in inner layout objects)
        if (itemDef.comp && itemDef.comp.items) {
            _.forEach(itemDef.comp.items, function(item) {
                ret = fillMissingIdsForItem(item, ret);
            });
        }
        // .. and in template cases
        if (itemDef.comp && itemDef.comp.templates) {
            _.forEach(itemDef.comp.templates, function(value) {
                ret = fillMissingIdsForItem(value, ret);
            });
        }
        // .. and in switch cases
        if (itemDef.comp && itemDef.comp.cases) {
            _.forEach(itemDef.comp.cases, function(value) {
                if (_.isArray(value)) {
                    _.forEach(value, function (item) {
                        ret = fillMissingIdsForItem(item, ret);
                    });
                } else {
                    ret = fillMissingIdsForItem(value, ret);
                }
            });
        }
        // ... and deal with the table layout which was coded while on acid...
        if (itemDef.comp && itemDef.comp.columns && itemDef.comp.name === 'Table') {
            _.forEach(itemDef.comp.columns, function(columnItem) {
                _.forEach(['item', 'header', 'footer'], function(propName) {
                    if (columnItem[propName] !== undefined) {
                        ret = fillMissingIdsForItem(columnItem[propName], ret);
                    }
                });
            });
        }

        return ret;
    }

    /**
     * Stops traversal if the callback returns false.
     */
    function traverseViews(viewDef, callback) {
        var returnValue = callback(viewDef);
        if (returnValue !== false) {
            var childCompProps = ["items", "cases", "templates"];
            _.forEach(childCompProps, function (prop) {
                if (viewDef.comp && viewDef.comp[prop]) {
                    _.forEach(viewDef.comp[prop], function (child) {
                        if (_.isArray(child)) {
                            _.forEach(child, function (arrItem) {
                                returnValue = traverseViews(arrItem, callback);
                                return returnValue;
                            });
                        } else {
                            returnValue = traverseViews(child, callback);
                        }
                        return returnValue;
                    });
                    return returnValue;
                }
            });
        }
        return returnValue;
    }

    function getViewId(type, name, format) {
        return _.compact([type, name, format]).join('|');
    }

    function getViewNameFromId(viewId) {
        if (_.isString(viewId)) {
            var viewNameRegEx = /[^\|]+\|([^\|]+).*/;
            var regexMatch = viewId.match(viewNameRegEx);
            return regexMatch ? regexMatch[1] : null;
        }
    }

    function getCompProp(prop, viewDef) {
        return viewDef.comp && expression.convertStringToPrimitive(viewDef.comp[prop]);
    }

    function findViewInDescriptorByNameTypeAndFormat(descriptor, viewName, typeName, formatName) {
        // first look for the view with the requested format
        var found = _.find(descriptor.views, function (view) {
            var nameArr = _.isArray(view.name) ? view.name : [view.name];
            var viewFormat = view.format || "";
            return (view.forType === typeName) && viewFormat === formatName && _.includes(nameArr, viewName);
        });
        // if we didn't find the view but a format was specified try to look for a view with an empty format
        if (!found && formatName) {
            found = _.find(descriptor.views, function (view) {
                var nameArr = _.isArray(view.name) ? view.name : [view.name];
                var viewFormat = view.format || "";
                return (view.forType === typeName) && viewFormat === "" && _.includes(nameArr, viewName);
            });
        }
        return found;
    }

    /**
     * @class wixappsCore.viewsUtils
     */
    return {
        fillViewDefMissingIDs: function (viewDef) {
            fillMissingIdsForItem(viewDef, 0);
        },
        sanitizeCompId: function (id) {
            return id.replace(/[\$:]/g, '');
        },
        traverseViews: traverseViews,
        getViewId: getViewId,
        getViewNameFromId: getViewNameFromId,
        getCompProp: getCompProp,
        findViewInDescriptorByNameTypeAndFormat: findViewInDescriptorByNameTypeAndFormat
    };
});
