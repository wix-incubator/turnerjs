'use strict'

const React = require('react')

class TextEditor extends React.Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.state = {
      value: props.charPress || props.value || ''
    }
  }

  componentDidMount() {
    this.textField.focus()

    if (!this.props.charPress) {
      this.textField.select()
    }
  }

  onChange(evt) {
    this.setState({value: evt.target.value})
  }

  getValue() {
    return this.state.value
  }

  render() {
    return (
      <input
        id="text-editor-input"
        data-aid="text-editor-input"
        className="cell-editor-input"
        ref={(ref) => this.textField = ref}
        onChange={this.onChange}
        value={this.state.value}
        type="text"
      />
    )
  }
}

module.exports = TextEditor

module.exports.textEditorParams = {
  preventLeft: true,
  preventRight: true,
  preventUp: true,
  preventDown: true
}
