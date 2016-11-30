define(['testUtils', 'lodash', 'tpa/aspects/TPAPixelTrackerAspect'], function(testUtils, _, TPAPixelTrackerAspect) {
    'use strict';

    describe('TPAPixelTrackerAspect', function() {
        var sendRequest;
        var saveSendRequest;
        beforeEach(function() {
            jasmine.clock().install();
            sendRequest = jasmine.createSpy('sendRequest');
            saveSendRequest = TPAPixelTrackerAspect.sendRequest;
            TPAPixelTrackerAspect.sendRequest = sendRequest;
        });

        afterEach(function() {
            TPAPixelTrackerAspect.sendRequest = saveSendRequest;
            jasmine.clock().uninstall();
        });

        it('should send the correct requests', function() {
            var clientSpecMap = {
                11: {},
                12: {
                    pixelUrl: 'http://site12.com/pixel?p1=v1'
                },
                13: {
                    pixelUrl: 'http://site13.com/pixel?p1=v1',
                    installedAtDashboard: true,
                    permissions: {
                        revoke: false
                    },
                    instance: 'instance13'
                },
                14: {
                    pixelUrl: 'http://site14.com/pixel?p1=v1',
                    installedAtDashboard: true,
                    permissions: {
                        revoke: false
                    },
                    instance: 'instance14'
                }
            };

            var pageId = 'page1';
            var onComponentDidMount = null, onPageChange = null;

            var aspectSiteApi = {
                getSiteData: _.constant({
                    getClientSpecMap: _.constant(clientSpecMap)
                }),
                _getPageUrl: function() {
                    return pageId;
                },
                getPageUrl: function() {
                    return this._getPageUrl();
                },
                registerToComponentDidMount: function(callback) {
                    onComponentDidMount = callback;
                },
                registerToUrlPageChange: function(callback) {
                    onPageChange = callback;
                }
            };

            new TPAPixelTrackerAspect(aspectSiteApi); // eslint-disable-line no-new

            onComponentDidMount();

            function expectRequest(site) {
                var regex = new RegExp('^http:\\/\\/site' + site + '\\.com\\/pixel\\?ck=[^&]+&instance=instance' + site + '&p1=v1&page=' + pageId);
                expect(sendRequest.calls.mostRecent().args[0]).toMatch(regex);
            }

            expect(sendRequest.calls.count()).toBe(1);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(2);
            expectRequest(14);

            pageId = 'page2';
            onPageChange();

            expect(sendRequest.calls.count()).toBe(3);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(4);
            expectRequest(14);

            pageId = 'page3';
            onPageChange();

            expect(sendRequest.calls.count()).toBe(5);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(6);
            expectRequest(14);
        });

        it('should send the correct requests', function() {
            var clientSpecMap = {
                11: {},
                12: {
                    pixelUrl: 'http://site12.com/pixel?p1=v1'
                },
                13: {
                    pixelUrl: 'http://site13.com/pixel?p1=v1',
                    installedAtDashboard: true,
                    permissions: {
                        revoke: false
                    },
                    instance: 'instance13'
                },
                14: {
                    pixelUrl: 'http://site14.com/pixel?p1=v1',
                    installedAtDashboard: true,
                    permissions: {
                        revoke: false
                    },
                    instance: 'instance14'
                }
            };

            var pageId = 'page1';
            var onComponentDidMount = null, onPageChange = null;

            var aspectSiteApi = {
                getSiteData: _.constant({
                    getClientSpecMap: _.constant(clientSpecMap)
                }),
                _getPageUrl: function() {
                    return pageId;
                },
                getPageUrl: function() {
                    return this._getPageUrl();
                },
                registerToComponentDidMount: function(callback) {
                    onComponentDidMount = callback;
                },
                registerToUrlPageChange: function(callback) {
                    onPageChange = callback;
                }
            };

            new TPAPixelTrackerAspect(aspectSiteApi); // eslint-disable-line no-new

            onComponentDidMount();

            function expectRequest(site) {
                var regex = new RegExp('^http:\\/\\/site' + site + '\\.com\\/pixel\\?ck=[^&]+&instance=instance' + site + '&p1=v1&page=' + pageId);
                expect(sendRequest.calls.mostRecent().args[0]).toMatch(regex);
            }

            expect(sendRequest.calls.count()).toBe(1);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(2);
            expectRequest(14);

            pageId = 'page2';
            onPageChange();

            expect(sendRequest.calls.count()).toBe(3);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(4);
            expectRequest(14);

            pageId = 'page3';
            onPageChange();

            expect(sendRequest.calls.count()).toBe(5);
            expectRequest(13);
            jasmine.clock().tick(TPAPixelTrackerAspect.CHUNK_INTERVAL);
            expect(sendRequest.calls.count()).toBe(6);
            expectRequest(14);
        });
    });
});
