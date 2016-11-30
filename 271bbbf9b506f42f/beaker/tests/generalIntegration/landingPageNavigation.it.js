define(['lodash', 'errorUtils', 'apiCoverageUtils', 'componentUtils', 'santa-harness'], function
    (_, errorUtils, apiCoverageUtils, componentUtils, santa) {
    'use strict';

    describe('landing page navigation', function () {
        var documentServices;
        var homePageId;
        var landingPageId;

        beforeEach(function (done) {
            var siteParameter = {
                experimentsOn: ['viewerGeneratedAnchors', 'removeJsonAnchors']
            };

            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                homePageId = documentServices.pages.getFocusedPageId();
                var newPageTitle = 'landingPage';
                var newPagePointer = documentServices.pages.add(newPageTitle);
                landingPageId = newPagePointer.id;
                documentServices.pages.data.update(newPagePointer.id, {
                    isLandingPage: true
                });
                console.log('Testing landing page navigation spec');
                documentServices.waitForChangesApplied(done);
            });
        });

        describe('when navigating to a landing page', function () {
            beforeEach(function (done) {
                documentServices.pages.navigateTo(landingPageId);
                documentServices.waitForChangesApplied(done);
            });

            it('should render pagesContainer at y=0, and with height equal to site height', function () {
                var pagesContainer = documentServices.siteSegments.getPagesContainer();
                var pagesContainerLayout = documentServices.components.layout.get(pagesContainer);
                var siteHeight = documentServices.site.getHeight();

                expect(pagesContainerLayout.y).toEqual(0);
                expect(pagesContainerLayout.height).toEqual(siteHeight);
            });
        });

        describe('when navigating out from a landing page', function () {
            beforeEach(function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var childCompLayout = {
                    layout: {
                        y: 50,
                        height: 50
                    }
                };
                var homePageComp = documentServices.components.get.byId(homePageId);
                this.childComp = documentServices.components.add(homePageComp, _.merge({}, containerDef, childCompLayout), 'childComp');
                documentServices.pages.navigateTo(landingPageId);
                documentServices.pages.navigateTo(homePageId);
                errorUtils.waitForSuccess(documentServices, done);
            });

            it('should render pagesContainer under the header', function () {
                var pagesContainer = documentServices.siteSegments.getPagesContainer();
                var pagesContainerLayout = documentServices.components.layout.get(pagesContainer);
                var header = documentServices.siteSegments.getHeader();
                var headerLayout = documentServices.components.layout.get(header);

                expect(pagesContainerLayout.y).toEqual(headerLayout.height);
                expect(pagesContainerLayout.y).toBeGreaterThan(0);
            });

            it('should render the footer under the pagesContainer with anchors between them', function (done) {
                var pagesContainer = documentServices.siteSegments.getPagesContainer();
                var footer = documentServices.siteSegments.getFooter();
                documentServices.components.layout.updateAndAdjustLayout(this.childComp, {height: 1000});
                errorUtils.waitForSuccess(documentServices, function () {
                    var footerLayout = documentServices.components.layout.get(footer);
                    var pagesContainerLayout = documentServices.components.layout.get(pagesContainer);

                    expect(footerLayout.y).toEqual(pagesContainerLayout.y + pagesContainerLayout.height);
                    done();
                });
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.pages.navigateTo');
        });
    });
});
