/**
 * @class bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin
 */
define.bootstrapClass('bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin', function () {
    'use strict';
    /**
     * see @link{bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin#init}
     * @constructor
     */
    function ScriptLoaderPlugin() {
    }

    /** @lends bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin */
    ScriptLoaderPlugin.extendPrototype({
        /**
         * plugin setup method
         * @param {String} name Plugin name
         * @param {Function} isMatch see @link{bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin#isMatch}
         * @param {Function} exec see @link{bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin#exec}
         * @return {bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin} self
         */
        init:function (name, isMatch, exec) {
            this.name = name;
            this.isMatch = isMatch;
            this.exec = exec;
            return this;
        },

        /**
         *
         * @param {Object} resourceObj {id:id, url:url}
         * @param {bootstrap.bootstrap.scriptloader.ScriptLoader} scriptLoader
         * @return {Boolean} true if <i>url</i> should be handled by this plugin
         */
        isMatch:function (resourceObj, scriptLoader) {
            throw new Error('Invalid ScriptLoaderPlugin: isMath and exec methods not set. Use init to override them', this);
        },

        /**
         * Loads a url
         * @param {Object} resourceObj {id:"id", url:"url"}
         * @param {bootstrap.bootstrap.scriptloader.ScriptLoader} scriptLoader
         * @param context
         */
        exec:function (resourceObj, context, scriptLoader) {
            throw new Error('Invalid ScriptLoaderPlugin: isMath and exec methods not set. Use init to override them', this);
        }
    });

    return ScriptLoaderPlugin;
});