(function(window, undefined){
//TODO: we should use a general cookie library for this. there are two!
function getCookieInfo(cookie) {
    var cookies = document.cookie.split(';');
    var name = cookie;
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(name) === 0) {
            c = c.substring(name.length, c.length);
            return c.replace("=", "");
        }
    }
    return '';
}

//TODO: this should be a util function in utils.browser but i'm not sure we have that here when we need it. check.
function getUrlParam(param, ignoreCase) {
    //this regex gets the first value of param=<value> where the param is directly preceded with a & and ends with either an & or end of string. there can be no # since we're looking at the location.search substring
    var modifiers = ignoreCase ? 'i' : '';
    var reg = new RegExp('[?&]' + param + '=([^&]+)', modifiers);
    var m = window.location.search.match(reg);
    return m ? m[1] : undefined;
}

function getDebugMode() {
    return window.editorModel && window.editorModel.mode || window.rendererModel && window.rendererModel.debugMode;
}

function getRelevantModelWithFallbackEmptyObject() {
    return window.editorModel || window.rendererModel || {};
}

function isDebugMode() {
    return getDebugMode() === 'debug' || /[?&]debugArtifacts?\b/i.test(window.location.search);
}

// Initiate logger with mobile editor settings
var creationSource = "http://m.wix.com";
if (window.siteHeader && window.siteHeader.creationSource) {
    switch (window.siteHeader.creationSource.toLocaleLowerCase()) {
        case 'web':
            creationSource = 'http://www.wix.com';
            break;
        case 'standalone':
            creationSource = 'http://mobile.wix.com';
            break;
    }
}

// get user's google analytics account from session
var _userAnalyticsAccount = "";
if (window.googleAnalytics) {
    _userAnalyticsAccount = (window.googleAnalytics.length === 0) ? "" : window.googleAnalytics;
}
var isAnalyticsEnabled = !(window.publicModel && window.publicModel.suppressTrackingCookies);

var wixAnalyticsAccount = (window.rendererModel && (rendererModel.documentType === 'UGC')) ? 'UA-2117194-61' : '';

var logParams = {
    'errors': window.wixErrors,
    'events': window.wixEvents,
    // re-examine var names and general logic; more states should be available (editor/viewer/wix/user)
    'wixAnalytics': (window.viewMode === 'editor') ? ['UA-2117194-45'] : [],
    'userAnalytics': [wixAnalyticsAccount, _userAnalyticsAccount],
    'enableGoogleAnalytics': isAnalyticsEnabled,
    'floggerServerURL': (window.serviceTopology && window.serviceTopology.biServerUrl) || 'http://frog.wixpress.com/',
    'majorVer': 2,
    'version': ((window.viewMode != 'editor') ? 'VR' : 'ER') + window.client_version,
    'siteId': (window['siteId'] ? siteId : ""),
    'metaSiteId': getRelevantModelWithFallbackEmptyObject().metaSiteId, //if anything goes wrong, this might return undefined, but it won't break
    'userId': (window.siteHeader && window.siteHeader.userId) || "00000000-0000-0000-0000-000000000000",
    'userType': getCookieInfo("userType"),
    'userLanguage': getCookieInfo("wixLanguage") || 'unknown',
    "wixGlobalSessionId": getCookieInfo("_wix_browser_sess"),
    "editingSessionId": getUrlParam('editorSessionId', true),
    'computerId': getCookieInfo("_wixCIDX") || "00000000-0000-0000-0000-000000000000",
    'creationSource': creationSource,
    'wixAppId': 42, /* 3 = wix mobile */
    'sendPageTrackToWix': window.viewMode == "editor",
    'sendPageTrackToUser': window.viewMode == "site",
    'debugMode': isDebugMode(),
    'onEvent': function (event, params) {
    },
    'onError': function (err, className, methodName, params) {
        // Show console error in debug mode
        if (isDebugMode() || getDebugMode() == 'unit_test') {
            if (window['console'] && window['console']['error']) {
                console['error'](err.desc, err, className, methodName, params);
            }
        }
    }
};

//all this ugly stuff is because we don't necessarily have the W.isExperimentOpen here yet.
//so, if noUGCanalytics is turned on AND this is a premium (domain) site, we'll REMOVE the above defined UGC analytics.
//note, however, that it must be defined in lower case!
var model=getRelevantModelWithFallbackEmptyObject();
var runningExperiments = model.runningExperiments || {};
if(runningExperiments.nougcanalytics === "new" && model.premiumFeatures && model.premiumFeatures.indexOf('HasDomain')>-1 && logParams.userAnalytics[1] !== '') {
    logParams.userAnalytics.splice(0,1);
}

    /**
     * @global
     * @name LOG
     * @type {Logger}
     */
    window.LOG = new Logger(logParams);
    //if the URL contains suppressbi=true that means that this site is now opened by our suppressbi server for taking screenshots of the site, so we don't want any reports being fired
    //tried to use the one in W.Utils, but it isn't defined yet when we reach this point.
    //there is another block inside the logger, since otherwise it also sends a bi for starting the logger itself. on the other hand, this block is better because it's more efficient in run-time
    if (window.location.search.search(/[?&]suppressbi=true/i) !== -1) {
        LOG.reportEvent=function(){};
        LOG.reportBeatStartEvent=function(){};
        LOG.reportBeatFinishEvent=function(){};
        LOG.reportError=function(){};
        LOG.reportEditorLoadingEvent=function(){};
        LOG.reportPageEvent=function(){};
    }
    //window.BI = new BI();

}(window));