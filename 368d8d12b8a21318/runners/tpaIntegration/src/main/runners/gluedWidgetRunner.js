define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'tpaIntegration/driver/TPAGluedWidgetDriver',
    'jasmine-boot'
], function ($, _, driver, GluedWidgetDriver) {
    'use strict';

    describe('TPA Glued Widget', function () {

        var PLACEMENTS = {
            TOP_LEFT:'TOP_LEFT',
            TOP_RIGHT:'TOP_RIGHT',
            BOTTOM_RIGHT:'BOTTOM_RIGHT',
            BOTTOM_LEFT:'BOTTOM_LEFT',
            TOP_CENTER:'TOP_CENTER',
            CENTER_RIGHT:'CENTER_RIGHT',
            BOTTOM_CENTER:'BOTTOM_CENTER',
            CENTER_LEFT:'CENTER_LEFT'
        };

        var widgetPositionFn = {
            top: 'getWidgetTop',
            left: 'getWidgetLeft',
            right: 'getWidgetRight',
            bottom: 'getWidgetBottom'
        };

        var testCases = [
            {
                name: 'top center',
                layout: {
                    placement: PLACEMENTS.TOP_CENTER,
                    horizontalMargin: '1.77',
                    verticalMargin: '0'
                },
                expectedPosition: {
                    top: 26
                }
            },
            {
                name: 'top left',
                layout: {
                    placement: PLACEMENTS.TOP_LEFT,
                    horizontalMargin: '0',
                    verticalMargin: '0'
                },
                expectedPosition: {
                    top: 0,
                    left: 0
                }
            },
            {
                name: 'top right',
                layout: {
                    placement: PLACEMENTS.TOP_RIGHT,
                    horizontalMargin: '0',
                    verticalMargin: '0'
                },
                expectedPosition: {
                    top: 26,
                    right: 0
                }
            },
            {
                name: 'bottom right',
                layout: {
                    placement: PLACEMENTS.BOTTOM_RIGHT,
                    horizontalMargin: '0',
                    verticalMargin: '0'
                },
                expectedPosition: {
                    bottom: 40,
                    right: 0
                }
            },
            {
                name: 'bottom left',
                layout: {
                    placement: PLACEMENTS.BOTTOM_LEFT,
                    horizontalMargin: '0',
                    verticalMargin: '0'
                },
                expectedPosition: {
                    bottom: 40,
                    left: 0
                }
            }
        ];

        var compId = 'i42k5em5';
        var gluedWidgetDriver = new GluedWidgetDriver(compId);

        it('should be in a fixed position', function (done) {
            driver.appIsAlive(compId)
                .then(function(){
                    var tpa = $('#' + compId);
                    var style = gluedWidgetDriver.getWidgetPosition();

                    expect(style).toBe('fixed');
                    expect(tpa).toBeDefined();
                    done();
                });


        });

        _.forEach(testCases, function(testCase) {
            it('should be positioned correctly when the placement is ' + testCase.name, function () {
                gluedWidgetDriver.changePlacement(testCase.layout);

                Object.keys(testCase.expectedPosition).forEach(function(positionKey) {
                    var value = gluedWidgetDriver[widgetPositionFn[positionKey]]();

                    expect(value).toBe(testCase.expectedPosition[positionKey]);
                });

            });
        });

    });
});
