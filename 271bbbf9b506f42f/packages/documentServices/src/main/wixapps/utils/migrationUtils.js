define([
    'lodash',
    'wixappsCore',
    'utils',
    'documentServices/wixapps/utils/migration/textFieldMigration',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/services/items',
    'documentServices/wixapps/services/views',
    'documentServices/wixapps/services/lists'
], function (_, wixapps, utils, textFieldMigration, pathUtils, itemsPs, views, lists) {
    'use strict';

    var byTypeMigrators = {
        "wix:RichText": textFieldMigration
    };

    function getFieldsMap(viewDef) {
        var fieldsMap = {};
        wixapps.viewsUtils.traverseViews(viewDef, function (singleViewDef) {
                var compName = _.get(singleViewDef, 'comp.name');
                if (compName === 'TextField' || compName === 'Field') {
                    fieldsMap[singleViewDef.data] = singleViewDef;
                }
            }
        );
        return fieldsMap;
    }


    function getFieldPath(viewDef, fieldName) {
        return utils.objectUtils.findPath(viewDef, function (obj) {
            return obj && obj.data === fieldName;
        });
    }

    function migrate(viewDef, mobileViewDef, items, fields, partVersion) {
        var desktopFieldsMap = getFieldsMap(viewDef);
        var mobileFieldsMap = getFieldsMap(mobileViewDef);

        var fieldByType = _(fields).filter(function (field) {
            return _.has(byTypeMigrators, field.type);
        }).groupBy('type').value();

        var migrationResults = _.map(fieldByType, function (fieldsOfType, type) {
            return _.map(fieldsOfType, function (field) {
                var fieldName = field.name;
                var desktopField = desktopFieldsMap[fieldName];
                var mobileField = mobileFieldsMap[field.name];
                var data = _.mapValues(items, function (item) {
                    return _.pick(item, fieldName);
                });
                return {
                    fieldName: fieldName,
                    result: byTypeMigrators[type].migrate(desktopField, mobileField, data, partVersion)
                };
            });
        });

        return _(migrationResults).flatten().reduce(function (acc, migrationResult) {
            var desktopPath = getFieldPath(acc.viewDef, migrationResult.fieldName);
            var mobilePath = getFieldPath(acc.mobileViewDef, migrationResult.fieldName);
            return {
                viewDef: _.set(acc.viewDef, desktopPath, migrationResult.result.viewDef),
                mobileViewDef: _.set(acc.mobileViewDef, mobilePath, migrationResult.result.mobileViewDef),
                items: _.defaultsDeep(migrationResult.result.data, acc.items)
            };
        }, {viewDef: viewDef, mobileViewDef: mobileViewDef, items: items});
    }

    function migrateList(ps, listId) {
        var viewDef = lists.getItemView(ps, listId);
        var mobileViewDef = lists.getItemView(ps, listId, 'Mobile');
        var type = lists.getType(ps, listId);
        var typeItems = itemsPs.getAllItemsOfType(ps, type.name);
        var partVersion = lists.getVersion(ps, listId);

        var migrationResult = migrate(viewDef, mobileViewDef, typeItems, type.fields, partVersion);

        views.setValueInView(ps, type.name, viewDef.name, [], migrationResult.viewDef);
        views.setValueInView(ps, type.name, viewDef.name, [], migrationResult.mobileViewDef, 'Mobile');
        itemsPs.setAllItemsOfType(ps, type.name, migrationResult.items);
    }

    return {
        migrate: migrate,
        migrateList: migrateList
    };
});
