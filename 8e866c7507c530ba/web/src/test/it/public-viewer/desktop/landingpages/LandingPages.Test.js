integration.noAutomation();
integration.requireExperiments(['LandingPageSupport']);
integration.requireViewer('staffetai','landingpage-viewer');
describe("LandingPages Integration Tests", function () {

    var siteNode, pageGroup, pagesDriver;

    beforeAll(function(){
        siteNode = W.Viewer.getSiteNode();
        pageGroup = W.Viewer.getPageGroup();
        pagesDriver = automation.controllers.Pages;
    });

    beforeEach(function(){

    });

    describe("navigating to a landing page", function(){
        it("should hide all the masterpage components", function(){
            expect(false).toBeTruthy();
        });

        it("should have the footer's height set to 0", function(){
            expect(false).toBeTruthy();
        });

        it("should move the page group to y=0", function(){
            expect(false).toBeTruthy();
        });

    });

    describe("navigating to a non-landing page (from a landing page)", function(){
        it("should show all the masterpage components", function(){
            expect(false).toBeTruthy();
        });

        it("should have the footer visible with it's correct height", function(){
            expect(false).toBeTruthy();
        });

        it("return the page-group to be in it's original y position", function(){
            expect(false).toBeTruthy();
        });

    });

});
