describe('Unit: wixToolTip', function () {
    'use strict';

    var rootScope, scope, elm, editorCommands;

    var TOOLTIP_ID = 'ttid_fakeTooltip';

    beforeEach(module('utilsDirectives', function ($provide) {
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.helpIdValue = 'someHelpId';
    }));


    describe('tooltip directive ', function () {

        beforeEach(inject(function ($compile, _editorCommands_) {

        }));

        it('should execute ShowHelpDialog command with the help id attribute', inject(function ($compile, _editorCommands_) {
            editorCommands = _editorCommands_;
            var html = '<div wix-help-link="helpIdValue"></div>';
            elm = $compile(html)(scope);
            scope.$digest();

            spyOn(editorCommands, 'executeCommand');

            elm.trigger('click');

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.ShowHelpDialog', 'someHelpId');
        }));

        it('should do nothing if no helpId is found', inject(function ($compile, _editorCommands_) {
            editorCommands = _editorCommands_;
            var html = '<div wix-help-link="invalidHelpIdValue"></div>';
            elm = $compile(html)(scope);
            scope.$digest();
            spyOn(editorCommands, 'executeCommand');

            elm.trigger('click');

            expect(editorCommands.executeCommand).not.toHaveBeenCalled();
        }));

    });
});