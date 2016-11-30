'use strict'

const React = require('react')
const classNames = require('classnames')

const {toDateString, toTimeString, toDateObject} = require('../../formatters/datetime')
const styles = require('./dateTimeEditor.scss')
const TimePicker = require('../time-picker/timePicker')

class DateTimeEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      date: toDateString(props.value),
      time: toTimeString(props.value)
    }
  }

  /*
    Regarding native event listeners:
    The host of DateTimeEditor may need to stop event propagation in order to override ag-grid behaviour
    React uses single event listener (on root) so React's listeners on components are processed only after native event
    bubbles to the top. This means that there is no way to stop native event propagation in React's event listener.
   */
  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount(this.dateField, this.timeField)
    }
    if (this.props.onDateKeyDown) {
      this.dateField.addEventListener('keydown', this.props.onDateKeyDown)
    }
  }

  componentWillUnmount() {
    if (this.props.onDateKeyDown) {
      this.dateField.removeEventListener('keydown', this.props.onDateKeyDown)
    }
  }

  onDateChange(evt) {
    this.setState({
      date: evt.target.value
    })

    if (this.props.onChange && evt.target.value) {
      this.props.onChange(toDateObject(evt.target.value, this.state.time))
    }
  }

  onTimeChange(time) {
    this.setState({time})

    if (this.props.onChange && this.state.date) {
      this.props.onChange(toDateObject(this.state.date, time))
    }
  }

  render() {
    return (
      <div className="cell-editor-wrapper">
        <input
          className={classNames(styles.dateInput, 'datepicker-input')}
          ref={ref => this.dateField = ref}
          data-aid={this.props.dateAid}
          onChange={this.onDateChange.bind(this)}
          value={this.state.date}
          placeholder="mm/dd/yyyy"
        />
        <TimePicker
          aid={this.props.timeAid}
          onChange={this.onTimeChange.bind(this)}
          value={this.state.time}
          placeholder="hh:mm"
          onKeyDown={this.props.onTimeKeyDown}
        />
      </div>
    )
  }
}

DateTimeEditor.propTypes = {
  dateAid: React.PropTypes.string,
  timeAid: React.PropTypes.string,
  onMount: React.PropTypes.func,
  onDateKeyDown: React.PropTypes.func,
  onTimeKeyDown: React.PropTypes.func,
  onChange: React.PropTypes.func
}

module.exports = DateTimeEditor
