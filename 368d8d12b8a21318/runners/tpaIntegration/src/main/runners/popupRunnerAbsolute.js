define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'tpaIntegration/driver/TPAPopupDriver', 'jasmine-boot'], function ($, _, driver, TPAPopupDriver) {
    'use strict';

    describe('TPA Popup', function () {
        var compId = 'comp-ig2dxlhi';
        var POPUP_WIDTH = 50;
        var POPUP_HEIGHT = 50;
        var POPUP_OPEN_POSITION_X = 50;
        var POPUP_OPEN_POSITION_Y = 75;
        var MIN_EDGE_SIZE = 50;

        // Drivers
        var absolutePopupDrivers = {};

        // Helper vars
        var appRect = {};

        var midPopupHeight = roundNum(POPUP_HEIGHT / 2);
        var midPopupWidth = roundNum(POPUP_WIDTH / 2);

        // Absolute positions
        var absolutePositionExpectedPlacementResults = {
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

        function getAbsolutePosition(rect){
            return {top : roundNum(rect.top + POPUP_OPEN_POSITION_Y), left: roundNum(rect.left + POPUP_OPEN_POSITION_X)};
        }

        function validateCoords(popupDriver, placement, actualPopupHeight, actualPopupWidth){
            var width = popupDriver.getPopupWidth();
            var height = popupDriver.getPopupHeight();

            var top = popupDriver.getPopupTop();
            var left = popupDriver.getPopupLeft();

            var viewPortWidth = getViewPortWidth();
            var viewPortHeight = getViewPortHeight();

            // If the popup width or height is negative after calculation or the placement is outside the viewport
            // fallback display popup in center
            if (actualPopupHeight < MIN_EDGE_SIZE || actualPopupWidth < MIN_EDGE_SIZE ||
                placement.top < 0 || placement.left < 0 ||
                placement.left > viewPortWidth || placement.top > viewPortHeight) {

                var centerTop = roundNum(viewPortHeight / 2) - midPopupHeight;
                centerTop = centerTop > 0 ? centerTop : 0;

                var centerLeft = roundNum(viewPortWidth / 2) - midPopupWidth;
                centerLeft = centerLeft > 0 ? centerLeft : 0;

                var centerWidth = POPUP_WIDTH < viewPortWidth ? POPUP_WIDTH : viewPortWidth;
                expect(width).toBe(centerWidth);

                var centerHeight = POPUP_HEIGHT < viewPortHeight ? POPUP_HEIGHT : viewPortHeight;
                expect(height).toBe(centerHeight);

                expect(top).toBe(centerTop);
                expect(left).toBe(centerLeft);
            } else {
                expect(width).toBe(actualPopupWidth);
                expect(height).toBe(actualPopupHeight);

                expect(top).toBe(placement.top);
                expect(left).toBe(placement.left);
            }
        }

        function calcPopupAbsolutePlacement(){
            var absolutePosition = getAbsolutePosition(appRect);

            var left = POPUP_WIDTH < absolutePosition.left ? roundNum(absolutePosition.left - POPUP_WIDTH) : 0;

            var topPosition = (absolutePosition.top - POPUP_HEIGHT) < 0 ? 0 : absolutePosition.top - POPUP_HEIGHT;
            var centerMidLeftPosition = roundNum(absolutePosition.left - POPUP_WIDTH / 2);
            var centerMidTopPosition = roundNum(absolutePosition.top - POPUP_HEIGHT / 2);
            var rightLeftPosition = roundNum(absolutePosition.left);
            var bottomTopPosition = roundNum(absolutePosition.top);

            absolutePositionExpectedPlacementResults.TOP_LEFT.top = topPosition;
            absolutePositionExpectedPlacementResults.TOP_LEFT.left = left;

            absolutePositionExpectedPlacementResults.TOP_RIGHT.top = topPosition;
            absolutePositionExpectedPlacementResults.TOP_RIGHT.left = rightLeftPosition;

            absolutePositionExpectedPlacementResults.TOP_CENTER.top = topPosition;
            absolutePositionExpectedPlacementResults.TOP_CENTER.left = centerMidLeftPosition;

            absolutePositionExpectedPlacementResults.BOTTOM_LEFT.top = bottomTopPosition;
            absolutePositionExpectedPlacementResults.BOTTOM_LEFT.left = left;

            absolutePositionExpectedPlacementResults.BOTTOM_RIGHT.top = bottomTopPosition;
            absolutePositionExpectedPlacementResults.BOTTOM_RIGHT.left = rightLeftPosition;

            absolutePositionExpectedPlacementResults.BOTTOM_CENTER.top = bottomTopPosition;
            absolutePositionExpectedPlacementResults.BOTTOM_CENTER.left = centerMidLeftPosition;

            absolutePositionExpectedPlacementResults.CENTER_LEFT.top = centerMidTopPosition;
            absolutePositionExpectedPlacementResults.CENTER_LEFT.left = left;

            absolutePositionExpectedPlacementResults.CENTER_RIGHT.top = centerMidTopPosition;
            absolutePositionExpectedPlacementResults.CENTER_RIGHT.left = rightLeftPosition;

            absolutePositionExpectedPlacementResults.CENTER.top = centerMidTopPosition;
            absolutePositionExpectedPlacementResults.CENTER.left = centerMidLeftPosition;
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

        function calcAbsolutePopupHeight(position){
            var viewPortHeight = getViewPortHeight();
            var absolutePosition = getAbsolutePosition(appRect);

            switch (position) {
                case 'TOP_LEFT':
                case 'TOP_RIGHT':
                case 'TOP_CENTER':
                    return ( absolutePosition.top <= POPUP_HEIGHT ? absolutePosition.top : POPUP_HEIGHT);
                case 'BOTTOM_LEFT':
                case 'BOTTOM_RIGHT':
                case 'BOTTOM_CENTER':
                    var popupSpaceHeight = viewPortHeight - absolutePosition.top;
                    return (popupSpaceHeight <= POPUP_HEIGHT ? popupSpaceHeight : POPUP_HEIGHT);
                default:
                    return (POPUP_HEIGHT < viewPortHeight ? POPUP_HEIGHT : viewPortHeight);
            }
        }

        function calcAbsolutePopupWidth(position){
            var viewPortWidth = getViewPortWidth();
            var absolutePosition = getAbsolutePosition(appRect);

            switch (position) {
                case 'TOP_LEFT':
                case 'CENTER_LEFT':
                case 'BOTTOM_LEFT':
                    return (absolutePosition.left <= POPUP_WIDTH ? roundNum(absolutePosition.left) : POPUP_WIDTH);
                case 'TOP_RIGHT':
                case 'CENTER_RIGHT':
                case 'BOTTOM_RIGHT':
                    var leftPosition = absolutePositionExpectedPlacementResults[position].left;
                    var popupSpaceWidth = viewPortWidth - leftPosition;
                    return (popupSpaceWidth <= POPUP_WIDTH ? popupSpaceWidth : POPUP_WIDTH);
                default:
                    return (POPUP_WIDTH < viewPortWidth ? POPUP_WIDTH : viewPortWidth);
            }
        }

        beforeEach(function () {
            window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        });

        describe('wait for app to load', function(){
            it('should load app', function (done) {
                appRect = driver.getBoundingRect(compId);
                calcPopupAbsolutePlacement();

                driver.appIsAlive(compId)
                    .then(function(){
                        var tpa = $('#' + compId);
                        expect(tpa).toBeDefined();
                        done();
                    });
            });
        });

        // was unstable when running several instances in parallel.
        describe("Test popup absolute positions", function(){
            // Open popup in all absolute positions
            _.forEach(absolutePositionExpectedPlacementResults, function(val, absolutePosition){
                it('should open a popup in absolute place ' + absolutePosition + ' properly', function(done){
                    var absolutePlacement = absolutePositionExpectedPlacementResults[absolutePosition];
                    var position = {origin: 'ABSOLUTE', placement: absolutePosition, x: POPUP_OPEN_POSITION_X, y: POPUP_OPEN_POSITION_Y};

                    openPopup(position, undefined)
                        .then(function(popupDriver){
                            // Save driver for closing it later
                            absolutePopupDrivers[absolutePosition] = popupDriver;

                            expect(popupDriver).toBeDefined();

                            var actualPopupHeight = calcAbsolutePopupHeight(absolutePosition);
                            var actualPopupWidth = calcAbsolutePopupWidth(absolutePosition);

                            validateCoords(popupDriver, absolutePlacement, actualPopupHeight, actualPopupWidth);
                            done();
                        })
                        .catch(function () {
                            expect(false).toBe(true);
                            done();
                        });
                });
            });

            // Close popups that were opened in absolute positions
            _.forEach(absolutePositionExpectedPlacementResults, function(val, absolutePosition){
                it('should close a popup in absolute place ' + absolutePosition + ' properly', function(done) {
                    var id = absolutePopupDrivers[absolutePosition].comp.props.id;
                    var popupEl = $('#' + id);
                    expect(popupEl).toBeDefined();

                    absolutePopupDrivers[absolutePosition].closePopup()
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

            it('should open a popup in absolute place (0,0) when x and y are not forward as parameters ', function(done){
                var position = {origin: 'ABSOLUTE', placement: 'BOTTOM_RIGHT'};
                var absoluteCoords = {top: roundNum(appRect.top), left: roundNum(appRect.left)};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();

                        var top = popupDriver.getPopupTop();
                        var left = popupDriver.getPopupLeft();

                        expect(top).toBe(absoluteCoords.top);
                        expect(left).toBe(absoluteCoords.left);

                        popupDriver.closePopup();
                        done();
                    })
                    .catch(function () {
                        expect(false).toBe(true);
                        done();
                    });

            });

            it('should open a popup in absolute place (0,0) when x is not forward as parameter ', function(done){
                var position = {origin: 'ABSOLUTE', placement: 'BOTTOM_RIGHT', y: 20};
                var absoluteCoords = {top: roundNum(appRect.top) + 20, left: roundNum(appRect.left)};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();

                        var top = popupDriver.getPopupTop();
                        var left = popupDriver.getPopupLeft();

                        expect(top).toBe(absoluteCoords.top);
                        expect(left).toBe(absoluteCoords.left);

                        popupDriver.closePopup();
                        done();
                    })
                    .catch(function () {
                        expect(false).toBe(true);
                        done();
                    });
            });

            it('should open a popup in absolute place (0,0) when y is not forward as parameter ', function(done){
                var position = {origin: 'ABSOLUTE', placement: 'BOTTOM_RIGHT', x: 20};
                var absoluteCoords = {top: roundNum(appRect.top), left: roundNum(appRect.left) + 20};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();

                        var top = popupDriver.getPopupTop();
                        var left = popupDriver.getPopupLeft();

                        expect(top).toBe(absoluteCoords.top);
                        expect(left).toBe(absoluteCoords.left);

                        popupDriver.closePopup();
                        done();
                    })
                    .catch(function () {
                        expect(false).toBe(true);
                        done();
                    });
            });

            it('should open a popup in absolute place outside the widget when negative (x,y) are forward as parameter ', function(done){
                var position = {origin: 'ABSOLUTE', placement: 'BOTTOM_RIGHT', x: -20, y: -30};
                var absoluteCoords = {top: roundNum(appRect.top) - 20 - 10, left: roundNum(appRect.left) - 20};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();

                        var top = popupDriver.getPopupTop();
                        var left = popupDriver.getPopupLeft();

                        expect(top).toBe(absoluteCoords.top);
                        expect(left).toBe(absoluteCoords.left);

                        popupDriver.closePopup();
                        done();
                    })
                    .catch(function () {
                        expect(false).toBe(true);
                        done();
                    });
            });

            it('should set css position absolute to a popup when opened in ABSOLUTE position ', function(done){
                var position = {origin: 'ABSOLUTE', placement: 'BOTTOM_RIGHT', x: 20, y: 30};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();
                        var actualPosition = popupDriver.getPopupPosition();
                        expect(actualPosition, 'absolute');
                        popupDriver.closePopup();
                        done();
                    })
                    .catch(function () {
                        expect(false).toBe(true);
                        done();
                    });
            });
        });
    });
});
