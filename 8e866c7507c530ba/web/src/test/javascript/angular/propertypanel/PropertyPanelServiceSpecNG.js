describe('Unit: propertyPanel service', function () {
    'use strict';

    var propertyPanel, dialogService;
    var _$rootScope;

    beforeEach(module('propertyPanel', function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
    }));

    beforeEach(inject(function ($rootScope, _propertyPanel_, _dialogService_) {
        _$rootScope = $rootScope;
        propertyPanel = _propertyPanel_;
        dialogService = _dialogService_;

        spyOn(dialogService, 'open').and.returnValue('mockDialogInstance');
    }));

    describe('On OpenPropertyPanel command', function () {
        it('should open the dialog if forceHide is false', function () {
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            expect(dialogService.open).toHaveBeenCalled();
        });

        it('should open the dialog and set forceHide to false if forceHide is true, and the command source is the fpp', function () {
            simulateOpenAndCloseDialog(false, 'dismiss', 'someContext');
            dialogService.open.calls.reset();

            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel', {
                src: 'fpp'
            });

            expect(dialogService.open).toHaveBeenCalled();
        });

        it('should not open the dialog if forceHide is true and the command source is not the fpp', function () {
            simulateOpenAndCloseDialog(false, 'dismiss', 'someContext');
            dialogService.open.calls.reset();

            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel', {
                src: 'nonfpp'
            });

            expect(dialogService.open).not.toHaveBeenCalled();
        });

        it('should not open the dialog if it is already open', function () {
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            expect(dialogService.open.calls.count()).toEqual(1);
        });

        it('should not open the dialog if the edited component cannot be retrieved', inject(function(editorComponent) {
            spyOn(editorComponent, 'getEditedComponent').and.returnValue(null);

            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            expect(dialogService.open).not.toHaveBeenCalled();
        }));

        it('should close property panel dialog when changing the Editing Mode. (Editor->Preview and vice versa)', function() {
            spyOn(dialogService, 'close');
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            _$rootScope.$broadcast('WPreviewCommands.WEditModeChanged');

            expect(dialogService.close).toHaveBeenCalled();
        });
    });

    describe('On selected component change - ', function () {
        it('Should get the editedComponent\'s data from the new component', inject(function (editorComponent) {
            var context;
            var compData = {
                data: 'data1',
                prop: 'prop1'
            };

            spyOn(editorComponent, 'getComponentData').and.callFake(function () {
                return compData;
            });
            spyOn(editorComponent, 'getEditedComponent').and.returnValue({
                    getComponentProperties: function () {
                        return {
                            _schema: 'someSchema'
                        };
                    }
                });

            // store dialog context to test for changes later
            dialogService.open.and.callFake(function (dlgTypeId, options) {
                context = options.context;
            });

            // Init context with 'old' (current) component data
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            // newly selected component's data
            compData = {
                data: 'data2',
                prop: 'prop2'
            };

            _$rootScope.$broadcast('selectedComponentChanged');

            expect(context.compData.data).toEqual(compData.data);
            expect(context.compData.prop).toEqual(compData.prop);
        }));

        it('Should broadcast a propertyPanelDataChanged event', inject(function (editorComponent) {
            var listener = jasmine.createSpy('propertyPanelChangedListener');
            _$rootScope.$on('propertyPanelDataChanged', listener);

            _$rootScope.$broadcast('selectedComponentChanged');

            expect(listener).toHaveBeenCalled();
        }));

        it('Should not open the property panel if it is already already open', function () {
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            _$rootScope.$broadcast('selectedComponentChanged');

            expect(dialogService.open.calls.count()).toEqual(1);
        });

        it('Should open the property panel when forceHide is false', function () {
            _$rootScope.$broadcast('selectedComponentChanged');

            expect(dialogService.open).toHaveBeenCalled();
        });

        it('Should not open the property panel when forceHide is true', function () {
            simulateOpenAndCloseDialog(false, 'dismiss', 'someContext');
            dialogService.open.calls.reset();

            _$rootScope.$broadcast('selectedComponentChanged');

            expect(dialogService.open).not.toHaveBeenCalled();
        });
    });

    describe('Property Panel closing', function () {
        it('should clear the panel instance reference', function () {
            simulateOpenAndCloseDialog('false', 'someReason', 'someContext');

            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            // dialog was closed, should be reopened
            expect(dialogService.open.calls.count()).toEqual(2);
        });

        it('should be closed on WPreviewCommands.ViewerStateChanged event', function () {
            spyOn(dialogService, 'close');
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            _$rootScope.$broadcast('WPreviewCommands.ViewerStateChanged');

            expect(dialogService.close).toHaveBeenCalledWith('mockDialogInstance', false, 'WPreviewCommands.ViewerStateChanged');
        });

        it('should be closed on WPreviewCommands.WEditModeChanged event', function () {
            spyOn(dialogService, 'close');
            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            _$rootScope.$broadcast('WPreviewCommands.WEditModeChanged');

            expect(dialogService.close).toHaveBeenCalledWith('mockDialogInstance', false, 'WPreviewCommands.WEditModeChanged');
        });
    });

    describe('Specific Component Property Panel', function () {
        it('should open with correct component\'s view', inject(function (editorComponent, propertyPanelNavigation) {
            var context;

            // store dialog context to test for changes later
            dialogService.open.and.callFake(function (dlgTypeId, options) {
                context = options.context;
            });

            spyOn(propertyPanelNavigation, 'getPanelPath').and.returnValue({
                url: 'someurl.html',
                isLegacy: false
            });

            spyOn(editorComponent, 'getEditedComponent').and.returnValue({
                $className: 'somecomponentClass',
                getComponentProperties: function () {
                    return null;
                }
            });


            _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');

            expect(propertyPanelNavigation.getPanelPath).toHaveBeenCalledWith('somecomponentClass');
            expect(context.panelViewUrl).toEqual('someurl.html');
            expect(context.isLegacyPanel).toEqual(false);
        }));
    });

    function simulateOpenAndCloseDialog(result, closeReason, context) {
        var onCloseCallback;

        // Get forceHide to be true
        dialogService.open.and.callFake(function (dlgTypeId, options) {
            onCloseCallback = options.onCloseCallback;
        });
        _$rootScope.$broadcast('EditorUI.OpenPropertyPanel');
        onCloseCallback({
            result: result,
            closeReason: closeReason,
            context: context
        });
    }
});