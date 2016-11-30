describeExperiment({'Weather': 'New'}, 'Weather', function() {
    testRequire().
        classes('core.managers.components.ComponentBuilder').
        components('wysiwyg.common.components.weather.viewer.Weather').
        resources('W.Data', 'W.ComponentLifecycle');
    
    function createComponent() {
        var that = this;
        this.componentLogic = null;

        this.mockData = this.W.Data.createDataItem({
            id: 'mockData',
            type: 'Weather'
        });
        this.mockProps = this.W.Data.createDataItem({
            id: 'mockProps',
            type: 'WeatherProperties'
        });

        var builder = new this.ComponentBuilder(document.createElement('DIV'));
        builder.
            withType('wysiwyg.common.components.weather.viewer.Weather').
            withSkin('wysiwyg.common.components.weather.viewer.skins.WeatherBasicSkin').
            withData(this.mockData).
            onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.setComponentProperties(that.mockProps);
            }).
            create();
    }

    describe('Component initialization', function() {
        beforeEach(function () {
            createComponent.call(this);

            this.forceRenderComponent = function () {
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            };

            waitsFor(function () {
                return this.componentLogic !== null;
            }, "Weather component to be ready", 1000);
        });

        describe("component skinparts", function () {
            it("should have degreesBox skinpart", function () {
                expect(this.componentLogic._skinParts.degreesBox).toBeDefined();
            });

            it("should have degreesValue skinpart", function () {
                expect(this.componentLogic._skinParts.degreesValue).toBeDefined();
            });

            it("should have degreesUnit skinpart", function () {
                expect(this.componentLogic._skinParts.degreesUnit).toBeDefined();
            });
        });

        describe("component data and properties by default", function () {
            it("should have empty location", function () {
                var location = this.componentLogic.getDataItem().get('locationId');

                expect(location).toBe("");
            });

            it("should have unit = fahrenheit", function () {
                var unit = this.componentLogic.getDataItem().get('degreesUnit');

                expect(unit).toBe("fahrenheit");
            });
        });

        describe('component methods', function() {

            describe('_onDataChange', function() {
                var onDisplayTemperatureCallback;

                beforeEach(function() {
                    onDisplayTemperatureCallback = spyOn(this.componentLogic, '_displayTemperature').andCallThrough();
                });

                it('should trigger _displayTemperature, when fields have changed', function() {
                    this.componentLogic._onDataChange(
                    {
                        data : {
                            invalidations : {
                                _invalidations : {
                                    dataChange : [{field : 'locationId'}, {field : 'degreesUnit'}]
                                }
                            }
                        }
                    });

                    waitsFor(function() {
                        if (onDisplayTemperatureCallback.wasCalled) {
                            var firstParam = onDisplayTemperatureCallback.mostRecentCall.args[0],
                                secondParam = onDisplayTemperatureCallback.mostRecentCall.args[1];
                            return firstParam === '' && secondParam === '';
                        }
                    });

                });

                it('should trigger _displayTemperature, when option set to true', function() {
                    this.componentLogic._onDataChange(
                    {
                        data : {
                            invalidations : {
                                _invalidations : {}
                            }
                        }
                    },
                    {
                        all : true
                    });

                    waitsFor(function() {
                        if (onDisplayTemperatureCallback.wasCalled) {
                            var firstParam = onDisplayTemperatureCallback.mostRecentCall.args[0],
                                secondParam = onDisplayTemperatureCallback.mostRecentCall.args[1];
                            return firstParam === '' && secondParam === '';
                        }
                    });

                });
            });

            describe('_convertTemperature', function() {
                it('should convert temperature in fahrenheit', function () {
                    expect(this.componentLogic._convertTemperature(250, 'fahrenheit')).toBeCloseTo(-9.4);
                    expect(this.componentLogic._convertTemperature(313.15, 'fahrenheit')).toBeCloseTo(104.27);
                    expect(this.componentLogic._convertTemperature(0, 'fahrenheit')).toBeCloseTo(-459.4);
                });

                it('should convert temperature in celsius', function () {
                    expect(this.componentLogic._convertTemperature(0, 'celsius')).toBeCloseTo(-273.15);
                    expect(this.componentLogic._convertTemperature(273.15, 'celsius')).toBeCloseTo(0);
                    expect(this.componentLogic._convertTemperature(313.15, 'celsius')).toBeCloseTo(40);
                });

                it('should return null if no kelvin value', function () {
                    expect(this.componentLogic._convertTemperature(null, 'celsius')).toEqual(null);
                    expect(this.componentLogic._convertTemperature(null, 'fahrenheit')).toEqual(null);
                    expect(this.componentLogic._convertTemperature(undefined, 'celsius')).toEqual(null);
                    expect(this.componentLogic._convertTemperature(undefined, 'fahrenheit')).toEqual(null);
                });

                it('should throw if unsupported unit was passed', function () {
                    function f() {
                        this.componentLogic._convertTemperature(0, 'unsupported unit');
                    }

                    expect(f).toThrow();
                });
            });

            describe('_setTemperatureSign', function() {
                it('should set sign according to value', function() {
                    expect(this.componentLogic._setTemperatureSign(250.00)).toEqual('+250');
                    expect(this.componentLogic._setTemperatureSign(0)).toEqual('0');
                    expect(this.componentLogic._setTemperatureSign(-250.00)).toEqual('-250');
                });
            });

            describe('_displayTemperature', function() {
                it('should display correct value', function() {
                    this.componentLogic._displayTemperature(313.15, 'fahrenheit');
                    expect(this.componentLogic._skinParts.degreesValue.innerText).toEqual('+104');
                    expect(this.componentLogic._skinParts.degreesUnit.innerText).toEqual('F');
                });

                it('should display nothing if temperature value is not defined', function() {
                    this.componentLogic._displayTemperature(null, 'fahrenheit');
                    expect(this.componentLogic._skinParts.degreesValue.innerText).toEqual('');
                    expect(this.componentLogic._skinParts.degreesUnit.innerText).toEqual('');
                });

                it('should display nothing if temperature unit is not defined', function() {
                    this.componentLogic._displayTemperature(231, '');
                    expect(this.componentLogic._skinParts.degreesValue.innerText).toEqual('');
                    expect(this.componentLogic._skinParts.degreesUnit.innerText).toEqual('');
                });

                it('should throw if temperature unit is unknown', function() {
                    function f() {
                        this.componentLogic._displayTemperature(231, 'unknown unit');
                    }

                    expect(f).toThrow();
                });
            });
        });
    });

});
