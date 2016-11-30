'use strict'

const {describe, it} = require('mocha')
const expect = require('chai').expect

const numberFormater = require('../../../src/formatters/number')

describe('number renderer', function() {
  it('should return empty string when empty string is given', function () {
    expect(numberFormater('')).to.equal('')
  })

  it('should return empty string when null is given', function () {
    expect(numberFormater(null)).to.equal('')
  })

  it('should return empty string when undefined is given', function () {
    expect(numberFormater(undefined)).to.equal('')
  })
  
  it('should return 0 when 0 is given', function () {
    expect(numberFormater(0)).to.equal('0')
  })

  it('should return 0 when \'0\' is given', function () {
    expect(numberFormater('0')).to.equal('0')
  })
  
  it('should return NaN when given not a number', function() {
    expect(numberFormater('abc')).to.be.NaN
  })

  it('should return a string if int is given', function() {
    expect(numberFormater(100)).to.equal('100')
  })

  it('should return a string when float is given', function() {
    expect(numberFormater(100.11)).to.equal('100.11')
  })

  it('should return 1,000 when 1000 is given', function() {
    expect(numberFormater(1000)).to.equal('1,000')
  })

  it('should return 1,000,000 when 1000000 is given', function() {
    expect(numberFormater(1000000)).to.equal('1,000,000')
  })

  it('should return 100,000 when 100000 is given', function() {
    expect(numberFormater(100000)).to.equal('100,000')
  })

  it('should return 1,000.11 when 1000.11 is given', function() {
    expect(numberFormater(1000.11)).to.equal('1,000.11')
  })

  it('should return 1,000,000.11 when 1000000.11 is given', function () {
    expect(numberFormater(1000000.11)).to.equal('1,000,000.11')
  })
  
  it('should return 1,000 when 1000 string is given', function () {
    expect(numberFormater('1000')).to.equal('1,000')
  })

  it('should return 10vabsd for 10vabsd', function () {
    expect(numberFormater('10vabsd')).to.equal('10vabsd')
  })
})
