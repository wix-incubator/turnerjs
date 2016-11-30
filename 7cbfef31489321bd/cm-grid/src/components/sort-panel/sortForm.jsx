'use strict'

const React = require('react')
const RadioButtons = require('../fake-ui-lib/radioButtons')
const Select = require('../fake-ui-lib/select')
const isEmpty_ = require('lodash/isEmpty')

const orderOptions = [{
  value: 'asc',
  label: 'Sort A -> Z'
},
{
  value: 'desc',
  label: 'Sort Z -> A'
}]

class SortForm extends React.Component {
  componentWillUnmount() {
    this.props.onSortFormClose()
  }

  onChange({fieldKey, order}) {
    const data = {}
    if (!isEmpty_(fieldKey)) {
      data.fieldKey = fieldKey
    }
    if (!isEmpty_(order)) {
      data.order = order
    }

    this.props.onSortFormChanged(data)

    const nextSortForm = Object.assign(this.props.sortForm, data)

    if (!isEmpty_(nextSortForm.fieldKey) && !isEmpty_(nextSortForm.order)) {
      this.props.onSave()
    }
  }

  render() {
    const displayedFields = this.props.fields
      .filter((field) => !field.hide)
    const hiddenFields = this.props.fields
      .filter((field) => !!field.hide)

    const fields = [
      ...displayedFields,
      ...hiddenFields
    ]

    return (
      <div data-aid="sort-form-wrapper">
        <a href="#" data-aid="sort-form-back-to-list" onClick={this.props.onSortFormClose}>Back</a>
        <Select
          options={fields.map((field) => ({value: field.key, label: field.displayName}))}
          onChange={(fieldKey) => this.onChange({fieldKey})}
          title="Which field to sort?"
          inputAid="sort-form-title-select"
          optionAid="sort-form-title-option"
          value={this.props.sortForm.fieldKey}
          triggerInitialValueChange={true}
        />
        <RadioButtons
          options={orderOptions}
          onChange={(order) => this.onChange({order})}
          defaultValue={this.props.sortForm.order}
          title="Choose a direction"
          aid="sort-form-order"
        />
        <a href="#" data-aid="sort-form-remove-sort" onClick={this.props.onRemoveSort}>Remove Sort</a>
      </div>
    )
  }
}

SortForm.propTypes = {
  sortForm: React.PropTypes.object.isRequired,
  fields: React.PropTypes.array.isRequired,
  onSortFormChanged: React.PropTypes.func.isRequired,
  onRemoveSort: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func.isRequired
}

module.exports = SortForm
