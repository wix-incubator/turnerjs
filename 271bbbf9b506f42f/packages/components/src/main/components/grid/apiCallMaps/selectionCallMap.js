define([
    'lodash',
    'components/components/grid/core/enums'
    ], function (_, Enums) {
        'use strict';

        function getUserSelectionType (selection) {
            if (_.has(selection, 'columnId')) {
                return Enums.UserSelectionType.CELL;
            }

            return Enums.UserSelectionType.ROWS;
        }

        function setInfiniteScrollSelectedRow (index, row) {
            if (row.id === index) { row.setSelected(true, true); }
        }

        function InfiniteScrollRowSelection (index) {
            return {forEachNode: [_.partial(setInfiniteScrollSelectedRow, index)]};
        }

        function setPaginationSelectedRow (index, pageSize, row) {
            var relativeIndex = index % pageSize;
            var relativeId = row.id % pageSize;
            var absoluteIndexInCurrentPage = (row.id - relativeId) <= index &&
                                             (row.id - relativeId + pageSize) > index;
            if (row.childIndex === relativeIndex && absoluteIndexInCurrentPage) {
                row.setSelected(true, true);
            }
        }

        function PaginationRowSelection (index, pagination) {
            return {forEachNodeAfterFilterAndSort: [_.partial(setPaginationSelectedRow, index, pagination.rowsPerPage)]};
        }

        var rowSelection = {};
        rowSelection[Enums.PaginationType.NONE] = PaginationRowSelection;
        rowSelection[Enums.PaginationType.PAGES] = PaginationRowSelection;
        rowSelection[Enums.PaginationType.SCROLL] = InfiniteScrollRowSelection;

        function cellSelection (selection) {
            return {setFocusedCell: [selection.rowIndex, selection.columnId]};
        }

        function SelectionCallMap (selection, pagination) {
            if (getUserSelectionType(selection) === Enums.UserSelectionType.CELL) {
                return cellSelection(selection);
            }
            return rowSelection[pagination.type](selection.rowIndex, pagination);
        }

        return SelectionCallMap;
    }
);
