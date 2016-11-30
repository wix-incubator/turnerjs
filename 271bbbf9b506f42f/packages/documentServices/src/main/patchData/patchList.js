define(['lodash'], function (_) {
    'use strict';
    var allEscapedSlashes = new RegExp('~1', 'g');
    var allEscapedTildes = new RegExp('~0', 'g');


    function unescape(str) {
        return str.replace(allEscapedSlashes, '/').replace(allEscapedTildes, '~');
    }

    function sanitizeValue(val) {
        return /^\d+$/.test(val) ? Number(val) : val;
    }

    function getPathArray(path) {
        return _(path)
            .split('/')
            .slice(1)
            .map(unescape)
            .map(sanitizeValue)
            .value();
    }


    var applyOperation = {
        add: function (ps, patch) {
            var path = getPathArray(patch.path);
            var containerPath = _.initial(path);
            var containerValue = ps.dal.full.getByPath(containerPath);
            var indexInContainer = _.last(path);
            if (_.isArray(containerValue)) {
                ps.dal.full.pushByPath(containerPath, patch.value, indexInContainer);
            } else if (containerValue[indexInContainer] !== patch.value){
                ps.dal.full.setByPath(path, patch.value);
            }
        },
        remove: function (ps, patch) {
            ps.dal.full.removeByPath(getPathArray(patch.path));
        },
        replace: function (ps, patch) {
            var path = getPathArray(patch.path);
            if (ps.dal.full.isPathExist(path)) {
                ps.dal.full.setByPath(path, patch.value);
            } else {
                var err = new Error('replace operation in nonexisting path');
                err.patch = patch;
                throw err;
            }
        },
        move: function(ps, patch) {
            var from = getPathArray(patch.from);
            var path = getPathArray(patch.path);
            var value = ps.dal.full.getByPath(from);
            ps.dal.full.removeByPath(from);
            ps.dal.full.setByPath(path, value);
        },
        copy: function(ps, patch) {
            var from = getPathArray(patch.from);
            var path = getPathArray(patch.path);
            var value = ps.dal.full.getByPath(from);
            ps.dal.full.setByPath(path, value);
        },
        test: function(ps, patch) {
            var path = getPathArray(patch.path);
            if (!_.isEqual(ps.dal.full.getByPath(path), patch.value)) {
                var err = new Error('test operation failed');
                err.patch = patch;
                throw err;
            }
        }
    };

    function applyPatch(ps, patch) {
        if (!patch || !applyOperation[patch.op]) {
            var err = new Error('Patch not properly formatted');
            err.patch = patch;
            throw err;
        }
        applyOperation[patch.op](ps, patch);
    }

    return {
        applyPatchList: function (ps, patches) {
            if (!patches || !patches.length) {
                return;
            }
            patches.forEach(applyPatch.bind(null, ps));
        }
    };
});

