/*eslint comma-spacing:0*/
define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/structure/structureUtils',
    'documentServices/anchors/anchors',
    'packages/documentServices/src/test/anchors/anchorsData.json.js'
], function (_, testUtils, privateServicesHelper, structureUtils, anchors, anchorsData) {
    'use strict';


    //Editor Link :: http://editor.wix.com/html/editor/web/renderer/edit/321279d5-0706-42f2-80aa-72086136554a?metaSiteId=51872479-33ea-4da0-89bb-ace459c55d00&editorSessionId=3639AD7B-74F4-4A12-94D1-DFE4A67AF2B3
    describe('Anchors', function () {//http://editor.wix.com/html/editor/web/renderer/edit/321279d5-0706-42f2-80aa-72086136554a?metaSiteId=51872479-33ea-4da0-89bb-ace459c55d00&editorSessionId=3639AD7B-74F4-4A12-94D1-DFE4A67AF2B3&statemap=html-client:local&mode=debug
        var mockPrivateServices, siteData, mockMasterPage;

        function getCompPointerFromMainPage(ps, compId){
            var page = ps.pointers.components.getPage('mainPage', 'DESKTOP');
            return ps.pointers.components.getComponent(compId, page);
        }

        function getComponentFromMainPage(ps, compId){
            var pointer = getCompPointerFromMainPage(ps, compId);
            return ps.dal.get(pointer);
        }

        function getCompPointerFromMaster(ps, compId){
            var page = ps.pointers.components.getMasterPage('DESKTOP');
            if (compId === 'root'){
                return page;
            }
            return ps.pointers.components.getComponent(compId, page);
        }

        function getComponentFromMaster(ps, compId){
            var pointer = getCompPointerFromMainPage(ps, compId);
            return ps.dal.get(pointer);
        }

        function setFixedPosition(ps, compPointer, fixedPosition){
            var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
            var compLayout = ps.dal.get(layoutPointer);

            compLayout.fixedPosition = fixedPosition;
            ps.dal.set(layoutPointer, compLayout);
        }

        function updateAnchors(ps, compPointer, parentPointer) {
            anchors.updateAnchors(ps, compPointer, parentPointer);
            anchors.updateAnchorsForMultipleComps(ps);
        }

        describe('updateAnchors', function () {

            beforeEach(function(){
                var comps = [
                    {"id":"container", "type":"Container","layout":{"width":751,"height":565,"x":113,"y":42,"rotationInDegrees":0,"anchors":[]}, "componentType":"mobile.core.components.Container", "components":[
                        {"id":"redWPhoto", "type":"Component","layout":{"width":155,"height":144,"x":228,"y":88,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.WPhoto"},
                        {"id":"buttonA", "type":"Component","layout":{"width":130,"height":60,"x":134,"y":261,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"},
                        {"id":"buttonB", "type":"Component","layout":{"width":130,"height":60,"x":181,"y":351,"rotationInDegrees":0,"anchors":[{"distance":11,"topToTop":11,"originalValue":0,"type":"LOCK_BOTTOM","locked":false,"targetComponent":"buttonC"}]},"componentType":"wysiwyg.viewer.components.SiteButton"},
                        {"id":"buttonC", "type":"Component","layout":{"width":130,"height":60,"x":326,"y":362,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"},
                        {"id":"sameYAsButtonC", "type":"Component","layout":{"width":130,"height":60,"x":326,"y":362,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"},
                        {"id":"orangeWPhoto", "type":"Component","layout":{"width":164,"height":65,"x":350,"y":167,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.WPhoto"},
                        {"id":"blackWPhoto", "type":"Component","layout":{"width":32,"height":36,"x":279,"y":180,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.WPhoto"},
                        {"id":"buttonD", "type":"Component","layout":{"width":130,"height":60,"x":476,"y":400,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"},
                        {"id":"buttonF", "type":"Component","layout":{"width":58,"height":60,"x":325,"y":96,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"}]}];

                siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps}});

                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            describe('BOTTOM_PARENT', function () {
                it('should create BOTTOM_PARENT anchor for components with no other components directly below them, and remove lock bottom anchor', function () {
                    var buttonBExpectedBottomParentAnchors = [
                            {type: 'BOTTOM_PARENT', distance: 154, originalValue: 565, topToTop: null, locked: false}
                        ],
                        buttonCExpectedBottomParentAnchors = [
                            {type: 'BOTTOM_PARENT', distance: 143, originalValue: 565, topToTop: null, locked: false}
                        ];

                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'buttonB'));

                    var buttonB = getComponentFromMainPage(mockPrivateServices, 'buttonB');
                    var buttonC = getComponentFromMainPage(mockPrivateServices, 'buttonC');

                    var buttonBBottomParentAnchors = _.filter(buttonB.layout.anchors, {type: 'BOTTOM_PARENT'});
                    var buttonCBottomParentAnchors = _.filter(buttonC.layout.anchors, {type: 'BOTTOM_PARENT'});

                    expect(buttonBBottomParentAnchors.length).toBe(1);
                    expect(buttonBBottomParentAnchors[0]).toContain(buttonBExpectedBottomParentAnchors[0]);
                    expect(buttonCBottomParentAnchors.length).toBe(1);
                    expect(buttonCBottomParentAnchors[0]).toContain(buttonCExpectedBottomParentAnchors[0]);
                });
            });

            describe('BOTTOM_TOP', function () {
                it('should create BOTTOM_TOP anchors for components directly below original component', function () {
                    var redWPhotoBottomTopAnchors, buttonATopAnchors;

                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    var buttonA = getComponentFromMainPage(mockPrivateServices, 'buttonA');
                    redWPhotoBottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'BOTTOM_TOP'}) || [];
                    buttonATopAnchors = _.filter(buttonA.layout.anchors, {type: 'BOTTOM_TOP'}) || [];

                    var redWPhotoAnchorsTargets = _.map(redWPhotoBottomTopAnchors, 'targetComponent');
                    expect(redWPhotoAnchorsTargets.length).toBe(3);
                    expect(redWPhotoAnchorsTargets).toContain('buttonA');
                    expect(redWPhotoAnchorsTargets).toContain('buttonC');
                    expect(redWPhotoAnchorsTargets).toContain('sameYAsButtonC');

                    var buttonAAnchorsTargets = _.map(buttonATopAnchors, 'targetComponent');
                    expect(buttonAAnchorsTargets.length).toBe(1);
                    expect(buttonAAnchorsTargets).toContain('buttonB');
                });

                it('should not create BOTTOM_TOP anchors TO components on fixed position', function () {
                    var redWPhotoBottomTopAnchors;

                    var buttonCPointer = getCompPointerFromMainPage(mockPrivateServices, 'buttonC');
                    var sameYAsButtonCPointer = getCompPointerFromMainPage(mockPrivateServices, 'sameYAsButtonC');
                    setFixedPosition(mockPrivateServices, buttonCPointer, true);
                    setFixedPosition(mockPrivateServices, sameYAsButtonCPointer, true);

                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    redWPhotoBottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'BOTTOM_TOP'}) || [];

                    var redWPhotoAnchorsTargets = _.map(redWPhotoBottomTopAnchors, 'targetComponent');
                    expect(redWPhotoAnchorsTargets.length).toBe(1);
                    expect(redWPhotoAnchorsTargets).toContain('buttonA');
                    expect(redWPhotoAnchorsTargets).not.toContain('buttonC');
                    expect(redWPhotoAnchorsTargets).not.toContain('sameYAsButtonC');
                });

                it('should not create BOTTOM_TOP anchors FROM components on fixed position', function () {
                    var redWPhotoBottomTopAnchors;

                    var redWPhotoPointer = getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto');
                    setFixedPosition(mockPrivateServices, redWPhotoPointer, true);

                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    redWPhotoBottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'BOTTOM_TOP'}) || [];

                    expect(redWPhotoBottomTopAnchors.length).toBe(0);
                });

                it('should not create BOTTOM_PARENT anchor, if comp has BOTTOM_TOP anchor', function () {
                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    expect(redWPhoto.layout.anchors).toBeDefined();
                    expect(_.find(redWPhoto.layout.anchors, {type: 'BOTTOM_TOP'})).toBeTruthy();
                    expect(_.find(redWPhoto.layout.anchors, {type: 'BOTTOM_PARENT'})).toBeFalsy();
                });
            });

            describe('TOP_TOP', function () {
                it('should create TOP_TOP anchors for components vertically contained in original component', function () {
                    var bottomTopAnchors;
                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    bottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'TOP_TOP'}) || [];

                    var topTopAnchorsTargetComps = _.map(bottomTopAnchors, 'targetComponent');
                    expect(topTopAnchorsTargetComps.length).toBe(3);
                    expect(topTopAnchorsTargetComps).toContain('buttonF');
                    expect(topTopAnchorsTargetComps).toContain('orangeWPhoto');
                    expect(topTopAnchorsTargetComps).toContain('blackWPhoto');
                });

                it('should not create TOP_TOP anchors TO components on fixed position', function () {
                    var bottomTopAnchors;

                    var buttonFPointer = getCompPointerFromMainPage(mockPrivateServices, 'buttonF');
                    setFixedPosition(mockPrivateServices, buttonFPointer, true);
                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    bottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'TOP_TOP'}) || [];

                    var topTopAnchorsTargetComps = _.map(bottomTopAnchors, 'targetComponent');
                    expect(topTopAnchorsTargetComps.length).toBe(2);
                    expect(topTopAnchorsTargetComps).not.toContain('buttonF');
                    expect(topTopAnchorsTargetComps).toContain('orangeWPhoto');
                    expect(topTopAnchorsTargetComps).toContain('blackWPhoto');
                });

                it('should not create TOP_TOP anchors FROM components on fixed position', function () {
                    var bottomTopAnchors;

                    var redWPhotoPointer = getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto');
                    setFixedPosition(mockPrivateServices, redWPhotoPointer, true);
                    updateAnchors(mockPrivateServices, redWPhotoPointer);

                    var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                    bottomTopAnchors = _.filter(redWPhoto.layout.anchors, {type: 'TOP_TOP'}) || [];

                    expect(bottomTopAnchors.length).toBe(0);
                });
            });

            describe('BOTTOM_BOTTOM', function () {
                it('should remove BOTTOM_BOTTOM', function () {
                    updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'blackWPhoto'));

                    var blackWPhoto = getComponentFromMainPage(mockPrivateServices, 'blackWPhoto');
                    var bottomBottomAnchors = _.filter(blackWPhoto.layout.anchors, {type: 'BOTTOM_BOTTOM'}) || [];

                    expect(bottomBottomAnchors.length).toBe(0);
                });

            });

            describe('MasterPage anchors', function(){

                describe('When master page contains only header, footer & pages container', function() {

                    beforeEach(function(){
                        mockMasterPage = {
                            "type": "Document",
                            "documentType": "document",
                            "componentProperties": {},
                            "themeData": {},
                            "children": [
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 980,
                                        "height": 105,
                                        "x": 0,
                                        "y": 727,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "id": "SITE_FOOTER",
                                    "componentType": "wysiwyg.viewer.components.FooterContainer",
                                    "components": [
                                        {
                                            "type": "Component",
                                            "layout": {
                                                "width": 400,
                                                "height": 20,
                                                "x": 10,
                                                "y": 17,
                                                "rotationInDegrees": 0,
                                                "anchors": []
                                            },
                                            "id": "WRchTxt0-16wb",
                                            "componentType": "wysiwyg.viewer.components.WRichText"
                                        }]
                                },
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 980,
                                        "height": 100,
                                        "x": 0,
                                        "y": 0,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "id": "SITE_HEADER",
                                    "components": [],
                                    "componentType": "wysiwyg.viewer.components.HeaderContainer"
                                },
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 980,
                                        "height": 627,
                                        "x": 0,
                                        "y": 100,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "id": "PAGES_CONTAINER",
                                    "componentType": "wysiwyg.viewer.components.PagesContainer",
                                    "components": [
                                        {
                                            "type": "Container",
                                            "layout": {
                                                "width": 980,
                                                "height": 627,
                                                "x": 0,
                                                "y": 0,
                                                "rotationInDegrees": 0,
                                                "anchors": []
                                            },
                                            "id": "SITE_PAGES",
                                            "components": [],
                                            "componentType": "wysiwyg.viewer.components.PageGroup"
                                        }]
                                }]
                        };

                        siteData.pagesData.masterPage.structure = mockMasterPage;
                        mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    });

                    it('should create BOTTOM_TOP anchor from Header to PagesContainer', function(){
                        var expectedAnchor = {type: 'BOTTOM_TOP', distance: 0, locked: true, originalValue: 100, topToTop: null, targetComponent: 'PAGES_CONTAINER'};

                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockHeader = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                        expect(mockHeader.layout.anchors.length).toBe(1);
                        expect(mockHeader.layout.anchors[0]).toContain(expectedAnchor);
                    });

                    it('should create BOTTOM_TOP anchor from PagesContainer to Footer', function(){
                        var expectedAnchor = {type: 'BOTTOM_TOP', distance: 0, locked: true, originalValue: 727, topToTop: null, targetComponent: 'SITE_FOOTER'};
                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockPagesContainer = getComponentFromMaster(mockPrivateServices, 'PAGES_CONTAINER');
                        expect(mockPagesContainer.layout.anchors.length).toBe(1);
                        expect(mockPagesContainer.layout.anchors[0]).toContain(expectedAnchor);
                    });

                    it('should create BOTTOM_PARENT anchor from Footer to SiteStructure', function(){
                        var expectedAnchor = {type: 'BOTTOM_PARENT', distance: 0, locked: true, originalValue: 832, topToTop: null, targetComponent: 'masterPage'};
                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockFooter = getComponentFromMaster(mockPrivateServices, 'SITE_FOOTER');
                        expect(mockFooter.layout.anchors.length).toBe(1);
                        expect(mockFooter.layout.anchors[0]).toContain(expectedAnchor);
                    });

                });

                describe('When master page contains components under the header', function() {

                    beforeEach(function () {
                        mockMasterPage = {
                            "id": "masterPage",
                            "layout": {"y": 0, "position": "static"},
                            "type": "Document",
                            "documentType": "document",
                            "componentProperties": {},
                            "themeData": {},
                            "children": [
                                {
                                    "id": "SITE_HEADER",
                                    "type": "Container",
                                    "componentType": "wysiwyg.viewer.components.HeaderContainer",
                                    "components": [],
                                    "layout": {
                                        "width": 1000,
                                        "height": 100,
                                        "x": 0,
                                        "y": 0,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [],
                                        "fixedPosition": false
                                    }
                                },
                                {
                                    "id": "compUnderHeader",
                                    "type": "Component",
                                    "componentType": "wysiwyg.viewer.components.SiteButton",
                                    "dataQuery": "#dataItem-ia3v7hza",
                                    "layout": {
                                        "width": 200,
                                        "height": 100,
                                        "x": 500,
                                        "y": 150,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    }
                                },
                                {
                                    "id": "PAGES_CONTAINER",
                                    "type": "Container",
                                    "componentType": "wysiwyg.viewer.components.PagesContainer",
                                    "layout": {
                                        "width": 1000,
                                        "height": 1000,
                                        "x": 0,
                                        "y": 100,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [],
                                        "fixedPosition": false
                                    },
                                    "components": []
                                },
                                {
                                    "id": "compBetweenPagesContainerAndFooter",
                                    "type": "Component",
                                    "componentType": "wysiwyg.viewer.components.SiteButton",
                                    "dataQuery": "#dataItem-ia3v7hza",
                                    "layout": {
                                        "width": 200,
                                        "height": 100,
                                        "x": 500,
                                        "y": 1050,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    }
                                },
                                {
                                    "id": "SITE_FOOTER",
                                    "type": "Container",
                                    "componentType": "wysiwyg.viewer.components.FooterContainer",
                                    "components": [],
                                    "layout": {
                                        "width": 1000,
                                        "height": 100,
                                        "x": 0,
                                        "y": 1100,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [],
                                        "fixedPosition": false
                                    }
                                }
                            ]
                        };

                        siteData.pagesData.masterPage.structure = mockMasterPage;
                        mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    });

                    describe('SITE_HEADER', function() {
                        it('should have a BOTTOM_TOP anchor to PAGES_CONTAINER', function() {
                            var expectedAnchor = {type: 'BOTTOM_TOP', targetComponent: 'PAGES_CONTAINER', distance: 0, locked: true, originalValue: 100, topToTop: null};

                            updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                            var mockHeader = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                            var existingAnchor = _.find(mockHeader.layout.anchors, {targetComponent: 'PAGES_CONTAINER'});
                            expect(existingAnchor).toContain(expectedAnchor);
                        });

                        it('should have a BOTTOM_TOP anchor to the top-most regular master page component which is located under the header', function() {
                            var expectedAnchor = {type: 'BOTTOM_TOP', targetComponent: 'compUnderHeader', distance: 50, locked: true, originalValue: 150, topToTop: null};

                            updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                            var mockHeader = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                            var existingAnchor = _.find(mockHeader.layout.anchors, {targetComponent: 'compUnderHeader'});
                            expect(existingAnchor).toContain(expectedAnchor);
                        });

                        it('should not create a BOTTOM_TOP anchor to the top-most regular master page component which is located under the header if the component is on fixed position', function() {
                            var compUnderHeaderPointer = getCompPointerFromMaster(mockPrivateServices, 'compUnderHeader');
                            setFixedPosition(mockPrivateServices, compUnderHeaderPointer, true);
                            updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                            var mockHeader = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                            var headerAnchorsTargetComponents = _.map(mockHeader.layout.anchors, 'targetComponent');

                            expect(headerAnchorsTargetComponents).not.toContain('compUnderHeader');
                        });
                    });


                    it('PAGES_CONTAINER should have only a BOTTOM_TOP anchor to SITE_FOOTER', function() {
                        var expectedAnchor = {type: 'BOTTOM_TOP', targetComponent: 'SITE_FOOTER', distance: 0, locked: true, originalValue: 1100, topToTop: null};

                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockPagesContainer = getComponentFromMaster(mockPrivateServices, 'PAGES_CONTAINER');
                        expect(mockPagesContainer.layout.anchors.length).toBe(1);
                        expect(mockPagesContainer.layout.anchors[0]).toContain(expectedAnchor);
                    });

                    it('SITE_FOOTER should have only a BOTTOM_PARENT anchor to the masterPage', function() {
                        var expectedAnchor = {type: 'BOTTOM_PARENT', targetComponent: 'masterPage', distance: 0, locked: true, topToTop: null};
                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockFooter = getComponentFromMaster(mockPrivateServices, 'SITE_FOOTER');
                        expect(mockFooter.layout.anchors.length).toBe(1);
                        expect(mockFooter.layout.anchors[0]).toContain(expectedAnchor);
                    });

                    it('the regular components in the masterPage should still have BOTTOM_TOP anchors between them', function() {
                        var expectedAnchor = {type: 'BOTTOM_TOP', targetComponent: 'compBetweenPagesContainerAndFooter', distance: 800, locked: false, originalValue: 1050, topToTop: null};

                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var mockPagesContainer = getComponentFromMaster(mockPrivateServices, 'compUnderHeader');
                        expect(mockPagesContainer.layout.anchors.length).toBe(1);
                        expect(mockPagesContainer.layout.anchors[0]).toContain(expectedAnchor);
                    });

                    it('the lowest component (which is note a structure component) should have a BOTTOM_PARENT anchor to masterPage', function() {
                        var expectedAnchor = {type: 'BOTTOM_PARENT', distance: 0, locked: true, originalValue: 1150, topToTop: null, targetComponent: 'masterPage'};
                        updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                        var compBetweenPagesContainerAndFooter = getComponentFromMaster(mockPrivateServices, 'compBetweenPagesContainerAndFooter');
                        expect(compBetweenPagesContainerAndFooter.layout.anchors.length).toBe(1);
                        expect(compBetweenPagesContainerAndFooter.layout.anchors[0]).toContain(expectedAnchor);
                    });

                });

                it('should create BOTTOM_PARENT anchor from lowest component to SiteStructure', function(){
                    mockMasterPage = anchorsData.mockMasterPage1;
                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var expectedLowestCompAnchor = {type: 'BOTTOM_PARENT', distance: 0, originalValue: 924, topToTop: null, targetComponent: 'masterPage'};

                    updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                    var buttonE = getComponentFromMaster(mockPrivateServices, 'buttonE');

                    expect(buttonE.layout.anchors.length).toBe(1);
                    expect(buttonE.layout.anchors[0]).toContain(expectedLowestCompAnchor);
                });

                it('should not create BOTTOM_PARENT anchor from lowest component to SiteStructure if lowest component is on fixed position', function(){
                    mockMasterPage = anchorsData.mockMasterPage2;
                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var buttonEPointer = getCompPointerFromMaster(mockPrivateServices, 'buttonE');
                    setFixedPosition(mockPrivateServices, buttonEPointer, true);
                    updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                    var buttonE = getComponentFromMaster(mockPrivateServices, 'buttonE');

                    expect(buttonE.layout.anchors.length).toBe(0);
                });

                it('should maintain non-negative gap between header & pages container and between pages container & footer, if there is one (for backward compatibility)', function() {
                    mockMasterPage = anchorsData.mockMasterPage3;

                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var expectedHeaderAnchor = {type: 'BOTTOM_TOP', targetComponent: 'PAGES_CONTAINER', distance: 50, topToTop: null};
                    var expectedPagesContainerAnchor = {type: 'BOTTOM_TOP', targetComponent: 'SITE_FOOTER', distance: 150, topToTop: null};

                    updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                    var header = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                    var pagesContainer = getComponentFromMaster(mockPrivateServices, 'PAGES_CONTAINER');

                    expect(header.layout.anchors.length).toBe(1);
                    expect(header.layout.anchors[0]).toContain(expectedHeaderAnchor);
                    expect(pagesContainer.layout.anchors.length).toBe(1);
                    expect(pagesContainer.layout.anchors[0]).toContain(expectedPagesContainerAnchor);

                });

                it('should not allow negative distance between header / pages container & footer', function() {
                    mockMasterPage = anchorsData.mockMasterPage4;

                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var expectedHeaderAnchor = {type: 'BOTTOM_TOP', targetComponent: 'PAGES_CONTAINER', distance: 0, topToTop: null};
                    var expectedPagesContainerAnchor = {type: 'BOTTOM_TOP', targetComponent: 'SITE_FOOTER', distance: 0, topToTop: null};

                    updateAnchors(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'root'));

                    var header = getComponentFromMaster(mockPrivateServices, 'SITE_HEADER');
                    var pagesContainer = getComponentFromMaster(mockPrivateServices, 'PAGES_CONTAINER');

                    expect(header.layout.anchors.length).toBe(1);
                    expect(header.layout.anchors[0]).toContain(expectedHeaderAnchor);
                    expect(pagesContainer.layout.anchors.length).toBe(1);
                    expect(pagesContainer.layout.anchors[0]).toContain(expectedPagesContainerAnchor);

                });
            });

            describe('Parent anchors on child update', function() {

                it('should not clear anchors of basic parent component', function() {
                    mockMasterPage = anchorsData.mockMasterPage5;

                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var expectedParentAnchor = {
                        type: 'BOTTOM_TOP',
                        targetComponent: 'DUMMY_COMPONENT',
                        distance: 1234,
                        locked: true,
                        originalValue: 100,
                        topToTop: null
                    };

                    var childCompToUpdate = getCompPointerFromMaster(mockPrivateServices, 'child');
                    updateAnchors(mockPrivateServices, childCompToUpdate);

                    var mockParent = getComponentFromMaster(mockPrivateServices, 'parent');
                    expect(mockParent.layout.anchors.length).toBe(1);
                    expect(mockParent.layout.anchors[0]).toContain(expectedParentAnchor);
                });

                it('should clear and recalculate anchors of parent whose height is bound to its content (for now just group)', function() {
                    mockMasterPage = anchorsData.mockMasterPage6;

                    siteData.pagesData.masterPage.structure = mockMasterPage;
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    var expectedNewParentAnchor = {
                        type: 'BOTTOM_TOP',
                        targetComponent: 'parentSibling',
                        distance: 30,
                        locked: true,
                        originalValue: 130,
                        topToTop: null
                    };

                    var childCompToUpdate = getCompPointerFromMaster(mockPrivateServices, 'child');
                    updateAnchors(mockPrivateServices, childCompToUpdate);

                    var mockParent = getComponentFromMaster(mockPrivateServices, 'dynamicHeightParent');
                    expect(mockParent.layout.anchors.length).toBe(1);
                    expect(mockParent.layout.anchors[0]).toContain(expectedNewParentAnchor);
                });

            });


        });

        describe('getMinDragHandleY', function(){

            beforeEach(function(){
                var comps = anchorsData.comps;

                mockMasterPage = {"type":"Document","documentType":"document","componentProperties":{},"themeData":{},"children":[{"type":"Container","layout":{"width":980,"height":105,"x":0,"y":727,"rotationInDegrees":0,"anchors":[]},"id":"SITE_FOOTER","components":[{"type":"Component","layout":{"width":400,"height":20,"x":10,"y":17,"rotationInDegrees":0,"anchors":[]},"id":"WRchTxt0-16wb","componentType":"wysiwyg.viewer.components.WRichText"}],"componentType":"wysiwyg.viewer.components.FooterContainer"},{"type":"Container","layout":{"width":980,"height":100,"x":0,"y":0,"rotationInDegrees":0,"anchors":[]},"id":"SITE_HEADER","components":[],"componentType":"wysiwyg.viewer.components.HeaderContainer"},{"type":"Container","layout":{"width":980,"height":627,"x":0,"y":100,"rotationInDegrees":0,"anchors":[]},"id":"PAGES_CONTAINER","components":[{"type":"Container","layout":{"width":980,"height":627,"x":0,"y":0,"rotationInDegrees":0,"anchors":[]},"id":"SITE_PAGES","components":[],"componentType":"wysiwyg.viewer.components.PageGroup"}],"componentType":"wysiwyg.viewer.components.PagesContainer"}],"mobileComponents":[]};

                siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps}});
                siteData.pagesData.masterPage.structure = mockMasterPage;
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should return sibling bottom if only BOTTOM_TOP anchor exists', function(){
                var buttonAMinDragY = anchors.getMinDragHandleY(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'buttonA'));
                expect(buttonAMinDragY).toBe(232);
            });

            it('should return maximum between sibling Y (with anchor TOP_TOP) and sibling bottom (with anchor BOTTOM_TOP)', function(){
                var orangeMinDragY = anchors.getMinDragHandleY(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'orangeWPhoto'));
                expect(orangeMinDragY).toBe(156);
            });

            it('should ignore anchors of given components', function() {
                var orangeMinDragY = anchors.getMinDragHandleY(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'orangeWPhoto'), ['buttonF']);
                expect(orangeMinDragY).toBe(88);
            });

            it('should return 0 if component has no BOTTOM_TOP and TOP_TOP anchors directing to it', function() {
                var siteHeaderMinDragY = anchors.getMinDragHandleY(mockPrivateServices, getCompPointerFromMaster(mockPrivateServices, 'SITE_HEADER'));
                expect(siteHeaderMinDragY).toBe(0);
            });
        });

        describe('getMinAnchorLockDistance', function(){

            it('should return the minimum distance between components that makes anchors locked', function(){
                var threshold = anchors.getMinAnchorLockDistance();
                expect(threshold).toBe(70);
            });

        });

        // Editor Link :: http://editor.wix.com/html/editor/web/renderer/edit/f59391b3-444c-4085-9beb-31469be459db?metaSiteId=585bb2c3-9aa8-4c17-a022-c8ec59ecec86
        describe('check negative loop and indirect children', function(){
            beforeEach(function(){
                var comps = [
                    {"type":"Component","id":"redWPhoto","layout":{"width":480,"height":383,"x":461,"y":171,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"wysiwyg.viewer.components.WPhoto"},
                    {"type":"Container","id":"greyContainer","components":[],"layout":{"width":124,"height":203,"x":767,"y":440,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"mobile.core.components.Container"},
                    {"type":"Container","id":"whiteContainer","components":[],"layout":{"width":302,"height":21,"x":481,"y":459,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"mobile.core.components.Container"},
                    {"type":"Container","id":"blueContainer","components":[],"layout":{"width":105,"height":30,"x":639,"y":491,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"mobile.core.components.Container"}];

                siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps}});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('if there is loop start with negative anchor remove the last anchor closing the loop', function(){
                updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));
                var expectedAnchor = {distance: 0, locked: true, originalValue: 500, type: 'BOTTOM_PARENT'};

                var blueContainer = getComponentFromMainPage(mockPrivateServices, 'blueContainer');
                expect(blueContainer.layout.anchors.length).toBe(1); // in this comp we delete the anchor causing the loop
                expect(blueContainer.layout.anchors[0]).toContain(expectedAnchor);
            });

            it('components that are indirectly connected should have anchor to each other', function(){
                updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'redWPhoto'));

                var redWPhoto = getComponentFromMainPage(mockPrivateServices, 'redWPhoto');
                var greyContainer = getComponentFromMainPage(mockPrivateServices, 'greyContainer');
                var whiteContainer = getComponentFromMainPage(mockPrivateServices, 'whiteContainer');
                var blueContainer = getComponentFromMainPage(mockPrivateServices, 'blueContainer');

                expect(redWPhoto.layout.anchors.length).toBe(2);
                expect(greyContainer.layout.anchors.length).toBe(2);
                expect(whiteContainer.layout.anchors.length).toBe(1);
                expect(blueContainer.layout.anchors.length).toBe(1);
            });

        });

        // Editor Link :: http://editor.wix.com/html/editor/web/renderer/edit/321279d5-0706-42f2-80aa-72086136554a?metaSiteId=51872479-33ea-4da0-89bb-ace459c55d00&editorSessionId=3639AD7B-74F4-4A12-94D1-DFE4A67AF2B3
        describe('Additional TOP_TOP and BOTTOM_BOTTOM TESTS', function(){
            beforeEach(function(){
                var comps = [
                    {"type":"Component","id":"wixPhoto","layout":{"width":262,"height":193,"x":210,"y":154,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"wysiwyg.viewer.components.WPhoto"},
                    {"type":"Component","id":"bottomTopBtn","layout":{"width":142,"height":60,"x":175,"y":105,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"wysiwyg.viewer.components.SiteButton"},
                    {"type":"Component","id":"topTopBtn","layout":{"width":130,"height":60,"x":397,"y":149,"scale":1,"rotationInDegrees":0,"anchors":[],"fixedPosition":false},"componentType":"wysiwyg.viewer.components.SiteButton"}];

                siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps}});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('if compB is Below A and the overlapping more than half TOP_TOP anchor should be created between them ', function(){
                updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'wixPhoto'));
                var expectedTopTopAnchor = {distance: 5 , locked: true, originalValue: 154, type: "TOP_TOP"};
                var expectedBottomParentPAnchor = {distance: 0 , locked: true, originalValue: 500, type: "BOTTOM_PARENT"};

                var topTopBtn = getComponentFromMainPage(mockPrivateServices, 'topTopBtn');
                expect(topTopBtn.layout.anchors.length).toBe(2);
                expect(topTopBtn.layout.anchors[0]).toContain(expectedTopTopAnchor);
                expect(topTopBtn.layout.anchors[1]).toContain(expectedBottomParentPAnchor);
            });

            it('if compB is Below A and the overlapping is less than half BOTTOM_TOP anchor should be created between them ', function(){
                updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'wixPhoto'));

                var expectedAnchor = {distance: -11, locked: true, originalValue: 154, type: 'BOTTOM_TOP'};

                var bottomTopBtn = getComponentFromMainPage(mockPrivateServices, 'bottomTopBtn');
                expect(bottomTopBtn.layout.anchors.length).toBe(1);
                expect(bottomTopBtn.layout.anchors[0]).toContain(expectedAnchor);
            });
        });

        describe('update anchors after reparent - old anchors should be delted', function(){
            beforeEach(function(){
                var comps = [
                    {"id":"newContainer", "layout":{"rotationInDegrees":0,"width":257,"height":296,"scale":1,"x":66,"y":53,"fixedPosition":false,"anchors":[]},"componentType":"mobile.core.components.Container","components":[
                        {"id":"compA", "layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":400,"y":113,"fixedPosition":false,"anchors":[{"originalValue":434,"topToTop":105,"locked":false,"targetComponent":"oldContainer","distance":146,"type":"BOTTOM_PARENT"}]},"componentType":"wysiwyg.viewer.components.WPhoto"}]},

                    {"id":"oldContainer", "layout":{"rotationInDegrees":0,"width":487,"height":434,"scale":1,"x":348,"y":61,"fixedPosition":false,"anchors":[]},"componentType":"mobile.core.components.Container", "components":[
                        {"id":"compB", "layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":47,"y":33,"fixedPosition":false,"anchors":[{"originalValue":105,"topToTop":72,"locked":false,"targetComponent":"compA","distance":72,"type":"TOP_TOP"}]},"componentType":"wysiwyg.viewer.components.WPhoto","type":"Component"}]}];

                //mockPage = {"mainPage":{"structure":{"layout":{"rotationInDegrees":0,"width":980,"height":515,"scale":1,"x":0,"y":0,"fixedPosition":false,"anchors":[]},"components":comps,"componentType":"mobile.core.components.Page","mobileComponents":[{"layout":{"rotationInDegrees":0,"width":280,"height":58,"scale":1,"x":20,"y":10,"fixedPosition":false,"anchors":[{"originalValue":78,"topToTop":68,"locked":true,"targetComponent":"oldContainer","distance":10,"type":"BOTTOM_TOP"}]},"styleId":"c1","components":[{"layout":{"rotationInDegrees":0,"width":83,"height":38,"scale":1,"x":99,"y":10,"fixedPosition":false,"anchors":[{"originalValue":58,"topToTop":10,"locked":true,"targetComponent":"newContainer","distance":10,"type":"BOTTOM_PARENT"}]},"styleId":"b1","propertyQuery":"i1qluihv","componentType":"wysiwyg.viewer.components.SiteButton","type":"Component","id":"i1qluihv","skin":"wysiwyg.viewer.skins.button.BasicButton","dataQuery":"#c2zh"},{"layout":{"rotationInDegrees":0,"width":83,"height":38,"scale":1,"x":99,"y":10,"fixedPosition":true,"anchors":[{"originalValue":58,"topToTop":10,"locked":true,"targetComponent":"newContainer","distance":10,"type":"BOTTOM_PARENT"}]},"styleId":"b1","propertyQuery":"i1qluihv","componentType":"wysiwyg.viewer.components.SiteButton","type":"Component","id":"i1qluihv","skin":"wysiwyg.viewer.skins.button.BasicButton","dataQuery":"#c2zh"},{"layout":{"rotationInDegrees":0,"width":83,"height":38,"scale":1,"x":99,"y":10,"fixedPosition":true,"anchors":[{"originalValue":58,"topToTop":10,"locked":true,"targetComponent":"newContainer","distance":10,"type":"BOTTOM_PARENT"}]},"styleId":"b1","propertyQuery":"i1qluihv","componentType":"wysiwyg.viewer.components.SiteButton","type":"Component","id":"i1qluihv","skin":"wysiwyg.viewer.skins.button.BasicButton","dataQuery":"#c2zh"}],"componentType":"mobile.core.components.Container","type":"Container","id":"newContainer","skin":"wysiwyg.viewer.skins.area.DefaultAreaSkin"},{"layout":{"rotationInDegrees":0,"width":280,"height":275,"scale":1,"x":20,"y":78,"fixedPosition":false,"anchors":[{"originalValue":500,"topToTop":78,"locked":false,"targetComponent":"mainPage","distance":364,"type":"BOTTOM_PARENT"}]},"styleId":"c1","components":[{"layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":21,"y":10,"fixedPosition":false,"anchors":[{"originalValue":30,"topToTop":20,"locked":true,"targetComponent":"i1rt6yv0","distance":20,"type":"TOP_TOP"},{"originalValue":53,"topToTop":43,"locked":true,"targetComponent":"i1rt711t","distance":43,"type":"TOP_TOP"},{"originalValue":82,"topToTop":72,"locked":false,"targetComponent":"compA","distance":72,"type":"TOP_TOP"},{"originalValue":275,"topToTop":10,"locked":false,"targetComponent":"oldContainer","distance":82,"type":"BOTTOM_PARENT"}]},"styleId":"wp1","propertyQuery":"compB","componentType":"wysiwyg.viewer.components.WPhoto","type":"Component","id":"compB","skin":"wysiwyg.viewer.skins.photo.RoundPhoto","dataQuery":"#c1iop"},{"layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":47,"y":30,"fixedPosition":false,"anchors":[{"originalValue":53,"topToTop":23,"locked":true,"targetComponent":"i1rt711t","distance":23,"type":"TOP_TOP"},{"originalValue":82,"topToTop":52,"locked":true,"targetComponent":"compA","distance":52,"type":"TOP_TOP"},{"originalValue":275,"topToTop":30,"locked":true,"targetComponent":"oldContainer","distance":62,"type":"BOTTOM_PARENT"}]},"styleId":"wp1","propertyQuery":"ct5f","componentType":"wysiwyg.viewer.components.WPhoto","type":"Component","id":"i1rt6yv0","skin":"wysiwyg.viewer.skins.photo.RoundPhoto","dataQuery":"#c1tz7"},{"layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":68,"y":53,"fixedPosition":false,"anchors":[{"originalValue":82,"topToTop":29,"locked":true,"targetComponent":"compA","distance":29,"type":"TOP_TOP"},{"originalValue":275,"topToTop":53,"locked":true,"targetComponent":"oldContainer","distance":39,"type":"BOTTOM_PARENT"}]},"styleId":"wp1","propertyQuery":"ca2l","componentType":"wysiwyg.viewer.components.WPhoto","type":"Component","id":"i1rt711t","skin":"wysiwyg.viewer.skins.photo.RoundPhoto","dataQuery":"#c864"},{"layout":{"rotationInDegrees":0,"width":167,"height":183,"scale":1,"x":92,"y":82,"fixedPosition":false,"anchors":[{"originalValue":275,"topToTop":82,"locked":true,"targetComponent":"oldContainer","distance":10,"type":"BOTTOM_PARENT"}]},"styleId":"wp1","propertyQuery":"c229k","componentType":"wysiwyg.viewer.components.WPhoto","type":"Component","id":"compA","skin":"wysiwyg.viewer.skins.photo.RoundPhoto","dataQuery":"#c1tsf"}],"componentType":"mobile.core.components.Container","type":"Container","id":"oldContainer","skin":"wysiwyg.viewer.skins.area.DefaultAreaSkin"}],"id":"mainPage"}}};
                //var siteData = testUtils.mockFactory.mockSiteData()
                //    .addPage(mockPage);

                siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps}});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('after repaent the old anchor need to be deleted and the function will recalculate anchors for new container and old container', function(){
                var changedCompExpectedAnchorsBeforeLayout = {type:"BOTTOM_PARENT",targetComponent: "oldContainer"};
                var oldCompWithAnchorToChangedCompExpectedAnchorsBeforeLayout = {type:"TOP_TOP",targetComponent: "compA"};

                var changedCompExpectedAnchorsAfterUpdate = {type:"BOTTOM_PARENT",targetComponent: "newContainer"};
                var oldCompWithAnchorToChangedCompExpectedAnchorsAfterUpdate = {type:"BOTTOM_PARENT",targetComponent: "oldContainer"};

                var changedComp = getComponentFromMainPage(mockPrivateServices, 'compA');
                var oldCompWithAnchorToChangedComp = getComponentFromMainPage(mockPrivateServices, 'compB');

                expect(changedComp.layout.anchors.length).toBe(1);
                expect(changedComp.layout.anchors[0]).toContain(changedCompExpectedAnchorsBeforeLayout);
                expect(oldCompWithAnchorToChangedComp.layout.anchors.length).toBe(1);
                expect(oldCompWithAnchorToChangedComp.layout.anchors[0]).toContain(oldCompWithAnchorToChangedCompExpectedAnchorsBeforeLayout);

                updateAnchors(mockPrivateServices, getCompPointerFromMainPage(mockPrivateServices, 'newContainer'), getCompPointerFromMainPage(mockPrivateServices, 'oldContainer'));

                changedComp = getComponentFromMainPage(mockPrivateServices, 'compA');
                oldCompWithAnchorToChangedComp = getComponentFromMainPage(mockPrivateServices, 'compB');
                expect(changedComp.layout.anchors.length).toBe(1);
                expect(changedComp.layout.anchors[0]).toContain(changedCompExpectedAnchorsAfterUpdate);
                expect(oldCompWithAnchorToChangedComp.layout.anchors.length).toBe(1);
                expect(oldCompWithAnchorToChangedComp.layout.anchors[0]).toContain(oldCompWithAnchorToChangedCompExpectedAnchorsAfterUpdate);

            });



        });

        describe('updateAnchorsForMultipleComps', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('removeJsonAnchors');
                this.buttonComp = {"id":"buttonComp", "type":"Component","layout":{"width":130,"height":60,"x":134,"y":261,"rotationInDegrees":0,"anchors":[]},"componentType":"wysiwyg.viewer.components.SiteButton"};
                this.siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: [this.buttonComp]}});
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
            });

            it('should clear the collection of comps that need to update anchors', function(){
                updateAnchors(this.ps, getCompPointerFromMainPage(this.ps, this.buttonComp.id));

                var compsToUpdateAnchorsPointer = this.ps.pointers.general.getCompsToUpdateAnchors();

                expect(this.ps.dal.get(compsToUpdateAnchorsPointer)).toEqual([]);
            });

            it('should activate the viewer anchors creation for pages that contain components waiting for update', function(){
                spyOn(this.ps.siteAPI, 'createPageAnchors').and.callThrough();

                updateAnchors(this.ps, getCompPointerFromMainPage(this.ps, this.buttonComp.id));

                expect(this.ps.siteAPI.createPageAnchors.calls.count()).toEqual(1);
            });

            it('should ignore components that no longer exist in document', function(){
                spyOn(this.ps.siteAPI, 'createPageAnchors').and.callThrough();
                var buttonPointer = getCompPointerFromMainPage(this.ps, this.buttonComp.id);
                this.ps.dal.remove(buttonPointer);

                updateAnchors(this.ps, buttonPointer);

                expect(this.ps.siteAPI.createPageAnchors.calls.count()).toEqual(0);
            });
        });
    });
});
