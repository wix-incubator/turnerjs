'use strict'
const React = require('react')
const find_ = require('lodash/find')

const ColumnContextMenu = (props) => {
  const field = find_(props.fields, (element) => element.key === props.field)
  return (
    <div data-aid="column-context-menu">
      <button data-aid="close-button" onClick={props.onColumnHeaderMenuClose}>X</button>
      <div data-aid="context-menu-sort-asc" onClick={() => props.onToggleSort({fieldKey: props.field, order: 'asc'})}>Sort A -> Z</div>
      <div data-aid="context-menu-sort-desc" onClick={() => props.onToggleSort({fieldKey: props.field, order: 'desc'})}>Sort Z -> A</div>
      <hr />
      <div data-aid="open-filter-panel" onClick={() => {
        props.openFilterPanel(props.field, field.type)
      }}>filter</div>
      <hr />
      {props.pinModel[props.field] ?
        <div data-aid="unpin-button" onClick={() => {
          props.togglePin({fieldKey: props.field, isPinned: false})
          props.onColumnHeaderMenuClose()
        }}>
          unpin
        </div> :
        <div data-aid="pin-button" onClick={() => {
          props.togglePin({fieldKey: props.field, isPinned: true})
          props.onColumnHeaderMenuClose()
        }}>
          pin
        </div>
      }

      <div data-aid="hide-column" onClick={() => {
        props.onColumnVisibilityChange(props.field, true)
        props.onColumnHeaderMenuClose()
      }}>
        hide
      </div>
      <hr />
      {field.isUndefinedField ?
        <div data-aid="add-to-schema-button" onClick={() => props.onPropertiesItemClick(props.field)}>
          Add column to schema
        </div> :
        <div data-aid="manage-properties-button" onClick={() => props.onPropertiesItemClick(props.field)}>
          Edit Properties
        </div>
      }
    </div>
  )
}

ColumnContextMenu.propTypes = {
  field: React.PropTypes.string.isRequired,
  fields: React.PropTypes.array.isRequired,
  onPropertiesItemClick: React.PropTypes.func.isRequired,
  onColumnHeaderMenuClose: React.PropTypes.func.isRequired,
  onToggleSort: React.PropTypes.func.isRequired,
  openFilterPanel: React.PropTypes.func.isRequired,
  togglePin: React.PropTypes.func.isRequired,
  pinModel: React.PropTypes.object.isRequired,
  onColumnVisibilityChange: React.PropTypes.func.isRequired
}

module.exports = ColumnContextMenu
