'use strict'

const React = require('react')

const Input = require('../fake-ui-lib/textInput')
const DateTimeEditor = require('../fake-ui-lib/dateTimeEditor')
const {allTypes, noValueTypes} = require('./constants')

const ConditionValues = ({filterType, onChange, value, from, to}) => {
  if (noValueTypes.indexOf(filterType) !== -1) {
    return null
  }

  switch (filterType) {
    case allTypes.dateEq:
    case allTypes.dateGe:
    case allTypes.dateGt:
    case allTypes.dateLe:
    case allTypes.dateLt:
      return (
        <div>
          <div>Enter filter value here</div>
          <DateTimeEditor
            value={new Date(value)}
            onChange={(value) => onChange({value: value.toString()})}
            dateAid="filter-form-date-condition"
            timeAid="filter-form-time-condition"
          />
        </div>
      )

    case allTypes.between:
      return <div>
        <div>From date</div>
        <DateTimeEditor
          value={new Date(from)}
          onChange={(from) => onChange({from: from.toString()})}
          dateAid="filter-form-date-from-value"
          timeAid="filter-form-time-from-value"
        />
        <div>To date</div>
        <DateTimeEditor
          value={new Date(to)}
          onChange={(to) => onChange({to: to.toString()})}
          dateAid="filter-form-date-to-value"
          timeAid="filter-form-time-to-value"
        />
      </div>

    case allTypes.booleanEq:
      return (
        <input
          type="checkbox"
          value={value}
          onChange={(evt) => onChange({value: evt.target.checked})}
          data-aid="filter-form-boolean-input"
         />
      )

    default:
      return <Input
        onChange={(value) => onChange({value})}
        title="By what value to filter?"
        placeholder="Enter filter value here"
        aid="filter-form-text-value"
        value={value}
      />
  }
}

ConditionValues.propTypes = {
  filterType: React.PropTypes.string,
  onChange: React.PropTypes.func,
  value: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.bool
  ]),
  from: React.PropTypes.string,
  to: React.PropTypes.string
}

module.exports = ConditionValues
