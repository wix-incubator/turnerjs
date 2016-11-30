define([
   'lodash',
   'santa-harness',
   'apiCoverageUtils',
   'componentUtils'
], function (_,
             santa,
             apiCoverageUtils,
             componentUtils) {
   'use strict';

   //navigateToPageAndScrollToAnchor
   describe('navigateTo', function(){
      var documentServices;
      var siteDocument;
      //don't ever do that!!!
      var __rendered;

      beforeAll(function(done) {
         var siteParameter = {
            site: 'page-navigation'
         };

         santa.start(siteParameter).then(function (harness) {
            documentServices = harness.documentServices;
            siteDocument = harness.window.document;
            __rendered = harness.window.rendered;
            done();
         });
      });

      afterAll(function() {
         apiCoverageUtils.checkFunctionAsTested('documentServices.pages.navigateTo');
      });

      function getCompDom(compId){
         return componentUtils.getComponentDomNode(siteDocument, compId);
      }

      function validateNavigation(navigatedPageRef, done){
         documentServices.waitForChangesApplied(function(){
            var focusedPageId = documentServices.pages.getFocusedPageId();
            expect(focusedPageId).toBe(navigatedPageRef.id);
            expect(getCompDom(focusedPageId)).toBeDefined();
         });
         var compDef = componentUtils.getComponentDef(documentServices, 'CONTAINER');
         var compRef = documentServices.components.add(navigatedPageRef, compDef);

         documentServices.waitForChangesApplied(function(){
            expect(getCompDom(compRef.id)).toBeDefined();
            done();
         });
      }

      describe('simple functionality tests', function(){
         var otherPage = 'i49k6';
         beforeEach(function(done){
            documentServices.pages.transitions.set('none');
            documentServices.waitForChangesApplied(done);
         });

         it('should navigate to existing page', function(done){
            expect(documentServices.pages.getFocusedPageId()).not.toBe(otherPage);

            var pageRef = documentServices.pages.getReference(otherPage);
            documentServices.pages.navigateTo(otherPage);

            validateNavigation(pageRef, done);
         });

         it('should navigate to just added page', function(done) {
            var newPagePointer = documentServices.pages.add('newPageTitle');

            documentServices.pages.navigateTo(newPagePointer.id);

            validateNavigation(newPagePointer, done);
         });

         it('should not navigate to non existing page', function(done) {
            var pageIdBeforeNavigation = documentServices.pages.getFocusedPageId();

            documentServices.pages.navigateTo('someNonExistingPageId');

            documentServices.waitForChangesApplied(function() {
               var pageIdAfterNavigation = documentServices.pages.getFocusedPageId();
               expect(pageIdAfterNavigation).toEqual(pageIdBeforeNavigation);
               done();
            });
         });

         it('should return after navigating to same page', function(done){
            var pageIdBeforeNavigation = documentServices.pages.getFocusedPageId();

            documentServices.pages.navigateTo(pageIdBeforeNavigation);
            documentServices.waitForChangesApplied(function() {
               expect(documentServices.pages.getFocusedPageId()).toBe(pageIdBeforeNavigation);
               done();
            });
         });

         it('should navigate if no transition', function(done){
            var newPagePointer = documentServices.pages.add('newPageTitle');

            documentServices.pages.navigateTo(newPagePointer.id);

            validateNavigation(newPagePointer, done);
         });

         it('should navigate with transition', function(done){
            documentServices.pages.transitions.set('crossfade');

            //just to be sure..
            documentServices.waitForChangesApplied(function(){
               var newPagePointer = documentServices.pages.add('newPageTitle');

               documentServices.pages.navigateTo(newPagePointer.id);

               validateNavigation(newPagePointer, done);
            });
         });

         it('should navigate with transition if site was rendered before the navigation started', function(done){
            documentServices.pages.transitions.set('crossfade');
            var newPagePointer = documentServices.pages.add('newPageTitle');

            //we need the wait here, because the scenario is when the site is rendered after the operation is added to batch but before it is ran
            documentServices.waitForChangesApplied(function(){
               documentServices.pages.navigateTo(newPagePointer.id);
               __rendered.forceUpdate();

               validateNavigation(newPagePointer, done);
            });
         });
      });

      describe('navigate to page that needs to load data', function(){
         var popupData = {
            "type": "Page",
            "id": "g13tp",
            "mobileComponents": [],
            "skin": "skins.core.InlineSkin",
            "layout": {
               "width": 1440,
               "height": 506,
               "x": 0,
               "y": 0,
               "scale": 1,
               "rotationInDegrees": 0,
               "anchors": [],
               "fixedPosition": false
            },
            "componentType": "mobile.core.components.Page",
            "components": [
               {
                  "type": "Container",
                  "id": "comp-ili7dwo2",
                  "skin": "wysiwyg.viewer.skins.stripContainer.DefaultStripContainer",
                  "layout": {
                     "width": 600,
                     "height": 352,
                     "x": 190,
                     "y": 154,
                     "scale": 1,
                     "rotationInDegrees": 0,
                     "anchors": [],
                     "fixedPosition": false
                  },
                  "componentType": "wysiwyg.viewer.components.PopupContainer",
                  "components": [
                     {
                        "type": "Component",
                        "id": "comp-ili7v3pf",
                        /*"skin": "svgshape.v2.Svg_9a8686831e874878a55a90925c0feb6c",*/
                        "layout": {
                           "width": 17,
                           "height": 18,
                           "x": 567,
                           "y": 26,
                           "scale": 1,
                           "rotationInDegrees": 0,
                           "anchors": [],
                           "fixedPosition": false
                        },
                        "componentType": "wysiwyg.viewer.components.PopupCloseIconButton",
                        "data": {
                           "type": "SvgShape",
                           "metaData": {
                              "isPreset": false,
                              "schemaVersion": "1.0",
                              "isHidden": false
                           },
                           "id": "#dataItem-ili7v3pk"
                        },
                        "props": {
                           "type": "SvgShapeProperties",
                           "metaData": {
                              "schemaVersion": "1.0"
                           },
                           "maintainAspectRatio": true,
                           "id": "propItem-ili7v3pl"
                        },
                        "style": {
                           "type": "TopLevelStyle",
                           "metaData": {
                              "isPreset": false,
                              "schemaVersion": "1.0",
                              "isHidden": false
                           },
                           "style": {
                              "properties": {
                                 "alpha-fillcolor": "1",
                                 "alpha-stroke": "1",
                                 "fillcolor": "#2F2E2E",
                                 "stroke": "#ED1566",
                                 "strokewidth": "0px"
                              },
                              "propertiesSource": {
                                 "fillcolor": "value",
                                 "stroke": "value",
                                 "strokewidth": "value"
                              },
                              "groups": {}
                           },
                           "componentClassName": "wysiwyg.viewer.components.PopupCloseIconButton",
                           "pageId": "",
                           "compId": "",
                           "styleType": "custom",
                           "skin": "svgshape.v2.Svg_9a8686831e874878a55a90925c0feb6c",
                           "id": "style-ili7v3pm"
                        }
                     }
                  ],
                  "props": {
                     "type": "PopupContainerProperties",
                     "metaData": {
                        "schemaVersion": "1.0"
                     },
                     "horizontalAlignment": "center",
                     "verticalAlignment": "center",
                     "alignmentType": "nineGrid",
                     "horizontalOffset": 0,
                     "verticalOffset": 0,
                     "id": "propItem-ili7dwo3"
                  },
                  "style": {
                     "type": "TopLevelStyle",
                     "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                     },
                     "style": {
                        "properties": {
                           "alpha-bg": "1",
                           "bg": "rgba(255,255,255,1)"
                        },
                        "propertiesSource": {
                           "alpha-bg": "value",
                           "bg": "value"
                        },
                        "groups": {}
                     },
                     "componentClassName": "wysiwyg.viewer.components.PopupContainer",
                     "pageId": "",
                     "compId": "",
                     "styleType": "custom",
                     "skin": "wysiwyg.viewer.skins.stripContainer.DefaultStripContainer",
                     "id": "style-ili7m0pe"
                  },
                  "design": {
                     "type": "MediaContainerDesignData",
                     "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                     },
                     "background": {
                        "type": "BackgroundMedia",
                        "metaData": {
                           "isPreset": false,
                           "schemaVersion": "1.0",
                           "isHidden": false
                        },
                        "color": "#FFFFFE",
                        "colorOpacity": 1,
                        "alignType": "center",
                        "fittingType": "fill",
                        "scrollType": "none",
                        "colorOverlay": "",
                        "colorOverlayOpacity": 0
                     },
                     "id": "#dataItem-ili7dwo4"
                  }
               }
            ],
            "data": {
               "type": "Page",
               "metaData": {
                  "isPreset": false,
                  "schemaVersion": "1.0",
                  "isHidden": false
               },
               "title": "Welcome Popup",
               "hideTitle": true,
               "icon": "",
               "descriptionSEO": "",
               "metaKeywordsSEO": "",
               "pageTitleSEO": "",
               "pageUriSEO": "",
               "hidePage": false,
               "underConstruction": false,
               "tpaApplicationId": 0,
               "pageSecurity": {
                  "requireLogin": false,
                  "passwordDigest": "",
                  "dialogLanguage": ""
               },
               "isPopup": true,
               "indexable": true,
               "isLandingPage": false,
               "pageBackgrounds": {
                  "desktop": {
                     "custom": true,
                     "ref": {
                        "type": "BackgroundMedia",
                        "color": "{color_11}",
                        "alignType": "top",
                        "fittingType": "fill",
                        "scrollType": "fixed"
                     },
                     "isPreset": false
                  },
                  "mobile": {
                     "custom": true,
                     "ref": {
                        "type": "BackgroundMedia",
                        "color": "{color_11}",
                        "alignType": "top",
                        "fittingType": "fill",
                        "scrollType": "fixed"
                     },
                     "isPreset": true
                  }
               }
            },
            "props": {
               "type": "PageProperties",
               "metaData": {
                  "schemaVersion": "1.0"
               },
               "mobile": {
                  "popup": {
                     "closeOnOverlayClick": true
                  }
               },
               "desktop": {
                  "popup": {
                     "closeOnOverlayClick": true
                  }
               },
               "id": "g13tp"
            },
            "style": "p1"
         };

         describe('navigateTo', function () {
            var pageWithSvg = 'w508z';
            it('should navigate to REGULAR page with svg inside', function (done) {
               var pageRef = documentServices.pages.getReference(pageWithSvg);
               documentServices.pages.navigateTo(pageWithSvg);

               validateNavigation(pageRef, done);
            });

            it('should navigate to popup page', function (done) {

               var pageIdBeforeNavigation = documentServices.pages.getFocusedPageId();
               var newPagePointer = documentServices.pages.popupPages.add('newPopupTitle', popupData);

               documentServices.pages.navigateTo(newPagePointer.id);

               documentServices.waitForChangesApplied(function () {
                  var pageIdAfterNavigation = documentServices.pages.getFocusedPageId();
                  expect(pageIdBeforeNavigation).not.toEqual(newPagePointer.id);
                  expect(pageIdAfterNavigation).toEqual(newPagePointer.id);
                  done();
               });
            });
         });
      });

      describe('navigate and delete', function(){
         beforeEach(function(done){
            this.pageToRemove = documentServices.pages.add('newPageTitle');

            documentServices.pages.navigateTo(this.pageToRemove.id);
            documentServices.waitForChangesApplied(done);
         });

         it('should navigate then delete the page, call delete right after navigate', function(done){
            var homePageId = documentServices.homePage.get();
            documentServices.pages.navigateTo(homePageId);
            var pageToRemoveId = this.pageToRemove.id;
            documentServices.pages.remove(pageToRemoveId);

            documentServices.waitForChangesApplied(function(){
               expect(documentServices.pages.getFocusedPageId()).toBe(homePageId);
               expect(documentServices.components.is.exist(this.pageToRemove)).toBe(false);
               expect(getCompDom(pageToRemoveId)).toBeNull();
               done();
            }.bind(this));
         });

         it('should navigate then delete the page, call delete in wait for changes', function(done){
            var homePageId = documentServices.homePage.get();
            documentServices.pages.navigateTo(homePageId);
            var pageToRemoveId = this.pageToRemove.id;

            documentServices.waitForChangesApplied(function(){
               documentServices.pages.remove(pageToRemoveId);

               documentServices.waitForChangesApplied(function(){
                  expect(documentServices.pages.getFocusedPageId()).toBe(homePageId);
                  expect(documentServices.components.is.exist(this.pageToRemove)).toBe(false);
                  expect(getCompDom(pageToRemoveId)).toBeNull();
                  done();
               }.bind(this));
            }.bind(this));
         });
      });
   });
});
