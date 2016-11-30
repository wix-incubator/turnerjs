define(['lodash',
    'loggingUtils/bi/bi',
    'coreUtils',
    'loggingUtils/logger/performance'
], function(_, bi, coreUtils, performance){
    'use strict';

    var already = [];
    var wixBiSession = {};
    if (typeof window !== 'undefined' && window.wixBiSession) {
        // Because we don't have siteData yet
        wixBiSession = window.wixBiSession;
        wixBiSession.beat(5);
    }

    var beatData = {};

    var BEAT_SITE_TYPES = ['No Site Type', 'WixSite', 'UGC', 'Template'];
    var BEAT_EVENT_TYPES = ['No Event Type', 'start', 'reset', 'finish'];
    var DEFAULT_VISITOR_ID = 'NO_SV';
    var MAX_DEFER_TIME = 2000;

    var baseOptions = {
        adapter: 'bt',
        biUrl: "http://frog.wix.com/"
    };
    var beatEventDefinition = {
        src: 29,
        evid: 3
    };
    var lastPositionedProperties = ['url', 'ref'];

    var MEASURE_NAMES = {
        6: 'packages loaded',
        7: 'load data',
        8: 'render',
        finish: 'layout',
        16: 'TPAs'
    };

    var SAMPLE_RATIOS = {
        16: 20
    };

    function paramsToQueryString(params) {
        // booleans should be converted to 1/0
        var query = coreUtils.urlUtils.toQueryString(_.omit(params, lastPositionedProperties), true);
        return _.reduce(lastPositionedProperties, function (result, prop) {
            return result + '&' + coreUtils.urlUtils.toQueryParam(prop, params[prop], true);
        }, query);
    }
    function buildBeatParams(siteData, reportDefinition, eventType, pageId){
        var sessionParams = getBeatSessionParams(siteData);
        var eventParams = getBeatEventParams(siteData, eventType, pageId);
        var etParam = {
            et: getEventType(eventType)
        };
        return _.merge({}, reportDefinition, sessionParams, eventParams, etParam);
    }
    function getBeatSessionParams(siteData){
        return {
            vuuid: getVisitorUuid(),
            vid: DEFAULT_VISITOR_ID,
            dc: siteData.serviceTopology.serverName,
            vsi: beatData[siteData.siteId].viewerSessionId,
            uuid: siteData.siteHeader.userId,
            sid: siteData.siteId,
            msid: siteData.getMetaSiteId()
        };
    }
    function getBeatEventParams(siteData, eventType, pageId){
        return {
            pid : pageId,
            pn  : getBeatPageNumber(siteData, eventType),
            st  : getSiteType(siteData),
            sr  : getDesktopSize(),
            wr  : getWindowSize(),
            isjp: wixBiSession.maybeBot ? '1' : '0',
            isp : siteData.isPremiumDomain(),
            url : urlWithoutWWW(siteData.currentUrl.full),
            ref : window.document.referrer,
            ts  : getBeatTimeStamp(siteData, eventType),
            c   : _.now(),
            v   : siteData.baseVersion || 'unknown'
        };
    }
    function getSiteType(siteData){
        var documentType = siteData.rendererModel.siteInfo.documentType;
        var siteType = _.indexOf(BEAT_SITE_TYPES, documentType);
        return siteType !== -1 ? siteType : documentType;
    }
    function getVisitorUuid(){
        var vuuid = coreUtils.cookieUtils.getCookie('_wixUIDX') || '';
        vuuid = vuuid.slice(_.lastIndexOf(vuuid, '|') + 1); //remove anything before any pipe, including the pipe.
        vuuid = vuuid.replace(/^(null-user-id|null)$/g, ''); //replace invalid values with empty string.
        return vuuid;
    }
    function getBeatPageNumber(siteData, eventType){
        if (eventType === 'start'){
            beatData[siteData.siteId].pageNumber++;
        }
        return beatData[siteData.siteId].pageNumber;
    }
    function getBeatTimeStamp(siteData, eventType){
        if (eventType === 'start'){
            beatData[siteData.siteId].lastTimeStamp = _.now();
            return 0;
        }
        return _.now() - beatData[siteData.siteId].lastTimeStamp;
    }
    function getEventType(eventType) {
        var index = _.indexOf(BEAT_EVENT_TYPES, eventType);
        if (index !== -1) {
            return index;
        }
        return eventType > 3 ? eventType : -1;
    }
    function urlWithoutWWW(url){
        return url.replace(/^http(s)?:\/\/(www\.)?/, '').substring(0, 256);
    }
    function getDesktopSize(){
        var width = (window.screen && window.screen.width) || 0;
        var height = (window.screen && window.screen.height) || 0;
        return width + 'x' + height;
    }
    function getWindowSize(){
        var width = 0;
        var height = 0;
        if (window.innerWidth) {
            width = window.innerWidth;
            height = window.innerHeight;
        } else if (window.document) {
            if (window.document.documentElement && window.document.documentElement.clientWidth) {
                width = window.document.documentElement.clientWidth;
                height = window.document.documentElement.clientHeight;
            } else if (window.document.body && window.document.body.clientWidth) {
                width = window.document.body.clientWidth;
                height = window.document.body.clientHeight;
            }
        }
        return width + 'x' + height;
    }

    function updateBiSession(siteData, params) {
        wixBiSession.et = params.et;
        siteData.wixBiSession.et = params.et;
    }

    function isHealthBeat(eventType) {
        return eventType > 3 && eventType !== 16;
    }

    function isHealthBeatAlreadySent(eventType) {
        var prev = already[eventType];
        already[eventType] = true;
        return prev;
    }

    function canSend(siteData, eventType) {
        return siteData &&
            siteData.wixBiSession.viewerSessionId &&
            siteData.viewMode !== 'preview' &&
            !coreUtils.stringUtils.isTrue(siteData.currentUrl.query.suppressbi) &&
            getEventType(eventType) !== -1 &&
            (!isHealthBeat(eventType) || !isHealthBeatAlreadySent(eventType));
    }

    function initBeatData(siteData) {
        beatData[siteData.siteId] = beatData[siteData.siteId] || {
            pageNumber: 1,
            lastTimeStamp: siteData.wixBiSession.initialTimestamp || 0,
            viewerSessionId: siteData.wixBiSession.viewerSessionId || coreUtils.guidUtils.getGUID()
        };
    }

    function buildBiParams(siteData, beatParams) {
        return {
            queryString: paramsToQueryString(beatParams),
            adapter: baseOptions.adapter,
            biUrl: siteData.getServiceTopologyProperty('biServerUrl') || baseOptions.biUrl
        };
    }

    function shouldIncludeInSampleRatio(siteData, sampleRatio) {
        if (!sampleRatio) {
            return true;
        }
        var sampleRatioState = siteData.currentUrl.query.sampleratio;
        if (siteData.isDebugMode() && (sampleRatioState !== 'force') || sampleRatioState === 'none') {
            return true;
        }
        return Math.floor(siteData.wixBiSession.random * sampleRatio) === 0;
    }
    function reportBiEvent(siteData, beatParams) {
        if (shouldIncludeInSampleRatio(siteData, SAMPLE_RATIOS[beatParams.et])) {
            var biParams = buildBiParams(siteData, beatParams);
            bi.wixBI.report(siteData, biParams);
        }
    }

    function deferIfNeeded(siteData, beatParams, cb) {
        var timeoutId = setTimeout(function () {
            timeoutId = 0;
            cb(beatParams);
        }, MAX_DEFER_TIME);
        siteData.subSvSession(function (svSession) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                beatParams.vid = svSession || DEFAULT_VISITOR_ID;
                cb(beatParams);
            }
        });
    }

    var prevMark;
    function reportBeatEvent(siteData, eventType, pageId) {
        initBeatData(siteData);
        var beatParams = buildBeatParams(siteData, beatEventDefinition, eventType, pageId);
        updateBiSession(siteData, beatParams);

        if (canSend(siteData, eventType)) {
            deferIfNeeded(siteData, beatParams, reportBiEvent.bind(null, siteData));
        }

        var postFix = siteData.viewMode;
        postFix = postFix === 'site' ? '' : ' ' + postFix;

        if (!prevMark) {
            performance.measure('main-r started' + postFix, 'domLoading', 'beat 4', true);
            performance.measure('utils loaded' + postFix, 'beat 4', 'beat 5', true);
            prevMark = 'beat 5';
        }

        var mark = 'beat ' + eventType;
        performance.mark(mark);
        var measureName = MEASURE_NAMES[eventType] || eventType;
        performance.measure(measureName + postFix, prevMark, mark, true);
        prevMark = mark;
    }

    /**
     *
     * @type {{reportBeatEvent: reportBeatEvent}}
     */
    return {
        reportBeatEvent: reportBeatEvent,
        shouldIncludeInSampleRatio: shouldIncludeInSampleRatio
    };
});
