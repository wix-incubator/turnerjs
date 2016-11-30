define([
        'components/components/grid/core/enums'
    ],
    function (enums) {
        'use strict';

        var UserSelectionType = enums.UserSelectionType;

        function GridOptions (compProp, handlers, state) {
            var hasDataFetcher = state.dataFetchContext !== null;

            var options = {
                rowBuffer: 0,
                rowHeight: compProp.rowHeight,
                paginationOverflowSize: 0,
                paginationPageSize: compProp.pagination.rowsPerPage,
                // For the initial version, we do not allow any UoU sorting or filtering
                enableSorting: false, //compProp.allowUserSorting,
                enableFilter: false, //compProp.allowUserFiltering,
                suppressMovableColumns: true,
                rowSelection: GridOptions.getRowSelection(compProp),
                suppressCellSelection: GridOptions.isCellSelectionSuppressed(compProp),
                enableServerSideSorting: hasDataFetcher,
                enableServerSideFilter: hasDataFetcher,

                onSortChanged: handlers.onSortChanged,
                onFilterChanged: handlers.onUoUFiltersChanged,
                onCellValueChanged: handlers.onCellEdit,
                onRowSelected: handlers.onRowSelect,
                onCellFocused: handlers.onCellSelect
            };

            if (compProp.pagination.type !== enums.PaginationType.NONE) {
                options.rowModelType = compProp.pagination.type;
            }

            return options;
        }

        GridOptions.isCellSelectionSuppressed = function (compProp) {
            return compProp.userSelectionType !== UserSelectionType.CELL;
        };

        GridOptions.getRowSelection = function (compProp) {
            if (compProp.userSelectionType === UserSelectionType.ROW) {
                return 'single';
            }
            return undefined;
        };

        return GridOptions;
    }
);
