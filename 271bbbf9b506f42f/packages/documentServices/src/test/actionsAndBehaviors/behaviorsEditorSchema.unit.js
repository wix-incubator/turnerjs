define([
    'lodash',
    'testUtils',
    'definition!documentServices/actionsAndBehaviors/behaviorsEditorSchema'
], function (
    _,
    testUtils,
    behaviorsEditorSchemaDef
) {
    "use strict";

    var behaviorsEditorSchema;

    function generateBehaviorsEditorSchema() {
        behaviorsEditorSchema = behaviorsEditorSchemaDef(_);
    }

    describe('behaviorsEditorSchema', function() {
        it('should contain popup behaviors', function() {
            generateBehaviorsEditorSchema();
            expect(_.some(behaviorsEditorSchema, {'name': 'openPopup'})).toBeTruthy();
        });
    });
});
