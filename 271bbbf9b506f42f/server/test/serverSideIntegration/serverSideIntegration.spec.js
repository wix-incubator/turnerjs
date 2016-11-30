/**
 * Created by avim on 26/10/2016.
 */
'use strict';
define([], function () {
    describe('serverSideIntegration', function () {
        var iframe;
        var postMessagesListener;

        window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

        function openViewer(url, eventListener) {
            iframe = window.document.createElement('iframe');
            iframe.src = 'http://localhost:' + window.globals.KARMA_RENDERER_PORT + '/' + url;
            var body = window.document.getElementsByTagName('body')[0];
            body.appendChild(iframe);
            postMessagesListener = function (ev) {
                if (ev.source === iframe.contentWindow) {
                    eventListener(ev.data);
                }
            };
            window.addEventListener('message', postMessagesListener);
        }

        function tearDownViewer() {
            window.removeEventListener('message', postMessagesListener);
            iframe.parentNode.removeChild(iframe);
        }

        function testRenderSites(done, url, verifyCallback) {
            var didLayout = false;
            var didRender = false;
            function verifySuccess() {
                verifyCallback(didRender, didLayout);
                done();
            }
            openViewer(url, function (msg) {
                if (msg === 'santaDidLayout' && !didLayout) {
                    didLayout = true;
                } else if (msg === 'santaReady' && didLayout) {
                    didRender = true;
                    verifySuccess();
                }
            });
            setTimeout(verifySuccess, 10000);
        }

        describe('render sites', function () {
            afterEach(function () {
                tearDownViewer();
            });
            it('should run on a blank site with server side rendering', function (done) {
                testRenderSites(done, 'render/blank', function (didRender, didLayout) {
                    expect(didLayout).toBeTruthy();
                    expect(didRender).toBeTruthy();
                    expect(iframe.contentWindow.sssr.success).toBeTruthy();
                });
            });
        });

    });
});
