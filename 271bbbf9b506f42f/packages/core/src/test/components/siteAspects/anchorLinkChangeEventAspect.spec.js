define(['testUtils', 'core/core/siteAspectsRegistry', 'utils'],
    function (testUtils, siteAspectsRegistry, utils) {
    'use strict';

    describe('anchorLinkChangeEventAspect tests', function () {
        var siteAPI;
        var anchorLinkChangeEventAspect;

        function createComponent(id) {
            return {
                props: {
                    id: id
                },
                onAnchorChange: jasmine.createSpy(id)
            };
        }

        function createMockAnchor (id) {
            return {
                activeAnchorComp: {
                    id: id
                }
            };
        }

        beforeEach(function (done) {
            var AnchorLinkChangeEventAspect = siteAspectsRegistry.getSiteAspectConstructor('anchorChangeEvent');

            testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {
                'core/siteRender/SiteAspectsSiteAPI':{
                    getSiteData: function () {
                        return testUtils.mockFactory.mockSiteData();
                    }
                }
            }, function(SiteData, SiteAPI){
                siteAPI = new SiteAPI();
                anchorLinkChangeEventAspect = new AnchorLinkChangeEventAspect(siteAPI);
                done();
            });
        });

        describe('Component registration to aspect', function () {
            it("should notify on anchorChange if comp is registered", function(){
                var comp1 = createComponent('comp1');
                anchorLinkChangeEventAspect.registerToAnchorChange(comp1);

                anchorLinkChangeEventAspect.propagateAnchorChangeEvent();

                expect(comp1.onAnchorChange).toHaveBeenCalled();
            });

            it("should NOT notify on anchorChange if comp is not registered", function(){
                var comp1 = createComponent('comp1');

                anchorLinkChangeEventAspect.propagateAnchorChangeEvent();

                expect(comp1.onAnchorChange).not.toHaveBeenCalled();
            });
        });

        describe('anchorChange event', function () {
            var comp1;

            beforeEach(function () {
                comp1 = createComponent('comp1');
                anchorLinkChangeEventAspect.registerToAnchorChange(comp1);
                spyOn(utils.scrollAnchors, 'getActiveAnchor').and.returnValue(createMockAnchor(1));
                anchorLinkChangeEventAspect.onScroll();
                comp1.onAnchorChange.calls.reset();
            });

            it("should notify on anchorChange when active anchor changes", function(){
                utils.scrollAnchors.getActiveAnchor.and.returnValue(createMockAnchor(2));

                anchorLinkChangeEventAspect.onScroll();

                expect(comp1.onAnchorChange).toHaveBeenCalled();
            });

            it("should not notify on anchorChange when the active anchor was not changed", function(){
                anchorLinkChangeEventAspect.onScroll();

                expect(comp1.onAnchorChange).not.toHaveBeenCalled();
            });
        });

        describe('setSelectedAnchorAsync', function () {
            var comp1;
            var MockAnchor1 = {id: '1'};
            var MockAnchor2 = {id: '2'};

            beforeEach(function () {
                comp1 = createComponent('comp1');
                anchorLinkChangeEventAspect.registerToAnchorChange(comp1);
                spyOn(utils.scrollAnchors, 'getPageAnchors').and.returnValue([]);
                spyOn(utils.scrollAnchors, 'getSortedAnchorsByY').and.returnValue([MockAnchor1, MockAnchor2]);
                jasmine.clock().install();
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it("should notify on anchorChange when active anchor changes", function(){
                anchorLinkChangeEventAspect.setSelectedAnchorAsync({}, '#' + MockAnchor2.id, 'pageId', utils.constants.ACTIVE_ANCHOR.DELAY_TO_END_SCROLL);

                expect(comp1.onAnchorChange).not.toHaveBeenCalled();

                jasmine.clock().tick(utils.constants.ACTIVE_ANCHOR.DELAY_TO_END_SCROLL + 1);

                expect(comp1.onAnchorChange).toHaveBeenCalled();
                expect(anchorLinkChangeEventAspect.getActiveAnchor()).toEqual({activeAnchorComp: MockAnchor2});
            });

            it("should NOT notify on anchorChange when active anchor doesn't exists", function(){
                anchorLinkChangeEventAspect.setSelectedAnchorAsync({}, '#' + 3, 'pageId', 0);

                jasmine.clock().tick(1);

                expect(comp1.onAnchorChange).not.toHaveBeenCalled();
            });
        });
    });
});
