define(['lodash',
        'testUtils',
        'documentServices/smartBoxes/grouping',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/constants/constants',
        'documentServices/anchors/anchors',
        'packages/documentServices/src/test/smartBoxes/groupingData.json.js'
    ],
    function (_, testUtils, grouping, privateServicesHelper, constants, anchors, groupingData) {
        'use strict';

        describe('grouping spec', function () {
            var ps;
            var pagesDataPointer;

            function getPageChild(privateServices, index) {
                index = index || 0;
                var page = privateServices.pointers.components.getPage('c1dmp', constants.VIEW_MODES.DESKTOP);
                var pageChildren = privateServices.pointers.components.getChildren(page);
                var pageFirstChildPointer = pageChildren[index];
                return privateServices.dal.get(pageFirstChildPointer);
            }

            function getCompPointer(privateServices, compId, pageId) {
                var page = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return privateServices.pointers.components.getComponent(compId, page);
            }

            function fakeSiteX(currentSiteData, siteX) {
                var pageWidth = currentSiteData.getSiteWidth();

                currentSiteData.addMeasureMap({
                    clientWidth: pageWidth + (siteX * 2)
                });
            }

            function fakeSiteStructureHeight(currentSiteData) {
                var heightMeasureMap = {};
                heightMeasureMap[constants.MASTER_PAGE_ID] = 600;

                currentSiteData.addMeasureMap({
                    height: heightMeasureMap
                });
            }

            beforeEach(function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                this.siteData = siteData;
                fakeSiteStructureHeight(siteData);
                fakeSiteX(siteData, 0);
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                ps.siteAPI.getScroll = function () {
                    return {x: 0, y: 0};
                };
                spyOn(anchors, 'updateAnchors');

            });

            describe('groupComponents', function () {
                var pageId, imageId, buttonId, imagePointer, buttonPointer, groupPointer;

                beforeEach(function () {
                    pageId = 'c1dmp';
                    imageId = 'comp-i7vi9nrf';
                    buttonId = 'i7lqfbtj';
                    //groupPointer =  getCompPointer(ps, 'fakeId', pageId);
                    var pageWithImageAndButton = groupingData.d1;

                    pagesDataPointer = ps.pointers.general.getPagesData();
                    ps.dal.set(pagesDataPointer, pageWithImageAndButton);

                    groupPointer = ps.pointers.components.getUnattached('fakeId', constants.VIEW_MODES.DESKTOP);


                    imagePointer = getCompPointer(ps, imageId, pageId);
                    buttonPointer = getCompPointer(ps, buttonId, pageId);

                    spyOn(ps.setOperationsQueue, 'asyncSetOperationComplete');

                });

                describe('when one of the grouped components parent, is not a Hover Box component', function () {

                    it('should not change dal if no components entered', function () {
                        var pagesData = ps.dal.get(pagesDataPointer);

                        grouping.groupComponents(ps, groupPointer, []);
                        expect(ps.dal.get(pagesDataPointer)).toEqual(pagesData);

                        grouping.groupComponents(ps, undefined);
                        expect(ps.dal.get(pagesDataPointer)).toEqual(pagesData);
                    });

                    it('should not change dal if only a single component entered', function () {
                        var pagesData = ps.dal.get(pagesDataPointer);

                        grouping.groupComponents(ps, groupPointer, [imagePointer]);
                        expect(ps.dal.get(pagesDataPointer)).toEqual(pagesData);
                    });

                    it('should create a group and place it on the page', function () {
                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);

                        var group = getPageChild(ps);
                        expect(group.componentType).toBe('wysiwyg.viewer.components.Group');
                    });

                    it('should create a group with layout that bound the components', function () {
                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);

                        var group = getPageChild(ps);
                        expect(group.layout.x).toBe(50);
                        expect(group.layout.y).toEqual(50);
                        expect(group.layout.height).toEqual(300);
                        expect(group.layout.width).toEqual(550);
                    });

                    it('should move the two components to the new group', function () {
                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);

                        var group = getPageChild(ps);
                        expect(group.components[0].id).toBe(buttonId);
                        expect(group.components[1].id).toBe(imageId);
                    });

                    it('should change the position of the components to be relative to the group', function () {
                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);

                        var group = getPageChild(ps);
                        expect(group.components[0].layout.x).toBe(350);
                        expect(group.components[0].layout.y).toBe(50);
                        expect(group.components[1].layout.x).toBe(0);
                        expect(group.components[1].layout.y).toBe(0);
                    });

                    it('if one of the to-be-grouped components is a group, first ungroup, so the resulted group be flat', function () {
                        var pageWithButtonAndGroupOfTwoButtons = groupingData.d2;
                        ps.dal.set(pagesDataPointer, pageWithButtonAndGroupOfTwoButtons);

                        var existingGroupPointer = getCompPointer(ps, 'comp-i7ypfdtz', pageId);
                        var button1Pointer = getCompPointer(ps, 'i7nktjo5', pageId);

                        grouping.groupComponents(ps, groupPointer, [existingGroupPointer, button1Pointer]);

                        var group = getPageChild(ps);
                        expect(group.components.length).toBe(3);
                    });

                    it('shouldnt change the structure if trying to group together already grouped comps', function () {
                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);
                        var structureClone = ps.dal.get(pagesDataPointer);

                        grouping.groupComponents(ps, groupPointer, [imagePointer, buttonPointer]);

                        expect(ps.dal.get(pagesDataPointer)).toEqual(structureClone);
                    });
                });

                describe('when one of the grouped components parent, is the hover box', function () {

                    function createMockComp(id) {
                        return {
                            "id": id,
                            "componentType": "wysiwyg.viewer.components.FiveGridLine",
                            "layout": {
                                "x": 348,
                                "y": 250.5,
                                "fixedPosition": false,
                                "width": 284,
                                "height": 5,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Component",
                            "props": null,
                            "style": "hl3"
                        };
                    }

                    beforeEach(function () {
                        testUtils.experimentHelper.openExperiments('sv_hoverBox');
                        this.hoverBoxType = 'wysiwyg.viewer.components.HoverBox';
                        this.pageId = 'c1dmp';
                        var hoverBoxStructure = {
                            id: 'mockHoverBox',
                            type: 'Container',
                            componentType: this.hoverBoxType,
                            components: [createMockComp('comp1')],
                            layout: {
                                x: 100, y: 100, width: 1000, height: 800
                            }
                        };

                        ps.dal.addPageWithDefaults(this.pageId, [hoverBoxStructure, createMockComp('comp2')]);

                        this.hoverBoxPointer = ps.pointers.components.getUnattached('mockHoverBox', constants.VIEW_MODES.DESKTOP);
                        this.comp1Pointer = ps.pointers.components.getUnattached('comp1', constants.VIEW_MODES.DESKTOP);
                        this.comp2Pointer = ps.pointers.components.getUnattached('comp2', constants.VIEW_MODES.DESKTOP);
                    });

                    it('should set the parent of the group to be the first hover box parent which is not a hover box', function () {
                        expect(ps.pointers.components.getParent(this.comp1Pointer)).toEqual(this.hoverBoxPointer);

                        grouping.groupComponents(ps, groupPointer, [this.comp1Pointer, this.comp2Pointer]);
                        var groupParentPointer = ps.pointers.components.getParent(groupPointer);
                        var groupParentTypePointer = ps.pointers.getInnerPointer(groupParentPointer, 'componentType');

                        expect(ps.dal.get(groupParentTypePointer)).not.toEqual(this.hoverBoxType);
                    });
                });

            }); //describe groupComponents

            describe('ungroup', function () {
                var buttonId, groupId, pageId, galleryId, groupPointer, buttonPointer, galleryPointer;

                beforeEach(function () {

                    pageId = 'c1dmp';
                    buttonId = 'i7lqfbtj';
                    galleryId = 'comp-i7vt05pu';
                    groupId = 'comp-i7vt2kjz';

                    pagesDataPointer = ps.pointers.general.getPagesData();
                    var pageWithGroupOfGalleryAndButton = groupingData.d3;
                    ps.dal.set(pagesDataPointer, pageWithGroupOfGalleryAndButton);

                    galleryPointer = getCompPointer(ps, galleryId, pageId);
                    buttonPointer = getCompPointer(ps, buttonId, pageId);

                    spyOn(ps.setOperationsQueue, 'asyncSetOperationComplete');

                    groupPointer = getCompPointer(ps, groupId, pageId);
                });

                it('should remove the group from the page', function () {
                    grouping.ungroup(ps, [buttonPointer, galleryPointer], groupPointer);

                    expect(getPageChild(ps, 0).id).not.toBe(groupId);
                });

                it('should set the group components to be directly under the page', function () {
                    grouping.ungroup(ps, [buttonPointer, galleryPointer], groupPointer);

                    expect(getPageChild(ps, 0).id).toBe(buttonId);
                    expect(getPageChild(ps, 1).id).toBe(galleryId);
                });

                it('should set the group component layouts to be relative to the page', function () {
                    grouping.ungroup(ps, [buttonPointer, galleryPointer], groupPointer);

                    var firstChild = getPageChild(ps, 0);
                    var secondChild = getPageChild(ps, 1);

                    expect(firstChild.layout.x).toBe(450);
                    expect(firstChild.layout.y).toBe(100);
                    expect(secondChild.layout.x).toBe(100);
                    expect(secondChild.layout.y).toBe(150);
                });

            });//describe ungroup


            describe('addToGroup', function () {
                var pageId, videoId, groupId, shapeId, videoPointer, groupPointer, shapePointer;

                beforeEach(function () {
                    pageId = 'c1dmp';
                    videoId = 'comp-i7x659sy';
                    groupId = 'comp-i7x519z2';
                    shapeId = 'comp-i7x5lc76';
                    pagesDataPointer = ps.pointers.general.getPagesData();
                    var pageWithTextAndGroupOfButtonImage = groupingData.d4;
                    ps.dal.set(pagesDataPointer, pageWithTextAndGroupOfButtonImage);

                    videoPointer = getCompPointer(ps, videoId, pageId);
                    shapePointer = getCompPointer(ps, shapeId, pageId);
                    groupPointer = getCompPointer(ps, groupId, pageId);

                });

                it('should add the video component to be a child of the group', function () {
                    grouping.addToGroup(ps, [videoPointer], groupPointer);

                    expect(getPageChild(ps, 0).components[2].id).toBe(videoId);
                });

                it('should add the video and shape components to be a children of the group', function () {
                    grouping.addToGroup(ps, [videoPointer, shapePointer], groupPointer);

                    expect(getPageChild(ps, 0).components[2].id).toBe(videoId);
                    expect(getPageChild(ps, 0).components[3].id).toBe(shapeId);
                });

                it('should change video layout to be relevant to the group', function () {
                    grouping.addToGroup(ps, [videoPointer], groupPointer);

                    expect(getPageChild(ps, 0).components[2].layout.x).toBe(590);
                    expect(getPageChild(ps, 0).components[2].layout.y).toBe(212);
                });


            }); //describe addToGroup
        });
    });
