define([
    'lodash',
    'react',
    'testUtils',
    'loginButton',
    'reactDOM'
],
    function(_, React, /** testUtils */ testUtils, loginButton, ReactDOM) {
    'use strict';

    var getComponent = function (props) {
        return testUtils.getComponentFromDefinition(loginButton, props);
    };


    describe('LoginButton component', function () {
        var siteMembersAspect = {
            isLoggedIn: function() {},
            getMemberDetails: function() {},
            logout: function() {},
            showAuthenticationDialog: function() {}
        };

        function mockLogin() {
            spyOn(siteMembersAspect, 'isLoggedIn').and.returnValue(true);
        }

        function mockLogout() {
            spyOn(siteMembersAspect, 'isLoggedIn').and.returnValue(false);
        }

        function mockMemberDetails(memberDetails) {
            spyOn(siteMembersAspect, 'getMemberDetails').and.returnValue(memberDetails);
        }

        function createProps(overrideProps) {
            return testUtils.santaTypesBuilder.getComponentProps(loginButton, _.assign({
                compProp: {
                    type: 'ButtonProperties',
                    id: 'props',
                    align: "center",
                    isDisabled: false
                },
                style: {
                    width: 500,
                    height: 500
                },
                skin: 'wysiwyg.viewer.skins.button.LoginButtonSkin',
                structure: {
                    componentType: 'wysiwyg.viewer.components.LoginButton'
                },
                siteMembersAspect: siteMembersAspect
            }, overrideProps));
        }

        beforeEach(function () {
            var compData = {language: 'en'};
            this.loginButton = getComponent(createProps({compData: compData}));
        });

        describe('check multiple languages', function(){
            var memberDetails = {email: 'user@wix.com'};

            beforeEach(function () {
                mockLogin();
                mockMemberDetails(memberDetails);
            });

            it('should use english on default', function(){
                var compData = {};
                this.loginButton = getComponent(createProps({compData: compData}));

                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('Hello ' + memberDetails.email);
            });

            it('should work with different languages', function(){
                var compData = {language: 'es'};
                this.loginButton = getComponent(createProps({compData: compData}));

                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('Hola ' + memberDetails.email);
            });

            it("should send the correct language in login", function(){
                var compData = {language: 'it'};
                this.loginButton = getComponent(createProps({compData: compData}));

                var node = ReactDOM.findDOMNode(this.loginButton.refs.actionTitle);
                spyOn(siteMembersAspect, 'logout');

                React.addons.TestUtils.Simulate.click(node);
                expect(siteMembersAspect.logout).toHaveBeenCalledWith(compData.language);
            });
        });

        describe('when user info is absent', function () {
            it('should hide itself', function () {
                var props = createProps({compData: {language: 'en'}, siteMembersAspect: null});

                expect(getComponent(props).getSkinProperties()[""].style.visibility).toBe('hidden');
            });
        });

        describe('when the user is logged in', function(){
            beforeEach(function () {
                mockLogin();
            });

            it('should not present anything if user name does not exist', function(){
                mockMemberDetails(null);

                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('');
            });

            it('should present Hello -user- on the button if user name exists', function(){
                var memberDetails = {email: 'user@wix.com', attributes: {name: 'Shraga'}};
                mockMemberDetails(memberDetails);
                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('Hello ' + memberDetails.attributes.name);
            });

            it('should present Hello -email- on the button if NO user name exists', function(){
                var memberDetails = {email: 'user@wix.com'};
                mockMemberDetails(memberDetails);
                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('Hello ' + memberDetails.email);
            });

            it('should present Logout on the button', function(){
                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.actionTitle.children).toBe('Log out');
            });

            it('should call logout function on click', function() {
                spyOn(siteMembersAspect, 'logout');

                React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(this.loginButton.refs.actionTitle));

                expect(siteMembersAspect.logout).toHaveBeenCalled();
            });

        });

        describe('when the user is not logged in', function(){

            beforeEach(function () {
                mockLogout();
                mockMemberDetails({attributes: {name: 'alexandre'}});
            });

            it('should present empty string on the button title', function(){
                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.memberTitle.children).toBe('');
            });

            it('should present Login/Sign up on the button', function(){
                var skinProperties = this.loginButton.getSkinProperties();
                expect(skinProperties.actionTitle.children).toBe('Login/Sign up');
            });

            it('should send the correct language to siteMembersAspect', function(){
                var compData = {language: 'it'};
                this.loginButton = getComponent(createProps({compData: compData}));
                var node = ReactDOM.findDOMNode(this.loginButton.refs.actionTitle);
                spyOn(siteMembersAspect, 'showAuthenticationDialog');

                React.addons.TestUtils.Simulate.click(node);
                expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalledWith(null, compData.language);
            });

            it('should call _login on click', function(){
                spyOn(siteMembersAspect, 'showAuthenticationDialog');

                React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(this.loginButton.refs.actionTitle));

                expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalled();
            });

        });

    });
});
