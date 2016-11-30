define(['lodash', 'coreUtils'], function (_, coreUtils) {
	'use strict';

	var DELAY = 200;

	function loadGoogleAnalyticsDCScript(pageUrl, accountIds, wixAnalyticsData) {
		if (window._gaq) {
			reportPageEvent();
		} else {
			requirejs(['https://stats.g.doubleclick.net/dc.js'], reportPageEvent, _.noop);
		}

		function reportPageEvent() {
			var _gaq = window._gaq || [];
			window._gaq = _gaq;

			_.forEach(accountIds, function (accountId, index) {
				var trackerId = (index === 0) ? '' : 't' + index + '.';

				_gaq.push([trackerId + '_setAccount', accountId], [trackerId + '_setAllowAnchor', true]);

				// additional data for Wix Analytics
				if (wixAnalyticsData) {
					_gaq.push([trackerId + '_setCustomVar', 1, 'version', wixAnalyticsData.ver, 1],
						[trackerId + '_setCustomVar', 2, 'language', wixAnalyticsData.lng, 1],
						[trackerId + '_setCustomVar', 3, 'userType', wixAnalyticsData.userType, 1]);
				}

				_gaq.push([trackerId + '_trackPageview', pageUrl]);
			});
		}
	}

	function runGoogleAnalyticsUniversalScript(accountIds, callback) {
		if (_.isEmpty(accountIds)) {
		    return;
		}

		if (window.ga) {
			callback();
		} else {
			/**
			 * More info at:
			 * https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications
			 */
			requirejs(['//www.google-analytics.com/analytics.js'], function () {
				window.ga = window.ga || function () {
						(window.ga.q = window.ga.q || []).push(arguments);
					};
				window.ga.l = _.now();

				window.ga.q = window.ga.q || [];

				_.forEach(accountIds, function (accountId) {
					window.ga('create', accountId, 'auto');
				});

				callback();
			}, _.noop);
		}
	}

	return {
		/**
		 * Report an event with google analytics, with the universal.js for slash urls, and doubleClick for hashBang urls
		 * @param {SiteData} siteData
		 * @param {string} pagePath
		 * @param {string[]} accountIds
		 * @param {object} [wixAnalyticsData]
		 */
		reportPageEvent: function (siteData, pagePath, accountIds, wixAnalyticsData) {
			if (typeof window !== 'undefined') {
				setTimeout(function () {
					if (siteData.isUsingUrlFormat(coreUtils.siteConstants.URL_FORMATS.SLASH)) {
						runGoogleAnalyticsUniversalScript(accountIds, function () {
							window.ga('send', 'pageview', {page: pagePath});
						});
					} else {
						loadGoogleAnalyticsDCScript(pagePath, accountIds, wixAnalyticsData);
					}
				}, DELAY);
			}
		},

		report: function (accountIds) {
			var gaArgs = _.rest(arguments);
			runGoogleAnalyticsUniversalScript(accountIds, function () {
				window.ga.apply(window.ga, gaArgs);
			});
		}
	};
});
