'use strict'

const React = require('react')

class BooleanEditor extends React.Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.booleanField.focus()
  }

  onChange(evt) {
    this.setState({value: evt.target.checked})
  }

  getValue() {
    return this.state.value
  }

  render() {
    return (
      <div className="cell-editor-content">
        <input
          id="boolean-editor-input"
          data-aid="boolean-editor-input"
          ref={(ref) => this.booleanField = ref}
          type="checkbox"
          onChange={this.onChange}
          checked={this.state.value}
        />
      </div>
    )
  }
}

module.exports = BooleanEditor

module.exports.booleanEditorParams = {}
