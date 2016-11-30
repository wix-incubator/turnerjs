const React = require('react')

const styles = require('./addRowButton.scss')

const AddRowButton = ({onClick, top}) => (
  <button
    data-aid="add-row-button-grid"
    className={styles.button}
    onClick={onClick}
    style={{top}}
  >
    +
  </button>
)

AddRowButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  top: React.PropTypes.string
}

module.exports = AddRowButton
