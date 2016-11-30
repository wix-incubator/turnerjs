define([
    'lodash', 'santa-harness', 'apiCoverageUtils', 'componentUtils', 'generalUtils'
], function(_, santa, apiCoverageUtils, componentUtils, generalUtils) {
    'use strict';

    describe('components.get methods', function () {
        var documentServices;
        var dsComponents;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                dsComponents = documentServices.components;
                console.log('Testing get methods spec');
                done();
            });
        });

        describe('byType', function () {
            var focusedPageRef;
            var imageDef;

            beforeEach(function () {
                focusedPageRef = documentServices.pages.getFocusedPage();
                imageDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
            });

            afterEach(function (done) {
                generalUtils.cleanPage(documentServices, focusedPageRef);
                generalUtils.cleanPage(documentServices, documentServices.siteSegments.getHeader());
                documentServices.waitForChangesApplied(done);
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.get.byType');
            });

            it('should get a component by type', function (done) {
                documentServices.components.add(focusedPageRef, imageDef);
                var otherCompDef = componentUtils.getComponentDef(documentServices, "LINE");
                documentServices.components.add(focusedPageRef, otherCompDef);
                documentServices.waitForChangesApplied(function () {
                    var compPointer = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto');
                    expect(compPointer.length).toBe(1);
                    done();
                });
            });

            it('should get a component by type from specific root component', function (done) {
                var siteHeaderRef = documentServices.siteSegments.getHeader();
                documentServices.components.add(siteHeaderRef, imageDef);
                documentServices.components.add(focusedPageRef, imageDef);
                documentServices.waitForChangesApplied(function () {
                    var compPointerArrOnHeader = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto', siteHeaderRef);
                    var compPointerArrOnPage = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto', focusedPageRef);
                    expect(compPointerArrOnHeader.length).toBe(1);
                    expect(compPointerArrOnPage.length).toBe(1);
                    done();
                });
            });

            it('should collect components from all levels', function(done){
                documentServices.components.add(focusedPageRef, imageDef);
                documentServices.components.add(focusedPageRef, imageDef);
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.add(containerRef, imageDef);

                var innerContainerRef = documentServices.components.add(containerRef, containerDef);
                documentServices.components.add(innerContainerRef, imageDef);

                documentServices.waitForChangesApplied(function () {
                    var compPointerArrOnPage = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto', focusedPageRef);
                    expect(compPointerArrOnPage.length).toBe(4);
                    done();
                });
            });

            it('should work in mobile as well', function(done){
                documentServices.components.add(focusedPageRef, imageDef);
                documentServices.components.add(focusedPageRef, imageDef);
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.add(containerRef, imageDef);

                var innerContainerRef = documentServices.components.add(containerRef, containerDef);
                documentServices.components.add(innerContainerRef, imageDef);

                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    var mobilePageRef = documentServices.pages.getFocusedPage();
                    var compPointerArrOnPage = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto', mobilePageRef);
                    expect(compPointerArrOnPage.length).toBe(4);
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.waitForChangesApplied(done);
                });
            });

            it('should get empty array of components that doesn\'t exists in root component', function (done) {
                var otherCompDef = componentUtils.getComponentDef(documentServices, 'LINE');
                documentServices.components.add(focusedPageRef, otherCompDef);

                documentServices.waitForChangesApplied(function () {
                    var compPointer = documentServices.components.get.byType('wysiwyg.viewer.components.WPhoto', focusedPageRef);
                    expect(compPointer.length).toBe(0);
                    documentServices.waitForChangesApplied(done);
                });
            });
        });

        function isMobileRef(compRef){
            var compPage = documentServices.components.getPage(compRef);
            return documentServices.components.layout.get(compPage).width === 320;
        }

        describe('byId', function(){
            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.get.byId');
            });

            beforeEach(function(done){
                var homePageId = 'c1dmp';
                documentServices.pages.navigateTo(homePageId);

                var imageDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
                var focusedPageRef = documentServices.pages.getReference(homePageId);
                this.imageRef = documentServices.components.add(focusedPageRef, imageDef);

                documentServices.waitForChangesApplied(done);
            });

            it('should return null if no component found by parameters', function(){
                var compRef = documentServices.components.get.byId('nonExisting');
                expect(compRef).toBe(null);
            });

            it('should return null if no such page was found', function(){
                var compRef = documentServices.components.get.byId(this.imageRef.id, 'nonExistingPage');
                expect(compRef).toBe(null);
            });

            it('should return the component with given id in current url page and current view mode if no page Id or view mode specified - desktop', function(){
                var compRef = documentServices.components.get.byId(this.imageRef.id);
                expect(compRef.id).toBe(this.imageRef.id);
                expect(isMobileRef(compRef)).toBe(false);
            });

            it('should return the component with given id in current url page and current view mode if no page Id or view mode specified - mobile', function(done){
                documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.MOBILE);

                documentServices.waitForChangesApplied(function(){
                    var compRef = documentServices.components.get.byId(this.imageRef.id);
                    expect(compRef.id).toBe(this.imageRef.id);
                    expect(isMobileRef(compRef)).toBe(true);
                    documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.DESKTOP);
                    documentServices.waitForChangesApplied(done);
                }.bind(this));
            });

            it('should return the component with given id in given page (even if not current)', function(done){
                var currentPageId = documentServices.pages.getFocusedPageId();
                var otherPageId = 'i49k6';
                expect(currentPageId).not.toBe(otherPageId);
                //TODO: navigate is still an issue..
                documentServices.pages.navigateTo(otherPageId);
                documentServices.waitForChangesApplied(function(){
                    expect(documentServices.pages.getFocusedPageId()).toBe(otherPageId);
                    var compRef = documentServices.components.get.byId(this.imageRef.id, currentPageId);
                    expect(compRef.id).toBe(this.imageRef.id);
                    _.defer(done);
                }.bind(this));
            });

            it('should return the component with the given id in the given view mode (even if not current)', function(done){
                documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.MOBILE);
                documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.DESKTOP);
                var currentPageId = documentServices.pages.getFocusedPageId();
                var otherPageId = 'i49k6';
                expect(currentPageId).not.toBe(otherPageId);
                //TODO: navigate is still an issue..
                documentServices.pages.navigateTo(otherPageId);
                documentServices.waitForChangesApplied(function(){
                    expect(documentServices.viewMode.get()).toBe(documentServices.viewMode.VIEW_MODES.DESKTOP);
                    var compRef = documentServices.components.get.byId(this.imageRef.id, currentPageId, documentServices.viewMode.VIEW_MODES.MOBILE);
                    expect(compRef.id).toBe(this.imageRef.id);
                    _.defer(done);
                }.bind(this));
            });
        });

        describe('byXYRelativeToStructure', function () {
            var focusedPageRef;

            function createComponentOnRef(parentRef, x, y) {
                var containerLayout = {layout: {x: x, y: y}};
                var containerDef = componentUtils.getComponentDef(documentServices, 'CONTAINER', containerLayout);
                return dsComponents.add(parentRef, containerDef);
            }

            beforeAll(function () {

            });

            beforeEach(function () {
                focusedPageRef = documentServices.pages.getFocusedPage();
            });

            afterEach(function(done){
                generalUtils.cleanPage(documentServices, focusedPageRef);
                documentServices.waitForChangesApplied(done);
            });

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.get.byXYRelativeToStructure');
            });

            describe('When there are no components in focused page', function () {
                it('should return the 3 components PAGES_CONTAINER, SITE_PAGES and PAGE', function () {
                    var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                    var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;
                    var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(pageLeft + 1, pageTop + 1);

                    expect(componentsAtCoordinates.length).toBe(3);
                });
            });

            describe('When there is a single component in focused page', function () {
                it('should not return the component if getting X,Y not on component', function (done) {
                    var compX = 50;
                    var compY = 50;
                    var compRef = createComponentOnRef(focusedPageRef, compX, compY);

                    documentServices.waitForChangesApplied(function () {
                        var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                        var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;

                        var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(pageLeft + compX - 1, pageTop + compY - 1);

                        expect(componentsAtCoordinates.length).toBe(3);
                        expect(componentsAtCoordinates).not.toContain(compRef);
                        done();
                    });

                });

                it('should return the component in the result array as the first element if getting its X,Y', function (done) {
                    var compX = 50;
                    var compY = 50;
                    var compRef = createComponentOnRef(focusedPageRef, compX, compY);

                    documentServices.waitForChangesApplied(function () {
                        var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                        var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;

                        var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(pageLeft + compX + 1, pageTop + compY + 1);

                        expect(componentsAtCoordinates.length).toBe(4);
                        expect(componentsAtCoordinates).toContain(compRef);
                        expect(_.findIndex(componentsAtCoordinates, compRef)).toBe(0);
                        done();
                    });
                });
            });

            describe('When there are two components in focused page', function () {
                it('should not return the componentTwo if given X,Y of only componentOne', function (done) {
                    var compOneX = 50;
                    var compOneY = 50;
                    var compOneRef = createComponentOnRef(focusedPageRef, compOneX, compOneY);

                    var compTwoX = 60;
                    var compTwoY = 60;
                    var compTwoRef = createComponentOnRef(focusedPageRef, compTwoX, compTwoY);

                    documentServices.waitForChangesApplied(function () {
                        var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                        var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;

                        var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(
                            pageLeft + compOneX + 1,
                            pageTop + compOneY + 1
                        );

                        expect(componentsAtCoordinates.length).toBe(4);
                        expect(componentsAtCoordinates).toContain(compOneRef);
                        expect(componentsAtCoordinates).not.toContain(compTwoRef);
                        expect(_.findIndex(componentsAtCoordinates, compOneRef)).toBe(0);
                        done();
                    });
                });

                it('should return the top component first if componentTwo is on componentOne', function (done) {
                    var compOneX = 50;
                    var compOneY = 50;
                    var compOneRef = createComponentOnRef(focusedPageRef, compOneX, compOneY);

                    var compTwoX = 60;
                    var compTwoY = 60;
                    var compTwoRef = createComponentOnRef(focusedPageRef, compTwoX, compTwoY);

                    documentServices.waitForChangesApplied(function () {
                        var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                        var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;

                        var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(
                            pageLeft + compTwoX + 1,
                            pageTop + compTwoY + 1
                        );

                        expect(componentsAtCoordinates.length).toBe(5);
                        expect(componentsAtCoordinates).toContain(compOneRef);
                        expect(componentsAtCoordinates).toContain(compTwoRef);
                        expect(_.findIndex(componentsAtCoordinates, compTwoRef)).toBe(0);
                        expect(_.findIndex(componentsAtCoordinates, compOneRef)).toBe(1);
                        done();
                    });
                });

                it('should return the child component first if componentTwo is the child of componentOne', function (done) {
                    var compOneX = 50;
                    var compOneY = 50;
                    var compOneRef = createComponentOnRef(focusedPageRef, compOneX, compOneY);

                    var compTwoX = 60;
                    var compTwoY = 60;
                    var compTwoRef = createComponentOnRef(compOneRef, compTwoX, compTwoY);

                    documentServices.waitForChangesApplied(function () {
                        var pageLeft = dsComponents.layout.getRelativeToStructure(focusedPageRef).x;
                        var pageTop = dsComponents.layout.getRelativeToStructure(focusedPageRef).y;

                        var componentsAtCoordinates = dsComponents.get.byXYRelativeToStructure(
                            pageLeft + compOneX + compTwoX + 1,
                            pageTop + compOneY + compTwoY + 1
                        );

                        expect(componentsAtCoordinates.length).toBe(5);
                        expect(componentsAtCoordinates).toContain(compOneRef);
                        expect(componentsAtCoordinates).toContain(compTwoRef);
                        expect(_.findIndex(componentsAtCoordinates, compTwoRef)).toBe(0);
                        expect(_.findIndex(componentsAtCoordinates, compOneRef)).toBe(1);
                        done();
                    });
                });
            });

        });
    });
});
