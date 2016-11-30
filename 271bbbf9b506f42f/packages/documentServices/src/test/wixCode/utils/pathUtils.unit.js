define([
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (pathUtils, privateServicesHelper) {

    'use strict';

    describe('wixCode pathUtils', function () {
        it('should create the initial state structure', function() {
            var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
            pathUtils.initPaths(ps);

            validatePointer(ps.pointers.wixCode.getModifiedFileContentMap());

            function validatePointer(pointer) {
                var result = ps.dal.get(pointer);
                expect(result).toEqual({});
            }
        });
    });
});
