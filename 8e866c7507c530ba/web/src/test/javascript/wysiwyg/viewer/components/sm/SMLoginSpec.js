describe("SMLogin ", function(){

    testRequire()
        .components('wysiwyg.viewer.components.sm.SMLogin','wysiwyg.viewer.components.sm.SMContainer')
        .resources('W.Data', 'W.SiteMembers', 'W.Utils');

    beforeEach(function(){
        var formContainer = new Element("div") ;
        this.smCont = new this.SMContainer("testId", new Element('div'),{dialogsLanguage:"en"});
        this.smLoginComp = new this.SMLogin("testId", new Element("div"), {container:this.smCont,formData: {enteredEmail: "zzz@yyy.com"}});
    });

    describe("SMLogin form forgot password flow", function() {

        it("should open the reset password request dialog, when clicking on the link.", function() {
            spyOn(this.smLoginComp, '_getEnteredEmail').andReturn("zzz@yyy.com") ;
            spyOn(W.SiteMembers, "openSiteMembersPopup") ;

            this.smLoginComp._closeAndRedirectToEmailReset() ;

            expect(W.SiteMembers.openSiteMembersPopup).toHaveBeenCalled() ;
        });

        it("should be able to remove a parameter and it's value from a url", function() {
            var urlBase = "http://www.wix.com?" ;
            var search1 = "p1=11111&" ;
            var search2 = "p2=22222&" ;
            var search3 = "p3=33333&" ;

            var url0 = urlBase + search2 + search3 ;
            var url1 = urlBase + search1 + search2 + search3 ;
            var url2 = urlBase + search3 + search1 + search2 ;
            var url3 = urlBase + search2 + search3 + search1 ;

            var paramToRemove = "p1" ;

            var trimmedUrl0 = this.smLoginComp._removeParameterFromUrl(url0, paramToRemove) ;
            var trimmedUrl1 = this.smLoginComp._removeParameterFromUrl(url1, paramToRemove) ;
            var trimmedUrl2 = this.smLoginComp._removeParameterFromUrl(url2, paramToRemove) ;
            var trimmedUrl3 = this.smLoginComp._removeParameterFromUrl(url3, paramToRemove) ;

            expect(trimmedUrl0).toBe(url0) ;
            expect(trimmedUrl1).toBe(urlBase + search2 + search3) ;
            expect(trimmedUrl2).toBe(urlBase + search3 + search2) ;
            expect(trimmedUrl3).toBe(urlBase + search2 + search3) ;
        }) ;

        it("should return true iff email & password are valid.", function() {
            var email = "john.doe@wix.com" ;
            var invalidEmail = "john@john.doe@wix.com" ;
            var password = "12345" ;
            var invalidPassword = "12" ;
            spyOn(this.smLoginComp, "_displayErrorOn").andReturn(null) ;

            var isValidInputValid = this.smLoginComp._validateFields(email, password) ;
            var isInvalidInputValid1 = this.smLoginComp._validateFields(invalidEmail, password) ;
            var isInvalidInputValid2 = this.smLoginComp._validateFields(email, invalidPassword) ;
            var isInvalidInputValid3 = this.smLoginComp._validateFields(invalidEmail, invalidPassword) ;

            expect(isValidInputValid).toBeTruthy() ;
            expect(isInvalidInputValid1).toBeFalsy() ;
            expect(isInvalidInputValid2).toBeFalsy() ;
            expect(isInvalidInputValid3).toBeFalsy() ;
        }) ;
    });
});