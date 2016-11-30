describe('Unit: WixChangeStyle directive', function () {
    'use strict';


    var rootScope, scope, elm, editorComponent, editorCommands, editorUtils;
    var mockEditedComponent = {
        getID: function() {
            return 'mockId';
        }
    };

    beforeEach(function () {
        module('wixElements');
        module('htmlTemplates');
    });


    beforeEach(module(function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
        $provide.factory('editorUtils', TestsUtils.mocks.editorUtils);
    }));

    beforeEach(inject(function ($rootScope, _editorCommands_, _editorComponent_, _editorUtils_) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        editorCommands = _editorCommands_;
        editorComponent = _editorComponent_;
        editorUtils = _editorUtils_;

        spyOn(editorCommands, 'executeCommand');
        spyOn(editorUtils, 'getPositionRelativeToWindow').and.returnValue({
            x: 10,
            y: 20
        });
        spyOn(editorComponent, 'getEditedComponent').and.returnValue(mockEditedComponent);
    }));


    describe('onChangeStyle function - ', function () {
        beforeEach(inject(function ($compile) {
            var html = '<wix-change-style></wix-change-style>';

            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('should execute WEditorCommands.ChooseComponentStyle command with the edited component, the element\'s x coord and the edited component\'s ID', function() {
            var iScope = elm.isolateScope();

            iScope.openChangeStyleDialog();

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.ChooseComponentStyle', {
                editedComponent: mockEditedComponent,
                left: 10,
                editedComponentId: 'mockId'
            });
        });
    });

});