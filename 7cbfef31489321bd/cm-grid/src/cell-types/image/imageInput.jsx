'use strict'

const React = require('react')

const {KEYS} = require('../../constants')

class ImageInput extends React.Component {
  onKeyDown(e) {
    const key = e.keyCode

    switch (key) {
      case KEYS.ENTER:
        this.props.submit(this.props.value)
        break
      case KEYS.ESCAPE:
        this.props.cancel()
        break
    }
  }

  onKeyDownListener(e) {
    const key = e.keyCode

    if (key === KEYS.LEFT ||
      key === KEYS.UP ||
      key === KEYS.RIGHT ||
      key === KEYS.DOWN) {
      e.stopPropagation()
    }
  }

  componentDidMount() {
    this._input.focus()
    this._input.select()
    this._input.addEventListener('keydown', this.onKeyDownListener)
  }

  componentWillUnmount() {
    this._input.addEventListener('keydown', this.onKeyDownListener)
  }

  render() {
    return (
      <input
        type="text"
        data-aid="image-editor-input"
        value={this.props.value}
        onChange={this.props.onChange}
        onKeyDown={this.onKeyDown.bind(this)}
        ref={ref => this._input = ref}
      />
    )
  }
}

module.exports = ImageInput
