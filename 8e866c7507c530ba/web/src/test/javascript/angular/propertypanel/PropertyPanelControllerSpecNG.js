describe('Unit: PropertyPanelController', function () {
    'use strict';
    var ctrl, scope, rootScope, element;

    beforeEach(function () {
        element = document.createElement('div');
    });

    beforeEach(module('propertyPanel'));

    // create the required services from mocks
    beforeEach(module(function ($provide) {
        $provide.factory('configManager', TestsUtils.mocks.configManager);
    }));

    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, configManager) {
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        rootScope = $rootScope;

        scope.context = {
            compData: {
                label: 'oldLabel'
            }
        };

        scope.dialog = jasmine.createSpyObj('dialog', ['setTitle', 'setDescription', 'setHelpId']);

        scope.$digest();
        // Create the controller and supply mocks
        ctrl = $controller('PropertyPanelController', {
            $scope: scope,
            configManager: configManager
        });
    }));

    describe('Controller initialization', function () {
        it('should create webThemeDir as a property of the controller', inject(function (configManager) {
            expect(ctrl.webThemeDir).toEqual(configManager.webThemeDir);
        }));

        it('should assign compData as a property of the controller', function() {
            expect(ctrl.compData).toEqual({label: 'oldLabel'});
        });
    });

    describe('On propertyPanelDataChanged event', function() {
        it('Should put the new compData from scope.context on the controller', function() {
            scope.context.compData = 'someData2';

            rootScope.$broadcast('propertyPanelDataChanged');

            expect(ctrl.compData).toEqual('someData2');
        });

        it('should set the new title in the dialog', function() {
            ctrl.compData.label = 'newLabel';

            rootScope.$broadcast('propertyPanelDataChanged');

            expect(scope.dialog.setTitle).toHaveBeenCalledWith('COMP_newLabel');
        });

        it('should set the new description in the dialog', function() {
            ctrl.compData.label = 'newLabel';

            rootScope.$broadcast('propertyPanelDataChanged');

            expect(scope.dialog.setDescription).toHaveBeenCalledWith('COMP_DESC_newLabel');
        });

        it('should set the new helpId in the dialog', function() {
            ctrl.compData.helpId = 'newHelpId';

            rootScope.$broadcast('propertyPanelDataChanged');

            expect(scope.dialog.setHelpId).toHaveBeenCalledWith('newHelpId');
        });
    });
});