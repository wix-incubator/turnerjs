define(['lodash', 'santa-harness', 'componentUtils', 'errorUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, errorUtils, apiCoverageUtils) {
    'use strict';

    describe("Document Services ", function () {

        var styleIdCounter = 0;

        function getNewStyleId() {
            return 'newStyleId-' + styleIdCounter++;
        }

        var documentServices;
        var focusedPageRef;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing styles spec');
                done();
            });
        });

        function testGetStyleId() {
            var styleReturnedFromDS = this.getStyleIdFunction(this.componentIdentifier);
            expect(styleReturnedFromDS).toEqual(this.componentInitialDef.styleId);
        }

        function testSettingOfNewStyleId(newStyleId, done) {
            this.setStyleIdFunction(this.componentIdentifier, newStyleId);
            documentServices.waitForChangesApplied(function () {
                var resultStyleId = this.getStyleIdFunction(this.componentIdentifier);
                expect(resultStyleId).toEqual(newStyleId);
                done();
            }.bind(this));
        }

        function testSetStyleOfNonexistentComponent(done) {
            var originalValidStyleId = this.getStyleIdFunction(this.componentIdentifier);
            errorUtils.waitForError(documentServices, done, 'path type is not an array - null');
            this.setStyleIdFunction(this.nonExistingCompIdentifier, originalValidStyleId);
        }

        function testSettingNewCustomStyleAllParams(done) {
            var resultStyleId = this.setCustomFunction(this.componentIdentifier, this.validSkin, {}, this.newStyleId);
            documentServices.waitForChangesApplied(function () {
                var resultStyle = documentServices.theme.styles.get(this.newStyleId);
                expect(resultStyleId).toEqual(this.newStyleId);
                expect(resultStyle.skin).toEqual(this.validSkin);
                expect(resultStyle.style.properties).toEqual({});
                expect(resultStyle.style.propertiesSource).toEqual({});
                done();
            }.bind(this));
        }

        function testSettingNewCustomStyleOnlySkin(done) {
            var resultStyleId = this.setCustomFunction(this.componentIdentifier, this.validSkin, null, this.newStyleId);
            documentServices.waitForChangesApplied(function () {
                var resultStyle = documentServices.theme.styles.get(this.newStyleId);
                expect(resultStyleId).toEqual(this.newStyleId);
                expect(resultStyle.skin).toEqual(this.validSkin);
                expect(resultStyle.style.properties).toEqual({});
                expect(resultStyle.style.propertiesSource).toEqual({});
                done();
            }.bind(this));
        }

        function testSettingNewCustomStyleNoParams(done) {
            var currentSkin = documentServices.components.skin.get(this.componentRef);
            var currentStyleId = this.getStyleIdFunction(this.componentIdentifier);
            var currentStyle = documentServices.theme.styles.get(currentStyleId);
            var currentStyleProperties = currentStyle.style.properties;
            var currentStylePropertiesSource = currentStyle.style.propertiesSource;

            var resultStyleId = this.setCustomFunction(this.componentIdentifier);
            documentServices.waitForChangesApplied(function () {
                var resultStyle = documentServices.theme.styles.get(resultStyleId);
                expect(resultStyle.id).toEqual(resultStyleId);
                expect(resultStyle.skin).toEqual(currentSkin);
                expect(resultStyle.style.properties).toEqual(currentStyleProperties);
                expect(resultStyle.style.propertiesSource).toEqual(currentStylePropertiesSource || {});
                done();
            });
        }

        function testFailSettingNewCustomStyleOnInvalidSkin(done) {
            errorUtils.waitForError(documentServices, done, 'skin name param must be a string');
            this.setCustomFunction(this.componentIdentifier, this.invalidSkin, {}, this.newStyleId);
        }

        function testFailSettingNewCustomStyleOnInvalidParams(done) {
            errorUtils.waitForError(documentServices, done, 'style properties param must be an object');
            this.setCustomFunction(this.componentIdentifier, this.validSkin, [], this.newStyleId);
        }

        function testFailSettingNewCustomStyleOfNonexistentComponent(done) {
            errorUtils.waitForError(documentServices, done, 'component param does not exist');
            this.setCustomFunction(this.nonExistingCompIdentifier, this.validSkin, {}, this.newStyleId);
        }

        function testFailSettingNewCustomStyleWithExistentStyleIs(done) {
            var originalStyleId = this.getStyleIdFunction(this.componentIdentifier);
            errorUtils.waitForError(documentServices, done, 'style id param already exists and cannot be overridden with custom style');
            this.setCustomFunction(this.componentIdentifier, this.validSkin, {}, originalStyleId);
        }

        function testFailSettingNewCustomStyleOnInvalidStileId(done) {
            errorUtils.waitForError(documentServices, done, 'style id param must be a string');
            this.setCustomFunction(this.componentIdentifier, this.validSkin, {}, {});
        }

        describe("Component - Style and Skin", function () {

            beforeEach(function (done) {
                this.componentInitialDef = componentUtils.getComponentDef(documentServices, 'WPHOTO');
                this.componentDef = _.cloneDeep(this.componentInitialDef);
                this.componentRef = documentServices.components.add(focusedPageRef, this.componentDef);
                this.getStyleIdFunction = documentServices.components.style.getId;
                this.setStyleIdFunction = documentServices.components.style.setId;
                this.setCustomFunction = documentServices.components.style.setCustom;
                this.componentIdentifier = this.componentRef;
                this.validSkin = 'wysiwyg.viewer.skins.photo.CirclePhoto';
                documentServices.waitForChangesApplied(done);
            });

            describe("Get", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.style.getId');
                });

                it("should successfully get the style ID set in the component definition", function () {
                    testGetStyleId.call(this);
                });
            });

            describe("Set", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.style.setId');
                });

                it("should successfully set the component's style id", function (done) {
                    testSettingOfNewStyleId.call(this, 'wp2', done);
                });

                it("should fail style to set style id of a non existing component", function (done) {
                    this.nonExistingCompIdentifier = {id: 'fakeId', pageId: focusedPageRef};
                    testSetStyleOfNonexistentComponent.call(this, done);
                });
            });

            describe("Set custom", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.style.setCustom');
                });

                it("should create and set a new custom style when providing all params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleAllParams.call(this, done);
                });

                it("should create and set a new custom style when providing only skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleOnlySkin.call(this, done);
                });

                it("should create and set a new custom style when providing no params", function (done) {
                    testSettingNewCustomStyleNoParams.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.invalidSkin = 4;
                    testFailSettingNewCustomStyleOnInvalidSkin.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid style params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testFailSettingNewCustomStyleOnInvalidParams.call(this, done);
                });

                it("should fail to create and set a new custom style when providing a non-existent component", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.nonExistingCompIdentifier = {id: 'fakeId', type: 'DESKTOP'};
                    testFailSettingNewCustomStyleOfNonexistentComponent.call(this, done);
                });

                //TODO - fix - fails on timeout
                xit("should fail to create and set a new custom style when providing an optionalStyleId that already exists", function (done) {
                    testFailSettingNewCustomStyleWithExistentStyleIs.call(this, done);
                });

                //TODO - fix - returns error: path does not exist - pagesData,masterPage,data,theme_data,[object Object]
                xit("should fail to create and set a new custom style when invalid style id", function (done) {
                    testFailSettingNewCustomStyleOnInvalidStileId.call(this, done);
                });
            });
        });

        describe("Site Segment - Style and Skin", function () {

            beforeEach(function () {
                this.componentInitialDef = {
                    componentType: "wysiwyg.viewer.components.HeaderContainer",
                    styleId: 'hc1'
                };
                this.componentDef = _.cloneDeep(this.componentInitialDef);
                this.componentRef = documentServices.siteSegments.getHeader();
                this.getStyleIdFunction = documentServices.siteSegments.style.getId;
                this.setStyleIdFunction = documentServices.siteSegments.style.setId;
                this.setCustomFunction = documentServices.siteSegments.style.setCustom;
                this.validSkin = 'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen';
                this.componentIdentifier = this.componentRef;
            });

            describe("Get", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.style.getId');
                });

                it("should return the style ID set in the component definition", function () {
                    testGetStyleId.call(this);
                });
            });

            describe("Set", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.style.setId');
                });

                it("should successfully set the component's style id", function (done) {
                    testSettingOfNewStyleId.call(this, 'hc2', done);
                });

                it("should fail style to set style id of a non existing component", function (done) {
                    this.nonExistingCompIdentifier = {id: 'fakeId', pageId: focusedPageRef};
                    testSetStyleOfNonexistentComponent.call(this, done);
                });
            });

            describe("Set custom", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.style.setCustom');
                });

                it("should create and set a new custom style when providing all params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleAllParams.call(this, done);
                });

                it("should create and set a new custom style when providing only skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleOnlySkin.call(this, done);
                });

                it("should create and set a new custom style when providing no params", function (done) {
                    testSettingNewCustomStyleNoParams.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.invalidSkin = 4;
                    testFailSettingNewCustomStyleOnInvalidSkin.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid style params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testFailSettingNewCustomStyleOnInvalidParams.call(this, done);
                });

                it("should fail to create and set a new custom style when providing a non-existent component", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.nonExistingCompIdentifier = {id: 'fakeId', type: 'DESKTOP'};
                    testFailSettingNewCustomStyleOfNonexistentComponent.call(this, done);
                });

                //TODO - fix - fails on timeout
                xit("should fail to create and set a new custom style when providing an optionalStyleId that already exists", function (done) {
                    testFailSettingNewCustomStyleWithExistentStyleIs.call(this, done);
                });

                //TODO - fix - returns error: path does not exist - pagesData,masterPage,data,theme_data,[object Object]
                xit("should fail to create and set a new custom style when invalid style id", function (done) {
                    testFailSettingNewCustomStyleOnInvalidStileId.call(this, done);
                });
            });
        });

        describe("Pages - Style and Skin", function () {

            beforeEach(function (done) {
                this.componentInitialDef = {
                    componentType: "mobile.core.components.Page",
                    styleId: 'p2'
                };
                this.componentDef = _.cloneDeep(this.componentInitialDef);
                this.componentRef = documentServices.pages.add('Page');
                this.componentIdentifier = this.componentRef.id;
                this.getStyleIdFunction = documentServices.pages.style.getId;
                this.setStyleIdFunction = documentServices.pages.style.setId;
                this.setCustomFunction = documentServices.pages.style.setCustom;
                this.validSkin = 'wysiwyg.viewer.skins.page.SloopyPageSkin';
                documentServices.waitForChangesApplied(done);
            });

            describe("Get", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.pages.style.getId');
                });

                it("should return the style ID set in the component definition", function () {
                    testGetStyleId.call(this);
                });
            });

            describe("Set", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.pages.style.setId');
                });

                it("should successfully set the component's style id", function (done) {
                    testSettingOfNewStyleId.call(this, 'p1', done);
                });

                //TODO: function getPageStyleId fails to retrieve pointer out of fakeId. therefore it tries to get styleId of null
                //and fails on error "'Cannot read property 'type' of undefined'"
                xit("should fail style to set style id of a non existing component", function (done) {
                    this.nonExistingCompIdentifier = 'fakeId';
                    testSetStyleOfNonexistentComponent.call(this, done);
                });
            });

            describe("Set custom", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.pages.style.setCustom');
                });

                it("should create and set a new custom style when providing all params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleAllParams.call(this, done);
                });

                it("should create and set a new custom style when providing only skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    testSettingNewCustomStyleOnlySkin.call(this, done);
                });

                it("should create and set a new custom style when providing no params", function (done) {
                    testSettingNewCustomStyleNoParams.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid skin", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.invalidSkin = 4;
                    testFailSettingNewCustomStyleOnInvalidSkin.call(this, done);
                });

                it("should fail to create and set a new custom style when invalid style params", function (done) {
                    this.newStyleId = getNewStyleId();
                    testFailSettingNewCustomStyleOnInvalidParams.call(this, done);
                });

                //TODO: function getPageStyleId fails to retrieve pointer out of fakeId. therefore it tries to get styleId of null
                //and fails on error "'Cannot read property 'type' of undefined'"  instead of 'component param does not exist'
                xit("should fail to create and set a new custom style when providing a non-existent component", function (done) {
                    this.newStyleId = getNewStyleId();
                    this.nonExistingCompIdentifier = 'fakeId';
                    testFailSettingNewCustomStyleOfNonexistentComponent.call(this, done);
                });

                //TODO - fix - fails on timeout
                xit("should fail to create and set a new custom style when providing an optionalStyleId that already exists", function (done) {
                    testFailSettingNewCustomStyleWithExistentStyleIs.call(this, done);
                });

                //TODO - fix - returns error: path does not exist - pagesData,masterPage,data,theme_data,[object Object]
                xit("should fail to create and set a new custom style when invalid style id", function (done) {
                    testFailSettingNewCustomStyleOnInvalidStileId.call(this, done);
                });
            });
        });
    });
});

