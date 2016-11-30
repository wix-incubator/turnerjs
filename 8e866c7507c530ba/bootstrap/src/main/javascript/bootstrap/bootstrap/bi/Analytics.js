/**
 * @param defaultAccountIds
 * @param userAnalyticId
 * @param version
 * @param userType
 * @param userLanguage
 * @param sendPageTrackToUser
 * @param sendPageTrackToWix
 * @constructor
 */
var WixGoogleAnalytics = function(defaultAccountIds, userAnalyticId, version, userType, userLanguage, sendPageTrackToUser, sendPageTrackToWix) {
    this._wixAccounts = defaultAccountIds;
    this._userAccounts = userAnalyticId;
    this._version = version;
    this._userType = userType;
    this._userLanguage = userLanguage;
    this._sendPageTrackToUser = sendPageTrackToUser;
    this._sendPageTrackToWix = sendPageTrackToWix;

    // Create analytics if not available on page
    if(!window._gaq) {
        // Inject analytics script (http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html)
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    }
};

/**
 * Send event to google analytics
 * @param event
 * @param params
 */
WixGoogleAnalytics.prototype.sendEvent = function(event, params) {
    var category = wixLogLegend.getKey('type', event.type);
    var action = event.desc;
    var label = params.label || /* fallback to Wix BI */ ( (params.c1 ? "c1: " + params.c1 + "|" : "" ) + (params.g1 ? "g1: " + params.g1 + "|" : "" ) + (params.i1 ? "i1: " + params.i1 : "" ) );
    var value = params.value || params.time;
    this._sendAnalyticEvent(category, action, label, value);
};

/**
 * Send error to google analytics
 * @param err
 * @param className
 * @param methodName
 * @param params
 */
WixGoogleAnalytics.prototype.sendError = function(err, className, methodName, params) {
    var category = wixLogLegend.getKey('type', err.type);
    var action = err.desc;
    var label = className + '.' + methodName + ' : ' + params.label;
    var value = params.value || params.time;
    this._sendAnalyticEvent(category, action, label, value);
};

/**
 * Remove user ID from analytics to Wix Accounts
 * @param url
 */
//WixGoogleAnalytics.prototype.shortenUrlSiteId = function(url) {
//    return url.replace(/(.*)\/((!?.*\/))[^\?]*\?(.*)$/,"$1/$3?$4");
//};

/**
 * Send page view event to Google Analytics
 */
WixGoogleAnalytics.prototype.sendPageEvent = function(pageUrl) {
    window._gaq = window._gaq || [];

    var updateAnalyticsPageEvent = function(accountId, url, additionalData) {
        for(var i = 0; i < accountId.length; ++i) {
            if (accountId[i].length > 0) { // prevent reporting to empty google analytics ID strings
                // set trackerId prefix
                var trackerId = (i === 0) ? '' : 't' + i + '.';

                window._gaq.push([trackerId + '_setAccount', accountId[i]]);
                window._gaq.push([trackerId + '_setAllowAnchor', true]);

                // additional data for Wix Analytics
                if (additionalData) {
                    window._gaq.push([trackerId + '_setCustomVar', 1, 'version', this._version, 1]);
                    window._gaq.push([trackerId + '_setCustomVar', 2, 'language', this._userLanguage, 1]);
                    window._gaq.push([trackerId + '_setCustomVar', 3, 'userType', this._userType, 1]);
                }

                window._gaq.push([trackerId + '_trackPageview', url]);
            }
        }
    }.bind(this);

    if (this._sendPageTrackToUser) {
        updateAnalyticsPageEvent(this._userAccounts, pageUrl, false);
    } else if (this._sendPageTrackToWix) {
        updateAnalyticsPageEvent(this._wixAccounts, pageUrl, true);
    }
};

WixGoogleAnalytics.prototype._sendAnalyticEvent = function(cat, act, label, value) {
    // Set defaults
    cat = cat || "";
    act = act || "";
    label = label || "";
    value = value || 0;

    // Analytic send function
    var sendEvent = function(trackerId, accountId, cat, act, label, value) {
        // Add events to analytics queue (http://code.google.com/apis/analytics/docs/tracking/asyncMigrationExamples.html)
        window._gaq = window._gaq || [];
        window._gaq.push([trackerId + '_setAccount', accountId]);
        window._gaq.push([trackerId + '_setCustomVar', 1, 'version', this._version, 1]);
        window._gaq.push([trackerId + '_setCustomVar', 2, 'language', this._userLanguage, 1]);
        window._gaq.push([trackerId + '_setCustomVar', 3, 'userType', this._userType, 1]);
        window._gaq.push([trackerId + '_trackEvent', cat, act, label, value]);
    };

	if (this._wixAccounts) {
		// Send default codes
		for(var i = 0; i < this._wixAccounts.length; ++i) {
			var trackerId = (i === 0) ? '' : 't' + i + '.';
			sendEvent(trackerId, this._wixAccounts[i], cat, act, label, value);
		}
	}

    // ToDo: send optional codes
};