describe("SMContainer", function(){

    testRequire().components("wysiwyg.viewer.components.sm.SMContainer");

    beforeEach(function() {
        this.smContainerComp = new this.SMContainer("testId", new Element('div'));
    }) ;

    describe("SMContainer component forgot password", function() {

        it("should set the innerContent skin part to SMResetPasswordEmail form, when the intent is 'RESET_PASSWORD'.", function() {
            var mockDefinition = {} ;
            var intent = this.smContainerComp.INTENTS.EMAIL_RESET_PASSWORD ;
            this.smContainerComp._intent = intent ;

            mockDefinition = this.smContainerComp._createInnerDialog(mockDefinition) ;

            expect(mockDefinition.type).toBe("wysiwyg.viewer.components.sm.SMResetPasswordEmail") ;
        }) ;

        it("should set the innerContent skin part to SMLogin form, when the intent is 'LOGIN'.", function() {
            var mockDefinition = {} ;
            var intent = this.smContainerComp.INTENTS.LOGIN ;
            this.smContainerComp._intent = intent ;

            mockDefinition = this.smContainerComp._createInnerDialog(mockDefinition) ;

            expect(mockDefinition.type).toBe("wysiwyg.viewer.components.sm.SMLogin") ;
        }) ;

        it("should set the innerContent skin part to SMRegister form, when the intent is 'REGISTER'.", function() {
            var mockDefinition = {} ;
            var intent = this.smContainerComp.INTENTS.REGISTER ;
            this.smContainerComp._intent = intent ;

            mockDefinition = this.smContainerComp._createInnerDialog(mockDefinition) ;

            expect(mockDefinition.type).toBe("wysiwyg.viewer.components.sm.SMRegister") ;
        }) ;

        describe("it should be able to close the SiteMembers dialog and redirect to a URL", function() {

            it("should close the SiteMembers dialog, and refresh/reload the current URL for a null URL.", function() {
                var CURRENT_HREF = location.href ;
                spyOn(this.smContainerComp, "_closeSMContainer") ;
                spyOn(this.smContainerComp, "_reload") ;
                var redirectionURL = null ;

                this.smContainerComp.closeAndRedirectTo(redirectionURL) ;

                expect(this.smContainerComp._closeSMContainer).toHaveBeenCalled() ;
                expect(this.smContainerComp._reload).toHaveBeenCalled() ;
                expect(location.href).toBe(CURRENT_HREF) ;
            }) ;
        }) ;
    });
});
