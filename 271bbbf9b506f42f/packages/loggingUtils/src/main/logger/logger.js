define([
    'lodash',
    'loggingUtils/bi/bi',
    'loggingUtils/logger/beat',
    'coreUtils'
], function(_, bi, beat, coreUtils) {
    'use strict';

    var IS_PREVIEW = typeof window !== 'undefined' && window.queryUtil && window.queryUtil.isParameterTrue('isEdited');
    var MAJOR_VER = typeof window !== 'undefined' && !window.clientSideRender ? 4 : 3;
    var DEFAULT_SAMPLE_RATIO = 10;

    var errorMap = {
        errorName: 'errn',
        errorCode: 'errc',
        errc: 'errc',
        src: 'src',
        severity: 'sev',
        sev: 'sev',
        packageName: 'errscp'
    };

    var errorSeverityMap = {
        recoverable: 10,
        warning: 20,
        error: 30,
        fatal: 40
    };

    var eventMap = {
        eventId: 'evid',
        evid: 'evid',
        src: 'src'
    };

    var viewerSessionId = {};

    function getErrorSeverity(severity) {
        return typeof severity === 'string' ?
            errorSeverityMap[severity] :
            severity;
    }

    function extractDefaultErrorDefParams(reportDef) {
        return {
            errn: reportDef.errorName,
            evid: 10,
            sev: getErrorSeverity(reportDef.severity),
            cat: IS_PREVIEW ? 1 : 2,
            iss: 1,
            ut: coreUtils.cookieUtils.getCookie('userType')
        };
    }

    function extractErrorParams(reportDef, params) {
        var errorParams = _.merge({src: 44, sev: 30, errn: 'error_name_not_found'},
            extractReportParamsAccordingToMap(reportDef, errorMap),
            extractDefaultErrorDefParams(reportDef),
            extractAdditionalParams(reportDef, params));
        if (params && params.description) {
            errorParams.desc = JSON.stringify(params.description).slice(0, 512);
        }
        return errorParams;
    }

    function extractEventParams(reportDef, params) {
        return _.merge({src: 42},
            extractReportParamsAccordingToMap(reportDef, eventMap),
            extractAdditionalParams(reportDef, params));
    }

    function extractParams(siteData, reportType, reportDef, params) {
        var resultParams;

        switch (reportType) {
            case 'error':
                resultParams = extractErrorParams(reportDef, params);
                break;
            case 'event':
                resultParams = extractEventParams(reportDef, params);
                break;
        }

        return _.merge(resultParams, getParamsFromSite(siteData));
    }

    function createWixBIOptions(siteData, reportDef, params) {
        var reportType = reportDef.reportType || (reportDef.errorCode || reportDef.errc ? 'error' : 'event');
        return {
            biUrl: siteData.serviceTopology.biServerUrl,
            adapter: reportDef.adapter || reportDef.endpoint || (reportType === 'error' ? 'trg' : 'ugc-viewer'),
            params: extractParams(siteData, reportType, reportDef, params)
        };
    }

    function extractSantaVersion(siteData) {
        var sourceMatches = siteData.santaBase && siteData.santaBase.match(/([\d\.]+)\/?$/);
        return (sourceMatches && sourceMatches[1]) || '';
    }

    function getParamsFromSite(siteData) {
        viewerSessionId[siteData.siteId] = viewerSessionId[siteData.siteId] || siteData.wixBiSession.viewerSessionId || coreUtils.guidUtils.getGUID();
        var server = siteData.serviceTopology.serverName ?
            _.first(siteData.serviceTopology.serverName.split('.')) :
            '';
        var siteParams = {
            did: siteData.siteId,
            msid: siteData.getMetaSiteId(),
            majorVer: MAJOR_VER,
            ver: extractSantaVersion(siteData),
            server: server,
            viewMode: siteData.viewMode
        };
        if (!IS_PREVIEW) {
            siteParams.vsi = viewerSessionId[siteData.siteId];
        }
        return siteParams;
    }

    function encodeString(v) {
        return typeof v === 'string' ? encodeURIComponent(v) : v;
    }

    function extractAdditionalParams(reportDef, params) {
        var additionalParams = {};
        var reportDefParams = reportDef.params;
        if (_.isArray(reportDefParams)) {
            additionalParams = _.pick(params, reportDefParams);
        } else if (_.isObject(reportDefParams)) {
            additionalParams = _.mapValues(reportDefParams, function(paramName){
              return encodeString(params[paramName]);
            });
        } else {
            additionalParams = _.mapValues(params, encodeString);
        }
        return additionalParams;
    }

    function extractReportParamsAccordingToMap(reportDef, reportMap) {
        return _.transform(reportDef, function(accum, val, key) {
            var mapped = reportMap[key];
            if (mapped) {
                accum[mapped] = val;
            }
        }, {});
    }

    function shouldSuppressBI(siteData) {
        return coreUtils.stringUtils.isTrue(siteData.currentUrl.query.suppressbi);
    }

    function passedCallLimit(reportDef) {
        if (!reportDef) {
            return false;
        }
        reportDef.callCount = reportDef.callCount || 0;
        reportDef.callCount++;
        return ((reportDef.callLimit) && reportDef.callCount > reportDef.callLimit);
    }

    function isSiteInSampleRatio(siteData, reportDef) {
        if (siteData.forceBI) {
            return true;
        }
        var sampleRatio = DEFAULT_SAMPLE_RATIO;
        if (reportDef) {
            if (siteData.isWixSite() && ('wixSiteSampleRatio' in reportDef)) {
                sampleRatio = reportDef.wixSiteSampleRatio;
            } else if ('sampleRatio' in reportDef) {
                sampleRatio = reportDef.sampleRatio;
            } else if ('errorCode' in reportDef || reportDef.endpoint === 'editor') {
                sampleRatio = 0;
            }
        }
        if (sampleRatio && sampleRatio >= 1) {
            return beat.shouldIncludeInSampleRatio(siteData, sampleRatio);
        }
        return true;
    }

    function shouldSendReport(siteData, reportDef) {
        return !shouldSuppressBI(siteData) &&
            !passedCallLimit(reportDef) &&
            isSiteInSampleRatio(siteData, reportDef);
    }

    /**
     *
     * @param {SiteData} siteData
     * @param {biError|biEvent} reportDef
     * @param {object} params
     */
    function reportBI(siteData, reportDef, params) {
        if (!siteData || !_.isObject(reportDef)) {
           return; //TODO: throw error
        }

        if (shouldSendReport(siteData, reportDef)) {
            var options = createWixBIOptions(siteData, reportDef, params);
            bi.wixBI.report(siteData, options);
        }
    }

    function extractAccountParams(siteData, accountType) {
        var accountParams = [];
        var isPremium = siteData.isPremiumDomain();

        switch (accountType) {
            case 'googleAnalytics': {
                if (hasAccount(siteData, accountType)) {
                    accountParams.push(siteData.googleAnalytics);
                }
                break;
            }
            case 'facebookRemarketing': {
                if (hasAccount(siteData, accountType) && isPremium) {
                    accountParams.push(siteData.facebookRemarketing);
                }
                break;
            }
            case 'googleRemarketing': {
                if (hasAccount(siteData, accountType) && isPremium) {
                    accountParams.push(siteData.googleRemarketing);
                }
                break;
            }
            case 'yandexMetrika': {
                if (hasAccount(siteData, accountType) && isPremium) {
                    accountParams.push(siteData.yandexMetrika);
                }
                break;
            }
        }
        return accountParams;
    }

    function hasAccount(siteData, accountType) {
        return !_.isEmpty(siteData[accountType]);
    }

    function initFacebookRemarketingPixel(siteData) {
        if (!IS_PREVIEW && !shouldSuppressBI(siteData)) {
            bi.facebookRemarketing.initRemarketingPixel(siteData, extractAccountParams(siteData, 'facebookRemarketing'));
        }
    }

    function initGoogleRemarketingPixel(siteData) {
        if (!IS_PREVIEW && !shouldSuppressBI(siteData)) {
            bi.googleRemarketing.initRemarketingPixel(extractAccountParams(siteData, 'googleRemarketing'));
        }
    }

    function fireGoogleRemarketingPixel() {
        bi.googleRemarketing.fireRemarketingPixel();
    }

    function initYandexMetrika(siteData) {
        if (!IS_PREVIEW && !shouldSuppressBI(siteData)) {
            bi.yandexMetrika.initialize(extractAccountParams(siteData, 'yandexMetrika'));
        }
    }

    function reportYandexPageHit(url) {
        bi.yandexMetrika.reportPageHit(url);
    }

    /**
     *
     * @param {SiteData} siteData
     * @param {string} pageUrl
     */
    function reportPageEvent(siteData, pageUrl) {
        if (siteData && _.isString(pageUrl) && !IS_PREVIEW && !shouldSuppressBI(siteData)) {
            bi.googleAnalytics.reportPageEvent(siteData, pageUrl, extractAccountParams(siteData, 'googleAnalytics'));
        }
    }

    //noinspection JSUnusedLocalSymbols
	function reportGoogleAnalytics(siteData) {
		if (!IS_PREVIEW) {
			var accountIds = extractAccountParams(siteData, 'googleAnalytics');
			bi.googleAnalytics.report.apply(null, [accountIds].concat(_.rest(arguments)));
		}
	}

    function register(packageName, reportType, reportDefCollection){
        _.forOwn(reportDefCollection, function(reportDef){
            reportDef.packageName = packageName;
        });
    }

    return {
        reportBI: reportBI,
	    reportGoogleAnalytics: reportGoogleAnalytics,
        reportPageEvent: reportPageEvent,
        register: register,
        reportBeatEvent: beat.reportBeatEvent,
        initFacebookRemarketingPixel: initFacebookRemarketingPixel,
        initGoogleRemarketingPixel: initGoogleRemarketingPixel,
        fireGoogleRemarketingPixel: fireGoogleRemarketingPixel,
        initYandexMetrika: initYandexMetrika,
        reportYandexPageHit: reportYandexPageHit,
        shouldSendReport: shouldSendReport
    };

});

/**
 * Legend for properties:
 * severity: ['minor', 'major', 'critical']
 *
 */

/**
 * @typedef {{
 *      severity: string,
 *      errorCode: number,
 *      eventId: [number],
 *      src: [string],
 *      sampleRatio: [number],
 *      callLimit: [number],
 *      params: [{p1: [string], p2: [string], p3: [string], p4: [string]}]
 *      }} biError
 */

/**
 * @typedef {{
 *      eventId: number,
 *      src: string
 *      sampleRatio: [number],
 *      callLimit: [number],
 *      params: string[]
 *      }} biEvent
 */
