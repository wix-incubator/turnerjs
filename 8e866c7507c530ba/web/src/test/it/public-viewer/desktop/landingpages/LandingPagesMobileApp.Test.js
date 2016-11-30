integration.noAutomation();
integration.requireExperiments(['LandingPageSupport']); //also MobileApp experiment?
integration.requireViewer('staffetai','landingpage-viewer');
describe("LandingPages Mobile App Integration Tests", function () {

    var siteNode, pageGroup, pagesDriver;

    beforeAll(function(){
        siteNode = W.Viewer.getSiteNode();
        pageGroup = W.Viewer.getPageGroup();
        pagesDriver = automation.controllers.Pages;
    });

    beforeEach(function(){

    });

    describe("The first page in the site", function(){
        it("should be loaded as a landing page", function(){
            expect(false).toBeTruthy();
        });
    });

    describe("When navigating to other pages in the site", function(){
        it("they should all be loaded as landing pages", function(){
            expect(false).toBeTruthy();
        });

    });

});
