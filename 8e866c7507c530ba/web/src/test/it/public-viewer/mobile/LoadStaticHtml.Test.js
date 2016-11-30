integration.requireMobileViewer('moranw','1223');

describe("load static html functionality", function () {

//should run with optimized on, enable preloader
//can run with http://moranw.wix.com/1223?showMobileView=true --> has components from all sorts
//wysiwyg, ecom, list builder, classic apps, tpa, tpa galleries etc)

    beforeAll(function(){
        automation.Utils.waitsForPromise(function(){
            var deferred = Q.defer();
            if (W.Viewer.isStaticHtmlCleared()){
                deferred.resolve();
            } else {
                resource.getResourceValue('W.Viewer', function(viewer){
                    viewer.addEvent('siteReplacedStaticHtml', function(){
                        deferred.resolve();
                    });
                });
            }
            return deferred.promise;
        });
    });

    it("should have cleaned up all static elements", function () {
        var staticElements = document.querySelectorAll("[id^=static_]");
        expect(staticElements.length).toBeLessThan(2); //only mobile bg-node or nothing
    });

    it("should have removed farAwayNode class for the site structure", function () {
        expect($$('.farAwayNode').length).toBe(0);
    });

    it("should return true for isLoadedFromStatic", function () {
        expect(W.Config.isLoadedFromStatic()).toBeTruthy();
    });
});


