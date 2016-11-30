'use strict'

const booleanRenderer = require('./boolean/booleanRenderer')
const booleanEditor = require('./boolean/booleanEditor')

const numberRenderer = require('./number/numberRenderer')
const numberEditor = require('./number/numberEditor')

const richtextRenderer = require('./richtext/richtextRenderer')
const richtextEditor = require('./richtext/richtextEditor')

const datetimeRenderer = require('./datetime/datetimeRenderer')
const datetimeEditor = require('./datetime/datetimeEditor')

const textRenderer = require('./text/textRenderer')
const textEditor = require('./text/textEditor')

const imageRenderer = require('./image/imageRenderer')
const imageEditor = require('./image/imageEditor')

module.exports = {
  cellEditors: {
    boolean: booleanEditor,
    number: numberEditor,
    richtext: richtextEditor,
    datetime: datetimeEditor,
    text: textEditor,
    image: imageEditor
  },
  cellRenderers: {
    boolean: booleanRenderer,
    number: numberRenderer,
    richtext: richtextRenderer,
    datetime: datetimeRenderer,
    text: textRenderer,
    image: imageRenderer
  }
}
