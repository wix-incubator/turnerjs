'use strict'

const parseInt_ = require('lodash/parseInt')
const isEqual_ = require('lodash/isEqual')
const uniq_ = require('lodash/uniq')
const flatMap_ = require('lodash/flatMap')
const find_ = require('lodash/find')
const difference_ = require('lodash/difference')
const range_ = require('lodash/range')
const last_ = require('lodash/last')
const debounce_ = require('lodash/debounce')
const classNames = require('classnames')

const React = require('react')
const agGrid = require('ag-grid')
const { AgGridReact } = require('ag-grid-react')
const agGridEnterprise = require('ag-grid-enterprise')
const AddColumnButton = require('./addColumnButton')

const rendererFactory = require('../../cell-types/rendererFactory')
const editorFactory = require('../../cell-types/editorFactory')
const {UNDISCOVERABLE_FIELDS, ROW_HEIGHT} = require('../../constants')
const AddRowButton = require('./addRowButton')
const rowNumbersColumn = require('../../ag-grid-overrides/rowNumbersColumn')
const headerCellTemplate = require('./headerCellTemplate')
const styles = require('./wixGrid.scss')
const {dropSystemFields} = require('../../data-source-wrappers/systemColumnDefs')
const {getCellContextMenu, _deleteRange} = require('../../ag-grid-overrides/contextMenus')
const {disableLicenseWarning, disableCtrlVHandler, overrideMouseEvents} = require('../../ag-grid-overrides/overwrites')
const Preloader = require('../preloader/preloader')
const {innerWidth, calculateAddColumnButtonLeftPosition, calculateAddRowButtonTopPosition} = require('../../helpers/ui')

require('ag-grid/dist/styles/ag-grid.css')
require('../../ag-grid-overrides/theme.global.scss')

disableLicenseWarning(agGridEnterprise)
overrideMouseEvents(agGrid)

class WixGrid extends React.Component {
  constructor() {
    super()

    this.addEmptyRow = this.addEmptyRow.bind(this)
    this.onRangeSelection = this.onRangeSelection.bind(this)
    this.onCellFocus = this.onCellFocus.bind(this)
    this.onGridReady = this.onGridReady.bind(this)
    this.onCellValueChanged = this.onCellValueChanged.bind(this)
    this.isRowSelected = this.isRowSelected.bind(this)
    this.startEditing = this.startEditing.bind(this)
    this.clearCustomEditorParams = this.clearCustomEditorParams.bind(this)
    this.getCustomEditorParams = this.getCustomEditorParams.bind(this)
    this.getTotalRows = this.getTotalRows.bind(this)
    this.addNewRow = this.addNewRow.bind(this)
    this.handleServerValidationError = this.handleServerValidationError.bind(this)
    this.getServerValidationError = this.getServerValidationError.bind(this)
    this.resetServerValidationErrors = this.resetServerValidationErrors.bind(this)
    this.getColumnDefs = this.getColumnDefs.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)

    this.selectedRanges = []
    this.selectedRows = []
    this.serverValidationErrors = {}

    this.state = {
      viewportWidth: null,
      viewportHeight: null,
      renderedRowsLength: null,
      totalRows: null
    }

    this.agGridDatasource = {
      getRows: params => {
        this.grid.api.showLoadingOverlay()
        this.props.datasource.getRows(params, this.props.sortModel, this.props.filterModel)
          .then(({items, totalCount}) => {
            this.discoverColumns(items)

            params.successCallback(items, totalCount)

            if (this.isLastResponse()) {
              this.grid.api.hideOverlay()
            }

            this.refreshRowNumbers()

            this.setState({
              renderedRowsLength: this.grid.api.getRenderedNodes().length
            })
          })
          .catch(params.failCallback)
      }
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.lastFieldAdded !== nextProps.lastFieldAdded && this.grid.api) {
      this.grid.api.ensureColumnVisible(nextProps.lastFieldAdded)
    }
  }

  componentDidMount() {
    this.container.api = {
      deleteRow: id => this.deleteRow(id),
      duplicateRow: id => this.duplicateRowById(id),
      deleteRange: (rowStart, columnStart, rowEnd, columnEnd) => {
        this.grid.api.addRangeSelection({rowStart, rowEnd, columnStart, columnEnd})
        _deleteRange.call(this, this.grid.api)
      }
    }

    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions)
  }

  updateDimensions() {
    this.setState({
      viewportWidth: innerWidth(this.container),
      viewportHeight: this.container.offsetHeight
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isRowBeingAdded) {
      this.props.setIsRowBeingAdded(false)
      setTimeout(this.addEmptyRow, 0)
      return false
    }

    if (nextProps.sortModel !== this.props.sortModel || nextProps.filterModel !== this.props.filterModel) {
      this.grid.api.setDatasource(this.agGridDatasource)
      return false
    }

    if (nextProps.pinModel !== this.props.pinModel) {
      this.setColumnDefs(nextProps.columnDefs, nextProps.pinModel)
      return false
    }

    const isColumnDefsChanged = !isEqual_(nextProps.columnDefs, this.props.columnDefs)
    if (isColumnDefsChanged) {// do not rerender whole grid, update columns manually instead
      this.setColumnDefs(nextProps.columnDefs, nextProps.pinModel)
    }

    return true
  }

  // ag-grid interface
  onGridReady(grid) {
    this.grid = grid
    disableCtrlVHandler(grid)
    this.setColumnDefs(this.props.columnDefs, this.props.pinModel)
    // due to a bug in ag-grid datasource can not be passed via AgGridReact props
    this.grid.api.setDatasource(this.agGridDatasource)
    this.grid.api.addEventListener('rangeSelectionChanged', this.onRangeSelection)
    this.grid.api.addEventListener('cellFocused', this.onCellFocus)

    this.debouncedAddRangeSelection = debounce_(range => this.grid.api.addRangeSelection(range), 30, {leading: false})
  }

  onCellFocus(params) {
    if (params.rowIndex === null || params.column === null) {
      return
    }

    if (params.column.colDef.field === rowNumbersColumn.field) {
      // row number was clicked, select whole row
      const range = {
        rowStart: params.rowIndex,
        rowEnd: params.rowIndex,
        columnStart: rowNumbersColumn.field,
        columnEnd: last_(this.props.columnDefs).key
      }

      this.debouncedAddRangeSelection(range)
    }

  }

  onRangeSelection() {
    const ranges = this.grid.api.getRangeSelections()
    if (ranges === null) {
      return
    }

    const renderedNodes = this.grid.api.getRenderedNodes()
    const findNode = index => find_(renderedNodes, node => parseInt(node.id) === index)

    const selectedRows = uniq_(flatMap_(ranges, range => {
      const isInversedRange = range.start.rowIndex > range.end.rowIndex
      const end = isInversedRange ? range.end.rowIndex - 1 : range.end.rowIndex + 1
      return range_(range.start.rowIndex, end)
    }))

    const rowsToUpdate = uniq_(this.selectedRows.concat(selectedRows))
      .map(index => findNode(index))

    const columns = uniq_(flatMap_(ranges, range => {
      return range.columns.map(col => col.colId)
    }))

    this.selectedRanges = ranges.map(range => ({
      rowStart: range.start.rowIndex,
      rowEnd: range.end.rowIndex,
      columnStart: range.start.column.colDef.field,
      columnEnd: range.end.column.colDef.field
    }))

    this.selectedRows = selectedRows
    this.props.highlightColumns(columns)

    this.grid.api.refreshCells(rowsToUpdate, [rowNumbersColumn.field])
  }
  
  isRowSelected(rowIndex) {
    return this.selectedRows.some(i => rowIndex === i)
  }

  onCellValueChanged({newValue, oldValue, data, node}) {
    if (newValue === oldValue) { return }

    const isNewItem = !node.data._id

    if (isNewItem) {
      this.props.datasource.insert(data)
        .then(data => this.updateNonEditableFields(node, data))
        .then(() => this.resetServerValidationErrors(node))
        .catch(err => this.handleServerValidationError(err, node))
    } else {
      this.context.services.Raven.context({extra: node.data}, () => {
        this.props.datasource.update(data)
          .then(data => this.updateNonEditableFields(node, data))
          .then(() => this.resetServerValidationErrors(node))
          .catch(err => this.handleServerValidationError(err, node))
      })
    }
  }

  resetServerValidationErrors(node) {
    if (this.serverValidationErrors[node.id]) {
      delete this.serverValidationErrors[node.id]
      this.grid.api.refreshRows([node])
    }
  }

  handleServerValidationError(error, node) {
    this.serverValidationErrors[node.id] = error
    this.grid.api.refreshRows([node])
  }

  // Private methods (changing ui state)
  ensureCellIsFocused(rowIndex, columnName) {
    rowIndex = parseInt_(rowIndex)
    const isRowRendered = this.isRowRendered(rowIndex)

    this.grid.api.ensureColumnVisible(columnName)

    if (isRowRendered) {
      this.grid.api.setFocusedCell(rowIndex, columnName)
    } else {
      this.grid.api.ensureIndexVisible(rowIndex)
      // give grid some time to finish scrolling 
      setTimeout(() => this.grid.api.setFocusedCell(rowIndex, columnName), 20)
    } 
  }

  setColumnDefs(fields, pinModel) {
    const agGridColumnDefs = fields.map(field => ({
      field: field.key,
      headerName: field.displayName,
      filter: field.type,
      hide: field.hide,
      editable: field.editable,
      cellRenderer: rendererFactory,
      cellEditor: editorFactory,
      pinned: pinModel[field.key] ? 'left' : null,
      headerCellTemplate: headerCellTemplate(this.context.store, field, this.props.onHeaderCellRightClick, this.context.services),
      suppressSorting: true,
      isUndefinedField: field.isUndefinedField
    }))
    const newColumnDefs = [rowNumbersColumn, ...agGridColumnDefs]
    this.grid.api.setColumnDefs(newColumnDefs)
    this.restoreSelection()
  }

  restoreSelection() {
    this.selectedRanges.forEach(range => this.grid.api.addRangeSelection(range))
    if (this.selectedRanges.length > 0) {
      this.grid.api.setFocusedCell(this.selectedRanges[0].rowStart, this.selectedRanges[0].columnStart)
    }

  }

  discoverColumns(items) {
    const fetchedColumnNames = uniq_(flatMap_(items, Object.keys))
    const currentColumnNames = this.props.columnDefs.concat({key: rowNumbersColumn.field}).map(x => x.key)
    const discoveredColumnNames = difference_(fetchedColumnNames, currentColumnNames)
      .filter((value) => UNDISCOVERABLE_FIELDS.indexOf(value) === -1)

    if (discoveredColumnNames.length) {
      this.props.addUndefinedFields(discoveredColumnNames)
    }
  }

  updateNonEditableFields(node, data) {
    this.props.columnDefs
      .filter(col => !col.editable)
      .forEach(col => node.setDataValue(col.key, data[col.key]))
  }

  duplicateRowById(id) {
    const renderedNodes = this.grid.api.getRenderedNodes()
    const nodeToDuplicate = find_(renderedNodes, node => node.data._id === id)
    const data = dropSystemFields(nodeToDuplicate.data)
    return this.duplicateRow(data)
  }

  duplicateRow(data) {
    const userData = dropSystemFields(data)
    delete userData._row
    const focusedCell = this.grid.api.getFocusedCell()
    const rowIndex = focusedCell ? focusedCell.rowIndex : '0'

    this.grid.api.insertItemsAtIndex(rowIndex, [userData])
    this.refreshRowNumbers()
    return this.props.datasource.insert(userData)
  }

  deleteRow(rowId) {
    return this.props.datasource.remove(rowId)
      .then(() => this.grid.api.purgeVirtualPageCache())
  }

  addEmptyRow() {
    const focusedCell = this.grid.api.getFocusedCell()
    const rowIndex = focusedCell ? focusedCell.rowIndex + 1 : 0
    this.grid.api.insertItemsAtIndex(rowIndex, [{}])
    const firstColumnName = this.getFirstVisibleColumn()
    this.ensureCellIsFocused(rowIndex, firstColumnName)
    this.refreshRowNumbers()

    this.setState({
      renderedRowsLength: this.grid.api.getRenderedNodes().length
    })
  }

  refreshRowNumbers() {
    let totalRows = this.state.totalRows

    this.grid.api.forEachNode((node, index) => {
      if (!node.data) {
        return
      }
      const newIndex = index + 1
      node.data._row = newIndex
      node.setDataValue('_row', newIndex)
      totalRows = index > totalRows || totalRows === null ? index : totalRows
    })

    this.setState({totalRows})
  }

  getTotalRows() {
    return this.state.totalRows
  }

  addNewRow() {
    this.props.setIsRowBeingAdded(true)
  }

  getColumnDefs() {
    return this.props.columnDefs
  }

  // Private helpers
  findNodeByIndex(index) {
    const nodes = this.grid.api.getRenderedNodes()
    return find_(nodes, node => parseInt(node.id) === index)
  }

  getFirstVisibleColumn() {
    const firstColumn = this.props.columnDefs.find(x => !x.hide && !x.isSystemField)
    return firstColumn && firstColumn.key
  }

  isLastResponse() {
    return this.grid.api.getModel().virtualPageCache.activePageLoadsCount <= 0
  }

  isRowRendered(rowIndex) {
    return this.grid.api.getRenderedNodes()
      .some(node => node.id === rowIndex.toString())
  }

  startEditing({colKey, rowIndex, column, customEditorParams}) {
    this.customEditorParams = customEditorParams
    this.grid.api.startEditingCell({colKey, rowIndex, column})
  }

  getCustomEditorParams() {
    return this.customEditorParams || {}
  }

  clearCustomEditorParams() {
    this.customEditorParams = {}
  }

  getServerValidationError(rowIndex) {
    return this.serverValidationErrors[rowIndex]
  }

  // rendering
  render() {
    return (
      <div
        data-aid="wix-grid-container"
        ref={ref => this.container = ref}
        className={styles.outerContainer}
      >
        <Preloader message="loading nothing" />

        <div className={classNames('ag-wix', styles.innerContainer)}>

          <AgGridReact
            onGridReady={this.onGridReady}
            onCellValueChanged={this.onCellValueChanged}
            getContextMenuItems={getCellContextMenu.bind(this)}
            rowModelType="virtual"
            enableColResize="true"
            suppressMenuColumnPanel="true"
            enableServerSideFilter="true"
            enableServerSideSorting="true"
            enableRangeSelection="true"
            rowHeight={ROW_HEIGHT}
            headerHeight="30"
            paginationPageSize="50"
            context={{
              isRowSelected: this.isRowSelected,
              services: this.context.services,
              startEditing: this.startEditing,
              clearCustomEditorParams: this.clearCustomEditorParams,
              getCustomEditorParams: this.getCustomEditorParams,
              getTotalRows: this.getTotalRows,
              addNewRow: this.addNewRow,
              getColumnDefs: this.getColumnDefs,
              getServerValidationError: this.getServerValidationError
            }}
          />

        </div>
        <AddColumnButton
          toggleDropdown={this.props.onAddFieldButtonClick}
          left={calculateAddColumnButtonLeftPosition(this.props.allColumnsWidth, this.state.viewportWidth)}
        />
        <AddRowButton
          onClick={() => this.props.setIsRowBeingAdded(true)}
          top={calculateAddRowButtonTopPosition(this.state.renderedRowsLength, this.state.viewportHeight)}
        />
      </div>
    )
  }
}

WixGrid.propTypes = {
  datasource: React.PropTypes.object.isRequired,
  columnDefs: React.PropTypes.array.isRequired,
  setIsRowBeingAdded: React.PropTypes.func.isRequired,
  addUndefinedFields: React.PropTypes.func.isRequired,
  onHeaderCellRightClick: React.PropTypes.func.isRequired,
  onAddFieldButtonClick: React.PropTypes.func.isRequired,
  sortModel: React.PropTypes.array.isRequired,
  filterModel: React.PropTypes.array.isRequired,
  pinModel: React.PropTypes.object.isRequired,
  highlightColumns: React.PropTypes.func.isRequired,
  allColumnsWidth: React.PropTypes.number.isRequired,
  isRowBeingAdded: React.PropTypes.bool,
  lastFieldAdded: React.PropTypes.string
}

WixGrid.contextTypes = {
  store: React.PropTypes.object.isRequired,
  services: React.PropTypes.object.isRequired
}

module.exports = WixGrid
