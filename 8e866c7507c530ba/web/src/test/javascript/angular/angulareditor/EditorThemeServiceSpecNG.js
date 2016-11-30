describe('Unit: Editor Theme Service', function() {
    'use strict';

    var editorTheme;

    beforeEach(module('angularEditor'));

    beforeEach(inject(function(_editorTheme_){
        editorTheme = _editorTheme_;
    }));

    describe('Testing the EditorTheme Service -', function() {
        it('Ensure the Editor theme service is defined', function() {
            expect(editorTheme).toBeDefined();
        });

        it("should be able to pull out a property from the theme manager of the Preview.", function() {
            var mockThemeManager = W.Preview.getPreviewManagers().Theme;

            var propertyValue = editorTheme.getPreviewThemeProperty("myProperty");
            expect(mockThemeManager.getProperty.calls.argsFor(0)).toEqual(["myProperty"]);
        });

    });
});