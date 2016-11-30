'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')

const detectValueType = require('../../../src/cell-types/detectValueType')

describe('detectValueType', function() {
  it('given string value, should return text', () => {
    expect(detectValueType('value')).to.equal('text')
  })

  it('given string containing html, should return richtext', () => {
    expect(detectValueType('<b>value</b>')).to.equal('richtext')
    expect(detectValueType('foo <span style="font-weight: bold;">bar</span>')).to.equal('richtext')
  })

  it('given number value, should return number', () => {
    expect(detectValueType(42)).to.equal('number')
    expect(detectValueType(42.1)).to.equal('number')
  })

  it('given Date object, should return datetime', () => {
    expect(detectValueType(new Date())).to.equal('datetime')
  })

  it('given boolean, should return boolean', () => {
    expect(detectValueType(true)).to.equal('boolean')
    expect(detectValueType(false)).to.equal('boolean')
  })

  it('given external url, should return image', () => {
    expect(detectValueType('http://daily-goat.com/the-goat.jpg')).to.equal('image')
    expect(detectValueType('https://daily-goat.com/the-goat.jpg')).to.equal('image')
  })

  it('given wix media image uri, should return image', () => {
    expect(detectValueType('image://v1/51f137_5cb8cafe41bb4b21b92ded370928d909~mv2.png')).to.equal('image')
  })

  it('given object, should return json', () => {
    expect(detectValueType({})).to.equal('json')
  })

  it('given array, should return json', () => {
    expect(detectValueType([])).to.equal('json')
  })

  it('given null, should return text', () => {
    expect(detectValueType(null)).to.equal('text')
  })

  it('given undefined, should return text', () => {
    expect(detectValueType()).to.equal('text')
  })
})
