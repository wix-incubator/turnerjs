describe("UserCookies", function() {
   beforeEach(function(){
       // Initiate a new logger
       this.logger = new WixLogger({
           'errors': this.errorsMap,
           'events': this.eventsMap,
           'wixAnalytics': [],
           'userAnalytics': "",
           'floggerServerURL': 'http://someAddress.com',
           'version': 'UNITEST_VERSION',
           'siteId': '',
           'userId': '00000000-0000-0000-0000-000000000000',
           'userType': '',
           'userLanguage': 'unknown',
           'session': '00000000-0000-0000-0000-000000000000',
           'computerId': getCookieInfo("_wixCIDX") || "00000000-0000-0000-0000-000000000000",
           'creationSource': creationSource,
           'wixAppId': 3, /* 3 for Wix Mobile */
           'onEvent': function() {},
           'onError': function() {}
       });
       spyOn(this.logger._wixBI, 'sendEvent');
       spyOn(this.logger._wixBI, 'sendError');
   });

    describe('Check UserCookies module', function(){
        beforeEach(function(){
            this.expectedGUID = "FAKE_GENERATED_COOKIE_GUID";

            //if there are already user cookies here, let's save them, so we can play with them and then return them to what they were before our tests
            this.prevPersistentCookie = W.bi.wixUserCookies.getUserPersistentGUID();
            this.prevSessionCookie = W.Utils.cookies.readCookie(W.bi.wixUserCookies.SESSION_COOKIE);
        });
        afterEach(function(){
            //return the persistent user cookie to what they were
            if (this.prevPersistentCookie) {
                W.Utils.cookies.createCookie(W.bi.wixUserCookies.PERSISTENT_COOKIE, this.prevPersistentCookie, false);
            }
            else {
                W.Utils.cookies.deleteCookie(W.bi.wixUserCookies.PERSISTENT_COOKIE);
            }
            if (this.prevSessionCookie) {
                W.Utils.cookies.createCookie(W.bi.wixUserCookies.SESSION_COOKIE, this.prevSessionCookie, false);
            }
            else {
                W.Utils.cookies.deleteCookie(W.bi.wixUserCookies.SESSION_COOKIE);
            }
        });

        it('PERSISTENT_COOKIE should be the fake test cookie, after deleting cookies and running init with rigged getGUID function', function(){
            W.Utils.cookies.deleteCookie(W.bi.wixUserCookies.PERSISTENT_COOKIE);
            spyOn(W.bi.wixUserCookies, 'generateGUID').andReturn(this.expectedGUID);
            W.bi.wixUserCookies.init();
            expect(W.Utils.cookies.readCookie(W.bi.wixUserCookies.PERSISTENT_COOKIE)).toBe(this.expectedGUID);
        });
        it('SESSION_COOKIE should be the fake test cookie, after deleting cookies and running init with rigged getGUID function', function(){
            W.Utils.cookies.deleteCookie(W.bi.wixUserCookies.SESSION_COOKIE);
            spyOn(W.bi.wixUserCookies, 'generateGUID').andReturn(this.expectedGUID);
            W.bi.wixUserCookies.init();
            expect(W.Utils.cookies.readCookie(W.bi.wixUserCookies.SESSION_COOKIE)).toBe(this.expectedGUID);
        });
    });
});