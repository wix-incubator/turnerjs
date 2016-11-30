define([
        'lodash',
        'components/components/grid/helpers/either',
        'components/components/grid/core/enums'
    ],
    function (_, Either, enums) {
        'use strict';
        /* eslint-disable new-cap */

        var FieldType = enums.FieldType;

        var Left = Either.Left;
        var Right = Either.Right;

        var NewValueHandler = {
            validatorByFieldType: {}
        };

        NewValueHandler.validatorByFieldType[FieldType.DATE] = function (value) {
            if (_.isNaN(Date.parse(value))) {
                return Left(null);
            }
            return Right(new Date(value));
        };

        NewValueHandler.validatorByFieldType[FieldType.NUMBER] = function (value) {
            var newValue = Number(value);
            if (_.isNaN(newValue)) {
                return Left(null);
            }
            return Right(newValue);
        };

        NewValueHandler.getNextValue = function (fieldType, newValue, oldValue) {
            var nextValue = newValue;
            if (_.has(NewValueHandler.validatorByFieldType, fieldType)) {
                nextValue = Either.getOrElse(
                    NewValueHandler.validatorByFieldType[fieldType](newValue),
                    oldValue
                );
            }
            return nextValue;
        };

        NewValueHandler.update = function (column, params) {
            var value = NewValueHandler.getNextValue(column.type, params.newValue, params.oldValue);
            _.set(params.data, column.dataPath, value);
        };

        return NewValueHandler;
        /* eslint-enable new-cap */
    }
);
