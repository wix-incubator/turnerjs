define([], function () {
    'use strict';

    function getRecursionArgs(firstArg, args, sliceStartIndex){
        var newArgs = [firstArg];

        for (var i = sliceStartIndex; i < args.length; i++){  // not using Array.prototype.slice.call(arguments, sliceStartIndex), because of optimizations in JavaScript engines
            newArgs.push(args[i]);                  // fot details see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
        }

        return newArgs;
    }

    var reactComponentUtils = {
        getRef: function(component, refName){
            if (component.refs){
                var ref = component.refs[refName];

                if (ref && arguments.length > 2){
                    return reactComponentUtils.getRef.apply(reactComponentUtils, getRecursionArgs(ref, arguments, 2));
                }

                return ref;
            }
        }
    };

    return reactComponentUtils;
});
