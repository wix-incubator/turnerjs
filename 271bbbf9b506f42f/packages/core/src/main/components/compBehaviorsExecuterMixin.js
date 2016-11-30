define(['lodash'], function (_) {
    'use strict';

    function generateParamArray(behaviorDef, behavior) {
        var paramArr = _.map(behaviorDef.params, function (paramName) {
            return behavior.params[paramName];
        });
        return behavior.callback ? paramArr.concat(behavior.callback) : paramArr;
    }

    function executeBehaviorMethods(compBehaviors) {
        _.forEach(compBehaviors, function (behavior) {
            var behaviorDef = _.get(this.constructor, ['behaviors', behavior.name]) || _.get(this.constructor, ['behaviorExtensions', behavior.name], {});
            if (_.isFunction(this[behaviorDef.methodName])) {
                var paramArray = generateParamArray(behaviorDef, behavior);
                this[behaviorDef.methodName].apply(this, paramArray);
            }
        }, this);
    }

    return {
        componentWillMount: function() {
            executeBehaviorMethods.call(this, this.props.compBehaviors);//what if the method needs the dom?
        },

        componentWillReceiveProps: function(nextProps) {
            executeBehaviorMethods.call(this, nextProps.compBehaviors);
        }
    };
});
