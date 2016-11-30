describe('Unit: wixEditText directive', function () {
    'use strict';

    var iScope, scope, elm;

    beforeEach(module('wixElements', 'htmlTemplates'));

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        var html = '<wix-edit-text></wix-edit-text>';
        elm = $compile(html)(scope);
        scope.$digest();
        iScope = elm.isolateScope();

    }));

    describe('functionality - ', function () {
        it('should open the rich text editor when startEditRichText is called', inject(function(editorCommands) {
            spyOn(editorCommands, 'executeCommand');

            iScope.startEditRichText();

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('EditorUI.StartEditRichText');
        }));
    });
});