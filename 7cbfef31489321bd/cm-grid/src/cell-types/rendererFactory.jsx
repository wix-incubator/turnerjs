'use strict'

const React = require('react')
const ReactDOM = require('react-dom')

const RendererContainer = require('./rendererContainer')
const validateValueType = require('./validateValueType')
const convertValueType = require('./convertValueType')
const detectValueType = require('./detectValueType')
const {KEYS} = require('../constants')

const toggleErrorStyle = (node, hasErrors) => {
  const className = 'invalid'
  const hasClass = node.className.indexOf(className) !== -1

  if (hasErrors && !hasClass) {
    node.className = node.className + ` ${className}`
  } else if (!hasErrors && hasClass) {
    node.className = node.className.replace(className)
  }
}

const byNotHidden = colDef => !colDef.hide

const toLastItem = (previousValue, currentValue) => currentValue

const getLastVisibleColumnFieldKey = (colDefs) =>
  colDefs
    .filter(byNotHidden)
    .reduce(toLastItem)
    .key

const render = ({
  mountPoint,
  parentNode,
  value,
  context,
  api,
  colDef,
  rowIndex,
  column
}) => {

  const schemaType = colDef.isUndefinedField ? null : colDef.filter
  const isValueTypeValid = !schemaType || validateValueType(schemaType, value)
  const rendererType = schemaType && isValueTypeValid ? schemaType : detectValueType(value)
  
  const serverValidationError = context.getServerValidationError(rowIndex)
  
  toggleErrorStyle(parentNode, !isValueTypeValid || !!serverValidationError)
  
  const startEditingWithCorrectType = () => {
    context.startEditing({
      colKey: colDef.field,
      rowIndex,
      column,
      customEditorParams: {temporaryValue: convertValueType(schemaType, value)}
    })
  }

  const startEditingWithCustomParams = (customEditorParams) => {
    context.startEditing({
      colKey: colDef.field,
      rowIndex,
      column,
      customEditorParams
    })
  }

  ReactDOM.render(
    <RendererContainer
      isValueTypeValid={isValueTypeValid}
      value={value}
      startEditingWithCorrectType={startEditingWithCorrectType}
      startEditingWithCustomParams={startEditingWithCustomParams}
      subscribeOnCellsFocused={(listener) => api.addEventListener('cellFocused', listener)}
      unsubscribeOnCellsFocused={(listener) => api.removeEventListener('cellFocused', listener)}
      parentNode={parentNode}
      fieldType={colDef.filter}
      rendererType={rendererType}
      context={context}
      serverValidationError={serverValidationError}
    />, mountPoint)
}

class RendererFactory {
  
  init({eGridCell, value, rowIndex, colDef, column, context, api}) {
    this.gui = document.createElement('div')
    this.context = context
    this.rowIndex = rowIndex
    this.parentNode = eGridCell
    this.onKeyDown = this.onKeyDown.bind(this)
    this.colDef = colDef

    render({
      mountPoint: this.gui,
      parentNode: this.parentNode,
      value,
      context,
      api,
      colDef,
      rowIndex,
      column
    })

    eGridCell.addEventListener('keydown', this.onKeyDown)
  }

  getGui() {
    return this.gui
  }
  
  refresh({eGridCell, value, rowIndex, colDef, column, context, api}) {
    this.rowIndex = rowIndex
    this.parentNode = eGridCell
    this.colDef = colDef

    render({
      mountPoint: this.gui,
      parentNode: this.parentNode,
      value,
      context,
      api,
      colDef,
      rowIndex,
      column
    })
  }

  getIsLastRow() {
    return this.context.getTotalRows() === this.rowIndex
  }

  getIsLastColumn() {
    return this.colDef.field === getLastVisibleColumnFieldKey(this.context.getColumnDefs())
  }

  onKeyDown(e) {
    if (e.keyCode === KEYS.DOWN && this.getIsLastRow() ||
      e.keyCode === KEYS.TAB && this.getIsLastRow() && this.getIsLastColumn()
    ) {
      this.context.addNewRow()
    }
  }
  
  destroy() {
    ReactDOM.unmountComponentAtNode(this.gui)
    this.parentNode.removeEventListener('keydown', this.onKeyDown)
  }
  
}

module.exports = RendererFactory
