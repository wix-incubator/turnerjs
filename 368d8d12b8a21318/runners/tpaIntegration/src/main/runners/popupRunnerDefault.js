define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'tpaIntegration/driver/TPAPopupDriver', 'jasmine-boot'], function ($, _, driver, TPAPopupDriver) {
    'use strict';

    describe('TPA Popup', function () {
        var compId = 'comp-ig2dxlhi';
        var POPUP_WIDTH = 50;
        var POPUP_HEIGHT = 50;

        // Drivers
        var fixedPopupDrivers = {};


        // Fixed positions
        var fixedPositionExpectedPlacementResults = {
            'TOP_LEFT': {},
            'TOP_RIGHT': {},
            'TOP_CENTER': {},

            'BOTTOM_LEFT':{},
            'BOTTOM_RIGHT': {},
            'BOTTOM_CENTER': {},

            'CENTER_RIGHT': {},
            'CENTER_LEFT': {},
            'CENTER': {}
        };

        // Helper functions
        function roundNum(num) {
            return window.navigator.appName.indexOf("Internet Explorer") !== -1 ? Math.ceil(num) : Math.floor(num);
        }

        function getViewPortWidth(){
            return document.documentElement.clientWidth;
        }

        function getViewPortHeight(){
            return document.documentElement.clientHeight;
        }

        function calcPopupFixedPlacement(){
            var viewPortWidth = getViewPortWidth();
            var viewPortHeight = getViewPortHeight();

            var midHeight = roundNum(viewPortHeight / 2);
            var midWidth = roundNum(viewPortWidth / 2);

            fixedPositionExpectedPlacementResults.TOP_LEFT.top = 0;
            fixedPositionExpectedPlacementResults.TOP_LEFT.left = 0;

            fixedPositionExpectedPlacementResults.TOP_RIGHT.top = 0;
            fixedPositionExpectedPlacementResults.TOP_RIGHT.left = viewPortWidth - POPUP_WIDTH;

            fixedPositionExpectedPlacementResults.TOP_CENTER.top = 0;
            fixedPositionExpectedPlacementResults.TOP_CENTER.left = midWidth - roundNum(POPUP_WIDTH / 2);

            fixedPositionExpectedPlacementResults.BOTTOM_RIGHT.top = viewPortHeight - POPUP_HEIGHT;
            fixedPositionExpectedPlacementResults.BOTTOM_RIGHT.left = viewPortWidth - POPUP_WIDTH;

            fixedPositionExpectedPlacementResults.BOTTOM_LEFT.top = viewPortHeight - POPUP_HEIGHT;
            fixedPositionExpectedPlacementResults.BOTTOM_LEFT.left = 0;

            fixedPositionExpectedPlacementResults.BOTTOM_CENTER.top = viewPortHeight - POPUP_HEIGHT;
            fixedPositionExpectedPlacementResults.BOTTOM_CENTER.left = midWidth - roundNum(POPUP_WIDTH / 2);

            fixedPositionExpectedPlacementResults.CENTER_RIGHT.top = midHeight - roundNum(POPUP_HEIGHT / 2);
            fixedPositionExpectedPlacementResults.CENTER_RIGHT.left = viewPortWidth - POPUP_WIDTH;

            fixedPositionExpectedPlacementResults.CENTER_LEFT.top = midHeight - roundNum(POPUP_HEIGHT / 2);
            fixedPositionExpectedPlacementResults.CENTER_LEFT.left = 0;

            fixedPositionExpectedPlacementResults.CENTER.top = midHeight - roundNum(POPUP_HEIGHT / 2);
            fixedPositionExpectedPlacementResults.CENTER.left = midWidth - roundNum(POPUP_WIDTH / 2);
        }

        function openPopup(position, onClose, url, tpaCompId) {
            var popupUrl = url || driver.getConsoleUrl();
            openPopup.callId = openPopup.callId ? openPopup.callId + 1 : 1;
            popupUrl = _.includes(popupUrl, '?') ? popupUrl + '&callId=' : popupUrl + '?callId=';
            popupUrl += openPopup.callId;
            tpaCompId = tpaCompId || compId;

            return driver.openPopup(tpaCompId, popupUrl, POPUP_WIDTH, POPUP_HEIGHT, position, onClose, openPopup.callId)
                .then(function onSuccess(popupComp){
                    driver.log('Popup opened!');

                    var popupDriver = new TPAPopupDriver(popupComp);
                    return popupDriver;
                },
                function onError(err) {
                    driver.log('Error while opening popup');
                    throw err;
                });
        }

        describe('wait for app to load', function(){
            it('should load app', function (done) {
                calcPopupFixedPlacement();

                driver.appIsAlive(compId)
                    .then(function(){
                        var tpa = $('#' + compId);
                        expect(tpa).toBeDefined();
                        done();
                    });
            });
        });

        describe("Test popup default positions", function() {
            // Open popup in all fixed positions
            _.forEach(fixedPositionExpectedPlacementResults, function(val, fixedPosition){
                it('should open a popup in place ' + fixedPosition + ' properly', function(done){
                    var fixedPlacement = fixedPositionExpectedPlacementResults[fixedPosition];
                    var position = {origin: 'DEFAULT', placement: fixedPosition};

                    openPopup(position, undefined)
                        .then(function(popupDriver){
                            // Save driver for closing it later
                            fixedPopupDrivers[fixedPosition] = popupDriver;

                            expect(popupDriver).toBeDefined();

                            var width = popupDriver.getPopupWidth();
                            var height = popupDriver.getPopupHeight();

                            expect(width).toBe(POPUP_WIDTH);
                            expect(height).toBe(POPUP_HEIGHT);

                            var top = popupDriver.getPopupTop();
                            var left = popupDriver.getPopupLeft();

                            expect(top).toBe(fixedPlacement.top);
                            expect(left).toBe(fixedPlacement.left);
                            done();
                        });
                });
            });

            // Close popups that were opened in fixed positions
            _.forEach(fixedPositionExpectedPlacementResults, function(val, fixedPosition) {
                it('should close a popup in fixed place ' + fixedPosition + ' properly', function(done){
                    var id = fixedPopupDrivers[fixedPosition].comp.props.id;
                    var popupEl = $('#' + id);

                    expect(popupEl).toBeDefined();

                    fixedPopupDrivers[fixedPosition].closePopup()
                        .then(function(){
                            popupEl = $('#' + id);
                            expect(popupEl[0].style.display).toBe('none');
                            expect($(popupEl, 'iframe').attr('src')).toBe(null);
                            done();
                        })
                        .catch(function () {
                            popupEl = $('#' + id);
                            expect(popupEl[0].style.display).toBe('none');
                            expect($(popupEl, 'iframe').attr('src')).toBe(null);
                            done();
                        });
                });
            });
        });
    });
});
