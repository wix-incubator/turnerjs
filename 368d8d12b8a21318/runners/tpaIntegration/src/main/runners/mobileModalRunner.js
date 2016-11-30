define(['zepto', 'lodash', 'bluebird', 'utils', 'tpaIntegration/driver/driver', 'tpaIntegration/bootstrap/bootstrap', 'tpa/handlers/tpaHandlers', 'jasmine-boot'], function ($, _, Promise, utils, driver, bootstrap, tpaHandlers) {
    'use strict';


    describe('TPA Modal mobile Tests', function () {
        var compId = 'comp-igcduhry';
        var onCloseSpy = jasmine.createSpy();
        var siteAPI = bootstrap.getSiteAPI();

        var openModal = function (msg) {
            var baseMsg = {
                intent: 'TPA2',
                callId: 12,
                type: 'openModal',
                compId: compId,
                deviceType: 'desktop',
                data: {
                    url: 'dead-end',
                    width: 200,
                    height: 184
                }
            };
            tpaHandlers.openModal(siteAPI, _.assign(baseMsg, msg || {}), onCloseSpy);
        };

        var getModalComp = function (uniqueUrlPart) {
            return driver.waitForIframeWithUrlSubstring(uniqueUrlPart);
        };

        var closeWindow = function (uniqueUrlPart) {
            return new Promise(function(resolve, reject){
                getModalComp(uniqueUrlPart)
                    .then(function (comp) {
                        tpaHandlers.closeWindow(siteAPI, {compId: comp.props.id});
                        resolve();
                    })
                    .finally(reject);
            });
        };

        var getUniqueUrl = function () {
            return utils.guidUtils.getUniqueId('uniqueUrl-');
        };

        beforeAll(function (done) {
            driver.waitForDomElement('#' + compId)
                .then(done);
        });

        describe('openModal', function () {
            describe('default theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url
                        }
                    });
                });

                it('should enter fullScreen mode', function () {
                    expect($('body')[0].className).toContain('fullScreenMode');
                });

                it('should show close button', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var styleId = comp.props.styleId;
                            var closeBtn = $('.' + styleId + 'xButton');
                            expect(closeBtn.css('display')).toBe('block');
                            done();
                        });
                });

                it('should cover all the screen', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var $comp = $('#' + comp.props.id + 'dialog');
                            expect($comp.height()).toBe($(window).height());
                            expect($comp.width()).toBe($(window).width());
                            done();
                        });
                });

                it('should be closed when clicking on close button', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var styleId = comp.props.styleId;
                            $('.' + styleId + 'xButton').click();
                            expect($('#' + comp.props.id + 'dialog').length).toBe(0);
                            done();
                        });
                });
            });

            describe('BARE theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url,
                            theme: 'BARE'
                        }
                    });
                });

                it('should enter fullScreen mode', function () {
                    expect($('body')[0].className).toContain('fullScreenMode');
                });

                it('should hide close button', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var styleId = comp.props.styleId;
                            var closeBtn = $('.' + styleId + 'xButton');
                            expect(closeBtn.css('display')).toBe('none');
                            done();
                        });
                });

                it('should cover all the screen', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var $comp = $('#' + comp.props.id + 'dialog');
                            expect($comp.height()).toBe($(window).height());
                            expect($comp.width()).toBe($(window).width());
                            done();
                        });
                });
            });

            describe('LIGHT_BOX theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url,
                            theme: 'LIGHT_BOX'
                        }
                    });
                });

                it('should not be in fullScreen mode', function () {
                    expect($('body')[0].className).not.toContain('fullScreenMode');
                });

                it('should hide site root', function () {
                    var siteRootStyle = $('.SITE_ROOT')[0].style;
                    expect(siteRootStyle.height).toBe('0px');
                    expect(siteRootStyle.overflowY).toBe('hidden');
                });

                //it('should cover all the screen', function (done) {
                //    getModalComp(url)
                //        .then(function (comp) {
                //            var $comp = $('#' + comp.props.id);
                //            // getting wrong height on browserstack from some reason
                //            expect($comp.height()).toBe($(window).height() + $('#WIX_ADS').height());
                //            expect($comp.width()).toBe($(window).width());
                //            done();
                //        });
                //});

                it('should hide close button', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            var styleId = comp.props.styleId;
                            var closeBtn = $('.' + styleId + 'xButton');
                            expect(closeBtn.css('display')).toBe('none');
                            done();
                        });
                });
            });
        });

        describe('closeModal', function () {
            describe('default theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url,
                            theme: 'LIGHT_BOX'
                        }
                    });
                });

                it('should remove dom element', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            closeWindow(url)
                                .then(function () {
                                    expect($('#' + comp.props.id + 'dialog').length).toBe(0);
                                    done();
                                });
                        });
                });

                it('should exit fullScreen mode', function (done) {
                    closeWindow(url)
                        .then(function () {
                            expect($('body')[0].className).not.toContain('fullScreenMode');
                            done();
                        });
                });

                it('should invoke on close callback', function (done) {
                    closeWindow(url)
                        .then(function () {
                            expect(onCloseSpy).toHaveBeenCalled();
                            done();
                        });
                });
            });

            describe('BARE theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url,
                            theme: 'BARE'
                        }
                    });
                });

                it('should remove dom element', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            closeWindow(url)
                                .then(function () {
                                    expect($('#' + comp.props.id + 'dialog').length).toBe(0);
                                    done();
                                });
                        });
                });

                it('should exit fullScreen mode', function (done) {
                    closeWindow(url)
                        .then(function () {
                            expect($('body')[0].className).not.toContain('fullScreenMode');
                            done();
                        });
                });

                it('should invoke on close callback', function (done) {
                    closeWindow(url)
                        .then(function () {
                            expect(onCloseSpy).toHaveBeenCalled();
                            done();
                        });
                });
            });

            describe('LIGHT_BOX theme', function () {
                var url;
                beforeEach(function () {
                    url = getUniqueUrl();
                    openModal({
                        data: {
                            url: url,
                            theme: 'LIGHT_BOX'
                        }
                    });
                });

                it('should remove dom element', function (done) {
                    getModalComp(url)
                        .then(function (comp) {
                            closeWindow(url)
                                .then(function () {
                                    expect($('#' + comp.props.id + 'dialog').length).toBe(0);
                                    done();
                                });
                        });
                });

                it('should unhide site root', function (done) {
                    closeWindow(url)
                        .then(function () {
                            var siteRootStyle = $('.SITE_ROOT')[0].style;
                            expect(siteRootStyle.height).toBe('');
                            expect(siteRootStyle.overflowY).toBe('');
                            done();
                        });

                });

                it('should invoke on close callback', function (done) {
                    closeWindow(url)
                        .then(function () {
                            expect(onCloseSpy).toHaveBeenCalled();
                            done();
                        });
                });
            });
        });
    });
});
