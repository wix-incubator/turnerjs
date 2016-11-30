'use strict'

const {describe, it} = require('mocha')
const expect = require('chai').expect

const sanitize = require('../../../src/components/add-field-form/sanitize')

describe('field key sanitizer', function() {

  it('should convert to lower case', function() {
    expect(sanitize('Sanitize_this')).to.equal('sanitize_this')
  })

  it('should replace spaces with dashes', function() {
    expect(sanitize(' sanitize this ')).to.equal('_sanitize_this_')
  })

  it('should compress multiple subsequent dashes with a single dash', function() {
    expect(sanitize('sanitize    this')).to.equal('sanitize_this')
  })

  it('should strip non-alpha-numeric chars', function() {
    expect(sanitize('$,h3ll0.#!Š(ą)')).to.equal('h3ll0')
  })

  it('should strip leading digits', function() {
    expect(sanitize('1hello')).to.equal('hello')
  })

  it('should handle any crap the user throws at it', function() {
    expect(sanitize('666wHaT  KIND  0f P!e@R#S$O(N) _would_UšseĄ tH15 AS_ ti#tle')).to.equal('what_kind_0f_person_would_use_th15_as_title')
  })
})
