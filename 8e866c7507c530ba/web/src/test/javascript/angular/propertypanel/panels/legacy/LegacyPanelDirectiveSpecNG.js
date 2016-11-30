describe('Unit: legacyPanel', function () {
    'use strict';

    var rootScope, scope, elm, editorComponent, legacyPanel, timeout;

    beforeEach(module('propertyPanel', function ($provide) {
        $provide.factory('editorComponent', TestsUtils.mocks.editorComponent);
    }));

    beforeEach(inject(function ($rootScope, _editorComponent_, $timeout) {
        editorComponent = _editorComponent_;
        timeout = $timeout;
        legacyPanel = editorComponent.getLegacyPanel();
        spyOn(editorComponent, 'getLegacyPanel').and.returnValue(legacyPanel);
        spyOn(legacyPanel.$logic, 'dispose');
        spyOn(legacyPanel, 'dispose');
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.context = {
            isLegacyPanel: true
        };
    }));


    describe('Directive is loaded with a new panel', function () {

        beforeEach(inject(function ($compile, $timeout) {

            var html = '<legacy-panel></legacy-pane;>';
            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('gets legacy panel', function () {
            expect(editorComponent.getLegacyPanel).toHaveBeenCalled();
        });

        it('calls the legacy panel insertInto method', function () {
            spyOn(legacyPanel, 'insertInto');
            timeout.flush();
        });

        it('destroys the panel on scope destroy', function () {
            scope.$emit('$destroy');
            scope.$digest();
            expect(legacyPanel.$logic.dispose).toHaveBeenCalled();
        });

        it('calls the correct dispose logic', function () {
            delete legacyPanel.$logic.dispose;
            scope.$emit('$destroy');
            scope.$digest();
            expect(legacyPanel.dispose).toHaveBeenCalled();
        });
    });
});