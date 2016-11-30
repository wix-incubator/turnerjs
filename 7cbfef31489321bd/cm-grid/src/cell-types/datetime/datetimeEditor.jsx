'use strict'

const React = require('react')
const includes_ = require('lodash/includes')
const values_ = require('lodash/values')
const classNames = require('classnames')

const {KEYS} = require('../../constants')
const DateTimeEditor = require('../../components/fake-ui-lib/dateTimeEditor')
const styles = require('./styles.scss')

const timeFieldPreventedKeys = values_([KEYS.LEFT, KEYS.UP, KEYS.RIGHT, KEYS.DOWN])

class DatetimeEditor extends React.Component {

  constructor(props) {
    super(props)

    this.onChange = this.onChange.bind(this)

    this.state = {
      initialValue: props.value,
      value: props.value,
      valid: true
    }
  }

  onMount(dateField) {
    dateField.focus()
    dateField.select()
  }
  
  onDateKeyDown(e) {
    const key = e.which || e.keyCode
    if (key !== KEYS.ENTER) {
      e.stopPropagation()
    }
  }

  onTimeKeyDown(e) {
    const key = e.which || e.keyCode
    if (includes_(timeFieldPreventedKeys, key)) {
      e.stopPropagation()
    }
  }

  onChange(value) {
    const valid = this.validateValue(value)
    this.setState({value, valid})

    if (valid) {
      this.props.setValidationMessage()
    } else {
      this.props.setValidationMessage('Invalid date time')
    }
  }

  getValue() {
    if (this.state.valid) {
      return this.state.value
    }

    return this.state.initialValue
  }

  validateValue(value) {
    value = value || this.state.value

    if (value instanceof Date && !isNaN(value.getTime())) {
      return true
    }

    return false
  }

  render() {
    return (
      <div className={classNames('cell-editor-content', {[styles.validationError]: !this.state.valid})}>
        <DateTimeEditor
          className="cell-editor"
          value={this.state.value}
          dateAid="datetime-editor-date"
          timeAid="datetime-editor-time"
          onMount={this.onMount}
          onDateKeyDown={this.onDateKeyDown}
          onTimeKeyDown={this.onTimeKeyDown}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

module.exports = DatetimeEditor

module.exports.datetimeEditorParams = {}
