'use strict'
const {combineReducers} = require('redux')
const map_ = require('lodash/map')
const includes_ = require('lodash/includes')

const {NAME} = require('./constants')
const columnSettings = require('./reducers/columnSettings')
const propertiesPanel = require('./reducers/propertiesPanel')
const schema = require('./reducers/schema')
const undefinedFields = require('./reducers/undefinedFields')
const openDropDown = require('./reducers/openDropDown')
const isRowBeingAdded = require('./reducers/isRowBeingAdded')
const headerDropDown = require('./reducers/headerDropDown')
const sort = require('./reducers/sort')
const addField = require('./reducers/addField')
const fieldProperties = require('./reducers/fieldProperties')
const filter = require('./reducers/filter')
const sync = require('./reducers/sync')
const preloader = require('./reducers/preloader')
const rangeSelection = require('./reducers/rangeSelection')
const {systemFields} = require('./data-source-wrappers/systemColumnDefs')

const getAllFields = (schema, undefinedFields = [], hidden = {}) => {
  const columnDefinitions = map_(schema, (value, key) =>
    ({
      key,
      displayName: value.displayName,
      type: value.type,
      hide: hidden[key],
      isSystemField: false,
      isUndefinedField: false,
      editable: value.type !== 'pagelink',
      isCalculated: !!value.calculator
    })
  )
  const systemColumnDefs = map_(systemFields, (item, key) =>
    ({
      key,
      displayName: item.displayName,
      type: item.type,
      hide: hidden[key],
      isSystemField: true,
      isUndefinedField: false,
      editable: false,
      isCalculated: false
    })
  )
  const undefinedFieldDefs = undefinedFields.map((fieldName) =>
    ({
      key: fieldName,
      displayName: `[${fieldName}]`,
      type: 'text',
      hide: hidden[fieldName],
      isSystemField: false,
      isUndefinedField: true,
      editable: true,
      isCalculated: false
    })
  )
  return [...systemColumnDefs, ...columnDefinitions, ...undefinedFieldDefs]
}

module.exports = combineReducers({
  columnSettings,
  propertiesPanel,
  schema,
  undefinedFields,
  openDropDown,
  isRowBeingAdded,
  headerDropDown,
  sort,
  addField,
  fieldProperties,
  filter,
  sync,
  rangeSelection,
  preloader
})

module.exports.getFields = state => schema.getFields(state[NAME].schema)

module.exports.getCollectionName = state => schema.getCollectionName(state[NAME].schema)

module.exports.getIsSchemaLoaded = state => schema.getIsSchemaLoaded(state[NAME].schema)

module.exports.getHiddenColumns = state => columnSettings.getHiddenColumns(state[NAME].columnSettings)

module.exports.getAllFields = state =>
  schema.getIsSchemaLoaded(state[NAME].schema) ?
    getAllFields(
      schema.getFields(state[NAME].schema),
      undefinedFields.getUndefinedFields(state[NAME].undefinedFields),
      module.exports.getHiddenColumns(state)
      ) : []

module.exports.getIsKeyUsed = state => {
    const usedKeys = module.exports.getAllFields(state).map(field => field.key)
    const currentKey = state[NAME].addField.fieldKey
    return includes_(usedKeys, currentKey)
}

module.exports.getIsRowBeingAdded = state => isRowBeingAdded.getIsRowBeingAdded(state[NAME].isRowBeingAdded)

module.exports.getHeaderDropDown = state => headerDropDown.getHeaderDropDown(state[NAME].headerDropDown)

module.exports.getOpenDropDown = state => openDropDown.getOpenDropDown(state[NAME].openDropDown)

module.exports.getAddFieldFormKey = state => addField.getKey(state[NAME].addField)

module.exports.getAddFieldFormTitle = state => addField.getTitle(state[NAME].addField)

module.exports.getAddFieldFormType = state => addField.getType(state[NAME].addField)

module.exports.getIsTitleDirty = state => addField.getIsTitleDirty(state[NAME].addField)

module.exports.getFieldPropertiesFormValues = state => fieldProperties.getFormValues(state[NAME].fieldProperties)

module.exports.getSortModel = state => sort.getSortModel(state[NAME].sort)

module.exports.getSortForm = state => sort.getSortForm(state[NAME].sort)

module.exports.getFilterModel = state => filter.getFilterModel(state[NAME].filter)

module.exports.getFilterForm = state => filter.getFilterForm(state[NAME].filter)

module.exports.getIsSyncInProgress = state => sync.getIsSyncInProgress(state[NAME].sync)

module.exports.getIsSyncCompleted = state => sync.getIsSyncCompleted(state[NAME].sync)

module.exports.getIsSyncFailed = state => sync.getIsSyncFailed(state[NAME].sync)

module.exports.getHighlightedColumns = state => rangeSelection.getHighlightedColumns(state[NAME].rangeSelection)

module.exports.getPinModel = state => columnSettings.getPinModel(state[NAME].columnSettings)

module.exports.getIsOverlayDisplayed = state => preloader.isOverlayDisplayed(state[NAME].preloader)

module.exports.getOverlayMessage = state => preloader.getOverlayMessage(state[NAME].preloader)

module.exports.getAllColumnsWidth = state => {
  return module.exports.getAllFields(state)
      .filter(field => !field.hide)
      .length
    * 200
}

module.exports.getLastFieldAdded = state => schema.getLastFieldAdded(state[NAME].schema)

module.exports.isMyAccountApp = state => state.app && state.app.environment === 'my-account-app'
