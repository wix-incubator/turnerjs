'use strict'

const React = require('react')
const find_ = require('lodash/find')
const isUndefined_ = require('lodash/isUndefined')

const Select = require('../fake-ui-lib/select')
const {types, DEFAULT_FIELD_TYPE} = require('./constants')
const ConditionValues = require('./conditionValues')
const validateForm = require('./validateForm')

const getFieldType = (fields, fieldKey) => {
  const field = find_(fields, (field) => field.key === fieldKey)

  return field ? field.type : DEFAULT_FIELD_TYPE
}

class FilterForm extends React.Component {
  componentWillUnmount() {
    this.props.onClose()
  }

  onChange({fieldKey, filterType, value, from, to}) {
    const data = {}

    if (fieldKey) {
      data.fieldKey = fieldKey
      data.fieldType = getFieldType(this.props.fields, fieldKey)
    }

    if (filterType) {
      data.condition = {}
      data.condition.filterType = filterType
    }

    if (!isUndefined_(value)) {
      data.condition = {}
      data.condition.value = value
    }

    if (from) {
      data.condition = {}
      data.condition.from = from
    }

    if (to) {
      data.condition = {}
      data.condition.to = to
    }

    this.props.onChange(data)

    if (validateForm(data, this.props.filterForm)) {
      this.props.save()
    }
  }

  render() {
    const fields = [
      ...this.props.fields.filter(field => !field.hide),
      ...this.props.fields.filter(field => !!field.hide)
    ]

    return (
      <div data-aid="filter-form-wrapper">
        {this.props.isFromContextMenu ? null : (
          <a href="#" data-aid="filter-form-back-to-list" onClick={this.props.onClose}>Back</a>
        )}
        <div>
          <Select
            options={fields.map((field) => ({value: field.key, label: field.displayName}))}
            onChange={(fieldKey) => this.onChange({fieldKey})}
            title="Which field to filter?"
            inputAid="filter-form-field"
            value={this.props.filterForm.fieldKey}
            disabled={this.props.isFromContextMenu}
            triggerInitialValueChange={true}
          />
          <Select
            options={types[this.props.filterForm.fieldType] || types[DEFAULT_FIELD_TYPE]}
            onChange={(filterType) => this.onChange({filterType})}
            title="Choose a condition"
            inputAid="filter-form-condition"
            value={this.props.filterForm.condition.filterType}
            triggerInitialValueChange={true}
          />
          <ConditionValues
            filterType={this.props.filterForm.condition.filterType}
            onChange={this.onChange.bind(this)}
            value={this.props.filterForm.condition.value}
            from={this.props.filterForm.condition.from}
            to={this.props.filterForm.condition.to}
          />
        </div>
        <a href="#" data-aid="filter-form-remove-filter" onClick={() => {
          this.props.remove()
          if (this.props.isFromContextMenu) {
            this.props.closeForm()
          }
        }}>Remove Filter</a>
      </div>
    )
  }
}

FilterForm.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  save: React.PropTypes.func.isRequired,
  remove: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func,
  closeForm: React.PropTypes.func,
  fields: React.PropTypes.array.isRequired,
  filterForm: React.PropTypes.object.isRequired,
  isFromContextMenu: React.PropTypes.bool.isRequired
}

module.exports = FilterForm
