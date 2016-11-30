define([
    'lodash',
    'santa-harness',
    'apiCoverageUtils',
    'componentUtils',
    'errorUtils',
    'generalUtils'
], function (
    _,
    santa,
    apiCoverageUtils,
    componentUtils,
    errorUtils,
    generalUtils
) {
    'use strict';

    describe('Document Services - Pages - Popups', function () {
        var ds, mainPage;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                console.log('Testing Popup spec');
                ds = harness.documentServices;
                mainPage = ds.pages.getFocusedPage();
            }).then(done, done.fail);
        });

        describe('when there is a not opened popup on site', function () {
            var popupPage;

            beforeAll(function (done) {
                var popupDefinition = componentUtils.getComponentDef(ds, 'POPUP');
                popupPage = ds.pages.popupPages.add('Popup', popupDefinition);
                generalUtils.waitForChangesApplied(ds).then(done, done.fail);
            });

            describe('getDataList()', function () {
                it('should return array of PageData items of popups', function () {
                    var dataList = ds.pages.popupPages.getDataList();
                    expect(dataList.length).toBeGreaterThan(0);
                    expect(dataList).toContain(jasmine.objectContaining({
                        type: 'Page',
                        id: popupPage.id
                    }));
                    expect(dataList).not.toContain(jasmine.objectContaining({
                        type: 'Page',
                        id: mainPage.id
                    }));
                    checkPopupFunctionAsTested('getDataList');
                });
            });

            describe('isPopup()', function () {
                afterAll(function () {
                    checkPopupFunctionAsTested('isPopup');
                });

                it('should return false for a non-popup page', function () {
                    expect(ds.pages.popupPages.isPopup(mainPage.id)).toBe(false);
                });

                it('should return true for a popup page', function () {
                    expect(ds.pages.popupPages.isPopup(popupPage.id)).toBe(true);
                });
            });

            describe('isPopupOpened()', function () {
                it('should return false', function () {
                    expect(ds.pages.popupPages.isPopupOpened()).toBe(false);
                });
            });

            describe('getCurrentPopupId()', function () {
                it('should return falsy value', function () {
                    expect(ds.pages.popupPages.getCurrentPopupId()).toBeFalsy();
                });
            });

            describe('getFocusedPageId()', function () {
                it('should return id of a main page', function () {
                    expect(ds.pages.getFocusedPageId()).toBe(mainPage.id);
                });
            });

            describe('and then popup is opened', function () {
                beforeAll(function (done) {
                    ds.pages.popupPages.open(popupPage.id, done);
                });

                afterAll(function (done) {
                    ds.pages.popupPages.close(function () {
                        checkPopupFunctionAsTested('open');
                        checkPopupFunctionAsTested('close');
                        done();
                    });
                });

                describe('isPopupOpened()', function () {
                    afterAll(function () {
                        checkPopupFunctionAsTested('isPopupOpened');
                    });

                    it('should return true', function () {
                        expect(ds.pages.popupPages.isPopupOpened()).toBe(true);
                    });
                });

                describe('getCurrentPopupId()', function () {
                    afterAll(function () {
                        checkPopupFunctionAsTested('getCurrentPopupId');
                    });

                    it('should return id of a currently opened popup', function () {
                        expect(ds.pages.popupPages.getCurrentPopupId()).toBe(popupPage.id);
                    });
                });

                describe('getFocusedPageId()', function () {
                    it('should return id of a currently opened popup', function () {
                        expect(ds.pages.getFocusedPageId()).toBe(popupPage.id);
                    });
                });

                describe('adding components', function () {
                    describe('when adding component to a popup page itself', function () {
                        it('should add it to a nested PopupContainer instead', function (done) {
                            var photoDef = componentUtils.getComponentDef(ds, 'WPHOTO');
                            var addedCompRef = ds.components.add(popupPage, photoDef);

                            generalUtils.waitForChangesApplied(ds).then(function () {
                                var containerRef = ds.components.getContainer(addedCompRef);
                                var popupChildren = ds.components.getChildren(popupPage);
                                expect(popupChildren.length).toBe(1);
                                expect(containerRef.id).toBe(popupChildren[0].id);
                                done();
                            }).catch(done.fail);
                        });
                    });

                    describe('when adding component to a popup container itself', function () {
                        it('should just add it to that popup container', function (done) {
                            var popupChildren = ds.components.getChildren(popupPage);
                            expect(popupChildren.length).toBe(1);
                            var photoDef = componentUtils.getComponentDef(ds, 'WPHOTO');
                            var addedCompRef = ds.components.add(popupChildren[0], photoDef);
                            generalUtils.waitForChangesApplied(ds).then(function () {
                                var containerRef = ds.components.getContainer(addedCompRef);
                                expect(containerRef.id).toBe(popupChildren[0].id);
                                done();
                            }).catch(done.fail);
                        });
                    });
                });
            });

            describe('side-effects operations', function () {
                afterEach(function (done) {
                    ds.pages.navigateTo(mainPage.id, done);
                });

                describe('duplicate()', function () {
                    afterAll(function () {
                        checkPopupFunctionAsTested('duplicate');
                    });

                    it('should duplicate currently opened popup', function (done) {
                        var duplicatePopup = ds.pages.popupPages.duplicate(popupPage.id);
                        expectUniquePopupPointer(duplicatePopup);
                        expectIsPopup(duplicatePopup.id, false);
                        generalUtils.waitForChangesApplied(ds).then(function () {
                            expectIsPopup(duplicatePopup.id, true);
                            ds.pages.popupPages.open(duplicatePopup.id, done);
                        }).catch(done.fail);
                    });
                });

                describe('add()', function () {
                    afterAll(function () {
                        checkPopupFunctionAsTested('add');
                    });

                    it('should be able to add a blank popup if no definition is passed', function (done) {
                        var addedPopup = ds.pages.popupPages.add('Blank Popup');
                        expectUniquePopupPointer(addedPopup);
                        expectIsPopup(addedPopup.id, false);
                        generalUtils.waitForChangesApplied(ds).then(function () {
                            expectIsPopup(addedPopup.id, true);
                            ds.pages.popupPages.open(addedPopup.id, done);
                        }).catch(done.fail);
                    });

                    it('should throw if the popup definition has no PopupContainer inside', function (done) {
                        var popupDefinition = componentUtils.getComponentDef(ds, 'POPUP');
                        popupDefinition.components = [];
                        popupDefinition.mobileComponents = [];
                        errorUtils.waitForError(ds, done, "Can't create a popup page. Main container inside the popup was not found");
                        ds.pages.popupPages.add('Popup', popupDefinition);
                    });

                    xit('[not implemented in DS] should delete all popup at the attempt to delete a popup container within', function () {
                        // TODO: gonna be a good test but we need to implement this first
                    });
                });

                describe('pages.remove()', function () {
                    beforeEach(function (done) {
                        ds.pages.popupPages.add('Extra');
                        ds.waitForChangesApplied(done);
                    });

                    it('should be able to remove popups as well', function (done) {
                        var otherPopupIds = _(ds.pages.popupPages.getDataList())
                            .map('id')
                            .without(popupPage.id)
                            .value();
                        otherPopupIds.forEach(function (popupId) {
                            ds.pages.remove(popupId);
                        });
                        generalUtils.waitForChangesApplied(ds)
                            .then(function () {
                                otherPopupIds.forEach(function (popupId) {
                                    expectIsPopup(popupId, false);
                                });
                            })
                            .then(done, done.fail);
                    });
                });
            });

            function expectUniquePopupPointer(pointer) {
                expect(typeof pointer).toBe('object');
                expect(typeof pointer.id).toBe('string');
                expect(typeof pointer.type).toBe('string');
                expect(pointer.id.length).toBeGreaterThan(1);
                expect(pointer.id).not.toEqual(mainPage.id);
                expect(pointer.id).not.toEqual(popupPage.id);
            }

            function expectIsPopup(popupId, value) {
                expect(ds.pages.popupPages.isPopup(popupId)).toBe(value || undefined);
            }

            function checkPopupFunctionAsTested(name) {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.popupPages.' + name);
            }
        });
    });
});
