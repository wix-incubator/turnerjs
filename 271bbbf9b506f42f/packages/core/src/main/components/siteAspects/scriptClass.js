define(['react', 'reactDOM'], function(React, ReactDOM) {
    'use strict';

    /**
     *
     * @param script.NAME
     * @returns {*}
     */
    function scriptTagExist(script) {
        return window.loadedScripts && window.loadedScripts[script.NAME];
    }

    /**
     *
     * @param script.NAME
     * @returns {string}
     */
    function getInnerScript(script){
        return 'window.loadedScripts = window.loadedScripts || {}; window.loadedScripts["' + script.NAME + '"] = true;';
    }

    /**
     * This is a helper class that solves the following problem:
     *
     * When a React.DOM.script comp is added, it's inserted using innerHTML, thus not executing the <script>.
     * This behavior is good enough for server rendering (and both mode), which then executes the <script> manually.
     *
     * When the rendering happens client-side, we need to replace the existing <script> tag
     * with a new instance, replacing the old one using old fashioned 'replaceChild'
     *
     */
    var ReactScriptClass = React.createClass({
        displayName: 'scriptClass',
        loaded: false,

        /**
         *
         * When site is rendered client-side, we want to replace the non-functioning <script> tag with a fresh working one
         */
        componentDidMount: function () {
            var scriptData = this.props.scriptData;
            var script = scriptTagExist(scriptData.script);
            var loadedCallback;
            var domNode;
            var self;

            if (script && !this.loaded){ // very theoretically can be situation, when script tag is created, but not loaded
                this.fireCallbacks(scriptData, true);
            } else {
                self = this;
                script = window.document.createElement('script');

                loadedCallback = function(){
                    self.fireCallbacks(scriptData, false);
                    self.loaded = true;
                    script.removeEventListener('load', loadedCallback); // script can be loaded only once
                };

                script.addEventListener('load', loadedCallback);
                script.src = scriptData.script.SRC;
                domNode = ReactDOM.findDOMNode(this);
                domNode.replaceChild(script, domNode.children[0]);
            }
        },

        fireCallbacks: function(scriptData, fromCache){
            scriptData.callbacks.forEach(function(callbackData){
                var context = callbackData.context;

                if (context){
                    callbackData.callback.call(context, {fromCache: fromCache});
                } else {
                    callbackData.callback({fromCache: fromCache});
                }
            });

            scriptData.callbacks.length = 0; // clear references to prevent 'spagetti effect' when the reference to the callback will prevent dead owner object from collecting by the garbage collector
        },

        /**
         * When site is rendered server-side, we want a <script> tag
         *
         * @returns {*}
         */
        render: function () {
            var script = this.props.scriptData.script;
            var scriptId = 'script-' + script.NAME;

            return React.DOM.div(null,
                React.DOM.script({id: scriptId, src: script.SRC}),
                React.DOM.script({dangerouslySetInnerHTML: {
                    __html: getInnerScript(script)
                }}));
        }
    });

    return ReactScriptClass;

});
