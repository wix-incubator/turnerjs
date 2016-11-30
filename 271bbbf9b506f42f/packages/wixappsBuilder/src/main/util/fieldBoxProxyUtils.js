define(["lodash"], function (_) {
    'use strict';

    var parentLayoutProperties = ['width', 'box-flex', 'flex'];
    var irrelevantComps = ["VSpacer", "HSpacer"];

    function isWidthAmbiguous(parentLayout) {
        if (!parentLayout) {
            return true;
        }
        return _.every(parentLayoutProperties, function (prop) {
            return !parentLayout[prop];
        });
    }

    function hasChildContent(getCompProp, items) {
        return _.some(items, function (child) {
            return !_.includes(irrelevantComps, getCompProp('name', child));
        });
    }

    function findMaxManualWidth(getCompProp, items) {
        var childrenWithManualWidth = _.filter(items, function (child) {
            var widthMode = getCompProp("width-mode", child);
            if (widthMode) {
                return widthMode === "manual";
            }
            return !_.isUndefined(getCompProp("width", child));
        });

        if (_.isEmpty(childrenWithManualWidth)) {
            return 200;
        }

        return _(childrenWithManualWidth).map(function (child) {
            var spacers = getCompProp("spacers", child);
            return getCompProp("width", child) + (spacers["xax-before"] || 0) + (spacers["xax-after"] || 0);
        }).max();
    }

    function isDisplayed(getCompProp, item) {
        return !getCompProp('hidden', item);
    }

    function getFieldBoxDef(getCompProp, orientation, viewDef) {
        var fieldBoxOrientation = getCompProp("orientation", viewDef);
        var newCompName = fieldBoxOrientation === "vertical" ? "VBox" : "HBox";
        var def = {
            comp: {
                name: newCompName,
                items: _.filter(viewDef.comp.items, isDisplayed.bind(null, getCompProp))
            }
        };

        var items = getCompProp('items', def);
        if (orientation === 'horizontal' && fieldBoxOrientation === "vertical" && isWidthAmbiguous(viewDef.layout) && hasChildContent(getCompProp, items)) {
            var maxManualWidth = findMaxManualWidth(getCompProp, items);
            var widthStyle = {comp: {css: {width: maxManualWidth}}};
            if (_.has(viewDef, 'layout') && _.has(viewDef.layout, 'min-width')) {
                widthStyle.layout = {'min-width': maxManualWidth};
            }
            return _.merge(def, widthStyle);
        }
        return _.merge(def, {comp: {css: {width: 'auto'}}});
    }

    return {
        getFieldBoxDef: getFieldBoxDef
    };
});