define(['zepto', 'lodash', 'bluebird', 'utils', 'tpaIntegration/driver/driver', 'tpaIntegration/bootstrap/bootstrap', 'tpa/handlers/tpaHandlers', 'jasmine-boot'], function ($, _, Promise, utils, driver, bootstrap, tpaHandlers) {
    'use strict';

    describe('openPopup', function () {
        var compId = 'comp-ihero4qz';
        var onCloseSpy = jasmine.createSpy();
        var siteAPI = bootstrap.getSiteAPI();

        var openPopup = function (msg) {
            var baseMsg = {
                intent: 'TPA2',
                callId: 9,
                type: 'openPopup',
                compId: compId,
                deviceType: 'desktop',
                data: {
                    url: '',
                    position: {
                        origin: 'FIXED',
                        placement: 'CENTER'
                    },
                    theme: 'DEFAULT',
                    width: 50,
                    height: 50,
                    version: '1.60.0'
                }
            };
            tpaHandlers.openPopup(siteAPI, _.defaultsDeep(msg || {}, baseMsg), onCloseSpy);
        };

        var getIframeComp = function (uniqueUrlPart) {
            return driver.waitForIframeWithUrlSubstring(uniqueUrlPart);
        };

        var closeWindow = function (uniqueUrlPart) {
            return new Promise(function(resolve, reject){
                getIframeComp(uniqueUrlPart)
                    .then(function (comp) {
                        tpaHandlers.closeWindow(siteAPI, {compId: comp.props.id});
                        resolve();
                    })
                    .finally(reject);
            });
        };

        var getUniqueUrl = function () {
            return utils.guidUtils.getUniqueId('http://uniqueUrl-');
        };

        beforeAll(function (done) {
            driver.waitForDomElement('#' + compId)
                .then(done);
        });

        describe('openPopup', function () {
            it('should open a new popup from existing one', function (done) {
                var firstUrl = getUniqueUrl();
                var secondUrl = getUniqueUrl();
                var secondPosition = {origin: 'ABSOLUTE', placement: 'TOP_LEFT'};

                openPopup({
                    data: {
                        url: firstUrl
                    }
                });

                getIframeComp(firstUrl)
                    .then(function (firstPopupComp) {
                        openPopup({
                            data: {
                                url: secondUrl,
                                compId: firstPopupComp.props.id,
                                position: secondPosition
                            }
                        });

                        getIframeComp(secondUrl)
                            .then(function (secondPopupComp) {
                                var $iframe = $('#' + secondPopupComp.props.id + 'iframe');
                                expect($iframe.attr('src').indexOf(secondUrl)).toBe(0);
                                expect(firstPopupComp.props.id).not.toEqual(secondPopupComp.props.id);
                                expect(secondPopupComp.props.compData.position).toEqual(secondPosition);
                                done();
                            });
                    });
            });
        });

        describe('closeWindow', function () {
            it('should invoke onClose callback', function (done) {
                var url = getUniqueUrl();
                openPopup({
                    data: {
                        url: url
                    }
                });
                closeWindow(url)
                    .then(function () {
                        expect(onCloseSpy).toHaveBeenCalled();
                        done();
                    });
            });
        });
    });
});
