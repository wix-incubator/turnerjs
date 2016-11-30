describe('Unit: WixLinkDirective', function () {
    'use strict';
    var rootScope, scope, elm,
        editorCommands = TestsUtils.mocks.editorCommands();

    beforeEach(module('wixElements'));
    beforeEach(module('htmlTemplates'));
    beforeEach(module('dialogs'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
        $provide.factory('editorUtils', TestsUtils.mocks.editorUtils);
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
        $provide.factory('linkRenderer', TestsUtils.mocks.linkRenderer);
        $provide.constant('EXP_ngpanels', true);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        scope.dataQuery = 'initialDataQuery';

    }));

    describe('wixLink -', function() {

        beforeEach(inject(function($compile) {
            var html = '<wix-link wix-data="dataQuery" placeholder="\'\'"></wix-link>';

            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('should render the link label and set it in the scope', function() {
            var directiveScope = elm.isolateScope();

            expect(directiveScope.linkLabel).toEqual('initialDataQuery_MOCK_LINK');
        });

        it('should render the link when the data changes', function() {
            var directiveScope = elm.isolateScope();

            scope.dataQuery = 'newDataQuery';
            scope.$digest();

            expect(directiveScope.linkLabel).toEqual('newDataQuery_MOCK_LINK');
        });

        it('should display an empty string if there\'s not data', function() {
            var directiveScope = elm.isolateScope();

            scope.dataQuery = '';
            scope.$digest();

            expect(directiveScope.linkLabel).toEqual('');
        });

        it('should open the link dialog when openLinkDialog is called', inject(function(editorCommands) {
            var directiveScope = elm.isolateScope();
            spyOn(editorCommands, 'executeCommand');

            directiveScope.openLinkDialog({target:'target'});

            expect(editorCommands.executeCommand).toHaveBeenCalled();
            expect(editorCommands.executeCommand.calls.mostRecent().args[0]).toEqual('WEditorCommands.OpenLinkDialogCommand');
        }));

        xit('Should open the link dialog by creating options object and calling dialogService', inject(function (editorResources, dialogService) {
            spyOn(dialogService, 'open');
            var directiveScope = elm.isolateScope();

            directiveScope.openLinkDialog({target:'target'});

            var dialogName = dialogService.open.calls.argsFor(0)[0];
            var dialogOptions = dialogService.open.calls.argsFor(0)[1];
            expect(dialogService.open).toHaveBeenCalled();
            expect(dialogName).toEqual('link');
            expect(dialogOptions.context.wixData).toEqual('initialDataQuery');
            expect(dialogOptions.context.showDescription).toEqual(true);
        }));
    });
});