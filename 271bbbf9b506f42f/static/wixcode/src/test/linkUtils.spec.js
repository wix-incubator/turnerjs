'use strict';

describe('linkUtils', function() {
  var testUtils, linkUtils;
  beforeEach(function() {
    testUtils = require('../../testUtils/testUtils');
    linkUtils = require('../main/platformUtilities/linkUtils');
  });

  describe('convertLinkObjectToUrl', function() {

    it('should convert PageLink', function() {
      var pageId = 'newPageId';
      var pageLink = testUtils.dataMocks.pageLink(pageId);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, pageLink);

      expect(result).toEqual('/' + pageId);
    });

    it('should convert PageLink from linkObject', function() {
      var pageId = '#newPageId';
      var pageLink = testUtils.dataMocks.pageLink(pageId);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, pageLink);

      expect(result).toEqual('/newPageId');
    });

    describe('AnchorLink', function() {
      it('should convert another page bottom link', function() {
        var pageId = 'newPageId';
        var anchorLink = testUtils.dataMocks.anchorLink('SCROLL_TO_BOTTOM', pageId);
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/' + pageId + '#bottom');
      });

      it('should convert same page bottom link', function() {
        var anchorLink = testUtils.dataMocks.anchorLink('SCROLL_TO_BOTTOM');
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/masterPage#bottom');
      });

      it('should convert another page top link', function() {
        var pageId = 'newPageId';
        var anchorLink = testUtils.dataMocks.anchorLink('SCROLL_TO_TOP', pageId);
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/' + pageId + '#top');
      });

      it('should convert same page top link', function() {
        var anchorLink = testUtils.dataMocks.anchorLink('SCROLL_TO_TOP');
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/masterPage#top');
      });

      it('should convert same page AnchorLink', function() {
        var anchorDataId = 'someAnchorName';
        var pageId = 'somePageId';
        var anchorLink = testUtils.dataMocks.anchorLink(anchorDataId, pageId);
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/' + pageId + '#' + anchorDataId);
      });

      it('should convert another page AnchorLink', function() {
        var pageId = 'newPageId';
        var anchorDataId = 'someAnchorName';
        var anchorLink = testUtils.dataMocks.anchorLink(anchorDataId, pageId);
        var routersConfigMap = testUtils.routersMocks.routersConfigMap();

        var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, anchorLink);

        expect(result).toEqual('/' + pageId + '#' + anchorDataId);
      });
    });

    it('should convert DocumentLink', function() {
      var docId = 'someDocID';
      var documentLink = testUtils.dataMocks.documentLink(docId);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, documentLink);

      expect(result).toEqual('document://' + docId);
    });

    it('should convert PhoneLink', function() {
      var phoneNumber = '5937459834';
      var phoneLink = testUtils.dataMocks.phoneLink(phoneNumber);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, phoneLink);

      expect(result).toEqual('tel:' + phoneNumber);
    });

    it('should convert EmailLink', function() {
      var email = 'hi@wix.com';
      var subject = 'my annoying cat';
      var emailLink = testUtils.dataMocks.emailLink(email, subject);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, emailLink);

      expect(result).toEqual('mailto:' + email + '?subject=' + subject);
    });

    it('should convert ExternalLink with http protocol', function() {
      var url = 'http://www.wix.com';
      var externalUrlLink = testUtils.dataMocks.externalLink(url);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, externalUrlLink);

      expect(result).toEqual(url);
    });

    it('should convert ExternalLink with https protocol', function() {
      var url = 'https://www.wix.com';
      var externalUrlLink = testUtils.dataMocks.externalLink(url);
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, externalUrlLink);

      expect(result).toEqual(url);
    });

    it('should convert DynamicPageLink', function() {
      var collectionName = 'artisits';
      var itemName = 'beck';
      var routerId = 'someId';
      var routerConfig = testUtils.routersMocks.routerConfigItem(collectionName, 'dataBinding');
      var routersConfigMap = testUtils.routersMocks.routersConfigMap([{ id: routerId, config: routerConfig }]);
      var dynamicPageUrlLink = testUtils.dataMocks.dynamicPageLink(itemName, routerId);

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, dynamicPageUrlLink);

      expect(result).toEqual('/' + collectionName + '/' + itemName);
    });

    it('should convert DynamicPageLink with anchor', function() {
      var collectionName = 'artisits';
      var itemName = 'beck';
      var routerId = 'someId';
      var anchorDataId = 'someAnchorName';
      var routerConfig = testUtils.routersMocks.routerConfigItem(collectionName, 'dataBinding');
      var routersConfigMap = testUtils.routersMocks.routersConfigMap([{ id: routerId, config: routerConfig }]);
      var dynamicPageUrlLink = testUtils.dataMocks.dynamicPageLink(itemName, routerId, anchorDataId);

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, dynamicPageUrlLink);

      expect(result).toEqual('/' + collectionName + '/' + itemName + '#' + anchorDataId);
    });

    it('should convert DynamicPageLink with top anchor', function() {
      var collectionName = 'artisits';
      var itemName = 'beck';
      var routerId = 'someId';
      var routerConfig = testUtils.routersMocks.routerConfigItem(collectionName, 'dataBinding');
      var routersConfigMap = testUtils.routersMocks.routersConfigMap([{ id: routerId, config: routerConfig }]);
      var dynamicPageUrlLink = testUtils.dataMocks.dynamicPageLink(itemName, routerId, 'SCROLL_TO_TOP');

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, dynamicPageUrlLink);

      expect(result).toEqual('/' + collectionName + '/' + itemName + '#top');
    });

    it('should convert DynamicPageLink with bottom anchor', function() {
      var collectionName = 'artisits';
      var itemName = 'beck';
      var routerId = 'someId';
      var routerConfig = testUtils.routersMocks.routerConfigItem(collectionName, 'dataBinding');
      var routersConfigMap = testUtils.routersMocks.routersConfigMap([{ id: routerId, config: routerConfig }]);
      var dynamicPageUrlLink = testUtils.dataMocks.dynamicPageLink(itemName, routerId, 'SCROLL_TO_BOTTOM');

      var result = linkUtils.convertLinkObjectToUrl(routersConfigMap, dynamicPageUrlLink);

      expect(result).toEqual('/' + collectionName + '/' + itemName + '#bottom');
    });

    it('should throw an error in case link type is invalid', function() {
      var invalidLinkType = { type: 'invalidLinkType', pageId: 'currentUrl', anchorDataId: 'someAnchorId' };
      var expectedErrorMsg = 'Provided link type is not supported';
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var functionToExecute = linkUtils.convertLinkObjectToUrl.bind(linkUtils, routersConfigMap, invalidLinkType);

      expect(functionToExecute).toThrow(new Error(expectedErrorMsg));
    });

    it('should throw an error in case the passed link object is null', function() {
      var expectedErrorMsg = 'Provided link type is not supported';
      var routersConfigMap = testUtils.routersMocks.routersConfigMap();

      var functionToExecute = linkUtils.convertLinkObjectToUrl.bind(linkUtils, routersConfigMap, null);

      expect(functionToExecute).toThrow(new Error(expectedErrorMsg));
    });
  });
});
