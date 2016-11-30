'use strict'

const React = require('react')
const range_ = require('lodash/range')
const classNames = require('classnames')

const styles = require('./timePicker.scss')
const TimePickerOption = require('./timePickerOption')

class TimePicker extends React.Component {
  constructor() {
    super()

    this.state = {
      focused: false
    }

    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    if (this.props.onKeyDown) {
      this.input.addEventListener('keydown', this.props.onKeyDown)
    }

    this.container.addEventListener('mousedown', this.onMouseDown)
  }

  onMouseDown(e) {
    e.stopPropagation()
  }

  componentWillUnmount() {
    if (this.props.onKeyDown) {
      this.input.removeEventListener('keydown', this.props.onKeyDown)
    }

    this.container.removeEventListener('mousedown', this.onMouseDown)
  }

  onFocus() {
    this.setState({
      focused: true
    })
  }

  onBlur() {
    this.setState({
      focused: false
    })
  }

  onChange(evt) {
    this.props.onChange(evt.target.value)
  }

  render() {
    return (
      <div
        ref={container => this.container = container}
        className={styles.timePickerContainer}
        onFocus={this.onFocus}
        data-aid="time-picker"
      >
        <input
          className={classNames(styles.timeInput, 'timepicker-input')}
          ref={ref => this.input = ref}
          data-aid={this.props.aid}
          onChange={this.onChange}
          value={this.props.value}
          placeholder={this.props.placeholder}
        />
        {this.state.focused ? (
          <div data-aid="time-picker-select" className={styles.timePickerSelectContainer}>
            {range_(48).map((value) => (
              <TimePickerOption
                hourHalves={value}
                key={value}
                onClick={(val) => {
                  this.props.onChange(val)
                  this.onBlur()
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }
}

TimePicker.propTypes = {
  aid: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  onKeyDown: React.PropTypes.func
}

module.exports = TimePicker
