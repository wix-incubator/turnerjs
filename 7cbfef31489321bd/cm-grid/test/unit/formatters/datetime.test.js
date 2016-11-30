const {describe, it} = require('mocha')
const expect = require('chai').expect

const {toTimeString, toDateString, toDateObject} = require('../../../src/formatters/datetime')

describe('datetime formatter', function() {
  describe('toTimeString', function() {
    it('should return 12:23 from Date object with datetime of `12/12/2016 12:23`', function () {
      expect(toTimeString(new Date('12/12/2016 12:23'))).to.equal('12:23')
    })

    it('should return empty string for invalid date object', function () {
      expect(toTimeString('')).to.equal('')
    })

    it('should return 00:00 from Date object with datetime of `12/12/1000 00:00`', function () {
      expect(toTimeString(new Date('12/12/1000 00:00'))).to.equal('00:00')
    })
  })

  describe('toDateString', function() {
    it('should return 12/12/2016 for Date object with datetime of `12/12/2016 12:23`', function () {
      expect(toDateString(new Date('12/12/2016 12:23'))).to.equal('12/12/2016')
    })

    it('should return empty string for invalid date object', function() {
      expect(toDateString('')).to.equal('')
    })

    it('should return 12/12/1000 from Date object with datetime of `12/12/1000 00:00`', function () {
      expect(toDateString(new Date('12/12/1000 00:00'))).to.equal('12/12/1000')
    })

    it('should return 01/01/2000 from Date object with datetime of `01/01/2000 00:00`', function () {
      expect(toDateString(new Date('01/01/2000 00:00'))).to.equal('01/01/2000')
    })
  })

  describe('toDateObject', function() {
    it('should return Date object with datetime of `12/12/2016 12:23` for date `12/12/2016` and time `12:23`', function () {
      const expectedDate = new Date('12/12/2016 12:23')
      const result = toDateObject('12/12/2016', '12:23')

      expect(result.getTime()).to.equal(expectedDate.getTime())
    })

    it('should return invalid date when the date is not defined', function () {
      const result = toDateObject('', '12:23')

      expect(result.getTime()).to.be.NaN
    })

    it('should default time to `00:00` if not defined', function() {
      const expectedDate = new Date('12/12/2016 00:00')
      const result = toDateObject('12/12/2016', '')

      expect(result.getTime()).to.equal(expectedDate.getTime())
    })

    it('should default time to `00:00` if is null', function() {
      const expectedDate = new Date('12/12/2016 00:00')
      const result = toDateObject('12/12/2016', null)

      expect(result.getTime()).to.equal(expectedDate.getTime())
    })

    it('should default time to `00:00` if it is not a string', function() {
      const expectedDate = new Date('12/12/2016 00:00')
      const result = toDateObject('12/12/2016', false)

      expect(result.getTime()).to.equal(expectedDate.getTime())
    })
  })
})
