define([], function () {
    'use strict';

    var factories = {};

    function interceptModuleExecuteCallback() {
        function patchContext(context) {
            var oldExecCb = context.execCb;

            // prevent wrapping the wrapper
            if (oldExecCb.$patched) {
                return;
            }

            context.execCb = function(fullname, callback /*, args, exports*/) {
                factories[fullname] = callback;
                return oldExecCb.apply(this, arguments);
            };

            context.execCb.$patched = true;
        }

        var contexts = require.s.contexts;
        Object.keys(contexts).forEach(function(contextName) {
            patchContext(contexts[contextName]);
        });
    }

    interceptModuleExecuteCallback();

    return {
        version: '1.0.0',

        load: function (name, req, onload) {
            if (req.defined(name)) { //meaning module was loaded before definition module wrapped it
                require.undef(name);
            }
            req([name], function() {
                onload(factories[name]);
            });
        }
    };
});
