describe('Unit: WThumbnailGalleryController', function () {
    'use strict';
    var ctrl, rootScope, element, editedCompStyle;

    beforeEach(function () {
        element = document.createElement('div');
    });

    beforeEach(module('propertyPanel'));

    // create the required services from mocks
    beforeEach(module(function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, editorComponent, editorResources) {
        // Create a new scope that's a child of the $rootScope
        rootScope = $rootScope;
        editedCompStyle = editorComponent.getEditedComponent().getStyle();

        // Create the controller and supply mocks
        ctrl = $controller('WThumbnailGalleryController', {
            editorComponent: editorComponent,
            editorResources: editorResources
        });
    }));

    describe('Controller initialization', function () {
        it("should ensure that the controller was instantiated", function () {
            expect(ctrl).toBeDefined();
        });

        it("should ensure that the title, description and background have styling data on the scope", function () {
            expect(ctrl.titleColor).toBeDefined();
            expect(ctrl.titleColor.propertyName).toBe("color1");
            expect(ctrl.titleColor.styleData).toEqual(editedCompStyle);

            expect(ctrl.descriptionColor).toBeDefined();
            expect(ctrl.descriptionColor.propertyName).toBe("color2");
            expect(ctrl.descriptionColor.styleData).toEqual(editedCompStyle);

            expect(ctrl.bgColor).toBeDefined();
            expect(ctrl.bgColor.propertyName).toBe("color3");
            expect(ctrl.bgColor.styleData).toEqual(editedCompStyle);
        });

    });
});