define([
        'lodash',
        'components/components/grid/core/enums',
        'components/components/grid/helpers/filtering'
    ],
    function (_, Enums, filtering) {
        'use strict';

        function doesFilterPass (props, data) {
            return _.every(props.compProp.filter, function (filter, columnId) {
                var columnDef = _.find(props.compProp.columns, {id: columnId});
                if (_.isUndefined(columnDef)) {
                    return true;
                }
                var value = _.get(data, columnDef.dataPath);
                return filtering.OperatorFuncs[filter.type][filter.operator](filter.value, value);
            });
        }

        function DataSource (props, state, rowGetters, type) {
            var rowCount = -1;
            var getRows;
            if (type === Enums.DataSourceType.DYNAMIC) {
                getRows = _.partial(rowGetters.dynamic(props, state.dataFetchContext));
            } else {
                getRows = _.partial(rowGetters.static(props, _.partial(doesFilterPass, props)));
            }
            return {
                rowCount: rowCount,
                getRows: getRows
            };
        }

        return DataSource;
    }
);
