describe('Unit: wixChangeGalleryButton directive', function () {
    'use strict';


    var rootScope, scope, iScope, elm;
    var mockEditedComponent = {
        getID: function() {
            return 'mockId';
        }
    };

    beforeEach(module('wixElements', 'htmlTemplates', function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));


    beforeEach(inject(function ($rootScope, $compile) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        var html = '<wix-change-gallery-button></wix-change-gallery-button>';
        elm = $compile(html)(scope);
        scope.$digest();

        iScope = elm.isolateScope();
    }));


    describe('functionality - ', function () {

        it('should put the tpa topology path in he scope', inject(function(editorResources) {
            expect(iScope.tpaResources).toEqual(editorResources.topology.tpa);
        }));

        it('should open change gallery dialog when openChangeGalleryDialog is called', inject(function(galleryService) {
            spyOn(galleryService, 'openChangeGalleryDialog');

            iScope.openChangeGalleryDialog();

            expect(galleryService.openChangeGalleryDialog).toHaveBeenCalled();
        }));

    });
});