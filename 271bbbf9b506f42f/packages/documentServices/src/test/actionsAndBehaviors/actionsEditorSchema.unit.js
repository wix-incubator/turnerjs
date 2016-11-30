define([
    'lodash',
    'experiment',
    'testUtils',
    'definition!documentServices/actionsAndBehaviors/actionsEditorSchema'
], function (
    _,
    experiment,
    testUtils,
    actionsEditorSchemaDef
) {
    "use strict";

    var actionsEditorSchema;

    function generateActionsEditorSchema() {
        actionsEditorSchema = actionsEditorSchemaDef(experiment);
    }

    describe('actionEditorSchema', function() {
        it('should contain popup actions', function() {
            generateActionsEditorSchema();
            expect(actionsEditorSchema.getSchema().load.groups).toEqual(['transition', 'pageTransition']);
        });
    });
});
