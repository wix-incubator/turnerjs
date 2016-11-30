'use strict'

const ReactDOM = require('react-dom')
const React = require('react')
const isUndefined_ = require('lodash/isUndefined') 

const validateValueType = require('./validateValueType')
const detectValueType = require('./detectValueType')
const constants = require('../constants')
const EditorContainer = require('./editorContainer')
const {booleanEditorParams} = require('./boolean/booleanEditor')
const {datetimeEditorParams} = require('./datetime/datetimeEditor')
const {imageEditorParams} = require('./image/imageEditor')
const {jsonEditorParams} = require('./json/jsonEditor')
const {numberEditorParams} = require('./number/numberEditor')
const {richtextEditorParams} = require('./richtext/richtextEditor')
const {textEditorParams} = require('./text/textEditor')

/**
 * Available params:
 *  - (bool) preventLeft
 *  - (bool) preventUp
 *  - (bool) preventRight
 *  - (bool) preventDown
 *  - (bool) preventShiftEnter
 */
const editorsParams = {
  boolean: booleanEditorParams,
  datetime: datetimeEditorParams,
  image: imageEditorParams,
  json: jsonEditorParams,
  number: numberEditorParams,
  richtext: richtextEditorParams,
  text: textEditorParams
}

class EditorFactory {

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  init({value, eGridCell, context, stopEditing, column, charPress}) {
    const {colDef} = column
    const {getCustomEditorParams, clearCustomEditorParams, services} = context
    const {temporaryValue} = getCustomEditorParams()
    const valueToEdit = isUndefined_(temporaryValue) ? value : temporaryValue
    const schemaType = colDef.isUndefinedField ? null : colDef.filter
    const isValueTypeValid = !schemaType || validateValueType(schemaType, value)
    const editorType = schemaType && isValueTypeValid ? schemaType : detectValueType(value)
    
    this.params = editorsParams[editorType]
    this.parent = eGridCell
    this.element = (
      <EditorContainer
        editorType={editorType}
        services={services}
        value={valueToEdit}
        charPress={charPress}
        getCustomEditorParams={getCustomEditorParams}
        stopEditing={stopEditing}
      />
    )
    this.gui = document.createElement('div')
    this.gui.className += ' cell-editor-wrapper'
    this.gui.addEventListener('keydown', this.onKeyDown)
    this.clearCustomEditorParams = clearCustomEditorParams
  }
  
  afterGuiAttached () {
    // if we render in init(), input auto-focus will not work (element will not be attached to the DOM yet)
    this.reactComponent = ReactDOM.render(this.element, this.gui)
  }

  getGui() {
    return this.gui
  }

  destroy() {
    this.gui.removeEventListener('keydown', this.onKeyDown)
    ReactDOM.unmountComponentAtNode(this.gui)
    this.clearCustomEditorParams()
  }

  getValue() {
    return this.reactComponent.getValue()
  }

  isPopup() {
    return true
  }

  onKeyDown(evt) {
    const key = evt.which || evt.keyCode

    if (key === constants.KEYS.ENTER && this.reactComponent.validateValue && !this.reactComponent.validateValue()) {
      evt.stopPropagation()
      evt.preventDefault()
    }

    if ((key === constants.KEYS.LEFT && this.params.preventLeft) ||
      (key === constants.KEYS.UP && this.params.preventUp) ||
      (key === constants.KEYS.RIGHT && this.params.preventRight) ||
      (key === constants.KEYS.DOWN && this.params.preventDown) ||
      (evt.shiftKey && key === constants.KEYS.ENTER && this.params.preventShiftEnter)) {

      evt.stopPropagation()
    }
  }
}

module.exports = EditorFactory
