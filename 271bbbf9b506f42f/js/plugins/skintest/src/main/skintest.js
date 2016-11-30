define(['lodash', 'skins'], function (_, skins) {
    'use strict';

    var skinsJson = skins.skins;

    function replaceAttributeSelectors(selector){
        return selector.replace('%[', '[');
    }
    function replaceHostSelectors(selector){
        return selector.replace(/%(?![^:])/g, ':host'); //replace any lone % with :host, or %: with :host:
    }
    function replaceClassSelectors(selector){
        return selector.replace('%_', '.');
    }
    function replaceIDselector(selector){
        return selector.replace('%', '#');
    }
    var transformSelectorRule = _.flow(replaceAttributeSelectors, replaceClassSelectors, replaceHostSelectors, replaceIDselector);

    function transformSelectorRulesToCSSsyntax(skinCssJson){
        return _.transform(skinCssJson, function(newRulesObj, val, key){
            newRulesObj[transformSelectorRule(key)] = val;
        }, {});
    }
    function duplicateCommonRules(rulesJson){
        _(rulesJson)
            .keys()
            .filter(function(key){
                return _.includes(key, ',');
            })
            .forEach(function(key){
                var allRules = key.split(',');
                _.forEach(allRules, function(singleRule){
                    rulesJson[singleRule] = rulesJson[key];
                });
                return key;
            }).value();
        return rulesJson;
    }
    function createCssRulesAsJson(skinCssJson){
        return _.mapValues(skinCssJson, function(rule){
            return _(rule)
                .split(';')
                .compact()
                .invoke('split', ':')
                .zipObject()
                .value();
        });
    }
    var createTestableCssRules = _.flow(transformSelectorRulesToCSSsyntax, createCssRulesAsJson, duplicateCommonRules);

    return {
        version: '1.0.0',

        load: function (name, req, onload) {
            var skinJson = _.clone(skinsJson[name]) || {};
            skinJson.css = createTestableCssRules(skinJson.css || {});
            onload(skinJson);
        }
    };
});
