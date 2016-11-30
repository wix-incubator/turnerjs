'use strict'

const React = require('react')
const {connect} = require('react-redux')
const findIndex_ = require('lodash/findIndex')
const classNames = require('classnames')

const {getSortModel, getPinModel, getHighlightedColumns, getFilterModel} = require('../../reducer')
const LeftIconArea = require('./leftIconArea')
const RightIconArea = require('./rightIconArea')
const styles = require('./styles.scss')

const mapStateToProps = state => ({
  sortModel: getSortModel(state),
  pinModel: getPinModel(state),
  highlightedColumns: getHighlightedColumns(state),
  filterModel: getFilterModel(state)
})

const Header = ({
  columnDef,
  sortModel,
  pinModel,
  onHeaderCellRightClick,
  highlightedColumns,
  filterModel
}) => {

  const isSelected = highlightedColumns.some(key => key === columnDef.key)
  
  const sortIndex = findIndex_(sortModel, sort => sort.fieldKey === columnDef.key)
  const direction = sortModel[sortIndex] ? sortModel[sortIndex].order : null

  const isFiltered = filterModel.some(filter => filter.fieldKey === columnDef.key)
  const isSorted = sortIndex > -1

  const openContextMenu = event => {
    event.preventDefault()
    onHeaderCellRightClick({field: Object.assign({}, columnDef), left: event.pageX, top: event.pageY})
  }
  
  return (
    <div
      data-aid="cm-column-header"
      className={classNames(styles.columnHeader, {[styles.selected]: isSelected})}
      onContextMenu={openContextMenu}
    >
      <LeftIconArea
        isSystemField={columnDef.isSystemField}
        isPinned={pinModel[columnDef.key]}
      />

      <div id="agHeaderCellLabel" className="ag-header-cell-label">
        <span data-aid="column-header-label" className={classNames({[styles.systemField]: columnDef.isSystemField})}>
          {columnDef.displayName}
        </span>
      </div>

      <RightIconArea
        isFiltered={isFiltered}
        isSorted={isSorted}
        sortIndex={sortIndex}
        sortDirection={direction}
        showSortIndex={sortModel.length > 1}
        onMenuButtonClick={openContextMenu}
      />

      <div id="agResizeBar" className="ag-header-cell-resize"></div>
    </div>
  )
}

module.exports = connect(
  mapStateToProps 
)(Header)
