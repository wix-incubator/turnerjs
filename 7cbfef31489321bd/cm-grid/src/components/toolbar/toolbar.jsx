'use strict'

const React = require('react')
const {connect} = require('react-redux')

const ToggleColumns = require('./toggleColumns')
const DropDownMenu = require('../fake-ui-lib/dropDownMenu')
const actions = require('./actions')
const SortPanel = require('../sort-panel/sortPanel')
const style = require('./toolbar.scss')
const FilterPanel = require('../filter-panel/filterPanel')
const SyncPanel = require('../sync-panel/syncPanel')
const selectors = require('../../reducer')

const mapStateToProps = state => ({
  hiddenColumns: selectors.getHiddenColumns(state),
  openDropDown: selectors.getOpenDropDown(state),
  sortModel: selectors.getSortModel(state),
  sortForm: selectors.getSortForm(state),
  isSyncInProgress: selectors.getIsSyncInProgress(state),
  isSyncCompleted: selectors.getIsSyncCompleted(state),
  isSyncFailed: selectors.getIsSyncFailed(state)
})

const mapDispatchToProps = actions

const Toolbar = (props) => {
  return (
    <div data-aid="grid-toolbar" className={style.toolbar}>
      <DropDownMenu isOpen={props.openDropDown === 'hide-drop-down'}>
        <ToggleColumns
          hiddenColumns={props.hiddenColumns}
          onColumnVisibilityChange={props.onColumnVisibilityChange}
          columns={props.fields}
        />
      </DropDownMenu>
      <DropDownMenu isOpen={props.openDropDown === 'toolbar-filter-drop-down'}>
        <FilterPanel fields={props.fields} isFromContextMenu={false} />
      </DropDownMenu>
      <DropDownMenu isOpen={props.openDropDown === 'toolbar-sort-drop-down'}>
        <SortPanel
          sortModel={props.sortModel}
          sortForm={props.sortForm}
          onAddSortClicked={props.onAddSortClicked}
          fields={props.fields}
          onSortFormClose={props.onSortFormClose}
          onSortFormChanged={props.onSortFormChanged}
          onRemoveAllSorts={props.onRemoveAllSorts}
        />
      </DropDownMenu>
      {(() => {
        if (props.isSyncInProgress) {
          return <span data-aid="toolbar-sync-preloader" className={style.preloader}>loading...</span>
        } else if (props.isSyncCompleted) {
          return <span data-aid="toolbar-sync-success" className={style.preloader}>ok</span>
        } else if (props.isSyncFailed) {
          return <span data-aid="toolbar-sync-error" className={style.preloader}>error</span>
        }
      })()}
      <DropDownMenu isOpen={props.openDropDown === 'toolbar-sync-drop-down'}>
        <SyncPanel onClose={() => props.onToggleDropdown('toolbar-sync-drop-down')} />
      </DropDownMenu>
    </div>
  )
}

Toolbar.propTypes = {
  hiddenColumns: React.PropTypes.object.isRequired,
  fields: React.PropTypes.array.isRequired,
  setIsRowBeingAdded: React.PropTypes.func.isRequired,
  sortModel: React.PropTypes.array.isRequired,
  sortForm: React.PropTypes.object
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbar)
