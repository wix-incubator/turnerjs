define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/component/component', 'documentServices/layouters/layouters'],
    function (_, testUtils, privateServicesHelper, component, layouters) {
    'use strict';

    describe('boxSlideShow layouter functions', function () {
        var pageId = 'pageId';
        var ps, siteData, pagePointer;
        var mockFactory = testUtils.mockFactory;
        var boxSlideShowType = 'wysiwyg.viewer.components.BoxSlideShow';
        var stripContainerSlideShowType = 'wysiwyg.viewer.components.StripContainerSlideShow';

        function mockSlideShowComponent() {
            var slideShow = mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShow', {}, 'boxSlideShowId');
            slideShow.components = _.map([1, 2, 3], function (slideId) {
                return mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShowSlide', {}, 'boxSlide-' + slideId);
            });
            _.forEach(slideShow.components, function(comp, index){
                comp.components = [mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {}, 'boxSlideChild-' + (index + 1))];
            });

            slideShow.components.push(mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {}, 'boxMasterComp-1'));
            return slideShow;
        }

        function mockStripSlideShowComponent() {
            var slideShow = mockFactory.createStructure('wysiwyg.viewer.components.StripContainerSlideShow', {}, 'stripSlideShowId');
            slideShow.components = _.map([1, 2], function (slideId) {
                return mockFactory.createStructure('wysiwyg.viewer.components.StripContainerSlideShowSlide', {}, 'stripSlide-' + slideId);
            });
            _.forEach(slideShow.components, function(comp, index){
                comp.components = [mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {}, 'stripSlideChild-' + (index + 1))];
            });

            slideShow.components.push(mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {}, 'stripMasterComp-1'));
            slideShow.components.push(mockFactory.createStructure('wysiwyg.viewer.components.Video', {}, 'stripMasterComp-2'));
            return slideShow;
        }

        beforeEach(function(){
            var boxSlideShowComp = mockSlideShowComponent();
            var stripSlideShowComp = mockStripSlideShowComponent();
            siteData = mockFactory.mockSiteData()
                .addMeasureMap()
                .addPageWithDefaults(pageId, [boxSlideShowComp, stripSlideShowComp]);
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
        });

        describe('getMasterChildren', function(){
            it("should get all children that behave as master components (i.e shown on all father component's changing states) from boxSlideShow", function () {
                var compPointer = ps.pointers.components.getComponent('boxSlideShowId', pagePointer);
                var masterChildren = layouters.getMasterChildren(ps, compPointer);
                expect(masterChildren.length).toEqual(1);
                expect(masterChildren[0].id).toEqual('boxMasterComp-1');
            });

            it("should get all children that behave as master components (i.e shown on all father component's changing states) from stripContainerSlideShow", function () {
                var compPointer = ps.pointers.components.getComponent('stripSlideShowId', pagePointer);
                var masterChildren = layouters.getMasterChildren(ps, compPointer);
                expect(masterChildren.length).toEqual(2);
                expect(masterChildren[0].id).toEqual('stripMasterComp-1');
                expect(masterChildren[1].id).toEqual('stripMasterComp-2');
            });

            it("should throw an error for a non layouter component", function () {
                var compPointer = ps.pointers.components.getComponent('boxMasterComp-1', pagePointer);
                expect(function(){
                    layouters.getMasterChildren(ps, compPointer);
                }).toThrow();
            });
        });

        describe('getNonMasterChildren', function(){
            it("should get all children that don't behave as master components (i.e shown on a specific father's state, and not on all states) from boxSlideShow", function () {
                var compPointer = ps.pointers.components.getComponent('boxSlideShowId', pagePointer);
                var nonMasterChildren = layouters.getNonMasterChildren(ps, compPointer);
                _.forEach(nonMasterChildren, function(child, index){
                    expect(child.id).toEqual('boxSlide-' + (index + 1));
                });
            });

            it("should get all children that don't behave as master components (i.e shown on a specific father's state, and not on all states) from stripContainerSlideShow", function () {
                var compPointer = ps.pointers.components.getComponent('stripSlideShowId', pagePointer);
                var nonMasterChildren = layouters.getNonMasterChildren(ps, compPointer);
                _.forEach(nonMasterChildren, function(child, index){
                    expect(child.id).toEqual('stripSlide-' + (index + 1));
                });
            });

            it("should throw an error for a non layouter component", function () {
                var compPointer = ps.pointers.components.getComponent('boxMasterComp-1', pagePointer);
                expect(function(){
                    layouters.getNonMasterChildren(ps, compPointer);
                }).toThrow();
            });
        });

        describe('isMasterChild', function(){
            it("should return true for a boxSlideShow's master child (i.e shown on all states) and false for a specific slide or another non child comp", function () {
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('boxMasterComp-1', pagePointer), boxSlideShowType)).toEqual(true);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('boxSlide-1', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('boxSlideShowId', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('stripSlideShowId', pagePointer), boxSlideShowType)).toEqual(false);
            });

            it("should return true for a stripContainerSlideShow's master child (i.e shown on all states) and false for a specific slide", function () {
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('stripMasterComp-1', pagePointer), stripContainerSlideShowType)).toEqual(true);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('stripMasterComp-2', pagePointer), stripContainerSlideShowType)).toEqual(true);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('stripSlide-1', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('boxSlideShowId', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.isMasterChild(ps, ps.pointers.components.getComponent('stripSlideShowId', pagePointer), stripContainerSlideShowType)).toEqual(false);
            });

            it("should throw an error for a non layouter component", function () {
                var compPointer = ps.pointers.components.getComponent('boxMasterComp-1', pagePointer);
                expect(function(){
                    layouters.isMasterChild(ps, compPointer, 'wysiwyg.viewer.components.SiteButton');
                }).toThrow();
            });
        });

        describe('canBeMasterChild', function(){
            it("should return true only for direct or indirect non slides children of a boxSlideShow", function () {
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxMasterComp-1', pagePointer), boxSlideShowType)).toEqual(true);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlideChild-1', pagePointer), boxSlideShowType)).toEqual(true);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlide-1', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripMasterComp-1', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlide-1', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlideShowId', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlideShowId', pagePointer), boxSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlideChild-1', pagePointer), boxSlideShowType)).toEqual(false);
            });

            it("should return true only for direct or indirect non slides children of a stripContainerSlideShow", function () {
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripMasterComp-1', pagePointer), stripContainerSlideShowType)).toEqual(true);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlideChild-1', pagePointer), stripContainerSlideShowType)).toEqual(true);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlide-1', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxMasterComp-1', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlide-1', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlideShowId', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('stripSlideShowId', pagePointer), stripContainerSlideShowType)).toEqual(false);
                expect(layouters.canBeMasterChild(ps, ps.pointers.components.getComponent('boxSlideChild-1', pagePointer), stripContainerSlideShowType)).toEqual(false);
            });

            it("should throw an error for a non layouter component", function () {
                var compPointer = ps.pointers.components.getComponent('boxMasterComp-1', pagePointer);
                expect(function(){
                    layouters.canBeMasterChild(ps, compPointer, 'wysiwyg.viewer.components.SiteButton');
                }).toThrow();
            });
        });

        describe('toggleMasterChild', function(){
            it("should turn a master child component of a boxSlideShow into a non master component", function(){
                var compPointer = ps.pointers.components.getComponent('boxMasterComp-1', pagePointer);
                expect(layouters.isMasterChild(ps, compPointer, boxSlideShowType)).toEqual(true);
                layouters.toggleMasterChild(ps, compPointer, boxSlideShowType);
                expect(layouters.isMasterChild(ps, compPointer, boxSlideShowType)).toEqual(false);
            });

            it("should turn a non master child component of a boxSlideShow into a master component", function(){
                var compPointer = ps.pointers.components.getComponent('boxSlideChild-1', pagePointer);
                expect(layouters.isMasterChild(ps, compPointer, boxSlideShowType)).toEqual(false);
                layouters.toggleMasterChild(ps, compPointer, boxSlideShowType);
                expect(layouters.isMasterChild(ps, compPointer, boxSlideShowType)).toEqual(true);
            });

            it("should turn a master child component of a stripContainerSlideShow into a non master component", function(){
                var compPointer = ps.pointers.components.getComponent('stripMasterComp-1', pagePointer);
                expect(layouters.isMasterChild(ps, compPointer, stripContainerSlideShowType)).toEqual(true);
                layouters.toggleMasterChild(ps, compPointer, stripContainerSlideShowType);
                expect(layouters.isMasterChild(ps, compPointer, stripContainerSlideShowType)).toEqual(false);
            });

            it("should turn a non master child component of a stripContainerSlideShow into a master component", function(){
                var compPointer = ps.pointers.components.getComponent('stripSlideChild-1', pagePointer);
                expect(layouters.isMasterChild(ps, compPointer, stripContainerSlideShowType)).toEqual(false);
                layouters.toggleMasterChild(ps, compPointer, stripContainerSlideShowType);
                expect(layouters.isMasterChild(ps, compPointer, stripContainerSlideShowType)).toEqual(true);
            });

            it("should throw an error for a component that can't be a master child (a slide)", function () {
                expect(function(){
                    layouters.toggleMasterChild(ps, ps.pointers.components.getComponent('boxSlide-1', pagePointer), boxSlideShowType);
                }).toThrow(new Error("component can't be shown on all states"));

                expect(function(){
                    layouters.toggleMasterChild(ps, ps.pointers.components.getComponent('stripSlide-1', pagePointer), stripContainerSlideShowType);
                }).toThrow(new Error("component can't be shown on all states"));
            });

            it("should throw an error for a component that can't be a master child (doesn't have a matching slideShow parent)", function () {
                expect(function(){
                    layouters.toggleMasterChild(ps, ps.pointers.components.getComponent('boxSlideShowId', pagePointer), boxSlideShowType);
                }).toThrow(new Error("component can't be shown on all states"));

                expect(function(){
                    layouters.toggleMasterChild(ps, ps.pointers.components.getComponent('stripSlideShowId', pagePointer), stripContainerSlideShowType);
                }).toThrow(new Error("component can't be shown on all states"));
            });
        });
    });
});
