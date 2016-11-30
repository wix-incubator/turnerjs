'use strict';

var _ = require('lodash');

describe('worker', function() {
  // we want to reload the worker every time (not from node cache) because we clean
  // the global "self" after every test, and we want the worker to reregister "onmessage"
  var proxyquire = require('proxyquire').noPreserveCache();
  var workerLogger = require('../main/workerLogger');
  var testUtils = require('../../testUtils/testUtils');

  var FAKE_BASE_URL = 'http://wixcode-host-name.com/';
  var FAKE_BOOTSTRAP_PARAMETERS = {
    viewMode: 'site',
    instance: 'signedInstance',
    scari: 'fake-scari-fake-scari',
    storage: '{local: {}, session: {}}'
  };
  var FAKE_LOAD_QUERY_PARAMETERS = 'viewMode=site&instance=signedInstance&scari=fake-scari-fake-scari';
  var RemoteModelInterface = require('../../static/RMI/RemoteModelInterface');

  function getScript(id, type) {
    id = id || _.uniqueId('id-');
    return {
      id: id,
      type: type || 'Page',
      url: FAKE_BASE_URL + id + '.js',
      moduleName: _.uniqueId('moduleName' + type),
      scriptName: id,
      displayName: id + ' Name'
    };
  }

  function getLoadMessage(wixCodeScripts, applications) {
    return {
      data: {
        type: 'wix_code_worker_load',
        elementoryArguments: {
          baseUrl: FAKE_BASE_URL,
          queryParameters: FAKE_LOAD_QUERY_PARAMETERS
        },
        wixCode: wixCodeScripts || [getScript()],
        applications: applications || [],
        routersMap: {}
      }
    };
  }

  function getBootstrapMessage(applications) {
    return {
      data: {
        type: 'wix_code_worker_bootstrap',
        bootstrapArguments: {
          sdkParameters: FAKE_BOOTSTRAP_PARAMETERS,
          applications: encodeURIComponent(JSON.stringify(applications || []))
        }
      }
    };
  }

  var context;

  function mockRMI(model) {
    context = model;
    return RemoteModelInterface.call(this, model);
  }

  beforeEach(function() {
    global.self = jasmine.createSpyObj('fake worker global scope', ['postMessage', 'importScripts']);
    fakeLoadWixSDK();
    global.self.elementorySupport = {};
    spyOn(workerLogger, 'wrapConsole').and.callThrough();

    context = null;

    var startHandler = proxyquire('../main/worker/startHandler', {
      '../../../static/RMI/RemoteModelInterface': mockRMI
    });

    proxyquire('../main/worker', {
      './worker/startHandler': startHandler
    });
  });

  afterEach(function() {
    delete global.self;
  });

  function fakeLoadWixSDK() {
    global.self.wix = {
      getSelector: jasmine.createSpy('getSelector').and.returnValue(function() {
        return {};
      }),
      getStorage: jasmine.createSpy('getStorage').and.returnValue({
        local: {},
        session: {}
      }),
      $w: jasmine.createSpy('$w'),
      emitter: jasmine.createSpyObj('emitter', ['on']),
      onReady: jasmine.createSpy('onReady'),
      __INTERNAL__: jasmine.createSpyObj('internal wix sdk', ['initModel', 'initEnv', 'setStaticEventHandlers', 'onMessage', 'triggerOnReady', 'getEventHandler']),
      ga: jasmine.createSpy('ga')
    };
  }

  function fakeUnloadWixSDK() {
    delete global.self.wix;
  }

  it('registers to `onmessage`', function() {
    expect(self.onmessage).toEqual(jasmine.any(Function));
  });

  it('registers to `onerror`', function() {
    expect(self.onerror).toEqual(jasmine.any(Function));
  });


  it('should wrap the console', function() {
    expect(workerLogger.wrapConsole).toHaveBeenCalled();
    expect(workerLogger.wrapConsole).toHaveBeenCalledWith(console, self.postMessage);
  });

  describe('on bootstrap message', function() {
    function mockImportScripts() {
      var modules = this.modules = {};
      global.self.importScripts.and.callFake(function(url) {
        _.set(global, 'self.module.exports', {});
        modules[url] = global.self.module.exports;
      });
    }

    it('should load ES6 runtime', function() {
      var applications = '';
      global.self.onmessage(getBootstrapMessage(applications));

      var expectedPattern = /http\:\/\/static\.parastorage\.com\/services\/cloud\-runtime\/\d+\.\d+\.\d+\/lib\/es6runtime.min.js/;
      expect(global.self.importScripts.calls.allArgs()).toMatch(expectedPattern);
    });

    it('should import the unminified sdk in debug mode', function() {
      var applications = '';
      var bootstrapMessage = getBootstrapMessage(applications);
      var sdkSource = 'http://localhost/wixcode-sdk/build/wix.min.js';
      bootstrapMessage.data.bootstrapArguments.sdkSource = sdkSource;
      bootstrapMessage.data.bootstrapArguments.debug = true;
      global.self.onmessage(bootstrapMessage);

      var unminifiedSdkSource = 'http://localhost/wixcode-sdk/build/wix.js';
      expect(global.self.importScripts.calls.allArgs()).toMatch(unminifiedSdkSource);
    });

    it('should import the sdk from sdkSource if suppplied', function() {
      var applications = '';
      var bootstrapMessage = getBootstrapMessage(applications);
      var sdkSource = 'http://localhost/wixcode-sdk/build/wix.min.js';
      bootstrapMessage.data.bootstrapArguments.sdkSource = sdkSource;
      global.self.onmessage(bootstrapMessage);

      expect(global.self.importScripts.calls.allArgs()).toMatch(sdkSource);
    });

    it('should initialize the sdk env', function() {
      var applications = '';
      var bootstrapMessage = getBootstrapMessage(applications);
      global.self.onmessage(bootstrapMessage);

      expect(global.self.wix.__INTERNAL__.initEnv).toHaveBeenCalledWith(bootstrapMessage.data.bootstrapArguments.sdkParameters);
    });

    it('should validate `sdkParameters` parameter', function() {
      var msg = {
        data: {
          type: 'wix_code_worker_bootstrap',
          bootstrapArguments: {
            sdkParameters: null
          }
        }
      };

      function sendBootstrapMessage() {
        global.self.onmessage(msg);
      }

      expect(sendBootstrapMessage).toThrowError('Could not load user code: `sdkParameters` has an invalid value: null');
    });

    ['id', 'url'].forEach(function(property) {
      it('should throw when one of the scripts in applications is missing ' + property, function() {
        var application = getScript('app-1', 'application');
        delete application[property];
        var bootstrapMessage = getBootstrapMessage([application, getScript('app-2', 'application')]);
        var bootstrapMessageCall = global.self.onmessage.bind(global.self, bootstrapMessage);
        expect(bootstrapMessageCall).toThrow(new Error('scripts must contain id, url: ' + [JSON.stringify(application)]));
      });
    });

    it('should load a single application', function() {
      mockImportScripts.call(this);
      var appScript = getScript('app-1', 'application');
      global.self.onmessage(getBootstrapMessage([appScript]));

      expect(this.modules[appScript.url]).toBeDefined();
    });

    it('should load multiple applications', function() {
      mockImportScripts.call(this);
      var appScript1 = getScript('app-1', 'application');
      var appScript2 = getScript('app-2', 'application');
      global.self.onmessage(getBootstrapMessage([appScript1, appScript2]));

      expect(this.modules[appScript1.url]).toBeDefined();
      expect(this.modules[appScript2.url]).toBeDefined();
    });
  });

  describe('on load message', function() {
    beforeEach(function() {
      this.loadedScripts = [];
      global.self.importScripts.and.callFake(function(script) {
        this.loadedScripts.push(script);
      }.bind(this));
    });

    it('should ignore messages with no data', function() {
      expect(function() {
        global.self.onmessage(getBootstrapMessage());
        global.self.onmessage({ data: undefined });
      }).not.toThrow();
    });

    it('should throw exception if applications is missing', function() {
      global.self.onmessage(getBootstrapMessage());
      var loadMessage = getLoadMessage();
      delete loadMessage.data.applications;
      var loadMeesageCall = global.self.onmessage.bind(global.self, loadMessage);
      expect(loadMeesageCall).toThrow(new Error('Load message data must include applications property of type Array'));
    });

    it('should throw an exception if routersMap is missing', function() {
      global.self.onmessage(getBootstrapMessage());
      var loadMessage = getLoadMessage();
      delete loadMessage.data.routersMap;
      var loadMeesageCall = global.self.onmessage.bind(global.self, loadMessage);
      expect(loadMeesageCall).toThrow(new Error('Load message data must include routersMap of type object'));
    });

    it('should throw an exception if elementoryArguments.baseUrl is missing', function() {
      global.self.onmessage(getBootstrapMessage());
      var loadMessage = getLoadMessage();
      delete loadMessage.data.elementoryArguments.baseUrl;
      var loadMeesageCall = global.self.onmessage.bind(global.self, loadMessage);
      expect(loadMeesageCall).toThrow(new Error('Load message data must include baseUrl of type string'));
    });

    it('should throw an exception if elementoryArguments.queryParameters is missing', function() {
      global.self.onmessage(getBootstrapMessage());
      var loadMessage = getLoadMessage();
      delete loadMessage.data.elementoryArguments.queryParameters;
      var loadMeesageCall = global.self.onmessage.bind(global.self, loadMessage);
      expect(loadMeesageCall).toThrow(new Error('Load message data must include queryParameters of type string'));
    });

    ['id', 'url', 'scriptName', 'displayName'].forEach(function(property) {
      it('should throw when one of the scripts in wixCode is missing ' + property, function() {
        global.self.onmessage(getBootstrapMessage());
        var pageScript = getScript('page-1');
        delete pageScript[property];
        var loadMessage = getLoadMessage([pageScript, getScript('page-2')]);
        var loadMessageCall = global.self.onmessage.bind(global.self, loadMessage);
        expect(loadMessageCall).toThrow(new Error('scripts must contain id, url, scriptName, displayName: ' + [JSON.stringify(pageScript)]));
      });
    });

    it('should not delegate the message to the sdk', function() {
      var pageScript = getScript('page-1');
      var loadMessage = getLoadMessage([pageScript]);
      global.self.onmessage(loadMessage);
      expect(global.self.wix.__INTERNAL__.onMessage).not.toHaveBeenCalled();
    });

    it('should set elementory arguments', function() {
      var loadMessage = getLoadMessage();
      global.self.onmessage(loadMessage);

      expect(global.self.elementorySupport.baseUrl).toEqual(FAKE_BASE_URL);
      expect(global.self.elementorySupport.queryParameters).toEqual(FAKE_LOAD_QUERY_PARAMETERS);
    });

    it('should load wixCode script', function() {
      var pageScript = getScript('page-1');
      var loadMessage = getLoadMessage([pageScript]);
      global.self.onmessage(loadMessage);

      expect(this.loadedScripts).toEqual([pageScript.url]);
    });

    it('should load all wixCode scripts', function() {
      var pageScript = getScript('page-1');
      var masterPageScript = getScript('masterPage');
      var loadMessage = getLoadMessage([pageScript, masterPageScript]);
      global.self.onmessage(loadMessage);

      expect(this.loadedScripts).toEqual([pageScript.url, masterPageScript.url]);
    });

    it('should have global $w only during the load of wixcode script', function() {
      var pageScript = getScript('page-1');
      var loadMessage = getLoadMessage([pageScript]);
      expect(global.$w).not.toBeDefined();
      global.self.onmessage(loadMessage);

      global.self.importScripts.and.callFake(function() {
        expect(global.$w).toBeDefined();
      });
      expect(global.$w).not.toBeDefined();
    });

    it('should have global routerReturnedData only during the load of wixcode script when it has routerData', function() {
      var pageScript = getScript('page-1');
      pageScript.routerData = {
        routing: 'data'
      };
      var loadMessage = getLoadMessage([pageScript]);
      expect(global.routerReturnedData).not.toBeDefined();
      global.self.onmessage(loadMessage);

      global.self.importScripts.and.callFake(function() {
        expect(global.routerReturnedData).toBeDefined();
      });
      expect(global.routerReturnedData).not.toBeDefined();
    });

    it('should have global wixCode storage object', function() {//This should be changed once we wrap everything in a function and inject the global vars
      var pageScript = getScript('page-1');
      var loadMessage = getLoadMessage([pageScript]);
      expect(global.storage).not.toBeDefined();
      global.self.onmessage(loadMessage);

      global.self.importScripts.and.callFake(function() {
        expect(global.storage).toBeDefined();
      });
      expect(global.self.storage).toBeDefined();
    });

    describe('initAppForPage applications', function() {
      function mockImportScripts(initAppForPageSpy) {
        var modules = this.modules = {};
        global.self.importScripts.and.callFake(function(url) {
          _.set(global, 'self.module.exports', {
            initAppForPage: initAppForPageSpy || jasmine.createSpy('initAppForPage')
          });

          modules[url] = global.self.module.exports;
        });
      }

      it('should call initAppForPage (single app)', function() {
        mockImportScripts.call(this);
        var appScript = getScript('app-1', 'application');
        global.self.onmessage(getBootstrapMessage([appScript]));
        var loadMessage = getLoadMessage([getScript('page-1')], [appScript]);
        global.self.onmessage(loadMessage);

        expect(this.modules[appScript.url].initAppForPage).toHaveBeenCalledWith({
          appInstanceId: 'app-1'
        }, {
          links: {
            toUrl: jasmine.any(Function)
          },
          storage: {
            local: jasmine.any(Object),
            session: jasmine.any(Object)
          }
        }
        );
      });

      it('should call initAppForPage for multiple applications', function() {
        mockImportScripts.call(this);
        var appScript1 = getScript('app-1', 'application');
        var appScript2 = getScript('app-2', 'application');
        global.self.onmessage(getBootstrapMessage([appScript1, appScript2]));
        var loadMessage = getLoadMessage([getScript('page-1')], [appScript1, appScript2]);
        global.self.onmessage(loadMessage);

        expect(this.modules[appScript1.url].initAppForPage).toHaveBeenCalledWith({
          appInstanceId: 'app-1'
        }, {
          links: {
            toUrl: jasmine.any(Function)
          },
          storage: {
            local: jasmine.any(Object),
            session: jasmine.any(Object)
          }
        });
        expect(this.modules[appScript2.url].initAppForPage).toHaveBeenCalledWith({
          appInstanceId: 'app-2'
        }, {
          links: {
            toUrl: jasmine.any(Function)
          },
          storage: {
            local: jasmine.any(Object),
            session: jasmine.any(Object)
          }
        });
      });

      it('should convert linkObject to url when calling platformUtilities.linkt.toUrl function', function(done) {
        var pageId = 'page-1';
        var pageLinkObject = testUtils.dataMocks.pageLink(pageId);
        var initAppForPageSpy = jasmine.createSpy('initAppForPage').and.callFake(function(initAppParams, platformUtilities) {
          expect(platformUtilities.links.toUrl(pageLinkObject)).toEqual('/' + pageId);
          done();
        });
        mockImportScripts.call(this, initAppForPageSpy);
        var appScript = getScript('app-1', 'application');
        global.self.onmessage(getBootstrapMessage([appScript]));
        var loadMessage = getLoadMessage([getScript(pageId)], [appScript]);

        global.self.onmessage(loadMessage);
      });

      it('should load application scripts even if wixcode has a script error', function() {
        mockImportScripts.call(this);
        var appScript = getScript('app-1', 'application');
        var pageScript = getScript('page-1');
        var module;
        global.self.importScripts.and.callFake(function(url) {
          if (url === appScript.url) {
            module = global.self.module.exports = {
              initAppForPage: jasmine.createSpy('initAppForPage')
            };
          } else if (url === pageScript.url) {
            throw new Error('script error');
          }
        });
        var bootstrapMessage = getBootstrapMessage([appScript]);
        global.self.onmessage(bootstrapMessage);
        var loadMessage = getLoadMessage([pageScript], [appScript]);
        global.self.onmessage(loadMessage);

        expect(module).toBeDefined();
        expect(module.initAppForPage).toHaveBeenCalledWith({
          appInstanceId: 'app-1'
        }, {
          links: {
            toUrl: jasmine.any(Function)
          },
          storage: {
            local: jasmine.any(Object),
            session: jasmine.any(Object)
          }
        });
      });
    });
  });

  function createConnection(controllerId, role, config) {
    return {
      type: 'ConnectionItem',
      controllerId: controllerId || _.uniqueId('id-'),
      role: role || _.uniqueId('role-'),
      config: config || {}
    };
  }

  function createControllerDefinition(applicationId, settings, connections, behaviors) {
    return {
      controllerBehaviors: behaviors || [],
      controllerData: {
        type: 'AppController',
        controllerType: _.uniqueId('type-'),
        applicationId: applicationId,
        name: _.uniqueId('name-'),
        settings: settings || {}
      },
      connections: connections,
      compId: _.uniqueId('comp-')
    };
  }

  function getInitMessage(id, controllers) {
    return {
      data: {
        type: 'wix_code_worker_init',
        id: id,
        controllers: controllers
      }
    };
  }

  function getTestApp(url, controllerAPISpy) {
    global.self.module = global.self.module || {};
    var module = global.self.module;
    var promiseCallbacks = {};
    var promise = new Promise(function(res, rej) {
      promiseCallbacks.resolve = res;
      promiseCallbacks.reject = rej;
    });

    this.controllers = this.controllers || [];
    var controllers = this.controllers;
    var self = this;
    module.exports = {
      promise: promise,
      promiseCallbacks: promiseCallbacks,
      initAppForPage: jasmine.createSpy('initAppForPage').and.returnValue(promise),
      createControllers: jasmine.createSpy('createControllers').and.callFake(function(configs) {
        self.controllersPromises = _.map(configs, function() {
          return new Promise(function(resolve) {
            var controller = {
              pageReady: jasmine.createSpy('pageReady'),
              exports: {
                controllerAPI: controllerAPISpy || jasmine.createSpy('controllerAPI')
              }
            };
            controllers.push(controller);

            resolve(controller);
          });
        });
        return self.controllersPromises;
      })
    };

    _.set(this, ['modules', url], module.exports);
  }

  describe('on init message', function() {
    describe('without initAppForPage', function() {
      it("should not fail if application doesn't have a initAppForPage method", function(done) {
        var appScript = getScript('app2', 'application');
        var bootstrapMessage = getBootstrapMessage([appScript]);
        var loadMessage = getLoadMessage([getScript('page-1')], [appScript]);
        var self = this;
        global.self.importScripts.and.callFake(function(url) {
          if (appScript.url === url) {
            global.self.module.exports = {
              createControllers: jasmine.createSpy('createControllers').and.callFake(function() {
                done();
                return [];
              })
            };

            return;
          }

          getTestApp.call(self, url);
        });

        global.self.onmessage(bootstrapMessage);
        global.self.onmessage(loadMessage);

        var definition = createControllerDefinition('app2');
        var message = getInitMessage('page-1', {
          app2: {
            controllerId: definition
          }
        });

        global.self.onmessage(message);
      });
    });

    describe('with initAppForPage', function() {
      beforeEach(function() {
        this.controllers = [];
        this.modules = {};
        global.self.importScripts.and.callFake(getTestApp.bind(this));

        this.appScript = getScript('app1', 'application');
        var bootstrapMessage = getBootstrapMessage([this.appScript]);
        global.self.onmessage(bootstrapMessage);
        var loadMessage = getLoadMessage([getScript('page-1')], [this.appScript]);
        global.self.onmessage(loadMessage);
      });

      it('should throw exception if controllers property is missing', function() {
        var message = getInitMessage('page-1');
        delete message.data.controllers;

        expect(global.self.onmessage.bind(global.self, message))
          .toThrow(new Error('Init message data must include controllers property'));
      });

      it('should throw exception if application has no controllers', function(done) {
        var message = getInitMessage('page-1', {
          app1: {}
        });

        global.self.onmessage(message);

        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.resolve();
        module.promise.then(function() {
          expect(module.createControllers).not.toHaveBeenCalled();
          done();
        });
      });

      it('should not call createControllers if initAppForPage rejected', function(done) {
        var definition = createControllerDefinition('app1');
        var message = getInitMessage('page-1', {
          app1: {
            controllerId: definition
          }
        });

        global.self.onmessage(message);

        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.reject();
        module.promise.catch(function() {
          expect(module.createControllers).not.toHaveBeenCalled();
          done();
        });
      });

      it('should call createControllers of the application with its controller config and connections', function(done) {
        var connections = [createConnection()];
        var definition = createControllerDefinition('app1', { src: 'picture' }, connections);
        var message = getInitMessage('page-1', {
          app1: {
            controllerId: definition
          }
        });

        global.self.onmessage(message);

        var expected = [{
          type: definition.controllerData.controllerType,
          config: definition.controllerData.settings,
          connections: connections,
          $w: jasmine.any(Function)
        }];

        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.resolve();
        module.promise.then(function() {
          Promise.all(this.controllersPromises).then(function() {
            expect(module.createControllers).toHaveBeenCalledWith(expected);
            done();
          });
        }.bind(this));
      });

      it('should call to the controller pageReady once the triggerReady was called', function(done) {
        var message = getInitMessage('page-1', {
          app1: {
            controllerId: createControllerDefinition('app1', {
              src: 'picture'
            })
          }
        });

        global.self.onmessage(message);

        var expectedSelector = {};
        expectedSelector.onReady = function(callback) {
          callback();
          expect(this.controllers[0].pageReady).toHaveBeenCalledWith(expectedSelector);
          done();
        }.bind(this);
        global.self.wix.getSelector.and.returnValue(expectedSelector);

        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.resolve();
      });

      it('should call to each controller pageReady once the triggerReady was called with its selector', function(done) {
        var message = getInitMessage('page-1', {
          app1: {
            controller1: createControllerDefinition('app1', {
              src: 'picture1'
            }),
            controller2: createControllerDefinition('app1', {
              src: 'picture2'
            })
          }
        });

        global.self.onmessage(message);

        var expectedSelectors = [];
        var index = 0;
        var controllers = this.controllers;

        function onReady(callback) {
          callback();
          expect(controllers[index].pageReady).toHaveBeenCalledWith(expectedSelectors[index]);
          if (index === 1) {
            done();
          }

          index++;
        }

        global.self.wix.getSelector.and.callFake(function(controllerId) {
          var selector = { id: controllerId };
          selector.onReady = onReady;
          expectedSelectors.push(selector);

          return selector;
        });


        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.resolve();
      });

      it('should call createControllers of the application with its controllers', function(done) {
        var app1 = {
          controller1: createControllerDefinition('app1', {}, [createConnection()]),
          controller2: createControllerDefinition('app1', {}, [createConnection()])
        };

        var message = getInitMessage('page-1', {
          app1: app1
        });

        global.self.onmessage(message);

        var expected = _.map(app1, function(config) {
          return {
            type: config.controllerData.controllerType,
            config: config.controllerData.settings,
            connections: config.connections,
            $w: jasmine.any(Function)
          };
        });

        var module = this.modules[this.appScript.url];
        module.promiseCallbacks.resolve();
        module.promise.then(function() {
          expect(module.createControllers).toHaveBeenCalledWith(expected);
          done();
        });
      });

      it('should call createControllers only to ready applications', function(done) {
        var appScript1 = getScript('app1', 'application');
        var appScript2 = getScript('app2', 'application');
        global.self.onmessage(getBootstrapMessage([appScript1, appScript2]));
        global.self.onmessage(getLoadMessage([getScript('page-1')], [appScript1, appScript2]));

        var initMessage = getInitMessage('page-1', {
          app1: {
            controller1: createControllerDefinition('app1', {
              reut: 'savir'
            })
          },
          app2: {
            controller2: createControllerDefinition('app2', {
              reut: 'savir'
            })
          }
        });

        global.self.onmessage(initMessage);

        var module1 = this.modules[appScript1.url];
        var module2 = this.modules[appScript2.url];
        module1.promiseCallbacks.resolve();
        module1.promise.then(function() {
          expect(module2.createControllers).not.toHaveBeenCalled();

          module2.promiseCallbacks.resolve();
          module2.promise.then(function() {
            expect(module2.createControllers).toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  describe('on start message', function() {
    function getStartMessage(id, rmiModel) {
      return {
        data: {
          type: 'wix_code_worker_start',
          context: rmiModel,
          siteInfo: {},
          id: id
        }
      };
    }

    it('should throw exception if id is missing', function() {
      var startMessage = getStartMessage();
      var startMessageCallback = global.self.onmessage.bind(global.self, startMessage);
      expect(startMessageCallback).toThrow(new Error('Could not init sdk: `context.id` is missing'));
    });

    it('should throw exception if context is missing', function() {
      var startMessageCallback = global.self.onmessage.bind(global.self, getStartMessage('contextId'));
      expect(startMessageCallback).toThrow(new Error('Could not init sdk: `context.context` is missing'));
    });

    it('should init the sdk with the id, the context and the site info', function(done) {
      var testContext = {
        components: {},
        connections: {},
        pages: {}
      };

      global.self.wix.__INTERNAL__.triggerOnReady.and.callFake(function(callback) {
        expect(context).toBe(testContext);
        expect(global.self.wix.__INTERNAL__.initModel).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object), 'contextId');
        callback();
        done();
      });

      global.self.onmessage(getStartMessage('contextId', testContext));
    });

    it('should trigger onReady callbacks after sdk was initialized', function(done) {
      var contextId = 'contextId';
      global.self.wix.__INTERNAL__.triggerOnReady.and.callFake(function() {
        expect(global.self.wix.__INTERNAL__.initModel).toHaveBeenCalled();
        done();
      });

      global.self.onmessage(getStartMessage(contextId, {}));
    });

    it('should message to the viewer that all onReady callbacks were done', function(done) {
      var contextId = 'contextId';
      global.self.wix.__INTERNAL__.triggerOnReady.and.callFake(function(callback) {
        callback();
        expect(global.self.postMessage).toHaveBeenCalledWith({
          intent: 'WIX_CODE',
          type: 'widget_ready',
          widgetId: contextId
        });
        done();
      });

      global.self.onmessage(getStartMessage(contextId, {}));
    });

    it('should add publicAPI of controller to the RMI', function(done) {
      this.controllers = [];
      this.modules = {};
      var appScript = getScript('app1', 'application');
      var publicAPI = jasmine.createSpy('publicAPI');
      global.self.importScripts.and.callFake(function(url) {
        if (url === appScript.url) {
          return getTestApp.call(this, url, publicAPI);
        }
        return getTestApp.call(this, url);
      }.bind(this));

      var bootstrapMessage = getBootstrapMessage([appScript]);
      global.self.onmessage(bootstrapMessage);

      var loadMessage = getLoadMessage([getScript('page-1')], [appScript]);
      global.self.onmessage(loadMessage);

      var definition = createControllerDefinition('app1');
      var message = getInitMessage('page-1', {
        app1: {
          controllerId: definition
        }
      });

      global.self.onmessage(message);

      global.self.wix.__INTERNAL__.initModel.and.callFake(function(RMI) {
        var actual = RMI.getPublicAPI(definition.compId);
        expect(actual).toBeDefined();
        expect(actual.controllerAPI).toBe(publicAPI);
      });

      global.self.wix.__INTERNAL__.triggerOnReady.and.callFake(function() {
        done();
      });

      var rmiModel = {
        components: {},
        connections: {},
        pages: {}
      };

      rmiModel.components[definition.compId] = {
        type: 'platform.components.AppController',
        data: definition.controllerData
      };

      global.self.onmessage(getStartMessage('page-1', rmiModel));

      var module = this.modules[appScript.url];
      module.promiseCallbacks.resolve();
    });

    describe('when the controller pageReady method triggers `fireEvent`', function() {

      function getControllerDef() {
        var controllerBehaviors = [{
          action: {
            name: 'stateChanged'
          },
          behavior: {
            name: 'runAppCode',
            params: {
              callbackId: 'controllerId_stateChanged',
              compId: 'controllerId'
            }
          }
        }];
        return createControllerDefinition('app2', undefined, undefined, controllerBehaviors);
      }

      function executeInit(definition) {
        var initMessage = getInitMessage('page-1', {
          app2: {
            controllerId: definition
          }
        });
        global.self.onmessage(initMessage);
      }

      function executeStart(definition) {
        var startMessage = getStartMessage('page-1', {
          components: {
            controllerId: {
              type: 'platform.components.AppController',
              data: definition.controllerData
            }
          },
          connections: {},
          pages: {}
        });
        global.self.onmessage(startMessage);
      }

      function fakeImportScript(appScript, wixCodeScript, exportedFuncs, createControllers) {
        var self = this;
        global.self.importScripts.and.callFake(function(url) {
          if (appScript.url === url) {
            global.self.module.exports = {
              createControllers: createControllers
            };

            return;
          }

          if (wixCodeScript.url === url) {
            global.self.module.exports = exportedFuncs;

            return;
          }

          getTestApp.call(self, url);
        });
      }

      function executeBootstrap(applications) {
        var bootstrapMessage = getBootstrapMessage(applications);
        global.self.onmessage(bootstrapMessage);
      }

      function executeLoad(wixCodeScript, appScript) {
        var loadMessage = getLoadMessage([wixCodeScript], [appScript]);
        global.self.onmessage(loadMessage);
      }

      function fakeWixSDKEmitterFuncs(exportedFuncs) {

        var Emitter = require('tiny-emitter');
        var emitter = new Emitter();

        global.self.wix.getSelector.and.callFake(function(controllerId) {
          return {
            onReady: function(callback) {
              callback();
            },
            fireEvent: function(event, payload) {
              emitter.emit(controllerId + '_' + event, payload);
            }
          };
        });

        global.self.wix.emitter.on.and.callFake(function(controllerId, event, callback) {
          emitter.on(controllerId + '_' + event, callback);
        });

        global.self.wix.__INTERNAL__.getEventHandler.and.callFake(function(handlerName) {
          return exportedFuncs[handlerName];
        });
      }

      it('should call wixCode exported static event handler', function(done) {

        var wixCodeExportedFuncs = {
          controllerId_stateChanged: function() {
            done();
          }
        };
        var wixCodeScript = getScript('page-1');
        var appScript = getScript('app2', 'application');

        fakeWixSDKEmitterFuncs(wixCodeExportedFuncs);
        fakeImportScript.call(this, appScript, wixCodeScript, wixCodeExportedFuncs, function(configs) {
          return configs.map(function(config) {
            var $w = config.$w;
            return {
              pageReady: function() {
                $w.fireEvent('stateChanged');
              }
            };
          });
        });

        var definition = getControllerDef();

        executeBootstrap([appScript]);
        executeLoad(wixCodeScript, appScript);
        executeInit(definition);
        executeStart(definition);
      });

      it('should console.warn and call controller.start if pageReady is missing on the controller instance', function(done) {
        spyOn(console, 'warn');
        var wixCodeScript = getScript('page-1');
        var appScript = getScript('app2', 'application');

        fakeWixSDKEmitterFuncs({});
        fakeImportScript.call(this, appScript, wixCodeScript, {}, function(configs) {
          return configs.map(function() {
            return {
              start: function() {
                expect(console.warn).toHaveBeenCalledWith('controller.start is deprecated please export controller.pageReady method instead'); // eslint-disable-line no-console
                done();
              }
            };
          });
        });

        var definition = getControllerDef();

        executeBootstrap([appScript]);
        executeLoad(wixCodeScript, appScript);
        executeInit(definition);
        executeStart(definition);
      });
    });
  });

  describe('on message', function() {
    var message = {
      data: {
        callbackId: '7ad675df-c19d-3fe3-bace-aa1793469adf',
        compName: 'comp-ih1zhe0z',
        intent: 'WIX_CODE',
        type: 'wix_code_run_user_function',
        contextId: 'wixCodeWidget_14'
      }
    };

    it('should delegate the message to the sdk', function() {
      global.self.onmessage(message);
      expect(global.self.wix.__INTERNAL__.onMessage).toHaveBeenCalledWith(message);
    });

    it('should not fail if the sdk is not imported yet', function() {
      fakeUnloadWixSDK();
      function sendMessage() {
        global.self.onmessage(message);
      }

      expect(sendMessage).not.toThrow();
    });
  });

  describe('on error', function() {
    it('should post the message to the message proxy', function() {
      var errorMessage = 'this is an error';
      var expectedErrorLogMessage = workerLogger.createErrorLogMessage(errorMessage);

      global.self.onerror(errorMessage);
      expect(global.self.postMessage).toHaveBeenCalledWith(expectedErrorLogMessage);
    });
  });

});
