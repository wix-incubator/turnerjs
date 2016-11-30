define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {
    'use strict';

    describe('Document Services - Page Background', function () {

        var documentServices;

        function omitDeep(obj, prop) {
            var r = _.omit(obj, prop);
            _.forEach(r, function (val, key) {
                if (typeof (val) === "object") {
                    r[key] = omitDeep(val, prop);
                }
            });

            return r;
        }

        function createBgData(type) {
            var bgData = {
                image: {
                    "isPreset": true,
                    "custom": true,
                    "ref": {
                        "type": "BackgroundMedia",
                        "mediaRef": {
                            "type": "Image",
                            "title": "Bananas",
                            "uri": "8034aa3291a54c489a7b7a3121d994f9.png",
                            "description": "public/6d05b962-a2eb-42f1-afe4-7981bca4bff1/ea934aee-5729-4c5e-aed1-ac25f5489914",
                            "width": 1177,
                            "height": 1200
                        },
                        "color": "#8BD0CD",
                        "alignType": "top_left",
                        "fittingType": "legacy_tile",
                        "scrollType": "scroll",
                        "colorOverlay": "",
                        "colorOverlayOpacity": 0,
                        "imageOverlay": ""
                    }
                },
                video: {
                    "isPreset": true,
                    "custom": true,
                    "ref": {
                        "type": "BackgroundMedia",
                        "mediaRef": {
                            "type": "WixVideo",
                            "title": "Electric Darkness",
                            "videoId": "video/11062b_6a134fc09ea34833a17d295e295ab517",
                            "qualities": [
                                {
                                    "quality": "480p",
                                    "width": 854,
                                    "height": 480,
                                    "formats": [
                                        "mp4",
                                        "webm"
                                    ]
                                },
                                {
                                    "quality": "720p",
                                    "width": 1280,
                                    "height": 720,
                                    "formats": [
                                        "mp4",
                                        "webm"
                                    ]
                                },
                                {
                                    "quality": "1080p",
                                    "width": 1920,
                                    "height": 1080,
                                    "formats": [
                                        "mp4",
                                        "webm"
                                    ]
                                }
                            ],
                            "posterImageRef": {
                                "type": "Image",
                                "title": "",
                                "uri": "/11062b_6a134fc09ea34833a17d295e295ab517f000.jpg",
                                "description": "public/8e256233-1752-4026-9341-54036e7f875e/3892dca7-115f-4b62-ba8d-11a7b220ab76",
                                "width": 1920,
                                "height": 1080
                            },
                            "opacity": 1,
                            "duration": 6,
                            "loop": true,
                            "autoplay": true,
                            "preload": "auto",
                            "mute": true
                        },
                        "color": "{color_24}",
                        "alignType": "center",
                        "fittingType": "fill",
                        "scrollType": "fixed",
                        "imageOverlay": {
                            "type": "Image",
                            "title": "",
                            "uri": "0da768_880a3209e3744cd0a96b66835a01b8c5.png",
                            "width": 256,
                            "height": 256
                        },
                        "colorOverlay": "#0AFCFC",
                        "colorOverlayOpacity": 0.2
                    }
                }
            };
            return bgData[type];
        }

        beforeAll(function (done) {
            var siteParameter = {};

            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing pages background spec');
                done();
            });
        });

        describe('update', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.update');
            });

            //todo: check why .getDataByQuery(pageId, masterPage) works while .getDataByQuery(pageId, pageId) fails
            xit('should update the page background with WixVideo medias', function (done) {
                var pageId = documentServices.pages.getFocusedPageId();
                var bgData = createBgData('video');
                documentServices.pages.background.update(pageId, bgData, 'desktop');

                documentServices.waitForChangesApplied(function () {

                    var newData = documentServices.pages.background.get(pageId, 'desktop');
                    expect(newData.ref.mediaRef.videoId).toEqual(bgData.ref.mediaRef.videoId);
                    done();
                });
            });

            it('should update the page background with Image media', function (done) {
                var pageId = documentServices.pages.getFocusedPageId();
                var bgData = createBgData('image');
                documentServices.pages.background.update(pageId, bgData, 'desktop');

                documentServices.waitForChangesApplied(function () {

                    var newData = documentServices.pages.background.get(pageId, 'desktop');
                    newData = omitDeep(newData, 'id');
                    newData = omitDeep(newData, 'metaData');
                    newData = omitDeep(newData, 'alt');
                    newData = omitDeep(newData, 'originalImageDataRef');
                    expect(newData).toEqual(bgData);
                    done();
                });
            });

            it('should not update the page background if data doesnt pass validity', function (done) {
                errorUtils.waitForError(documentServices, done, '[{"message":"should be number","dataPath":".colorOverlayOpacity","keyword":"type","schemaPath":"#/properties/colorOverlayOpacity/type"}]');
                var pageId = documentServices.pages.getFocusedPageId();
                var bgData = createBgData('image');
                bgData.ref.colorOverlayOpacity = 'string value';
                documentServices.pages.background.update(pageId, bgData, 'desktop');
            });

            // todo: how do we test that ? page background api updates the data to null or empty object , but layout breaks.
            //should we fix siteBackgroundLayout to check existence ?
            xit('should allow update background with empty/null/undefined', function (done) {
                errorUtils.waitForError(documentServices, done);
                var pageId = documentServices.pages.getFocusedPageId();
                var bgData = {}; // or null / undefined
                documentServices.pages.background.update(pageId, bgData, 'desktop');
                documentServices.waitForChangesApplied(function () {
                    console.log('background updated');
                });

            });


        });

        describe('get', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.get');
            });

            it('should get the page background', function (done) {
                var newPageTitle = 'newPageTitle';

                var newPagePointer = documentServices.pages.add(newPageTitle);

                documentServices.waitForChangesApplied(function () {
                    var mobileBackground = documentServices.pages.background.get(newPagePointer.id, 'mobile');
                    var desktopBackground = documentServices.pages.background.get(newPagePointer.id, 'desktop');
                    expect(mobileBackground).toBeDefined();
                    expect(desktopBackground).toBeDefined();
                    expect(mobileBackground.ref.color).toBeDefined();
                    expect(mobileBackground.ref.color).toBeDefined();
                    done();
                });
            });

            it('should throw an error when trying to get background data without specifying a known device', function () {
                var pageId = documentServices.pages.getFocusedPageId();
                expect(function () {
                    documentServices.pages.background.get(pageId, 'unknown device');
                }).toThrowError('unknown device for background');


            });

        });


        //todo: implament video api testing
        //describe('video', function() {
        //
        //
        //    //    video: {
        //    //        isPlaying: videoBackground.isPlaying,
        //    //        getReadyState: videoBackground.getReadyState,
        //    //        play: videoBackground.playCurrent,
        //    //        pause: videoBackground.pauseCurrent,
        //    //        unregisterToPlayingChange: videoBackground.unregisterToPlayingChange,
        //    //        registerToPlayingChange: videoBackground.registerToPlayingChange
        //    //    }
        //    //},
        //
        //
        //    afterAll(function() {
        //        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.video.play');
        //        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.video.pause');
        //        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.video.isPlaying');
        //        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.video.getReadyState');
        //        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.background.video.registerToPlayingChange');
        //    });
        //
        //    it('should play and notify the registrar', function(done) {
        //        var newPageTitle = 'newPageTitle';
        //        var newPagePointer = documentServices.pages.add(newPageTitle);
        //        var bgData = getBgData();
        //        documentServices.pages.background.update(newPagePointer.id, bgData);
        //
        //        var playStatusChanged = jasmine.createSpy('play status changed');
        //
        //        documentServices.waitForChangesApplied(function() {
        //
        //            documentServices.pages.background.registerToPlayingChange(playStatusChanged);
        //            documentServices.pages.background.video.play();
        //            expect(newData).toEqual(bgData);
        //            done();
        //        });
        //
        //    });
        //
        //    it('should pause and notify the registrar', function(done) {
        //        var pageIdBeforeNavigation = documentServices.pages.getFocusedPageId();
        //
        //        documentServices.pages.navigateTo('someNonExistingPageId');
        //
        //        documentServices.waitForChangesApplied(function() {
        //            var pageIdAfterNavigation = documentServices.pages.getFocusedPageId();
        //            expect(pageIdAfterNavigation).toEqual(pageIdBeforeNavigation);
        //            done();
        //        });
        //    });
        //});

    });

});
