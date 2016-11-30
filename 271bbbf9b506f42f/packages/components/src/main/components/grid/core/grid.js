define([
        'lodash',
        'experiment',
        'components/components/grid/core/actions',
        'components/components/grid/core/propsInspector',
        'components/components/grid/helpers/filterModelConverter',
        'components/components/grid/helpers/rowHelpers',
        'components/components/grid/core/enums',
        'components/components/grid/helpers/boolSet'
    ],
    function (_, experiment, Action, PropsInspector, FilterModelConverter, RowHelpers, Enums, BoolSet) {
        'use strict';
        /* eslint-disable new-cap */

        var UserSelectionType = Enums.UserSelectionType;

        function Grid (foreign) {
            return {
                loadAgGridModule: null,
                state: null,
                foreign: foreign
            };
        }

        Grid.mutateState = function (grid, actions) {
            grid.state = _.reduce(actions, function (newState, action) {
                return action(newState);
            }, grid.state);
        };

        Grid.ensureAgGridModule = function (next) {
            if (Grid.loadAgGridModule !== null) {
                Grid.loadAgGridModule.then(next);
            }
        };

        Grid.init = function (grid, props, gridNode) {
            Grid.ensureAgGridModule(function (agGridModule) {
                Grid.mutateState(grid, [
                    Action.INIT,
                    Action.CREATE_GRID(
                        agGridModule,
                        props.compProp,
                        Grid.bindGridEventHandlers(grid, props),
                        gridNode
                    ),
                    Action.UPDATE_GRID_USING_API(props.compProp, props),
                    Action.SET_DATA(props, Grid.bindRowGetters(grid), false)
                ]);
            });
        };

        Grid.update = function (grid, props, nextProps, gridNode) {
            Grid.ensureAgGridModule(function (agGridModule) {
                var propsToUpdate = PropsInspector(props, nextProps);

                if (!PropsInspector.isEmpty(propsToUpdate)) {

                    var hasOnlyApiProps = PropsInspector.hasOnlyApiProps(propsToUpdate);
                    var hasPagesPagination = PropsInspector.hasPagesPagination(props) && PropsInspector.hasPagesPagination(nextProps);
                    var didDataSourceChange = PropsInspector.didDataSourceChange(propsToUpdate);
                    var didDataChange = PropsInspector.didDataChange(propsToUpdate);
                    var didUIPropsChange = PropsInspector.didUIPropsChange(propsToUpdate);

                    var apiPropsToUpdate = hasOnlyApiProps ? propsToUpdate.props : nextProps.compProp;

                    /* eslint-disable no-multi-spaces  */
                    var actions = BoolSet([
                        Action.SAVE_CURRENT_PAGE,                        !hasOnlyApiProps && hasPagesPagination,

                        Action.CREATE_GRID(
                            agGridModule,
                            nextProps.compProp,
                            Grid.bindGridEventHandlers(grid, nextProps),
                            gridNode
                        ),                                               !hasOnlyApiProps,

                        Action.UPDATE_GRID_USING_API(
                            apiPropsToUpdate,
                            nextProps
                        ),                                                true,

                        Action.SET_DATA(
                            nextProps,
                            Grid.bindRowGetters(grid),
                            nextProps.compProp.dataSource.type
                        ),                                                didDataSourceChange || !hasOnlyApiProps,

                        Action.HANDLE_FETCHED_DATA({
                            rows: nextProps.compData.rows,
                            rowsCount: nextProps.compData.rowsCount
                        }),                                              !didDataSourceChange && didDataChange,

                        Action.RESTORE_CURRENT_PAGE,                     !hasOnlyApiProps && hasPagesPagination,

                        Action.UPDATE_UI_STATE(propsToUpdate.props),      didUIPropsChange,
                        Action.RESTORE_UI_STATE(nextProps.compProp),     !didUIPropsChange
                    ]);
                    /* eslint-enable no-multi-spaces  */

                    Grid.mutateState(grid, actions);
                }
            });
        };

        Grid.destroy = function (grid) {
            Grid.mutateState(grid, [Action.DESTROY_GRID]);
        };

        var ViewMode = {
            EDITOR: 'editor',
            PREVIEW: 'preview'
        };

        Grid.handleViewModeChange = function (grid, props, viewMode) {
            if (viewMode === ViewMode.EDITOR) {
                Grid.mutateState(grid, [
                    Action.SET_DATA(props, Grid.bindRowGetters(grid), false),
                    Action.CLEAR_SELECTION()
                ]);
            }
        };

        Grid.bindRowGetters = function (grid) {
            return {
                static: function (props, filter) {
                    return function (params) {
                        Grid.mutateState(grid, [
                            Action.SET_DATA_FETCH_HANDLER({
                                successCallback: params.successCallback,
                                startRow: params.startRow,
                                endRow: params.endRow,
                                filter: filter
                            }),
                            Action.HANDLE_FETCHED_DATA({
                                rows: props.compData.rows
                            })
                        ]);
                    };
                },

                dynamic: function (props) {
                    return function (params) {
                        Grid.mutateState(grid, [
                            Action.SET_DATA_FETCH_HANDLER({
                                successCallback: params.successCallback
                            })
                        ]);

                        var filter = FilterModelConverter.convert(params.filterModel, props.compProp.columns);

                        var data = {
                            name: 'fetchData',
                            id: props.id,
                            startRow: params.startRow,
                            endRow: params.endRow,
                            sorting: params.sortModel,
                            filter: filter
                        };

                        grid.foreign.handleAction('fetchData', data);
                    };
                }
            };
        };

        Grid.bindGridEventHandlers = function (grid, props) {
            return {
                onSortChanged: function () {
                    if (grid.state !== null) {
                        var sorting = grid.state.agGridApi.getSortModel();
                        grid.foreign.updateProps({sorting: sorting});
                    }
                },

                onUoUFiltersChanged: function () {
                    var filterModel = grid.state.agGridApi.getFilterModel();
                    Grid.mutateState(grid, [
                        Action.UPDATE_UI_STATE({userFilter: filterModel})
                    ]);
                },

                onRowSelect: function (event) {
                    if (!event.node.selected) { return; }

                    var rowIndex = event.node.childIndex || event.node.id;
                    var userSelection = {rowIndex: rowIndex};

                    grid.foreign.updateProps({userSelection: userSelection});
                    Grid.mutateState(grid, [
                        Action.UPDATE_UI_STATE({userSelection: userSelection}),
                        Action.CLEAR_SELECTION(UserSelectionType.CELL)
                    ]);
                    grid.foreign.handleAction('rowSelect', userSelection);
                },

                onCellSelect: function (event) {
                    if (!event.column) { return; }

                    var userSelection = {
                        rowIndex: event.rowIndex,
                        columnId: event.column.colId
                    };

                    Grid.mutateState(grid, [
                        Action.UPDATE_UI_STATE({userSelection: userSelection}),
                        Action.CLEAR_SELECTION(UserSelectionType.ROW)
                    ]);
                    grid.foreign.handleAction('cellSelect', userSelection);
                },

                onCellEdit: function (event) {
                    var oldRow = RowHelpers.createRow(props.compProp.columns, event.data, event.colDef.colId, event.oldValue);
                    var newRow = RowHelpers.createRow(props.compProp.columns, event.data, event.colDef.colId, event.newValue);

                    var rowIndex = RowHelpers.getRowIndex(props, oldRow);
                    var rows = _.map(props.compData.rows, function(row, index) {
                        if (index === rowIndex) {
                            return newRow;
                        }
                        return row;
                    });

                    grid.foreign.updateData({rows: rows});
                    grid.foreign.handleAction('cellEdit', {
                        cellData: event.newValue,
                        cellRowIndex: rowIndex,
                        cellColumnIndex: _.findIndex(props.compProp.columns, {id: event.colDef.colId})
                    });
                }
            };
        };

        if (experiment.isOpen('sv_grid')) {
            Grid.loadAgGridModule = new Promise(_.partial(require, ['ag-grid']));
        }

        return Grid;

        /* eslint-enable new-cap */
    }
);
