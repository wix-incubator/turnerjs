define(['documentServices/tpa/utils/ProvisionUrlBuilder'], function (ProvisionUrlBuilder) {
    'use strict';
    describe('Provision URL builder spec', function () {
        var builder;

        beforeEach(function() {
            builder = new ProvisionUrlBuilder('');
        });

        describe('URL build', function () {
            it('should add MetaSiteId param', function () {
                var url = builder.addMetaSiteId('metaSiteId').build();

                expect(url).toContain('metaSiteId=metaSiteId');
            });

            it('should add EditorSessionId param', function () {
                var url = builder.addEditorSessionId('editorSessionId').build();

                expect(url).toContain('editorSessionId=editorSessionId');
            });

            it('should add addAcceptJson param', function () {
                var url = builder.addAcceptJson().build();

                expect(url).toContain('accept=json');
            });

            it('should not add an empty query param', function () {
                var url = builder.addMetaSiteId().build();

                expect(url).not.toContain('metaSiteId');
            });
        });
    });

});