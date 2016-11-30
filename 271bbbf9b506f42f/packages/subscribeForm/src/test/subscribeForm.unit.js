/**
 * @author test@test.test.com (Andrew Shustariov)
 */

define([
    'lodash',
    'testUtils',
    'utils',
    'subscribeForm',
    'reactDOM'
], function(
    _,
    /** testUtils */ testUtils,
    utils,
    subscribeFormClass,
    ReactDOM) {
    'use strict';

    describe('SubscribeForm component', function () {
        var component;

        function getSubscribeFormProps(propsOverride) {
            return testUtils.santaTypesBuilder.getComponentProps(subscribeFormClass, _.merge({
                compData: {
                    bccEmailAddress: "",
                    emailFieldLabel: "Email",
                    errorMessage: "Please provide a valid email",
                    firstNameFieldLabel: "First Name",
                    lastNameFieldLabel: "Last Name",
                    phoneFieldLabel: "Mobile Number",
                    submitButtonLabel: "Subscribe Now",
                    subscribeFormTitle: "Subscribe for Updates",
                    successMessage: "Congrats! You’re subscribed",
                    textDirection: "left",
                    toEmailAddress: "test@test.test.com",
                    validationErrorMessage: "Please fill in all required fields."
                },
                compProp: {
                    hiddenEmailField: true,
                    hiddenFirstNameField: false,
                    hiddenLastNameField: false,
                    hiddenPhoneField: false,
                    requiredEmailField: true,
                    requiredFirstNameField: false,
                    requiredLastNameField: false,
                    requiredPhoneField: false
                },
                skin: 'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon',
                structure: {
                    skin: 'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon',
                    componentType: 'wysiwyg.common.components.subscribeform.viewer.SubscribeForm'
                },
                geo: 'UKR'

            }, propsOverride));
        }

        function createSubscribeForm(propsOverride) {
            return testUtils.getComponentFromDefinition(subscribeFormClass, getSubscribeFormProps(propsOverride));
        }

        beforeEach(function () {
            spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');
            component = createSubscribeForm();
        });

        describe('component data and properties by default', function () {
            it('toEmailAddress field should not have a value ', function () {
                var toEmail = component.props.compData.toEmailAddress;

                expect(toEmail).not.toBe(true);
            });

            it('submitButtonLabel field should have a Label text', function () {
                var btnLabel = component.props.compData.submitButtonLabel;

                expect(btnLabel).toBe("Subscribe Now");
            });

            it('by Default should be shown one Email field', function () {
                var email = component.props.compProp.hiddenEmailField;
                expect(email).toBeTruthy();

            });

            it('by Default should be hidden all field except Email', function () {
                var isFalse = true;

                ['hiddenFirstNameField', 'hiddenLastNameField', 'hiddenPhoneField'].forEach(function (item) {
                    isFalse = isFalse || !component.props.compProp[item];
                });

                expect(isFalse).toBeTruthy();
            });
        });

        describe("component state dir", function () {
            it("should be right in states'", function () {

                component.setState({
                    $dir: "right"
                });
                component.render();


                var state = component.state.$dir;

                expect(state).toBe('right');
            });

            it("should be left in states'", function () {
                component.render();

                var state = component.state.$dir;

                expect(state).toBe('left');
            });
        });

        describe("country codes", function () {
            it('should be defined', function () {
                var geo = ReactDOM.findDOMNode(component.refs.selected).value;
                expect(geo).toEqual('+380');
            });

            it('Dropdown box should contain some items ', function () {
                var ots = ReactDOM.findDOMNode(component.refs.phoneField).querySelectorAll('option').length;
                expect(ots).toBeGreaterThan(100);
            });
        });

        describe("validation", function () {
            it('owner email error', function () {
                component = createSubscribeForm({
                    compData: {
                        toEmailAddress: ''
                    }
                });

                expect(component.isFormValid()).toBeFalsy();
            });

            it('subscriber email error', function () {
                component = createSubscribeForm({
                    compData: {
                        toEmailAddress: 'test@test.test.com'
                    }
                });

                expect(component.isFormValid()).toBeFalsy();
            });

            it('require fields error', function () {
                component = createSubscribeForm({
                    compProp: {
                        hiddenFirstNameField: true,
                        requiredFirstNameField: true
                    },
                    compData: {
                        toEmailAddress: 'test@test.test.com'
                    }
                });

                expect(component.isFormValid()).toBeFalsy();
            });

            it('send email successMessage', function () {
                component = createSubscribeForm({
                    compProp: {
                        hiddenFirstNameField: false,
                        requiredFirstNameField: false
                    },
                    compData: {
                        toEmailAddress: 'test@test.test.com'
                    }
                });

                component.setState({
                    email: {
                        value: "test@gmqil.com"
                    }
                });

                expect(component.isFormValid()).toBeTruthy();
            });
        });

        describe("format data", function () {

            beforeEach(function () {
                component = createSubscribeForm({
                    compProp: {
                        hiddenFirstNameField: true,
                        hiddenLastNameField: true
                    }
                });

                component.render();
            });

            xit('pre format data with all fields ', function () {
                var fieldValue = "test@gmqil.com";

                component.refs.emailField.setState({
                    value: fieldValue
                });
                component.refs.firstNameField.setState({
                    value: fieldValue
                });
                component.refs.lastNameField.setState({
                    value: fieldValue
                });

                var preFormatData = component.preFormatFields(), count = 0, i, j;

                for (i in preFormatData) {
                    if (preFormatData.hasOwnProperty(i)) {
                        for (j in preFormatData[i]) {
                            if (preFormatData[i][j] === fieldValue) {
                                count++;
                            }
                        }
                    }
                }

                expect(count).toBe(6);
            });

            xit('pre format data with all filled fields ', function () {
                var fieldValue = "test@gmqil.com";

                component.refs.emailField.setState({
                    value: fieldValue
                });
                component.refs.firstNameField.setState({
                    value: fieldValue
                });

                var preFormatData = component.preFormatFields(), count = 0, i, j;

                for (i in preFormatData) {
                    if (preFormatData.hasOwnProperty(i)) {
                        for (j in preFormatData[i]) {
                            if (preFormatData[i][j] === fieldValue) {
                                count++;
                            }
                        }
                    }
                }

                expect(count).toBe(4);
            });
        });
    });
});
