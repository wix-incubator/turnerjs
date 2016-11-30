define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('set externalId handler', function () {
        it('should set externalId', function (done) {
            var externalId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
            var msg = {
                compId: 'comp-ia3np4fa',
                data: {
                    externalId: externalId
                }
            };
            driver.setExternalId(msg).then(function (response) {
                expect(response).toEqual('ExternalId: ' + externalId + ' will be saved when the site will be saved');
                done();
            });
        });

        it('should set and get externalId', function (done) {
            var externalId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
            var msg = {
                compId: 'comp-ia3np4fa',
                data: {
                    externalId: externalId
                }
            };
            driver.setExternalId(msg).then(function (response) {
                expect(response).toEqual('ExternalId: ' + externalId + ' will be saved when the site will be saved');
                driver.getExternalId(msg.compId).then(function (re) {
                    expect(re).toEqual(externalId);
                    done();
                });
            });
        });


        it('should not set externalId for none valid value', function (done) {
            var externalId = 'hxs0r';
            var msg = {
                compId: 'comp-ia3np4fa',
                data: {
                    externalId: externalId
                }
            };
            driver.setExternalId(msg).then(function (response) {
                expect(response.onError).toEqual('The given externalId: ' + externalId + ' is not a valid UUID.');
                done();
            });
        });
    });
});