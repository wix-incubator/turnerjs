describe('Unit: dialogWindows service', function () {

    var legacyDialogs;

    var uniqueDialogKey = 0;

    function createDialog(isLegacyDialog, dlgTypeId, modalType) {
        return {
            'key':uniqueDialogKey++,
            'value': {
                options: {
                    modalType: modalType
                },
                isLegacyDialog: isLegacyDialog,
                dlgTypeId: dlgTypeId
            }
        };
    }

    beforeEach(module('dialogs'));

    beforeEach(module(function ($provide) {
        $provide.factory('dialogWindows', function (StackedMap) {
            return {
                open: function () {
                },
                close: function () {
                },
                closeAllDialogs: function () {
                },
                onBackdropClicked: function () {
                },
                __openedDialogs: new StackedMap()
            };
        });
    }));

    beforeEach(inject(function (_legacyDialogs_) {
        legacyDialogs = _legacyDialogs_;
    }));

    describe('Handling legacy dialogs - From legacy editor (DialogManager) to Angular', function () {
        it('should add a legacy dialog to the dialogWindows service when a legacy dialog opens', inject(function (dialogWindows, dialogConsts) {
            var dlgTypeId = 'someDlgTypeId',
                modalType = dialogConsts.TYPES.MODAL;

            legacyDialogs.registerLegacyDialog(dlgTypeId, modalType);

            var expectedDialogInstanceData = createDialog(true, dlgTypeId, modalType);
            expect(dialogWindows.__openedDialogs.top().key).toEqual(expectedDialogInstanceData.key);
            expect(dialogWindows.__openedDialogs.top().value).toEqual(expectedDialogInstanceData.value);
        }));

        it('should remove legacy dialogs from the openedDialogs stack when a legacy dialog closes', inject(function (dialogWindows, dialogConsts) {
            var dlgTypeId = 'someTypeId';
            var legacyDialog = createDialog(true, dlgTypeId, dialogConsts.TYPES.MODAL);
            dialogWindows.__openedDialogs.add(legacyDialog.key, legacyDialog.value);

            legacyDialogs.removeLegacyDialog(dlgTypeId);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
        }));

        it('should handle outside click on legacy dialog', inject(function(dialogWindows) {
            var x = 100,
                y = 200;
            spyOn(dialogWindows, 'onBackdropClicked');

            legacyDialogs.handleOutsideClick(x, y);;

            expect(dialogWindows.onBackdropClicked).toHaveBeenCalledWith(x, y);
        }));
    });


    describe('Handle legacy dialogs - From angular to legacy editor (DialogManager)', function() {
        it('should close legacy dialog when esc or enter keys are pressed', inject(function($rootScope) {
            var args = {
                dlgTypeId: 'dlgTypeId',
                dialogResult: true
            };
            spyOn(W.EditorDialogs, 'closeDialogByTypeId');

            $rootScope.$broadcast('closeDialogOnKeyDown', args);

            expect(W.EditorDialogs.closeDialogByTypeId).toHaveBeenCalledWith(args.dialogResult, args.dlgTypeId);
        }));

        it('should pass a click on the block layer to the DialogManager', inject(function($rootScope) {
            var args = {
                dlgTypeId: 'dlgTypeId',
                x: 100,
                y: 100
            };
            spyOn(W.EditorDialogs, 'closeDialogIfOutsideClick');

            $rootScope.$broadcast('blockLayerClickReachedLegacyDialog', args);

            expect(W.EditorDialogs.closeDialogIfOutsideClick).toHaveBeenCalledWith(args.dlgTypeId, args.x, args.y);
        }));
    });
});