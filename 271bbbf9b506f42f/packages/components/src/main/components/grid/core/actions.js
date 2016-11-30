define([
        'lodash',
        'components/components/grid/wrappers/dataSource',
        'components/components/grid/core/state',
        'components/components/grid/wrappers/gridOptions',
        'components/components/grid/apiCallMaps/updateApiCallMap',
        'components/components/grid/apiCallMaps/uiStateApiCallMap',
        'components/components/grid/core/enums'
    ],
    function (_, DataSource, State, GridOptions, UpdateApiCallMap, UiStateApiCallMap, Enums) {
        'use strict';
        /* eslint-disable new-cap */

        var UserSelectionType = Enums.UserSelectionType;

        return {
            INIT: State, /* don't care about the previous state */

            CREATE_GRID: function (agGridModule, compProp, handlers, gridNode) {
                return function (state) {
                    var gridOptions = GridOptions(compProp, handlers, state);
                    return State.setGrid(state, agGridModule, gridOptions, gridNode);
                };
            },

            UPDATE_GRID_USING_API: _.flow(UpdateApiCallMap, _.curryRight(State.updateUsingApi)),

            DESTROY_GRID: State.destroyGrid,

            SET_DATA_FETCH_HANDLER: _.curryRight(State.setDataFetchHandler),
            HANDLE_FETCHED_DATA: _.curryRight(State.handleFetchedData),

            SET_DATA: function (props, rowGetters, type) {
                return function (state) {
                    if (props.compProp.pagination.type === Enums.PaginationType.NONE) {
                        return State.setRowData(state,
                                                props.compData.rows,
                                                props.compProp.filter);
                    }

                    var dataSource = DataSource(props, state, rowGetters, type);
                    return State.setDataSource(state, dataSource);
                };
            },

            UPDATE_UI_STATE: function (properties) {
                return _.partial(_.reduce, properties, State.updateUIState);
            },

            RESTORE_UI_STATE: function (compProp) {
                return function (state) {
                    var callMap = UiStateApiCallMap(state.uiState, compProp);
                    return State.restoreUIState(state, callMap);
                };
            },

            SAVE_CURRENT_PAGE: State.saveCurrentPage,
            RESTORE_CURRENT_PAGE: State.restoreCurrentPage,

            CLEAR_SELECTION: function (selectionType) {
                return function (state) {
                    if (selectionType === UserSelectionType.CELL) {
                        return State.updateUsingApi(state, {setFocusedCell: [-1, -1]});
                    } else if (selectionType === UserSelectionType.ROW) {
                        return State.updateUsingApi(state, {deselectAll: []});
                    }
                    return State.updateUsingApi(state, {setFocusedCell: [-1, -1], deselectAll: []});
                };
            }
        };
        /* eslint-enable new-cap */
    }
);
