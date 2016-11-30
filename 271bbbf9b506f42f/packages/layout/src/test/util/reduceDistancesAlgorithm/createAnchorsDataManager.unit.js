define(['lodash', 'layout/util/reduceDistancesAlgorithm/createAnchorsDataManager'], function (_, createAnchorsDataManager) {
    'use strict';

    describe('createAnchorsDataManager', function () {

        describe('when skipEnforceAnchors is false should expose all anchors', function(){
            var childBToContainerAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "child-b",
                "targetComponent": "container",
                "type": "BOTTOM_PARENT"
            };

            var childAToChildBAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "child-a",
                "targetComponent": "child-b",
                "type": "BOTTOM_TOP"
            };

            var siteHeaderToPagesContainerAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "SITE_HEADER",
                "targetComponent": "PAGES_CONTAINER",
                "type": "BOTTOM_TOP"
            };

            var siteFooterToSiteStructure = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "SITE_FOOTER",
                "targetComponent": "masterPage",
                "type": "BOTTOM_PARENT"
            };

            var mockAnchorsData = {
                "child-a": [
                    childAToChildBAnchor
                ],
                "child-b": [
                    childBToContainerAnchor
                ],
                "SITE_HEADER": [
                    siteHeaderToPagesContainerAnchor
                ],
                "SITE_FOOTER": [
                    siteFooterToSiteStructure
                ]
            };

            var skipEnforceAnchors = false;

            describe('getComponentPushers', function(){
                it('should return child-a To child-b anchor for child-b', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchors = anchorsDataManager.getComponentPushers('child-b');
                    expect(anchors.length).toBe(1);
                    expect(anchors[0]).toEqual(childAToChildBAnchor);
                });

                it('should return SITE_HEADER to PAGES_CONTAINER anchor for PAGES_CONTAINER', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchors = anchorsDataManager.getComponentPushers('PAGES_CONTAINER');
                    expect(anchors.length).toBe(1);
                    expect(anchors[0]).toEqual(siteHeaderToPagesContainerAnchor);
                });
            });

            describe('getComponentAnchorToParent', function(){
                it('should return child-b To container anchor for child-b', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchor = anchorsDataManager.getComponentAnchorToParent('child-b');
                    expect(anchor).toEqual(childBToContainerAnchor);
                });

                it('should return SITE_FOOTER to masterPage anchor for masterPage', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchor = anchorsDataManager.getComponentAnchorToParent('SITE_FOOTER');
                    expect(anchor).toEqual(siteFooterToSiteStructure);
                });
            });
        });

        describe('when skipEnforceAnchors is true should expose only anchors between HARD_WIRED components', function(){
            var childBToContainerAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "child-b",
                "targetComponent": "container",
                "type": "BOTTOM_PARENT"
            };

            var childAToChildBAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "child-a",
                "targetComponent": "child-b",
                "type": "BOTTOM_TOP"
            };

            var siteHeaderToPagesContainerAnchor = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "SITE_HEADER",
                "targetComponent": "PAGES_CONTAINER",
                "type": "BOTTOM_TOP"
            };

            var siteFooterToSiteStructure = {
                "distance": 0,
                "locked": true,
                "originalValue": 0,
                "fromComp": "SITE_FOOTER",
                "targetComponent": "masterPage",
                "type": "BOTTOM_PARENT"
            };

            var mockAnchorsData = {
                "child-a": [
                    childAToChildBAnchor
                ],
                "child-b": [
                    childBToContainerAnchor
                ],
                "SITE_HEADER": [
                    siteHeaderToPagesContainerAnchor
                ],
                "SITE_FOOTER": [
                    siteFooterToSiteStructure
                ]
            };

            var skipEnforceAnchors = true;

            describe('getComponentPushers', function(){
                it('should not return child-a To child-b anchor for child-b', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchors = anchorsDataManager.getComponentPushers('child-b');
                    expect(anchors.length).toBe(0);
                });

                it('should return SITE_HEADER to PAGES_CONTAINER anchor for PAGES_CONTAINER', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchors = anchorsDataManager.getComponentPushers('PAGES_CONTAINER');
                    expect(anchors.length).toBe(1);
                    expect(anchors[0]).toEqual(siteHeaderToPagesContainerAnchor);
                });
            });

            describe('getComponentAnchorToParent', function(){
                it('should not return child-b To container anchor for child-b', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchor = anchorsDataManager.getComponentAnchorToParent('child-b');
                    expect(anchor).not.toBeDefined();
                });

                it('should return SITE_FOOTER to masterPage anchor for masterPage', function(){
                    var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, {});

                    var anchor = anchorsDataManager.getComponentAnchorToParent('SITE_FOOTER');
                    expect(anchor).toEqual(siteFooterToSiteStructure);
                });
            });
        });

        describe('shrinkable containers', function(){
            it('should convert all bottom_parent anchors to locked anchors with distance=0', function(){
                var childBToContainerAnchor = {
                    "distance": 100,
                    "locked": false,
                    "originalValue": 200,
                    "fromComp": "child-b",
                    "targetComponent": "container",
                    "type": "BOTTOM_PARENT"
                };

                var mockAnchorsData = {
                    "child-b": [
                        childBToContainerAnchor
                    ]
                };

                var skipEnforceAnchors = false;
                var shrinkableContainerMap = {
                    'container': true
                };

                var anchorsDataManager = createAnchorsDataManager(mockAnchorsData, skipEnforceAnchors, shrinkableContainerMap);
                var anchor = anchorsDataManager.getComponentAnchorToParent('child-b');

                var expectedAnchor = _.assign({}, childBToContainerAnchor, {distance: 0, locked: true});
                expect(anchor).toEqual(expectedAnchor);
            });
        });
    });
});
