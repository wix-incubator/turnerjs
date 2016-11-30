define(['zepto', 'lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils', 'generalUtils'], function ($, _, santa, componentUtils, apiCoverageUtils, generalUtils) {
    'use strict';

    describe("Enable stuff", function () {

        var documentServices;
        var focusedPageRef;
        var document;

        function addCompsToPage() {
            var slideShowDef = componentUtils.getComponentDef(documentServices, "SLIDESHOW", {
                data: {
                    items: [
                        {
                            'type': 'Image',
                            "title": "Water Droplets",
                            "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg",
                            "description": "Describe your image here",
                            "width": 1000,
                            "height": 750,
                            id: "1"
                        },
                        {
                            'type': 'Image',
                            "title": "Budding Tree",
                            "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                            "description": "Describe your image here",
                            "width": 1000,
                            "height": 750,
                            id: "2"
                        },
                        {
                            'type': 'Image',
                            "title": "Fallen Apples",
                            "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg",
                            "description": "Describe your image here",
                            "width": 758,
                            "height": 569,
                            id: "3"
                        }
                    ]
                },
                props: {
                    autoplay: true,
                    galleryImageOnClickAction: "zoomMode",
                    expandEnabled: true
                }
            });

            var customId = "My-SLIDESHOW-ID";
            documentServices.components.add(focusedPageRef, slideShowDef, customId);

            var facebookLikeDef = componentUtils.getComponentDef(documentServices, "FACEBOOKLIKE");
            customId = "My-FACEBOOKLIKE-ID";
            documentServices.components.add(focusedPageRef, facebookLikeDef, customId);

            var wPhotoDef = componentUtils.getComponentDef(documentServices, "WPHOTO", {
                data: {
                    link: {
                        type: 'ExternalLink',
                        target: "_self",
                        url: "http://www.wix.com"
                    }
                },
                props: {}
            });
            customId = "My-wphotoDef-ID";
            documentServices.components.add(focusedPageRef, wPhotoDef, customId);
        }

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                document = harness.window.document;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing Enable stuff spec');
                done();
            });
        });

        beforeEach(function(done){
            addCompsToPage();
            documentServices.waitForChangesApplied(done);
        });

        afterEach(function(done){
            generalUtils.cleanPage(documentServices, focusedPageRef);
            documentServices.waitForChangesApplied(done);
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.documentMode.enablePlaying');
            apiCoverageUtils.checkFunctionAsTested('documentServices.documentMode.enableSocialInteraction');
            apiCoverageUtils.checkFunctionAsTested('documentServices.documentMode.enableSlideShowGalleryClick');
        });

        describe("enablePlaying", function () {
            it("enablePlaying - if set to false site data isPlayingAllowed is set to false-> gallery auto play should stop", function (done) {
                var galleryNode = document.getElementById('My-SLIDESHOW-ID');
                var isAutoPlayCurrentlyOn = _.includes(galleryNode.getAttribute('data-state'), 'autoplayOn');
                expect(isAutoPlayCurrentlyOn).toEqual(true);
                documentServices.documentMode.enablePlaying(false);
                documentServices.waitForChangesApplied(function () {
                    isAutoPlayCurrentlyOn = _.includes(galleryNode.getAttribute('data-state'), 'autoplayOn');
                    expect(isAutoPlayCurrentlyOn).toEqual(false);
                }, true);

                documentServices.documentMode.enablePlaying(true);
                documentServices.waitForChangesApplied(function () {
                    isAutoPlayCurrentlyOn = _.includes(galleryNode.getAttribute('data-state'), 'autoplayOn');
                    expect(isAutoPlayCurrentlyOn).toEqual(true);
                    done();
                });
            });

            describe("enableSocialInteraction", function () {
                it("enableSocialInteraction -  if set to false site data isSocialInteractionAllowed  is set to false-> social comps like facebook like will have block layer and can't be clicked", function (done) {
                    var facebookLike = document.getElementById('My-FACEBOOKLIKE-ID');
                    var isBlockerDivExist = _.find(facebookLike.children, function (domItem) {
                            return domItem.getAttribute('class') === 'blockLayer';
                        }) !== undefined;
                    expect(isBlockerDivExist).toEqual(false);
                    documentServices.documentMode.enableSocialInteraction(false);
                    documentServices.waitForChangesApplied(function () {
                        isBlockerDivExist = _.find(facebookLike.children, function (domItem) {
                                return domItem.getAttribute('class') === 'blockLayer';
                            }) !== undefined;
                        expect(isBlockerDivExist).toEqual(true);
                        done();
                    });
                });
            });

            xdescribe("enableExternalNavigation", function () {
                it("enableExternalNavigation -  if set to false site data isExternalNavigationAllowed  is set to false-> external links target to self will not work", function (done) {
                    var imageWithExternalUrl = document.getElementById('My-wphotoDef-ID');
                    var link = $(imageWithExternalUrl).find('a')[0];
                    var currentUrl = window.location.href;
                    documentServices.documentMode.enableExternalNavigation(false);
                    documentServices.waitForChangesApplied(function () {
                        link.click();
                        expect(window.location.href).toEqual(currentUrl);
                        done();
                    });
                });
            });

            describe("enableSlideShowGalleryClick", function () {
                it("enableSlideShowGalleryClick - if set to false site data isSlideShowGalleryClickAllowed  is set to false-> slideShowGallery should have block layer on click", function (done) {
                    documentServices.documentMode.enableSlideShowGalleryClick(false);
                    var galleryNode = document.getElementById('My-SLIDESHOW-ID');
                    documentServices.waitForChangesApplied(function () {
                        var isBlockerDivExist = _.find(galleryNode.children, function (domItem) {
                            return domItem.getAttribute('class') === 'slideShowClickBlocker';
                        });
                        expect(isBlockerDivExist).toBeDefined();
                    }, true);

                    documentServices.documentMode.enableSlideShowGalleryClick(true);

                    documentServices.waitForChangesApplied(function () {
                        var isBlockerDivExist = _.find(galleryNode.children, function (domItem) {
                            return domItem.getAttribute('class') === 'slideShowClickBlocker';
                        });
                        expect(isBlockerDivExist).toBeUndefined();
                        done();
                    });
                });
            });
        });
    });
});
