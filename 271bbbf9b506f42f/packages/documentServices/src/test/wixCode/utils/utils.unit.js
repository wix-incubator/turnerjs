define([
    'immutable',
    'testUtils',
    'documentServices/wixCode/utils/utils'
], function (Immutable, testUtils, utils) {

    'use strict';

    describe('wixCode utils', function () {
        describe('createCodeAppInfo', function () {
            it('should create a codeAppInfo object', function () {
                var baseUrl = 'baseUrl';
                var appId = 'appId';
                var signedInstance = 'signedInstance';
                var scari = 'scari';

                var codeAppInfo = utils.createCodeAppInfo(baseUrl, appId, signedInstance, scari);

                expect(codeAppInfo).toEqual({
                    baseUrl: baseUrl,
                    appId: appId,
                    signedInstance: signedInstance,
                    scari: scari
                });
            });

            it('should throw on invalid parameters', function () {
                var baseUrl = 'baseUrl';
                var appId = 'appId';
                var signedInstance = 'signedInstance';

                function create() {
                    utils.createCodeAppInfo(baseUrl, appId, signedInstance);
                }

                expect(create).toThrowError('Illegal Argument \'scari\' in createCodeAppInfo. \'undefined\' is invalid. Expecting string.');
            });
        });

        describe('extractFromSnapshot', function () {
            var snapshotData, snapshot;

            beforeEach(function () {

                snapshotData = {
                    level1: {
                        level2: {
                            primitive: 'abc'
                        }
                    }
                };

                snapshot = Immutable.fromJS(snapshotData);
            });

            it('should extract a primitive correctly', function () {
                var result = utils.extractFromSnapshot(snapshot, ['level1', 'level2', 'primitive']);

                expect(result).toEqual(snapshotData.level1.level2.primitive);
            });

            it('should extract a compund correctly', function () {
                var result = utils.extractFromSnapshot(snapshot, ['level1', 'level2'], true);

                expect(result).toEqual(snapshotData.level1.level2);
            });
        });
    });
});
