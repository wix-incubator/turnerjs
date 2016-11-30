describe('Unit: GeneralPropertiesController', function () {
    'use strict';
    var ctrl, scope, rootScope, editorComponent, componentLayout;

    beforeEach(module('propertyPanel'));

    // create the required services from mocks
    beforeEach(module(function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
        $provide.factory('componentLayout', TestsUtils.mocks.componentLayout);

    }));

    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, _editorComponent_, _componentLayout_) {
        rootScope = $rootScope;
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        editorComponent = _editorComponent_;
        componentLayout = _componentLayout_;

        var editedComponent = editorComponent.getEditedComponent();
        spyOn(editorComponent, 'getEditedComponent').and.returnValue(editedComponent);


        // Create the controller and supply mocks
        ctrl = $controller('GeneralPropertiesController', {
            $scope: scope,
            editorComponent: _editorComponent_,
            componentLayout: _componentLayout_
        });

        scope.generalPropertiesController = ctrl;
    }));

    describe('Controller initialization', function () {
        it('ensure that the controller can be created.', function () {
            expect(ctrl).toBeDefined();
        });

        describe("test the x & y coordinates changes", function() {

            beforeEach(function() {
                var editedComponent = editorComponent.getEditedComponent();
                expect(editedComponent).toBeDefined();

                var sizeLimits = {minW:0, maxW:1000, minH:0, maxH:1000};
                spyOn(editedComponent, 'getSizeLimits').and.returnValue(sizeLimits);
                var x = 200, y = 700 ;
                spyOn(editedComponent, 'getX').and.returnValue(x);
                spyOn(editedComponent, 'getBoundingX').and.returnValue(x);
                spyOn(editedComponent, 'getY').and.returnValue(y);
                spyOn(editedComponent, 'getBoundingY').and.returnValue(y);
                spyOn(editedComponent, 'isHorizResizable').and.returnValue(true);
                spyOn(editedComponent, 'isVertResizable').and.returnValue(true);
                spyOn(componentLayout, 'setSelectedCompPositionSize');
            });

            it("should change the x coordinate when setting a new value to it", function() {
                var event = {keyCode: 13, target: {name: "xInput", getProperty: function(value) {return "251";}}};
                ctrl.onKeyup(event);

                expect(componentLayout.setSelectedCompPositionSize).toHaveBeenCalledWith({x: 251, updateLayout: true,
                allowPageShrink: true, warningIfOutOfGrid: true});
            });

            it("should change the y coordinate when setting a new value to it", function() {
                var event = {keyCode: 13, target: {name: "yInput", getProperty: function(value) {return "733";}}};
                ctrl.onKeyup(event);

                expect(componentLayout.setSelectedCompPositionSize).toHaveBeenCalledWith({y: 733, updateLayout: true,
                    allowPageShrink: true, warningIfOutOfGrid: true});
            });

            it("should change the width when setting a new value to it", function() {
                var event = {keyCode: 13, target: {name: "width", getProperty: function(value) {return "802";}}};
                ctrl.onKeyup(event);

                expect(componentLayout.setSelectedCompPositionSize).toHaveBeenCalledWith({width: 802, updateLayout: true,
                    allowPageShrink: true, warningIfOutOfGrid: true});
            });

            it("should change the height when setting a new value to it", function() {
                var event = {keyCode: 13, target: {name: "height", getProperty: function(value) {return "124";}}};
                ctrl.onKeyup(event);

                expect(componentLayout.setSelectedCompPositionSize).toHaveBeenCalledWith({height: 124, updateLayout: true,
                    allowPageShrink: true, warningIfOutOfGrid: true});
            });
        });
    });
});