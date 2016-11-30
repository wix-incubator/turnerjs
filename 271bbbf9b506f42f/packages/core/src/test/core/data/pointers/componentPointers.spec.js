define(['lodash',
    'core/core/data/pointers/pointersCache',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/DisplayedJsonDal',
    'utils'
    ], function(_, PointersCache, DataAceessPointers, DisplayedJsonDal, utils){
    "use strict";

    var constants = utils.constants;
    function getJsonWithMaster(components, mobileComponents){
        return {
            pagesData: {
                masterPage: {
                    structure: {
                        children: components || [],
                        mobileComponents: mobileComponents || []
                    }
                }
            }
        };
    }

    function getJsonWithPages(components, mobileComponents){
        return {
            pagesData: {
                page1: {
                    structure: {
                        id: 'page1',
                        components: components || [],
                        mobileComponents: mobileComponents || []
                    }
                }
            }
        };
    }

    describe("componentPointers", function(){
        function getComponent(pointersAndDal, id, viewMode){
            var mode = viewMode || constants.VIEW_MODES.DESKTOP;
            var pagePointer = pointersAndDal.pointers.components.getPage('page1', mode);
            return pointersAndDal.pointers.components.getComponent(id, pagePointer);
        }

        function getPointersAndDal(json){
            var cache = new PointersCache({getAllPossiblyRenderedRoots: function(){return ['masterPage', 'page1'];}}, json, json);
            var cacheForDal = cache.getBoundCacheInstance(false);
            var dal = new DisplayedJsonDal(json, cacheForDal);
            var pointers = new DataAceessPointers(cache);
            return {
                dal: dal,
                pointers: pointers
            };
        }

        describe("get component by id", function(){
            it("should return  page comp", function(){
                var json = getJsonWithPages();
                var pointersAndDal = getPointersAndDal(json);
                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                expect(pointersAndDal.dal.get(pagePointer)).toEqual(json.pagesData.page1.structure);
            });

            it("should return specific component", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var json = getJsonWithPages([c1]);
                var pointersAndDal = getPointersAndDal(json);
                var compPointer = getComponent(pointersAndDal, 'comp3');
                expect(pointersAndDal.dal.get(compPointer)).toEqual(c1.components[0]);
            });

            it("should return null if component does not exist", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var json = getJsonWithPages([c1]);
                var pointersAndDal = getPointersAndDal(json);
                var compPointer = getComponent(pointersAndDal, 'comp2');
                expect(compPointer).toEqual(null);
            });
        });


        function testCompsArray(pointersAndDal, pointers, comps){
            expect(pointers.length).toEqual(comps.length);
            _.forEach(comps, function(comp, index){
                expect(pointersAndDal.dal.get(pointers[index])).toEqual(comp);
            });
        }

        describe("getChildren", function(){
            it("should return page desktop children", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var c2 = {id: 'comp2'};
                var json = getJsonWithPages([c1, c2], [{id: 'comp4'}]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var children = pointersAndDal.pointers.components.getChildren(pagePointer);
                testCompsArray(pointersAndDal, children, [c1, c2]);
            });

            it("should return page mobile children", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var json = getJsonWithPages({id: 'comp2'}, [c1]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.MOBILE);
                var children = pointersAndDal.pointers.components.getChildren(pagePointer);
                testCompsArray(pointersAndDal, children, [c1]);
            });

            it("should return desktop component children ", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var c2 = {id: 'comp2'};
                var json = getJsonWithPages([{id: 'comp', components: [c1, c2]}]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var compPointer = pointersAndDal.pointers.components.getComponent('comp', pagePointer);
                var children = pointersAndDal.pointers.components.getChildren(compPointer);
                testCompsArray(pointersAndDal, children, [c1, c2]);
            });

            it("should return mobile component children ", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var c2 = {id: 'comp2'};
                var json = getJsonWithPages([], [{id: 'comp', components: [c1, c2]}]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.MOBILE);
                var compPointer = pointersAndDal.pointers.components.getComponent('comp', pagePointer);
                var children = pointersAndDal.pointers.components.getChildren(compPointer);
                testCompsArray(pointersAndDal, children, [c1, c2]);
            });

            it("should return master page desktop children", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var json = getJsonWithMaster([c1], [{id: 'comp2'}]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                var children = pointersAndDal.pointers.components.getChildren(pagePointer);
                testCompsArray(pointersAndDal, children, [c1]);
            });

            it("should return master page mobile children", function(){
                var c1 = {id: 'comp1', components: [{id: 'comp3'}]};
                var c2 = {id: 'comp2'};
                var json = getJsonWithMaster([{id: 'comp4'}], [c1, c2]);
                var pointersAndDal = getPointersAndDal(json);

                var pagePointer = pointersAndDal.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
                var children = pointersAndDal.pointers.components.getChildren(pagePointer);
                testCompsArray(pointersAndDal, children, [c1, c2]);
            });

        });

        describe("getChildrenRecursively", function(){
            it("should return empty array if no children", function(){
                var json = getJsonWithMaster([], []);
                var pointersAndDal = getPointersAndDal(json);
                var pagePointer = pointersAndDal.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
                var children = pointersAndDal.pointers.components.getChildrenRecursively(pagePointer);
                expect(children).toEqual([]);
            });

            it("should return children recursively", function(){
                var comps = [{id: 'c0'}, {id: 'c1'}, {id: 'c2'}, {id: 'c3'}, {id: 'c4'}, {id: 'c5'}, {id: 'c6'}];
                comps[2].components = [comps[4], comps[5]];
                comps[3].components = [comps[6]];
                comps[1].components = [comps[2], comps[3]];
                var json = getJsonWithPages([comps[0], comps[1]], []);
                var pointersAndDal = getPointersAndDal(json);
                var pagePointer = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var children = pointersAndDal.pointers.components.getChildrenRecursively(pagePointer);
                testCompsArray(pointersAndDal, children, comps);
            });
        });

        describe("getParent", function(){
            function getComp(pointersAndDal, pageId, compId){
                var page = pointersAndDal.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return pointersAndDal.pointers.components.getComponent(compId, page);
            }
            it("should return parent comp if parent is container", function(){
                var json = getJsonWithPages([{id: 'comp1', components: [{id: 'comp2'}, {id: 'comp3'}]}], []);
                var pointersAndDal = getPointersAndDal(json);
                var comp = getComp(pointersAndDal, 'page1', 'comp3');
                var parent = pointersAndDal.pointers.components.getParent(comp);
                expect(parent.id).toEqual('comp1');
            });
            it("should return parent comp if parent is page", function(){
                var json = getJsonWithPages([{id: 'comp1'}], []);
                var pointersAndDal = getPointersAndDal(json);
                var comp = getComp(pointersAndDal, 'page1', 'comp1');
                var parent = pointersAndDal.pointers.components.getParent(comp);
                expect(parent.id).toEqual('page1');
            });
            it("should return null if comp is page", function(){
                var json = getJsonWithPages([{id: 'comp1'}], []);
                var pointersAndDal = getPointersAndDal(json);
                var comp = pointersAndDal.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var parent = pointersAndDal.pointers.components.getParent(comp);
                expect(parent).toBeNull();
            });
            it("should return null if comp does not exist", function(){
                var json = getJsonWithPages([], []);
                var pointersAndDal = getPointersAndDal(json);
                var nonExistingComponent = {type: 'DESKTOP', id: 'nonExistingComponent'};
                var parent = pointersAndDal.pointers.components.getParent(nonExistingComponent);
                expect(parent).toBeNull();
            });
            it("should return null id parent is masterPage", function(){
                var json = getJsonWithMaster([], [{id: 'comp1'}]);
                var pointersAndDal = getPointersAndDal(json);
                var comp = pointersAndDal.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
                var parent = pointersAndDal.pointers.components.getParent(comp);
                expect(parent).toBeNull();
            });
        });

    });
});
