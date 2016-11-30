define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    // http://mayah4.wix.com/publicdataintsite
    describe('public data runner Tests', function () {
        describe('get', function() {

            var expectedCompData = {
                compKey2 : {
                    key1: 'val',
                    key2: 'val2'
                }
            };

            var expectedAppData2 = {
                compApp: {
                    keyApp1: 'val',
                    keyApp2: 'val2'
                }
            };

            var expectedAppData = {
                compKey3: {
                    keyApp1: 'val',
                    keyApp2: 'val2'
                }
            };

            var expectedMultiData = {
                compApp: expectedAppData2.compApp,
                compKey3: expectedAppData.compKey3
            };

            var createErrorObj = function(key, scope) {
                return {
                    error: {
                        message: 'key ' + key + ' not found in ' + scope + ' scope'
                    }
                };
            };

            var compId1 = 'comp-ij2z3lbu';
            var compId2 = 'comp-ij2z2z2n';

            beforeAll(function (done) {
                driver.waitForDomElement('#' + compId1)
                    .then(done);
            });


            describe('COMPONENT scope', function() {
                it('should return value from component scope', function (done) {
                    driver.getValue(compId1, 'compKey2', 'COMPONENT', function(value) {
                        expect(value).toEqual(expectedCompData);
                        done();
                    });
                });

                it('should return values from component scope', function (done) {
                    driver.getValue(compId1, 'compKey2', 'COMPONENT', function(value) {
                        expect(value).toEqual(expectedCompData);
                        done();
                    });
                });

                it('should not return value from component scope if key was set in other comp', function (done) {
                    driver.getValue(compId1, 'compKey1', 'COMPONENT', function(value) {
                        var error = createErrorObj('compKey1', 'COMPONENT');
                        expect(value).toEqual(error);
                        done();
                    });
                });
            });

            describe('APP scope', function() {
                it('should return value in comp 1', function (done) {
                    driver.getValue(compId2, 'compApp', 'APP', function(value) {
                        expect(value).toEqual(expectedAppData2);
                        done();
                    });
                });

                it('should get multi key', function(done) {
                    driver.getValues(compId2, ['compApp', 'compKey3'], 'APP', function(value) {
                        expect(value).toEqual(expectedMultiData);
                        done();
                    });
                });

                it('should return value in comp 2', function (done) {
                    driver.getValue(compId1, 'compApp', 'APP', function(value) {
                        expect(value).toEqual(expectedAppData2);
                        done();
                    });
                });

                it('should get multi key', function(done) {
                    driver.getValues(compId1, ['compApp', 'compKey3'], 'APP', function(value) {
                        expect(value).toEqual(expectedMultiData);
                        done();
                    });
                });
            });
        });
    });
});
