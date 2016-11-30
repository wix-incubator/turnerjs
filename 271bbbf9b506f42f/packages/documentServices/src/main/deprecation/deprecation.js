/**
 * Created by alexandreroitman on 23/11/2016.
 */
define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    function wrapDeprecated(privateServices, methodDef, methodName) {
        var methodDefinition = !_.isFunction(methodDef.methodDef) ? _.clone(methodDef.methodDef) : methodDef.methodDef;
        var originalMethod = _.isFunction(methodDefinition) ? methodDefinition : methodDefinition.dataManipulation;
        if (!originalMethod) {
            throw new Error('you can only deprecate a function or a method definition with a dataManipulation function');
        }
        var deprecatedMethod = function() {
            warn(privateServices, methodDef, methodName);
            originalMethod.apply(null, arguments);
        };

        if (_.isFunction(methodDefinition)) {
            return deprecatedMethod;
        }
        methodDefinition.dataManipulation = deprecatedMethod;
        return methodDefinition;
    }

    function warn(ps, methodDef, methodName) {
        var deprecationMessage = methodDef.deprecationMessage + '|' + methodName;
        if (ps.runtimeConfig.shouldThrowOnDeprecation) {
            throw new Error('DocumentServices|Deprecation|' + deprecationMessage);
        }
        utils.log.warnDeprecation(deprecationMessage);
    }

    return {
        wrapDeprecatedFunction: function (privateServices, methodDef, methodName) {
            if (_.isObject(methodDef) && methodDef.deprecated) {
                methodDef = wrapDeprecated(privateServices, methodDef, methodName);
            }

            return methodDef;
        },
        warn: warn,
        setThrowOnDeprecation: function (ps, newVal) {
            _.set(ps, ['runtimeConfig', 'shouldThrowOnDeprecation'], newVal);
        }
    };
});
