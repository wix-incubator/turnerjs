describe('Unit: ComponentLayoutService', function () {
    'use strict';

    var _$rootScope, _componentLayout;

    beforeEach(module('propertyPanel'));

    beforeEach(inject(function ($rootScope, componentLayout) {
        _$rootScope = $rootScope;
        _componentLayout = componentLayout;
    }));

    describe('ComponentLayoutChange editor event', function() {
        it('should broadcast an onComponentLayoutChange event', function() {
            var eventHandler = jasmine.createSpy();
            _$rootScope.$on('onComponentLayoutChanged', eventHandler);

            _$rootScope.$broadcast('WEditorCommands.componentLayoutChanged');

            expect(eventHandler).toHaveBeenCalled();
        });
    });

    describe('getComponentScope', function() {
        it('should get the component scope from the EditorManager', inject(function(editorComponent) {
            spyOn(editorComponent, 'getEditedComponent').and.returnValue('someComp');
            spyOn(W.Editor, 'getComponentScope').and.returnValue('someScope');

            var res = _componentLayout.getComponentScope();

            expect(W.Editor.getComponentScope).toHaveBeenCalledWith('someComp');
            expect(res).toEqual('someScope');
        }));
    });

    describe('toggleComponentScope', function() {
        it('should execute EditCommands.moveCurrentComponentToOtherScope command on the editor', inject(function(editorCommands) {
            var expectedEventParams = {
                event: {
                    value: 'someValue'
                }
            };
            spyOn(editorCommands, 'executeCommand');

            _componentLayout.toggleComponentScope(expectedEventParams.event.value);

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('EditCommands.moveCurrentComponentToOtherScope', expectedEventParams);
        }));
    });

    describe('setSelectedCompPositionSize', function() {
        it('should execute WEditorCommands.SetSelectedCompPositionSize command with the coordinates', inject(function(editorCommands) {
            var coords = 'someCoords';
            spyOn(editorCommands, 'executeCommand');

            _componentLayout.setSelectedCompPositionSize(coords);

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.SetSelectedCompPositionSize', coords);
        }));
    });

    describe('setSelectedCompRotationAngle', function() {
        it('should execute WEditorCommands.SetSelectedCompRotationAngle command with the angle', inject(function(editorCommands) {
            var angle = 'someAngle';
            spyOn(editorCommands, 'executeCommand');

            _componentLayout.setSelectedCompRotationAngle(angle);

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.SetSelectedCompRotationAngle', angle);
        }));
    });

    describe('getSelectedCompLayoutData', function() {
        it('should return the selected component\'s coords, dimensions, angle and isRotatable', inject(function(editorComponent) {
            var expectedLayoutData = {
                layout: {
                    width: 100,
                    height: 200,
                    x: 1,
                    y: 2,
                    angle: 3
                },
                rotatable: 'someRotationValue'
            };
            var editedComponent = {
                getWidth: function() { return expectedLayoutData.layout.width; },
                getHeight: function() { return expectedLayoutData.layout.height; },
                getX: function() { return expectedLayoutData.layout.x; },
                getY: function() { return expectedLayoutData.layout.y; },
                getAngle: function() { return expectedLayoutData.layout.angle; },
                isRotatable: function() { return expectedLayoutData.rotatable; }
            };
            spyOn(editorComponent, 'getEditedComponent').and.returnValue(editedComponent);

            var actualLayoutData = _componentLayout.getSelectedCompLayoutData();

            expect(actualLayoutData).toEqual(expectedLayoutData);
        }));

        it('should return undefined if it can\'t get the edited component', inject(function(editorComponent) {
            spyOn(editorComponent, 'getEditedComponent').and.returnValue();

            var actualLayoutData = _componentLayout.getSelectedCompLayoutData();

            expect(actualLayoutData).not.toBeDefined();
        }));
    });
});