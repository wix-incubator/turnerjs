define([
        'lodash',
        'components/components/grid/wrappers/columnDefinition',
        'components/components/grid/apiCallMaps/selectionCallMap'
    ],
    function (_, ColumnDefinition, SelectionCallMap) {
        'use strict';

        function getColumnDefs (columns, props) {
            return _.map(columns, _.partial(ColumnDefinition, props));
        }

        function getHeaderHeight (showHeader, props) {
            return showHeader ? props.compProp.headerHeight : 0;
        }

        function UpdateApiCallMap (propsForUpdate, props) {
            return _.reduce(UpdateApiCallMap.propertyUpdateOrder, function (callMap, property) {
                if (_.has(propsForUpdate, property)) {
                    _.assign(callMap, UpdateApiCallMap.propertyToCall[property](propsForUpdate[property], props));
                }
                return callMap;
            }, {});
        }

        UpdateApiCallMap.invoke = function (methodName) {
            return function (value) {
                var call = {};
                call[methodName] = [value];
                return call;
            };
        };

        UpdateApiCallMap.propertyUpdateOrder = ['columns', 'headerHeight', 'sorting', 'userSelection', 'showHeader'];
        UpdateApiCallMap.propertyToCall = {
            columns: _.flow(
                getColumnDefs,
                UpdateApiCallMap.invoke('setColumnDefs')
            ),
            headerHeight: UpdateApiCallMap.invoke('setHeaderHeight'),
            showHeader: _.flow(
                getHeaderHeight,
                UpdateApiCallMap.invoke('setHeaderHeight')
            ),
            sorting: UpdateApiCallMap.invoke('setSortModel'),
            userSelection: function (value, props) {
                return SelectionCallMap(value, props.compProp.pagination); // eslint-disable-line new-cap
            }
        };

        return UpdateApiCallMap;
    }
);
