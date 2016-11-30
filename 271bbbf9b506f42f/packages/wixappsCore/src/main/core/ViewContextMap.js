define(['lodash', 'experiment'], function (_, experiment) {
    "use strict";

    var SEP = "_";
    var DOT = ".";

    // array[2].value => ['array', '2', 'value']
    function convertToDataPathArray(dataPath) {
        return _.isString(dataPath) ? _.compact(dataPath.split(/[\.\[\]]/)) : dataPath;
    }

    function getParentContextKey(contextId) {
        return _.initial(contextId.split(SEP)).join(SEP);
    }

    function getChildContextKey(parentContextKey, prevContextPath, parentContext) {
        if (!parentContextKey) {
            return "0";
        }
        if (prevContextPath && this.contextMap[prevContextPath]) {
            return prevContextPath;
        }
        return parentContextKey + SEP + String(parentContext.index++);
    }

    function getContext(contextPath, propertyClass, propertyName) {
        var contextKey = contextPath;
        while (contextKey) {
            if (_.has(this.contextMap[contextKey][propertyClass], propertyName)) {
                return this.contextMap[contextKey][propertyClass];
            }
            contextKey = getParentContextKey(contextKey);
        }

        return undefined;
    }

    /**
     * @class wixappsCore.ViewContextMap
     * @constructor
     */
    function ViewContextMap(onUpdateCallback) {
        this.contextMap = {};
        this.onUpdateCallback = _.noop;


        if (experiment.isOpen('sv_shouldComponentUpdate_for_blog')) {
            this.onUpdateCallback = onUpdateCallback || _.noop;
        }
    }

    function setValueByPath(varPathArray, varContext, value) {
        while (varPathArray.length > 1) {
            varContext = varContext[varPathArray.shift()];
        }
        varContext[varPathArray.shift()] = value;
    }

    ViewContextMap.prototype = {

        /**
         * Resolves the absolute path to the data in the siteData.
         * @param {String} contextPath The context path in the contextMap.
         * @param {String|Array} dataPath The data path in the dataContext in the contextPath.
         * @returns {Array} An absolute path to the data in siteData.
         */
        resolvePath: function (contextPath, dataPath) {
            // If dataPath is string, convert it to an array
            // If it's an array converts string elements to arrays and then flatten everything.
            var dataPathArray = _.flattenDeep(_.map(convertToDataPathArray(dataPath), convertToDataPathArray));

            var contextKey = contextPath;
            var pathFromContext = [];
            _.forEach(dataPathArray, function (prop) {
                if (prop === "parent") {
                    contextKey = getParentContextKey(contextKey);
                    if (!contextKey) {
                        throw "Error:: no parent context.";
                    }
                } else if (prop !== "this") {
                    pathFromContext.push(prop);
                }
            });

            // for accessing
            if (!this.contextMap[contextKey]) {
                return null;
            }
            if (this.contextMap[contextKey].scopePath.length && _.every(this.contextMap[contextKey].scopePath, _.isArray) && pathFromContext.length && _.isNumber(pathFromContext[0])) {
                var index = pathFromContext.shift();
                return this.contextMap[contextKey].scopePath[index].concat(pathFromContext);
            }

            return this.contextMap[contextKey].scopePath.concat(pathFromContext);
        },

        /**
         * Creates a new context that points to the itemPath as its data context
         * @param {String} parentContextPath the context path of the parent context
         * @param {String} prevContextPath the context path generated last time for this proxy
         * @param {Array} itemPath The path to the item in siteData.
         * @param {Object=} vars Optional vars object that will be set in the new context.
         * @param {Object=} events Optional events object that will be set in the new context. (these events can be used in the views and have precedence over logic events)
         * @param {Object=} functionLibrary Optional functions object that will be set in the new context. (these functions can be used in expressions in the views)
         * @returns {string} The new context path
         */
        newContextForDataItem: function (parentContextPath, itemPath, vars, events, functionLibrary, prevContextPath) {
            var newContextKey = getChildContextKey.call(this, parentContextPath, prevContextPath, this.contextMap[parentContextPath]);
            // Create a context if it doesn't exist or the data item was changed.
            if (!this.contextMap[newContextKey] || !_.isEqual(this.contextMap[newContextKey].scopePath, itemPath)) {
                this.contextMap[newContextKey] = {
                    vars: vars || {},
                    events: events || {},
                    functionLibrary: functionLibrary || {},
                    scopePath: itemPath,
                    index: 0
                };

                this.onUpdateCallback();
            }

            return newContextKey;
        },

        /**
         * Creates a new context that point to the dataPath within the path of its parent context
         * @param {String} parentContextPath the context path of the parent context
         * @param {String=} prevContextPath the context path generated last time for this proxy
         * @param {String|Array} dataPath The path to the data in the parent context.
         * @param {Object=} vars Optional vars object that will be set in the new context.
         * @param {Object=} events Optional events object that will be set in the new context. (these events can be used in the views and have precedence over logic events)
         * @param {Object=} functionLibrary Optional functions object that will be set in the new context. (these functions can be used in expressions in the views)
         * @returns {string} The new context path
         */
        newContextForDataPath: function (parentContextPath, dataPath, vars, events, functionLibrary, prevContextPath) {
            var parentContext = this.contextMap[parentContextPath];
            var dataPathArr = _.isArray(dataPath) ? dataPath : dataPath.split(DOT);
            dataPathArr = _.flattenDeep(_.map(dataPathArr, function (part) {
                if (_.isString(part)) {
                    return part.split(DOT);
                }
                return part;
            }));
            dataPathArr = _.without(dataPathArr, "this");

            var scopePath = parentContext.scopePath.concat(dataPathArr);
            return this.newContextForDataItem(parentContextPath, scopePath, vars, events, functionLibrary, prevContextPath);
        },

        /**
         * Gets the var in the initial context or any of its parent contexts.
         * @param {String} contextPath The initial context path.
         * @param {String} varName The var name.
         * @returns {*}
         */
        getVar: function (contextPath, varName) {
            // Remove prefix of $ if exist.
            varName = varName.replace(/^\$/, '');

            var context = getContext.call(this, contextPath, 'vars', varName);
            return context && context[varName];
        },

        /**
         * Sets the value of a var in the initial context (contextPath) or the first parent that contains a var with the given name.
         * @param {String} contextPath The initial context path.
         * @param {String} varPath The path of the var i.e. varName or varName.property1.property2
         * @param {*} value The new value for the var.
         */
        setVar: function (contextPath, varPath, value) {
            // Remove prefix of $ if exist.
            var varPathArray = varPath.replace(/^\$/, '').split(".");
            var varName = _.first(varPathArray);

            var varContext = getContext.call(this, contextPath, 'vars', varName);
            if (!varContext) {
                return;
            }

            this.onUpdateCallback();

            setValueByPath(varPathArray, varContext, value);
        },

        /**
         * Merge the existing vars object in the given context with the given vars
         * @param {String} contextPath
         * @param {object} vars
         */
        overrideContextVars: function (contextPath, vars) {
            if (!this.hasContext(contextPath)) {
                throw "Context does not exist";
            }
            _.assign(this.contextMap[contextPath].vars, vars);

            this.onUpdateCallback();
        },

        /**
         * Gets the logical event handler from the contexts in the contextPath, or undefined if not found
         * @param {String} contextPath
         * @param {String} eventName
         * @returns {function|undefined}
         */
        getEvent: function (contextPath, eventName) {
            var context = getContext.call(this, contextPath, 'events', eventName);
            return context && context[eventName];
        },

        /**
         * Gets the function library that belongs to the context with the given contextPath, or undefined if not found
         * @param {String} contextPath
         * @returns {object|undefined}
         */
        getExpressionsFunctions: function (contextPath) {
            var contextKey = contextPath;
            var functions = {};
            while (contextKey) {
                _.defaults(functions, this.contextMap[contextKey].functionLibrary);
                contextKey = getParentContextKey(contextKey);
            }
            return functions;
        },

        /**
         * Clear the context map to trigger a new cycle of context creation
         */
        resetContext: function () {
            this.contextMap = {};
            this.onUpdateCallback();
        },

        /**
         * Checks if a context exists with a given contextPath
         * @param {String} contextPath
         * @returns {boolean}
         */
        hasContext: function (contextPath) {
            return _.has(this.contextMap, contextPath);
        }
    };

    return ViewContextMap;
});
