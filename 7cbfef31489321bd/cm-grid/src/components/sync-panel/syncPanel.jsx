'use strict'

const React = require('react')
const {connect} = require('react-redux')

const actions = require('./actions')
const style = require('./syncPanel.scss')

const mapDispatchToProps = actions
const mapStateToProps = state => ({})

const SyncPanel = ({copyAllItemsToLive, onClose}) => (
  <div data-aid="sync-panel" className={style.syncPanel}>
    <div
      data-aid="copy-all-to-live-button"
      onClick={() => {
        copyAllItemsToLive()
        onClose()
      }}
    >
      Copy all items to live
    </div>
  </div>
)

SyncPanel.propTypes = {
  onClose: React.PropTypes.func.isRequired
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(SyncPanel)
