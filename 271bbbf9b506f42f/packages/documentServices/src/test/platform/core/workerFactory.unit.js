define([
    'lodash',
    'utils',
    'documentServices/platform/core/workerFactory',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, utils, workerFactory, privateServicesHelper) {
    'use strict';

    describe('workerFactory', function () {

        describe('createWorkerIframe', function () {

            beforeEach(function () {
                this.iframe = window.document.createElement('iframe');
                this.handler = jasmine.createSpy('handler');
                spyOn(window, 'addEventListener');
                spyOn(window.document, 'createElement').and.returnValue(this.iframe);
                spyOn(window.document.body, 'appendChild');
            });

            it('should create an iframe element with worker wrapped html', function () {
                workerFactory.createWorkerIframe('id', 'html-location', this.handler);
                expect(window.document.createElement).toHaveBeenCalledWith('iframe');
                expect(this.iframe.id).toEqual('id');
                expect(window.document.body.appendChild).toHaveBeenCalledWith(this.iframe);
            });

            it('should add event listener onload with the given handler', function () {
                workerFactory.createWorkerIframe('id', 'html-location', this.handler);
                this.iframe.onload();
                expect(window.addEventListener).toHaveBeenCalledWith('message', this.handler);
            });
        });

        describe('getAppsContainerUrl', function () {
            var mockPs;
            var santaLocation = 'http://static.parastorage.com/services/santa/103.0.0';
            beforeEach(function () {
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL();
                var serviceTopologyPointer = mockPs.pointers.general.getServiceTopology();
                var scriptsLocationPointer = mockPs.pointers.getInnerPointer(serviceTopologyPointer, ['scriptsLocationMap']);
                mockPs.dal.set(scriptsLocationPointer, {'santa': santaLocation});
                mockPs.siteAPI.hasDebugQueryParam = jasmine.createSpy('hasDebugQueryParam').and.returnValue(false);
            });

            it('should get santa static location from service topology and append the platform path to it', function () {
                var url = workerFactory.getAppsContainerUrl(mockPs);
                expect(url).toEqual(santaLocation + '/static/platform/target/index.html');
            });

            it('should get debugged version if has debug parameter', function () {
                mockPs.siteAPI.hasDebugQueryParam.and.returnValue(true);
                var url = workerFactory.getAppsContainerUrl(mockPs);
                expect(_.endsWith(url, '.debug.html')).toBe(true);
            });

            it('should get frame version from urlif one is given', function () {
                spyOn(mockPs.dal, 'getByPath').and.returnValue('iframeVersion:1.1604.0');
                var url = workerFactory.getAppsContainerUrl(mockPs);
                expect(url).toEqual('http://static.parastorage.com/services/santa/1.1604.0' + '/static/platform/target/index.html');
            });

            it('should get the ReactSource version if it was set in the url', function () {
                var reactSource = '1.1880.0';
                spyOn(utils.urlUtils, 'parseUrlParams').and.callFake(function () {
                    return {ReactSource: reactSource};
                });
                var url = workerFactory.getAppsContainerUrl(mockPs);
                expect(url).toEqual('http://static.parastorage.com/services/santa/' + reactSource + '/static/platform/target/index.html');
            });
        });
    });
});
