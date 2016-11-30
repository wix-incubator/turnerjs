'use strict';

describe('messageProxy', function() {

  var INIT_MESSAGE_TYPE = 'init_widgets';
  var LOAD_MESSAGE_TYPE = 'load_widgets';
  var START_MESSAGE_TYPE = 'start_widgets';
  var STOP_WIDGETS_MESSAGE_TYPE = 'stop_widgets';
  var MessageProxy;

  beforeEach(function() {
    MessageProxy = require('../main/messageProxy');
  });

  function createFakeWindow() {
    var fakeWindow;
    var windowStub = jasmine.createSpyObj('window stub', ['addEventListener']);

    windowStub.addEventListener.and.callFake(function(_, callback) {
      fakeWindow._eventListenerCallback = callback;
    });
    windowStub.localStorage = {
      setItem: jasmine.createSpy(),
      getItem: jasmine.createSpy(),
      removeItem: jasmine.createSpy(),
      clear: jasmine.createSpy()
    };
    windowStub.sessionStorage = {
      setItem: jasmine.createSpy(),
      getItem: jasmine.createSpy(),
      removeItem: jasmine.createSpy(),
      clear: jasmine.createSpy()
    };

    windowStub.parent = {
      postMessage: jasmine.createSpy('window parent postMessage')
    };

    fakeWindow = {
      windowStub: windowStub,
      sendMessage: function sendMessage(message) {
        this._eventListenerCallback(message);
      }
    };

    return fakeWindow;
  }

  describe('`initialize`', function() {
    it('should register to events on the given window', function() {
      var fakeWindow = createFakeWindow();
      var proxy = new MessageProxy({ window: fakeWindow.windowStub });
      proxy.initialize();

      expect(fakeWindow.windowStub.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('should throw if called twice', function() {
      var fakeWindow = createFakeWindow();
      var proxy = new MessageProxy({ window: fakeWindow.windowStub });

      function initializeProxy() {
        proxy.initialize();
      }

      initializeProxy();

      expect(initializeProxy).toThrow();
    });
  });

  var negativeTestCases = [
    {
      name: 'onInitMessageCallback',
      message: INIT_MESSAGE_TYPE
    },
    {
      name: 'onStopCallback',
      message: STOP_WIDGETS_MESSAGE_TYPE
    },
    {
      name: 'onMessageCallback',
      message: 'fake_message_type'
    }
  ];

  negativeTestCases.forEach(function(testCase) {
    it('should work without `' + testCase.name + '` callback', function() {
      var fakeWindow = createFakeWindow();
      var proxy = new MessageProxy({ window: fakeWindow.windowStub });
      proxy.initialize();

      function sendFakeInitMessage() {
        var message = {
          data: {
            type: INIT_MESSAGE_TYPE
          }
        };

        fakeWindow.sendMessage(message);
      }

      expect(sendFakeInitMessage).not.toThrow();
    });
  });

  describe('onLoadMessageCallback', function() {
    it('should be called on LOAD messages from the viewer', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onLoadMessageCallback: jasmine.createSpy('onLoadMessageCallback')
      };
      var message = {
        data: {
          type: LOAD_MESSAGE_TYPE
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onLoadMessageCallback).toHaveBeenCalledWith(message);
    });

    it('should not be called on other messages', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onLoadMessageCallback: jasmine.createSpy('onLoadMessageCallback')
      };
      var message = {
        data: {
          type: 'fake_message_type'
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onLoadMessageCallback).not.toHaveBeenCalled();
    });
  });

  describe('onStartMessageCallback', function() {
    it('should be called on START messages from the viewer', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onStartMessageCallback: jasmine.createSpy('onLoadMessageCallback')
      };
      var message = {
        data: {
          type: START_MESSAGE_TYPE
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onStartMessageCallback).toHaveBeenCalledWith(message);
    });

    it('should not be called on other messages', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onStartMessageCallback: jasmine.createSpy('onLoadMessageCallback')
      };
      var message = {
        data: {
          type: 'fake_message_type'
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onStartMessageCallback).not.toHaveBeenCalled();
    });
  });

  describe('`onInitMessageCallback`', function() {
    it('should be called on INIT messages from the viewer', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onInitMessageCallback: jasmine.createSpy('onInitMessage')
      };
      var message = {
        data: {
          type: INIT_MESSAGE_TYPE
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onInitMessageCallback).toHaveBeenCalledWith(message);
    });

    it('should not be called on other messages', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onInitMessageCallback: jasmine.createSpy('onInitMessageCallback')
      };
      var message = {
        data: {
          type: 'fake_message_type'
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onInitMessageCallback).not.toHaveBeenCalled();
    });
  });

  describe('`onMessageCallback`', function() {
    it('should be called on receiving messages from the viewer', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onMessageCallback: jasmine.createSpy('onMessageCallback')
      };
      var message = {
        data: {
          type: 'fake_message_type'
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onMessageCallback).toHaveBeenCalledWith(message);
    });

    it('should not be called on INIT message', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onMessageCallback: jasmine.createSpy('onMessageCallback')
      };
      var message = {
        data: {
          type: INIT_MESSAGE_TYPE
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onMessageCallback).not.toHaveBeenCalled();
    });
  });

  describe('`onStopMessageCallback`', function() {
    it('should be called on stop_widgets message from the viewer', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onStopMessageCallback: jasmine.createSpy('onStopMessageCallback')
      };
      var message = {
        data: {
          type: STOP_WIDGETS_MESSAGE_TYPE
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onStopMessageCallback).toHaveBeenCalledWith(message);
    });

    it('should not be called on other messages', function() {
      var fakeWindow = createFakeWindow();
      var options = {
        window: fakeWindow.windowStub,
        onStopMessageCallback: jasmine.createSpy('onStopMessageCallback')
      };
      var message = {
        data: {
          type: 'fake_message_type'
        }
      };
      var proxy = new MessageProxy(options);
      proxy.initialize();
      fakeWindow.sendMessage(message);

      expect(options.onStopMessageCallback).not.toHaveBeenCalled();
    });
  });

  describe('`sendMessageToViewer`', function() {
    it('should send a message to the parent window with the given message data', function() {
      var messageData = {
        type: 'fake_viewer_message_type'
      };
      var fakeWindow = createFakeWindow();
      var proxy = new MessageProxy({ window: fakeWindow.windowStub });
      proxy.initialize();

      proxy.sendMessageToViewer(messageData);

      expect(fakeWindow.windowStub.parent.postMessage).toHaveBeenCalledWith(messageData, '*');
    });
  });

  describe('getMessageHandler', function() {
    beforeEach(function() {
      var fakeWindow = createFakeWindow();
      this.windowStub = fakeWindow.windowStub;
      this.msgProxy = new MessageProxy({ window: this.windowStub });
    });
    describe('when msg intent is BROWSER_API', function() {
      it('should return the correct handler and msg type is setToStorage', function() {
        var intent = 'BROWSER_API';
        var key = 'someKey';
        var value = 'someValue';

        var handler = this.msgProxy.getMessageHandler(intent);
        handler.handle(
          {
            data:
            {
              key: key,
              value: value,
              type: 'localStorage'
            }
          }, 'setToStorage');

        expect(this.windowStub.localStorage.setItem).toHaveBeenCalledWith(key, value);
      });
      it('should throw in case msg type is *not* setToStorage', function() {
        var intent = 'BROWSER_API';
        var invalidMsgType = 'someInvalidMsgType';
        var errorMsg = 'msgType ' + invalidMsgType + ' is not supported';
        var key = 'someKey';
        var value = 'someValue';

        var handler = this.msgProxy.getMessageHandler(intent);

        expect(handler.handle.bind(handler, {
          data: {
            key: key,
            value: value,
            type: 'localStorage'
          }
        }, invalidMsgType)).toThrow(new Error(errorMsg));
        expect(this.windowStub.localStorage.setItem).not.toHaveBeenCalled();
      });
    });
    it('should return the correct handler when msg intent is WIX_CODE', function() {
      var intent = 'WIX_CODE';
      var msgData = {
        data: {}
      };

      var handler = this.msgProxy.getMessageHandler(intent);
      handler.handle(msgData);

      expect(this.windowStub.parent.postMessage).toHaveBeenCalledWith(msgData, '*');
    });
    it('should return the correct handler when msg intent is WIX_CODE_RESPONSE', function() {
      var intent = 'WIX_CODE_RESPONSE';
      var msgData = {
        data: {}
      };

      var handler = this.msgProxy.getMessageHandler(intent);
      handler.handle(msgData);

      expect(this.windowStub.parent.postMessage).toHaveBeenCalledWith(msgData, '*');
    });
    it('should return the correct handler when msg intent is WIX_CODE_APP_API', function() {
      var intent = 'WIX_CODE_APP_API';
      var msgData = {
        data: {}
      };

      var handler = this.msgProxy.getMessageHandler(intent);
      handler.handle(msgData);

      expect(this.windowStub.parent.postMessage).toHaveBeenCalledWith(msgData, '*');
    });
    it('should return the correct handler when msg intent is WIX_CODE_SITE_API', function() {
      var intent = 'WIX_CODE_SITE_API';
      var msgData = {
        data: {}
      };

      var handler = this.msgProxy.getMessageHandler(intent);
      handler.handle(msgData);

      expect(this.windowStub.parent.postMessage).toHaveBeenCalledWith(msgData, '*');
    });
  });
});
