define(['lodash', 'wixappsCore/core/proxyFactory'], function (_, proxyFactory) {
    'use strict';

    function findApplicableFields(viewDef, rule) {
        var ret = [];
        if (rule.fieldId === "vars") {
            ret.push(viewDef.vars);
        } else {
            findApplicableFieldsOnItem(viewDef, rule, 0, ret);
        }
        return ret;
    }

    function findApplicableFieldsOnItem(itemDef, rule, indexAtParent, addTo) {
        var id = itemDef.id || itemDef.data || indexAtParent;
        if (rule.fieldId === '*' || rule.fieldId === id) {
            addTo.push(itemDef);
        }

        // look for other item definitions recursively (in inner layout objects)
        if (itemDef.comp && itemDef.comp.items) {
            _.forEach(itemDef.comp.items, function(item, i) {
                findApplicableFieldsOnItem(item, rule, i, addTo);
            });
        }
        // .. and in template cases
        if (itemDef.comp && itemDef.comp.templates) {
            _.forEach(itemDef.comp.templates, function(value) {
                findApplicableFieldsOnItem(value, rule, 0, addTo);
            });
        }
        // .. and in switch cases
        if (itemDef.comp && itemDef.comp.cases) {
            _.forEach(itemDef.comp.cases, function(value) {
                if (_.isArray(value)) {
                    _.forEach(value, function (item) {
                        findApplicableFieldsOnItem(item, rule, 0, addTo);
                    });
                } else {
                    findApplicableFieldsOnItem(value, rule, 0, addTo);
                }
            });
        }
        // ... and deal with the table layout which was coded while on acid...
        if (itemDef.comp && itemDef.comp.columns && itemDef.comp.name === 'Table') {
            _.forEach(itemDef.comp.columns, function(columnItem) {
                _.forEach(['item', 'header', 'footer'], function(propName) {
                    if (columnItem[propName] !== undefined) {
                        findApplicableFieldsOnItem(columnItem[propName], rule, 0, addTo);
                    }
                });
            });
        }
    }

    function isRelevantToView(viewDef, rule) {
        return ((rule.forType === "*") || (viewDef.forType === rule.forType)) &&
            ((rule.view === "*") || (viewDef.name === rule.view)) &&
            ((rule.format === "*") || ((viewDef.format || "") === (rule.format || "")));
    }

    function customizeView(viewDef) {
        var customizations = _(arguments).rest().flatten().value();
        _.forEach(customizations, function (rule) {
            if (proxyFactory.isValidProxyName(rule.view)) {
                rule.view += 'View';
            }

            if (isRelevantToView(viewDef, rule)) {
                this.applyCustomization(viewDef, rule);
            }
        }, this);
        return viewDef;
    }

    function applyCustomization(viewDef, rule) {
        var viewFormat = viewDef.format || "";
        var ruleFormat = rule.format || "";

        if (ruleFormat === '*' || ruleFormat === viewFormat) {

            var applicableFields = findApplicableFields(viewDef, rule);
            _.forEach(applicableFields, function(fieldDef) {
                if (!_.isPlainObject(fieldDef)) {
                    return;
                }
                var fieldDefContext = fieldDef;
                var path = rule.key.split('.');
                for (var i = 0; i < path.length; i++) {
                    var pathElement = path[i];
                    if (i === path.length - 1) {
                        var val = rule.value;
                        if (/^\s*(\+|-)?\d+\s*$/.test(rule.value)) {
                            val = parseInt(val, 10);
                        }
                        if (val === undefined) {
                            delete fieldDefContext[pathElement];
                        } else {
                            fieldDefContext[pathElement] = val;
                        }
                    } else {
                        if (!fieldDefContext[pathElement]) {
                            fieldDefContext[pathElement] = {};
                        }
                        fieldDefContext = fieldDefContext[pathElement];
                    }
                }
            });
        }
    }

    return {
        customizeView: customizeView,
        applyCustomization: applyCustomization
    };
});
