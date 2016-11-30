define(['lodash'], function (_) {
    'use strict';

    function getItemsDiff(lastSnapshot, currentSnapshot, ignoreFields, transformFunc) {
        var updated = [];
        var deleted = [];

	    lastSnapshot.forEach(function (typeItems, typeId) {
		    typeItems.forEach(function (item, itemKey) {
			    var itemInCurrentSnapshot = currentSnapshot.getIn([typeId, itemKey]);
                if (itemInCurrentSnapshot) {
	                var itemJS = item.toJS();
	                var itemInCurrentSnapshotJS = itemInCurrentSnapshot.toJS();
	                if (!_.isEqual(_.omit(itemJS, ignoreFields), _.omit(itemInCurrentSnapshotJS, ignoreFields))) {
		                var changedItem = transformFunc ? transformFunc(itemJS, itemInCurrentSnapshotJS) : itemInCurrentSnapshotJS;
                        updated.push(changedItem);
                    }
                } else {
                    deleted.push(itemKey);
                }
            });
        });

	    var created = currentSnapshot.reduce(function (createdItems, itemsOfType, typeId) {
		    var lastItemsOfType = lastSnapshot.get(typeId);
			var newItemsOfType = lastItemsOfType ? itemsOfType.filterNot(function (item, itemKey) {return lastItemsOfType.has(itemKey);}) : itemsOfType;

		    return createdItems.concat(newItemsOfType.toList().toJS());
	    }, []);

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