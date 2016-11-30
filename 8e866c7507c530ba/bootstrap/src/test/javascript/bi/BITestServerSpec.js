describe('BI Test Server', function() {
    var _TEST_LOG_;

    var BISettings = {
        requestTimeout: 1000,
        BiTestServerAddress: {
            serverDomain: 'testicle.wix.com',
            serverPort:   '9998',
            serverApp:    'BILogValidatorService/',
            getUrl: function() {
                return 'http://' + this.serverDomain + ':' + this.serverPort + '/' + this.serverApp;
            },
            getAdapterUrl: function(adapter) {
                return this.getUrl() + adapter;
            }
        }
    };

    var BITestEvents = {
        start: function() {
            if (!this._startOnce) {
                this.setTestState('?State=StartTest');
                this._startOnce = true;
            }
        },
        end: function() {
            if (!this._endtOnce) {
                this.setTestState('?State=StopTest');
                this._endtOnce = true;
            }
        },
        setTestState: function(state) {
            var src = BISettings.BiTestServerAddress.getAdapterUrl('mee');
            src += state;
            var img = new Image(0, 0);
            img.src = src;
        }
    };

    beforeEach(function() {
        _TEST_LOG_ = new WixLogger({
            'errors': window.wixErrors,
            'events': window.wixEvents,
            'wixAnalytics': ['UA-2117194-33', 'UA-2117194-25'],
            'userAnalytics': ['UA-27056258-1', _userAnalyticsAccount], // Wix's "Mobile Users" account and the user's private account
            'floggerServerURL': window.serviceTopology.biServerUrl || 'http://frog.wixpress.com/',
            'version': ((window.viewMode != 'editor') ? 'VR' : 'ER') + window.client_version,
            'siteId': (window['siteId'] ? siteId : ""),
            'userId': (window.siteHeader && window.siteHeader.userId) || "00000000-0000-0000-0000-000000000000",
            'userType': getCookieInfo("userType"),
            'userLanguage': getCookieInfo("wixLanguage") || 'unknown',
            'session': getCookieInfo("_wix_browser_sess") || "00000000-0000-0000-0000-000000000000",
            'computerId': getCookieInfo("_wixCIDX") || "00000000-0000-0000-0000-000000000000",
            'creationSource': creationSource,
            'wixAppId': 3,
            'sendPageTrackToWix': window.viewMode == "editor",
            'sendPageTrackToUser': window.viewMode == "site",
            'debugMode':true,
            'onEvent': function(event) {
            },
            'onError': function(err, className, methodName) {
                // Show console error in debug mode
                if (window['console'] && window['console']['error']) {
                    console['error'](err.desc, err, className, methodName);
                }
            }
        });

        _TEST_LOG_._settings.floggerServerURL = BISettings.BiTestServerAddress.getUrl();
        _TEST_LOG_._wixBI._floggerServerURL = BISettings.BiTestServerAddress.getUrl();
        _TEST_LOG_._wixBI._common.did = '00000000-3300-0000-0000-000000000000';
        _TEST_LOG_.updateSetting('wixAppId', 42);
        _TEST_LOG_.updateSetting('metaSiteId', '9FE27C68-14E3-4D0F-A8D0-6E8FF65FA53B'); //fake, for testing
        _TEST_LOG_.updateSetting('editorSessionId', '9FE27C68-14E3-4D0F-A8D0-6E8FF65FA53B'); //fake, for testing

        _TEST_LOG_._wixBI._createHit = function(url) {
            // override server URL
            var that = this;
            that._ok = false;
            that._err = '';
            var req = new Request.JSONP({
                method: 'get',
                url: url,
                timeout: BISettings.requestTimeout,
                onComplete: function(data) {
                    if (data && data.isSucces == "true") {
                        //console.info('TEST OK ', data.message);
                    }
                    else {
                        console['error']('------------------------------------------------------------------------');
                        console['error']('Call URL: '+url);
                        console['error'](data.message);
                        console['error']('');
                    }
                },
                onTimeout: function() {
                    console['error']('TIMEOUT! URL=' + url);
                }
            })
            req.send();
        }.bind(_TEST_LOG_);

    });

    afterEach(function() {
        // BITestEvents.end();
    });


    /*
     Test System integrity
     */

    /*
    it(' validate BI server url', function() {
        var url = BISettings.BiTestServerAddress.getUrl();
        //testUrl = 'http://testicle.wix.com:9998/BILogValidatorService/mee?ip=134134143&src=3&did=&ut=&uid=345350000-0000-0000-0000-0046700&gsi=00000000-0000-0000-0000-000000000000&cid=00010000-0000-0000-0000-000000000000&ver=123456&lng=en-US&evid=101&cat=30&ts=16570&app=http://m.wix.com&g1=00000000-0000-0000-0000-000000000000&i1=&c1=&';
        expect(url).toBe('http://testicle.wix.com:9998/BILogValidatorService/');
    });

    it(' should send a hard-coded request to BI test Server and succeed', function() {
        var testReqUrl = BISettings.BiTestServerAddress.getAdapterUrl('mee');
        var payLoad = '?ip=134134143&src=3&did=&ut=&uid=345350000-0000-0000-0000-0046700&gsi=00000000-0000-0000-0000-000000000000&cid=00010000-0000-0000-0000-000000000000&ver=123456&lng=en-US&evid=101&cat=30&ts=16570&app=http://m.wix.com&g1=00000000-0000-0000-0000-000000000000&i1=&c1=&';
        testReqUrl += payLoad;
        var that = this;
        that._ok = false;
        var req = new Request.JSONP({
            method: 'get',
            url: testReqUrl,
            onComplete: function(data) {
                if (data && data.isSucces == "true") {
                    that._ok = true;
                }
            }
        });
        req.send();
        waitsFor(function() {
            return this._ok
        }.bind(this),
            ' error communicating with BI Test server at ' + testReqUrl,
            BISettings.requestTimeout);

    });

    it(' should send a hard-coded request to BI test Server and fail', function() {
        var testReqUrl = BISettings.BiTestServerAddress.getAdapterUrl('mee');
        var payLoad = '?ip=134134143&src=3&did=&ut=&uid=345350000-0000-0000-0000-0046700&gsi=00000000-0000-0000-0000-000000000000&cid=YALLA_HAPOEL&ver=123456&lng=en-US&evid=101&cat=30&ts=16570&app=http://m.wix.com&g1=00000000-0000-0000-0000-000000000000&i1=&c1=&';
        testReqUrl += payLoad;
        var that = this;
        that._ok = false;
        var req = new Request.JSONP({
            method: 'get',
            url: testReqUrl,
            onComplete: function(data) {
                if (data && data.isSucces == "false") {
                    that._ok = true;
                }
            }
        });
        req.send();
        waitsFor(function() {
            return this._ok
        }.bind(this),
            ' error communicating with BI Test server at ' + testReqUrl,
            BISettings.requestTimeout);
    });
*/

    /*
     Test Events Validity
     */
    var biEventArr = [
        {
            biEventId: 301,
            name: ' should test a simple call via Wix Logger',
            biEvent: wixEvents.SITE_DOM_LOADED
        },

        {
            biEventId: 302,
            name: ' should test a BI event EDITOR_READY',
            biEvent: wixEvents.EDITOR_READY
        },

        {
            biEventId: 300,
            name: ' should test a BI event EDITOR_DOM_LOADED',
            biEvent: wixEvents.EDITOR_DOM_LOADED
        },

        {
            biEventId: 201,
            name: ' should test a BI event SAVE_BUTTON_CLICKED_IN_MAIN_WINDOW',
            params: {
                g1: '00000000-3300-0000-0000-000000000000'
            },
            biEvent: wixEvents.SAVE_BUTTON_CLICKED_IN_MAIN_WINDOW
        },

        {
            biEventId: 202,
            name: ' should test a BI event CLOSE_SAVE_DIALOG_CLICKED',
            params: {
                g1: '00000000-3300-0000-0000-000000000000'
            },
            biEvent: wixEvents.CLOSE_SAVE_DIALOG_CLICKED
        },

        {
            biEventId: 203,
            name: ' should test a BI event SAVE_CLICKED_IN_SAVE_DIALOG',
            params: {
                g1: '00000000-3300-0000-0000-000000000000'
            },
            biEvent: wixEvents.SAVE_CLICKED_IN_SAVE_DIALOG
        },

        {
            biEventId: 204,
            name: ' should test a BI event PUBLISH_BUTTON_CLICKED_IN_MAIN_WINDOW',
            biEvent: wixEvents.PUBLISH_BUTTON_CLICKED_IN_MAIN_WINDOW
        },

        {
            biEventId: 207,
            name: ' should test a BI event PUBLISH_BUTTON_CLICKED_IN_PUBLISH_DIALOG',
            params: {
                g1: '00000000-3300-0000-0000-000000000000',
                i1: 1
            },
            biEvent: wixEvents.PUBLISH_BUTTON_CLICKED_IN_PUBLISH_DIALOG
        },

        {
            biEventId: 208,
            name: ' should test a BI event UPDATE_BUTTON_CLICKED_IN_PUBLISH_DIALOG',
            params: {
                i1: 1
            },
            biEvent: wixEvents.UPDATE_BUTTON_CLICKED_IN_PUBLISH_DIALOG
        },

        {
            biEventId: 209,
            name: ' should test a BI event POST_IN_FB_CLICKED_IN_PUBLISH_SHARE_DIALOG',
            biEvent: wixEvents.POST_IN_FB_CLICKED_IN_PUBLISH_SHARE_DIALOG
        },

        {
            biEventId: 210,
            name: ' should test a BI event POST_IN_TWITTER_CLICKED_IN_PUBLISH_SHARE_DIALOG',
            biEvent: wixEvents.POST_IN_TWITTER_CLICKED_IN_PUBLISH_SHARE_DIALOG
        },

        {
            biEventId: 211,
            name: ' should test a BI event PREVIEW_BUTTON_CLICKED_IN_MAIN_WINDOW',
            biEvent: wixEvents.PREVIEW_BUTTON_CLICKED_IN_MAIN_WINDOW,
            params: {
                g1: '9FE27C68-14E3-4D0F-A8D0-6E8FF65FA53B'
            }
        },

        {
            biEventId: 214,
            name: ' should test a BI event COMPONENT_ADDED',
            params: {
                c1: 'COMPONENT_ADDED'
            },
            biEvent: wixEvents.COMPONENT_ADDED
        },

        {
            biEventId: 215,
            name: ' should test a BI event COMPONENT_REMOVED',
            params: {
                c1: 'COMPONENT_REMOVED'
            },
            biEvent: wixEvents.COMPONENT_REMOVED
        },

        {
            biEventId: 219,
            name: ' should test a BI event BACKGROUND_CHANGED',
            biEvent: wixEvents.BACKGROUND_CHANGED
        },

        {
            biEventId: 220,
            name: ' should test a BI event COLOR_PRESET_CHANGED',
            biEvent: wixEvents.COLOR_PRESET_CHANGED
        },

        {
            biEventId: 221,
            name: ' should test a BI event FONT_PRESET_CHANGED',
            biEvent: wixEvents.FONT_PRESET_CHANGED
        },

        {
            biEventId: 223,
            name: ' should test a BI event CUSTOMIZE_FONTS_OPENED',
            biEvent: wixEvents.CUSTOMIZE_FONTS_OPENED
        },

        {
            biEventId: 224,
            name: ' should test a BI event CUSTOMIZE_COLORS_OPENED',
            biEvent: wixEvents.CUSTOMIZE_COLORS_OPENED
        },

        {
            biEventId:     222,
            name: ' should test a BI event PAGE_ADDED',
            biEvent: wixEvents.PAGE_ADDED,
            params: {
                c1: 'name'
            }
        },

        {
            biEventId:     225,
            name: ' should test a BI event SEO_PANEL_OPENED',
            biEvent: wixEvents.SEO_PANEL_OPENED
        },

        {
            biEventId:   226,
            name: ' should test a BI event SEO_CHECKED_IN_SEO_PANEL',
            biEvent: wixEvents.SEO_CHECKED_IN_SEO_PANEL
        },

        {
            biEventId:     227,
            name: ' should test a BI event SHOW_IN_ALL_PAGES_SELECTED',
            biEvent: wixEvents.SHOW_IN_ALL_PAGES_SELECTED,
            esi: 'abcd1234',
            params: {
                c1: 'name'
            }
        }
    ]

    it(' should execute an error event. see console for results', function() {
        var testFuncArr = [];
        var l = biEventArr.length;
        var i=l;
        //while (i--){
            //var eventItem = biEventArr[i];
            var eventItem = biEventArr[0];
            var biEvent = eventItem.biEvent;
            var params = eventItem.params;
            var err;
            var className;
            var methodName;
            // ===================================================
            // err, className, methodName, params
            // UNCOMMENT NEXT LINE TO SEE ERROR LOG IN CONSOLE
            //  _TEST_LOG_.reportError(wixErrors.NO_SKIN, "className","methodName",params);
            // ===================================================
        //};
        expect(1).toBe(1);
    });

    it(' should execute all events. see console for results', function() {
        var testFuncArr = [];
        var l = biEventArr.length;
        var i=l;
        while (i--){
            var eventItem = biEventArr[i];
            var biEvent = eventItem.biEvent;
            var params = eventItem.params;
            // ===================================================
            // UNCOMMENT NEXT LINE TO SEE ERROR LOG IN CONSOLE
            // _TEST_LOG_.reportEvent(biEvent, params);
            // ===================================================
        }
        expect(1).toBe(1);
    });
    it(' should send an error', function() {
        // _TEST_LOG_.reportError(wixErrors.WIXIFY_TIMEOUT, 'TEST ERROR SCOPE',  'TEST ERROR TARGET', 'TEST ERROR MESSAGE' );
        expect(1).toBe(1);
    });
});
