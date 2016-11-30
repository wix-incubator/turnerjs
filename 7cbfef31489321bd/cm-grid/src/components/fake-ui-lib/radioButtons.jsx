'use strict'

const React = require('react')

module.exports = class RadioButtons extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: this.props.defaultValue
    }
  }

  handleChange(event) {
    this.props.onChange(event.target.value)
    this.setState({
      checked: event.target.value
    })
  }

  render() {
    return (
      <div data-aid={this.props.aid}>
        <div>{this.props.title}</div>
        {this.props.options.map(item => {
          return <div key={item.value}><label htmlFor={item.value}>
            <input type="radio"
              id={item.value}
              value={item.value}
              checked={this.state.checked && this.state.checked === item.value}
              onChange={this.handleChange.bind(this)} />
            {item.label}</label></div>
        })}
      </div>
    )
  }
}
