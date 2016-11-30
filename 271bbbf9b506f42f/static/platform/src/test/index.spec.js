'use strict';

describe('iframe', function() {

    var proxyquire = require('proxyquire').noCallThru();
    var _window, _worker;

    beforeEach(function() {
        _window = createFakeWindow('global window stub');
        var FakeWorker = createFakeWorkerClass();
        global.self = _window.windowStub;
        proxyquire('../main/index', {
            './worker': FakeWorker
        });
    });

    function createWindowStubSpy(name) {
        return jasmine.createSpyObj(name || 'window stub', ['postMessage', 'addEventListener']);
    }

    function createFakeWorkerClass() {

        function FakeWorkerClass() {
            _worker = createFakeWindow('worker window stub');
            var workerInstance = _worker.windowStub;
            return workerInstance;
        }

        return FakeWorkerClass;
    }

    function createFakeWindow(name) {
        var fakeWindow;
        var windowStub = createWindowStubSpy(name);

        windowStub.addEventListener.and.callFake(function(_, callback) {
            fakeWindow._eventListenerCallback = callback;
        });

        windowStub.parent = {
            postMessage: jasmine.createSpy('window parent postMessage', ['postMessage'])
        };

        fakeWindow = {
            windowStub: windowStub,
            sendMessage: function sendMessage(message) {
                this._eventListenerCallback(message);
            }
        };

        return fakeWindow;
    }

    it('should register to messages from viewer', function() {
        expect(global.self.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('should register to messages from worker', function() {
        expect(global.self.worker.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('should delegate messages from viewer to worker', function() {
        _window.sendMessage({
            data: 'd-0'
        });
        expect(global.self.worker.postMessage).toHaveBeenCalledWith('d-0');
    });

    it('should delegate messages from worker to viewer', function() {
        _worker.sendMessage({
            data: 'd-1'
        });
        expect(global.self.parent.postMessage).toHaveBeenCalledWith('d-1', '*');
    });
});
