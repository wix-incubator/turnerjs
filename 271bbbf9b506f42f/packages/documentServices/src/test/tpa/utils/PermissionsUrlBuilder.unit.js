define(['documentServices/tpa/utils/PermissionsUrlBuilder'], function (PermissionsUrlBuilder) {
    'use strict';
    describe('Provision URL builder spec', function () {
        var builder;

        beforeEach(function() {
            builder = new PermissionsUrlBuilder('');
        });

        describe('URL build', function () {
            it('should add addApplicationIds param', function () {
                var url = builder.addApplicationIds(['1', '2', '3']).build();

                expect(url).toContain('applicationId=1&applicationId=2&applicationId=3');
            });

            it('should add addApplicationIds param - only one if array has one element', function () {
                var url = builder.addApplicationIds(['1']).build();

                expect(url).toContain('applicationId=1');
                expect(url).not.toContain('applicationId=1&applicationId');
            });

            it('should not add an empty query param', function () {
                var url = builder.addApplicationIds().build();

                expect(url).not.toContain('applicationId');
            });
        });
    });

});
