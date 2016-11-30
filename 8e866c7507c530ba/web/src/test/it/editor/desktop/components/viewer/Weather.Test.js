integration.requireExperiments(['weather']);
integration.noAutomation();

describe("Weather indicator: ", function () {
    var component,
        subject,
        unitRadioButton,
        panel,
        compLogic;

    beforeEach(function () {
        this.addMatchers({
            toBeTranslated : function (i18n_key) {
                var actual = (this.actual || "").trim();
                var expected = W.Resources.get('EDITOR_LANGUAGE', i18n_key);

                return actual === expected;
            }
        });
    });

    beforeEach(function () {

        automation.Utils.waitsForPromise(function () {
            var promise = automation.viewercomponents.ViewerComponent.addComponent({
                compData : {
                    "comp"   : "wysiwyg.common.components.weather.viewer.Weather",
                    "skin"   : "wysiwyg.common.components.weather.viewer.skins.WeatherBasicSkin",
                    "data"   : { type : "Weather" },
                    "props"  : { type : "WeatherProperties" },
                    "layout" : {
                        "width"  : 60,
                        "height" : 12
                    }
                }
            });

            return promise.then(function (_compLogic) {
                compLogic = _compLogic;
                component = _compLogic.$view;
                W.Editor.openComponentPropertyPanels({}, false, true);
            }).then(function () {
                return automation.WebElement.waitForElementToExist(document, "[comp$=WeatherPanel]");
            }).then(function (element) {
                panel = element;
            }).timeout(5000, "weather panel was not found");

        });
    });

    afterEach(function() {
        automation.Utils.waitsForPromise(function() {
            return automation.viewercomponents.ViewerComponent.removeComponent(compLogic);
        });
    });

    describe('on panel, choice location, ', function () {
        var suggestedLocations;

        beforeEach(function () {
            subject = panel.querySelector('[skinPart=selectLocation]');
            unitRadioButton = panel.querySelector('[skinPart=choiceDegreesUnit]');
            suggestedLocations = panel.querySelector('[skinPart=suggestedLocationsComboBox]');
        });

        it('should use fahrenheits by default', function() {
            expect(component.$logic.getDataItem().get('degreesUnit')).toEqual('fahrenheit');
        });

        when_input_is_set_to('', function () {
            validator_should_show_message('WEATHER_PANEL_ERROR_LOCATION_IS_REQUIRED');
        });

        when_input_is_set_to('ab', function () {
            validator_should_show_message('WEATHER_PANEL_ERROR_NOT_ENOUGH_LETTERS');
        });

        when_input_is_pasted_to('', function() {
            validator_should_show_message('WEATHER_PANEL_ERROR_LOCATION_IS_REQUIRED');
        });

        when_input_is_pasted_to('Lond123on', function() {
            validator_should_show_message('WEATHER_PANEL_ERROR_NO_SUCH_LOCATION');
        });

        when_input_is_pasted_to('New York, NY', function() {
            validator_should_show_no_message();
        });

        when_input_is_pasted_to('ab', function() {
            validator_should_show_message('WEATHER_PANEL_ERROR_NOT_ENOUGH_LETTERS');
        });

        when_input_is_pasted_sequentially_to(['', 'London'], function() {
            validator_should_show_no_message();
        });

        when_input_is_pasted_sequentially_to(['London', ''], function() {
            it('should hide combobox', function() {
                expect(suggestedLocations.children.length).toEqual(0);
            });

            validator_should_show_message('WEATHER_PANEL_ERROR_LOCATION_IS_REQUIRED');
        });

        xdescribe("remote polling", function () {
            var showSuggestionsCallback, setLocationCallback , input;

            beforeEach(function () {
                showSuggestionsCallback = spyOn(panel.$logic, '_showComboBoxWithSuggestions').andCallThrough();

                setLocationCallback = spyOn(panel.$logic, '_setLocation').andCallThrough();

                input = subject.querySelector("input");

                spyOn(panel.$logic, '_isNew').andCallFake(function() {
                    return false;
                });
            });

            afterEach(function() {
                panel.$logic._setLocation.reset();
                panel.$logic._showComboBoxWithSuggestions.reset();
            });

            describe('when input is set to available location', function() {

                beforeEach(function() {
                    spyOn(panel.$logic, '_findLocationsByName').andCallFake(function () {
                        return Q.resolve({
                            list  : [
                                {
                                    id   : 1,
                                    name : 'London'
                                },
                                {
                                    id   : 2,
                                    name : 'London1'
                                },
                                {
                                    id   : 3,
                                    name : 'London2'
                                },
                                {
                                    id   : 4,
                                    name : 'London3'
                                }
                            ],
                            query : 'London'
                        });
                    });
                });

                beforeEach(function(){
                    input.fireEvent(Constants.CoreEvents.FOCUS);
                    input.value = 'London';
                    input.fireEvent(Constants.CoreEvents.KEY_UP, {});

                    waitsFor(function () {
                        return showSuggestionsCallback.callCount === 1;
                    });
                });

                it('should show suggestions', function () {

                    runs(function () {
                        expect(suggestedLocations.children.length).toEqual(4);
                    });
                });

                describe('after user selects location', function() {

                    beforeEach(function() {
                        fireEvent(suggestedLocations.children[0], Constants.CoreEvents.CLICK);
                    });

                    it('suggestions should be hidden', function() {
                        waitsFor(function () {
                           return suggestedLocations.children.length === 0;
                        }, 500);
                    });

                    it('input should be filled with selected value', function() {
                        waitsFor(function () {
                            return input.value === 'London';
                        }, 500);
                    });

                    it('data item should be set correctly', function () {
                        waitsFor(function () {
                            var dataItem = panel.$logic.getDataItem();

                            return dataItem.get('locationId') === 1 &&
                                   dataItem.get('locationName') === 'London';
                        }, 500);
                    });

                    function when_service_returns_valid_temperature(value, innerDescribe) {
                        describe('when service returns temperature ' + value + 'K', function() {
                            beforeEach(function () {
                                spyOn(component.$logic, '_fetchWeatherData').andCallFake(function () {
                                    return Q.resolve({degrees : value});
                                });
                            });

                            innerDescribe();
                        });
                    }

                    when_service_returns_valid_temperature(273.15, function() {
                        it_should_display_X_degrees('+32');

                        when_user_selects_unit('celsius', function() {
                            it_should_convert_temperature_to_celsius('0');
                        });
                    });

                    when_service_returns_valid_temperature(0, function() {
                        it_should_display_X_degrees('-459');

                        when_user_selects_unit('celsius', function() {
                            it_should_convert_temperature_to_celsius('-273');
                        });
                    });

                    when_service_returns_valid_temperature(255.37, function() {
                        it_should_display_X_degrees('0');

                        when_user_selects_unit('celsius', function() {
                            it_should_convert_temperature_to_celsius('-18');
                        });
                    });

                    function when_user_selects_unit(unitName, innerDescribe) {
                        describe('after user selects ' + unitName, function() {
                            beforeEach(function () {
                                var celsiusInput = unitRadioButton.querySelector('[skinpart=radio][value=' + unitName + ']');
                                celsiusInput.fireEvent('click');
                            });

                            innerDescribe();
                        });
                    }

                    function it_should_display_X_degrees(value) {
                        it('should display ' + value + 'K temperature in fahrenheit', function() {
                            var degrees = component.$logic._skinParts.degreesValue;

                            waitsFor(function () {
                                return degrees.innerHTML === value;
                            });
                        });
                    }

                    function it_should_convert_temperature_to_celsius(value) {
                        it('should convert temperature to celsius', function() {
                            var degrees = component.$logic._skinParts.degreesValue;
                            waitsFor(function() {
                                return degrees.innerHTML === value;
                            });
                        });
                    }
                });

            });

            describe('when input is set to unavailable location', function() {
                var query = 'some not available location';
                beforeEach(function() {
                    spyOn(panel.$logic, '_findLocationsByName').andCallFake(function () {
                        return Q.reject({
                            serviceCode : 404
                        });
                    });
                    input.fireEvent(Constants.CoreEvents.FOCUS);
                    input.value = query;
                    input.fireEvent(Constants.CoreEvents.KEY_UP, {});

                });

                it('should show NO_SUCH_LOCATION message', function () {
                    waitsFor(function() {
                        var validator = subject.querySelector("[skinpart=message]");
                        return validator.get('text') === W.Resources.get('EDITOR_LANGUAGE', 'WEATHER_PANEL_ERROR_NO_SUCH_LOCATION');

                    }, 500);
                });

                it('should show no suggestions', function () {
                    waitsFor(function() {
                        return suggestedLocations.children.length === 0;
                    }, 500);
                });
            });
        });
    });

    function fireEvent(element,event){
        var evt;
        if (document.createEventObject){
            // dispatch for IE
            evt = document.createEventObject();
            return element.fireEvent('on'+event,evt);
        }
        else{
            // dispatch for firefox + others
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true ); // event type,bubbling,cancelable
            evt.target = element;
            return !element.dispatchEvent(evt);
        }
    }

    function when_input_is_set_to(theValue, innerDescribe) {
        describe("when input is set to " + (theValue || "empty"), function () {
            beforeEach(function () {
                var input = subject.querySelector("input");
                input.focus();
                input.value = '';
                input.value = theValue;
                input.fireEvent(Constants.CoreEvents.KEY_UP, {});
            });

            innerDescribe();
        });
    }

    function when_input_is_pasted_to(theValue, innerDescribe) {
        describe("when input is set to " + (theValue || "empty"), function () {
            beforeEach(function () {
                var input = subject.querySelector("input");
                input.value = '';
                input.value = theValue;
                input.fireEvent(Constants.CoreEvents.PASTE, {});
            });

            innerDescribe();
        });
    }

    function when_input_is_pasted_sequentially_to(theValues, innerDescribe) {
        describe("when input is set to " + theValues, function () {
            beforeEach(function () {
                var input = subject.querySelector("input");
                _.each(theValues, function(theValue) {
                    input.value = theValue;
                    input.fireEvent(Constants.CoreEvents.PASTE, {});
                });
            });

            innerDescribe();
        });
    }

    function validator_should_show_message(message_i18n) {
        it("validator should show " + (message_i18n ? message_i18n :'""'), function () {
            var validator = subject.querySelector("[skinpart=message]");
            if (message_i18n) {
                expect(validator.get('text')).toBeTranslated(message_i18n);
            } else {
                expect(validator.get('text')).toEqual(message_i18n);
            }
        });
    }

    function validator_should_show_no_message() {
        return validator_should_show_message('');
    }
});