define(['santa-harness', 'apiCoverageUtils'], function (santa, apiCoverageUtils) {

    "use strict";
    describe('Document Services - Pages - Transitions', function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing transitions spec');
                done();
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.pages.transitions.get');
            apiCoverageUtils.checkFunctionAsTested('documentServices.pages.transitions.getNames');
        });

        function getCompRef(componentId, pageId) {
            return documentServices.components.get.byId(componentId, pageId);
        }

        it('should get the same transition it sets', function (done) {
            documentServices.pages.transitions.set('crossfade');
            documentServices.waitForChangesApplied(function () {
                var transition = documentServices.pages.transitions.get();
                expect(transition).toEqual('crossfade');
                done();
            });
        });

        it('should get the same value as the "transition" property', function (done) {
            documentServices.pages.transitions.set('crossfade');
            var compRef = getCompRef('SITE_PAGES', 'masterPage');
            var compProperties = documentServices.components.properties.get(compRef);
            documentServices.waitForChangesApplied(function () {
                var transition = documentServices.pages.transitions.get();
                expect(transition).toEqual(compProperties.transition);
                done();
            });

        });

        it('should return a collection of transition names', function () {
            var expectedTransitionNamesArr = ["crossfade", "none", "outIn", "swipeHorizontalFullScreen", "swipeVerticalFullScreen"];
            var actualTransitionNamesArr = documentServices.pages.transitions.getNames();
            expect(Array.isArray(actualTransitionNamesArr)).toBeTruthy();
            expect(actualTransitionNamesArr.length).toBeGreaterThan(0);
            expect(actualTransitionNamesArr).toEqual(expectedTransitionNamesArr);
        });
    });
});
