'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('./styles.scss')

class NumberEditor extends React.Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)

    let value = parseFloat(props.value)
    value = isNaN(value) ? undefined : value

    this.state = {
      initialValue: value,
      value,
      valid: true
    }
  }

  setValue(value) {
    const numberRule = /(^[+-]?(([0-9]+)|([0-9]+[.]?[0-9]*))$)|^$/

    if (numberRule.test(value)) {
      const valid = this.validateValue(value)

      if (!valid) {
        this.props.setValidationMessage('Number doesn\'t fit into valid range')
      } else {
        this.props.setValidationMessage()
      }

      this.setState({value, valid})
    }
  }

  componentDidMount() {
    this.numberEditor.select()
    this.numberEditor.focus()
  }

  onChange(evt) {
    this.setValue(evt.target.value)
  }

  getValue() {
    const numberValue = parseFloat(this.state.value)

    if (!this.state.valid || isNaN(numberValue)) {
      return this.state.initialValue
    }

    return numberValue
  }

  validateValue(value) {
    value = value || this.state.value
    const floatValue = parseFloat(value)

    return !isNaN(floatValue) && Number.isSafeInteger(parseInt(value))
  }

  render() {
    return (
      <div className={classNames({[styles.validationError]: !this.state.valid})}>
        <input
          className="cell-editor-input"
          id="number-editor-input"
          data-aid="number-editor-input"
          ref={(ref) => this.numberEditor = ref}
          onChange={this.onChange}
          value={this.state.value} />
      </div>
    )
  }
}

module.exports = NumberEditor

module.exports.numberEditorParams = {
  preventLeft: true,
  preventRight: true
}
