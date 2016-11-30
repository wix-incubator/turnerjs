integration.requireViewer('moranw','1223');

//should run with optimized on, enable preloader with tpa galleries data!
//can run with http://moranw.wix.com/1223 --> has components from all sorts
//wysiwyg, ecom, list builder, classic apps, tpa, tpa galleries etc)

describe("captureMobile functionality", function () {

    describe("mobile optimized on", function () {

        beforeAll(function(){
            automation.Utils.waitsForPromise(function(){
                var deferred = Q.defer();
                window.addEvent('siteReadyForCapture', function(){
                    deferred.resolve();
                });
                setTimeout(function(){ //this is a HACK! don't copy it!
                    W.Viewer.captureMobile();
                }, 6000); // because we must wait for desktop to be fully rendered on screen before capturing mobile
                return deferred.promise;
            });
        });

        it('should be able to create capturedHtml json with all its basic data', function () {
            expect(window.capturedHtml).toBeDefined();
            expect(window.capturedHtml.shouldCapture).toBeTruthy();

            var pageInfo = _.find(publicModel.pageList.pages, function(page){
                return page.pageId === publicModel.pageList.mainPageId;
            });
            var mainPageKey = _.last(pageInfo.urls[0].split('/')).split('?')[0].split('.')[0];
            var masterPageKey = _.last(publicModel.pageList.masterPage[0].split('/')).split('?')[0];

            expect(window.capturedHtml.urlName).toContain(mainPageKey);
            expect(window.capturedHtml.urlName).toContain(masterPageKey);
            expect(window.capturedHtml.pageId).toBe(publicModel.pageList.mainPageId);

            var skinStylesScript = "<style id='static_skinStyles'>";
            var themeStylesScript = "<style id='static_themeStyles'>";
            expect(window.capturedHtml.headHtml).toContain(skinStylesScript);
            expect(window.capturedHtml.headHtml).toContain(themeStylesScript);
        });

        it("should add 'static_' prefix to all components' ids", function () {
            var nonStatic = _.find(document.querySelectorAll('[comp]'), function(comp){
                return comp.$logic && comp.getAttribute('id').indexOf('static_') !== 0;
            });
            expect(nonStatic).toBeUndefined();
        });

        it('should not include serverGenerated elements', function () {
            expect(window.capturedHtml.headHtml).not.toContain('servergenerated');
        });

        it('should include tpaGalleriesData object (only when there are tpa galleries present)', function () {
            expect(window.capturedHtml.tpaGalleriesData).toBeDefined();
        });
    });

    describe("mobile optimized off", function () {

        beforeAll(function(){
            window.publicModel.adaptiveMobileOn = false;

            automation.Utils.waitsForPromise(function(){
                var deferred = Q.defer();
                window.addEvent('noMobileCapture', function(){
                    deferred.resolve();
                });
                W.Viewer.captureMobile();
                return deferred.promise;
            });
        })

        it('should not capture html if mobile optimized is off', function () {
            expect(window.capturedHtml).toBeDefined();
            expect(window.capturedHtml.shouldCapture).toBeFalsy();
            expect(window.capturedHtml.headHtml).not.toBeDefined();
            expect(window.capturedHtml.headHtml).not.toBeDefined();
            window.publicModel.adaptiveMobileOn = true; //cleanup
        });
    });
});


