'use strict'

const React = require('react')

const styles = require('./timePicker.scss')

const formatHours = hours => hours < 10 ? '0' + hours : hours
const formatMinutes = minutes => minutes ? '30' : '00'

const TimePickerOption = ({hourHalves, onClick}) =>  {
  const hours = Math.trunc(hourHalves / 2)
  const halfAnHour = hourHalves % 2
  const time = formatHours(hours) + ':' + formatMinutes(halfAnHour)

  return (
    <div data-aid="time-picker-option" className={styles.timePickerOptionContainer} onClick={() => onClick(time)}>
      {time}
    </div>
  )
}

TimePickerOption.propTypes = {
  hourHalves: React.PropTypes.number.isRequired,
  onClick: React.PropTypes.func.isRequired
}

module.exports = TimePickerOption
