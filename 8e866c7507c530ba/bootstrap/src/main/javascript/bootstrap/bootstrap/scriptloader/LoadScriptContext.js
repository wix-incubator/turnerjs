/**
 * @class bootstrap.bootstrap.scriptloader.LoadScriptContext
 */
define.bootstrapClass('bootstrap.bootstrap.scriptloader.LoadScriptContext', function () {
    'use strict';
    /**
     *
     * @param onLoad
     * @param onFailed
     * @param timeout
     * @constructor
     */
    function LoadScriptContext(onLoad, onFailed, timeout) {
        if (onLoad) {
            this.onLoad = onLoad;
        }
        if (onFailed) {
            this.onFailed= onFailed;
        }
        if (timeout !== undefined) {
            this.timeout = timeout;
        }
    }

    /** @lends bootstrap.bootstrap.scriptloader.LoadScriptContext */
    LoadScriptContext.extendPrototype({
        timeout: 30000,
        onLoad: function(content, src, event) {
            throw new Error('No loading handler defined for script: '+src);
        },
        onFailed: function(content, src, event) {
            throw new Error('Error loading script: '+src);
        }
    });
});