define(['lodash'], function(_) {
    'use strict';

    return function getDomSelectors(React, ReactDOM) {

        var testUtils = React.addons.TestUtils;
        var rootComponent;

        function findDOMNode(element) {
            if (element) {
                try {
                    element = ReactDOM.findDOMNode(element);
                } catch (e) {
                    element = null;
                }
            }
            return element;
        }

        function isDescendantOf(node, ancestor) {
            var currentElement = node;
            while (currentElement) {
                if (currentElement === ancestor) {
                    return true;
                }
                currentElement = currentElement.parentElement;
            }
            return false;
        }

        function getByDisplayNameAndProps(container, displayName, props) {
            displayName = (displayName || '').toLowerCase();
            props = props || {};
            container = findDOMNode(container);
            return testUtils.findAllInRenderedTree(rootComponent, function (comp) {
                // stateless component are passed to the predicate as null
                if (!comp) {
                    return false;
                }
                var domNode, displayNameAndPropsMatch;

                if (testUtils.isDOMComponent(comp)) {
                    domNode = comp;
                    displayNameAndPropsMatch = compareDomNodeAttributesAndTagName(comp, displayName, props);
                } else {
                    domNode = findDOMNode(comp);
                    displayNameAndPropsMatch = compareCompositeCompPropsAndDisplayName(comp, displayName, props);
                }

                return displayNameAndPropsMatch && (!container || isDescendantOf(domNode, container));
            });
        }

        function compareDomNodeAttributesAndTagName(elm, tagName, props){
            var matchingProps = _.every(props, function(propValue, propName){
                if (propName === 'children') {
                    return propValue === elm.innerHTML;
                }
                propName = propName === 'className' ? 'class' : propName;
                var elmAttrVal = elm.getAttribute(propName);
                return elmAttrVal === propValue;
            });
            return (!tagName || elm.tagName.toLowerCase() === tagName) && matchingProps;
        }

        function compareCompositeCompPropsAndDisplayName(comp, displayName, props){
            var compName = (_.get(comp, 'constructor.displayName') || '').toLowerCase();
            var compProps = _.pick(comp.props, _.keys(props));
            return (!displayName || compName === displayName) && _.isEqual(compProps, props);
        }


        function deepCloneProps(depth, value, key) {
            var excludedKeys = ['viewerprivateservices', 'siteapi', 'sitedata', 'documentservices', 'context', 'editorapi', 'dbeditorapi', 'windowclickeventaspect', 'windowscrolleventaspect'];
            var lowerCaseKey = _.isString(key) ? key.toLowerCase() : key;
            if (_.includes(excludedKeys, lowerCaseKey) || _.isFunction(value) || _.startsWith(key, '_')) {
                return {};
            }
            if (depth > 10) {
                return '';
            }
            if (_.isArray(value)) {
                return _.map(value, function (val) {
                    return deepCloneProps(depth + 1, val);
                });
            }
            if (_.isPlainObject(value)) {
                return _.mapValues(value, function (val, k) {
                   return deepCloneProps(depth + 1, val, k);
                });
            }
            return value;
        }

        return {

            getElementsByDisplayNameAndProps: function (container, displayName, props) {
                var result = getByDisplayNameAndProps(container, displayName, props);
                return _.map(result, findDOMNode);
            },

            getComponentsByDisplayNameAndProps: getByDisplayNameAndProps,

            getComponentPropsByHtmlElement: function (htmlElement, displayName) {
                displayName = (displayName || '').toLowerCase();
                var comp = testUtils.findAllInRenderedTree(rootComponent, function (node) {
                    var compName = (_.get(node, 'constructor.displayName') || '').toLowerCase();
                    return (!displayName || compName === displayName) && findDOMNode(node) === htmlElement;
                })[0];
                if (!comp) {
                    return null;
                }
                var compProps = deepCloneProps(0, comp.props);
                return JSON.stringify(compProps);
            },

            addAllDisplayNamesToDom: function (container) {
                container = findDOMNode(container);
                var allComps = testUtils.findAllInRenderedTree(rootComponent, function (reactComp) {
                    var node = findDOMNode(reactComp);
                    var nodeDisplayName = _.get(reactComp, 'constructor.displayName');
                    return node && nodeDisplayName && nodeDisplayName !== 'ReactDOMComponent' && (!container || isDescendantOf(node, container));
                });
                _(allComps)
                    .map(function (reactComp) { //clean all previous data-displaynames
                        var domNode = findDOMNode(reactComp);
                        domNode.setAttribute('data-displayname', '');
                        return {
                            domNode: domNode,
                            reactComp: reactComp
                        };
                    })
                    .forEach(function (item) { //add all new data-displaynames
                        var domNode = item.domNode;
                        var newDisplayName = item.reactComp.constructor.displayName;
                        var displayNames = domNode.getAttribute('data-displayname');
                        displayNames = displayNames ? (displayNames + ' ' + newDisplayName ) : newDisplayName;
                        domNode.setAttribute('data-displayname', displayNames);
                    }).value();
            },

            setSearchRoot: function (rootComp) {
                rootComponent = rootComp;
            }

        };
    };
});
