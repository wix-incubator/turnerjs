'use strict'

const noop_ = require('lodash/noop')

// Temporarily disable licensing error message until license is bought
const disableLicenseWarning = agGridEnterprise => 
  agGridEnterprise.LicenseManager.prototype.validateLicense = noop_

/* This disables custom cmd-v handler of ag-grid 
   which allowed pasting content onto cell divs.
   After this it is only possible to paste text into cell editors 
   (which are natively editable fields like input field) */
const disableCtrlVHandler = grid => grid.api.gridPanel.onCtrlAndV = noop_

/* Show default context menu for opened cell editors */
const overrideMouseEvents = function(grid) {
  const origFn = grid.GridPanel.prototype.processMouseEvent
  grid.GridPanel.prototype.processMouseEvent = function(eventName, mouseEvent) {
    return shouldShowDefaultContextMenu(mouseEvent) ? null
      : origFn.call(this, eventName, mouseEvent)
  }
}

function shouldShowDefaultContextMenu(mouseEvent) {
    const defaultContextClasses = [
      'ag-cell-inline-editing',
      'ag-cell-edit-input',
      'cell-editor-wrapper',
      'cell-editor',
      'datepicker-input',
      'timepicker-input'
    ]
    const targetClasses = mouseEvent.target.className.split(' ')
    return targetClasses.some(targetClass => 
      defaultContextClasses.some(defaultClass => defaultClass === targetClass)
    )
}

module.exports = {disableLicenseWarning, disableCtrlVHandler, overrideMouseEvents}
