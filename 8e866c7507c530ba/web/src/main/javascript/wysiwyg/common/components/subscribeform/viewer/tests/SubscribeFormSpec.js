describe('SubscribeForm', function() {
	testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.common.components.subscribeform.viewer.SubscribeForm')
        .resources('W.Data', 'W.ComponentLifecycle');

    function createComponent(){
        var that = this;
        this.componentLogic = null;

        this.mockData = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'SubscribeForm'
        });

        this.mockProps = this.W.Data.createDataItem({
            id: 'dummyProperties',
            type: 'SubscribeFormProperties'
        });

        var builder = new this.ComponentBuilder(document.createElement('div'));

        builder
            .withType('wysiwyg.common.components.subscribeform.viewer.SubscribeForm')
            .withSkin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.isSiteReady = function(){ return true; };
                that.componentLogic.getUserCountryCode = function(){ return 'UKR'; };
                that.componentLogic.getCountryCodes = function(){
                    return {
                        "AFG": {
                            "countryName": "Afghanistan",
                            "phoneCode": "+93"
                        },
                        "ALA": {
                            "countryName": "\u00C5land Islands",
                            "phoneCode": "+358 18"
                        },
                        "ALB": {
                            "countryName": "Albania",
                            "phoneCode": "+355"
                        },
                        "DZA": {
                            "countryName": "Algeria",
                            "phoneCode": "+213"
                        }
                    };
                };
                that.componentLogic._sendMail = function() {
                    this._showMessage(this._data.get('successMessage'), false, true);
                };
                that.componentLogic._reportActivity = function() {
                    this._sendMail();
                    return Q.resolve();
                };
                that.componentLogic.resources.W.Config.env.$isPublicViewerFrame = true;
                that.componentLogic.setComponentProperties(that.mockProps);
            })
            .create();
    }

    beforeEach(function (){
        createComponent.call(this);

        this.forceRenderComponent = function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
        };

        this.forceRenderComponent();

        waitsFor(function () {
            return this.componentLogic !== null && this.componentLogic.lingo;
        }, 'SubscribeForm component to be ready', 1000);
    });

    describe('Component structure', function () {
        it('Skin parts should be defined', function () {
            expect(this.componentLogic._skinParts.wrapper).toBeDefined();
        });
    });

    describe('component data and properties by default', function () {
        it('toEmailAddress field should not have a value ', function () {
            var toEmail = this.componentLogic._data.get('toEmailAddress');

            expect(toEmail).not.toBe(true);
        });

        it('submitButtonLabel field should have a Label text', function () {
            var btnLabel = this.componentLogic._data.get('submitButtonLabel');

            expect(btnLabel).toBe("");
        });

        it('by Default should be shown one Email field', function () {
            var email = this.componentLogic._properties.get('hiddenEmailField');
            expect(email).toBeTruthy();

        });

        it('by Default should be hidden all field except Email', function () {
            var isFalse = true, self = this;

            ['hiddenFirstNameField', 'hiddenLastNameField', 'hiddenPhoneField'].forEach(function(item){
                isFalse = !self.componentLogic._properties.get(item);
                if(!isFalse) return;
            });

            expect(isFalse).toBeTruthy();
        });
    });

    describe("component state dir", function () {
        it("should be right in states'", function () {

            this.componentLogic._data.set("textDirection", "right");
            this.forceRenderComponent();


            var state = this.componentLogic._selectedStates.dir;

            expect(state).toBe('right');
        });

        it("should be left in states'", function () {
            this.forceRenderComponent();

            var state = this.componentLogic._selectedStates.dir;

            expect(state).toBe('left');
        });
    });

    describe("component fields activation", function () {
        it('first name should be enabled', function(){
            this.componentLogic._properties.set('hiddenFirstNameField', true);
            this.forceRenderComponent();

            var isTrue = !!this.componentLogic._activeFields['firstNameField'];

            expect(isTrue).toBeTruthy();
        });

        it('last name should be enabled', function(){
            this.componentLogic._properties.set('hiddenLastNameField', true);
            this.forceRenderComponent();

            var isTrue = !!this.componentLogic._activeFields['lastNameField'];

            expect(isTrue).toBeTruthy();
        });

        it('email field should be enabled', function(){
            this.componentLogic._properties.set('hiddenEmailField', true);
            this.forceRenderComponent();

            var isTrue = !!this.componentLogic._activeFields['emailField'];

            expect(isTrue).toBeTruthy();
        });

        it('phone field should be enabled', function(){
            this.componentLogic._properties.set('hiddenPhoneField', true);
            this.forceRenderComponent();

            var isTrue = !!this.componentLogic._activeFields['phoneField'];

            expect(isTrue).toBeTruthy();
        });
    });

    describe("country codes", function () {
        it('should be defined', function(){
            var geo =  this.componentLogic.getUserCountryCode();

            expect(geo).toBeTruthy();

        });

        it('Dropdown box should contain some items ', function(){
            this.componentLogic._properties.set('hiddenPhoneField', true);
            this.forceRenderComponent();

            var ots = this.componentLogic._skinParts.phoneField.querySelectorAll('option').length;

            expect(ots).toBeGreaterThan(0);
        });
    });

    describe("validation", function () {
        it('owner email error', function(){
            var errMessage = this.componentLogic.lingo['err_noOwner'].replace(/^\s+|\s+$/g, '');
            this.forceRenderComponent();
            this.componentLogic.getDataItem().set('toEmailAddress', '');
            this.componentLogic._onSubmit();

            var realError = this.componentLogic._skinParts.notifications.innerHTML.replace(/^\s+|\s+$/g, '');
            expect(realError).toBe(errMessage);
        });

        it('subscriber email error', function(){
            var errMessage = this.componentLogic._data.get('errorMessage').replace(/^\s+|\s+$/g, '');
            this.forceRenderComponent();
            this.componentLogic.getDataItem().set('toEmailAddress', 'test@gmail.com');
            this.componentLogic._skinParts.emailField.value = "";
            this.componentLogic._onSubmit();

            var realError = this.componentLogic._skinParts.notifications.innerHTML.replace(/^\s+|\s+$/g, '');
            expect(realError).toBe(errMessage);
        });

        it('require fields error', function(){
            var errMessage = this.componentLogic._data.get('validationErrorMessage').replace(/^\s+|\s+$/g, '');
            this.componentLogic._properties.set('hiddenFirstNameField', true);
            this.componentLogic._properties.set('requiredFirstNameField', true);
            this.forceRenderComponent();
            this.componentLogic.getDataItem().set('toEmailAddress', 'test@gmail.com');
            this.componentLogic._skinParts.emailField.value = "test@gmqil.com";

            this.componentLogic._onSubmit();

            var realError = this.componentLogic._skinParts.notifications.innerHTML.replace(/^\s+|\s+$/g, '');
            expect(realError).toBe(errMessage);
        });

        it('send email successMessage', function(){
            var successMessage = this.componentLogic._data.get('successMessage').replace(/^\s+|\s+$/g, '');
            this.forceRenderComponent();
            this.componentLogic.getDataItem().set('toEmailAddress', 'test@gmail.com');
            this.componentLogic._skinParts.emailField.value = "test@gmqil.com";

            this.componentLogic._onSubmit();

            var realMessage = this.componentLogic._skinParts.notifications.innerHTML.replace(/^\s+|\s+$/g, '');
            expect(realMessage).toBe(successMessage);
        });
    });

    describe("format data", function () {
        it('pre format data with all fields ', function(){
            var fieldValue = "test@gmqil.com";

            this.componentLogic._properties.set('hiddenFirstNameField', true);
            this.componentLogic._properties.set('hiddenLastNameField', true);
            this.forceRenderComponent();

            this.componentLogic._skinParts.emailField.value = fieldValue;
            this.componentLogic._skinParts.firstNameField.value = fieldValue;
            this.componentLogic._skinParts.lastNameField.value = fieldValue;

            var preFormatData = this.componentLogic.preFormatFields(), count = 0, i, j;

            for(i in preFormatData)
                for(j in preFormatData[i])
                    (preFormatData[i][j] === fieldValue) && count++;

            expect(count).toBe(4);
        });

        it('pre format data with all filled fields ', function(){
            var fieldValue = "test@gmqil.com";

            this.componentLogic._properties.set('hiddenFirstNameField', true);
            this.componentLogic._properties.set('hiddenLastNameField', true);
            this.forceRenderComponent();

            this.componentLogic._skinParts.emailField.value = fieldValue;
            this.componentLogic._skinParts.firstNameField.value = fieldValue;

            var preFormatData = this.componentLogic.preFormatFields(), count = 0, i, j;

            for(i in preFormatData)
                for(j in preFormatData[i])
                    (preFormatData[i][j] === fieldValue) && count++;

            expect(count).toBe(3);
        });
    });

});