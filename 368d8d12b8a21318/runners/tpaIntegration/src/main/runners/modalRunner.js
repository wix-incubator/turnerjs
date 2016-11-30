define(['zepto', 'lodash', 'bluebird', 'tpaIntegration/driver/driver', 'tpaIntegration/driver/TPAModalDriver', 'jasmine-boot'], function ($, _, Promise, driver, TPAModalDriver) {
    'use strict';

    describe('TPA Modal Tests', function () {
        var MODAL_WIDTH = 200;
        var MODAL_HEIGHT = 184;

        var compId = 'i42k5em5';
        var modalDriver;

        function onClose() {
            window.onCloseWasCalled = true;
        }

        function openModal(onCloseFunction, theme, queryParams) {
            return new Promise(function(resolve) {
                theme = theme || '';
                var modalBaseUrl = driver.getConsoleUrl();
                var modalUrl = queryParams ? modalBaseUrl + '?' + queryParams : modalBaseUrl;
                driver.openModal(compId, modalUrl, MODAL_WIDTH, MODAL_HEIGHT, onCloseFunction, theme).then(function(modalComp) {
                    modalDriver = new TPAModalDriver(modalComp);
                    resolve();
                });
            });
        }

        var queryParams = 'param1=1&param1=2&param2=2';

        beforeEach(function (done) {
            driver.appIsAlive(compId)
                .then(function(){
                    return openModal(onClose, null, queryParams);
                })
                .then(function(){
                    done();
                });
        });

        describe('specific modal tests', function() {

            afterEach(function (done) {
                modalDriver.closeModal()
                    .lastly(function () {
                        done();
                    });
            });

            it('should open a modal properly', function () {
                var width = modalDriver.getModalWidth();
                var height = modalDriver.getModalHeight();

                expect(width).toBe(MODAL_WIDTH);
                expect(height).toBe(MODAL_HEIGHT);
            });

            it('it should keep modal original query params', function () {
                var modalUrl = modalDriver.getModalIframeSrc();

                expect(modalUrl).toContain(driver.getConsoleUrl());
                expect(modalUrl).toContain(queryParams);
            });
        });

        describe('close modal', function(){

            it('should close the modal', function (done) {
                var id = modalDriver.comp.props.id;
                modalDriver.closeModal()
                    .then(function () {
                        // Check that the modal was removed from the DOM
                        var modalEl = $('#' + id);
                        expect(modalEl.length).toEqual(0);
                        done();
                    });
            });

            it('should call onClose callback function', function (done) {
                window.onCloseWasCalled = false;

                modalDriver.closeModal()
                    .then(function () {
                        var id = modalDriver.comp.props.id;
                        var modalEl = $('#' + id);
                        expect(modalEl.length).toEqual(0);

                        return driver.getGlobal(compId, 'onCloseWasCalled', 1000);
                    }).then(function (data) {
                        expect(data).toBeTruthy();
                        done();
                    });
            });
        });

        xdescribe('modal in bare mode', function() {
            beforeEach(function (done) {
                driver.appIsAlive(compId)
                    .then(function(){
                        return openModal(onClose, 'BARE');
                    })
                    .then(function(){
                        done();
                    });
            });

            afterEach(function(done) {
                modalDriver.closeModal()
                    .then(function(){
                        done();
                    });
            });

            it('should open a modal in bare mode properly', function () {
                var width = modalDriver.getModalWidth();
                var height = modalDriver.getModalHeight();

                var frameWrapStyle = modalDriver.comp.getSkinProperties().frameWrap.style;
                var xButtonStyle = modalDriver.comp.getSkinProperties().xButton.style;

                expect(frameWrapStyle.background).toBe('transparent');
                expect(frameWrapStyle.border).toBe('none');
                expect(xButtonStyle.display).toBe('none');

                expect(width).toBe(MODAL_WIDTH);
                expect(height).toBe(MODAL_HEIGHT);
            });
        });

    });

    describe('Full page modal', function() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var modalDriver;

        it('should open modal on full page in case of wix app', function(done) {
            driver.navigateToPage('c6m4');

            driver.waitForDomElement('#hydzjb10_0', 4, 1000, 'couldnt find comp')
                .then(function() {
                    driver.callOpenModalHandler("hydzjb10_0", 'http://sslstatic.wix.com/services/js-sdk/1.61.0/html/modal.html', windowWidth, windowHeight)
                        .then(function(modalComp) {
                            modalDriver = new TPAModalDriver(modalComp);
                            expect(modalDriver.getModalWidth()).toEqual(windowWidth);
                            expect(modalDriver.getModalHeight()).toEqual(windowHeight);
                            driver.closeModal(modalComp.props.id);
                            done();
                        });
                });
        });

        it('should open modal on full page in case of wix app', function(done) {
            driver.navigateToPage('c1ydr');
            var MIN_MARGIN = 50;
            var expectedWidth = windowWidth - MIN_MARGIN;
            var expectedHeight = windowHeight - MIN_MARGIN;

            driver.waitForDomElement('#i0s8a5lj', 4, 1000, 'couldnt find comp')
                .then(function() {
                    driver.callOpenModalHandler("i0s8a5lj", 'http://sslstatic.wix.com/services/js-sdk/1.61.0/html/modal.html', windowWidth, windowHeight)
                        .then(function(modalComp) {
                            modalDriver = new TPAModalDriver(modalComp);
                            expect(modalDriver.getModalWidth()).toEqual(expectedWidth);
                            expect(modalDriver.getModalHeight()).toEqual(expectedHeight);
                            driver.closeModal(modalComp.props.id);
                            done();
                        });
                });

        });
    });
});
