'use strict'

const React = require('react')
const isEmpty_ = require('lodash/isEmpty')

const getValueOrDefault = (props) => props.value != null ? props.value : props.placeholder

class Select extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: getValueOrDefault(this.props)
    }
  }

  handleChange(event) {
    this.props.onChange(event.target.value)
    this.setState({
      value: event.target.value
    })
  }

  componentWillMount() {
    if (this.props.triggerInitialValueChange && isEmpty_(this.state.value)) {
      this.props.onChange(this.props.options[0].value)
    }
  }

  componentWillReceiveProps(nextProps) {
    const value = getValueOrDefault(nextProps)

    this.setState({
      value
    })
    if (value !== this.state.value && value === undefined) {
      this.props.onChange(nextProps.options[0].value)
    }
  }

  render() {
    return (
      <div data-aid={this.props.aid}>
        <div data-aid="title">{this.props.title}</div>
        <select
          value={this.state.value}
          disabled={this.props.disabled}
          onChange={this.handleChange.bind(this)}
          data-aid={this.props.inputAid}
        >
          {this.props.placeholder ?
            <option value={this.props.placeholder} disabled="true" hidden="true">
              {this.props.placeholder}
            </option> : null}
          {this.props.options.map(item => {
            return <option
              key={item.value}
              id={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </option>
          })}
        </select>
      </div>
    )
  }
}

Select.propTypes = {
  value: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  title: React.PropTypes.string,
  onChange: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  options: React.PropTypes.array.isRequired,
  triggerInitialValueChange: React.PropTypes.bool
}

module.exports = Select
