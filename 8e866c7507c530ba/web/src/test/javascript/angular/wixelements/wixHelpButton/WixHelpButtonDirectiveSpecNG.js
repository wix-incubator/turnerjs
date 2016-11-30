describe('Unit: WixHelpButtonDirective', function () {
    'use strict';

    var scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    describe('WixHelpButtonDirective -', function() {
        beforeEach(inject(function($compile) {
            var html = '<wix-help-button help-id="MY_HELP_ID"></wix-help-button>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should ensure that the directive passed compilation successfully", function() {
            expect(scope).toBeDefined();

            expect(elm).toBeDefined();

            var directiveScope = elm.isolateScope();
            expect(directiveScope).toBeDefined();
        });

        it("should fire the 'Show Help Dialog' command when clicking on it", inject(function(editorCommands) {
            spyOn(editorCommands, 'executeCommand');
            var directiveScope = elm.isolateScope();

            directiveScope.sendCommand();

            expect(editorCommands.executeCommand).toHaveBeenCalledWith("WEditorCommands.ShowHelpDialog", "MY_HELP_ID");
        }));
    });
});