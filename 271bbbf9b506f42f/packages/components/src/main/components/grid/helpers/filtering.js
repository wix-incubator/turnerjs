define([
        'lodash',
        'components/components/grid/core/enums'
    ],
    function (_, enums) {
        'use strict';

        var FieldType = enums.FieldType;

        var NumericOperator = enums.filtering.NumericOperator;
        var StringOperator = enums.filtering.StringOperator;
        var DateOperator = enums.filtering.DateOperator;

        var filtering = {};

        var equals = function (parameter, value) {
            return value === parameter;
        };

        var notEquals = function (parameter, value) {
            return value !== parameter;
        };

        filtering.NumericOperatorFuncs = {};
        filtering.NumericOperatorFuncs[NumericOperator.EQUALS] = equals;
        filtering.NumericOperatorFuncs[NumericOperator.NOT_EQUALS] = notEquals;
        filtering.NumericOperatorFuncs[NumericOperator.LESS_THAN] = function (parameter, value) {
            return value < parameter;
        };
        filtering.NumericOperatorFuncs[NumericOperator.LESS_OR_EQUALS] = function (parameter, value) {
            return value <= parameter;
        };
        filtering.NumericOperatorFuncs[NumericOperator.GREATER_THAN] = function (parameter, value) {
            return value > parameter;
        };
        filtering.NumericOperatorFuncs[NumericOperator.GREATER_OR_EQUALS] = function (parameter, value) {
            return value >= parameter;
        };

        filtering.StringOperatorFuncs = {};
        filtering.StringOperatorFuncs[StringOperator.EQUALS] = equals;
        filtering.StringOperatorFuncs[StringOperator.NOT_EQUALS] = notEquals;
        filtering.StringOperatorFuncs[StringOperator.CONTAINS] = function (parameter, value) {
            return _.includes(value, parameter);
        };
        filtering.StringOperatorFuncs[StringOperator.STARTS_WITH] = function (parameter, value) {
            return _.startsWith(value, parameter);
        };
        filtering.StringOperatorFuncs[StringOperator.ENDS_WITH] = function (parameter, value) {
            return _.endsWith(value, parameter);
        };

        var MS_IN_A_DAY = 86400000;
        var DAYS_IN_A_WEEK = 7;
        var MONTHS_IN_A_YEAR = 12;

        filtering.DateOperatorFuncs = {};
        filtering.DateOperatorFuncs[DateOperator.LAST_X_DAYS] = function (parameter, value) {
            return new Date(value).getTime() > Date.now() - parameter * MS_IN_A_DAY;
        };
        filtering.DateOperatorFuncs[DateOperator.LAST_X_WEEKS] = function (parameter, value) {
            return new Date(value).getTime() > Date.now() - parameter * MS_IN_A_DAY * DAYS_IN_A_WEEK;
        };
        filtering.DateOperatorFuncs[DateOperator.LAST_X_MONTHS] = function (parameter, value) {
            var now = new Date();
            var date = new Date(value);
            return date.getYear() * MONTHS_IN_A_YEAR + date.getMonth() > now.getMonth() + (now.getYear() * MONTHS_IN_A_YEAR) - parameter;
        };

        filtering.OperatorFuncs = {};
        filtering.OperatorFuncs[FieldType.NUMBER] = filtering.NumericOperatorFuncs;
        filtering.OperatorFuncs[FieldType.STRING] = filtering.StringOperatorFuncs;
        filtering.OperatorFuncs[FieldType.DATE] = filtering.DateOperatorFuncs;

        filtering.buildFilter = function (filter) {
            return function (value) {
                return _.every(filter, function (currFilter, key) {
                    return filtering.OperatorFuncs[currFilter.type][currFilter.operator](currFilter.value, value[key]);
                });                
            };
        };

        return filtering;
    }
);
