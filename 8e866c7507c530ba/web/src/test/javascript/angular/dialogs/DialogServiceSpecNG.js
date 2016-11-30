describe('Unit: dialogService', function () {

    var dialogService;
    var dialogConsts;
    var dialogWindows;

    beforeEach(module('dialogs'));
    beforeEach(module(function ($provide) {
        $provide.factory('dialogWindows', TestsUtils.mocks.dialogWindows);
    }));

    beforeEach(inject(function (_dialogService_, _dialogWindows_, _dialogConsts_) {
        dialogWindows = _dialogWindows_;
        dialogService = _dialogService_;
        dialogConsts = _dialogConsts_;
    }));

    describe('Open method', function() {
        it('should return a dialogInstance object with a unique dialogId', function() {
            var dlg1 = dialogService.open('someType');
            var dlg2 = dialogService.open('someType');

            expect(dlg1.dialogId).toBeDefined();
            expect(dlg1.dialogId).not.toEqual(dlg2.dialogId);
        });

        it('should throw an error if dialog type id isn\'t sent', function() {
            expect(dialogService.open).toThrow(new Error('Parameter `dlgTypeId` must be a string'));
        });

        it('Should invoke dialogWindows.open', function() {
            spyOn(dialogWindows, 'open');

            dialogService.open('someType');

            expect(dialogWindows.open).toHaveBeenCalled();
        });

        it('Should create a dialogInstanceData object, containing the dialog options, scope and type Id', function() {
            var actualInstanceData;
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualInstanceData = dialogInstanceData;
            });

            dialogService.open('someType');

            expect(actualInstanceData.scope).toBeDefined();
            expect(actualInstanceData.dlgTypeId).toEqual('someType');
            expect(actualInstanceData.options).toBeDefined();
        });

        it('should set default options in dialogInstanceData.options', function() {
            var actualOptions;
            var expectedOptions = {
                singleInstance: true,
                contentPadding: "1px 11px 0",
                position: dialogConsts.POSITION.CENTER,
                level: 0,
                modalType: dialogConsts.TYPES.MODAL,
                draggable: true,
                dragHandleClass: 'wix-dialog-titlebar',
                backdrop: true
            };
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualOptions = dialogInstanceData.options;
            });

            dialogService.open('someType');

            expect(actualOptions).toEqual(expectedOptions);
        });

        it('should set the backdrop option to true if modalType=modal', function() {
            var actualOptions;
            var opts = {
                modalType: dialogConsts.TYPES.MODAL
            };
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualOptions = dialogInstanceData.options;
            });

            dialogService.open('someType', opts);

            expect(actualOptions.backdrop).toEqual(true);
        });

        it('should set the backdrop option to false if modalType!=modal', function() {
            var actualOptions;
            var opts = {
                modalType: dialogConsts.TYPES.SEMI_MODAL
            };
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualOptions = dialogInstanceData.options;
            });

            dialogService.open('someType', opts);

            expect(actualOptions.backdrop).toEqual(false);
        });

        it('should leave the backdrop option as is if it is defined', function() {
            var actualOptions;
            var opts = {
                modalType: dialogConsts.TYPES.MODAL,
                backdrop: false
            };
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualOptions = dialogInstanceData.options;
            });

            dialogService.open('someType', opts);

            expect(actualOptions.backdrop).toEqual(false);
        });

        it('should create a scope with options.context object', function() {
            var actualDialogInstance;
            var opts = {
                context: {
                    a: 1
                }
            };
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualDialogInstance = dialogInstanceData;
            });

            dialogService.open('someType', opts);

            expect(actualDialogInstance.scope.context).toBe(opts.context);
        });

        it('should create a scope with an empty context object if options.context is undefined', function() {
            var actualDialogInstance;
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualDialogInstance = dialogInstanceData;
            });

            dialogService.open('someType');

            expect(actualDialogInstance.scope.context).toEqual({});
        });

        it('Should put the options object on the scope', function() {
            var actualDialogInstance;
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualDialogInstance = dialogInstanceData;
            });

            dialogService.open('someType');

            expect(actualDialogInstance.scope._options).toBe(actualDialogInstance.options);
        });

        it('should create a dialog object on the scope to serve as the inner dialog API', function() {
            var actualDialogInstance;
            spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, dialogInstanceData) {
                actualDialogInstance = dialogInstanceData;
            });

            dialogService.open('someType');

            expect(typeof(actualDialogInstance.scope.dialog)).toBeDefined();
        });
    });

    describe('Open method - Inner Dialog API', function() {

        describe('dialog.close method', function() {

            it('should call dialogWindows.close with the dialogInstance, result and closing reason', function() {
                var dialogInstanceData;
                spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, _dialogInstanceData) {
                    dialogInstanceData = _dialogInstanceData;
                });
                spyOn(dialogWindows, 'close');

                var dlg = dialogService.open('someType');

                dialogInstanceData.scope.dialog.close(true, 'someReason');

                expect(dialogWindows.close).toHaveBeenCalledWith(dlg, true, 'someReason');
            });
        });

        describe('dialog api setters', function() {
            it('should change the title option on the scope using a safeApply when dialog.setTitle is called', function() {
                var dialogInstanceData;
                spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, _dialogInstanceData) {
                    dialogInstanceData = _dialogInstanceData;
                    spyOn(dialogInstanceData.scope, 'safeApply').and.callThrough();
                });
                var dlg = dialogService.open('someType', { title: 'old title' });

                dialogInstanceData.scope.dialog.setTitle('new title');

                expect(dialogInstanceData.scope.safeApply).toHaveBeenCalled();
                expect(dialogInstanceData.scope._options.title).toEqual('new title');
            });

            it('should change the descriptionText option on the scope using a safeApply when dialog.descriptionText is called', function() {
                var dialogInstanceData;
                spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, _dialogInstanceData) {
                    dialogInstanceData = _dialogInstanceData;
                    spyOn(dialogInstanceData.scope, 'safeApply').and.callThrough();
                });
                var dlg = dialogService.open('someType', { descriptionText: 'old desc' });

                dialogInstanceData.scope.dialog.setDescription('new desc');

                expect(dialogInstanceData.scope.safeApply).toHaveBeenCalled();
                expect(dialogInstanceData.scope._options.descriptionText).toEqual('new desc');
            });

            it('should change the helpId option on the scope using a safeApply when dialog.setHelpId is called', function() {
                var dialogInstanceData;
                spyOn(dialogWindows, 'open').and.callFake(function(dialogInstance, _dialogInstanceData) {
                    dialogInstanceData = _dialogInstanceData;
                    spyOn(dialogInstanceData.scope, 'safeApply').and.callThrough();
                });
                var dlg = dialogService.open('someType', { helpId: 'old helpId' });

                dialogInstanceData.scope.dialog.setHelpId('new helpId');

                expect(dialogInstanceData.scope.safeApply).toHaveBeenCalled();
                expect(dialogInstanceData.scope._options.helpId).toEqual('new helpId');
            });
        });
    });
});