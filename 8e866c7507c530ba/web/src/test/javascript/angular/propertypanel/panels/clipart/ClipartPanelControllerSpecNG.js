describe('Unit: ClipartPanelController', function () {
    'use strict';
    var ctrl, rootScope, element, editedComp;

    beforeEach(function () {
        element = document.createElement('div');
    });

    beforeEach(module('propertyPanel', function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
    }));


    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, editorComponent) {
        // Create a new scope that's a child of the $rootScope
        rootScope = $rootScope;
        editedComp = editorComponent.getEditedComponent();
        spyOn(editorComponent, 'getEditedComponent').and.returnValue(editedComp);

        // Create the controller and supply mocks
        ctrl = $controller('ClipartPanelController', {
            editorComponent: editorComponent
        });
    }));

    describe('Controller initialization', function () {
        it("checks that mediaGalleryCallback has been defined", function () {
            expect(ctrl).toBeDefined();
        });

        it("checks that mediaGalleryCallback has been called with the right data", function () {
            spyOn(editedComp, '_mediaGalleryCallback');
            ctrl._mediaGalleryCallback({data: 'yoyoyo'});
            expect(editedComp._mediaGalleryCallback).toHaveBeenCalledWith({data: 'yoyoyo'});
        });
    });
});