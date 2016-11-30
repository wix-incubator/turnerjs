define(["lodash"], function (_) {
    "use strict";

    function resolvePath(source, path) {
        var ret = source;
        for (var i = 0; i < path.length; i++) {
            var prop = path[i];
            if (_.has(ret, prop)) {
                ret = ret[prop];
            } else {
                return null;
            }
        }
        return ret;
    }

    function ensurePath(source, path) {
        var ret = source;
        for (var i = 0; i < path.length; i++) {
            var prop = path[i];
            if (!_.has(ret, prop)) {
                ret[prop] = {};
            }
            ret = ret[prop];
        }
    }

    function setInPath(source, path, value) {
        var scope = resolvePath(source, _.initial(path));
        if (scope !== null) {
            scope[_.last(path)] = value;
        }
    }

    function filter(source, predicate, canEnterSubtreePredicate) {
        canEnterSubtreePredicate = canEnterSubtreePredicate || function () {
            return true;
        };
        var ret = [];
        var findInner = function (obj) {
            if (obj === undefined || obj === null) {
                return;
            }

            if (predicate(obj)) {
                ret.push(obj);
            }

            if (!canEnterSubtreePredicate(obj)) {
                return;
            }

            if (_.isPlainObject(obj) || _.isArray(obj)) {
                _.forEach(obj, function (value) {
                    findInner(value);
                });
            }
        };

        findInner(source);
        return ret;
    }

    function findPath(obj, predicate, path) {
        path = path || [];

        if (predicate(obj)) {
            return path;
        }

        var found = null;
        if (_.isPlainObject(obj) || _.isArray(obj)) {
            _.forEach(obj, function (val, key) {
                found = findPath(obj[key], predicate, path.concat(key));
                if (found) {
                    return false;
                }
            });
        }

        return found;
    }

    // Unlike _.cloneDeep, this has no protection against circular data structures
    function cloneDeep(value) {
        if (_.isArray(value)) {
            return _.map(value, cloneDeep);
        }
        if (_.isObject(value)) {
            return _.mapValues(value, cloneDeep);
        }
        return value;
    }

    function isDifferent(a, b) {
        return !_.isEqual(a || null, b || null);
    }

    /**
     * @class utils.objectUtils
     */
    return {
        resolvePath: resolvePath,
        ensurePath: ensurePath,
        setInPath: setInPath,
        filter: filter,
        findPath: findPath,
        cloneDeep: cloneDeep,
        isDifferent: isDifferent
    };
});
