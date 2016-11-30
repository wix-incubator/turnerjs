define(['lodash', 'loggingUtils/bi/services/googleAnalytics'], function(_, googleAnalytics) {
    'use strict';

    describe('GoogleAnalytics Tests', function() {

        var accountKey = '_setAccount';
        var allowAnchorKey = '_setAllowAnchor';
        var pageViewKey = '_trackPageview';

        function findGAItems(key) {
            return _.filter(window.ga.q, 0, key);
        }

	    var originalGA;
        beforeEach(function() {
	        originalGA = window.ga;
            window.ga = jasmine.createSpy('ga');

            window.ga.q = [];
        });

	    afterEach(function () {
		    if (originalGA) {
		        window.ga = originalGA;
		    } else {
			    delete window.ga;
		    }
	    });

        describe('Initialization', function() {

            it('Should have analytics script on the document', function() {
                var script = window.document.querySelectorAll('script[src=\"' + window.document.location.protocol + '//www.google-analytics.com/analytics.js\"]');

                expect(script).toBeDefined();
            });
        });

        xdescribe('reportPageEvent function', function() {

            var pageUrl = "http://wix.com";

            describe('Single account', function() {

                var accountIds = ['007-ACCOUNT-700'];

                it('Should have 3 items in gaq stack', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    expect(window.ga.q.length).toEqual(3);
                });

                it('track account id', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var accountItem = findGAItems(accountKey)[0];
                    expect(accountItem[1]).toEqual(accountIds[0]);
                });

                it('track allowAnchor', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var anchorItem = findGAItems(allowAnchorKey)[0];
                    expect(anchorItem[1]).toEqual(true);
                });

                it('track page view', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var pageViewItem = findGAItems(pageViewKey)[0];
                    expect(pageViewItem[1]).toEqual(pageUrl);
                });
            });

            describe('Multiple accounts', function() {
                var accountIds = ['007-ACCOUNT-700', 'AC1-30AC1-30'];

                it('Should have 6 items (3 per account)', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    expect(window.ga.q.length).toEqual(6);
                });

                it('track account id', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var firstAccountItem = findGAItems(accountKey)[0];
                    expect(firstAccountItem[1]).toEqual(accountIds[0]);

                    var secondAccountItem = findGAItems("t1." + accountKey)[0];
                    expect(secondAccountItem[1]).toEqual(accountIds[1]);
                });

                it('track allowAnchor', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var firstAnchorItem = findGAItems(allowAnchorKey)[0];
                    var secondAnchorItem = findGAItems("t1." + allowAnchorKey)[0];
                    expect(firstAnchorItem[1] && secondAnchorItem[1]).toBe(true);
                });

                it('track page view', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var firstPageViewItem = findGAItems(pageViewKey)[0];
                    expect(firstPageViewItem[1]).toEqual(pageUrl);

                    var secondPageViewItem = findGAItems("t1." + pageViewKey)[0];
                    expect(secondPageViewItem[1]).toEqual(pageUrl);

                });
            });

            describe('report with wixAnalyticsData', function() {
                var accountIds = ['007-ACCOUNT-700'];
                var wixAnalyticsData = {
                    ver: 'someVer',
                    lng: 'en-US',
                    userType: 'wixUser'
                };
                var customVarKey = '_setCustomVar';

                function findCustomItem(items, type) {
                    return _.find(items, function(item) {
                        return _.includes(item, type);
                    });
                }

                it('Should report version to wix', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds, wixAnalyticsData);

                    var customItems = findGAItems(customVarKey);
                    var versionItem = findCustomItem(customItems, "version");
                    expect(versionItem).toContain(wixAnalyticsData.ver);
                });

                it('Should report user language to wix', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds, wixAnalyticsData);

                    var customItems = findGAItems(customVarKey);
                    var versionItem = findCustomItem(customItems, "language");
                    expect(versionItem).toContain(wixAnalyticsData.lng);
                });

                it('Should report user type to wix', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds, wixAnalyticsData);

                    var customItems = findGAItems(customVarKey);
                    var versionItem = findCustomItem(customItems, "userType");
                    expect(versionItem).toContain(wixAnalyticsData.userType);
                });

                it('Should not report to wix if there no wixAnalyticsData is passed as argument', function() {
                    googleAnalytics.reportPageEvent(pageUrl, accountIds);

                    var customItems = findGAItems(customVarKey);
                    expect(customItems).toEqual([]);
                });
            });

        });

	    describe('report', function () {
		    it('should pass the arguments to window.ga when it exists', function () {
			    googleAnalytics.report(['UA-test123-11'], 'send', 'event', 'button', 'click');
			    expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', 'click');
		    });
	    });
    });
});
