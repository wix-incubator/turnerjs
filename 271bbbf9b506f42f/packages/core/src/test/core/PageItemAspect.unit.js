define(['lodash', 'testUtils', 'santaProps', 'core/core/pageItemRegistry', 'core/core/siteAspectsRegistry', 'siteUtils', 'react'],
    function (_, /** testUtils */ testUtils, santaProps, pageItemRegistry, siteAspectsRegistry, siteUtils, React) {
        "use strict";

        var PageItemAspect = siteAspectsRegistry.getSiteAspectConstructor('pageItem');

        describe("PageItemAspect", function () {
            var factory = testUtils.mockFactory;
            beforeEach(function () {
                this.siteData = factory.mockSiteData();
                this.siteAPI = factory.mockSiteAspectSiteAPI(this.siteData);
                this.pageItemAspect = new PageItemAspect(this.siteAPI);
            });

            function addInfoAndData(scope, type, pageItemAdditionalData) {
                scope.siteData.addData({type: type, id: 'item'});
                var info = scope.siteData.getExistingRootNavigationInfo(scope.siteData.getFocusedRootId());
                info = _.clone(info);
                info.pageItemId = 'item';
                if (pageItemAdditionalData){info.pageItemAdditionalData = pageItemAdditionalData;}
                scope.siteData.setRootNavigationInfo(info);
            }

            function spyOnStructureClassAndProps() {
                spyOn(pageItemRegistry, 'getCompStructure').and.returnValue({id: 'pageItemComp'});
                spyOn(santaProps.componentPropsBuilder, 'getCompProps').and.returnValue({id: 'pageItemComp'});
                spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(React.DOM.div);
            }

            describe("getReactComponents", function () {

                describe("There is no registry for the type", function () {

                    it("should return nothing when there is  no data item on pageItem", function () {
                        expect(this.pageItemAspect.getReactComponents()).toBeNull();
                    });

                    it("should return nothing if there is no registry for the type", function () {
                        addInfoAndData(this, 'someType');
                        expect(this.pageItemAspect.getReactComponents()).toBeNull();
                    });
                });

                describe("There is a registry for the type", function () {

                    function validateBasicProperties(items) {
                        expect(items.length).toBe(1);
                        expect(items[0].props.id).toBe('pageItemComp');
                    }

                    it("should return an array with the page item comp without pageItemAdditionalData prop when galleryId is not defined", function () {
                        addInfoAndData(this, 'Image');
                        spyOnStructureClassAndProps();

                        var items = this.pageItemAspect.getReactComponents();
                        validateBasicProperties(items);
                        expect(items[0].props.pageItemAdditionalData).toBeUndefined();
                    });


                    it("should return an array with the page item comp with proper pageItemAdditionalData props", function () {
                        addInfoAndData(this, 'Image', 'galleryId:sampleGalleryId');
                        spyOnStructureClassAndProps();

                        var items = this.pageItemAspect.getReactComponents();
                        validateBasicProperties(items);
                        expect(items[0].props.pageItemAdditionalData).toBe('sampleGalleryId');
                    });

                    it("should return an array with the page item comp with no pageItemAdditionalData prop when given non-galleryId data", function () {
                        addInfoAndData(this, 'Image', 'propertyQuery:samplePropertyQuery someOtherProperty:someOtherValue');
                        spyOnStructureClassAndProps();

                        var items = this.pageItemAspect.getReactComponents();
                        validateBasicProperties(items);
                        expect(items[0].props.pageItemAdditionalData).toBeUndefined();
                    });

                    it("should use styles map to create the comp props", function () {
                        addInfoAndData(this, 'someType');
                        spyOn(pageItemRegistry, 'getCompStructure').and.returnValue({id: 'pageItemComp'});
                        spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(React.DOM.div);
                        spyOn(santaProps.componentPropsBuilder, 'getCompProps').and.callFake(function (structure, siteApi, pageId, stylesMap) {
                            return {
                                id: 'pageItemComp',
                                styleId: stylesMap
                            };
                        });

                        var items = this.pageItemAspect.getReactComponents('stylesMap');
                        expect(items[0].props.styleId).toBe('stylesMap');
                    });
                });
            });

            describe("getComponentStructures", function () {

                describe("There is no registry for the type", function () {

                    it("should return nothing if no pageItem", function () {
                        expect(this.pageItemAspect.getComponentStructures()).toBeNull();
                    });

                    it("should return nothing", function () {
                        addInfoAndData(this, 'nonExistingType');
                        expect(this.pageItemAspect.getComponentStructures()).toBeNull();
                    });
                });

                describe("There is a registry for the type", function () {
                    function validateBasicProperties(structures) {
                        expect(structures.length).toBe(1);
                        expect(structures[0].id).toBe("imageZoomComp");
                    }

                    it("should return item structure with no propertyQuery when propertyQuery is not defined", function () {
                        addInfoAndData(this, 'Image');
                        var structures = this.pageItemAspect.getComponentStructures();
                        validateBasicProperties(structures);
                        expect(structures[0].propertyQuery).toBeUndefined();
                    });

                    it("should return page item structure propertyQuery when given proper propertyQuery", function () {
                        addInfoAndData(this, 'Image', 'propertyQuery:samplePropertyQuery');
                        var structures = this.pageItemAspect.getComponentStructures();
                        validateBasicProperties(structures);
                        expect(structures[0].propertyQuery).toBe("samplePropertyQuery");
                    });

                    it("should return item structure with no propertyQuery when given non-propertyQuery data", function () {
                        addInfoAndData(this, 'Image', 'galleryId:sampleGalleryId someOtherProperty:someOtherValue');
                        var structures = this.pageItemAspect.getComponentStructures();
                        validateBasicProperties(structures);
                        expect(structures[0].propertyQuery).toBeUndefined();
                    });
                });
            });
        });
    });
