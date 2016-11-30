define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var ERROR_TEMPLATE_MISSING_ITEM_VIEW = 'The template is missing an item view';

    function replaceNestedFieldRefs(fieldMap, viewDefPart) {
        if (!_.isObject(viewDefPart)) {
            return viewDefPart;
        }

        _.forEach(viewDefPart, function (innerViewDefPart) {
            replaceNestedFieldRefs(fieldMap, innerViewDefPart);
        });

        if (_.has(viewDefPart, 'data') && fieldMap[viewDefPart.data]) {
            viewDefPart.data = fieldMap[viewDefPart.data];
        }
    }

    function isSameFieldType(firstField, secondField) {
        var firstShowAsHint = firstField.metadata && firstField.metadata.showAsHint;
        var secondShowAsHint = secondField.metadata && secondField.metadata.showAsHint;
        return firstField.type === secondField.type && firstShowAsHint === secondShowAsHint;
    }

    function matchFieldsByType(sourceFields, targetFields) {
        var ignoreFields = ['title', 'links'];
        var fieldMap = _.zipObject(ignoreFields, ignoreFields);

        sourceFields = _.reject(sourceFields, function (field) {
            return _.includes(ignoreFields, field.name);
        });
        targetFields = _.reject(targetFields, function (field) {
            return _.includes(ignoreFields, field.name);
        });

        _.forEach(sourceFields, function (sourceField) {
            var matchingTargetFieldIndex = _.findIndex(targetFields, isSameFieldType.bind(this, sourceField));
            if (matchingTargetFieldIndex !== -1) {
                fieldMap[sourceField.name] = targetFields[matchingTargetFieldIndex].name;
                targetFields.splice(matchingTargetFieldIndex, 1);
            } else {
                fieldMap[sourceField.name] = null;
            }
        });

        return fieldMap;
    }

    function getMatchingViewsForType(views, templateTypeDef, existingTypeDef) {
        if (views.length === 0) {
            throw new Error(ERROR_TEMPLATE_MISSING_ITEM_VIEW);
        }

        var fieldMap = matchFieldsByType(templateTypeDef.fields, existingTypeDef.fields);

        return _.map(views, function (view) {
            var clonedView = _.cloneDeep(view);
            replaceNestedFieldRefs(fieldMap, clonedView);
            return clonedView;
        });
    }

    function getViewTemplate(template, possibleView) {
        var viewsForType = _.filter(template.views, function (view) {
            return possibleView.forType === 'Array' ? view.forType === 'Array' : view.forType !== 'Array';
        });

        return _.find(viewsForType, {format: possibleView.format}) || _.first(viewsForType);
    }

    function generateView(template, viewType, partType) {
        var viewTemplate = getViewTemplate(template, viewType);

        var newView;
        if (viewType.forType === 'Array') {
            newView = _.cloneDeep(viewTemplate);
            var itemViewRefs = utils.objectUtils.filter(newView, function (o) {
                return o.id === "listItem";
            });
            _.forEach(itemViewRefs, function (v) {
                v.comp.name = viewType.name;
            });
        } else {
            newView = getMatchingViewsForType([viewTemplate], template.type, partType)[0];
        }

        return _.assign(newView, viewType);
    }

    return {
        getMatchingViewsForType: getMatchingViewsForType,
        generateView: generateView
    };
});
