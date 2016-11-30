'use strict';

var workerLogger = require('../main/workerLogger');
var wixCodeLogLevel = require('../../static/wixCodeLogLevel');
var wixCodeMessageTypes = require('../../static/wixCodeMessageTypes');
var MESSAGE = 'testing';

describe('workerLogger', function() {

  describe('wrapConsole', function() {
    var fakeSend, fakeConsole;
    beforeEach(function() {
      fakeSend = jasmine.createSpy('messageSender');
      fakeConsole = jasmine.createSpyObj('console', ['log', 'info', 'warn', 'error']);
    });

    function testMethodWrapper(methodName, logLevel) {
      testMethodWrapperWithMessage(methodName, logLevel, MESSAGE);
    }

    function testMethodWrapperWithMessage(methodName, logLevel, message, expected) {
      var originalMethod = fakeConsole[methodName];
      workerLogger.wrapConsole(fakeConsole, fakeSend);
      fakeConsole[methodName](message);

      expect(fakeSend).toHaveBeenCalledWith({
        intent: wixCodeMessageTypes.WIX_CODE_INTENT,
        type: wixCodeMessageTypes.CONSOLE_MESSAGE,
        data: {
          logLevel: logLevel,
          args: jasmine.any(Object)
        }
      });

      expect(fakeSend).toHaveBeenCalled();
      var callArgs = fakeSend.calls.mostRecent().args;
      expect(callArgs.length).toEqual(1);
      expect(callArgs[0]).toBeDefined();
      var consoleArgs = callArgs[0].data.args;
      expect(consoleArgs).toEqual([expected || message]);
      expect(originalMethod).toHaveBeenCalledWith(message);
    }

    describe('log arguments types', function() {
      it('should handle numbers', function() {
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, 2);
      });

      it('should handle boolean', function() {
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, true);
      });

      it('should handle null', function() {
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, null);
      });

      it('should handle undefined', function() {
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, undefined);
      });

      it('should handle Array', function() {
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, ['a', true, null, undefined]);
      });

      it('should handle objects', function() {
        var obj = { a: 2 };
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, obj, JSON.stringify(obj));
      });

      it('should use toString if JSON.stringify fail', function() {
        var obj = {};
        obj.a = obj;
        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, obj, obj.toString());
      });

      it('should handle functions', function() {
        function foo(a) {
          return a;
        }

        testMethodWrapperWithMessage('log', wixCodeLogLevel.LOG, foo, foo.toString());
      });
    });

    it('should wrap console.log', function() {
      testMethodWrapper('log', wixCodeLogLevel.LOG);
    });

    it('should wrap console.info', function() {
      testMethodWrapper('info', wixCodeLogLevel.INFO);
    });

    it('should wrap console.warn', function() {
      testMethodWrapper('warn', wixCodeLogLevel.WARN);
    });

    it('should wrap console.error', function() {
      testMethodWrapper('error', wixCodeLogLevel.ERROR);
    });
  });

  describe('createErrorLogMessage', function() {
    it('should create a error log message', function() {
      var part1 = 'test1';
      var part2 = 'test2';
      var message = workerLogger.createErrorLogMessage(part1, part2);
      expect(message).toEqual({
        intent: wixCodeMessageTypes.WIX_CODE_INTENT,
        type: wixCodeMessageTypes.CONSOLE_MESSAGE,
        data: {
          logLevel: wixCodeLogLevel.ERROR,
          args: [part1, part2]
        }
      });
    });
  });
});
