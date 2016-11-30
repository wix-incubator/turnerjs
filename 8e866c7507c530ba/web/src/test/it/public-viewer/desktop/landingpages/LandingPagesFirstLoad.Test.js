integration.noAutomation();
integration.requireExperiments(['LandingPageSupport']);
integration.requireViewer('staffetai','firstpageislanding');
describe("LandingPages Integration Tests", function () {

    var pagesDriver;
    beforeAll(function(){
        pagesDriver = automation.controllers.Pages;
    });

    describe("loading a site on a landing page", function(){
        it("should wait for layout to finish updating", function(){
            waits(200); // letting W.Layout finish updating all anchors
        });
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForLandingPage();
    });

    describe("navigating to a non-landing page (from a landing page)", function(){
        it("should wait for navigation to complete", function(){
            var filter = function(pageData){
              return !pageData.get('isLandingPage');
            };
            automation.Utils.waitsForPromise(function(){
                return pagesDriver.goToRandomPage(filter);
            });
        });
        it("should wait for layout to finish updating", function(){
            waits(200); // letting W.Layout finish updating all anchors
        });
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForNormalPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForNormalPage();
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForNormalPage();
    });

    describe("navigating to a landing page", function(){
        it("should wait for navigation to complete", function(){
            automation.Utils.waitsForPromise(function(){
                return pagesDriver.goToPage(pagesDriver.getHomePageIdSync());
            });
        });
        it("should wait for layout to finish updating", function(){
            waits(200); // letting W.Layout finish updating all anchors
        });
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForLandingPage();
    });

});
