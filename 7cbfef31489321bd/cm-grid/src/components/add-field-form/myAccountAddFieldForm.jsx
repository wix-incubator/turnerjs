'use strict'
const React = require('react')
const {connect} = require('react-redux')

const TextInput = require('../fake-ui-lib/textInput')
const actions = require('./actions')
const {getAddFieldFormKey, getAddFieldFormTitle, getAddFieldFormType,
  getIsKeyUsed, getIsTitleDirty} = require('../../reducer')

const styles = require('./style.scss')

const validTitle = /[a-zA-Z]/
const ID = 'add-undefined-field-form'

const mapStateToProps = state => ({
  fieldKey: getAddFieldFormKey(state),
  title:  getAddFieldFormTitle(state),
  fieldType: getAddFieldFormType(state),
  isTitleDirty: getIsTitleDirty(state),
  isKeyUsed: getIsKeyUsed(state)
})

const mapDispatchToProps = actions

const AddFieldForm = ({
  closeDropdown,
  fieldKey,
  title,
  fieldType,
  isTitleDirty,
  isKeyUsed,
  addUndefinedField,
  updateForm
}) => {

  const validationErrorVisible = isTitleDirty && !(fieldKey && validTitle.test(fieldKey))

  const handleChange = value => {
    updateForm({key: 'title', value}) 

    if (!isTitleDirty) {
      updateForm({key: 'isTitleDirty', value: true})
    }
  }

  const invalidFieldKeyError = () => (
    <div data-aid="fieldkey-invalid" className={styles.errorMessage}>
      Field name must contain a letter!
    </div>
  )

  const fieldKeyExistsError = () => (
    <div data-aid="fieldkey-exists" className={styles.errorMessage}>
      Field Key '{fieldKey}' already exists!
    </div>
  )

  const isFormValid = title && !validationErrorVisible && !isKeyUsed

  const submitForm = e => {
    e.preventDefault()
    addUndefinedField(fieldKey)
  }

  return (
    <div data-aid="add-field-form">
      <form onSubmit={submitForm}>

        <h3>
          Add Column
          <button type="button" onClick={closeDropdown} data-aid="close">x</button>
        </h3>

        <hr />

        <TextInput
          id={ID}
          autoFocus={true}
          aid="key-input"
          title="Field Name"
          onChange={handleChange}
          value={title}
        />

        {validationErrorVisible ? invalidFieldKeyError() : null}
        {isKeyUsed ? fieldKeyExistsError() : null}

        <hr />

        <button
          type="submit"
          data-aid="submit"
          onClick={submitForm}
          disabled={!isFormValid}
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
