describe("test WDialogManager", function () {

    describe('openNotificationDialog', function () {
        xit("should create new dialog", function () {
            var dialogTest = W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", 'Uh_oh', "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90, null, true, 'ELEMENT_OUT_OF_SITE_GRID', 10);
            expect(dialogTest).toBeDefined();
        });

        xit("should create new dialog", function () {
            var dialogTest2 = W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", null, "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90);
            expect(dialogTest2).toBeDefined();
        });

        it("should be null, because of the absence of the dialog name", function () {
            var dialogTest3 = W.EditorDialogs.openNotificationDialog(null, 'Uh_oh', "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90, null, true, 'ELEMENT_OUT_OF_SITE_GRID', 10);
            expect(dialogTest3).toBe(null);
        });
    });

    xdescribe('_isEqualDialogParams', function () {
        beforeEach(function () {
            var dialog = W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", 'Uh_oh', "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90, null, false, 'ELEMENT_OUT_OF_SITE_GRID', 10);
        });
        it("should check if some dialog params equal to other dialog params", function () {
            var dialogParams = {dialogName:"ElementOutOfGrid", description:"OUT_OF_SITE_GRID_WARNING_TEXT", helpletID:'ELEMENT_OUT_OF_SITE_GRID', notificationWidth:480};
            var isEqual = W.EditorDialogs._isEqualDialogParams(dialogParams, dialogParams);
            expect(isEqual).toBe(true);

            var dialogParams2 = {dialogName:"gagabaga", description:"OUT_OF_SITE_GRID_WARNING_TEXT", helpletID:'ELEMENT_OUT_OF_SITE_GRID', notificationWidth:480};
            var isEqual = W.EditorDialogs._isEqualDialogParams(dialogParams, dialogParams2);
            expect(isEqual).toBe(false);
        });
    });

    xdescribe('_isNotificationDialogCanBeShownAgain', function () {
        beforeEach(function () {
            var dialog = W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", 'Uh_oh', "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90, null, false, 'ELEMENT_OUT_OF_SITE_GRID', 10);
        });
        it("should check if existed dialog can be shown again", function () {
            var showAgain = W.EditorDialogs._isNotificationDialogCanBeShownAgain("ElementOutOfGrid", 10, true);
            expect(showAgain).toBe(false);
            W.EditorDialogs._cleanListOfDialogs();
            var showAgain = W.EditorDialogs._isNotificationDialogCanBeShownAgain("ElementOutOfGrid", 10, true);
            expect(showAgain).toBe(true);
        });
    });

    xdescribe('_isDialogShouldBeShownFromCache', function () {
        beforeEach(function () {
            var dialog = W.EditorDialogs.openNotificationDialog("ElementOutOfGrid", 'Uh_oh', "OUT_OF_SITE_GRID_WARNING_TEXT", 480, 90, null, false, 'ELEMENT_OUT_OF_SITE_GRID', 10);
        });
        it("should check if existed dialog should be shown from cache", function () {
            var dialogParams = {dialogName:"ElementOutOfGrid", description:"OUT_OF_SITE_GRID_WARNING_TEXT", helpletID:'ELEMENT_OUT_OF_SITE_GRID', notificationWidth:480};
            var fromCache = W.EditorDialogs._isDialogShouldBeShownFromCache("ElementOutOfGrid", dialogParams);
            expect(fromCache).toBe(true);
        });

        it("should check if new dialog should not be shown from cache", function () {
            W.EditorDialogs._cleanListOfDialogs();
            var dialogParams = {dialogName:"ElementOutOfGrid", description:"OUT_OF_SITE_GRID_WARNING_TEXT", helpletID:'ELEMENT_OUT_OF_SITE_GRID', notificationWidth:480};
            var fromCache = W.EditorDialogs._isDialogShouldBeShownFromCache("ElementOutOfGrid", dialogParams);
            expect(fromCache).toBe(false);
        });
    });
});