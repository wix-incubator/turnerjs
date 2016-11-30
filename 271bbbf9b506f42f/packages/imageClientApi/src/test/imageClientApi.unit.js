define([
    'imageClientApi/helpers/utils',
    'imageClientApi',
    'imageClientApi/helpers/imageServiceUtils',
    'imageClientApi/helpers/imageServiceFeatureSupportObject',
    'imageClientApi/helpers/imageServiceConstants'
], function (utils, imageClientApi, imageServiceUtils, globalFeatureSupportObject, constants) {
    'use strict';

    describe('imageClientApi', function () {

        //Rembrandt URL Template
        var urlTemplate = utils.template("${imageUri}/${apiVersion}/${scaleMethod}/w_${width},h_${height}${alignment}${upscale},q_${quality}${usm}/${imageUri}");
        var cropTemplate = utils.template("${imageUri}/${apiVersion}/${scaleMethod}/x_${x},y_${y},w_${width},h_${height},q_${quality}${usm}/${imageUri}");


        function getExpectedUrlString(initialOptions, overrideOptions) {
            return urlTemplate(utils.assign(initialOptions, overrideOptions));
        }

        function getCropUrlString(initialOptions, overrideOptions) {
            return cropTemplate(utils.assign(initialOptions, overrideOptions));
        }

        beforeEach(function () {
            //Rembrandt
            this.urlOptions = {
                imageUri: 'image.jpg',
                apiVersion: 'v1',
                scaleMethod: '',
                width: 1,
                height: 1,
                quality: '80',
                alignment: ',al_c',
                upscale: '',
                usm: ',usm_0.66_1.00_0.01',
                imageExtension: 'jpg'
            };

            this.src = {id: 'image.jpg', width: NaN, height: NaN};
            this.target = {width: NaN, height: NaN, alignment: '', htmlTag: ''};

            this.siteData = {
                browser: {},
                currentUrl: {
                    query: {}
                }
            };

            this.spyObjectFitSupport = spyOn(imageServiceUtils, 'isObjectFitBrowserSupport').and.returnValue(true);

        });

        describe('getData Rembrandt', function () {

            it('should return src id as uri if src extension isn\'t supported', function (){
                utils.assign(this.src, {id: 'noExtension', width: 854, height: 480});
                utils.assign(this.target, {alignment: imageClientApi.alignTypes.CENTER, width: 320, height: 240});
                var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                expect(imageData.uri).toBe('noExtension');
            });




            // fitting: SCALE_TO_FILL , alignment:  CENTER , image is bigger from container
            it('should return image url with the target dimension', function () {
                utils.assign(this.src, {width: 854, height: 480});
                utils.assign(this.target, {alignment: imageClientApi.alignTypes.CENTER, width: 320, height: 240});
                //var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fill');
                var expectedUrl = getExpectedUrlString(this.urlOptions, {
                    width: 320,
                    height: 240,
                    scaleMethod: 'fill'
                });
                var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                expect(imageData.uri).toBe(expectedUrl);

            });

            // fitting: SCALE_TO_FILL , alignment:  TOP,BOTTOM or LEFT,RIGHT , image is bigger from container
            it('should return image url with a size that can be aligned in target container', function () {
                utils.assign(this.src, {width: 854, height: 480});
                utils.assign(this.target, {alignment: imageClientApi.alignTypes.LEFT, width: 320, height: 240});
                //var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fill');

                var expectedUrl = getExpectedUrlString(this.urlOptions, {
                    width: 320,
                    height: 240,
                    scaleMethod: 'fill',
                    alignment: ',al_l'
                });
                var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                expect(imageData.uri).toBe(expectedUrl);
            });
            describe('fitting: SCALE_TO_FILL', function () {
                it('should return image url with operation enlargement when image is smaller from container. alignment:  CENTER , image is smaller from container', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.CENTER, width: 854, height: 480});
                    var preferredScaleFactor = imageServiceUtils.getPreferredUpscaleFactor(this.src.width, this.src.height);
                    var scaleFactor = imageServiceUtils.getScaleFactor(this.src.width, this.src.height, this.target.width, this.target.height, 'fill');
                    var scaledWidth = Math.round(this.target.width * (preferredScaleFactor / scaleFactor));
                    var scaledHeight = Math.round(this.target.height * (preferredScaleFactor / scaleFactor));
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: scaledWidth,
                        height: scaledHeight,
                        scaleMethod: 'fill',
                        alignment: ',al_c',
                        upscale: ',lg_1',
                        usm: ''
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });
                it('should return image url with a calced target dimension. alignment:  TOP,BOTTOM or LEFT,RIGHT , image is smaller from container', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 854, height: 480});
                    var preferredScaleFactor = imageServiceUtils.getPreferredUpscaleFactor(this.src.width, this.src.height);
                    var scaleFactor = imageServiceUtils.getScaleFactor(this.src.width, this.src.height, this.target.width, this.target.height, 'fill');
                    var scaledWidth = Math.round(this.target.width * (preferredScaleFactor / scaleFactor));
                    var scaledHeight = Math.round(this.target.height * (preferredScaleFactor / scaleFactor));
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: scaledWidth,
                        height: scaledHeight,
                        scaleMethod: 'fill',
                        alignment: ',al_t',
                        upscale: ',lg_1',
                        usm: ''
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);

                });
            });

            describe('fitting: SCALE_TO_FIT', function () {
                it('should return image url with the source dimension. alignment:  any , image is smaller from container', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 854, height: 480});
                    var preferredScaleFactor = imageServiceUtils.getPreferredUpscaleFactor(this.src.width, this.src.height);
                    //var scaleFactor = imageServiceUtils.getScaleFactor(this.src.width, this.src.height, this.target.width, this.target.height, 'fill');
                    var scaledWidth = Math.round(this.src.width * preferredScaleFactor);
                    var scaledHeight = Math.round(this.src.height * preferredScaleFactor);
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: scaledWidth,
                        height: scaledHeight,
                        scaleMethod: 'fill',
                        upscale: ',lg_1',
                        usm: ''
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should return image url with the calculated dimension. alignment:  any , image is bigger from container', function () {
                    utils.assign(this.src, {width: 854, height: 480});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fit');
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: Math.round(854 * scaleFactor),
                        height: Math.round(480 * scaleFactor),
                        scaleMethod: 'fill'

                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });
            });

            describe('fitting: STRETCH', function () {
                it('should return image url with proportional image dimension. alignment:  any , image is bigger from container', function () {
                    utils.assign(this.src, {width: 854, height: 480});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    var wScale = this.target.width / this.src.width;
                    var hScale = this.target.height / this.src.height;
                    var scale = Math.max(wScale, hScale);
                    var scaledWidth = Math.round(this.src.width * scale);
                    var scaledHeight = Math.round(this.src.height * scale);
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: scaledWidth,
                        height: scaledHeight,
                        scaleMethod: 'fill'
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.STRETCH, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should return image url with a calced dimension. alignment:  any , image is smaller from container', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 854, height: 480});
                    var preferredScaleFactor = imageServiceUtils.getPreferredUpscaleFactor(this.src.width, this.src.height);
                    var scaleFactor = imageServiceUtils.getScaleFactor(this.src.width, this.src.height, this.target.width, this.target.height, 'fill');
                    this.target.width = this.src.width * scaleFactor;
                    this.target.height = this.src.height * scaleFactor;
                    var scaledWidth = Math.round(this.target.width * (preferredScaleFactor / scaleFactor));
                    var scaledHeight = Math.round(this.target.height * (preferredScaleFactor / scaleFactor));
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: scaledWidth,
                        height: scaledHeight,
                        scaleMethod: 'fill',
                        upscale: ',lg_1',
                        usm: ''
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.STRETCH, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should return image url with the image source dimension. alignment:  any , image resolution is equal to  container', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});

                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: 320,
                        height: 240,
                        scaleMethod: 'fill',
                        usm: ''
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.STRETCH, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });
            });

            describe('fitting: ORIGINAL_SIZE', function () {
                it('should return image url with the image source dimension', function () {
                    utils.assign(this.src, {width: 320, height: 240});

                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 854, height: 480});
                    var expectedUrl = getCropUrlString(this.urlOptions, {
                        width: 320,
                        height: 240,
                        scaleMethod: 'crop',
                        x: 0,
                        y: 0,
                        usm: ''

                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });


                it('should return an IMG tag css by default', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP};
                    var imageFilters = {quality: 65, unsharpMask: {radius: 0.49, amount: 1.11, threshold: 0.02}};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target, imageFilters);
                    expect(imageData.css.img).toBeTruthy();
                });

                it('should return an background css when htmlTag is set to bg', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP, htmlTag: 'bg'};
                    var imageFilters = {quality: 65, unsharpMask: {radius: 0.49, amount: 1.11, threshold: 0.02}};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target, imageFilters);
                    expect(imageData.css.img).toBeFalsy();
                    expect(imageData.css.container).toBeTruthy();
                });

                it('should return an IMG tag css with zero left positioning when src img is shorter and wider than the container and aligned top or bottom', function () {
                    utils.assign(this.src, {width: 1000, height: 100});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.left).toBe(0);
                    this.target.alignment = imageClientApi.alignTypes.BOTTOM;
                    imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.left).toBe(0);

                });

                it('should return an IMG tag css with zero top positioning when src img is narrower and taller than the container and aligned right or left', function () {
                    utils.assign(this.src, {width: 100, height: 1000});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.LEFT, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.top).toBe(0);
                    this.target.alignment = imageClientApi.alignTypes.RIGHT;
                    imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.top).toBe(0);
                });


            });


            describe('fitting: legacy display modes', function () {
                it('should return image url for legacy display modes', function () {
                    utils.assign(this.src, {width: 854, height: 480});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fit');
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: Math.round(854 * scaleFactor),
                        height: Math.round(480 * scaleFactor),
                        scaleMethod: 'fill'
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.LEGACY_FULL, this.src, this.target);
                    expect(imageData.uri).toBe(expectedUrl);
                });


            });

            describe('source image with crop object', function () {

                it('should return image url without crop if crop values doesnt overlap source image dimensions', function () {
                    utils.assign(this.src, {width: 854, height: 480, crop: {x: 854, y: 480, width: 10, height: 10}});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    //var scaleFactor = imageServiceUtils.getScaleFactor(10, 10, 320, 240, 'fit');
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.LEGACY_FULL, this.src, this.target);
                    expect(imageData.uri).not.toContain('crop');
                });

                it('should return image url without crop if crop values are identical to image source  dimension', function () {
                    utils.assign(this.src, {width: 854, height: 480, crop: {x: 0, y: 0, width: 854, height: 480}});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    //var scaleFactor = imageServiceUtils.getScaleFactor(10, 10, 320, 240, 'fit');
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.LEGACY_FULL, this.src, this.target);
                    expect(imageData.uri).not.toContain('crop');
                });

                it('should return image url with crop part if crop values are overlapping image source  dimension', function () {
                    utils.assign(this.src, {width: 854, height: 480, crop: {x: 10, y: 10, width: 900, height: 1000}});
                    utils.assign(this.target, {alignment: imageClientApi.alignTypes.TOP, width: 320, height: 240});
                    //var scaleFactor = imageServiceUtils.getScaleFactor(10, 10, 320, 240, 'fit');
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.LEGACY_FULL, this.src, this.target);
                    expect(imageData.uri).toContain('crop');
                });

            });


            describe('image transform filters', function () {

                it('should return a url with custom usm and quality values when they are set in extra params', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP};
                    var imageFilters = {
                        quality: 65,
                        unsharpMask: {radius: 0.49, amount: 1.11, threshold: 0.02}
                    };
                    var expectedUrl = getCropUrlString(this.urlOptions, {
                        width: 320,
                        height: 240,
                        scaleMethod: 'crop',
                        x: 0,
                        y: 0,
                        quality: '65',
                        usm: ',usm_0.49_1.11_0.02'
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target, imageFilters);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should apply custom usm when src/target are with the same dimension', function () {
                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 320, height: 240, alignment: imageClientApi.alignTypes.TOP};
                    var imageFilters = {quality: 65, unsharpMask: {radius: 0.49, amount: 1.11, threshold: 0.02}};
                    var expectedUrl = getCropUrlString(this.urlOptions, {
                        width: 320,
                        height: 240,
                        scaleMethod: 'crop',
                        x: 0,
                        y: 0,
                        quality: '65',
                        usm: ',usm_0.49_1.11_0.02'
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target, imageFilters);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should apply custom usm when target container is smaller from original image', function () {
                    utils.assign(this.src, {width: 854, height: 480});
                    this.target = {width: 320, height: 320, alignment: imageClientApi.alignTypes.TOP};
                    var imageFilters = {quality: 65, unsharpMask: {radius: 0.49, amount: 1.11, threshold: 0.02}};
                    var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fit');
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: Math.round(854 * scaleFactor),
                        height: Math.round(480 * scaleFactor),
                        scaleMethod: 'fill',
                        quality: '65',
                        usm: ',usm_0.49_1.11_0.02'
                    });
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target, imageFilters);
                    expect(imageData.uri).toBe(expectedUrl);
                });

                it('should not apply custom usm when usm values are zero explicitly ', function () {
                    utils.assign(this.src, {width: 854, height: 480});
                    this.target = {width: 320, height: 320, alignment: imageClientApi.alignTypes.TOP};
                    var imageFilters = {quality: 65, unsharpMask: {radius: 0, amount: 0, threshold: 0}};
                    var scaleFactor = imageServiceUtils.getScaleFactor(854, 480, 320, 240, 'fit');
                    var expectedUrl = getExpectedUrlString(this.urlOptions, {
                        width: Math.round(854 * scaleFactor),
                        height: Math.round(480 * scaleFactor),
                        scaleMethod: 'fill',
                        quality: '65',
                        usm: ''
                    });


                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target, imageFilters);
                    expect(imageData.uri).toBe(expectedUrl);
                });
            });

            describe('webpSupport', function () {

                beforeEach(function () {
                    this.spyGetFeature = spyOn(globalFeatureSupportObject, 'getFeature').and.callThrough();
                    this.webpSupportList = [constants.fileType.JPG, constants.fileType.JPEG, constants.fileType.PNG];
                });

                it('should replace the file extension to webp when the file type supports it', function () {
                    this.spyGetFeature.and.returnValue({
                        lossless: true,
                        lossy: true,
                        alpha: true,
                        animation: true
                    });
                    utils.assign(this.src, {width: 320, height: 320});
                    this.target = {width: 320, height: 320, alignment: imageClientApi.alignTypes.CENTER};

                    var imageData;
                    var type;

                    for (var i = 0; i < this.webpSupportList.length; i++) {
                        type = this.webpSupportList[i];
                        this.src.id = 'image.' + type;
                        imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target);
                        expect(imageServiceUtils.getFileExtension(imageData.uri)).toBe('webp');
                    }
                });

                it('should not replace the file extension to webp when the file type does not support it', function () {
                    this.spyGetFeature.and.returnValue({
                        lossless: true,
                        lossy: true,
                        alpha: true,
                        animation: true
                    });
                    utils.assign(this.src, {width: 320, height: 320});
                    this.target = {width: 320, height: 320, alignment: imageClientApi.alignTypes.CENTER};

                    var imageData;
                    var fileTypes = [];
                    var type;

                    //filter the supported filetypes (we should really consider lodash here...))
                    for (type in constants.fileType) {
                        if (constants.fileType.hasOwnProperty(type) && !utils.includes(this.webpSupportList, constants.fileType[type])) {
                            fileTypes.push(constants.fileType[type]);
                        }
                    }

                    for (var i = 0; i < fileTypes.length; i++) {
                        type = fileTypes[i];
                        this.src.id = 'image.' + type;
                        imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target);
                        expect(imageServiceUtils.getFileExtension(imageData.uri)).toBe(type);
                    }
                });

                it('should not replace the file extension to webp when the browser does not supports it', function () {
                    this.spyGetFeature.and.returnValue({
                        lossless: false,
                        lossy: false,
                        alpha: false,
                        animation: false
                    });
                    utils.assign(this.src, {width: 320, height: 320});
                    this.target = {width: 320, height: 320, alignment: imageClientApi.alignTypes.CENTER};

                    var imageData;
                    var type;

                    for (var i = 0; i < this.webpSupportList.length; i++) {
                        type = this.webpSupportList[i];
                        this.src.id = 'image.' + type;
                        imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FIT, this.src, this.target);
                        expect(imageServiceUtils.getFileExtension(imageData.uri)).toBe(type);
                    }
                });

            });


            describe('image tag polyfill css', function () {

                beforeEach(function () {
                    this.spyObjectFitSupport.and.callThrough();
                    this.spyObjectFitSupport.and.returnValue(false);
                });

                it('should return a css with center position alignment', function () {

                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.CENTER, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.top).toBe(Math.round((this.target.height - this.src.height) / 2));
                    expect(imageData.css.img.left).toBe(Math.round((this.target.width - this.src.width) / 2));

                });

                it('should return a css with left position alignment', function () {

                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.LEFT, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.top).toBe(Math.round((this.target.height - this.src.height) / 2));
                    expect(imageData.css.img.left).toBe(0);

                });

                it('should return a css with right position alignment', function () {

                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.RIGHT, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.top).toBe(Math.round((this.target.height - this.src.height) / 2));
                    expect(imageData.css.img.right).toBe(0);

                });

                it('should return a css with top position alignment', function () {

                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.top).toBe(0);
                    expect(imageData.css.img.left).toBe(Math.round((this.target.width - this.src.width) / 2));

                });

                it('should return a css with bottom position alignment', function () {

                    utils.assign(this.src, {width: 320, height: 240});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.BOTTOM, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.bottom).toBe(0);
                    expect(imageData.css.img.left).toBe(Math.round((this.target.width - this.src.width) / 2));

                });

                it('should return a css with center position alignment for unscaled images (e.g. gif)', function () {

                    utils.assign(this.src, {width: 320, height: 240, id: 'http://image.gif'});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.CENTER, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, this.src, this.target);
                    var top = Math.round((this.target.height - imageData.css.img.height) / 2);
                    var left = Math.round((this.target.width - imageData.css.img.width) / 2);

                    expect(imageData.css.img.objectFit).not.toBeDefined();
                    expect(imageData.css.img.top).toBe(top);
                    expect(imageData.css.img.left).toBe(left);

                });

                it('should return an IMG tag css with zero left positioning when src img is shorter and wider than the container and aligned top or bottom', function () {
                    utils.assign(this.src, {width: 1000, height: 100});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.TOP, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.left).toBe(0);
                    this.target.alignment = imageClientApi.alignTypes.BOTTOM;
                    imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.left).toBe(0);

                });

                it('should return an IMG tag css with zero top positioning when src img is narrower and taller than the container and aligned right or left', function () {
                    utils.assign(this.src, {width: 100, height: 1000});
                    this.target = {width: 854, height: 480, alignment: imageClientApi.alignTypes.LEFT, htmlTag: 'img'};
                    var imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.top).toBe(0);
                    this.target.alignment = imageClientApi.alignTypes.RIGHT;
                    imageData = imageClientApi.getData(imageClientApi.fittingTypes.ORIGINAL_SIZE, this.src, this.target);
                    expect(imageData.css.img.top).toBe(0);
                });

            });

        });


    });
});

