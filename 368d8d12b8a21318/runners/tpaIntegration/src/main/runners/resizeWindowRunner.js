define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'tpaIntegration/driver/TPAGluedWidgetDriver',
    'tpaIntegration/driver/TPAPopupDriver',
    'tpaIntegration/driver/TPAModalDriver',
    'jasmine-boot'
], function ($, _, driver, GluedWidgetDriver, TPAPopupDriver, TPAModalDriver) {
    'use strict';
    var compId = 'i42nntlu';
    var GIVEN_WIDTH = 200;
    var GIVEN_HEIGHT = 200;

    var EXPECTED_WIDTH = 400;
    var EXPECTED_HEIGHT = 400;

    function openPopup(position, onClose) {
        return driver.openPopupHandler(compId, driver.getConsoleUrl(), GIVEN_WIDTH, GIVEN_HEIGHT, position, onClose)
            .then(function onSuccess(popupComp){
                driver.log('Popup opened!');

                var popupDriver = new TPAPopupDriver(popupComp);
                return popupDriver;
            },
            function onError(err) {
                driver.log('Error while opening popup');
                throw (err);
            });
    }

    function openModal(onClose, theme) {
        theme = theme || '';
        return driver.openModal(compId, driver.getConsoleUrl(), GIVEN_WIDTH, GIVEN_HEIGHT, onClose, theme).then(function(modalComp) {
            var modalDriver = new TPAModalDriver(modalComp);
            return modalDriver;
        });
    }


    describe('resizeWindow Tests', function () {
        var gluedWidgetDriver;

        describe('Glued Widget resize', function() {

            it('should load app', function (done) {
                driver.appIsAlive(compId)
                    .then(function(){
                        var tpa = $('#' + compId);
                        expect(tpa).toBeDefined();
                        done();
                    });
            });

            it('should resize window', function (done) {
                gluedWidgetDriver = new GluedWidgetDriver(compId);
                expect(gluedWidgetDriver.getWidgetWidth()).toBe("200px");
                driver.resizeWindow(compId, EXPECTED_WIDTH, EXPECTED_HEIGHT).then(function() {
                    expect(gluedWidgetDriver.getWidgetWidth()).toBe(EXPECTED_WIDTH + "px");
                    done();
                });
            });

            it('should resize window to 0x0', function (done) {
                gluedWidgetDriver = new GluedWidgetDriver(compId);
                driver.resizeWindow(compId, 0, 0).then(function() {
                    expect(gluedWidgetDriver.getWidgetWidth()).toBe("0px");
                    done();
                });
            });
        });

        describe('Popup resize', function() {

            it('should resize window', function (done) {

                var position = {origin: 'FIXED', placement: 'TOP_CENTER'};

                openPopup(position).then(function(popupDriver) {

                    expect(popupDriver).toBeDefined();

                    var width = popupDriver.getPopupWidth();
                    var height = popupDriver.getPopupHeight();

                    expect(width).toBe(GIVEN_WIDTH);
                    expect(height).toBe(GIVEN_HEIGHT);

                    popupDriver.resizeWindow(EXPECTED_WIDTH, EXPECTED_HEIGHT).then(function() {

                        width = popupDriver.getPopupWidth();
                        height = popupDriver.getPopupHeight();

                        expect(width).toBe(EXPECTED_WIDTH);
                        expect(height).toBe(EXPECTED_HEIGHT);


                        done();
                    });
                });
            });
        });

        describe('Popup % resize', function() {
            it('should resize window with %', function (done) {

                var position = {origin: 'FIXED', placement: 'TOP_CENTER'};

                openPopup(position).then(function(popupDriver) {

                    expect(popupDriver).toBeDefined();

                    var width = popupDriver.getPopupWidth();
                    var height = popupDriver.getPopupHeight();

                    expect(width).toBe(GIVEN_WIDTH);
                    expect(height).toBe(GIVEN_HEIGHT);

                    var _width = '100%';
                    var _height = '100%';

                    popupDriver.resizeWindow(_width, _height).then(function() {

                        var popupEl = popupDriver.getPopupDOMNode();

                        expect(popupEl.style.width).toBe('100%');
                        expect(popupEl.style.height).toBe('100%');
                        done();

                    });
                });
            });
        });

        describe('Modal resize', function() {

            it('should resize window', function(done) {

                openModal().then(function(modalDriver) {

                    var width = modalDriver.getModalWidth();
                    var height = modalDriver.getModalHeight();

                    expect(width).toBe(GIVEN_WIDTH);
                    expect(height).toBe(GIVEN_HEIGHT);

                    modalDriver.resizeWindow(EXPECTED_WIDTH, EXPECTED_HEIGHT).then(function() {

                        width = modalDriver.getModalWidth();
                        height = modalDriver.getModalHeight();

                        expect(width).toBe(EXPECTED_WIDTH);
                        expect(height).toBe(EXPECTED_HEIGHT);

                        done();
                    });
                });
            });
        });
    });
});
