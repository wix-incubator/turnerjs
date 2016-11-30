'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('../richtext/richtext.scss')

class JsonEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value ? JSON.stringify(props.value) : '',
      initialValue: props.value,
      valid: true
    }
  }

  componentDidMount() {
    this.objectEditor.focus()
  }

  onChange(evt) {
    const valid = this.validateValue(evt.target.value)
    this.setState({value: evt.target.value, valid})

    if (!valid) {
      this.props.setValidationMessage('Invalid json value was entered into cell. The value cannot be saved.')
    } else {
      this.props.setValidationMessage()
    }
  }

  getValue() {
    try {
      return JSON.parse(this.state.value)
    } catch (e) {
      return this.state.initialValue
    }
  }

  validateValue(value) {
    try {
      JSON.parse(value || this.state.value)
      return true
    } catch (e) {
      return false
    }
  }
  
  render() {
    return <textarea
      id="json-editor-input"
      data-aid="json-editor-input"
      className={classNames(styles.richtext, 'cell-editor', {[styles.validationError]: !this.state.valid})}
      ref={ref => this.objectEditor = ref}
      onChange={this.onChange.bind(this)}
      value={this.state.value} />
  }
}

module.exports = JsonEditor

module.exports.jsonEditorParams = {
  preventLeft: true,
    preventRight: true,
    preventUp: true,
    preventDown: true
}
