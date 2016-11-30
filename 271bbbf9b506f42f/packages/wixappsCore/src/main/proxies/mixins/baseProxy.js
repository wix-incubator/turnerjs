define([
    "lodash",
    "santaProps",
    "wixappsCore/util/viewsUtils",
    "wixappsCore/core/styleData",
    "wixappsCore/core/expressions/expression",
    "wixappsCore/core/styleTranslator",
    "wixappsCore/util/spacersCalculator",
    "utils",
    "wixappsCore/core/wixappsPlugins"
], function (
    _,
    santaProps,
    viewsUtils,
    styleData,
    expression,
    styleTranslator,
    spacersCalculator,
    utils,
    wixappsPlugins
) {
        'use strict';

        function render() {
            return this.getCompProp('hidden') ? null : this.renderProxy();
        }

        function createContextByProps(props) {
            var contextPath = props.parentContextPath;
            var contextProps = props.contextProps;
            if (contextProps) {
                contextPath = this.createContext(props.parentContextPath, contextProps.path, contextProps.vars, contextProps.events, contextProps.functionLibrary);
            }
            this.contextPath = contextPath;
        }

        function getProxyCssClassName(style) {
            var result = this.getCompProp("cssClass") || "";
            if (this.props.className) {
                result += " " + this.props.className;
            }
            if (this.getProxyCustomCssClass) {
                result += " " + this.getProxyCustomCssClass();
            }
            result += " " + getAdditionalClasses(style);
            result = result.trim();
            return result;
        }

        function handleMouseEvent(isMouseOver) {
            var hoverVar = this.getCompProp('hoverVar');
            this.props.viewProps.setVar(this.contextPath, hoverVar, isMouseOver);
        }

        /**
         * Converts all DOM events from the viewDef to React DOM events (e.g. dom:click -> onClick)
         * @returns {object} React's native events props and callbacks for all the dom:<eventName> from the view definition.
         */
        function getDomEvents() {
            var events = {};
            var hoverVar = this.getCompProp('hoverVar');
            if (hoverVar) {
                events.onMouseEnter = handleMouseEvent.bind(this, true);
                events.onMouseLeave = handleMouseEvent.bind(this, false);
            }

            var viewEvents = this.getCompProp("events");
            return _.transform(viewEvents, function (props, value, eventName) {
                var enabledExpr = null;
                if (value.params !== undefined && value.params.enabled !== undefined && value.params.enabled.$expr !== undefined) {
                    enabledExpr = value.params.enabled.$expr;
                }
                if (enabledExpr) {
                    var enabled = expression.evaluate(resolveExpressionRef.bind(this, this.contextPath), enabledExpr, updateFunctionLibrary.call(this, this.contextPath));
                    if (!enabled) {
                        return;
                    }
                }
                if (utils.stringUtils.startsWith(eventName, 'dom:')) {
                    // TODO: if needed, add support for events with name that contains two words (e.g. mouseover -> onMouseOver)
                    eventName = 'on' + eventName[4].toUpperCase() + eventName.substring(5);
                    props[eventName] = this.handleViewEvent;
                }

                // default events
                switch (eventName) {
                    case 'click':
                        props.onClick = this.handleViewEvent;
                        break;
                    case 'mouseup': {
                        props.onMouseUp = this.handleViewEvent;
                        break;
                    }
                    case 'mousedown': {
                        props.onMouseDown = this.handleViewEvent;
                    }
                }
            }, events, this);
        }

        function isDataItem(data) {
            return _.isPlainObject(data) && _.has(data, "_iid");
        }

        function isDataItemRef(data) {
            return _.isPlainObject(data) && data._type && utils.stringUtils.startsWith(data._type, "wix:Ref");
        }

        function generateItemIdFromRef(ref) {
            return [ref.collectionId, ref.itemId];
        }

        function updateFunctionLibrary(contextPath) {
            var expressionsFunctions = this.props.viewContextMap.getExpressionsFunctions(contextPath);
            return _.assign(this.props.functionLibrary, expressionsFunctions);
        }

        function resolveExpressionRef(contextPath, ref) {
            if (_.isUndefined(contextPath)) {
                contextPath = this.contextPath;
            }

            var ret;
            var path = ref.split(".");
            var root = path.shift();

            // resolve var
            if (_.first(root) === "$") {
                ret = this.props.viewContextMap.getVar(contextPath, root);
                // If the var is an expression evaluate it, otherwise read the rest of the props of the var's value
                if (expression.isExpression(ret)) {
                    ret = expression.evaluate(resolveExpressionRef.bind(this, contextPath), ret.$expr, updateFunctionLibrary.call(this, contextPath));
                } else {
                    while (path.length) {
                        ret = ret[path.shift()];
                    }
                }
            } else {
                // resolve data
                ret = this.getDataByPath(ref);
            }
            return expression.convertStringToPrimitive(ret);
        }

        function isVar(dataPath) {
            return utils.stringUtils.startsWith(dataPath, '$');
        }

        function getProxyData(props) {
            props = props || this.props;
            var value = this.getViewDefProp("value", props.viewDef);
            if (!_.isUndefined(value)) {
                return value;
            }

            var dataPath = (props.viewDef && props.viewDef.data) || "this";

            if (expression.isExpression(dataPath)) {
                return expression.evaluate(resolveExpressionRef.bind(this, this.contextPath), dataPath.$expr, updateFunctionLibrary.call(this, this.contextPath));
            }

            if (isVar(dataPath)) {
                return this.getVar(dataPath);
            }

            return this.getDataByPath(dataPath, true);
        }

        function getId(viewDef, key) {
            return viewsUtils.sanitizeCompId(_.compact([this.props.viewProps.compId, this.props.viewId, this.contextPath, viewDef && viewDef.id, key]).join("_"));
        }

        /**
         * Evaluate the values of a viewDef object such as layout, css, event's params.
         * @param {object} obj The view definition object
         * @param {string} contextPath the contextPath that will be used to resolve expressions
         * @returns {object}
         */
        function getViewDefObject(obj, contextPath) {
            var mapper = _.isArray(obj) ? _.map : _.mapValues;
            return mapper(obj, function (val) {
                var result = val;
                if (expression.isExpression(val)) {
                    result = expression.evaluate(resolveExpressionRef.bind(this, contextPath), val.$expr, updateFunctionLibrary.call(this, contextPath));
                } else if (_.isArray(val) || _.isPlainObject(val)) {
                    result = getViewDefObject.call(this, val, contextPath);
                }
                return expression.convertStringToPrimitive(result);
            }, this);
        }

        /**
         * This function checks if additional classes needs to be added to a node,
         * used currently since we need to add different "display" properties for different browsers
         * in the flex implementation...
         * @param style
         * @returns {string}
         */
        function getAdditionalClasses(style) {
            if (style && style.display && style.display === "box") {
                delete style.display;
                return "flex_display";
            }
            return '';
        }

        function getComponentStructure(proxyStyle, componentType) {
            var compStructure = {
                layout: proxyStyle,
                componentType: componentType
            };

            if (this.useSkinInsteadOfStyles) {
                compStructure.skin = this.getCompProp("skin") || styleData.getDefaultSkinName(this.getCompProp("name"));
                return compStructure;
            }

            var skinAndStyle = styleData.getSkinAndStyle(
                this.props.viewProps.siteData.getAllTheme(),
                this.getCompProp("name"),
                this.getCompProp("styleNS"),
                this.getCompProp("style"),
                this.getCompProp("skin"));

            return _.assign(skinAndStyle, compStructure);
        }

        function getDataProps(props) {
            return _.pick(props, function (value, key) {
                return key.indexOf("data-") === 0;
            });
        }

        function transformSkinProperties(transformSkinPropertiesFunc, refData) {
            refData[''] = _.merge({}, refData[''], getDomEvents.call(this), wixappsPlugins.getAdditionalDomAttributes(this));
            if (!transformSkinPropertiesFunc) {
                return refData;
            }

            _.assign(refData[""], getDataProps(this.props));

            var data = transformSkinPropertiesFunc(refData);
            _.forEach(data, function (skinPart) {
                if (skinPart && skinPart.style) {
                    skinPart.style = styleTranslator.translate(skinPart.style, this.props.orientation);
                }
            }, this);

            return data;
        }

        function extendEventWithEvaluatedParamsFromLogicalEvent(event, logicalEvent) {
            if (logicalEvent.params) {
                event.params = getViewDefObject.call(this, logicalEvent.params, this.contextPath);
            }
        }

        /**
         * @class proxies.mixins.baseProxy
         * @extends {ReactCompositeComponent}
         * @property {proxy.properties} props
         * @property {bool} useSkinInsteadOfStyles
         * @property {function(): ReactCompositeComponent} renderProxy
         */
        return {
            statics: {
                /**
                 * Return prop definitions for the given type
                 * @param {string} type can be either "compProp" or "viewProp"
                 * @returns {*}
                 */
                getPropDefs: function (type) {
                    if (_.includes(['compProp', 'viewProp'], type)) {
                        var propDefs = {};
                        _.forOwn(this, function (propDef, propName) {
                            if (propDef.type === type) {
                                propDefs[propName] = propDef;
                            }
                        });
                        return propDefs;
                    }
                },
                hidden: {type: 'compProp', defaultValue: false},
                style: {type: 'compProp', defaultValue: null},
                layout: {type: 'viewProp', defaultValue: {}}
            },

            //TODO: move to dataAccessMixin
            getDataByPath: function (dataPath, resolveRef) {
                var data = this.props.viewProps.getDataByPath(this.contextPath, dataPath);
                if (resolveRef && isDataItemRef(data)) {
                    return this.props.viewProps.getDataByFullPath(generateItemIdFromRef(data));
                }
                return data;
            },

            getVar: function (varName) {
                return this.props.viewContextMap.getVar(this.contextPath, varName);
            },

            setVar: function (varName, value, silent) {
                this.props.viewProps.setVar(this.contextPath, varName, value, silent);
            },

            getContextEvent: function (eventName) {
                return this.props.viewContextMap.getEvent(this.contextPath, eventName);
            },

            /**
             *
             * @param {object=} childViewDef
             * @param {Array=} customContextDataPath
             * @param {extraContextProps=} extraContextProps
             * @returns {proxy.properties}
             */
            getChildProxyProps: function (childViewDef, customContextDataPath, extraContextProps) {
                var contextProps = null;

                if (customContextDataPath) {
                    contextProps = {
                        path: customContextDataPath,
                        vars: extraContextProps.vars || {},
                        events: extraContextProps.events || {},
                        functionLibrary: extraContextProps.functionLibrary || {}
                    };
                }

                // what if data is a var that is about to be defined in the inner context?
                //var proxyData = getProxyData.call(this, childViewDef, customContextDataPath);
                var props = {
                    // props

                    ref: 'child',

                    // wixapps
                    viewName: this.props.viewName,
                    forType: this.props.forType,
                    formatName: this.props.formatName,
                    orientation: this.props.orientation,
                    viewDef: childViewDef,
                    parentId: this.props.parentId,
                    viewId: this.props.viewId,
                    logicEvents: this.props.logicEvents,
                    logic: this.props.logic,
                    functionLibrary: this.props.functionLibrary,

                    parentContextPath: this.contextPath,
                    contextProps: contextProps,

                    viewContextMap: this.props.viewContextMap,
                    viewProps: this.props.viewProps,
                    id: getId.call(this, childViewDef, 'child')
                };

                return props;
            },

            /**
             * Get the props that can be used to create a child component.
             * @param {string=} componentType The component name if it's a Wix component or null if you create native element like React.DOM.div.
             * @param {function(object): object=} transformSkinPropertiesFunc Function that will be used to add or remove props from the component skin parts.
             * @returns {comp.properties}
             */
            getChildCompProps: function (componentType, transformSkinPropertiesFunc) {
                // TODO: split this function when creating a wysiwyg component or creating DOM element
                var defaultProps = {
                    id: getId.call(this, this.props.viewDef, this.props.key),
                    ref: 'component'
                };

                if (!componentType) {
                    defaultProps.style = this.getProxyStyle();
                    defaultProps.className = getProxyCssClassName.call(this, defaultProps.style); //might be classes based on "display"
                    return _.assign(defaultProps, getDomEvents.call(this), wixappsPlugins.getAdditionalDomAttributes(this), getDataProps(this.props));
                }

                var proxyStyle = this.getProxyStyle();
                var compStructure = getComponentStructure.call(this, proxyStyle, componentType);
                var props = santaProps.componentPropsBuilder.getCompProps(compStructure, this.props.viewProps.siteAPI, this.props.viewProps.rootId, this.props.viewProps.loadedStyles);
                delete props.style.position;

                var style = _.merge(props.style, proxyStyle);
                props.className = getProxyCssClassName.call(this, style);

                return _.assign(props, defaultProps, {
                    transformSkinProperties: transformSkinProperties.bind(this, transformSkinPropertiesFunc),
                    style: style,
                    compProp: this.props.compProp
                });
            },

            getViewDefProp: function (propName, viewDef, contextPath) {
                viewDef = viewDef || this.props.viewDef || {};
                contextPath = contextPath || this.contextPath;

                var value = viewDef[propName];
                var ret = value;

                if (expression.isExpression(value)) {
                    ret = expression.evaluate(resolveExpressionRef.bind(this, contextPath), value.$expr, updateFunctionLibrary.call(this, contextPath));
                } else if (propName === "layout" || propName === "css" || propName === "stylesheet") {
                    return getViewDefObject.call(this, value, contextPath);
                }

                return expression.convertStringToPrimitive(ret);
            },

            getCompProp: function (propName, viewDef, contextPath) {
                contextPath = contextPath || this.contextPath;
                var compDef = this.getViewDefProp("comp", viewDef, contextPath);
                if (!compDef) {
                    return undefined;
                }
                return this.getViewDefProp(propName, compDef, contextPath);
            },

            /**
             * Gets the style of the proxy.
             * @param {object=} viewDef If passed, it's the view definition that will be used to read the layout and css from.
             * @param {string=} contextPath applies only when a custom view def was passed
             * @returns {object} The style definition of the proxy.
             */
            getStyleDef: function (viewDef, contextPath) {
                if (viewDef) {
                    return _.merge({}, this.getCompProp('css', viewDef, contextPath), this.getViewDefProp('layout', viewDef, contextPath));
                }

                var customStyle = {};
                if (this.getCustomStyle) {
                    customStyle = this.getCustomStyle();
                }
                return _.merge(customStyle, this.getCompProp('css'), this.getViewDefProp('layout'), this.props.proxyLayout);
            },

            // this will process all styles needed for the current proxy
            getProxyStyle: function () {
                var style = this.getStyleDef();
                var orientation = this.props.orientation || 'vertical';
                var direction = this.props.viewProps.compProp && this.props.viewProps.compProp.direction;

                style.boxSizing = 'border-box';
                style = spacersCalculator.translateStaticSpacers(style, orientation, direction);
                style = styleTranslator.translate(style, this.props.orientation);

                return style;
            },

            /**
             * handles the events from the view definition.
             * @param {SyntheticEvent} event The logical or dom event.
             * @param {string} domID DOM id to pass to the callback.
             */
            handleViewEvent: function (event, domID) {
                var viewEvents = this.getCompProp("events");
                var logic = this.props.logic;

                var logicalEvent = viewEvents && (viewEvents[event.type] || viewEvents['dom:' + event.type] || viewEvents['dom:' + event.type.toLowerCase()]);
                if (!logicalEvent) {
                    return;
                }

                var logicalEventName = _.isString(logicalEvent) ? logicalEvent : logicalEvent.event;
                if (!logicalEventName) {
                    return;
                }

                _.forEach(logicalEventName.split(';'), function (singleLogicalEventName) {
                    // Check if the event is inline setter event.
                    var setFunc = singleLogicalEventName.trim().match(/^set:([^=]+)=(.+)$/);
                    if (setFunc) {
                        var value = expression.evaluate(resolveExpressionRef.bind(this, this.contextPath), setFunc[2].trim(), updateFunctionLibrary.call(this, this.contextPath));
                        var dataItem = setFunc[1].trim();
                        if (isVar(dataItem)) {
                            this.props.viewProps.setVar(this.contextPath, dataItem, value);
                        } else {
                            this.props.viewProps.setDataByPath(this.contextPath, dataItem, value);
                        }
                        return;
                    }

                    var contextEventHandler = this.getContextEvent(singleLogicalEventName);
                    if (_.isFunction(contextEventHandler)) { // try to handle the event using the context event handler
                        extendEventWithEvaluatedParamsFromLogicalEvent.call(this, event, logicalEvent);
                        contextEventHandler(event, domID);
                        return;
                    }

                    // then look for the handler in the logic
                    if (!logic) {
                        throw "Error:: Missing logic - cannot handle event [" + singleLogicalEventName + "]";
                    }
                    if (!_.isFunction(logic[singleLogicalEventName])) {
                        throw "Error:: Logic missing implementation for event [" + singleLogicalEventName + "]";
                    }

                    extendEventWithEvaluatedParamsFromLogicalEvent.call(this, event, logicalEvent);

                    var path = this.getViewDefProp("data") || "this";
                    event.dataPath = this.props.viewProps.getNormalizedDataPath(this.contextPath, path);

                    logic[singleLogicalEventName](event, domID);
                }, this);
            },

            createContext: function (parentContextPath, path, vars, events, functionLibrary) {
                var childContextVars = _.merge({}, vars.view, vars.proxy, this.getViewDefProp("vars"));
                var newContextData = this.props.viewProps.getDataByPath(parentContextPath, path);
                // first context is always a data item context
                if (parentContextPath === null || isDataItem(newContextData)) {
                    var dataItemPath = this.props.viewProps.getNormalizedDataPath(parentContextPath, path);
                    return this.props.viewContextMap.newContextForDataItem(parentContextPath, dataItemPath, childContextVars, events, functionLibrary);
                } else if (isDataItemRef(newContextData)) {
                    return this.props.viewContextMap.newContextForDataItem(parentContextPath, generateItemIdFromRef(newContextData), childContextVars, events, functionLibrary);
                }
                return this.props.viewContextMap.newContextForDataPath(parentContextPath, path, childContextVars, events, functionLibrary);
            },

            getInitialState: function () {
                createContextByProps.call(this, this.props);
                this.proxyData = getProxyData.call(this);
                return {};
            },

            componentWillUpdate: function (nextProps) {
                if (!this.props.viewContextMap.hasContext(this.contextPath)) {
                    createContextByProps.call(this, nextProps);
                }
                var contextProps = nextProps.contextProps;
                if (contextProps && contextProps.vars && contextProps.vars.proxy) {
                    this.props.viewContextMap.overrideContextVars(this.contextPath, contextProps.vars.proxy);
                }
                this.proxyData = getProxyData.call(this, nextProps);
            },

            render: function () {
                if (this.props.viewProps.siteData.isDebugMode()) {
                    return render.call(this);
                }
                try {
                    return render.call(this);
                } catch (e) {
                    utils.log.error('Cannot render proxy ' + this.constructor.displayName + ' with id: ' + this.props.id, e);
                    return null;
                }
            }
        };
    });

/**
 * @typedef {object} proxy.properties
 * @property {core.SiteAPI} siteAPI
 * @property {data.compPropertiesItem} compProp
 * @property {object} loadedStyles
 * @property {string} viewName
 * @property {string} formatName
 * @property {string} orientation
 * @property {object} viewDef
 * @property {object} dataContext
 * @property {string} contextPath
 * @property {object} proxyData
 * @property {string} parentId
 * @property {string} viewId
 * @property {wixappsCore.ViewContextMap} viewContextMap
 * @property {function(): object} getViewDef
 * @property {function(string): object} getViewDataById
 * @property {function(): object} getLocalizationBundle
 * @property {object} logic
 */

/**
 * @typedef {object} extraContextProps
 * @property {object} vars
 * @property {object} events
 * @property {object} functionLibrary
 */
