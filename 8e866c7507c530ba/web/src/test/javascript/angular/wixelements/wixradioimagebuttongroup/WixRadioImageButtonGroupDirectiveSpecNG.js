describe('Unit: WixRadioImageButtonGroupDirective', function () {
    'use strict';

    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        scope.selectionModel = {};

        var imageCss      = {checked:    "url('http://some.wix.path/check-testPhoto.png') -11px -101px no-repeat",
                             unchecked:  "url('http://some.wix.path/uncheck-testPhoto.png') -11px -6px no-repeat"} ;

        scope.radioButtonsData = [
            {"imageCss": imageCss, "value": "valueA"},
            {"imageCss": imageCss, "value": "valueB"},
            {"imageCss": imageCss, "value": "valueC"},
            {"imageCss": imageCss, "value": "valueD"}
        ];
    }));

    describe('WixRadioImageButtonGroupDirective -', function() {
        beforeEach(inject(function($compile) {
            var html = '<wix-radio-image-button-group ' +
                       'label="my group" wix-data="selectionModel" buttons-data="radioButtonsData" ' +
                       'button-width="50px" button-height="50px">' +
                       '</wix-radio-image-button-group>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should make sure that the directive compiled successfully.", function() {
            expect(elm).toBeDefined();

            var directiveScope = elm.isolateScope();
            expect(directiveScope).toBeDefined();
        });
    });
});
