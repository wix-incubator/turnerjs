'use strict'

const React = require('react')
const noop_ = require('lodash/noop')

module.exports = class TextInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value || ''
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value || ''
      })
    }
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    })
    this.props.onChange(event.target.value)
  }

  handleBlur(event) {
    this.props.onBlur(event.target.value)
  }

  render() {
    return (
      <div>
        <label htmlFor={this.props.id}>{this.props.title}</label>
        {this.props.isMultiLine ?
          <textarea placeholder={this.props.placeholder}
                    data-aid={this.props.aid}
                    value={this.state.value}
                    id={this.props.id}
                    disabled={this.props.disabled}
                    maxLength={this.props.maxLength}
                    onBlur={this.handleBlur.bind(this)}
                    onChange={this.handleChange.bind(this)} /> :
          <input placeholder={this.props.placeholder}
                 style={{display: 'block'}} 
                 autoFocus={this.props.autoFocus}
                 data-aid={this.props.aid}
                 value={this.state.value}
                 id={this.props.id}
                 disabled={this.props.disabled}
                 onBlur={this.handleBlur.bind(this)}
                 onChange={this.handleChange.bind(this)} />}
      </div>)
  }
}

module.exports.propTypes = {
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  title: React.PropTypes.string,
  isMultiLine: React.PropTypes.bool,
  maxLength: React.PropTypes.number,
  aid: React.PropTypes.string,
  autoFocus: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  onBlur: React.PropTypes.func
}

module.exports.defaultProps = {
  onChange: noop_,
  onBlur: noop_
}
