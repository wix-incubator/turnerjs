'use strict'

const {describe, it} = require('mocha')
const expect = require('chai').expect

const richtextFormatter = require('../../../src/formatters/richtext')

describe('richtext renderer', function() {
  it('should return \'aaaa\' for \'aaaa\'', function () {
    expect(richtextFormatter('aaaa')).to.equal('aaaa')
  })

  it('should return \'aaaa\' for \'<div><span>aa<br/>aa</span>\'', function() {
    expect(richtextFormatter('<div><span>aa<br/>aa</span>')).to.equal('aaaa')
  })
})
