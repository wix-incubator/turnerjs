'use strict'

const React = require('react')
const {IMAGE_EDITOR_MODES, IMAGE_SIZES} = require('../../constants')

const DropDownMenu = require('../../components/fake-ui-lib/dropDownMenu')
const styles = require('./image.scss')

class ImageRenderer extends React.Component {
  constructor() {
    super()

    this.openMediaManager = this.openMediaManager.bind(this)
    this.editExternalURL = this.editExternalURL.bind(this)
    this.openPreview = this.openPreview.bind(this)
    this.onMouseDownListener = this.onMouseDownListener.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.openDropDown = this.openDropDown.bind(this)

    this.onBlur = () => {
      this.setState({
        focused: false,
        areEditOptionsOpen: false,
        isPreviewOpen: false
      })

      this.props.unsubscribeOnCellsFocused(this.onBlur)
    }

    this.state = {
      focused: false,
      areEditOptionsOpen: false,
      isPreviewOpen: false
    }
  }

  componentDidMount() {
    this.props.parent.addEventListener('focus', this.onFocus)
    this._element.addEventListener('mousedown', this.onMouseDownListener)
  }

  componentWillUnmount() {
    this.props.unsubscribeOnCellsFocused(this.onBlur)
    this.props.parent.removeEventListener('focus', this.onFocus)
    this._element.removeEventListener('mousedown', this.onMouseDownListener)
  }

  onMouseDownListener(e) {
    if (this.state.focused) {
      // If current cell is focused stop propagation of this event since click on dropdown would add focus class to other cell
      e.stopPropagation()
    }
  }

  onFocus() {
    this.props.subscribeOnCellsFocused(this.onBlur)
    this.setState({
      focused: true
    })
  }

  openDropDown() {
    this.setState({
      isPreviewOpen: false,
      areEditOptionsOpen: true
    })
  }

  startEditing(requestedEditorType) {
    this.props.startEditingWithCustomParams({requestedEditorType})
  }

  editExternalURL() {
    this.startEditing(IMAGE_EDITOR_MODES.NATIVE)
  }

  openMediaManager() {
    this.startEditing(IMAGE_EDITOR_MODES.MEDIA_MANAGER)
  }

  openPreview() {
    this.setState({
      isPreviewOpen: true,
      areEditOptionsOpen: false
    })
  }

  getImageSrc(value, width, height) {
    if (this.props.mediaManagerSupport.isWixUri(value)) {
      return this.props.mediaManagerSupport.getUrlFromImageData(
        this.props.mediaManagerSupport.extractImageDataFromWixCodeUri(value),
        width,
        height,
        'fill'
      )
    }
    return value || ''
  }

  render() {
    return (
      <div data-aid="image-renderer" ref={(ref) => this._element = ref}>
        <div className={styles.container}>
          {(() => {
            if (this.props.value) {
              return (
                <div className={styles.imageThumbnailContainer}>
                  <img
                    src={this.getImageSrc(this.props.value, IMAGE_SIZES.THUMBNAIL.WIDTH, IMAGE_SIZES.THUMBNAIL.HEIGHT)}
                    className={styles.imageThumbnail}
                    data-aid="image"
                    onClick={this.openPreview}
                  />
                  <DropDownMenu isOpen={this.state.isPreviewOpen}>
                    <div data-aid="preview">
                      <img
                        src={this.getImageSrc(this.props.value, IMAGE_SIZES.PREVIEW.WIDTH, IMAGE_SIZES.PREVIEW.HEIGHT)}
                        className={styles.previewImage}
                        data-aid="preview-image"
                      />
                    </div>
                  </DropDownMenu>
                </div>
              )
            } else if (this.state.focused) {
              return (
                <div className={styles.plusIcon}>
                  <span onClick={this.openMediaManager} data-aid="plus-icon">+</span>
                </div>
              )
            }
          })()}
          {this.state.focused ? (
            <div
              className={styles.menuPanel}
              onClick={this.openDropDown}
              data-aid="edit-options-button"
            >
              ...
            </div>
          ) : null}
          <DropDownMenu isOpen={this.state.areEditOptionsOpen}>
            <div data-aid="edit-options">
              <div onClick={this.openMediaManager} data-aid="open-media-manager">
                From "My Uploads"
              </div>
              <div onClick={this.editExternalURL} data-aid="open-editor">
                Enter an image URL
              </div>
            </div>
          </DropDownMenu>
        </div>
      </div>
    )
  }
}

ImageRenderer.propTypes = {
  value: React.PropTypes.any,
  subscribeOnCellsFocused: React.PropTypes.func.isRequired,
  unsubscribeOnCellsFocused: React.PropTypes.func.isRequired,
  parent: React.PropTypes.object.isRequired,
  startEditingWithCustomParams: React.PropTypes.func.isRequired,
  mediaManagerSupport: React.PropTypes.object.isRequired
}

module.exports = ImageRenderer
