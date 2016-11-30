xdescribe('Unit: LinkDialogController', function () {
    'use strict';
    var ctrl, scope, rootScope, element, editedComp;

    beforeEach(module('dialogs', function ($provide) {
    }));


    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, editorComponent) {
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        scope.context = {
            showDescription: true
        }
        rootScope = $rootScope;
        element = document.createElement('div');

        // Create the controller and supply mocks
        ctrl = $controller('LinkDialogController', {
            $scope: scope,
            $element: angular.element(element)
        });
    }));

    describe('component with no link', function () {
        // TODO GuyR 9/1/2014 10:49 PM - create the controller with no existing link

        it('Should show the link options', function () {
            var contentTemplate;
            expect().toEqual();
        });

        it('Should show the description of the dialog', function () {

            expect(scope.context.showDescription).toBeTruthy();
        });
    });

    describe('component with link', function () {
        it('Should hide the description of the dialog', function () {

            expect(scope.context.showDescription).not.toBeTruthy();
        });

        it('Should show the relevant content according to existing link', function () {

            expect().toEqual();
        });
    });
});