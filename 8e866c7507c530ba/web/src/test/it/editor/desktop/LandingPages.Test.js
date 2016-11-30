integration.noAutomation();
integration.requireExperiments(['LandingPageSupport']);
describe("LandingPages Integration Tests", function () {

    var viewer, siteNode, pageGroup, gridlines, pagesDriver;

    beforeAll(function(){
        viewer = W.Preview.getPreviewManagers().Viewer;
        siteNode = viewer.getSiteNode();
        pageGroup = viewer.getPageGroup();
        gridlines = W.Editor.getEditorUI().getEditLayer().getGridLines();
        pagesDriver = automation.controllers.Pages;
    });

    beforeEach(function(){

    });

    function isHorizontalGridlineShowing(){
        return gridlines.getState('horizontalGridLines') === 'horizontalEnabled';
    }
    function isVerticalGridlinesShowing(){
        return gridlines.getState('verticalGridLines') === 'verticalEnabled';
    }

    function testGridlinesForLandingPage(){
        it("should hide the horizontal gridlines", function(){
            expect(isHorizontalGridlineShowing()).toBe(false);
        });
        it("should show the vertical gridlines", function(){
            expect(isVerticalGridlinesShowing()).toBe(true);
        });
    }

    function testGridlinesToggleForLandingPage(){
        describe("Toggling the grid lines in a landing page", function(){
            it("should hide all the gridlines when toggling off", function(){
                gridlines.toggleGrid(false);
                expect(areAllGridlinesHidden()).toBe(true);

            });
            it("should show only the vertical gridlines when toggline on", function(){
                gridlines.toggleGrid(true);
                expect(!isHorizontalGridlineShowing() && isVerticalGridlinesShowing()).toBe(true);
            });
        });
    }

    function areAllGridlinesHidden(){
        return !( isHorizontalGridlineShowing() || isVerticalGridlinesShowing() );
    }

    describe("Loading the editor on a landing page", function(){
        it("should wait for the landing page to be ready", function(){
            waits(50);
        });
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForLandingPage();
        testGridlinesForLandingPage();
        testGridlinesToggleForLandingPage();
    });

    describe("navigating to a non-landing page (from a landing page)", function(){
        it("should wait for navigation to complete", function(){
            var filter = function(pageData){
                return !pageData.get('isLandingPage');
            };
            automation.Utils.waitsForPromise(function(){
                return pagesDriver.goToRandomPage(filter);
            });
            runs(function(){
                waits(50);
            });
        });
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForNormalPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForNormalPage();
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForNormalPage();
    });
/*

    //note: commented out because it's very difficult (if not impossible) to actually test with our panels today.

    describe("Setting an existing page to be a landing page", function(){
        it("should set the landing page property to true", function(){
            var pageId = pagesDriver.getCurrentPageIdSync(),
                pageComp = pagesDriver.getPagesSync()[pageId];
            automation.Utils.waitsForPromise(function(){
                return automation.editorcomponents.Panels.openPageSettingsPanel().then(function(pageSettingsPanel){
                    pageSettingsPanel._landingPageCheckbox.setValue(true);
                });
            });

            runs(function(){
                expect(pageComp.getDataItem().get('isLandingPage')).toBeTruthy();
            });
        });
        it("should change the page to actually be a landing page, and pass landing page tests", function(){
            waits(50);
            runs(function(){
                automation.unittestexecutors.LandingPage.runSiteNodeTestsForLandingPage();
                automation.unittestexecutors.LandingPage.runPagesContainerTestsForLandingPage();
                automation.unittestexecutors.LandingPage.runFooterTestsForLandingPage();

                testGridlinesForLandingPage();
            });
        });
    });*/

    describe("navigating to a landing page (from a non-landing page)", function(){
        it("should wait for navigation to complete", function(){
            automation.Utils.waitsForPromise(function(){
                return pagesDriver.goToPage(pagesDriver.getHomePageIdSync());
            });
            runs(function(){
                waits(50);
            });
        });
        automation.unittestexecutors.LandingPage.runSiteNodeTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runPagesContainerTestsForLandingPage();
        automation.unittestexecutors.LandingPage.runFooterTestsForLandingPage();
        testGridlinesForLandingPage();

    });
    /*
        //note: commented out because this is pending on actually getting 'landing page' templates to test against
        describe("Adding a landing page", function(){
       it("should add a new page with the landing page property", function(){
           var isLandingPage;
           automation.Utils.waitsForPromise(function(){
               return pagesDriver.addPageByPageTemplateID('LANDING_PAGE_1', 'Landing Page').then(function(pageLogic){
                   isLandingPage = pageLogic.getDataItem().get('isLandingPage');
               });
           });
           runs(function(){
               expect(isLandingPage).toBeTruthy();
           });
       });
    });*/



});
