define(['documentServices/wixapps/utils/timeUtils', 'documentServices/mockPrivateServices/privateServicesHelper'], function (timeUtils, privateServicesHelper) {
    'use strict';

    describe('timeUtils', function () {

        describe('normalizeDate', function () {

            it('should normalize the date according to the server time', function () {
                var appbuilderData = {
                    descriptor: {
                        offsetFromServerTime: 1000
                    }
                };
                var fakePS = privateServicesHelper.mockPrivateServicesWithRealDAL();
                fakePS.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                var now = Date.parse("1970-01-01T00:00:03.000Z");
                var date = timeUtils.normalizeDate(fakePS, now);

                expect(date).toEqual("1970-01-01T00:00:02.000Z");
            });

        });

    });
});
