//define([
//    'lodash',
//    'santa-harness',
//    'apiCoverageUtils',
//    'componentUtils'
//], function (_,
//             santa,
//             apiCoverageUtils,
//             componentUtils) {
//    'use strict';
//
//    xdescribe('navigate and delete tpa section', function(){
//        var documentServices;
//        var siteDocument;
//
//        beforeAll(function (done) {
//            santa.start({site: 'tpa-pages'})
//                .then(function (harness) {
//                    documentServices = harness.documentServices;
//                    siteDocument = harness.window.document;
//                    done();
//                });
//        });
//
//
//        function validateNavigation(navigatedPageRef, done){
//            documentServices.waitForChangesApplied(function(){
//                var focusedPageId = documentServices.pages.getFocusedPageId();
//                expect(focusedPageId).toBe(navigatedPageRef.id);
//                expect(componentUtils.getComponentDomNode(siteDocument, focusedPageId)).toBeDefined();
//            });
//            var compDef = componentUtils.getComponentDef(documentServices, 'CONTAINER');
//            var compRef = documentServices.components.add(navigatedPageRef, compDef);
//
//            documentServices.waitForChangesApplied(function(){
//                expect(componentUtils.getComponentDomNode(siteDocument, compRef.id)).toBeDefined();
//                done();
//            });
//        }
//
//        function validateDeletion(pageId){
//            var pageToDeleteRef = documentServices.pages.getReference(pageId);
//            expect(documentServices.components.is.exist(pageToDeleteRef)).toBe(false);
//            expect(componentUtils.getComponentDomNode(siteDocument, pageId)).toBeNull();
//        }
//
//        function runTestsForPageDeletion(){
//            beforeEach(function(){
//                this.pageToRemoveId = '';
//                this.deleteFunction = _.noop;
//            });
//            it('should navigate then delete the page, call delete in navigate callback', function(done){
//                var homePageId = documentServices.homePage.get();
//                documentServices.pages.navigateTo(homePageId);
//
//                documentServices.pages.navigateTo(homePageId, function(){
//                    this.deleteFunction(this.pageToRemoveId);
//
//                    documentServices.waitForChangesApplied(function(){
//                        validateDeletion(this.pageToRemoveId);
//                        validateNavigation(homePageId, done);
//                    }.bind(this));
//                }.bind(this));
//            });
//
//            it('should navigate then delete the page, call delete right after navigate', function(done){
//                var homePageId = documentServices.homePage.get();
//                documentServices.pages.navigateTo(homePageId);
//
//                this.deleteFunction(this.pageToRemoveId);
//
//                documentServices.waitForChangesApplied(function(){
//                    validateDeletion(this.pageToRemoveId);
//                    validateNavigation(homePageId, done);
//                }.bind(this));
//            });
//
//            it('should navigate then delete the page, call delete in wait for changes', function(done){
//                var homePageId = documentServices.homePage.get();
//                documentServices.pages.navigateTo(homePageId);
//
//                documentServices.waitForChangesApplied(function(){
//                    this.deleteFunction(this.pageToRemoveId);
//
//                    documentServices.waitForChangesApplied(function(){
//                        validateDeletion(this.pageToRemoveId);
//                        validateNavigation(homePageId, done);
//                    }.bind(this));
//                }.bind(this));
//            });
//        }
//    });
//});