/**
 * created by Omri
 * Date: 11/16/12
 * Time: 12:02 PM
 */
var nsUtil = (function () {
    'use strict';

    var cachedResolvedNSs = {} ;

    return {
        /**
         * Sets a value in a namesoace defined by a string
         * Examples:
         * <li>nsUtil.setNameSpace({}, 'a.b.c', true) will result in: {a:{b:{c:true}}}</li>
         * <li>nsUtil.setNameSpace({a:{b:{c:false}}}, 'a.b.c', true) will result in: {a:{b:{c:true}}}</li>
         *
         * @param {Object} rootScope
         * @param {String} nsString the namespace (in rootScope) to create and populate with value
         * @param {*} value
         * @returns {Object} rootScope
         */
        setNameSpace:function (rootScope, nsString, value) {
            var names = nsString.split('.');
            var name;
            var i, l = names.length - 1;
            for (i = 0; i < l; i++) {
                name = names[i];
                rootScope[name] = rootScope[name] || {};
                rootScope = rootScope[name];
            }
            rootScope[names[l]] = value;
            return rootScope;
        },

        /**
         * Gets a value in a namesoace defined by a string
         *
         * @param {Object} rootScope
         * @param {String} nsString the namespace (in rootScope) to create and populate with value
         * @returns {*}
         */
        getNameSpace:function (rootScope, nsString) {
            /**
             * todo: test for regression and add argument for ignoreCache
             */
//            var namespaceToFind = ''.concat(rootScope, nsString);
//            if(cachedResolvedNSs[namespaceToFind]) {
//                return cachedResolvedNSs[namespaceToFind] ;
//            }
            var names = (nsString || '').split('.');
            var name = names[0];
            var namespace = rootScope;
            var i = 0;
            while (name) {
                if (namespace && namespace[name]) {
                    namespace = namespace[name];
                } else {
                    return undefined;
                }
                name = names[++i];
            }
//            cachedResolvedNSs[namespaceToFind] = namespace ;
            return namespace;
        },

        /**
         * Analyze a map object and returns an array of namspaces defined in the map.
         * The values of leafs (i.e. any node who's value is not an Object)
         * <p>
         *     <b>Examples:</b>
         * <li> getNamespacesAsStrings({}) => []
         * <li> getNamespacesAsStrings({a: true}) => ['a']
         * <li> getNamespacesAsStrings({a: {b: 'Value'}}) => ['a.b']
         * <li> getNamespacesAsStrings({a: {b: 'Value'}}, <b>true</b>) => ['a', 'a.b'] <i>a (a non leaf node) is included in the result</i>
         * <li> getNamespacesAsStrings({a: {b: {}}}) => [] <i>there are no leaf namespaces: a.b contains an empty object</i>
         * <li> getNamespacesAsStrings({a: {b: {}}}, <b>true</b>) => ['a', 'a.b']
         * </p>
         *
         * @param {Object} map An object to analyze
         * @param {Boolean?} includeNonLeaf If true, the result will include nodes with children. By default, only leaf node are included in the result.
         * @return {Array<String>} An array of namespaces as strings
         */
        getNamespacesAsStrings:function (map, includeNonLeaf) {
            var result = [];
            var addNamespaceToResult = function (value, namespace) {
                result.push(namespace);
            };

            if (includeNonLeaf) {
                this.forEachNode(map, addNamespaceToResult);
            } else {
                this.forEachLeaf(map, addNamespaceToResult);
            }
            return result;
        },

        /**
         * Runs <i>functionToExecute</i> on each <b>leaf</b> node in <i>map</i> with the arguments: nodeValue, nodeNamespaceString
         * <p>
         *     <b>Notes:</b>
         *     1. Arrays, functions, strings etc are treated as <b>leafs</b>. There is no exploration of their fields.
         *     2. Native object (i.e. literal {}) are treated as <b>non leafs</b>
         *     3. It is <b>not safe to modify</b> the map (or child maps) within <i>functionToExecute</i>, except for changing values of <b>leafs<b> with <b>other leafs</b>
         * </p>
         * <p>
         *     <b>Examples</b>
         * <li> forEachNode(null, func) => func(null, '')
         * <li> forEachNode(null, func, 'some.name.space') => func(null, 'some.name.space');
         * <li> forEachNode({}, func) => func({}, '');
         * <li> forEachNode({a: true}, func) => func({a: true},''); func(true, 'a');
         * <li> forEachNode({a: b: {}}, func) => func({a: b: {}}, ''); func({b: {}}, 'a'); func({}, 'a.b');
         * <li> forEachNode(['Arrays', 'are', 'considered', {leafs:'!'}]) -> func(['Arrays', 'are', 'considered', {leafs:'!'}], '');
         * </p>
         * @param {Object} map A simple object (containing other maps), where non object nodes are considered as leafs.
         * @param {Function} functionToExecute Called for each node: functionToExecute(nodeValue, nodeNamespaceString)
         * @param {String?} namespace A base namespace to be added to namespaces of map
         */
        forEachNode:function (map, functionToExecute, namespace) {
            namespace = namespace || '';
            functionToExecute(map, namespace);

            if (typeof map == 'object' && !(map instanceof Array || map instanceof Function)) {
                for (var key in map) {
                    if(map.hasOwnProperty(key)){
                        var childNamespace = (namespace === '') ? key : namespace + '.' + key;
                        this.forEachNode(map[key], functionToExecute, childNamespace);
                    }
                }
            }
        },

        /**
         * Runs <i>functionToExecute</i> on each <b>leaf</b> node in <i>map</i> with the arguments: nodeValue, nodeNamespaceString
         * <p>
         *     <b>Notes:</b>
         *     1. Arrays, functions, strings etc are treated as <b>leafs</b>. There is no exploration of their fields.
         *     2. Native object (i.e. literal {}) are treated as <b>non leafs</b>
         *     3. It is <b>not safe to modify</b> the map (or child maps) within <i>functionToExecute</i>, except for changing values of <b>leafs<b> with <b>other leafs</b>
         * </p>
         * <p>
         *     <b>Examples</b>
         * <li> forEachLeaf(null, func) => func(null, '')
         * <li> forEachLeaf(null, func, 'some.name.space') => func(null, 'some.name.space');
         * <li> forEachLeaf({}, func) => nothing <i>no leafs (an empty object is not considered as a leaf)</i>
         * <li> forEachLeaf({a: b: {}}, func) => nothing <i>no leafs (an empty object is not considered as a leaf)</i>
         * <li> forEachLeaf({a: true}, func) => func(true, 'a');
         * <li> forEachLeaf(['Arrays', 'are', 'considered', {as:'leafs'}]) -> func(['Arrays', 'are', 'considered', {as:'leafs'}], '');
         * </p>
         * @param {Object} map A simple object (containing other maps), where non object nodes are considered as leafs.
         * @param {Function} functionToExecute Called for each node: functionToExecute(nodeValue, nodeNamespaceString)
         * @param {String?} namespace A base namespace to be added to namespaces of map
         */
        forEachLeaf:function (map, functionToExecute, namespace, exclude) {
            namespace = namespace || '';

            if (map && typeof map === 'object' && !map.define) {
                for (var key in map) {
                    if(map.hasOwnProperty(key)){
                        var childNamespace = (namespace === '') ? key : namespace + '.' + key;
                        this.forEachLeaf(map[key], functionToExecute, childNamespace, exclude);
                    }
                }
            } else {
                if(!exclude || exclude.indexOf(namespace) === -1){
                    functionToExecute(map, namespace);
                }
            }
        }
    };
})();
