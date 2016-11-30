//describe('WViewManager', function() {
//
//    testRequire()
//        .resources('W.Viewer');
//
//    describe('page navigation', function(){
//
//        describe('_setDocumentTitle', function(){
//
//            beforeEach(function(){
//                this.originalDocTitle = document.title;
//
//                this.setPresetsForSetDocumentTitleTests = function(isHomePage, isPageTitleSeoDefined) {
//                    spyOn(W.Viewer, 'isHomePage').andReturn(isHomePage);
//
//                    var pageTitleSEO = isPageTitleSeoDefined? 'MOCK_PAGE_TITLE' : "";
//                    spyOn(W.Viewer, 'getPagesData').andReturn([{get: function(x) {return x=='pageTitleSEO'? pageTitleSEO : 'MOCK_PAGE_NAME'}}]);
//
//                    spyOn(W.Config, 'getSiteTitleSEO').andReturn('MOCK_SITE_TITLE');
//                }
//
//            });
//            afterEach(function(){
//                document.title = this.originalDocTitle;
//            });
//
//            it('when homePage=true, pageTitleSEO=MOCK_PAGE_TITLE, siteTitle=MOCK_SITE_TITLE', function(){
//                this.setPresetsForSetDocumentTitleTests(true, true);
//
//                var oldDocumentTitle = document.title;
//                W.Viewer._setDocumentTitle(0);
//
//                waitsFor(function () {
//                    return document.title !== oldDocumentTitle;
//                }, "Wait for the title to change", 1000);
//
//                runs(function () {
//                    expect(document.title).toBe("MOCK_PAGE_TITLE");
//                });
//            });
//
//            it('when homePage=true, pageTitleSEO=undef, siteTitle=MOCK_SITE_TITLE', function(){
//                this.setPresetsForSetDocumentTitleTests(true, false);
//
//                var oldDocumentTitle = document.title;
//                W.Viewer._setDocumentTitle(0);
//
//                waitsFor(function () {
//                    return document.title !== oldDocumentTitle;
//                }, "Wait for the title to change", 1000);
//
//                runs(function () {
//                    expect(document.title).toBe("MOCK_SITE_TITLE");
//                });
//            });
//
//            it('when homePage=false, pageTitleSEO=MOCK_PAGE_TITLE, siteTitle=MOCK_SITE_TITLE', function(){
//                this.setPresetsForSetDocumentTitleTests(false, true);
//
//                var oldDocumentTitle = document.title;
//                W.Viewer._setDocumentTitle(0);
//
//                waitsFor(function () {
//                    return document.title !== oldDocumentTitle;
//                }, "Wait for the title to change", 1000);
//
//                runs(function () {
//                    expect(document.title).toBe("MOCK_PAGE_TITLE");
//                });
//            });
//
//            it('when homePage=false, pageTitleSEO=undef, siteTitle=MOCK_SITE_TITLE', function(){
//                this.setPresetsForSetDocumentTitleTests(false, false);
//
//                var oldDocumentTitle = document.title;
//                W.Viewer._setDocumentTitle(0);
//
//                waitsFor(function () {
//                    return document.title !== oldDocumentTitle;
//                }, "Wait for the title to change", 1000);
//
//                runs(function () {
//                    expect(document.title).toBe("MOCK_SITE_TITLE | MOCK_PAGE_NAME");
//                });
//            });
//        });
//    });
//});