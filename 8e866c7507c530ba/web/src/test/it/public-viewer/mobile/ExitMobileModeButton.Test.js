//integration.noAutomation();
//integration.requireMobileViewer('sagi3','btttest');
//integration.requireExperiments(['exitmobilemode']);
//
//beforeEach(function () {
//});
//
//describe("Exit mobile mode button - Viewer integration tests", function(){
//
//    var exitMobileBtnElem;
//
//    it("should have an exit mobile mode button to test", function() {
//        automation.Utils.waitsForPromise(function () {
//            return Q.resolve()
//                .then(function(){
//                    return automation.WebElement.getWebElement(document, "[comp='wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode']");
//                })
//                .then(function(elem){
//                    exitMobileBtnElem = elem;
//                    expect(exitMobileBtnElem).not.toBeNull();
//                });
//        });
//    });
//
//    it("should be tested on a mobile viewing device", function(){
//        expect(W.Config.env.$viewingDevice).toBe(Constants.ViewerTypesParams.TYPES.MOBILE);
//    });
//
//    it("should switch to desktop viewer on click", function() {
//        automation.Utils.waitsForPromise(function () {
//            return Q.resolve()
//                .then(function(){
//                    var deferred = Q.defer();
//                    exitMobileBtnElem.click();
//                    W.Viewer.getSiteView(Constants.ViewerTypesParams.TYPES.DESKTOP).addEvent("SiteReady", function(){
//                        deferred.resolve();
//                    });
//                    return deferred.promise;
//                })
//                .then(function(){
//                    expect(W.Config.env.$viewingDevice).toBe(Constants.ViewerTypesParams.TYPES.DESKTOP);
//                });
//        });
//    });
//
//});
