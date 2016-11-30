'use strict'

const React = require('react')

const Image = ({src}, {services}) =>
  <img src={`${services.staticsUrl}assets/${src}`} />

Image.contextTypes = {
  services: React.PropTypes.object.isRequired
}

module.exports = Image
