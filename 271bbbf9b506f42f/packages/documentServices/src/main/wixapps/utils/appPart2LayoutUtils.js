define(['lodash', 'utils', 'wixappsCore', 'wixappsBuilder', 'documentServices/component/component', 'documentServices/structure/structure'], function (_, utils, wixappsCore, wixappsBuilder, component, structure) {
    'use strict';

    var viewsUtils = wixappsCore.viewsUtils;

    function parse(x) {
        return parseInt(x, 10);
    }

    function getSpacers(viewDef, orientation) {
        var spacers = viewsUtils.getCompProp('spacers', viewDef);
        if (orientation === 'vertical') {
            return _.sum([parse(spacers["xax-before"] || 0), parse(spacers["xax-after"] || 0)]);
        }
        return _.sum([parse(spacers.before || 0), parse(spacers.after || 0)]);
    }

    function getFieldMinWidth(viewDef) {
        if (viewsUtils.getCompProp('name', viewDef) === 'Field' || viewsUtils.getCompProp('width-mode', viewDef) === 'manual') {
            return viewsUtils.getCompProp('width', viewDef);
        }
        return 0;
    }

    function getFieldBoxMinWidth(orientation, items) {
        var minWidths = _.map(items, function (item) {
            return getFieldMinWidth(item) + getSpacers(item, orientation);
        });

        return orientation === 'vertical' ? _.max(minWidths) : _.sum(minWidths);
    }

    function getOrientation(proxyName, prevOrientation) {
        switch (proxyName) {
            case 'VBox':
                return 'vertical';
            case 'HBox':
                return 'horizontal';
            default:
                return prevOrientation;
        }
    }

    function getAppPart2MinWidth(viewDef, orientation) {
        var items = viewsUtils.getCompProp('items', viewDef);
        if (!items || items.length === 0) {
            return 0;
        }

        var proxyName = viewsUtils.getCompProp('name', viewDef);
        if (proxyName === 'FieldBox') {
            var fieldBoxDef = wixappsBuilder.fieldBoxProxyUtils.getFieldBoxDef(viewsUtils.getCompProp, orientation, viewDef);
            var fieldBoxWidth = viewsUtils.getCompProp('css', fieldBoxDef).width;
            var fieldBoxOrientation = viewsUtils.getCompProp('orientation', viewDef);
            return fieldBoxWidth === 'auto' ? getFieldBoxMinWidth(fieldBoxOrientation, viewsUtils.getCompProp('items', fieldBoxDef)) : fieldBoxWidth;
        }

        var newOrientation = getOrientation(proxyName, orientation);
        var minWidths = _.map(items, function (item) {
            return getAppPart2MinWidth(item, newOrientation);
        });

        return newOrientation === 'vertical' ? _.max(minWidths) : _.sum(minWidths);
    }

    function updateAppPart2MinWidth(ps, compRef, changedFieldProps, viewDef) {
        if (compRef.type !== "DESKTOP" || !_.has(changedFieldProps, 'hidden')) {
            return;
        }

        //the null is for performance optimization. makes sure that the function is called with the same number of params
        var minWidth = getAppPart2MinWidth(viewDef, null);
        var layout = component.layout.get(ps, compRef);
        if (minWidth > layout.width) {
            structure.updateCompLayout(ps, compRef, {width: minWidth});
        }
    }

    return {
        getSpacers: getSpacers,
        getFieldMinWidth: getFieldMinWidth,
        getFieldBoxMinWidth: getFieldBoxMinWidth,
        getAppPart2MinWidth: getAppPart2MinWidth,
        updateAppPart2MinWidth: updateAppPart2MinWidth
    };
});
