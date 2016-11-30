'use strict'
const React = require('react')
const {connect} = require('react-redux')

const TextInput = require('../fake-ui-lib/textInput')
const Select = require('../fake-ui-lib/select')
const actions = require('./actions')
const {getAddFieldFormKey, getAddFieldFormTitle, getAddFieldFormType, getIsKeyUsed} = require('../../reducer')
const {FIELD_TYPE_OPTIONS} = require('../../constants')

const styles = require('./style.scss')
const validFieldKey = /^([a-z]|[a-z][a-z0-9_]+)$/

const mapStateToProps = state => ({
  fieldKey: getAddFieldFormKey(state),
  title:  getAddFieldFormTitle(state),
  fieldType: getAddFieldFormType(state),
  isKeyUsed: getIsKeyUsed(state)
})

const mapDispatchToProps = actions

const AddFieldForm = ({
  closeDropdown,
  fieldKey,
  title,
  fieldType,
  isKeyUsed,
  updateForm,
  addField
}) => {
  
  const isKeyValid = validFieldKey.test(fieldKey)

  const isFormValid = title && fieldKey && !isKeyUsed && isKeyValid

  const submitForm = e => {
    e.preventDefault()
    addField({
      fieldKey,
      field: {displayName: title, type: fieldType}
    })
  }

  const fieldKeyExistsError = () => (
    <div data-aid="fieldkey-exists" className={styles.errorMessage}>
      Field Name '{fieldKey}' already exists!
    </div>
  )

  const fieldKeyInvalidError = () => (
    <div data-aid="fieldkey-invalid" className={styles.errorMessage}>
      Field key is not valid!
    </div>
  )

  return (
    <div data-aid="add-field-form">
      <form onSubmit={submitForm}>

        <h3>
          Add column
          <button type="button" onClick={closeDropdown} data-aid="close">x</button>
        </h3>

        <hr />

        <TextInput
          autoFocus={true}
          aid="title-input"
          onChange={value => updateForm({key: 'title', value})}
          value={title}
          title="Column Title"
        />

        <hr />

        <TextInput
          aid="key-input"
          title="Field Name"
          onChange={value => updateForm({key: 'fieldKey', value})}
          value={fieldKey}
        />

        {isKeyUsed ? fieldKeyExistsError() : null}
        {isKeyValid ? null : fieldKeyInvalidError()}

        <hr />

        <Select
          inputAid="type-select"
          value={fieldType}
          onChange={value => updateForm({key: 'fieldType', value})}
          triggerInitialValueChange={true}
          options={FIELD_TYPE_OPTIONS}
          title="Data Type"
        />

        <hr />

        <button
          type="submit"
          data-aid="submit"
          disabled={!isFormValid}
          onClick={submitForm}         
        >
          Add Column
        </button>

      </form>
    </div>
  )
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddFieldForm)
