define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, apiCoverageUtils) {
    "use strict";

    describe("Document Services - Component - Properties - Mobile", function () {

        var documentServices;
        var photoRef, photoMobileRef;
        var focusedPageRef;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing properties mobile spec');
                done();
            });
        });

        beforeEach(function (done) {
            photoRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
            var VIEW_MODES = documentServices.viewMode.VIEW_MODES;
            //we switch to mobile so that the mobile will be created
            documentServices.viewMode.set(VIEW_MODES.MOBILE);
            documentServices.viewMode.set(VIEW_MODES.DESKTOP);
            documentServices.waitForChangesApplied(function () {
                photoMobileRef = documentServices.components.get.byId(photoRef.id, documentServices.pages.getFocusedPageId(), VIEW_MODES.MOBILE);
                done();
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.properties.mobile.join');
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.properties.mobile.fork');
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.properties.mobile.isForked');
        });

        it("should fork the properties of a component into two different ones", function (done) {
            var desktopProps = documentServices.components.properties.get(photoRef);
            expect(desktopProps).not.toBeNull();

            documentServices.components.properties.mobile.fork(photoMobileRef);
            documentServices.waitForChangesApplied(function () {
                var mobileProps = documentServices.components.properties.get(photoMobileRef);
                expect(_.omit(desktopProps, 'id')).toEqual(_.omit(mobileProps, 'id'));
                expect(desktopProps.id).not.toEqual(mobileProps.id);
                done();
            });
        });

        it("should join the properties of a component to a single one. (the desktop's)", function (done) {
            var desktopProps = documentServices.components.properties.get(photoRef);
            documentServices.components.properties.mobile.fork(photoMobileRef);
            documentServices.components.properties.update(photoMobileRef, {displayMode: "stretch"});

            documentServices.waitForChangesApplied(function () {
                var mobileProps = documentServices.components.properties.get(photoMobileRef);
                expect(mobileProps.displayMode).not.toEqual(desktopProps.displayMode);
                documentServices.components.properties.mobile.join(photoMobileRef);

                documentServices.waitForChangesApplied(function () {
                    mobileProps = documentServices.components.properties.get(photoMobileRef);
                    expect(_.omit(desktopProps, 'id')).toEqual(_.omit(mobileProps, 'id'));
                    expect(desktopProps.id).not.toEqual(mobileProps.id);
                    done();
                });
            });
        });

        it("should return the fork state of mobile components properties", function (done) {
            expect(documentServices.components.properties.mobile.isForked(photoMobileRef)).toEqual(false);
            documentServices.components.properties.mobile.fork(photoMobileRef);
            documentServices.waitForChangesApplied(function () {
                expect(documentServices.components.properties.mobile.isForked(photoMobileRef)).toEqual(true);
                done();
            });
        });
    });
});
