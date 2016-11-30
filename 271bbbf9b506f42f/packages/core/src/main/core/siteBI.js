define(['lodash', 'zepto', 'utils', 'core/bi/events', 'fonts'], function (_, $, utils, events, fontsPkg) {
    'use strict';

    // start experiment fontsTrackingInViewer code
    var hasReportedFontsTracking = false;
    // end experiment fontsTrackingInViewer code

    var logger = utils.logger;
    var newrelic = utils.newrelic;

    var EXPERIMENTS = ['useHttps'];

    var MINIMUM_IMAGE_DOWNLOAD_DURATION = 25;
    var MAX_IMAGE_DOWNLOAD_KBPS = 9216;
    var MIN_IMAGE_SIZE = 5;

    var KEY_COUNT_LIMIT = 2;
    var MOUSE_COUNT_LIMIT = 44;
    var SCROLL_COUNT_LIMIT = 11;

    if (typeof window === 'undefined') {
        return {
            init: function () {
            },
            send: function () {
            }
        };
    }
    var IS_PREVIEW = window.queryUtil && window.queryUtil.isParameterTrue('isEdited');

    var PRE_CLIENT_TIMING = ['navigationStart', 'fetchStart', 'domainLookupStart', 'domainLookupEnd',
        'connectStart', 'secureConnectionStart', 'requestStart', 'responseStart', 'responseEnd'];
    var SITE_BI_TIMING = [5, 15, 30];

    var IMAGES_PER_BUCKET = 3;
    var LARGEST_IMAGES_AMOUNT = 10;

    // Retain initial timing values so that they won't be overwritten by additional browser activity
    var performance = window.performance || {};
    var timing = performance.timing;
    timing = _.pick(timing, PRE_CLIENT_TIMING);

    var alreadySentFullPerformanceData;

    function experimentsValue(siteData) {
        var model = siteData.rendererModel || siteData.editorModel || {};
        return _.reduce(model.runningExperiments, function (r, v, k) {
            var index = EXPERIMENTS.indexOf(k);
            return index === -1 ? r : r + Math.pow(2, index);
        }, 0);
    }

    /**
     *
     * @param {Object} siteData
     * @param {number} timeoutSeconds
     */
    function reportPagePerformanceData(siteData, timeoutSeconds) {
        if (alreadySentFullPerformanceData < timeoutSeconds) {
            return;
        }
        if ('lastTimeStamp' in siteData.wixBiSession) {
            alreadySentFullPerformanceData = timeoutSeconds;
        }

        function rebase(start, v) {
            if (typeof v !== 'number') {
                return v;
            }
            return v ? v - start : undefined;
        }

        var isPremium = siteData.isPremiumDomain();
        var isWixSite = siteData.rendererModel.siteInfo.documentType === 'WixSite';

        var preClient = _.assign({}, timing, {initialTimestamp: siteData.wixBiSession.initialTimestamp});
        preClient = _.mapValues(preClient, rebase.bind(null, preClient.navigationStart || preClient.initialTimestamp));

        var client = _.omit(siteData.wixBiSession, function (value, key) {
            return typeof value !== 'number' || key === 'et';
        });
        if (performance.getEntries) {
            var packages = performance.getEntries().filter(function (entry) {
                return entry.name.search(/.min.js$/) !== -1;
            });
            if (packages.length) {
                var base = timing.navigationStart || 0;
                var skinsEntry = _.find(packages, function (entry) {
                    return _.includes(entry.name, 'skins');
                });
                if (skinsEntry) {
                    client.skinsStart = Math.round(base + skinsEntry.startTime);
                    client.skinsEnd = Math.round(client.skinsStart + skinsEntry.duration);
                }
                client.packagesEnd = 0;
                packages.forEach(function (pkg) {
                    client.packagesEnd = Math.max(client.packagesEnd, pkg.startTime + pkg.duration);
                });
                client.packagesEnd = Math.round(base + client.packagesEnd);
            }
        }
        client = _.mapValues(client, rebase.bind(null, client.initialTimestamp || 0));

        var version = siteData.santaBase.match(/([\d\.]+)\/?$/);
        version = (version && version[1]) || 'unknown';

        var payload = {
            isPremium: isPremium ? 1 : 0,
            isWixSite: isWixSite ? 1 : 0,
            preClient: JSON.stringify(preClient),
            client: JSON.stringify(client),
            santaVersion: version,
            timeoutSeconds: timeoutSeconds,
            experiment: experimentsValue(siteData),
            pageId: siteData.getCurrentUrlPageId()
        };

        var dnsTime = preClient.domainLookupEnd - preClient.domainLookupStart;
        if (!isNaN(dnsTime)) {
            payload.dnsTime = dnsTime;
        }

        var responseTime = preClient.responseEnd - preClient.connectStart;
        if (!isNaN(responseTime)) {
            payload.responseTime = responseTime;
        }

        if (siteData.wixBiSession.viewerSessionId) {
            logger.reportBI(siteData, events.PAGE_PERFORMANCE_DATA, payload);
        }
    }

    function reportLoadImageData(siteData) {

        var sizes = [100, 200, 300, 400, 500, 1000, 2000, 3000]; //should be sorted

        function toBucketName(size) {
            return '_' + size + 'k';
        }

        var lastBucketName = '_over' + _.last(sizes) + 'k';

        function createSizeBuckets(fillFunction) {
            var bucketNames = sizes
                .map(toBucketName)
                .concat([lastBucketName]);
            return _.zipObject(bucketNames, _.times(bucketNames.length, fillFunction));
        }

        function buildImageTiming(image, entry) {
            var result = {
                url: image.src,
                hadError: false,
                width: image.width,
                height: image.height,
                size: image.width * image.height
            };

            var start = entry ? entry.startTime : 0;
            var duration = entry ? entry.duration : 0;
            _.defaults(result, {
                hadError: !entry,
                start: Math.round(start),
                end: Math.round(start + duration),
                speed: Math.round((result.size / (duration + 0.01)) * 100) / 100 // two digits after decimal
            });

            return result;
        }

        function getSizeKey(imageData) {
            var sizeIndex = _.findLastIndex(sizes, function (size) {
                    return size * 1000 < imageData.size;
                }) + 1;
            return sizeIndex < sizes.length ? toBucketName(sizes[sizeIndex]) : lastBucketName;
        }

        var imagePerf = _(window.document.getElementsByTagName('img')) //eslint-disable-line lodash3/prefer-thru
            .filter(function(img) { return _.startsWith(img.src, window.serviceTopology.staticMediaUrl); })
            .reduce(function (perf, img) {
                if (!img.complete) {
                    perf.loading++;
                } else {
                    var entry = performance.getEntriesByName(img.src)[0];
                    var imageTiming = buildImageTiming(img, entry);
                    if (imageTiming.hadError) {
                        perf.errors++;
                    } else {
                        var sizeKey = getSizeKey(imageTiming);
                        perf.imagesBySize[sizeKey]++;
                        if (perf.imagesSamples[sizeKey].length < IMAGES_PER_BUCKET) {
                            perf.imagesSamples[sizeKey].push(imageTiming);
                        }
                    }
                }
                return perf;
            }, {
                loading: 0,
                imagesBySize: createSizeBuckets(_.constant(0)),
                imagesSamples: createSizeBuckets(function() {return [];}),
                errors: 0
            });

        logger.reportBI(siteData,
            events.LOAD_IMAGES_DATA,
            {imagePerf: JSON.stringify(imagePerf)});
    }

    function reportLargestImages(siteData) {
        var staticMediaUrl = window.serviceTopology ? window.serviceTopology.staticMediaUrl : 'nothing';

        function getImagePerformanceEntries() {
            return _(performance.getEntriesByType('resource'))
                .toArray()
                .filter(function (entry) {
                    return entry.duration > MINIMUM_IMAGE_DOWNLOAD_DURATION && // not cached
                        _.startsWith(entry.name, staticMediaUrl);
                })
                .value();
        }

        function getImageProperties(entry) {
            var url = entry.name.replace(staticMediaUrl, '');
            var matches = url.match(/\.([^/]+).+w_(\d+),h_(\d+),/);
            if (matches) {
                var width = Number(matches[2]);
                var height = Number(matches[3]);
                return {
                    url: url,
                    format: matches[1],
                    width: width,
                    height: height,
                    size: width * height
                };
            }
            return {};
        }

        function getImageData(entry) {
            var imgProps = getImageProperties(entry);
            var timingProps = {
                start: Math.round(entry.startTime),
                end: Math.round(entry.startTime + entry.duration),
                ttfb: Math.round(entry.responseStart - entry.requestStart),
                dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
                ssl: entry.secureConnectionStart ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
                speed: entry.duration > 0 ? Math.round(imgProps.size / entry.duration) : 0,
                fileSize: entry.fileSize,
                kbps: entry.duration > 0 ? Math.round(1000 * entry.fileSize / entry.duration) : 0
            };
            return _.assign({}, imgProps, timingProps);
        }

        function reportFileSizes(Promise) {
            function getImageSizePromise(entry) {
                return new Promise(function (resolve, reject) {
                    utils.ajaxLibrary.ajax({
                        type: 'HEAD',
                        url: entry.name,
                        success: function (data, status, xhr) {
                            var contentLength = xhr.getResponseHeader('Content-Length');
                            var fileSize = contentLength && Math.round(contentLength / 1024);
                            resolve(_.assign(entry, {fileSize: fileSize}));
                        },
                        error: function (xhr, options, thrownError) {
                            reject(thrownError);
                        }
                    });
                });
            }

            var promises = getImagePerformanceEntries().map(getImageSizePromise);
            Promise.all(promises)
                .then(function (entries) {
                    var imagePerf = _(entries)
                        .filter(function (entry) {
                            return entry.fileSize > MIN_IMAGE_SIZE;
                        })
                        .sortBy('fileSize')
                        .takeRight(LARGEST_IMAGES_AMOUNT)
                        .map(getImageData)
                        .filter(function (entry) {
                            return entry.kbps <= MAX_IMAGE_DOWNLOAD_KBPS;
                        })
                        .value();
                    if (imagePerf.length) {
                        var total = _.reduce(imagePerf, function (r, ip) {
                            return {
                                size: r.size + ip.fileSize,
                                duration: r.duration + ip.end - ip.start,
                                ttfb: r.ttfb + ip.ttfb
                            };
                        }, {
                            size: 0,
                            duration: 0,
                            ttfb: 0
                        });
                        logger.reportBI(siteData, events.IMAGES_DOWNLOAD, {
                            imagePerf: JSON.stringify(imagePerf),
                            kbps: Math.round(1000 * total.size / total.duration),
                            ttfb: Math.round(total.ttfb / imagePerf.length)
                        });
                    }
                }, _.noop);
        }

        if (window.Promise && window.Promise.all) {
            reportFileSizes(window.Promise);
        } else {
            requirejs(['bluebird'], reportFileSizes, _.noop);
        }
    }

    function reportUserInteraction(siteData) {
        if (!$) {
            return;
        }

        var report = function (type) {
            $(window).off('.bi');
            report = _.noop;
            logger.reportBI(siteData, events.USER_INTERACTION, {
                type: type
            });
        };

        var keyCount = 0;
        function reportKey() {
            if (++keyCount > KEY_COUNT_LIMIT) {
                report('key');
            }
        }

        var mouseCount = 0;
        function reportMouse() {
            if (++mouseCount > MOUSE_COUNT_LIMIT) {
                report('mouse');
            }
        }

        var scrollCount = 0;
        function reportScroll() {
            if (++scrollCount > SCROLL_COUNT_LIMIT) {
                report('scroll');
            }
        }

        $(window).on({
            'keydown.bi': reportKey,
            'mousemove.bi': reportMouse,
            'scroll.bi': reportScroll
        });
    }

    function reportVideoTimings() {
        var resources = performance.getEntriesByType('resource');
        var videos = _.filter(resources, function (resource) { return /\.mp4$/.test(resource.name); });
        videos.forEach(function (video) {
            newrelic.addPageAction('videoPerformance', _.pick(video, ['name', 'startTime', 'requestStart', 'responseStart', 'responseEnd']));
        });
    }

    var startTime = _.now();

    // When changing return structure, remember to fix server-side return at top

    /**
     * @exports core/core/siteBI
     */
    return {
        init: function (siteData) {
            if (IS_PREVIEW) {
                return;
            }

            if (logger.shouldSendReport(siteData, events.USER_INTERACTION)) {
                // Delay report to avoid interfering with Beat message
                setTimeout(function () {
                    reportUserInteraction(siteData);
                }, 300);
            }

            if (!logger.shouldSendReport(siteData)) {
                return;
            }

            alreadySentFullPerformanceData = Infinity; // Make sure to execute the first time
            startTime = _.now();

            _.forEach(SITE_BI_TIMING, function (tmng) {
                setTimeout(reportPagePerformanceData.bind(null, siteData, tmng), tmng * 1000);
            });

            if (performance.getEntriesByName) {
                setTimeout(function () {
                    reportLoadImageData(siteData);
                    reportLargestImages(siteData);
                }, 10500);
            }
        },

        send: function (siteData) {
            if (!IS_PREVIEW) {
                if (logger.shouldSendReport(siteData, events.PAGE_PERFORMANCE_DATA)) {
                    // Delay report to avoid interfering with Beat message
                    setTimeout(function () {
                        reportPagePerformanceData(siteData, Math.round((_.now() - startTime) / 1000));
                    }, 300);
                }
                if (performance.getEntriesByType && logger.shouldSendReport(siteData, {sampleRatio: 1})) {
                    setTimeout(function () {
                        reportVideoTimings();
                    }, 3000);
                }
            }
        },
        // start experiment fontsTrackingInViewer code
        trackFontsIfNeeded: function(siteData, currentPageId) {
            var fontsTracker = fontsPkg.fontsTracker;
            if (!IS_PREVIEW && !hasReportedFontsTracking && fontsTracker.shouldTrackFonts(siteData, currentPageId)) {
                hasReportedFontsTracking = true;
                logger.reportBI(siteData, events.MONOTYPE_FONTS_USED_ON_SITE, {});
            }
        }
        // end experiment fontsTrackingInViewer code
    };
});
