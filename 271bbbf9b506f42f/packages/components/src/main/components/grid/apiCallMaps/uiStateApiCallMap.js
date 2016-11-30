define([
        'lodash',
        'components/components/grid/apiCallMaps/selectionCallMap',
        'components/components/grid/core/enums'
    ],
    function (_, SelectionCallMap) {
        'use strict';

        function UiStateApiCallMap (uiState, compProp) {
            var uiProps = UiStateApiCallMap.callByProperty(compProp);
            return _.reduce(uiState, function (callMap, value, property) {
                return _.assign(callMap, uiProps[property](value));
            }, {});
        }

        UiStateApiCallMap.callByProperty = function (compProp) {
            return {
                userFilter: function (filterModel) {
                    return {setFilterModel: [filterModel]};
                },

                userSelection: function (selection) {
                    SelectionCallMap(selection, compProp.pagination); // eslint-disable-line new-cap
                }
            };
        };

        UiStateApiCallMap.uiProperties = ['userFilter', 'userSelection'];

        UiStateApiCallMap.getUIStateProps = function (props) {
            return _.pick(props, UiStateApiCallMap.uiProperties);
        };

        return UiStateApiCallMap;
    }
);
