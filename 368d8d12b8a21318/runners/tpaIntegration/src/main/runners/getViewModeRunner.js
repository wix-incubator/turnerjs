define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    describe('getViewMode Tests', function () {
        var compId = 'TPWdgt0-11yp';
        it('should return view mode - site', function (done) {
            driver.appIsAlive(compId)
                .then(function () {
                    var tpa = $('#' + compId);
                    expect(tpa).toBeDefined();
                    driver.getViewMode(compId, function(data) {
                        expect(data.editMode).toEqual('site');
                        done();
                    });

                });
        });
    });
});

