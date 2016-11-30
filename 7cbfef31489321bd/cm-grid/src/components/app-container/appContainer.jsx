'use strict'
require('ag-grid-enterprise')
const React = require('react')
const {connect} = require('react-redux')

const constants = require('../../constants')
const actions = require('./actions')
const WixGrid = require('../wix-grid/wixGrid')
const Toolbar = require('../toolbar/toolbar')
const FieldProperties = require('../field-properties/fieldProperties')
const FloatingContainer = require('../fake-ui-lib/floatingContainer')
const DropDownMenu = require('../fake-ui-lib/dropDownMenu')
const EditorAppForm = require('../add-field-form/editorAddFieldForm')
const MyAccountAppForm = require('../add-field-form/myAccountAddFieldForm')
const selectors = require('../../reducer')
const FilterPanel = require('../filter-panel/filterPanel')
const MyAccColumnContextMenu = require('../column-context-menus/my-account-app-menu')
const EditorColumnContextMenu = require('../column-context-menus/editor-app-menu')

const styles = require('./appContainer.scss')

const mapStateToProps = state => ({
  isSchemaLoaded: selectors.getIsSchemaLoaded(state),
  fields: selectors.getAllFields(state),
  isRowBeingAdded: selectors.getIsRowBeingAdded(state),
  headerDropDown: selectors.getHeaderDropDown(state),
  openDropDownName: selectors.getOpenDropDown(state),
  sortModel: selectors.getSortModel(state),
  filterModel: selectors.getFilterModel(state),
  collectionName: selectors.getCollectionName(state),
  pinModel: selectors.getPinModel(state),
  allColumnsWidth: selectors.getAllColumnsWidth(state),
  lastFieldAdded: selectors.getLastFieldAdded(state),
  isMyAccountApp: selectors.isMyAccountApp(state) //debt: should be removed when context menus are configured by host apps
})

const mapDispatchToProps = actions

const AppContainer = (props) => {

  const renderContextMenu = () => {
    switch (props.headerDropDown.type) {
      case constants.COLUMN_DROP_DOWN_TYPES.CONTEXT:
        return props.isMyAccountApp ?
          <MyAccColumnContextMenu
            field={props.headerDropDown.field}
            fields={props.fields}
            onColumnDelete={props.deleteColumn}
            onColumnHeaderMenuClose={props.closeColumnHeaderMenu}
            onToggleSort={data => props.toggleSort(data)}
            openFilterPanel={props.openFilterPanel}
            togglePin={props.toggleColumnPin}
            pinModel={props.pinModel}
            onColumnVisibilityChange={props.onColumnVisibilityChange}
          /> :
          <EditorColumnContextMenu
            field={props.headerDropDown.field}
            fields={props.fields}
            onPropertiesItemClick={field => props.openColumnHeaderPropertiesMenu({field})}
            onColumnDelete={props.deleteColumn}
            onColumnHeaderMenuClose={props.closeColumnHeaderMenu}
            onToggleSort={data => props.toggleSort(data)}
            openFilterPanel={props.openFilterPanel}
            togglePin={props.toggleColumnPin}
            pinModel={props.pinModel}
            onColumnVisibilityChange={props.onColumnVisibilityChange}
          />

      case constants.COLUMN_DROP_DOWN_TYPES.PROPERTIES:
        return (
          <FieldProperties onClose={props.closeColumnHeaderMenu} />
        )
      case constants.COLUMN_DROP_DOWN_TYPES.FILTER:
        return (
          <FilterPanel
            fields={props.fields}
            isFromContextMenu={true}
            closeForm={props.closeColumnHeaderMenu}
          />
        )
    }
  }
  
  return (
    <div data-aid="grid-container" className={styles.gridContainer}>

      <Toolbar fields={props.fields} />
      
      {props.isSchemaLoaded ?
        <WixGrid
          datasource={props.datasource}
          columnDefs={props.fields}
          addColumn={props.addColumn}
          setIsRowBeingAdded={props.setIsRowBeingAdded}
          addColumnDefs={props.addColumnDefs}
          addUndefinedFields={props.addUndefinedFields}
          isRowBeingAdded={props.isRowBeingAdded}
          onHeaderCellRightClick={props.openColumnHeaderContextMenu}
          openDropDownName={props.openDropDownName}
          onAddFieldButtonClick={() => props.toggleDropdown('add-field-form')}
          sortModel={props.sortModel}
          toggleSort={props.toggleSort}
          filterModel={props.filterModel}
          pinModel={props.pinModel}
          highlightColumns={props.highlightColumns}
          allColumnsWidth={props.allColumnsWidth}
          lastFieldAdded={props.lastFieldAdded}
        /> : null
      }

      <DropDownMenu 
        position={{top: '180px', right: '6px'}}
        isOpen={props.openDropDownName === 'add-field-form'}
      >
      {props.isMyAccountApp ? <MyAccountAppForm /> : <EditorAppForm />}
      </DropDownMenu>

      <FloatingContainer
        isOpen={props.headerDropDown.isOpen}
        left={props.headerDropDown.left}
        top={props.headerDropDown.top}>

        {renderContextMenu()}
      </FloatingContainer>
    </div>
  )
}

AppContainer.propTypes = {
  isSchemaLoaded: React.PropTypes.bool.isRequired,
  datasource: React.PropTypes.object.isRequired,
  fields: React.PropTypes.array.isRequired,
  addColumn: React.PropTypes.func.isRequired,
  setIsRowBeingAdded: React.PropTypes.func.isRequired,
  isRowBeingAdded: React.PropTypes.bool,
  headerDropDown: React.PropTypes.shape({
    isOpen: React.PropTypes.bool.isRequired,
    top: React.PropTypes.number,
    left: React.PropTypes.number,
    type: React.PropTypes.oneOf(Object.keys(constants.COLUMN_DROP_DOWN_TYPES)),
    field: React.PropTypes.string
  }),
  openColumnHeaderContextMenu: React.PropTypes.func.isRequired,
  openColumnHeaderPropertiesMenu: React.PropTypes.func.isRequired,
  closeColumnHeaderMenu: React.PropTypes.func.isRequired,
  openDropDownName: React.PropTypes.string,
  sortModel: React.PropTypes.array.isRequired,
  toggleSort: React.PropTypes.func.isRequired
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer)
