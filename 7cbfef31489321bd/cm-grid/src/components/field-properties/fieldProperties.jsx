'use strict'

const React = require('react')
const {connect} = require('react-redux')

const actions = require('./actions')
const TextInput = require('../fake-ui-lib/textInput')
const Select = require('../fake-ui-lib/select')
const {FIELD_TYPE_OPTIONS} = require('../../constants')
const {getFieldPropertiesFormValues} = require('../../reducer')

const mapStateToProps = state => getFieldPropertiesFormValues(state)

const mapDispatchToProps = actions

const FieldProperties = ({
  displayName,
  fieldKey,
  isSystemField,
  isUndefinedField,
  fieldType,
  onClose,
  updateForm,
  updateFieldProperties,
  addToSchema
}) => (
  <div data-aid="field-properties">
    <h3>
      <span>{isUndefinedField ? 'Add to Schema' : 'Manage column'}</span>
      <button
        data-aid="close-button"
        onClick={onClose}>
        X
      </button>
    </h3>
    <TextInput
      aid="display-name-input"
      onChange={value => updateForm({key: 'displayName', value})}
      value={displayName}
      title="Column Title"
      disabled={isSystemField}
    />
    <hr />
    <TextInput
      aid="name-input"
      onChange={value => updateForm({key: 'fieldKey', value})}
      value={fieldKey}
      title="Field Name"
      disabled={true}
    />
    <hr />
    <Select
      aid="type-dropdown"
      options={FIELD_TYPE_OPTIONS}
      onChange={value => updateForm({key: 'fieldType', value})}
      value={fieldType}
      title="Field Type"
      disabled={!isUndefinedField}
    />
    <hr />
    <button
      data-aid="submit-button"
      disabled={isSystemField}
      onClick={() => {
        isUndefinedField ?
          addToSchema({key: fieldKey, displayName, type: fieldType, isUndefinedField}) :
          updateFieldProperties({key: fieldKey, displayName, type: fieldType, isUndefinedField})
          
        onClose()
      }}
    >
      {isUndefinedField ? 'Add' : 'Update'}
    </button>
  </div>
)

FieldProperties.propTypes = {
  onClose: React.PropTypes.func.isRequired
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(FieldProperties)
