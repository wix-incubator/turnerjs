'use strict'

const React = require('react')
const styles = require('./richtext.scss')
const classNames = require('classnames')

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.state = {
      value: props.charPress || props.value || ''
    }
  }

  componentDidMount() {
    this.richTextEditor.focus()
  }

  onChange(evt) {
    this.setState({value: evt.target.value})
  }

  getValue() {
    return this.state.value
  }

  render() {
    return <textarea
      className={classNames(styles.richtext, 'cell-editor')}
      id="richtext-editor-input"
      data-aid="richtext-editor-input"
      ref={(ref) => this.richTextEditor = ref}
      onChange={this.onChange}
      value={this.state.value} />
  }
}

module.exports = RichTextEditor

module.exports.richtextEditorParams = {
  preventLeft: true,
  preventRight: true,
  preventUp: true,
  preventDown: true,
  preventShiftEnter: true
}
