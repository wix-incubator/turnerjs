define(["lodash", "core", "testUtils", "Squire"], function (_, core, testUtils, Squire) {
    "use strict";

    var mock = testUtils.mockFactory.dataMocks;

    var appPartData = mock.appPartData({
        "appInnerID": "1"
    });

    var structure = {
        "type": "Component",
        "layout": {},
        "styleId": "appPartStyle",
        "id": "appPartId",
        "dataQuery": "#" + appPartData.id,
        "skin": "wysiwyg.viewer.skins.AppPartSkin",
        "propertyQuery": appPartData.id,
        "componentType": "wixapps.integration.components.AppPart"
    };

    var themeData = {
        "img1": {
            "skin": "fake.image.Skin1"
        },
        "img2": {
            "skin": "fake.image.Skin2"
        },
        "img3": {
            "skin": "fake.image.Skin3"
        },
        "ns1": {
            "skin": "fake.ns.Skin1"
        },
        "ns2": {
            "skin": "fake.ns.Skin2"
        }
    };

    var injector = new Squire();
    var styleData = {
        styleNSMap: {},
        defaultStylesMap: {}
    };
    var builder = injector.mock({
        skins: {
            skins: {
                "fake.image.Skin1": {},
                "fake.image.Skin2": {},
                "fake.image.Skin3": {},
                "fake.ns.Skin1": {},
                "fake.ns.Skin2": {}
            }
        },
        "wixappsCore/core/styleData": styleData
    });

    xdescribe("AppPart style collection", function () {

        beforeEach(function (done) {
            var self = this;
            builder.require(['wixappsClassics/core/appPartStyleCollector', 'core', "wixappsCore"], function (appCollector, _core, wixapps) {
                self.core = _core;
                self.siteData = new core.SiteData({}, function () {});
                self.wixappsDataHandler = wixapps.wixappsDataHandler;
                spyOn(self.siteData, 'getDataByQuery').and.returnValue(appPartData);
                spyOn(self.siteData, 'getClientSpecMapEntry').and.returnValue({packageName: "classicApp"});
                done();
            });
        });

        afterEach(function (done) {
            _.forOwn(styleData.styleNSMap, function (v, k) {
                delete styleData.styleNSMap[k];
            });
            _.forOwn(styleData.defaultStylesMap, function (v, k) {
                delete styleData.styleNSMap[k];
            });
            done();
        });

        describe("should collect styles from views", function () {

            it("should iterate over all children [items]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({
                    views: [
                        {
                            "name": "TestView", "forType": "Test", "comp": {
                                "name": "HBox", "items": [
                                    {"comp": {"name": "Image", "style": "img1"}},
                                    {"comp": {"name": "Image", "skin": "fake.image.Skin1"}}
                                ]
                            }
                        }
                    ]
                });

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles.img1).toBeDefined();
                expect(loadedStyles["fake.image.Skin1"]).toBeDefined();
            });

            it("should iterate over all children [cases]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({
                    views: [
                        {
                            "name": "TestView", "forType": "Test", "comp": {
                                "name": "SwitchBox", "cases": {
                                    "default": [
                                        {"comp": {"name": "Image", "style": "img1"}},
                                        {"comp": {"name": "Image", "skin": "fake.image.Skin1"}}
                                    ],
                                    "not-default": [
                                        {"comp": {"name": "Image", "style": "img2"}},
                                        {"comp": {"name": "Image", "skin": "fake.image.Skin2"}}
                                    ]
                                }
                            }
                        }
                    ]
                });

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles.img1).toBeDefined();
                expect(loadedStyles["fake.image.Skin1"]).toBeDefined();
                expect(loadedStyles.img2).toBeDefined();
                expect(loadedStyles["fake.image.Skin2"]).toBeDefined();
            });

            it("should iterate over all children [templates]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({
                    views: [
                        {
                            "name": "TestView", "forType": "Test", "comp": {
                                "name": "List2", "templates": {
                                    "item": {"comp": {"name": "Image", "style": "img1"}},
                                    "first": {"comp": {"name": "Image", "skin": "fake.image.Skin2"}},
                                    "last": {"comp": {"name": "Image", "style": "img3", "skin": "fake.image.Skin3"}}
                                }
                            }
                        }
                    ]
                });

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles.img1).toBeDefined();
                expect(loadedStyles["fake.image.Skin1"]).not.toBeDefined();
                expect(loadedStyles.img2).not.toBeDefined();
                expect(loadedStyles["fake.image.Skin2"]).toBeDefined();
                expect(loadedStyles.img3).toBeDefined();
                expect(loadedStyles["fake.image.Skin3"]).not.toBeDefined();
            });

        });

        describe("should collect styles from descriptor customizations", function () {

            it("should find customizations on [comp.style]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({
                    customizations: [
                        {"forType": "SomeType", "view": "View1", "fieldId": "aField", "key": "comp.style", "value": "img1"}
                    ]
                });

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles.img1).toBeDefined();
            });

            it("should find customizations on [comp.skin]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({
                    customizations: [
                        {"forType": "SomeType", "view": "View1", "fieldId": "aField", "key": "comp.skin", "value": "fake.image.Skin1"}
                    ]
                });

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles["fake.image.Skin1"]).toBeDefined();
            });

        });

        describe("should collect styles from AppPart data customizations", function () {

            afterEach(function (done) {
                delete appPartData.appLogicCustomizations;
                done();
            });

            it("should find customizations on [comp.style]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({});

                appPartData.appLogicCustomizations = [
                    {"forType": "SomeType", "view": "View1", "fieldId": "aField", "key": "comp.style", "value": "img1"}
                ];

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles.img1).toBeDefined();
            });

            it("should find customizations on [comp.skin]", function () {
                var loadedStyles = {};
                spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({});

                appPartData.appLogicCustomizations = [
                    {"forType": "SomeType", "view": "View1", "fieldId": "aField", "key": "comp.skin", "value": "fake.image.Skin1"}
                ];

                this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

                expect(loadedStyles).toBeDefined();
                expect(loadedStyles["fake.image.Skin1"]).toBeDefined();
            });

        });

        it("should collect styles from styleNSMap", function () {
            var loadedStyles = {};
            spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({});

            styleData.styleNSMap.SomeProxy = {
                'default': {'skin': 'fake.ns.skin1', 'style': 'ns1'},
                'other': {'skin': 'fake.ns.skin2', 'style': 'ns2'}
            };

            this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

            expect(loadedStyles).toBeDefined();
            expect(loadedStyles.ns1).toBeDefined();
            expect(loadedStyles.ns2).toBeDefined();
        });

        it("should collect styles from defaultStylesMap", function () {
            var loadedStyles = {};
            spyOn(this.wixappsDataHandler, "getDescriptor").and.returnValue({});

            styleData.defaultStylesMap.SomeProxy = {'skin': 'fake.ns.skin1', 'style': 'ns1'};

            this.core.styleCollector.collectStyleIdsFromStructure(structure, themeData, this.siteData, loadedStyles, 'pageId');

            expect(loadedStyles).toBeDefined();
            expect(loadedStyles.ns1).toBeDefined();
        });

    });

});
