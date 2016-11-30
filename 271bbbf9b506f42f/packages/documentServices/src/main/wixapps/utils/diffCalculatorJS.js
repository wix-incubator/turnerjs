define(['lodash'], function (_) {
    'use strict';

    function getItemsDiff(lastSnapshot, currentSnapshot, ignoreFields, transformFunc) {
        var created = [];
        var updated = [];
        var deleted = [];

        _.forEach(lastSnapshot, function (typeItems, typeId) {
            _.forEach(typeItems, function (item, itemKey) {
                var itemInCurrentSnapshot = currentSnapshot[typeId] && currentSnapshot[typeId][itemKey];
                if (itemInCurrentSnapshot) {
                    if (!_.isEqual(_.omit(item, ignoreFields), _.omit(itemInCurrentSnapshot, ignoreFields))) {
                        var changedItem = transformFunc ? transformFunc(item, itemInCurrentSnapshot) : itemInCurrentSnapshot;
                        updated.push(changedItem);
                    }
                } else {
                    deleted.push(itemKey);
                }
            });
        });

        _.forEach(currentSnapshot, function (typeItems, typeId) {
            _.forEach(typeItems, function (item, itemKey) {
                var itemInLastSnapshot = lastSnapshot[typeId] && lastSnapshot[typeId][itemKey];
                if (!itemInLastSnapshot) {
                    created.push(item);
                }
            });
        });

        return {
            created: created,
            updated: updated,
            deleted: deleted
        };
    }

    return {
        getItemsDiff: getItemsDiff
    };
});