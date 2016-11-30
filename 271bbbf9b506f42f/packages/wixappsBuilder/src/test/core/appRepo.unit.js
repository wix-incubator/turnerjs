define(['wixappsBuilder/core/appRepo', 'wixappsBuilder/core/dataSelectorFactory', 'wixappsCore'], function (/** appRepo */ appRepo, dataSelectorFactory, /** wixappsCore */ wixapps) {
    'use strict';

    var siteData = "siteData";

    describe('AppRepo', function () {

        var repo = {
            parts: {
                somePart: {},
                partWithoutDataSelector: {},
                partWithNonExistantDataSelector: {dataSelector: "nonExistantSelectorId"},
                partWithDataSelector: {dataSelector: "selectorId"},
                partWithDataSelectorDef: {dataSelectorDef: {id: "selectorId"}}
            },
            dataSelectors: {selectorId: "xxx"},
            views: {
                "Array|someView1": "megaView",
                "Array|someView1|Mobile": "mobileMegaView",
                "Array|someView2": "littleView",
                "Array|someView3|Mobile": "tinyMobileView"
            }
        };

        describe('getDataSelector', function () {
            it('no part definition - null', function () {
                var dataSelector = appRepo.getDataSelector(repo, 'nonExistantPartName', siteData, null, 1);

                expect(dataSelector).toBeNull();
            });
            it('no dataSelector definition - null', function () {
                var dataSelector = appRepo.getDataSelector(repo, 'partWithoutDataSelector', siteData, null, 1);

                expect(dataSelector).toBeNull();
            });
            it('part has dataSelector that doesnt exist - null', function () {
                var dataSelector = appRepo.getDataSelector(repo, 'partWithNonExistantDataSelector', siteData, null, 1);

                expect(dataSelector).toBeNull();
            });
            it('has dataSelector property - returns the dataSelector from the dataSelectorFactory', function () {
                spyOn(dataSelectorFactory, 'getDataSelector').and.callFake(function (dataSelectorDef, siteDataParam) {
                    expect(dataSelectorDef).toEqual("xxx");
                    expect(siteDataParam).toEqual("siteData");
                    return "dataSelector";
                });

                var dataSelector = appRepo.getDataSelector(repo, 'partWithDataSelector', siteData, null, 1);

                expect(dataSelector).toEqual("dataSelector");
            });
            it('has dataSelectorDef property - returns the dataSelector from the dataSelectorFactory', function () {
                spyOn(dataSelectorFactory, 'getDataSelector').and.callFake(function (dataSelectorDef, siteDataParam) {
                    expect(dataSelectorDef).toEqual("xxx");
                    expect(siteDataParam).toEqual("siteData");
                    return "dataSelector";
                });

                var dataSelector = appRepo.getDataSelector(repo, 'partWithDataSelectorDef', siteData, null, 1);

                expect(dataSelector).toEqual("dataSelector");
            });
        });

        describe('getAppPartDefinition', function () {
            it('no part definition - null', function () {
                var somePart = appRepo.getAppPartDefinition(repo, 'nonExistantPartName');

                expect(somePart).toBeUndefined();
            });
            it('has part definition - the part definition', function () {
                var somePart = appRepo.getAppPartDefinition(repo, 'somePart');

                expect(somePart).toBe(repo.parts.somePart);
            });
        });

        describe('getViewDef', function () {

            beforeEach(function () {
                spyOn(wixapps.viewsUtils, 'fillViewDefMissingIDs').and.callFake(function (viewDef) {
                    return viewDef;
                });
            });

            it('no view - undefined', function () {
                var viewDef = appRepo.getViewDef(repo, 'nonExistantPartName', 'Array', 'Mobile');

                expect(viewDef).toBeUndefined();
                expect(wixapps.viewsUtils.fillViewDefMissingIDs).not.toHaveBeenCalled();
            });
            it('has the view but for different type - undefined', function () {
                var viewDef = appRepo.getViewDef(repo, 'someView1', 'Object', 'Mobile');

                expect(viewDef).toBeUndefined();
                expect(wixapps.viewsUtils.fillViewDefMissingIDs).not.toHaveBeenCalled();
            });
            it('has only non formatted view - gets it', function () {
                var viewDef = appRepo.getViewDef(repo, 'someView2', 'Array', 'Mobile');

                expect(viewDef).toBe(repo.views["Array|someView2"]);
            });
            it('has only formatted view - gets it', function () {
                var viewDef = appRepo.getViewDef(repo, 'someView3', 'Array', 'Mobile');

                expect(viewDef).toBe(repo.views["Array|someView3|Mobile"]);
            });
            it('has both formatted and non-formatted view - gets it', function () {
                var viewDef = appRepo.getViewDef(repo, 'someView1', 'Array', 'Mobile');

                expect(viewDef).toBe(repo.views["Array|someView1|Mobile"]);
            });
        });

        describe('getNamesOfPartsOfType', function() {
            it('should return all part names with a specific type', function() {
                repo = {
                    parts: {
                        partWithGivenType: {
                            type: 'givenType'
                        },
                        partWithGivenType2: {
                            type: 'givenType'
                        }
                    }
                };
                expect(appRepo.getNamesOfPartsOfType(repo, 'givenType')).toEqual(['partWithGivenType', 'partWithGivenType2']);
            });

            it('should not return parts with a different type', function() {
                repo = {
                    parts: {
                        partWithGivenType: {
                            type: 'givenType'
                        },
                        partWithAnotherType: {
                            type: 'anotherType'
                        }
                    }
                };
                expect(appRepo.getNamesOfPartsOfType(repo, 'givenType')).not.toContain('partWithAnotherType');
            });

            it('should return an empty array if no parts defined with the given type', function() {
                repo = {
                    parts: {
                        partWithAnotherType: {
                            type: 'anotherType'
                        }
                    }
                };
                expect(appRepo.getNamesOfPartsOfType(repo, 'givenType')).toEqual([]);

            });
        });
    });
});
