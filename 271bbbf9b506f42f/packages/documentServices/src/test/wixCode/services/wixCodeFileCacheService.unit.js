define([
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/wixCode/services/wixCodeFileCacheService'
], function (pathUtils, privateServicesHelper, wixCodeFileCacheService) {
    'use strict';

    describe('wixCodeFileCacheService', function () {
        var ps;

        function getCacheKiller(privateServices, fileId) {
            return privateServices.dal.getByPath(['wixCode', 'fileCacheKillers', fileId]);
        }

        function getDefaultCacheKiller(privateServices) {
            return privateServices.dal.getByPath(['wixCode', 'defaultFileCacheKiller']);
        }

        beforeEach(function() {
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(null, {siteData: [{
                path: ['wixCode'],
                optional: true
            }]});
            pathUtils.initPaths(ps);
            wixCodeFileCacheService.init(ps);
        });

        describe('page code file cacheKiller', function() {
            it('should not be defined initially', function() {
                var fileId = 'public/pages/pageId.js';

                var val = getCacheKiller(ps, fileId);
                expect(val).not.toBeDefined();
            });

            it('should be updated when the file changes', function() {
                var fileId = 'public/pages/pageId.js';

                var valBefore = getCacheKiller(ps, fileId);

                wixCodeFileCacheService.notifyFileModified(ps, fileId);

                var valAfter = getCacheKiller(ps, fileId);

                expect(valAfter).not.toEqual(valBefore);
            });

            it('should not be updated when a different page file changes', function() {
                var fileId = 'public/pages/pageId.js';

                wixCodeFileCacheService.notifyFileModified(ps, fileId);

                var valBefore = getCacheKiller(ps, fileId);
                
                wixCodeFileCacheService.notifyFileModified(ps, 'public/pages/otherPageId.js');

                var valAfter = getCacheKiller(ps, fileId);

                expect(valAfter).toEqual(valBefore);
            });

            it('should be cleared when a top level file changes', function() {
                var fileId = 'public/pages/pageId.js';

                wixCodeFileCacheService.notifyFileModified(ps, fileId);

                var valBefore = getCacheKiller(ps, fileId);

                expect(valBefore).toBeDefined();

                wixCodeFileCacheService.notifyFileModified(ps, 'public/other.js');

                var valAfter = getCacheKiller(ps, fileId);

                expect(valAfter).not.toBeDefined();
            });

            it('should be cleared when "reset" is called', function() {
                var fileId = 'public/pages/pageId.js';

                wixCodeFileCacheService.notifyFileModified(ps, fileId);

                var valBefore = getCacheKiller(ps, fileId);

                expect(valBefore).toBeDefined();

                wixCodeFileCacheService.reset(ps);

                var valAfter = getCacheKiller(ps, fileId);

                expect(valAfter).not.toBeDefined();
            });
        });

        describe('default cacheKiller', function() {
            it('should be defined after init', function() {
                var val = getDefaultCacheKiller(ps);
                expect(val).toBeDefined();
            });

            it('should not be updated when a page file changes', function() {
                var valBefore = getDefaultCacheKiller(ps);

                wixCodeFileCacheService.notifyFileModified(ps, 'public/pages/pageId.js');

                var valAfter = getDefaultCacheKiller(ps);

                expect(valAfter).toEqual(valBefore);
            });

            it('should be updated when a top level file changes', function() {
                var valBefore = getDefaultCacheKiller(ps);

                wixCodeFileCacheService.notifyFileModified(ps, 'public/other.js');

                var valAfter = getDefaultCacheKiller(ps);

                expect(valAfter).not.toEqual(valBefore);
            });

            it('should be updated when "reset" is called', function() {
                var valBefore = getDefaultCacheKiller(ps);

                wixCodeFileCacheService.reset(ps);

                var valAfter = getDefaultCacheKiller(ps);

                expect(valAfter).not.toEqual(valBefore);
            });
        });
    });
});
