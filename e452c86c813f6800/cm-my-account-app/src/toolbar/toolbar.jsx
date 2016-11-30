'use strict'

const React = require('react')
const {connect} = require('react-redux')
const classNames = require('classnames')

const actions = require('./actions')
const style = require('./toolbar.scss')
const selectors = require('../rootReducer')

const mapStateToProps = state => ({
  hiddenColumns: selectors.getHiddenColumns(state),
  openDropDown: selectors.getOpenDropDown(state),
  sortModel: selectors.getSortModel(state),
  sortForm: selectors.getSortForm(state)
})

const mapDispatchToProps = actions

const Toolbar = (props) => (
  <div data-aid="editor-app-toolbar" className={style.toolbar}>
    <button
      className={style.button}
      data-aid="add-row-button-toolbar"
      id="add-row-button"
      onClick={() => props.setIsRowBeingAdded(true)}
    >
      Add new row
    </button>
    <button
      className={classNames(style.button, {[style.activeButton]: props.openDropDown === 'hide-drop-down'})}
      data-aid="hide-columns-toggle-button"
      onClick={() => props.onToggleDropdown('hide-drop-down')}>
      Hide columns
    </button>
    <button
      className={classNames(style.button, {[style.activeButton]: props.openDropDown === 'toolbar-filter-drop-down'})}
      data-aid="toolbar-filter-button"
      onClick={() => props.onToggleDropdown('toolbar-filter-drop-down')}>
      Filter
    </button>
    <button
      className={classNames(style.button, {[style.activeButton]: props.openDropDown === 'toolbar-sort-drop-down'})}
      data-aid="toolbar-sort-button"
      onClick={() => props.onToggleDropdown('toolbar-sort-drop-down')}>
      Sort
    </button>
    <button
      className={style.button}
      data-aid="toolbar-refresh-button"
      disabled="true"
    >
      Refresh
    </button>
  </div>
)

Toolbar.propTypes = {
  hiddenColumns: React.PropTypes.object.isRequired,
  setIsRowBeingAdded: React.PropTypes.func.isRequired,
  sortModel: React.PropTypes.array.isRequired,
  sortForm: React.PropTypes.object
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbar)
