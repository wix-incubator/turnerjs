define(['lodash', 'santa-harness', 'apiCoverageUtils'], function (_, santa, apiCoverageUtils) {
    'use strict';

    describe('Document Services - Theme - Events', function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing events spec');
                done();
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.theme.events.onChange.addListener');
            apiCoverageUtils.checkFunctionAsTested('documentServices.theme.events.onChange.removeListener');
        });

        it('Should be able to add a listener and get events on changes in Theme', function (done) {
            var callback = jasmine.createSpy();
            documentServices.theme.events.onChange.addListener(callback);

            var wp1 = documentServices.theme.styles.get('wp1');
            var updatedStyle = _.cloneDeep(wp1);
            updatedStyle.style.properties.brd = 'color_18';
            documentServices.theme.styles.update('wp1', updatedStyle);

            documentServices.waitForChangesApplied(function () {
                expect(callback).toHaveBeenCalled();
                done();
            });
        });

        it('should be able to remove a listener and not get change events', function (done) {
            var callback = jasmine.createSpy();
            var listenerId = documentServices.theme.events.onChange.addListener(callback);

            documentServices.theme.events.onChange.removeListener(listenerId);

            var wp1 = documentServices.theme.styles.get('wp1');
            var updatedStyle = _.cloneDeep(wp1);
            updatedStyle.style.properties.brd = 'color_18';
            documentServices.theme.styles.update('wp1', updatedStyle);
            documentServices.waitForChangesApplied(function () {
                expect(callback).not.toHaveBeenCalled();
                done();
            });

        });
    });
});
