/*global DocumentTouch:true*/
define(['lodash', 'experiment'], function (_, experiment) {
    "use strict";

    var MOBILE_MAX_WIDTH = 600;
    var TABLET_MAX_WIDTH = 1280;
    var DEVICE_TYPES = {
        MOBILE: 'smartphone',
        TABLET: 'tablet',
        DESKTOP: 'desktop',
        OTHER: 'other'
    };

    var EPSILON = 0.0001;
    function fuzzyEqual(a, b){
        return Math.abs(a - b) < EPSILON;
    }
    function fuzzyGreaterThan(a, b){
        return a > b + EPSILON;
    }

    /**
     *
     * @return {?{width: number, height: number}}
     * @private
     */
    function paramsForSpecificAndroidDevices(userAgent) {
        switch (true) {
            case (/(GT-S5300B|GT-S5360|GT-S5367|GT-S5570I|GT-S6102B|LG-E400f|LG-E400g|LG-E405f|LG-L38C|LGL35G)/i).test(userAgent):
                return {width: 240, height: 320};
            case (/(Ls 670|GT-S5830|GT-S5839i|GT-S6500D|GT-S6802B|GT-S7500L|H866C|Huawei-U8665|LG-C800|LG-MS695|LG-VM696|LGL55C|M865|Prism|SCH-R720|SCH-R820|SCH-S720C|SPH-M820-BST|SPH-M930BST|U8667|X501_USA_Cricket|ZTE-Z990G)/i).test(userAgent):
                return {width: 320, height: 480};
            case (/(5860E|ADR6300|ADR6330VW|ADR8995|APA9292KT|C771|GT-I8160|GT-I9070|GT-I9100|HTC-A9192|myTouch4G|N860|PantechP9070|PC36100|pcdadr6350|SAMSUNG-SGH-I727|SAMSUNG-SGH-I777|SAMSUNG-SGH-I997|SC-03D|SCH-I405|SCH-I500|SCH-I510|SCH-R760|SGH-S959G|SGH-T679|SGH-T769|SGH-T959V|SGH-T989|SPH-D700)/i).test(userAgent):
                return {width: 480, height: 800};
            case (/(DROIDX|SonyEricssonSO-02C|SonyEricssonST25i)/i).test(userAgent):
                return {width: 480, height: 854};
            case (/(DROID3|MB855)/i).test(userAgent):
                return {width: 540, height: 960};
            case (/F-05D/i).test(userAgent):
                return {width: 720, height: 1280};
            default:
                return null;
        }
    }

    /**
     * Returns number with 7 digits (e.g. 5375101), or NaN if is not a Webkit
     *
     * @param {string} userAgent - evaluated on browser from `navigator.userAgent`
     * @return {number}
     */
    function getWebkitVersion(userAgent) {
        var match = userAgent.match(/applewebkit\/([\d\.]+)/i),
            version,
            major,
            minor,
            build;

        if (match) {
            version = match[1].split('.');
            major = +(version[0] || 0);
            minor = +(version[1] || 0);
            build = +(version[2] || 0);

            return major * 10000 + minor * 100 + build;
        }

        return NaN;
    }

    /**
     * @typedef {MobileDeviceAnalyzer} core.SiteData.MobileDeviceAnalyzer
     */

    /**
     *
     * @param {site.requestModel} requestModel
     * @constructor
     */
    function MobileDeviceAnalyzer(requestModel) {
        this.requestModel = requestModel;
    }


    MobileDeviceAnalyzer.prototype = {

        /**
         *
         * @return {boolean}
         */
        isMobileDevice: function () {
            var isMobileDetectedByServer = _.result(this, 'requestModel.deviceType.toLowerCase') === DEVICE_TYPES.MOBILE;
            if (this.isWindowUnavailable()) {
                return isMobileDetectedByServer;
            }
            var screenWidth = this.getScreenWidth();
            if (this.isLandscape()) {
                screenWidth = this.getScreenHeight();
            }
            var isMobileScreenSize = screenWidth < MOBILE_MAX_WIDTH;
            var isMobileDetectedByClient = isMobileScreenSize && (this.isTouchScreen() || this.isMSMobileDevice());
            //should add bi event here to indicate if server detection is the same as client detection
            return isMobileDetectedByClient;
        },

        /**
         *
         * @return {boolean}
         */
        isTabletDevice: function () {
            if (this.isWindowUnavailable()) {
                return !!(this.requestModel && this.requestModel.deviceType && this.requestModel.deviceType.toLowerCase() === DEVICE_TYPES.TABLET);
            }
            var screenWidth = this.getScreenWidth();
            if (this.isPortrait()) {
                screenWidth = this.getScreenHeight();
            }
            return !this.isMobileDevice() &&
                (screenWidth >= MOBILE_MAX_WIDTH && screenWidth <= TABLET_MAX_WIDTH) &&
                this.isTouchScreen();
        },

        /**
         *
         * @return {number}
         */
        getWindowScreenWidth: function () {
            return window.screen.width;
        },

        /**
         *
         * @return {number}
         */
        getScreenWidth: function () {
            var sizes = this._getDeviceParamsByUserAgent();
            return sizes ? sizes.width : NaN;
        },

        /**
         *
         * @return {number}
         */
        getScreenHeight: function () {
            var sizes = this._getDeviceParamsByUserAgent();
            return sizes ? sizes.height : NaN;
        },

        /**
         *
         * @return {boolean}
         */
        isAppleMobileDevice: function () {
            return (/iphone|ipod|ipad|Macintosh/i.test(this.requestModel.userAgent));
        },

        /**
         *
         * @return {boolean}
         */
        isMSMobileDevice: function () {
            return (/iemobile/i.test(this.requestModel.userAgent));
        },

        /**
         *
         * @return {boolean}
         */
        isAndroidMobileDevice: function () {
            return (/android/i.test(this.requestModel.userAgent));
        },

        /**
         * Checks for older WebKit browsers which have rendering bug,
         * when "overflow: hidden" + border-radius do not work if
         * inner element is an <iframe>.
         *
         * If WebKit build number is 537+, then it should work fine.
         * @return {boolean}
         */
        cannotHideIframeWithinRoundedCorners: function () {
            return getWebkitVersion(this.requestModel.userAgent) < 5370000;
        },

        /**
         *
         * @return {boolean}
         */
        isNewChromeOnAndroid: function () {
            if (this.isAndroidMobileDevice()) {
                var userAgent = this.requestModel.userAgent.toLowerCase();
                if ((/chrome/i.test(userAgent))) {
                    var parts = userAgent.split('chrome/');

                    var fullVersionString = parts[1].split(" ")[0];
                    var versionString = fullVersionString.split('.')[0];
                    var version = parseInt(versionString, 10);

                    if (version >= 29) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         *
         * @return {boolean}
         */
        isTouchScreen: function () {//wanted to ask you something about deviceType. Is there any chance the library you're using can tell if a device supports touch events
            if (this.isWindowUnavailable()) {
                return this.isMobileDevice() || this.isTabletDevice();
            }
            return !!(('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch);
        },

        isLandscape: function () {
            return !this.isPortrait();
        },

        /**
         *
         * @return {boolean}
         */
        isPortrait: function () {
            if (this.isWindowUnavailable()) {
                return true;
            }
            var orientation = window.orientation;
            return orientation === 0 || orientation === 180 || this.isPortraitByScreenSize();
        },

        /**
         *
         * @return {boolean}
         */
        isPortraitByScreenSize: function () {
            if (this.isWindowUnavailable()) {
                return true;
            }
            return window.innerHeight > window.innerWidth;
        },

        /**
         *
         * @return {boolean}
         */
        isAndroidOldBrowser: function () {
            var isChrome = this.isNewChromeOnAndroid();
            var isOpera = (/opr/i.test(this.requestModel.userAgent));

            return this.isAndroidMobileDevice() && !isChrome && !isOpera;
        },

        /**
         * @return {number}
         * @private
         */
        getDevicePixelRatio: function () {
            if (this.isWindowUnavailable()) {
                return 2;
            }
            if (this.isMSMobileDevice()) {
                return Math.round(window.screen.availWidth / (window.screen.width || window.document.documentElement.clientWidth));
            }
            return window.devicePixelRatio;
        },

        /**
         *
         * @return {number}
         */
        getInitZoom: function () {
            return this.getScreenWidth() / window.document.body.offsetWidth;
        },

        /**
         *
         * @return {number}
         */
        getZoom: function () {
            if (this.isWindowUnavailable()) {
                return 1;
            }
            var screenWidth = this.getScreenWidth();
            return (screenWidth / this.getWindowInnerWidth());
        },

        isZoomed: function() {
            if (this.isWindowUnavailable()) {
                return false;
            }
            return !fuzzyEqual(this.getZoom(), this.getInitZoom());
        },

        isZoomedIn: function() {
            if (this.isWindowUnavailable()) {
                return false;
            }
            return fuzzyGreaterThan(this.getZoom(), this.getInitZoom());
        },

        /**
         *
         * @return {number}
         */
        getMobileZoomByScreenProperties: function () {
            if (this.isWindowUnavailable()) {
                return 1;
            }

            var val = 1;
            var screenDimensions = this.getScreenDimensions();
            var w = Math.max(screenDimensions.width, screenDimensions.height);
            var h = Math.min(screenDimensions.width, screenDimensions.height);

            if (this.isMobileDevice() && !this.isPortraitByScreenSize()) {
                val = h / w;
            }

            return val;
        },

        /**
         *
         * @return {number}
         */
        getSiteZoomRatio: function () {
            if (this.isWindowUnavailable()) {
                return 1;
            }

            var zoomRatio = 320 / window.screen.width;
            return zoomRatio;
        },

        /**
         *
         * @return {number}
         */
        getInvertedZoomRatio: function () {
            if (this.isWindowUnavailable()) {
                return 1;
            }
            return 1 / this.getZoom();
        },

        getOrientationZoomFixRation: function () {
            return this.getInitZoom() / this.getZoom();
        },

        /**
         *
         * @returns {number}
         */
        getZoomRatioForNonOptimizedSites: function () {
            if (this.isWindowUnavailable()) {
                return 1;
            }
            return window.innerWidth / 320;
        },

        /**
         *
         * @return {?{width: number, height: number}}
         * @private
         */
        _getDeviceParamsByUserAgent: function () {
            if (this.isWindowUnavailable()) {
                return null;
            }

            var userAgent = this.requestModel.userAgent.toLowerCase();

            var specificAndroidParams = paramsForSpecificAndroidDevices(userAgent);

            var width;
            var height;

            var screenDimensions = this.getScreenDimensions();

            if (specificAndroidParams) {
                width = specificAndroidParams.width;
                height = specificAndroidParams.height;
            } else if (this.isPortrait()) {
                width = Math.min(screenDimensions.width, screenDimensions.height);
                height = Math.max(screenDimensions.width, screenDimensions.height);
            } else {
                width = Math.max(screenDimensions.width, screenDimensions.height);
                height = Math.min(screenDimensions.width, screenDimensions.height);
            }

            if (/iemobile/i.test(userAgent)) {
                width = screenDimensions.width || window.document.documentElement.clientWidth;
                height = screenDimensions.height || window.document.documentElement.clientHeight;
            }

            return {width: width, height: height};
        },

        getScreenDimensions: function () {
            if (this.isWindowUnavailable()) {
                return {width: 0, height: 0};
            }
            return {width: window.screen.width, height: window.screen.height};
        },

        isWindowUnavailable: function () {
            return typeof window === 'undefined';
        },

        getWindowInnerWidth: function () {
            if (experiment.isOpen('sv_alwaysEnableMobileZoom')){
                return window.innerWidth / (window.getComputedStyle(window.document.body).zoom || 1);
            }

            return window.innerWidth;
        }
    };

    return MobileDeviceAnalyzer;
});
