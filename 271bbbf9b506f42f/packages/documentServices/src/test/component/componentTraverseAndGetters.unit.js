define(['lodash', 'testUtils', 'documentServices/component/component',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants'], function(_, testUtils, componentService, privateServicesHelper, constants){
    "use strict";

    describe("componentTraverseAndGetters", function(){
        function getCompPointer(ps, compId, pageId){
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        var privateServices;
        var siteData;

        beforeEach(function(){
            siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage');
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });

        describe('Component traversal - parent / siblings / children etc.', function () {
            //it only calls another method..
            describe('getContainer', function () {
                it('should return the parent component for a comp in a container in a page', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'container', components: [{id: 'comp'}]}]);
                    var pointer = getCompPointer(privateServices, 'comp', 'page1');

                    var parentCompRef = componentService.getContainer(privateServices, pointer);
                    expect(parentCompRef.id).toBe('container');
                });
            });

            //it only calls another method..
            describe('getChildren', function () {
                it('should return a pointer of the child components', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'container', components: [{id: 'comp1'}, {id: 'comp2'}]}]);
                    var pointer = getCompPointer(privateServices, 'container', 'page1');
                    var comps = componentService.getChildren(privateServices, pointer);
                    expect(comps[0].id).toBe('comp1');
                    expect(comps[1].id).toBe('comp2');
                });

                function addContainerWithTwoLevelsOfChildren(grandchildCompId, childContainerId, parentContainerId, pageId) {
                    var compStructure = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', null, grandchildCompId);
                    var containerStructure = testUtils.mockFactory.createStructure('mobile.core.components.Container', {components: [compStructure]}, childContainerId);
                    testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, null, false, parentContainerId, {components: [containerStructure]});
                }

                it('should return pointers to all descendants (recursively) if isRecursive was passed true', function(){
                    var grandchildCompId = 'descendantCompId';
                    var childContainerId = 'childContainerId';
                    var parentContainerId = 'topContainerId';
                    var pageId = siteData.getFocusedRootId();
                    addContainerWithTwoLevelsOfChildren(grandchildCompId, childContainerId, parentContainerId, pageId);
                    var grandchildPointer = getCompPointer(privateServices, grandchildCompId, pageId);
                    var childPointer = getCompPointer(privateServices, childContainerId, pageId);
                    var parentPointer = getCompPointer(privateServices, parentContainerId, pageId);

                    var comps = componentService.getChildren(privateServices, parentPointer, true);

                    expect(_.sortBy(comps)).toEqual(_.sortBy([childPointer, grandchildPointer]));
                });
            });

            describe('getTpaChildren', function () {
                function getNonTpaComp(id, children){
                    return {id: id, componentType: 'someType', components: children};
                }

                function getTpaComp(id, children){
                    return {id: id, componentType: 'tpa.viewer.components.tpapps.TPAWidget', components: children};
                }

                it('should return tpa child components (including grand children)', function () {
                    siteData.addPageWithDefaults('page1', [getNonTpaComp('comp1', [getNonTpaComp('comp2', [getTpaComp('comp3')]), getTpaComp('comp4')])]);
                    var pointer = getCompPointer(privateServices, 'comp1', 'page1');
                    var comps = componentService.getTpaChildren(privateServices, pointer);
                    expect(comps.length).toBe(2);
                });

                it('should return an empty array if there are no tpa child components', function () {
                    siteData.addPageWithDefaults('page1', [getNonTpaComp('comp1', [getNonTpaComp('comp2', [getNonTpaComp('comp3')]), getNonTpaComp('comp4')])]);
                    var pointer = getCompPointer(privateServices, 'comp1', 'page1');
                    var comps = componentService.getTpaChildren(privateServices, pointer);
                    expect(comps.length).toBe(0);
                });
            });

            describe('getSiblings', function () {
                it('should return the component siblings', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'comp1'}, {id: 'comp2'}, {id: 'comp3'}]);
                    var pointer = getCompPointer(privateServices, 'comp2', 'page1');
                    var comps = componentService.getSiblings(privateServices, pointer);
                    expect(comps[0].id).toBe('comp1');
                    expect(comps[1].id).toBe('comp3');
                });
            });

        });

        describe('getComponentLayout', function () {
            it('Should return component layout with bounding layout', function () {
                var mockLayout = {x: 0, y: 0, width: 200, height: 200};
                siteData.addPageWithDefaults('page1', [{id: 'comp', layout: mockLayout}]);
                var pointer = getCompPointer(privateServices, 'comp', 'page1');
                var result = componentService.layout.get(privateServices, pointer);

                var expected = _.clone(mockLayout);
                _.merge(expected, {bounding: mockLayout});
                expect(result).toEqual(expected);
            });

            it('bounding layout should be the correct bounding layout after calculations if the component is rotated', function () {
                var mockLayout = {x: 0, y: 0, width: 200, height: 300, rotationInDegrees: 90};
                siteData.addPageWithDefaults('page1', [{id: 'comp', layout: mockLayout}]);
                var pointer = getCompPointer(privateServices, 'comp', 'page1');

                var result = componentService.layout.get(privateServices, pointer);
                var expected = {x: -50, y: 50, width: 300, height: 200};
                expect(result.bounding).toEqual(expected);
            });
        });

        describe('isPageComponent', function () {
        }); //TODO: missing test!


        describe('getComponentDataItem', function () {
        }); //TODO: missing test!

        describe('getComponentType', function () {
        }); //TODO: missing test!

    });

});
