define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, apiCoverageUtils) {
    'use strict';

    describe('Document Services - Mobile Conversion', function () {

        var documentServices;
        var containerDef;
        var focusedPageRef;

        function getMobilePointer(comp, page) {
            return documentServices.components.get.byId(comp.id, (page || focusedPageRef).id, 'MOBILE');
        }

        beforeEach(function (done) {
            var siteParameter = {
                experimentsOn: ['viewerGeneratedAnchors', 'removeJsonAnchors', 'sv_zeroGapsThreshold']
            };
            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing mobile conversion spec');
                documentServices.mobile.enableOptimizedView(true);
                documentServices.waitForChangesApplied(done);
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobileConversion.resetMobileLayoutOnAllPages');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.reLayoutPage');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.isOptimized');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.enableOptimizedView');
        });

        describe("Enabling/disabling opitimized view", function () {
            it("should not be there when turning off mobile optimized view", function (done) {
                expect(documentServices.mobile.isOptimized()).toEqual(true);
                documentServices.mobile.enableOptimizedView(false);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.mobile.isOptimized()).toEqual(false);
                    done();
                });
            });
        });

        describe("Adding a component", function () {
            beforeEach(function (done) {
                documentServices.viewMode.set('DESKTOP');
                containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                documentServices.waitForChangesApplied(function () {
                    focusedPageRef = documentServices.pages.getFocusedPage();
                    done();
                });
            });

            it("should not be there in mobile before the algo runs", function (done) {
                var customId = "comp0";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    expect(mobileComp).toBeFalsy();
                    done();
                });
            });

            it("should be there when switching viewMode to mobile", function (done) {
                var customId = "comp1";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    var layout = documentServices.components.layout.get(mobileComp);
                    expect(layout.width).toEqual(280);
                    expect(layout.x).toEqual(20);
                    done();
                });
            });

            it("should be there on all pages when running resetMobileLayoutOnAllPages", function (done) {
                var customId = "comp21";
                var customId2 = "comp22";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                var page2 = documentServices.pages.add("page2");
                var compPointer2 = documentServices.components.add(page2, containerDef, customId2);
                documentServices.mobileConversion.resetMobileLayoutOnAllPages();

                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    var mobileComp2 = getMobilePointer(compPointer2, page2);
                    var newLayout = documentServices.components.layout.get(mobileComp);
                    var newLayout2 = documentServices.components.layout.get(mobileComp2);
                    expect(newLayout.width).toEqual(newLayout2.width);
                    done();
                });
            });

            it("should be there only on selected page when running mobile.reLayout", function (done) {
                var customId = "comp31";
                var customId2 = "comp32";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                var page3 = documentServices.pages.add("page3");
                var compPointer2 = documentServices.components.add(page3, containerDef, customId2);

                documentServices.mobile.reLayoutPage(focusedPageRef.id);
                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    var mobileComp2 = getMobilePointer(compPointer2, page3);
                    var newLayout = documentServices.components.layout.get(mobileComp);
                    var newLayout2 = documentServices.components.layout.get(mobileComp2);
                    expect(newLayout.width).not.toEqual(newLayout2.width);
                    done();
                });
            });

            it("should be there when running mobile.reLayout", function (done) {
                var customId = "comp3";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.mobile.reLayoutPage(focusedPageRef.id);

                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    var newLayout = documentServices.components.layout.get(mobileComp);
                    expect(newLayout.width).toEqual(280);
                    done();
                });
            });

            it("should retain default layout when running mobile.reLayout", function (done) {
                var customId = "comp4";
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    var mobileComp = getMobilePointer(compPointer);
                    expect(mobileComp).toBeTruthy();
                    var layout = documentServices.components.layout.get(mobileComp);
                    documentServices.components.layout.update(mobileComp, {x: 100, width: 50});

                    documentServices.mobile.reLayoutPage(focusedPageRef.id);
                    documentServices.waitForChangesApplied(function () {
                        var newLayout = documentServices.components.layout.get(mobileComp);
                        expect(newLayout.x).toEqual(layout.x);
                        done();
                    });
                });
            });

            it("should not be affected by disabling optimized view", function (done) {
                var customId = "comp5";
                containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.mobile.enableOptimizedView(false);
                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.mobile.isOptimized()).toEqual(false);
                    var mobileComp = getMobilePointer(compPointer);
                    var newLayout = documentServices.components.layout.get(mobileComp);
                    expect(newLayout.width).toEqual(280);
                    done();
                });
            });

            describe('anchors update', function () {
                it('should create new anchors for component added in desktop, when merging structure', function (done) {
                    var topCompId = "comp21";
                    var bottomCompId = "comp22";
                    var topCompLayout = {
                        layout: {
                            y: 50,
                            height: 50
                        }
                    };
                    var bottomCompLayout = {
                        layout: {
                            y: 150,
                            height: 100
                        }
                    };
                    var bottomComp = documentServices.components.add(focusedPageRef, _.merge({}, containerDef, bottomCompLayout), bottomCompId);
                    documentServices.mobileConversion.resetMobileLayoutOnAllPages();
                    var topComp = documentServices.components.add(focusedPageRef, _.merge({}, containerDef, topCompLayout), topCompId);
                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(function () {
                        var mobileTopComp = getMobilePointer(topComp);
                        var mobileBottomComp = getMobilePointer(bottomComp);
                        var oldTopLayout = documentServices.components.layout.get(mobileTopComp);
                        var oldBottomLayout = documentServices.components.layout.get(mobileBottomComp);

                        documentServices.components.layout.updateAndAdjustLayout(mobileTopComp, {y: oldTopLayout.y + 50});

                        documentServices.waitForChangesApplied(function () {
                            var newBottomLayout = documentServices.components.layout.get(mobileBottomComp);
                            expect(newBottomLayout.y).toEqual(oldBottomLayout.y + 50);
                            done();
                        });
                    });
                });

                it('should create new anchors for components, when running full algorithm', function (done) {
                    var customId = "comp21";
                    var customId2 = "comp22";
                    var comp1Layout = {
                        layout: {
                            y: 50,
                            height: 50
                        }
                    };
                    var comp2Layout = {
                        layout: {
                            y: 150,
                            height: 100
                        }
                    };
                    var compPointer = documentServices.components.add(focusedPageRef, _.merge({}, containerDef, comp1Layout), customId);
                    var compPointer2 = documentServices.components.add(focusedPageRef, _.merge({}, containerDef, comp2Layout), customId2);

                    documentServices.mobileConversion.resetMobileLayoutOnAllPages();

                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(function () {
                        var mobileComp = getMobilePointer(compPointer);
                        var mobileComp2 = getMobilePointer(compPointer2);
                        var oldLayout = documentServices.components.layout.get(mobileComp);
                        var oldLayout2 = documentServices.components.layout.get(mobileComp2);

                        documentServices.components.layout.updateAndAdjustLayout(mobileComp, {y: oldLayout.y + 50});

                        documentServices.waitForChangesApplied(function () {
                            var newLayout2 = documentServices.components.layout.get(mobileComp2);
                            expect(newLayout2.y).toBeGreaterThan(oldLayout2.y);
                            expect(newLayout2.y).toEqual(oldLayout2.y + 50);
                            done();
                        });
                    });
                });
            });
        });

        describe('masterPage', function() {
            it('should close gaps between header, footer and pages container', function(done) {
                var header = getMobilePointer({id: 'SITE_HEADER'}, 'masterPage');
                var footer = getMobilePointer({id: 'SITE_FOOTER'}, 'masterPage');
                var pagesContainer = getMobilePointer({id: 'PAGES_CONTAINER'}, 'masterPage');
                documentServices.viewMode.set('MOBILE');
                documentServices.viewMode.set('DESKTOP');
                documentServices.components.layout.update(header, {y: 0, height: 100});
                documentServices.components.layout.update(pagesContainer, {y: 130, height: 200});
                documentServices.components.layout.update(footer, {y: 500, height: 300});
                documentServices.viewMode.set('MOBILE');

                function getLayout(comp) {
                    return _.pick(documentServices.components.layout.getRelativeToStructure(comp), ['x', 'y', 'width', 'height']);
                }

                documentServices.waitForChangesApplied(function() {
                    var headerLayout = getLayout(header);
                    var footerLayout = getLayout(footer);
                    var pagesContainerLayout = getLayout(pagesContainer);
                    expect(headerLayout).toEqual({x: 0, y: 0, width: 320, height: 100});
                    expect(pagesContainerLayout).toEqual({x: 0, y: 100, width: 320, height: 200});
                    expect(footerLayout).toEqual({x: 0, y: 300, width: 320, height: 300});
                    done();
                });
            });
        });

        describe("removing a component", function(){
            var desktopCompPointer;
            beforeEach(function (done) {
                documentServices.viewMode.set('DESKTOP');
                containerDef = componentUtils.getComponentDef(documentServices, "STRIP_COLUMNS_CONTAINER");

                documentServices.waitForChangesApplied(function () {
                    focusedPageRef = documentServices.pages.getFocusedPage();
                    desktopCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.viewMode.set('MOBILE');
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.waitForChangesApplied(done);
                });
            });

            it("should remove the component from the mobile structure", function(done){
                var mobileCompPointer = getMobilePointer(desktopCompPointer, focusedPageRef);
                documentServices.components.remove(desktopCompPointer);
                documentServices.viewMode.set('MOBILE');
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.components.is.exist(mobileCompPointer)).toBe(false);
                    done();
                });
            });

            it("should remove the designData and component properties for components which were removed", function(done){
                var mobileCompPointer = getMobilePointer(desktopCompPointer, focusedPageRef);
                documentServices.components.properties.mobile.fork(mobileCompPointer);
                documentServices.waitForChangesApplied(function () {
                    var mobileProps = documentServices.components.properties.get(mobileCompPointer);
                    var mobileDesignData = documentServices.components.design.get(mobileCompPointer);
                    var propertiesId = mobileProps.id;
                    var designId = mobileDesignData.id;

                    documentServices.components.remove(desktopCompPointer);
                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(function () {
                        //expect mobile properties & design data not to exist
                        expect(documentServices.properties.getById(propertiesId, focusedPageRef.id)).toBe(null);
                        expect(documentServices.design.getById(designId, focusedPageRef.id)).toBe(null);
                        done();
                    });
                });
            });
        });
    });
});
