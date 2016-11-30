const last_ = require('lodash/last')

function createRowMenu(api, node) {
  return [
      {name: 'Copy', action: copyRow.bind(this, api, node)},
      {name: 'Delete', action: () => node.data ? this.deleteRow(node.data._id) : ''},
      {name: 'Duplicate', action: () => this.duplicateRow(node.data)}
    ]
}

function createCellMenu(api, node, column) {
  return [ 
    {name: 'Edit', action: editCell.bind(this, api, node, column)},
    {name: 'Copy', action: copySelection.bind(this, api)},
    {name: 'Cut', action: cutSelection.bind(this, api, node, column)},
    {name: 'Delete', action: deleteSelection.bind(this, api, node, column)}
  ]
}

function createReadonlyCellMenu(api) {
  return [ 
    {name: 'Edit', disabled: true},
    {name: 'Copy', action: copySelection.bind(this, api)},
    {name: 'Cut', disabled: true},
    {name: 'Delete', disabled: true}
  ] 
}

function copyRow(api, node) {
  api.clearRangeSelection()
  const columns = node.columnController.allDisplayedColumns.map(x => x.colId)
  api.addRangeSelection({
    rowStart: node.id, 
    rowEnd: node.id, 
    columnStart: columns[1], // first is skipped because it is row number
    columnEnd: last_(columns)
  })
  copySelection(api)
}

function editCell(api, node, column) {
  api.startEditingCell({rowIndex: node.id, colKey: column.colId})
}

function copySelection(api) {
  api.clipboardService.copyToClipboard()
}

function cutSelection(api, node, column) {
  api.clipboardService.copyToClipboard()
  if (api.rangeController.isMoreThanOneCell()) {
    deleteRange.call(this, api)
  } else {
    deleteCell.call(this, node, column)
  }
}

function deleteSelection(api, node, column) {
  if (api.rangeController.isMoreThanOneCell()) {
    deleteRange.call(this, api)
  } else {
    deleteCell.call(this, node, column)
  }
}

function getCellContextMenu({column, defaultItems, node, api}) {
  if (!column) {return createReadonlyCellMenu.call(this, api)}
  if (column.colId === '_row') {
    return createRowMenu.call(this, api, node)
  } else if (column.colDef.editable) {
    return createCellMenu.call(this, api, node, column)
  } else {
    return createReadonlyCellMenu.call(this, api)
  }
}

function deleteCell(node, column) {
  delete node.data[column.colId]
  this.grid.api.rowDataChanged([node.data])
  updateData.call(this, node.data)
  // .catch(err => add error handler)
}

function deleteRange(api) {
  const rangeSelection = api.getRangeSelections()[0]
  const firstIndex = rangeSelection.start.rowIndex
  const lastIndex = rangeSelection.end.rowIndex
  const columns = rangeSelection.columns.filter(column => column.colDef.editable)

  api.forEachNode(node => {
    if(parseInt(node.id) >= parseInt(firstIndex) && parseInt(node.id) <= parseInt(lastIndex)) {
      columns.forEach(column => delete node.data[column.colId])
      this.grid.api.rowDataChanged([node.data]) // update optimistically for responsive feeling
      updateData.call(this, node.data) // udpate again to refresh lastUpdated field
    } 
  })
}

function updateData(data) {
  return this.props.datasource.update(data)
    .then(() => this.grid.api.rowDataChanged([data]))
}

module.exports = {getCellContextMenu, _deleteRange: deleteRange}
