describe('Unit: WixOrganizeImagesButtonDirective', function () {
    'use strict';
    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('galleryService', TestsUtils.mocks.galleryService);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('default behavior -', function () {

        it('Should call gallery service method openOrganizeImages when clicked', inject(function ($compile, galleryService) {
            spyOn(galleryService, 'openOrganizeImages');
            var html = '<wix-organize-images-button gallery-config-id="id"></wix-organize-images-button>';
            elm = $compile(html)(scope);
            scope.$digest();
            var organizeButton = elm.find(".wix-button");

            organizeButton.trigger('click');

            expect(galleryService.openOrganizeImages).toHaveBeenCalledWith('id');
        }));
    });
});