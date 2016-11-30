define([
    'lodash',
    'testUtils',
    'documentServices/wixCode/services/filesDAL',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/services/wixCodeFileCacheService',
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/platform/platform',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, testUtils, filesDAL, wixCodeLifecycleService, wixCodeFileCacheService, pathUtils, platform, privateServicesHelper) {
    'use strict';

    describe('filesDAL', function () {
        describe('update file content', function() {
            function createSiteData() {
                return testUtils.mockFactory.mockSiteData().updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
            }

            function createPrivateServices(siteData) {
                if (!siteData) {
                    siteData = createSiteData();
                }
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {siteData: [{
                    path: ['wixCode'],
                    optional: true
                }]});
                
                pathUtils.initPaths(ps);

                return ps;
            }

            beforeEach(function () {
                spyOn(wixCodeLifecycleService, 'ensureAppIsWriteable').and.callFake(function () {
                    return {
                        then: function (callback) {
                            callback();
                        }
                    };
                });
                spyOn(wixCodeFileCacheService, 'notifyFileModified');
            });

            it('should ensure app is writeable and update DAL with file content', function() {
                var content = 'fake content';
                var fileId = 'fileId';

                var ps = createPrivateServices();

                var pointer = ps.pointers.wixCode.getModifiedFileContent(fileId);

                spyOn(ps.dal, 'set');

                filesDAL.updateFileContent(ps, fileId, content);

                expect(wixCodeLifecycleService.ensureAppIsWriteable).toHaveBeenCalledWith(ps);
                expect(ps.dal.set).toHaveBeenCalledWith(pointer, content);
            });

            it('should update cache service that file has changed', function() {
                var content = 'fake content';
                var fileId = 'fileId';

                var ps = createPrivateServices();

                filesDAL.updateFileContent(ps, fileId, content);

                expect(wixCodeFileCacheService.notifyFileModified).toHaveBeenCalledWith(ps, fileId);
            });

            describe('when the updated file is a page user code', function () {
                it('should update pagesPlatformApps to have wixCode in this page', function () {
                    var siteData = createSiteData();
                    var pageId = siteData.getPrimaryPageId();
                    var ps = createPrivateServices(siteData);
                    platform.init(ps);

                    var fileContent = 'fake content';
                    var fileId = 'public/pages/' + pageId + '.js';

                    filesDAL.updateFileContent(ps, fileId, fileContent);

                    expect(siteData.isPlatformAppOnPage(pageId, 'wixCode')).toBeTruthy();
                });
            });
        });
    });
});
