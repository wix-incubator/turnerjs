define([
        'lodash',
        'components/components/grid/core/enums'
    ],
    function (_, enums) {
        'use strict';

        var FieldType = enums.FieldType;
        var NumericOperator = enums.filtering.NumericOperator;
        var StringOperator = enums.filtering.StringOperator;

        var FilterModelConverter = {
            convert: function (filterModel, columnDefs) {
                return _.mapValues(filterModel, function (item, columnId) {
                    var columnDef = _.find(columnDefs, {id: columnId});
                    var dataType = columnDef.type;
                    if (_.has(FilterModelConverter.operatorMap, dataType)) {
                        return {
                            type: dataType,
                            operator: FilterModelConverter.operatorMap[dataType][item.type],
                            value: item.filter
                        };
                    }
                    return item;
                });
            }
        };

        FilterModelConverter.operatorMap = {};
        FilterModelConverter.operatorMap[FieldType.NUMBER] = {
            1: NumericOperator.EQUALS,
            2: NumericOperator.NOT_EQUALS,
            3: NumericOperator.LESS_THAN,
            4: NumericOperator.LESS_OR_EQUALS,
            5: NumericOperator.GREATER_THAN,
            6: NumericOperator.GREATER_OR_EQUALS
        };

        FilterModelConverter.operatorMap[FieldType.STRING] = {
            1: StringOperator.CONTAINS,
            2: StringOperator.EQUALS,
            3: StringOperator.NOT_EQUALS,
            4: StringOperator.STARTS_WITH,
            5: StringOperator.ENDS_WITH
        };

        return FilterModelConverter;
    }
);
