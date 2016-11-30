'use strict';

describe('widgetsContextManager', function() {
  var proxyquire = require('proxyquire').noCallThru();
  var _ = require('lodash');
  var testUtils = require('../../testUtils/testUtils');

  var WidgetsContextManager;

  var WIX_CODE_INTENT = 'WIX_CODE';
  var WIX_CODE_RESPONSE_INTENT = 'WIX_CODE_RESPONSE';
  var IFRAME_LOADED_MESSAGE_TYPE = 'wix_code_iframe_loaded';
  var WORKER_START_MESSAGE_TYPE = 'wix_code_worker_start';
  var WORKER_LOAD_MESSAGE_TYPE = 'wix_code_worker_load';
  var WORKER_INIT_MESSAGE_TYPE = 'wix_code_worker_init';
  var WORKER_BOOTSTRAP_MESSAGE_TYPE = 'wix_code_worker_bootstrap';

  var FakeWorker, fakeMessageProxyInstance, options, fakeWindow, fakeDocument;

  var FAKE_BASE_URL = 'http://appId.wix-code.com';
  var FAKE_COMP_ID = '1234';
  var FAKE_VIEW_MODE = 'site';
  var FAKE_SIGNED_INSTANCE = 'signedInstance';
  var FAKE_LOCALE = 'en';
  var FAKE_REFERRER = 'referrer';
  var FAKE_SCARI = 'fake-scari-fake-scari';
  var FAKE_STORAGE = '{"local":{},"session":{}}';
  var FAKE_SDK_PARAMS = {
    viewMode: FAKE_VIEW_MODE,
    instance: FAKE_SIGNED_INSTANCE,
    locale: FAKE_LOCALE,
    referrer: FAKE_REFERRER,
    storage: FAKE_STORAGE
  };
  var FAKE_APPLICATIONS = JSON.stringify([testUtils.appDefMocks.dataBinding(), testUtils.appDefMocks.ecommerce()]);

  function getFakeSdkParameters(storage) {
    return storage ? Object.assign({}, FAKE_SDK_PARAMS, { storage: storage }) : FAKE_SDK_PARAMS;
  }

  function createLoadWidgetData(type, id, url) {
    var data = {
      type: type,
      id: id
    };

    if (type === 'Page' || type === 'Popup' || id === 'dataBinding') {
      data.appConfig = {
        scari: FAKE_SCARI
      };
      if (type !== 'Application') {
        data.appConfig.userScript = {
          scriptName: data.id + '.js',
          displayName: data.id + ' displayName',
          url: 'userScriptUrl'
        };
      }
    }

    if (url) {
      data.url = url;
    }

    return data;
  }

  function getWorkerStartMessageData(contexts, siteInfo) {
    return {
      data: {
        intent: WIX_CODE_INTENT,
        type: WORKER_START_MESSAGE_TYPE,
        contexts: contexts || {},
        siteInfo: siteInfo || {}
      }
    };
  }

  function getWorkerLoadMessageData(widgets, rootIds) {
    return {
      data: {
        rootIds: rootIds,
        intent: WIX_CODE_INTENT,
        type: WORKER_LOAD_MESSAGE_TYPE,
        widgets: widgets,
        routersMap: {}
      }
    };
  }

  function createWorkerInstanceSpy(name) {
    return jasmine.createSpyObj(name || 'web worker instance', ['postMessage', 'terminate']);
  }

  function createFakeWorkerClass() {
    var instances = [];

    function FakeWorkerClass() {
      var worker = createWorkerInstanceSpy();
      instances.push(worker);
      return worker;
    }

    FakeWorkerClass.getInstances = function getInstances() {
      return instances;
    };

    return FakeWorkerClass;
  }

  beforeEach(function() {
    FakeWorker = createFakeWorkerClass();
    fakeMessageProxyInstance = jasmine.createSpyObj('fake message proxy', ['initialize', 'sendMessageToViewer', 'getMessageHandler']);
    var FakeMessageProxy = jasmine.createSpy('fake messageProxy').and.callFake(function(ctorOptions) {
      options = ctorOptions;
      return fakeMessageProxyInstance;
    });

    fakeWindow = {
      location: {
        hostname: 'appId.wix-code.com',
        protocol: 'http:'
      },
      localStorage: {
        setItem: function() { },
        getItem: function() { },
        removeItem: function() { },
        clear: function() { }
      },
      sessionStorage: {
        setItem: function() { },
        getItem: function() { },
        removeItem: function() { },
        clear: function() { }
      },
      __WIX_CODE_DEBUG__: false,
      '@global': true
    };
    fakeDocument = {
      referrer: FAKE_REFERRER
    };

    var urlUtils = proxyquire('../main/urlUtils', {
      './window': fakeWindow
    });

    this.wixCodeUrlUtils = proxyquire('../main/wixCodeUrlUtils', {
      './urlUtils': urlUtils
    });

    var queryString = urlUtils.getParametersAsString({
      compId: FAKE_COMP_ID,
      viewMode: 'site',
      instance: FAKE_SIGNED_INSTANCE,
      locale: FAKE_LOCALE,
      applications: encodeURI(FAKE_APPLICATIONS)
    });

    fakeWindow.location.search = '?' + queryString;

    WidgetsContextManager = proxyquire('../main/widgetsContextManager', {
      './worker': FakeWorker,
      './messageProxy': FakeMessageProxy,
      './wixCodeUrlUtils': this.wixCodeUrlUtils,
      './window': fakeWindow,
      './document': fakeDocument
    });
  });

  function loadWorkers(message) {
    var manager = new WidgetsContextManager();

    manager.initialize();
    options.onLoadMessageCallback(message);

    // should be only two workers, the standby worker and the page worker
    return FakeWorker.getInstances().slice(0, -1);
  }

  describe('initialization', function() {
    function createBootstrapMessage(applications, storage) {
      return {
        type: WORKER_BOOTSTRAP_MESSAGE_TYPE,
        bootstrapArguments: {
          sdkParameters: getFakeSdkParameters(storage),
          debug: fakeWindow.__WIX_CODE_DEBUG__,
          sdkSource: null,
          applications: applications
        }
      };
    }

    it('should initialize a message proxy and notify the iframe is loaded', function() {
      var expectedMessage = {
        intent: WIX_CODE_INTENT,
        type: IFRAME_LOADED_MESSAGE_TYPE,
        compId: FAKE_COMP_ID
      };

      var manager = new WidgetsContextManager();

      manager.initialize();

      expect(fakeMessageProxyInstance.initialize).toHaveBeenCalled();

      expect(fakeMessageProxyInstance.sendMessageToViewer).toHaveBeenCalledWith(expectedMessage);
    });

    it('should throw if called the second time', function() {
      var manager = new WidgetsContextManager();

      manager.initialize();

      function initializeAgain() {
        manager.initialize();
      }

      expect(initializeAgain).toThrow();
    });

    it('should create a new web worker and send it the bootstrap message', function() {
      var manager = new WidgetsContextManager();
      var expectedBootstrapMessage = createBootstrapMessage(FAKE_APPLICATIONS);

      manager.initialize();

      var workers = FakeWorker.getInstances();
      expect(workers.length).toEqual(1);

      var worker = workers[0];
      expect(worker.postMessage).toHaveBeenCalledWith(expectedBootstrapMessage);
    });

    it('should not send storage.local in case browser storage is disabled', function() {
      Object.defineProperties(fakeWindow, {
        localStorage: {
          get: function() {
            throw new Error('STORAGE_DISABLED_EXCEPTION');
          }
        },
        sessionStorage: {
          get: function() {
            throw new Error('STORAGE_DISABLED_EXCEPTION');
          }
        }
      });
      var manager = new WidgetsContextManager();
      var expectedBootstrapMessage = createBootstrapMessage(FAKE_APPLICATIONS, JSON.stringify({ session: {} }));

      manager.initialize();

      var workers = FakeWorker.getInstances();
      expect(workers.length).toEqual(1);

      var worker = workers[0];
      expect(worker.postMessage).toHaveBeenCalledWith(expectedBootstrapMessage);
    });
  });

  describe('onLoadMessage callback', function() {
    it('should ignore non wix code messages', function() {
      var fakeMessage = {
        data: {
          intent: 'other_intent'
        }
      };
      var workers = loadWorkers(fakeMessage);
      expect(workers.length).toEqual(0);
    });

    it('should throw exception if rootIds property is missing', function() {
      var pageWidget = createLoadWidgetData('Page', 'pageId');
      var message = getWorkerLoadMessageData([pageWidget], ['pageId']);

      var manager = new WidgetsContextManager();
      manager.initialize();

      delete message.data.rootIds;
      var loadMessageCallback = options.onLoadMessageCallback.bind(options.onLoadMessageCallback, message);
      expect(loadMessageCallback).toThrow(new Error('Load message must contain rootIds property'));
    });

    it('should create a new worker for Page context', function() {
      var pageWidget = createLoadWidgetData('Page', 'pageId');
      var message = getWorkerLoadMessageData([pageWidget], ['pageId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(1);
    });

    it('should create a new worker for Popup context', function() {
      var message = getWorkerLoadMessageData([createLoadWidgetData('Popup', 'popupId')], ['popupId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(1);
    });

    it('should create two new workers for Page and Popup contexts', function() {
      var message = getWorkerLoadMessageData([createLoadWidgetData('Popup', 'popupId'), createLoadWidgetData('Page', 'pageId')], ['pageId', 'popupId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(2);
    });

    it('should create workers according to number of rootIds and not according to number of widgets', function() {
      var message = getWorkerLoadMessageData([createLoadWidgetData('Popup', 'popupId'), createLoadWidgetData('Page', 'pageId')], ['pageId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(1);
    });

    it('should send Page widget as wixCode application to the worker to load', function() {
      var pageWidget = createLoadWidgetData('Page', 'pageId');
      var message = getWorkerLoadMessageData([pageWidget], ['pageId']);
      var workers = loadWorkers(message);
      var postMessageArgs = workers[0].postMessage.calls.mostRecent().args;

      expect(postMessageArgs.length).toEqual(1);
      expect(postMessageArgs[0].wixCode).toEqual(this.wixCodeUrlUtils.getUserCodeUrlsDetails([pageWidget], 'pageId', FAKE_BASE_URL));
    });

    it('should send Popup widget as wixCode application to the worker to load', function() {
      var pageWidget = createLoadWidgetData('Popup', 'popupId');
      var message = getWorkerLoadMessageData([pageWidget], ['popupId']);
      var workers = loadWorkers(message);
      var postMessageArgs = workers[0].postMessage.calls.mostRecent().args;

      expect(postMessageArgs.length).toEqual(1);
      expect(postMessageArgs[0].wixCode).toEqual(this.wixCodeUrlUtils.getUserCodeUrlsDetails([pageWidget], 'popupId', FAKE_BASE_URL));
    });

    it('should send the relevant widget as wixCode application to the relevant worker', function() {
      var pageWidget = createLoadWidgetData('Page', 'pageId');
      var popupWidget = createLoadWidgetData('Popup', 'popupId');
      var message = getWorkerLoadMessageData([pageWidget, popupWidget], ['pageId', 'popupId']);
      var workers = loadWorkers(message);
      var pagePostMessageArgs = workers[0].postMessage.calls.mostRecent().args;
      var popupPostMessageArgs = workers[1].postMessage.calls.mostRecent().args;

      expect(pagePostMessageArgs[0].wixCode).toEqual(this.wixCodeUrlUtils.getUserCodeUrlsDetails([pageWidget], 'pageId', FAKE_BASE_URL));
      expect(popupPostMessageArgs[0].wixCode).toEqual(this.wixCodeUrlUtils.getUserCodeUrlsDetails([popupWidget], 'popupId', FAKE_BASE_URL));
    });

    it('should send applications to the worker to load', function() {
      var applicationWidget = createLoadWidgetData('application', 'app-1', 'http://application.wix.com');
      var message = getWorkerLoadMessageData([createLoadWidgetData('Popup', 'popupId'), applicationWidget], ['popupId']);
      var workers = loadWorkers(message);
      var postMessageArgs = workers[0].postMessage.calls.mostRecent().args;

      expect(postMessageArgs[0].applications).toEqual([applicationWidget]);
    });

    it('should add the applications to all workers', function() {
      var applicationWidget = createLoadWidgetData('application', 'app-1', 'http://application.wix.com');
      var message = getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId'), createLoadWidgetData('Popup', 'popupId'), applicationWidget], ['pageId', 'popupId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(2);
      workers.forEach(function(worker) {
        var postMessageArgs = worker.postMessage.calls.mostRecent().args;
        expect(postMessageArgs[0].applications).toEqual([applicationWidget]);
      });
    });

    it('should send routersMap to all workers', function() {
      var applicationWidget = createLoadWidgetData('application', 'app-1', 'http://application.wix.com');
      var message = getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId'), createLoadWidgetData('Popup', 'popupId'), applicationWidget], ['pageId', 'popupId']);
      var workers = loadWorkers(message);
      expect(workers.length).toEqual(2);
      workers.forEach(function(worker) {
        var postMessageArgs = worker.postMessage.calls.mostRecent().args;
        expect(postMessageArgs[0].routersMap).toEqual(message.data.routersMap);
      });
    });

    it('should send elementoryArguments to all workers', function() {
      var applicationWidget = createLoadWidgetData('application', 'app-1', 'http://application.wix.com');
      var widgets = [createLoadWidgetData('Page', 'pageId'), applicationWidget];
      var message = getWorkerLoadMessageData(widgets, ['pageId', 'popupId']);
      var workers = loadWorkers(message);
      var expected = this.wixCodeUrlUtils.getElementoryArguments(widgets, FAKE_BASE_URL);
      workers.forEach(function(worker) {
        var postMessageArgs = worker.postMessage.calls.mostRecent().args;
        expect(postMessageArgs[0].elementoryArguments).toEqual(expected);
      });
    });
  });

  describe('onStartMessage callback', function() {
    it('should ignore non wix code messages', function() {
      var fakeMessage = {
        data: {
          intent: 'other_intent'
        }
      };
      var manager = new WidgetsContextManager();
      manager.initialize();
      options.onStartMessageCallback(fakeMessage);
    });

    it('should throw exception if contexts property is missing', function() {
      var manager = new WidgetsContextManager();
      manager.initialize();
      var startMessage = getWorkerStartMessageData();
      delete startMessage.data.contexts;
      var startMessageCallback = options.onStartMessageCallback.bind(options.onStartMessageCallback, startMessage);
      expect(startMessageCallback).toThrow(new Error('Start message must contain contexts property'));
    });

    it("should throw exception if the worker for this context wasn't loaded", function() {
      var manager = new WidgetsContextManager();
      manager.initialize();
      var startMessage = getWorkerStartMessageData({
        contextId: {}
      });
      var startMessageCallback = options.onStartMessageCallback.bind(options.onStartMessageCallback, startMessage);
      expect(startMessageCallback).toThrow(new Error('Context id contextId is not loaded'));
    });

    it('should send load message to the loaded context', function() {
      var workers = loadWorkers(getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId')], ['pageId']));
      var contexts = {
        pageId: {
          type: 'Container',
          children: [],
          pages: {}
        }
      };
      var siteInfo = { deviceType: 'desktop' };
      var startMessage = getWorkerStartMessageData(contexts, siteInfo);

      options.onStartMessageCallback(startMessage);
      expect(workers[0].postMessage).toHaveBeenCalledWith({
        type: 'wix_code_worker_start',
        context: contexts.pageId,
        id: 'pageId',
        siteInfo: siteInfo
      });
    });

    it('should send load message to several loaded contexts if necessary', function() {
      var pageWidget = createLoadWidgetData('Page', 'pageId');
      var popupWidget = createLoadWidgetData('Popup', 'popupId');
      var workers = loadWorkers(getWorkerLoadMessageData([pageWidget, popupWidget], ['pageId', 'popupId']));
      var contexts = {
        pageId: {
          type: 'Container',
          children: [],
          pages: {}
        },
        popupId: {
          type: 'Container',
          children: [],
          pages: {}
        }
      };
      var siteInfo = { deviceType: 'desktop' };
      var startMessage = getWorkerStartMessageData(contexts, siteInfo);

      options.onStartMessageCallback(startMessage);
      var expected = Object.keys(contexts).map(function(id) {
        return {
          type: 'wix_code_worker_start',
          context: contexts[id],
          id: id,
          siteInfo: siteInfo
        };
      });

      workers.forEach(function(worker, index) {
        expect(worker.postMessage).toHaveBeenCalledWith(expected[index]);
      });
    });
  });

  describe('onInitMessage callback', function() {
    function createInitMessage(controllers) {
      return {
        data: {
          intent: WIX_CODE_INTENT,
          type: WORKER_INIT_MESSAGE_TYPE,
          controllers: controllers
        }
      };
    }

    function createControllerDefinition(applicationId, name, settings, type) {
      return {
        id: _.uniqueId('id-'),
        type: 'AppController',
        applicationId: applicationId,
        name: name || _.uniqueId('name-'),
        controllerType: type || _.uniqueId('type-'),
        settings: settings || {}
      };
    }

    it('should ignore non wix code messages', function() {
      var fakeMessage = {
        data: {
          intent: 'other_intent'
        }
      };
      var manager = new WidgetsContextManager();
      manager.initialize();
      options.onInitMessageCallback(fakeMessage);
    });

    it("should throw if controllers property doesn't exist", function() {
      var message = createInitMessage();
      var manager = new WidgetsContextManager();

      manager.initialize();
      expect(function() {
        options.onInitMessageCallback(message);
      }).toThrow(new Error('Init message must contain controllers property'));
    });

    it('should throw if context with the contextId was not loaded', function() {
      loadWorkers(getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId')], ['pageId']));
      var controllers = {
        otherPageId: {
          appId: [createControllerDefinition('appId')]
        }
      };
      var message = createInitMessage(controllers);

      expect(function() {
        options.onInitMessageCallback(message);
      }).toThrow(new Error('Context id otherPageId is not loaded'));
    });

    it('should pass all of the controllers to the worker', function() {
      var workers = loadWorkers(getWorkerLoadMessageData([
        createLoadWidgetData('Page', 'pageId'),
        createLoadWidgetData('application', 'appId')
      ], ['pageId']));
      var controllers = {
        pageId: {
          appId: [createControllerDefinition('appId'), createControllerDefinition('appId')]
        }
      };
      var message = createInitMessage(controllers);

      options.onInitMessageCallback(message);
      expect(workers[0].postMessage).toHaveBeenCalledWith({ type: 'wix_code_worker_init', id: 'pageId', controllers: controllers.pageId });
    });

    it('should pass to each worker all of its controllers', function() {
      var workers = loadWorkers(getWorkerLoadMessageData([
        createLoadWidgetData('Page', 'pageId'), // worker 0
        createLoadWidgetData('Popup', 'popupId'), // worker 1
        createLoadWidgetData('application', 'appId')
      ], ['pageId', 'popupId']));
      var controllers = {
        pageId: {
          appId: [createControllerDefinition('appId')]
        },
        popupId: {
          appId: [createControllerDefinition('appId')]
        }
      };
      var message = createInitMessage(controllers);

      options.onInitMessageCallback(message);
      expect(workers[0].postMessage).toHaveBeenCalledWith({ type: 'wix_code_worker_init', id: 'pageId', controllers: controllers.pageId });
      expect(workers[1].postMessage).toHaveBeenCalledWith({ type: 'wix_code_worker_init', id: 'popupId', controllers: controllers.popupId });
    });
  });

  describe('onStopMessage callback', function() {
    it('should ignore non wix code messages', function() {
      var fakeMessage = {
        data: {
          intent: 'other_intent'
        }
      };
      var manager = new WidgetsContextManager();

      manager.initialize();
      options.onStopMessageCallback(fakeMessage);

      var workers = FakeWorker.getInstances();
      expect(workers.length).toBeGreaterThan(0);
      var worker = workers[0];

      expect(worker.terminate).not.toHaveBeenCalled();
    });

    it('should terminate web workers', function() {
      var loadMessage = getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId')], ['pageId']);
      var widgets = loadMessage.data.widgets;
      var stopMessage = {
        data: {
          intent: WIX_CODE_INTENT,
          widgetIds: widgets.map(function(w) {
            return w.id;
          })
        }
      };

      var manager = new WidgetsContextManager();

      manager.initialize();
      // simulate page load in order to create workers
      options.onLoadMessageCallback(getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId')], ['pageId']));
      var workers = FakeWorker.getInstances();

      options.onStopMessageCallback(stopMessage);


      expect(workers.length).toEqual(widgets.length + 1); // +1 is the standby worker
      expect(workers[0].terminate).toHaveBeenCalled();
      expect(workers[1].terminate).not.toHaveBeenCalled();
    });
  });

  describe('onMessage callback', function() {
    it('should ignore non wix code messages', function() {
      var fakeMessage = {
        data: {
          intent: 'other_intent'
        }
      };

      var manager = new WidgetsContextManager();

      manager.initialize();

      var workers = FakeWorker.getInstances();
      expect(workers.length).toBeGreaterThan(0);
      var worker = workers[0];
      worker.postMessage.calls.reset();

      options.onMessageCallback(fakeMessage);
      expect(worker.postMessage).not.toHaveBeenCalled();
    });

    it('should delegate wix code messages to the web worker', function() {
      var message = {
        data: {
          intent: WIX_CODE_INTENT,
          type: 'some_message_type'
        }
      };

      testMessageDelegation(message, 'instance1');
    });

    it('should delegate messages to the relavent worker', function() {
      var message = {
        data: {
          intent: WIX_CODE_INTENT,
          type: 'some_message_type',
          contextId: 'pageId'
        }
      };

      var manager = new WidgetsContextManager();
      manager.initialize();
      // simulate page load in order to create workers
      options.onLoadMessageCallback(getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId'), createLoadWidgetData('Popup', 'popupId')], ['pageId', 'popupId']));
      var workers = FakeWorker.getInstances();
      workers.forEach(function(worker) {
        worker.postMessage.calls.reset();
      });

      options.onMessageCallback(message);

      expect(workers[0].postMessage).toHaveBeenCalledWith(message.data);
      expect(workers[1].postMessage).not.toHaveBeenCalled();
    });

    it('should delegate wix code site api messages to the web worker', function() {
      var message = {
        data: {
          intent: WIX_CODE_RESPONSE_INTENT,
          type: 'some_message_type',
          callId: 1,
          result: {}
        }
      };

      testMessageDelegation(message, 'instance1');
    });

    it('should ignore messages with contextId that is not exist', function() {
      var message = {
        data: {
          intent: WIX_CODE_INTENT,
          type: 'some_message_type',
          contextId: 'otherContextId'
        }
      };

      var manager = new WidgetsContextManager();
      manager.initialize();
      // simulate page load in order to create workers
      options.onLoadMessageCallback(getWorkerLoadMessageData([createLoadWidgetData('Page', 'pageId')], ['pageId']));
      var worker = FakeWorker.getInstances()[0];
      worker.postMessage.calls.reset();

      options.onMessageCallback(message);

      expect(worker.postMessage).not.toHaveBeenCalled();
    });

    function testMessageDelegation(message, contextId) {
      var testedWorkerId = 0;
      var manager = new WidgetsContextManager();
      message.data.contextId = contextId;

      manager.initialize();
      // simulate page load in order to create workers
      options.onLoadMessageCallback(getWorkerLoadMessageData([createLoadWidgetData('Page', contextId)], [contextId]));

      // select a worker delegate a message to it
      var workers = FakeWorker.getInstances();
      expect(workers.length).toBeGreaterThan(0);
      var worker = workers[testedWorkerId];
      worker.postMessage.calls.reset();

      options.onMessageCallback(message);

      expect(worker.postMessage).toHaveBeenCalledWith(message.data);
    }
  });
});
