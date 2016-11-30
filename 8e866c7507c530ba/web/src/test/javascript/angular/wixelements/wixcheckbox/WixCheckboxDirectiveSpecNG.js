describe('Unit: wixCheckBox', function () {
    'use strict';


    var rootScope, scope, elm, editorComponent, editorCommands;

    beforeEach(function () {
        module('wixElements');
        module('htmlTemplates');

    });

    beforeEach(inject(function ($rootScope, _editorCommands_, _editorComponent_) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.wixData = false;
        editorCommands = _editorCommands_;
        editorComponent = _editorComponent_;
        spyOn(editorCommands, 'executeCommand');

    }));

    describe('WixCheckBox - ', function () {

        beforeEach(inject(function ($compile) {
            var html = '<wix-checkbox wix-data="wixData"></wix-checkbox>';

            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('initial check state is false', function () {
            var iScope = elm.isolateScope();
            expect(iScope.isChecked).toEqual(false);
        });

        it('responds to external changes', function () {
            var iScope = elm.isolateScope();
            scope.wixData = true;
            scope.$digest();
            expect(iScope.isChecked).toEqual(true);
        });

        it('propegates the change outwards', function () {
            var iScope = elm.isolateScope();
            iScope.isChecked = true;
            scope.$digest();
            expect(scope.wixData).toEqual(true);
        });

        it ('handles onLabel click', function(){
            var iScope = elm.isolateScope();
            iScope._onLabelClick();
            expect(iScope.isChecked = true);
        });


        describe('works with custom true and false value', function(){
            beforeEach(inject(function($compile){
                var html = '<wix-checkbox wix-data="wixData" true-value="yes" false-value="no"></wix-checkbox>';

                elm = $compile(html)(scope);
                scope.$digest();
            }));


            it('responds to custom true value', function () {
                var iScope = elm.isolateScope();
                scope.wixData = 'yes';
                scope.$digest();
                expect(iScope.isChecked).toEqual(true);
            });

            it('responds to custom false value', function () {
                var iScope = elm.isolateScope();
                scope.wixData = 'no';
                scope.$digest();
                expect(iScope.isChecked).toEqual(false);
            });

            it('propegates the change outwards', function () {
                var iScope = elm.isolateScope();
                iScope.isChecked = true;
                scope.$digest();
                expect(scope.wixData).toEqual('yes');
            });
        });

    });

});