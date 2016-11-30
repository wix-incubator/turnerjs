describe('Unit: ColorDialog service', function () {

    var colorDialog;

    beforeEach(module('dialogs'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);

        $provide.factory('dialogService', TestsUtils.mocks.dialogService);
    }));

    beforeEach(inject(function (_colorDialog_) {
        colorDialog = _colorDialog_;
    }));

    describe('opening dialogs', function () {

        beforeEach(inject(function (dialogService) {
            spyOn(dialogService, 'open');
        }));

        describe('opacity', function () {
            it('Should call dialogService.open with the correct params and dialog name', inject(function (dialogService) {
                colorDialog.openOpacityDialog();

                expect(dialogService.open).toHaveBeenCalled();
            }));
        });

        describe('colorSelector', function () {
            it('Should call dialogService.open with the correct dialog name', inject(function (dialogService) {
                colorDialog.openColorSelectorDialog();

                expect(dialogService.open).toHaveBeenCalled();
                expect(dialogService.open.calls.argsFor(0)[0]).toEqual('ColorSelector');
            }));

            it('Should call dialogService.open with options containing selected color and callback', inject(function (dialogService) {
                var mockCallback = function () {
                };
                var element = 'someElement';
                colorDialog.openColorSelectorDialog(element, 'selected', 'selectedSource', mockCallback);
                var optionsArgument = dialogService.open.calls.argsFor(0)[1];

                expect(optionsArgument.onCloseCallback).toEqual(mockCallback);
                expect(optionsArgument.context.selectedColor).toEqual('selected');
                expect(optionsArgument.element).toEqual('someElement');
            }));
        });


    });

});