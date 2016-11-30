describe("Testing SiteMemberManager", function() {

    testRequire()
        .classes('wysiwyg.viewer.managers.SiteMembersManager')
        .resources("W.Viewer", "W.Config");

    beforeEach(function(){
        this.siteMemberManager = new this.SiteMembersManager() ;
    });

    describe("SiteMember Manager, reset password feature tests", function() {
        it("should confirm URL containing a Password Request parameter when passed.", function(){
            var urlSearchPartWithReset = "?abcd=18374&" + this.siteMemberManager.RESET_PASSWORD_KEY_PARAMETER + "=4747176&param=xyz" ;
            var urlSearchPartWithoutReset = "?abcd=18374&param1=4747176&param2=xyz" ;

            var isFound = this.siteMemberManager._isResetPasswordRequested(urlSearchPartWithReset) ;
            var isNotFound = this.siteMemberManager._isResetPasswordRequested(urlSearchPartWithoutReset) ;

            expect(isFound).toBeTruthy() ;
            expect(isNotFound).toBeFalsy() ;
        }) ;

        it("should not open the Reset Password dialog when not in the viewer.", function(){
            var key = "theSecretPasswordResetKey123" ;
            var searchUrl = "p1=123&" + this.siteMemberManager.RESET_PASSWORD_KEY_PARAMETER + "=" + key + "&p2=999";
            spyOn(this.siteMemberManager, "_isViewerMode").andReturn(false) ;
            spyOn(this.siteMemberManager, "_getCurrentSearchURL").andReturn(searchUrl) ;
            spyOn(W.SiteMembers, 'openSiteMembersPopup') ;

            this.siteMemberManager._showPasswordResetIfNeeded() ;
            expect(W.SiteMembers.openSiteMembersPopup).not.toHaveBeenCalled() ;
        }) ;

        it("should open the Reset Password dialog in the viewer.", function(){
            var key = "theSecretPasswordResetKey123" ;
            var searchUrl = "p1=123&" + this.siteMemberManager.RESET_PASSWORD_KEY_PARAMETER + "=" + key + "&p2=999";
            spyOn(this.siteMemberManager, "_isViewerMode").andReturn(true) ;
            spyOn(this.siteMemberManager, "_getCurrentSearchURL").andReturn(searchUrl) ;
            spyOn(W.SiteMembers, 'openSiteMembersPopup') ;

            this.siteMemberManager._showPasswordResetIfNeeded() ;

            expect(W.SiteMembers.openSiteMembersPopup).toHaveBeenCalled() ;
        }) ;

        it("should pass the reset password key to the reset password dialog to use.", function(){
            var key = "theSecretPasswordResetKey123" ;
            var searchUrl = "p1=123&" + this.siteMemberManager.RESET_PASSWORD_KEY_PARAMETER + "=" + key + "&p2=999";
            spyOn(this.siteMemberManager, "_isViewerMode").andReturn(true) ;
            spyOn(this.siteMemberManager, "_getCurrentSearchURL").andReturn(searchUrl) ;
            spyOn(W.SiteMembers, 'openSiteMembersPopup') ;

            this.siteMemberManager._showPasswordResetIfNeeded() ;

            expect(W.SiteMembers.openSiteMembersPopup).toHaveBeenCalledWith({
                intent: "RESETPASSWORD",
                disableCancel: true,
                resetPassKey: key
            }) ;
        });

        it("should Encode the return URL when asking(sending email) for a new password.", function() {
            var nonEncodedUrl = "http://user887.wix-server.wixpress.com/site-name#!page-name/randomCode?param1=value1&param2=value2" ;
            spyOn(this.siteMemberManager, "_getLocationUrl").andReturn(nonEncodedUrl) ;

            var encodedUrl = this.siteMemberManager._getReturnUrl() ;

            expect(encodedUrl.contains("#")).toBeFalsy() ;
            expect(encodedUrl.contains("?")).toBeFalsy() ;
            expect(encodedUrl.contains("/")).toBeFalsy() ;
        })
    }) ;

    describe('User access limitations', function() {

        testRequire()
            .classes('wysiwyg.viewer.managers.SiteMembersManager')
            .resources("W.Viewer", "W.Utils", "W.MessagesController");

        beforeEach(function(){
            jasmine.Clock.useMock();
            this.siteMemberManager              = new this.SiteMembersManager() ;
            this.siteMemberManager._apiReady    = true ;
            this.siteMemberManager._api         = {logout: function(){}, isSessionValid: function(){return true;}} ;
        });

        it("Should retry to logout the user several times before displaying a 'Retry' dialog", function() {
            spyOn(W.MessagesController, "showTryAgainMessage") ;
            spyOn(this.siteMemberManager, "_isOwnerLoggedIn").andReturn(false) ;
            var timeToWait = this.siteMemberManager.MAX_NUMBER_OF_RETRIES * this.siteMemberManager.DELAY_OF_RETRY_IN_MS ;
            var $this = this ;

            $this.siteMemberManager.logout() ;

            jasmine.Clock.tick(timeToWait) ;

            waitsFor(function() {
                return $this.siteMemberManager._retries === $this.siteMemberManager.MAX_NUMBER_OF_RETRIES ;
            }, timeToWait) ;

            runs(function() {
                expect(W.MessagesController.showTryAgainMessage).toHaveBeenCalled() ;
                expect($this.siteMemberManager._retries).toBe($this.siteMemberManager.MAX_NUMBER_OF_RETRIES) ;
            }) ;
        }) ;
    }) ;


    describe('SiteMemberManager Site Owner Logout Action', function() {

        testRequire()
            .classes('wysiwyg.viewer.managers.SiteMembersManager')
            .resources("W.Viewer");

        beforeEach(function(){
            this.siteMemberManager = new this.SiteMembersManager() ;
        });

        describe("SiteMember Manager, site owner logout action.", function() {
            it("should give the owner a message, that they should logout from Wix first, otherwise they will remain logged in.", function() {
                spyOn(this.siteMemberManager, "_isOwnerLoggedIn").andReturn(true) ;
                spyOn(this.siteMemberManager, "_logoutSiteMember") ;
                spyOn(this.siteMemberManager, "_informSiteOwnerToLogout") ;

                this.siteMemberManager.logout() ;

                expect(this.siteMemberManager._logoutSiteMember).not.toHaveBeenCalled() ;
                expect(this.siteMemberManager._informSiteOwnerToLogout).toHaveBeenCalled() ;
            }) ;

            it("should return true if the current member is also the site owner.", function() {
                var isTheMemberAlsoSiteOwner = true ;
                spyOn(this.siteMemberManager, "getMemberDetails").andCallFake(function(onSuccess, onFail) {
                    onSuccess({'owner': isTheMemberAlsoSiteOwner}) ;
                }) ;

                var isSiteOwner = this.siteMemberManager._isSiteBelongToUser() ;

                expect(isSiteOwner).toBeTruthy() ;
            }) ;

            it("should return false if the current member is not the site owner.", function() {
                var isTheMemberAlsoSiteOwner = false ;
                spyOn(this.siteMemberManager, "getMemberDetails").andCallFake(function(onSuccess, onFail) {
                    onSuccess({'owner': isTheMemberAlsoSiteOwner}) ;
                }) ;

                var isSiteOwner = this.siteMemberManager._isSiteBelongToUser() ;

                expect(isSiteOwner).toBeFalsy() ;
            }) ;

            it("should return false if the current member is not loaded properly.", function() {
                spyOn(this.siteMemberManager, "getMemberDetails").andCallFake(function(onSuccess, onFail) {
                    onFail({'exception': 'something bad happened.'}) ;
                }) ;

                var isSiteOwner = this.siteMemberManager._isSiteBelongToUser() ;

                expect(isSiteOwner).toBeFalsy() ;
            }) ;
        }) ;
    }) ;

    describe("Test suite for the SvSession fix of SiteMembersManager", function() {

        var email, password, onSuccess, onError, initiator, svSession ;

        beforeEach(function(){
            email = "email@wix.com" ;
            password = "secret" ;
            onSuccess = function() {} ;
            onError = function() {} ;
            initiator = "initiator-123" ;
            svSession = "svSession-456" ;

            var api = {
                register: function(email, password, onSuccess, onError, initiator, svSession) {},
                login: function(email, password, rememberMe, onSuccess, onError, initiator, svSession) {},
                apply: function(email, password, onSuccess, onError, svSession) {}
            } ;
            this.siteMemberManager = new this.SiteMembersManager() ;
            this.siteMemberManager._api = api ;

            spyOn(this.W.Config, "getSvSession").andReturn(svSession);
        });

        it("Should pass SvSession to the SiteMembers API call when subscribing a new user.", function() {
            this.siteMemberManager._apiReady = true ;
            spyOn(this.siteMemberManager._api, "register").andReturn(null);

            this.siteMemberManager.register(email, password, onSuccess, onError, initiator) ;

            expect(this.siteMemberManager._api.register).toHaveBeenCalled() ;
            expect(this.siteMemberManager._api.register).toHaveBeenCalledWith(email, password, onSuccess, onError, initiator, svSession) ;
        }) ;

        it("Should pass SvSession to the SiteMembers API call when loging in a user.", function() {
            this.siteMemberManager._apiReady = true ;
            spyOn(this.siteMemberManager._api, "login").andReturn(null);

            this.siteMemberManager.login(email, password, true, onSuccess, onError, "initiator-123") ;

            expect(this.siteMemberManager._api.login).toHaveBeenCalled() ;
            expect(this.siteMemberManager._api.login).toHaveBeenCalledWith(email, password, true, onSuccess, onError, initiator, svSession) ;
        }) ;

        it("Should pass SvSession to the SiteMembers API call when approving a new user subscription.", function() {
            this.siteMemberManager._apiReady = true ;
            spyOn(this.siteMemberManager._api, "apply").andReturn(null);

            this.siteMemberManager.applyForMembership(email, password, onSuccess, onError) ;

            expect(this.siteMemberManager._api.apply).toHaveBeenCalled() ;
            expect(this.siteMemberManager._api.apply).toHaveBeenCalledWith(email, password, onSuccess, onError, svSession) ;
        }) ;
    }) ;
});

