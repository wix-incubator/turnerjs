'use strict'

const React = require('react')
const isFunction_ = require('lodash/isFunction')

const boolean = require('./boolean/booleanEditor')
const number = require('./number/numberEditor')
const richtext = require('./richtext/richtextEditor')
const datetime = require('./datetime/datetimeEditor')
const text = require('./text/textEditor')
const image = require('./image/imageEditor')
const json = require('./json/jsonEditor')
const styles = require('./editorContainer.scss')

const editors = {
  boolean,
  number,
  richtext,
  datetime,
  text,
  image,
  json
}

const DEFAULT_EDITOR_TYPE = 'text'

class EditorContainer extends React.Component {
  constructor() {
    super()

    this.setValidationMessage = this.setValidationMessage.bind(this)

    this.state = {
      message: null
    }
  }

  getValue() {
    if (this.component) {
      return this.component.getValue()
    }
  }

  setValidationMessage(message) {
    this.setState({message})
  }

  validateValue() {
    if (this.component && isFunction_(this.component.validateValue)) {
      return this.component.validateValue()
    }
    return true
  }

  render() {
    const Component = editors[this.props.editorType] || editors[DEFAULT_EDITOR_TYPE]
    return (
      <div className={styles.editorContainer}>
        <div className={styles.typedEditor}>
          <Component
            value={this.props.value}
            charPress={this.props.charPress}
            ref={(component) => this.component = component}
            setValidationMessage={this.setValidationMessage}
            services={this.props.services}
            stopEditing={this.props.stopEditing}
            getCustomEditorParams={this.props.getCustomEditorParams}
          />
        </div>
        {this.state.message ? (
          <div data-aid="validation-message" className={styles.validationMessage}>
            {this.state.message}
          </div>
        ) : null}
      </div>
    )
  }
}

EditorContainer.propTypes = {
  value: React.PropTypes.any,
  charPress: React.PropTypes.string,
  services: React.PropTypes.shape({
    openMediaManager: React.PropTypes.func.isRequired,
    mediaManagerSupport: React.PropTypes.object.isRequired
  }).isRequired,
  stopEditing: React.PropTypes.func.isRequired,
  getCustomEditorParams: React.PropTypes.func.isRequired
}

module.exports = EditorContainer
