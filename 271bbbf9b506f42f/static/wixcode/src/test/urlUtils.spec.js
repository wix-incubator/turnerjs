'use strict';

describe('urlUtils', function() {
  var urlUtils;

  beforeEach(function() {
    var proxyquire = require('proxyquire').noCallThru();
    var fakeWindow = {
      location: {
        search: '?viewMode=site&instance=signedInstance'
      }
    };

    urlUtils = proxyquire('../main/urlUtils', {
      './window': fakeWindow
    });
  });

  describe('`joinUrl', function() {
    it('should return the given url if only one part was passed', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl);
      expect(result).toEqual(baseUrl);
    });

    it('should concat other arguments to the first with slash in between them', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl, 'innerPath');
      expect(result).toEqual(baseUrl + '/innerPath');
    });

    it('should not remove slashes for the base url', function() {
      var baseUrl = '//wix.com';
      var result = urlUtils.joinURL(baseUrl);
      expect(result).toEqual(baseUrl);
    });

    it('should concat other arguments to the first with slash in between them', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl, 'innerPath', 'deepPath');
      expect(result).toEqual(baseUrl + '/innerPath/deepPath');
    });

    it('should not add double slashes if url part starts with slash', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl, '/innerPath');
      expect(result).toEqual(baseUrl + '/innerPath');
    });

    it('should not add double slashes if there are more then one slash at the beginning of the string', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl, '//innerPath');
      expect(result).toEqual(baseUrl + '/innerPath');
    });

    it('should not add double slashes for each of the parts', function() {
      var baseUrl = 'http://wix.com';
      var result = urlUtils.joinURL(baseUrl, '/innerPath', '/deepPath');
      expect(result).toEqual(baseUrl + '/innerPath/deepPath');
    });
  });

  describe('`getQueryParameter`', function() {
    it("should return null if the query doesn't have the parameter", function() {
      var result = urlUtils.getQueryParameter('notExist');
      expect(result).toBeNull();
    });

    it('should return the query parameter', function() {
      var result = urlUtils.getQueryParameter('viewMode');
      expect(result).toEqual('site');
    });
  });

  describe('`getParametersAsString`', function() {
    it('should return an empty string', function() {
      var result = urlUtils.getParametersAsString({});
      expect(result).toEqual('');
    });

    it('should return one parameter', function() {
      var result = urlUtils.getParametersAsString({
        viewMode: 'site'
      });
      expect(result).toEqual('viewMode=site');
    });

    it('should return multiple parameters', function() {
      var result = urlUtils.getParametersAsString({
        viewMode: 'site',
        instance: 'signedInstance'
      });
      expect(result).toEqual('viewMode=site&instance=signedInstance');
    });
  });

  describe('`pickQueryParameters`', function() {
    it('should return an empty object', function() {
      var result = urlUtils.pickQueryParameters();
      expect(result).toEqual({});
    });

    it('should return one parameter', function() {
      var result = urlUtils.pickQueryParameters('viewMode');
      expect(result).toEqual({
        viewMode: 'site'
      });
    });

    it('should return multiple parameters', function() {
      var result = urlUtils.pickQueryParameters('viewMode', 'instance');
      expect(result).toEqual({
        viewMode: 'site',
        instance: 'signedInstance'
      });
    });
  });

  describe('`getQueryParamsFromUrl`', function() {
    it('should return empty object when there are no query params', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/');
      expect(actual).toEqual({});
    });

    it('should return a query params as an object', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123');
      expect(actual).toEqual({ test: '123' });
    });

    it('should return a query params as an object for multiple params', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123&shahar=zur');
      expect(actual).toEqual({ test: '123', shahar: 'zur' });
    });

    it('should support params with no value', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test');
      expect(actual).toEqual({ test: '' });
    });

    it('should support mix of params with and without value', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123&shahar&zur=true');
      expect(actual).toEqual({ test: '123', shahar: '', zur: 'true' });
    });

    it('should return array of values of two param keys with the same name', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123&test=234');
      expect(actual).toEqual({ test: ['123', '234'] });
    });

    it('should return array of values of multiple param keys with the same name', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123&test=234&test=345');
      expect(actual).toEqual({ test: ['123', '234', '345'] });
    });

    it('should ignore hash', function() {
      var actual = urlUtils.getQueryParamsFromUrl('http://www.wix.com/?test=123#!pageId=page-1');
      expect(actual).toEqual({ test: '123' });
    });

    it('should support relative urls', function() {
      var actual = urlUtils.getQueryParamsFromUrl('/home?test=123');
      expect(actual).toEqual({ test: '123' });
    });
  });
});
