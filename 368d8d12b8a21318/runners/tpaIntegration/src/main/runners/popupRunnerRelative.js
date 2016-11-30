define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'tpaIntegration/driver/TPAPopupDriver', 'jasmine-boot'], function ($, _, driver, TPAPopupDriver) {
    'use strict';

    describe('TPA Popup', function () {
        var compId = 'comp-ig2dxlhi';
        var POPUP_WIDTH = 50;
        var POPUP_HEIGHT = 50;
        var SCROLLBAR_WIDTH = 15;
        var MIN_EDGE_SIZE = 50;

        // Drivers
        var relativePopupDrivers = {};

        // Helper vars
        var appRect = {};

        var midPopupHeight = roundNum(POPUP_HEIGHT / 2);
        var midPopupWidth = roundNum(POPUP_WIDTH / 2);

        // Relative positions
        var relativePositionExpectedPlacementResults = {
            'TOP_LEFT': {},
            'TOP_RIGHT': {},
            'TOP_CENTER': {},

            'BOTTOM_LEFT':{},
            'BOTTOM_RIGHT': {},
            'BOTTOM_CENTER': {},

            'CENTER_RIGHT': {},
            'CENTER_LEFT': {}
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

        function calcPopupRelativePlacement(){
            var left = POPUP_WIDTH < appRect.left ? roundNum(appRect.left - POPUP_WIDTH) : 0;

            var topPosition = (appRect.top - POPUP_HEIGHT) < 0 ? 0 : appRect.top - POPUP_HEIGHT;
            var centerMidLeftPosition = roundNum(appRect.left + appRect.width / 2 - POPUP_WIDTH / 2);
            var centerMidTopPosition = roundNum(appRect.top + appRect.height / 2 - POPUP_HEIGHT / 2);
            var rightLeftPosition = roundNum(appRect.left + appRect.width);
            var bottomTopPosition = roundNum(appRect.top + appRect.height);

            relativePositionExpectedPlacementResults.TOP_LEFT.top = topPosition;
            relativePositionExpectedPlacementResults.TOP_LEFT.left = left;

            relativePositionExpectedPlacementResults.TOP_RIGHT.top = topPosition;
            relativePositionExpectedPlacementResults.TOP_RIGHT.left = rightLeftPosition;

            relativePositionExpectedPlacementResults.TOP_CENTER.top = topPosition;
            relativePositionExpectedPlacementResults.TOP_CENTER.left = centerMidLeftPosition;

            relativePositionExpectedPlacementResults.BOTTOM_LEFT.top = bottomTopPosition;
            relativePositionExpectedPlacementResults.BOTTOM_LEFT.left = left;

            relativePositionExpectedPlacementResults.BOTTOM_RIGHT.top = bottomTopPosition;
            relativePositionExpectedPlacementResults.BOTTOM_RIGHT.left = rightLeftPosition;

            relativePositionExpectedPlacementResults.BOTTOM_CENTER.top = bottomTopPosition;
            relativePositionExpectedPlacementResults.BOTTOM_CENTER.left = centerMidLeftPosition;

            relativePositionExpectedPlacementResults.CENTER_LEFT.top = centerMidTopPosition;
            relativePositionExpectedPlacementResults.CENTER_LEFT.left = left;

            relativePositionExpectedPlacementResults.CENTER_RIGHT.top = centerMidTopPosition;
            relativePositionExpectedPlacementResults.CENTER_RIGHT.left = rightLeftPosition;
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

        function calcPopupHeight(position){
            var viewPortHeight = getViewPortHeight();
            switch (position) {
                case 'TOP_LEFT':
                case 'TOP_RIGHT':
                case 'TOP_CENTER':
                    return (appRect.top <= POPUP_HEIGHT ? appRect.top : POPUP_HEIGHT);
                case 'BOTTOM_LEFT':
                case 'BOTTOM_RIGHT':
                case 'BOTTOM_CENTER':
                    var popupSpaceHeight = viewPortHeight - appRect.top - appRect.height;
                    return (popupSpaceHeight <= POPUP_HEIGHT ? popupSpaceHeight : POPUP_HEIGHT);
                default:
                    return (POPUP_HEIGHT < viewPortHeight ? POPUP_HEIGHT : viewPortHeight);
            }
        }

        function calcPopupWidth(position){
            var viewPortWidth = getViewPortWidth();

            switch (position) {
                case 'TOP_LEFT':
                case 'CENTER_LEFT':
                case 'BOTTOM_LEFT':
                    return (appRect.left <= POPUP_WIDTH ? roundNum(appRect.left) : POPUP_WIDTH);
                case 'TOP_RIGHT':
                case 'CENTER_RIGHT':
                case 'BOTTOM_RIGHT':
                    var leftPosition = relativePositionExpectedPlacementResults[position].left;
                    var popupSpaceWidth = viewPortWidth - leftPosition + SCROLLBAR_WIDTH;
                    return (popupSpaceWidth <= POPUP_WIDTH ? popupSpaceWidth : POPUP_WIDTH);
                default:
                    return (POPUP_WIDTH < viewPortWidth ? POPUP_WIDTH : viewPortWidth);
            }
        }

        describe('wait for app to load', function(){
            it('should load app', function (done) {
                appRect = driver.getBoundingRect(compId);

                calcPopupRelativePlacement();

                driver.appIsAlive(compId)
                    .then(function(){
                        var tpa = $('#' + compId);
                        expect(tpa).toBeDefined();
                        done();
                    });
            });
        });

        describe("Test popup relative positions", function(){
            // Open popup in all relative positions
            _.forEach(relativePositionExpectedPlacementResults, function(val, relativePosition){
                it('should open a popup in relative place ' + relativePosition + ' properly', function(done){
                    var relativePlacement = relativePositionExpectedPlacementResults[relativePosition];
                    var position = {origin: 'RELATIVE', placement: relativePosition};

                    openPopup(position, undefined)
                        .then(function(popupDriver){
                            // Save driver for closing it later
                            relativePopupDrivers[relativePosition] = popupDriver;

                            expect(popupDriver).toBeDefined();

                            var actualPopupHeight = calcPopupHeight(relativePosition);
                            var actualPopupWidth = calcPopupWidth(relativePosition);

                            validateCoords(popupDriver, relativePlacement, actualPopupHeight, actualPopupWidth);
                            done();
                        });
                });
            });

            // Close popups that were opened in relative positions
            _.forEach(relativePositionExpectedPlacementResults, function(val, relativePosition){
                it('should close a popup in relative place ' + relativePosition + ' properly', function(done){
                    var id = relativePopupDrivers[relativePosition].comp.props.id;
                    var popupEl = $('#' + id);
                    expect(popupEl).toBeDefined();

                    relativePopupDrivers[relativePosition].closePopup()
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

            it('should set css position absolute to a popup when opened in RELATIVE position ', function(done){
                var position = {origin: 'RELATIVE', placement: 'BOTTOM_RIGHT'};

                return openPopup(position, undefined)
                    .then(function(popupDriver){
                        expect(popupDriver).toBeDefined();
                        var popupPosition = popupDriver.getPopupPosition();
                        expect(popupPosition, 'absolute');
                        popupDriver.closePopup();
                    })
                    .then(function(){
                        done();
                    });
            });
        });
    });
});
