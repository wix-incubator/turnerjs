/**
 * Created with IntelliJ IDEA.
 * User: baraki
 * Date: 5/28/12
 * Time: 10:56 AM
 * To change this template use File | Settings | File Templates.
 */



define.utils('analytics:this', function(){
    return ({

        _sendURLtoGoogleAnalytics:function (pageTracker, fakeUrl) {
            pageTracker._trackPageview(fakeUrl);
        },

        _getGoogleAnalyticsTracker:function (wixMobileGoogleAnalytics) {
            if (!window['_gat']){
                // TODO replace this with queue
                return;
            }
            pageTracker = _gat._getTracker(wixMobileGoogleAnalytics);
            pageTracker._initData();
            return pageTracker;
        },

        reportSiteAnalytics:function (action, params) {
            var wixMobileGoogleAnalytics = "UA-2117194-25"; // m.wix  - access to users' sites
            var reporter = "site";
            var fakeURL = reporter + "/" + action;
            if (params){
                fakeURL = fakeURL + "/" + params;
            }

            this.sendToGoogleAnalytics(fakeURL, wixMobileGoogleAnalytics);
        },

        reportEditorAnalytics: function(action, params) {
            var wixMobileGoogleAnalytics = "UA-2117194-23"; // all editor activities
            var reporter = "editor";
            var fakeURL = reporter + "/" + action;
            if (params){
                fakeURL = fakeURL + "/" + params;
            }

            if (window['siteHeader']) {
                if (window['siteHeader'].username){
                    fakeURL = fakeURL + '/' + siteHeader.username;
                }
                if (window['siteHeader'].siteName){
                    fakeURL = fakeURL + '/' + siteHeader.siteName;
                }
            }

            this.sendToGoogleAnalytics(fakeURL, wixMobileGoogleAnalytics);
        },
        // TODO support errors
        sendToGoogleAnalytics:function (fakeURL, wixMobileGoogleAnalytics) {

            try {
                if (window['_gat']) {
                    var gaTracker = this._getGoogleAnalyticsTracker(wixMobileGoogleAnalytics);
                    this._sendURLtoGoogleAnalytics(gaTracker, fakeURL, wixMobileGoogleAnalytics);
                    return;
                }
                var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
                var script = new Element('script', {
                    id:"googleAnalyticsScript"
                });
                var s = document.getElementsByTagName('script')[0];
                script.type = 'text/javascript';
                s.parentNode.insertBefore(script, s);
                script.src = gaJsHost + 'google-analytics.com/ga.js';

                this.gaCheck(fakeURL, wixMobileGoogleAnalytics);
            } catch (e) {

            }
        },

        gaCheck:function (fakeURL, wixMobileGoogleAnalytics) {

            try {
                if (window['_gat']) {
                    var gaTracker = this._getGoogleAnalyticsTracker(wixMobileGoogleAnalytics);
                    this._sendURLtoGoogleAnalytics(gaTracker, fakeURL);
                } else {
                    setTimeout(this.gaCheck.bind(this, fakeURL, wixMobileGoogleAnalytics), 1000);
                }
            } catch (e) {
            }
        }


    });
});

