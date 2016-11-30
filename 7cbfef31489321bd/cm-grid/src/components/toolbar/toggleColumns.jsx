const React = require('react')

const ToggleColumns = (props) => (
  <div data-aid="toggle-columns-panel">
    {props.columns.map((column, index) => (
      <div key={index} data-aid={`toggle-column-${column.key}`}>
        <input
          type="checkbox"
          checked={!props.hiddenColumns[column.key]}
          data-aid="toggle-column-checkbox"
          onChange={(evt) => props.onColumnVisibilityChange(column.key, !evt.target.checked)}
        />
        <span data-aid="toggle-column-title">
          {column.displayName}
        </span>
      </div>
    ))}
  </div>
)

ToggleColumns.propTypes = {
  columns: React.PropTypes.array.isRequired,
  hiddenColumns: React.PropTypes.object.isRequired,
  onColumnVisibilityChange: React.PropTypes.func.isRequired
}

module.exports = ToggleColumns
