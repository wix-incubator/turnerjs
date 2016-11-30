'use strict'

const rowNumbersColumn = require('../ag-grid-overrides/rowNumbersColumn')
const {ROW_HEIGHT} = require('../constants')

const ADD_COLUMN_BUTTON_WIDTH = rowNumbersColumn.width

const getAddRowButtonTopPosition = (rowsRendered) => {
  const headerHeight = ROW_HEIGHT
  const rowsHeight = ROW_HEIGHT * rowsRendered

  return headerHeight + rowsHeight - 1 + 'px' // -1 to collapse the border
}

const hasAddRowButtonReachedBottom = (renderedRowsLength, viewportHeight) => {
  const AG_GRID_HEADER_HEIGHT = 30
  const ADD_ROW_BUTTON_HEIGHT = ROW_HEIGHT

  const rowsHeight = ROW_HEIGHT * renderedRowsLength

  return AG_GRID_HEADER_HEIGHT + rowsHeight + ADD_ROW_BUTTON_HEIGHT > viewportHeight
}

module.exports.innerWidth = el => el.offsetWidth

module.exports.calculateAddColumnButtonLeftPosition = (columnsWidth, viewportWidth) =>
  viewportWidth > (columnsWidth + ADD_COLUMN_BUTTON_WIDTH + rowNumbersColumn.width) ?
    (columnsWidth + rowNumbersColumn.width) + 'px' :
    ''

module.exports.calculateAddRowButtonTopPosition = (renderedRowsLength, viewportHeight) =>
  hasAddRowButtonReachedBottom(renderedRowsLength, viewportHeight) ? '' : getAddRowButtonTopPosition(renderedRowsLength)
