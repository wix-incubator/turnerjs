define([
        'lodash',
        'components/components/grid/helpers/filtering'
    ],
    function (_, filtering) {
        'use strict';

        function filterStaticData (rows, filter) {
            var processedRows = rows;
            if (!_.isUndefined(filter)) {
                processedRows = _.filter(rows, filter);
            }

            return {
                rows: processedRows,
                rowsCount: processedRows.length
            };
        }

        function State () {
            return {
                dataFetchContext: null,
                dataFetchHandler: null,
                uiState: null,
                agGridApi: null,
                currentPage: null
            };
        }

        State.setGrid = function (state, agGridModule, gridOptions, gridNode) {
            State.destroyGrid(state);
            // You gotta love ag-grid ...
            // eslint-disable-next-line no-new
            new agGridModule.Grid(gridNode, gridOptions);
            state.agGridApi = gridOptions.api;
            return state;
        };

        State.destroyGrid = function (state) {
            if (state.agGridApi !== null) {
                state.agGridApi.destroy();
                state.agGridApi = null;
            }
            return state;
        };

        State.setDataSource = function (state, dataSource) {
            state.agGridApi.setDatasource(dataSource);
            return state;
        };

        State.setRowData = function (state, rows, filter) {
            var filterMethod = filtering.buildFilter(filter);
            var filteredRows = filterStaticData(rows, filterMethod);
            state.agGridApi.setRowData(filteredRows.rows);
            return state;
        };

        State.updateUsingApi = function (state, callMap) {
            _.forEach(callMap, function (args, methodName) {
                state.agGridApi[methodName].apply(state.agGridApi, args);
            });
            return state;
        };

        State.setDataFetchHandler = function (state, handler) {
            state.dataFetchHandler = handler;
            return state;
        };

        State.handleFetchedData = function (state, data) {
            if (state.dataFetchHandler !== null) {

                var dataClone = _.clone(data);
                var dataFetchHandler = state.dataFetchHandler;
                if (_.has(dataFetchHandler, 'startRow')) {
                    // static, needs filtering and page slicing
                    dataClone = filterStaticData(data.rows, dataFetchHandler.filter);
                    dataClone.rows = _.slice(dataClone.rows, dataFetchHandler.startRow, dataFetchHandler.endRow);
                }
                dataFetchHandler.successCallback(dataClone.rows, dataClone.rowsCount);
                state.dataFetchHandler = null;
            }
            return state;
        };

        State.updateUIState = function (state, value, property) {
            if (state.uiState === null) {
                state.uiState = {};
            }
            state.uiState[property] = value;
            return state;
        };

        State.restoreUIState = function (state, callMap) {
            return State.updateUsingApi(state, callMap);
        };

        State.saveCurrentPage = function (state) {
            state.currentPage = state.agGridApi.paginationController.currentPage;
            return state;
        };

        State.restoreCurrentPage = function (state) {
            state.agGridApi.paginationController.currentPage = state.currentPage;
            state.agGridApi.paginationController.loadPage();
            return state;
        };

        return State;
    }
);
