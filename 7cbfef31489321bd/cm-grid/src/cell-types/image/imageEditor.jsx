'use strict'

const React = require('react')

const {IMAGE_EDITOR_MODES} = require('../../constants')

const shouldOpenMediaManager = (value, requestedEditorType, mediaManagerSupport) => {
  const explicitlyUseMediaManager = requestedEditorType === IMAGE_EDITOR_MODES.MEDIA_MANAGER
  const explicitlyUseNativeEditor = requestedEditorType === IMAGE_EDITOR_MODES.NATIVE
  const valueNotSet = !value
  const isWixUri = value && mediaManagerSupport.isWixUri(value)

  return explicitlyUseMediaManager || (!explicitlyUseNativeEditor && (valueNotSet || isWixUri))
}

class ImageEditor extends React.Component {
  constructor(props) {
    super(props)
    
    this.onChange = this.onChange.bind(this)
    this.openMediaManager = this.openMediaManager.bind(this)
    this.handleMediaManagerResult = this.handleMediaManagerResult.bind(this)

    this.state = {
      value: props.value || ''
    }
  }
  
  setValue(value) {
    this.setState({value})
  }

  openMediaManager() {
    this.props.services.openMediaManager().then(this.handleMediaManagerResult)
  }

  handleMediaManagerResult(images) {
    if (images && images.length > 0) {
      const value = this.props.services.mediaManagerSupport.generateWixCodeImageUri(images[0])
      this.setState({value})
    }
    this.props.stopEditing()
  }
  
  componentDidMount() {
    const {requestedEditorType} = this.props.getCustomEditorParams()

    if (shouldOpenMediaManager(this.props.value, requestedEditorType, this.props.services.mediaManagerSupport)) {
      this.openMediaManager()
    } else {
      this.imageEditor.select()
      this.imageEditor.focus()
    }
  }
  
  onChange(evt) {
    this.setValue(evt.target.value)
  }
  
  getValue() {
    // empty string is invalid image value and will cause validation errors
    if (this.state.value === '') {
      return null
    }
    return this.state.value
  }
  
  render() {
    return (
      <input
        className="cell-editor-input"
        data-aid="image-editor"
        ref={(ref) => this.imageEditor = ref}
        onChange={this.onChange}
        value={this.state.value} />
    )
  }
}

ImageEditor.propTypes = {
  value: React.PropTypes.any,
  services: React.PropTypes.shape({
    openMediaManager: React.PropTypes.func.isRequired,
    mediaManagerSupport: React.PropTypes.object.isRequired
  }).isRequired,
  stopEditing: React.PropTypes.func.isRequired,
  getCustomEditorParams: React.PropTypes.func.isRequired
}

module.exports = ImageEditor

module.exports.imageEditorParams = {
  preventLeft: true,
  preventRight: true
}
