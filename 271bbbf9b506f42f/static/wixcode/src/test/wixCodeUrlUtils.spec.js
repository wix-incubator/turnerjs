'use strict';

describe('wixCodeUrlUtils', function() {
  var proxyquire = require('proxyquire').noCallThru();
  var urlUtils;

  var FAKE_SCARI = 'scari';

  function getwixCodeUrlUtils(viewMode, instance, locale) {
    viewMode = viewMode || 'site';
    instance = instance || 'signedInstance';
    locale = locale || 'en';

    var fakeWindow = {
      location: {
        search: '?viewMode=' + viewMode + '&instance=' + instance + '&locale=' + locale
      }
    };

    urlUtils = proxyquire('../main/urlUtils', {
      './window': fakeWindow
    });

    return proxyquire('../main/wixCodeUrlUtils', {
      './urlUtils': urlUtils
    });
  }

  describe('`getUserCodeUrlsDetails`', function() {
    var pageId = 'page';
    var pageType = 'Page';
    var popupId = 'popup';
    var popupType = 'Popup';

    var PAGE_WIDGET = {
      type: pageType,
      id: pageId,
      displayName: 'page-name',
      appConfig: {
        userScript: {
          scriptName: 'pageScript',
          displayName: 'page displayName',
          url: 'pageScriptUrl?some=parameter'
        },
        scari: 'scari-1'
      }
    };

    var POPUP_WIDGET = {
      type: popupType,
      id: popupId,
      displayName: 'popup-name',
      appConfig: {
        userScript: {
          scriptName: 'popupScript',
          displayName: 'popup displayName',
          url: 'popupScriptUrl?some=parameter'
        },
        scari: FAKE_SCARI
      }
    };

    var MASTER_PAGE_WIDGET = {
      type: 'masterPage',
      id: pageId,
      appConfig: {
        userScript: {
          scriptName: 'masterPageScript',
          displayName: 'masterPage displayName',
          url: 'masterPageScriptUrl?some=parameter'
        },
        scari: FAKE_SCARI
      }
    };

    var FAKE_BASE_URL = 'http://baseUrl';

    it('should return one url details for page context', function() {
      var wixCodeUrlUtils = getwixCodeUrlUtils();
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([PAGE_WIDGET], pageId, FAKE_BASE_URL);
      expect(urlDetails.length).toEqual(1);
    });

    it('should return two url details for page context if masterPage code exists', function() {
      var wixCodeUrlUtils = getwixCodeUrlUtils();
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([PAGE_WIDGET, MASTER_PAGE_WIDGET], pageId, FAKE_BASE_URL);
      expect(urlDetails.length).toEqual(2);
    });

    it('should return one url details for popup widget', function() {
      var wixCodeUrlUtils = getwixCodeUrlUtils();
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([POPUP_WIDGET], popupId, FAKE_BASE_URL);
      expect(urlDetails.length).toEqual(1);
    });

    it('should return one url details for popup context if masterPage code exists', function() {
      var wixCodeUrlUtils = getwixCodeUrlUtils();
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([POPUP_WIDGET, MASTER_PAGE_WIDGET], popupId, FAKE_BASE_URL);
      expect(urlDetails.length).toEqual(1);
    });

    it('urlDetails return masterPage urlDetails when widget is for type Page', function() {
      var viewMode = 'editor';
      var instance = 'instance-1';
      var locale = 'gb';
      var wixCodeUrlUtils = getwixCodeUrlUtils(viewMode, instance, locale);
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([PAGE_WIDGET, MASTER_PAGE_WIDGET], pageId, FAKE_BASE_URL);
      var masterPageUrlDetails = urlDetails[0];

      expect(masterPageUrlDetails.scriptName).toEqual(MASTER_PAGE_WIDGET.appConfig.userScript.scriptName);
      expect(masterPageUrlDetails.displayName).toEqual(MASTER_PAGE_WIDGET.appConfig.userScript.displayName);
      expect(masterPageUrlDetails.url).toEqual(
        MASTER_PAGE_WIDGET.appConfig.userScript.url +
        '&externals=wix-sdk,wix-location,wix-window,wix-site' +
        '&wix-sdk-global=wix' + 
        '&wix-location-global=wix-location' +
        '&wix-window-global=wix-window' +
        '&wix-site-global=wix-site'
      );
    });

    it("urlDetails return the page's urlDetails when widget is for type Page", function() {
      var viewMode = 'editor';
      var instance = 'instance-1';
      var locale = 'gb';
      var wixCodeUrlUtils = getwixCodeUrlUtils(viewMode, instance, locale);
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([PAGE_WIDGET, MASTER_PAGE_WIDGET], pageId, FAKE_BASE_URL);
      var pageUrlDetails = urlDetails[1];

      expect(pageUrlDetails.scriptName).toEqual(PAGE_WIDGET.appConfig.userScript.scriptName);
      expect(pageUrlDetails.displayName).toEqual(PAGE_WIDGET.appConfig.userScript.displayName);
      expect(pageUrlDetails.url).toEqual(
        PAGE_WIDGET.appConfig.userScript.url +
        '&externals=wix-sdk,wix-location,wix-window,wix-site' +
        '&wix-sdk-global=wix' + 
        '&wix-location-global=wix-location' +
        '&wix-window-global=wix-window' +
        '&wix-site-global=wix-site'
      );
    });

    it("urlDetails return the popup's urlDetails when widget is for type Popup", function() {
      var viewMode = 'editor';
      var instance = 'instance-1';
      var locale = 'gb';
      var wixCodeUrlUtils = getwixCodeUrlUtils(viewMode, instance, locale);
      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([POPUP_WIDGET, MASTER_PAGE_WIDGET], popupId, FAKE_BASE_URL);
      var pageUrlDetails = urlDetails[0];

      expect(pageUrlDetails.scriptName).toEqual(POPUP_WIDGET.appConfig.userScript.scriptName);
      expect(pageUrlDetails.displayName).toEqual(POPUP_WIDGET.appConfig.userScript.displayName);
      expect(pageUrlDetails.url).toEqual(
        POPUP_WIDGET.appConfig.userScript.url +
        '&externals=wix-sdk,wix-location,wix-window,wix-site' +
        '&wix-sdk-global=wix' + 
        '&wix-location-global=wix-location' +
        '&wix-window-global=wix-window' +
        '&wix-site-global=wix-site'
      );
    });

    it('should add the sdk query parameters when there are no query parameters on the initial url', function() {
      var viewMode = 'editor';
      var instance = 'instance-1';
      var locale = 'gb';
      var wixCodeUrlUtils = getwixCodeUrlUtils(viewMode, instance, locale);

      var pageWidget = {
        type: pageType,
        id: pageId,
        displayName: 'page-name',
        appConfig: {
          userScript: {
            scriptName: 'pageScript',
            displayName: 'page displayName',
            url: 'http://base.com/userScript'
          },
          scari: 'scari-1'
        }
      };

      var urlDetails = wixCodeUrlUtils.getUserCodeUrlsDetails([pageWidget, MASTER_PAGE_WIDGET], pageId, FAKE_BASE_URL);
      var pageUrlDetails = urlDetails[1];

      expect(pageUrlDetails.scriptName).toEqual(pageWidget.appConfig.userScript.scriptName);
      expect(pageUrlDetails.displayName).toEqual(pageWidget.appConfig.userScript.displayName);
      expect(pageUrlDetails.url).toEqual(
        pageWidget.appConfig.userScript.url +
        '?externals=wix-sdk,wix-location,wix-window,wix-site' +
        '&wix-sdk-global=wix' + 
        '&wix-location-global=wix-location' +
        '&wix-window-global=wix-window' +
        '&wix-site-global=wix-site'
      );
    });
  });

  describe('`getElementoryArguments`', function() {
    it('should return the correct elementory arguments', function() {
      var pageWidget = {
        type: 'Page',
        id: 'page-1',
        displayName: 'page-name',
        appConfig: {
          scari: 'scari-1'
        }
      };
      var baseUrl = 'http://baseUrl';
      var viewMode = 'site-1';
      var instance = 'instance-1';
      var locale = 'gb';

      var wixCodeUrlUtils = getwixCodeUrlUtils(viewMode, instance, locale);
      var args = wixCodeUrlUtils.getElementoryArguments([pageWidget], baseUrl);

      expect(args).toEqual({
        baseUrl: baseUrl,
        queryParameters: jasmine.any(String)
      });

      var queryParameters = urlUtils.getQueryParamsFromUrl('?' + args.queryParameters);

      expect(queryParameters).toEqual({
        viewMode: viewMode,
        instance: instance,
        scari: pageWidget.appConfig.scari
      });
    });
  });
});
