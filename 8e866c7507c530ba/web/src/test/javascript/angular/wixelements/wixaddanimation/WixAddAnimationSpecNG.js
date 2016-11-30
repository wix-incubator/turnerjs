describe('Unit: WixAddAnimation', function () {
    'use strict';


    var rootScope, scope, elm, editorComponent, editorCommands;

    beforeEach(function () {
        module('wixElements');
        module('htmlTemplates');

    });

    beforeEach(module(function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));


    beforeEach(inject(function ($rootScope, _editorCommands_, _editorComponent_) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        editorCommands = _editorCommands_;
        editorComponent = _editorComponent_;
        spyOn(editorCommands, 'executeCommand');

    }));


    describe('WixAddAnimation - ', function () {

        beforeEach(inject(function ($compile) {
            var html = '<wix-add-animation></wix-add-animation>';

            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('expects the wix-add-animation to show the right label', function () {
            var iScope = elm.isolateScope();
            expect(iScope.btnLabel).toEqual('FPP_ADD_ANIMATION_LABEL');
        });

        it('executes the showAnimationDialog command', function () {
            var iScope = elm.isolateScope();

            iScope.openAnimationDialog();
            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.ShowAnimationDialog');
        });

        it('responds to AnimationUpdated command and changes label', function () {
            var editedComponent = {
                getBehaviors: function () {
                }
            };
            spyOn(editorComponent, 'getEditedComponent').and.returnValue(editedComponent);
            spyOn(editedComponent, 'getBehaviors').and.returnValue([]);
            var iScope = elm.isolateScope();
            rootScope.$broadcast('WEditorCommands.AnimationUpdated');

            expect(editedComponent.getBehaviors).toHaveBeenCalled();
            expect(iScope.btnLabel).toEqual('FPP_EDIT_ANIMATION_LABEL');
        });

    });

});