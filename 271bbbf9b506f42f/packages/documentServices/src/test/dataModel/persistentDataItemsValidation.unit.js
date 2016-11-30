define(['documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/dataModel/persistentDataItemsValidation'], function (privateServicesHelper, persistentDataItemsValidation) {
    "use strict";

    describe("Persistent DataItems Validation module - ", function () {

        var mockPrivateServices;

        beforeEach(function () {
            mockPrivateServices = privateServicesHelper.mockPrivateServices();
            spyOn(mockPrivateServices.dal, 'get').and.callFake(function (pointer) {
                return {id: pointer.id};
            });
        });

        function isPersistent(dataItemId) {
            var pointer = mockPrivateServices.pointers.data.getDataItem(dataItemId);
            return persistentDataItemsValidation.isDataItemPersistent(mockPrivateServices, pointer);
        }

        it("should return true for specific data items in the list", function () {
            expect(isPersistent('MAIN_MENU')).toBeTruthy();
            expect(isPersistent('CUSTOM_MAIN_MENU')).toBeTruthy();
            expect(isPersistent('CUSTOM_MENUS')).toBeTruthy();
        });

        it("should return false for all other data items", function () {
            expect(isPersistent('FOO')).toBeFalsy();
            expect(isPersistent('BAR')).toBeFalsy();
        });
    });
});