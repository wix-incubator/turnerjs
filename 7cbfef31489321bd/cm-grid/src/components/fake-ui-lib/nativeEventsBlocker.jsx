'use strict'

const React = require('react')

class NativeEventsBlocker extends React.Component {
  
  block(event) {
    event.stopPropagation()
  }
  
  componentDidMount() {
    this.props.events.forEach(eventType => this.node.addEventListener(eventType, this.block))
  }
  
  componentWillUnmount() {
    this.props.events.forEach(eventType => this.node.removeEventListener(eventType, this.block))
  }
  
  render() {
    return (
      <span ref={ref => this.node = ref}>
        {this.props.children}
      </span>
    )
  }
}

module.exports = NativeEventsBlocker
