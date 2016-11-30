define(['lodash', 'santa-harness', 'componentUtils', 'errorUtils'], function (_, santa, componentUtils, errorUtils) {
    'use strict';

    xdescribe('Structure Preprocessor', function () {
        var documentServices;

        beforeAll(function (done) {
            var siteParameter = {
                experimentsOn: ['connectionsData', 'se_platform1', 'sv_platform1']
            };

            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                done();
            });
        });

        it("should not show appControllers after the algo runs", function (done) {
            var pageId = 'c1dmp';
            var controllerDef = componentUtils.getComponentDef(documentServices, "APP_CONTROLLER");
            var focusedPageRef = documentServices.pages.getReference(pageId);
            var controllerRef = documentServices.components.add(focusedPageRef, controllerDef);
            documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.MOBILE);
            errorUtils.waitForSuccess(documentServices, function () {
                var foundComponent = documentServices.components.get.byId(controllerRef.id);
                expect(foundComponent).toBeNull();
                done();
            });
        });
    });
});
