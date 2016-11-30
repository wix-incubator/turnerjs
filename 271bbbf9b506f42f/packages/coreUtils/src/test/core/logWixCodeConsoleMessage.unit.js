define(['lodash', 'definition!coreUtils/core/logWixCodeConsoleMessage'], function (_, logWixCodeConsoleMessageDefinition) {
    'use strict';

    describe('logWixCodeConsoleMessage', function () {
        beforeEach(function () {
            this.fakeWindow = {};
            this.logWixCodeConsoleMessage = logWixCodeConsoleMessageDefinition(_, this.fakeWindow);
        });


        it('should not throw if there is no parent window', function () {
            var msg = {
                intent: 'WIX_CODE',
                type: 'console'
            };

            this.fakeWindow.parent = null;
            var self = this;

            function logMessage() {
                self.logWixCodeConsoleMessage(msg);
            }

            expect(logMessage).not.toThrow();
        });

        it('should do nothing if the parent window is the same as window (Not preview window)', function () {
            var msg = {
                intent: 'WIX_CODE',
                type: 'console'
            };
            this.fakeWindow.parent = this.fakeWindow;
            this.fakeWindow.postMessage = jasmine.createSpy('postMessage');

            this.logWixCodeConsoleMessage(msg);

            expect(this.fakeWindow.postMessage).not.toHaveBeenCalled();
        });

        it('should do nothing if intent is not WIX_CODE or console', function () {
            this.fakeWindow.parent = this.fakeWindow;
            this.fakeWindow.postMessage = jasmine.createSpy('postMessage');

            this.logWixCodeConsoleMessage({intent: 'WIX_CODE'});
            this.logWixCodeConsoleMessage({intent: 'WIX_CODE', type: 'sfdgsdfgsd'});
            this.logWixCodeConsoleMessage({type: 'console'});
            this.logWixCodeConsoleMessage({intent: 'sdfhsdf', type: 'console'});
            this.logWixCodeConsoleMessage({});

            expect(this.fakeWindow.postMessage).not.toHaveBeenCalled();
        });

        it('should delegate the message to the parent window', function () {
            var msg = {
                intent: 'WIX_CODE',
                type: 'console'
            };
            this.fakeWindow.parent = jasmine.createSpyObj('parentWindow', ['postMessage']);

            this.logWixCodeConsoleMessage(msg);

            expect(this.fakeWindow.parent.postMessage).toHaveBeenCalledWith(JSON.stringify(msg), '*');
        });

        describe('When logging a string message:', function () {
            it('Should convert string to wix code message with info log level', function () {
                var stringMessage = 'bla';
                var expected = {
                    intent: 'WIX_CODE',
                    type: 'console',
                    data: {
                        logLevel: 'INFO',
                        args: [stringMessage]
                    }
                };
                this.fakeWindow.parent = jasmine.createSpyObj('parentWindow', ['postMessage']);

                this.logWixCodeConsoleMessage(stringMessage);

                expect(this.fakeWindow.parent.postMessage).toHaveBeenCalledWith(JSON.stringify(expected), '*');
            });
        });

        describe('When msg is undefined:', function () {
            it('Should do nothing', function () {
                this.fakeWindow.parent = this.fakeWindow;
                this.fakeWindow.postMessage = jasmine.createSpy('postMessage');

                this.logWixCodeConsoleMessage();

                expect(this.fakeWindow.postMessage).not.toHaveBeenCalled();

            });
        });
    });
});
