const React = require('react')

const styles = require('./addColumnButton.scss')

const AddColumnButton = ({toggleDropdown, left}) => {
  return (
    <button
      data-aid="add-column-button"
      className={styles.button}
      onClick={toggleDropdown}
      style={{left}}
    >
      +
    </button>
  )
}

AddColumnButton.propTypes = {
  toggleDropdown: React.PropTypes.func.isRequired,
  left: React.PropTypes.string
}

module.exports = AddColumnButton
