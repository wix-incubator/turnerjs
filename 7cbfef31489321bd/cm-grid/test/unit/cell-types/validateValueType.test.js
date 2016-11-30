'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')

const validateValueType = require('../../../src/cell-types/validateValueType')

describe('validateValueType', function() {
  describe('any type', function() {
    it('given undefined, should return true', () => {
      expect(validateValueType('text')).to.equal(true)
      expect(validateValueType('number')).to.equal(true)
      expect(validateValueType('datetime')).to.equal(true)
      expect(validateValueType('boolean')).to.equal(true)
      expect(validateValueType('image')).to.equal(true)
    })

    it('given null, should return true', () => {
      expect(validateValueType('text', null)).to.equal(true)
      expect(validateValueType('number', null)).to.equal(true)
      expect(validateValueType('datetime', null)).to.equal(true)
      expect(validateValueType('boolean', null)).to.equal(true)
      expect(validateValueType('image', null)).to.equal(true)
    })
  })

  describe('text', function() {
    it('given string value, should return true', () => {
      expect(validateValueType('text', 'value')).to.equal(true)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('text', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('text', {})).to.equal(false)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('text', true)).to.equal(false)
      expect(validateValueType('text', false)).to.equal(false)
    })
  })
  
  describe('number', function() {
    it('given string value, should return false', () => {
      expect(validateValueType('number', 'value')).to.equal(false)
    })

    it('given number value, should return true', () => {
      expect(validateValueType('number', 42)).to.equal(true)
    })

    it('given object, should return false', () => {
      expect(validateValueType('number', {})).to.equal(false)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('number', true)).to.equal(false)
      expect(validateValueType('number', false)).to.equal(false)
    })
  })

  describe('boolean', function() {
    it('given string value, should return false', () => {
      expect(validateValueType('boolean', 'value')).to.equal(false)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('boolean', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('boolean', {})).to.equal(false)
    })

    it('given boolean, should return true', () => {
      expect(validateValueType('boolean', true)).to.equal(true)
      expect(validateValueType('boolean', false)).to.equal(true)
    })
  })

  describe('image', function() {
    it('given string value, should return false', () => {
      expect(validateValueType('image', 'value')).to.equal(false)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('image', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('image', {})).to.equal(false)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('image', true)).to.equal(false)
      expect(validateValueType('image', false)).to.equal(false)
    })

    it('given an external url, should return true', () => {
      expect(validateValueType('image', 'http://daily-goat.com/the-goat.jpg')).to.equal(true)
      expect(validateValueType('image', 'https://daily-goat.com/the-goat.jpg')).to.equal(true)
    })

    it('given wix media image uri, should return true', () => {
      expect(validateValueType('image', 'image://v1/51f137_5cb8cafe41bb4b21b92ded370928d909~mv2.png')).to.equal(true)
    })
  })

  describe('richtext', function() {
    it('given string value, should return true', () => {
      expect(validateValueType('richtext', 'value')).to.equal(true)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('richtext', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('richtext', {})).to.equal(false)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('richtext', true)).to.equal(false)
      expect(validateValueType('richtext', false)).to.equal(false)
    })
  })

  describe('datetime', function() {
    it('given string value, should return false', () => {
      expect(validateValueType('datetime', 'value')).to.equal(false)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('datetime', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('datetime', {})).to.equal(false)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('datetime', true)).to.equal(false)
      expect(validateValueType('datetime', false)).to.equal(false)
    })

    it('given date object, should return true', () => {
      expect(validateValueType('datetime', new Date())).to.equal(true)
    })
  })

  describe('json', function() {
    it('given string value, should return false', () => {
      expect(validateValueType('json', 'value')).to.equal(false)
    })

    it('given number value, should return false', () => {
      expect(validateValueType('json', 42)).to.equal(false)
    })

    it('given object, should return false', () => {
      expect(validateValueType('json', {})).to.equal(true)
    })

    it('given array, should return true', () => {
      expect(validateValueType('json', [])).to.equal(true)
    })

    it('given boolean, should return false', () => {
      expect(validateValueType('json', true)).to.equal(false)
      expect(validateValueType('json', false)).to.equal(false)
    })

    it('given date object, should return false', () => {
      expect(validateValueType('json', new Date())).to.equal(false)
    })
  })

})
