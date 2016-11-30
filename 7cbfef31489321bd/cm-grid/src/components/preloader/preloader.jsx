'use strict'

const React = require('react')
const {connect} = require('react-redux')

const styles = require('./preloader.scss')
const selectors = require('../../reducer')

const mapStateToProps = state => ({
  display: selectors.getIsOverlayDisplayed(state),
  message: selectors.getOverlayMessage(state)
})

const Preloader = ({display, message}) =>
  display ? (
    <div data-aid="preloader">
      <div className={styles.overlayContainer} />
      <div className={styles.preloaderContainer}>
        <div className={styles.preloaderMessageContainer}>
          <div className={styles.preloaderMessage}>
            {message}
          </div>
        </div>
      </div>
    </div>
  ) : null

module.exports = connect(mapStateToProps)(Preloader)
