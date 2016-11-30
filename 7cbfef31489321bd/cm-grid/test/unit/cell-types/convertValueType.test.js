'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')

const convertValueType = require('../../../src/cell-types/convertValueType')

describe('convertValueType', function() {
  describe('text', function() {
    it('given number, should stringify it', () => {
      expect(convertValueType('text', 42)).to.equal('42')
      expect(convertValueType('text', 3.14)).to.equal('3.14')
    })

    it('given boolean, should stringify it', () => {
      expect(convertValueType('text', true)).to.equal('true')
      expect(convertValueType('text', false)).to.equal('false')
    })

    it('given date, should stringify it', () => {
      expect(convertValueType('text', new Date())).to.equal(new Date().toString())
    })

    it('given object, should stringify it', () => {
      expect(convertValueType('text', {foo: 'bar'})).to.equal('[object Object]')
    })

    it('given array, should stringify it', () => {
      expect(convertValueType('text', [1, 2, {a:3}])).to.equal('1,2,[object Object]')
    })
  })

  describe('richtext', function() {
    it('given number, should stringify it', () => {
      expect(convertValueType('text', 42)).to.equal('42')
      expect(convertValueType('text', 3.14)).to.equal('3.14')
    })

    it('given boolean, should stringify it', () => {
      expect(convertValueType('text', true)).to.equal('true')
      expect(convertValueType('text', false)).to.equal('false')
    })

    it('given date, should stringify it', () => {
      expect(convertValueType('text', new Date())).to.equal(new Date().toString())
    })

    it('given object, should stringify it', () => {
      expect(convertValueType('text', {foo: 'bar'})).to.equal('[object Object]')
    })

    it('given array, should stringify it', () => {
      expect(convertValueType('text', [1, 2, {a:3}])).to.equal('1,2,[object Object]')
    })
  })

  describe('number', function() {
    it('given string, should parse it', () => {
      expect(convertValueType('number', '42')).to.equal(42)
      expect(convertValueType('number', '3.14')).to.equal(3.14)
    })

    it('given true, should return 1', () => {
      expect(convertValueType('number', true)).to.equal(1)
    })

    it('given false, should return 0', () => {
      expect(convertValueType('number', false)).to.equal(0)
    })

    it('given date, should return timestamp', () => {
      const date = new Date()
      expect(convertValueType('number', date)).to.equal(date.getTime())
    })

    it('given object, should return null', () => {
      expect(convertValueType('number', {})).to.be.NaN
    })

    it('given array, should return null', () => {
      expect(convertValueType('number', [1, 2, 3])).to.be.NaN
    })
  })

  describe('boolean', function() {
    it('given string, should return true', () => {
      expect(convertValueType('boolean', 'foo')).to.equal(true)
    })

    it('given 0, should return false', () => {
      expect(convertValueType('boolean', 0)).to.equal(false)
    })

    it('given 1, should return true', () => {
      expect(convertValueType('boolean', 1)).to.equal(true)
    })

    it('given date, should return true', () => {
      expect(convertValueType('boolean', new Date())).to.equal(true)
    })

    it('given object, should return true', () => {
      expect(convertValueType('boolean', {})).to.equal(true)
    })

    it('given array, should return true', () => {
      expect(convertValueType('boolean', [])).to.equal(true)
    })
  })

  describe('image', function() {
    it('given string, should return null', () => {
      expect(convertValueType('image', 'foo')).to.equal(null)
    })

    it('given number, should return null', () => {
      expect(convertValueType('image', 1)).to.equal(null)
    })

    it('given boolean, should return null', () => {
      expect(convertValueType('image', true)).to.equal(null)
    })

    it('given date, should return null', () => {
      expect(convertValueType('image', new Date())).to.equal(null)
    })

    it('given object, should return null', () => {
      expect(convertValueType('image', {})).to.equal(null)
    })

    it('given array, should return null', () => {
      expect(convertValueType('image', [])).to.equal(null)
    })
  })

})
