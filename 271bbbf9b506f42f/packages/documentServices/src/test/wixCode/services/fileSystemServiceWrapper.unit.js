define([
    'lodash',
    'bluebird',
    'testUtils',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/services/wixCodeFileCacheService',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/wixCode/services/saveService',
    'definition!documentServices/wixCode/services/fileSystemServiceWrapper',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/wixCode/utils/constants',
    'documentServices/wixCode/utils/utils',
    'documentServices/siteMetadata/clientSpecMap'
], function (_, Promise, testUtils, wixCodeLifecycleService, wixCodeFileCacheService, wixCodeModelService, saveService, fileSystemServiceWrapperDef, privateServicesHelper, constants, utils, clientSpecMap) {

    'use strict';

    var READ_FUNCTIONS = [
        'getRoots',
        'getChildren',
        'getMetadata',
        'readFile',
        'read',
        'getVirtualDescriptor'
    ];
    var WRITE_FUNCTIONS = [
        'createFolder',
        'createFile',
        'create',
        'deleteItem',
        'copy',
        'move',
        'writeFile'
    ];

    describe('file system service wrapper', function () {
        describe('should proxy a file system function correctly:', function () {
            var wixCodeSavedClientSpec = {
                appDefinitionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                applicationId: 14,
                extensionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                instance: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
                instanceId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                signature: '02baa083df8d4f720a36e8c9ed450f7612a690a4.eyJjb2RlQXBwSWQiOiI2MzhkODcwMS0xYjkyLTQxMzctYTZiOC1kNzZkYzM3MWFiYjkiLCJpbnN0YW5jZUlkIjoiYWViOGVhOGEtZWEzNy00ZTY2LWE1MzgtZWZiZTVlOGQzZjEwIiwiY29ycmVsYXRpb25JZCI6ImU4NmU0NmEyLTc5YzUtNDdlNS05OTIwLTQ2ZWRkNTE2ZmNiMCIsInNlc3Npb25VSWQiOiIxYWM3ZDlhNy1iYmE0LTQ2MGMtOWQxZC1iM2M3NzUwMzU0MzQiLCJzaWduRGF0ZSI6MTQ3NDM1NzkyMjQwMn0=',
                type: 'siteextension'
            };

            function setupAndExecute(fsFunctionName, testFunctionToRun) {
                var customClientSpecMap = {
                    14: wixCodeSavedClientSpec
                };
                var siteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap(customClientSpecMap);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                spyOn(wixCodeLifecycleService, 'ensureAppIsWriteable');
                spyOn(wixCodeFileCacheService, 'reset');
                spyOn(saveService, 'save').and.returnValue(Promise.resolve());

                var fileSystemServiceMock = jasmine.createSpyObj('fileSystemServiceMock', [fsFunctionName]);
                var fileSystemServiceWrapper = fileSystemServiceWrapperDef(_, wixCodeLifecycleService, wixCodeFileCacheService, wixCodeModelService, saveService, fileSystemServiceMock, utils, constants, clientSpecMap);

                testFunctionToRun(ps, fileSystemServiceWrapper, fileSystemServiceMock);
            }

            function getWixCodeServiceUrl(ps) {
                var pointer = ps.pointers.general.getServiceTopology();
                return ps.dal.get(ps.pointers.getInnerPointer(pointer, constants.WIX_CODE_IDE_SERVER_URL_KEY));
            }

            function createExpectedArgs(ps, originalFsCallArgs) {
                var expectedCodeAppInfo = utils.createCodeAppInfo(
                    getWixCodeServiceUrl(ps),
                    wixCodeModelService.getGridAppId(ps),
                    wixCodeSavedClientSpec.signature,
                    wixCodeModelService.getScari(ps)
                );
                return [expectedCodeAppInfo].concat(originalFsCallArgs);
            }

            _.forEach(READ_FUNCTIONS, function(fsFunctionName) {
                it(fsFunctionName, function(done) {
                    setupAndExecute(fsFunctionName, function(ps, fileSystemServiceWrapper, fileSystemServiceMock) {
                        fileSystemServiceWrapper[fsFunctionName](ps, 'param1', 'param2');

                        expect(wixCodeLifecycleService.ensureAppIsWriteable).not.toHaveBeenCalled();

                        expect(fileSystemServiceMock[fsFunctionName]).toHaveBeenCalled();

                        var expectedArgs = createExpectedArgs(ps, ['param1', 'param2']);
                        expect(fileSystemServiceMock[fsFunctionName].calls.argsFor(0)).toEqual(expectedArgs);

                        done();
                    });
                });
            });

            _.forEach(WRITE_FUNCTIONS, function(fsFunctionName) {
                it(fsFunctionName + ' - when ensureAppIsWriteable succeeds', function(done) {
                    setupAndExecute(fsFunctionName, function(ps, fileSystemServiceWrapper, fileSystemServiceMock) {
                        wixCodeLifecycleService.ensureAppIsWriteable.and.returnValue(Promise.resolve());

                        fileSystemServiceWrapper[fsFunctionName](ps, 'param1', 'param2').then(function() {
                            expect(wixCodeLifecycleService.ensureAppIsWriteable).toHaveBeenCalled();
                            expect(saveService.save).toHaveBeenCalled();
                            expect(wixCodeFileCacheService.reset).toHaveBeenCalled();

                            expect(fileSystemServiceMock[fsFunctionName]).toHaveBeenCalled();

                            var expectedArgs = createExpectedArgs(ps, ['param1', 'param2']);
                            expect(fileSystemServiceMock[fsFunctionName].calls.argsFor(0)).toEqual(expectedArgs);

                            done();
                        });
                    });
                });

                it(fsFunctionName + ' - when ensureAppIsWriteable fails', function(done) {
                    setupAndExecute(fsFunctionName, function(ps, fileSystemServiceWrapper, fileSystemServiceMock) {
                        wixCodeLifecycleService.ensureAppIsWriteable.and.returnValue(Promise.reject(new Error('fake error for test')));

                        fileSystemServiceWrapper[fsFunctionName](ps, 'param1', 'param2').catch(function() {
                            expect(saveService.save).not.toHaveBeenCalled();
                            expect(fileSystemServiceMock[fsFunctionName]).not.toHaveBeenCalled();
                            done();
                        });
                    });
                });
            });
        });
    });
});
