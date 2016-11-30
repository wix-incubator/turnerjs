module.exports = {
  field: '_row',
  headerName: '',
  headerCellTemplate: '<span></span>',
  pinned: 'left',
  width: 36,
  minWidth: 36,
  maxWidth: 36,
  suppressMenu: true,
  suppressSorting: true,
  editable: false,
  cellClass: 'row-column',
  cellClassRules: {
    'row-selected': params => params.context.isRowSelected(params.rowIndex)
  }
}
