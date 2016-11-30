define(["lodash"], function (_) {
    "use strict";

    function ensureLeadingSharp (str) {
        return /^#/.test(str) ? str : "#" + str;
    }

    function jsonToCss (obj) {
        var styleRulesArray = _.map(obj, function(val, key){
            return key + ':' + val;
        });
        return '{' + styleRulesArray.join(';') + '}';
    }

    function renderSingleRule (compId, viewId, ruleDef) {
        var prefix = compId + " " + viewId + " ";

        var ret = [];
        _.forOwn(ruleDef, function (rules, classNames) {
            _.forEach(classNames.split(/\s*,\s*/), function (cssClass) {
                var ruleStr = prefix + cssClass + jsonToCss(rules);
                ret.push(ruleStr);
            });
        });

        return ret;
    }

    function render (stylesheetDef, compId, viewId) {
        compId = ensureLeadingSharp(compId);
        viewId = ensureLeadingSharp(viewId);

        if (_.isEmpty(stylesheetDef)) {
            return null;
        }
        if (!_.isArray(stylesheetDef)) {
            throw "stylesheetRenderer:: stylesheet definition must be an array";
        }

        return _.flattenDeep(_.map(stylesheetDef, renderSingleRule.bind(null, compId, viewId))).join("");
    }

    /**
     * @class wixappsCore.stylesheetRenderer
     */
    return {
        render: render
    };
});
