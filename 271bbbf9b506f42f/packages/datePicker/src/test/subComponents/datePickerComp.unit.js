define(['lodash',
    'react',
    'testUtils',
    'dateUtils',
    'datePicker/subComponents/datePickerComp'], function (_, React, testUtils, dateUtils, datePicker) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;
    var defaultProps = {
        id: "datePickerId",
        styleId: "datePickerStyleId",
        compData: {
            value: null,
            disabledDates: [new Date(2016, 5, 5).toISOString()],
            disabledDaysOfWeek: [1],
            allowPastDates: true,
            allowFutureDates: true,
            minDate: new Date(2016, 5, 2).toISOString(),
            maxDate: new Date(2016, 5, 24).toISOString()
        },
        compProp: {
            placeholder: null
        },
        shouldResetComponent: true,
        componentPreviewState: null,
        skin: 'wysiwyg.viewer.skins.input.DatePickerDefaultSkin'
    };

    describe('date picker component', function () {

        function renderDatePicker(propsOverrides) {
            var compProps = testUtils.santaTypesBuilder.getComponentProps(datePicker, _.defaultsDeep(propsOverrides || {}, defaultProps));
            var componentFromDefinition = testUtils.getComponentFromDefinition(datePicker, compProps);
            componentFromDefinition.dateUtils = dateUtils;
            return componentFromDefinition;
        }

        describe('getInitialState', function () {
            it('should init with correct default state when there is value', function () {
                var datePickerComp = renderDatePicker({
                    compData: {
                        value: new Date(2016, 1, 1).toISOString()
                    }
                });
                var initialState = datePickerComp.getInitialState();

                expect(initialState.shouldShowCalendar).toEqual(false);
                expect(initialState.dateUtilsInit).toEqual(false);
                expect(initialState.valid).toEqual(true);
                expect(initialState.selectedDate.toISOString()).toEqual(datePickerComp.props.compData.value);
            });

            it('should init with correct default state when there default text type property as today', function () {
                var datePickerComp = renderDatePicker({
                    compProp: {
                        defaultTextType: 'today'
                    }
                });
                var initialState = datePickerComp.getInitialState();
                var expectedSelectedDate = new Date();
                expectedSelectedDate.setHours(0, 0, 0, 0);

                expect(initialState.shouldShowCalendar).toEqual(false);
                expect(initialState.dateUtilsInit).toEqual(false);
                expect(initialState.valid).toEqual(true);
                expect(initialState.selectedDate.toISOString()).toEqual(expectedSelectedDate.toISOString());
            });
        });

        describe('componentDidMount', function () {
            it('should register to document click event', function () {
                var datePickerComp = renderDatePicker();
                spyOn(datePickerComp.props.windowClickEventAspect, 'registerToDocumentClickEvent');

                datePickerComp.componentDidMount();

                expect(datePickerComp.props.windowClickEventAspect.registerToDocumentClickEvent).toHaveBeenCalledWith(datePickerComp.props.id);
            });
        });

        describe('componentWillUnmount', function () {
            it('should un-register to document click event', function () {
                var datePickerComp = renderDatePicker();
                spyOn(datePickerComp.props.windowClickEventAspect, 'unRegisterToDocumentClickEvent');

                datePickerComp.componentWillUnmount();

                expect(datePickerComp.props.windowClickEventAspect.unRegisterToDocumentClickEvent).toHaveBeenCalledWith(datePickerComp.props.id);
            });
        });

        describe('componentWillReceiveProps', function () {
            describe('reset component flag', function () {
                it('should call close calendar and set comp as valid if flag is on', function (done) {
                    var datePickerComp = renderDatePicker();
                    var updatedFlag = {
                        shouldResetComponent: true
                    };
                    var nextProps = _.assign({}, datePickerComp.props, updatedFlag);

                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        spyOn(datePickerComp, 'closeCalendar');
                        spyOn(datePickerComp, 'setState');

                        datePickerComp.componentWillReceiveProps(nextProps);

                        expect(datePickerComp.closeCalendar).toHaveBeenCalled();
                        expect(datePickerComp.setState).toHaveBeenCalledWith({selectedDate: null, valid: true});
                        done();
                    });
                });

                it('should not call close calendar and should not set comp as valid if flag is off', function (done) {
                    var datePickerComp = renderDatePicker();
                    var updatedFlag = {
                        shouldResetComponent: false
                    };
                    var nextProps = _.assign({}, datePickerComp.props, updatedFlag);

                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        spyOn(datePickerComp, 'closeCalendar');
                        spyOn(datePickerComp, 'setState');

                        datePickerComp.componentWillReceiveProps(nextProps);

                        expect(datePickerComp.closeCalendar).not.toHaveBeenCalled();
                        expect(datePickerComp.setState).toHaveBeenCalledWith({selectedDate: null});
                        done();
                    });
                });
            });

            it('should call set state with updated selected date on value update', function (done) {
                var datePickerComp = renderDatePicker();
                var props = {
                    compData: {
                        value: new Date(2016, 4, 3).toISOString()
                    },
                    shouldResetComponent: false
                };
                var nextProps = _.assign({}, datePickerComp.props, props);

                datePickerComp.setState({dateUtilsInit: true}, function () {
                    spyOn(datePickerComp, 'setState');

                    datePickerComp.componentWillReceiveProps(nextProps);

                    expect(datePickerComp.setState).toHaveBeenCalledWith({selectedDate: new Date(props.compData.value)});
                    done();
                });
            });

            it('should call set state with updated selected date on if defaultTextType is today', function (done) {
                var datePickerComp = renderDatePicker();
                var props = {
                    compProp: {
                        defaultTextType: 'today'
                    },
                    shouldResetComponent: false
                };
                var nextProps = _.assign({}, datePickerComp.props, props);

                datePickerComp.setState({dateUtilsInit: true}, function () {
                    spyOn(datePickerComp, 'setState');

                    datePickerComp.componentWillReceiveProps(nextProps);

                    var expectedSelectedDate = new Date();
                    expectedSelectedDate.setHours(0, 0, 0, 0);

                    expect(datePickerComp.setState).toHaveBeenCalledWith({selectedDate: expectedSelectedDate});
                    done();
                });
            });
        });

        describe('onDocumentClick', function () {
            it('should not close calendar if date picker is the click event target', function () {
                var datePickerComp = renderDatePicker();
                var eventTarget = {
                    target: {
                        className: datePickerComp.props.styleId + 'input',
                        id: datePickerComp.props.id
                    }
                };
                spyOn(datePickerComp, 'closeCalendar');

                datePickerComp.onDocumentClick(eventTarget);

                expect(datePickerComp.closeCalendar).not.toHaveBeenCalled();
            });

            it('should not close calendar if calendar is the click event target', function () {
                var datePickerComp = renderDatePicker();
                var eventTarget = {
                    target: {
                        className: datePickerComp.props.styleId + 'calendar',
                        id: 'calendarId'
                    }
                };
                spyOn(datePickerComp, 'closeCalendar');

                datePickerComp.onDocumentClick(eventTarget);

                expect(datePickerComp.closeCalendar).not.toHaveBeenCalled();
            });

            it('should close calendar if event target is not date picker and not calendar and calendar is open', function (done) {
                var datePickerComp = renderDatePicker();
                var eventTarget = {
                    target: {
                        className: 'someClass',
                        id: 'someId'
                    }
                };
                datePickerComp.setState({shouldShowCalendar: true}, function () {
                    spyOn(datePickerComp, 'closeCalendar');

                    datePickerComp.onDocumentClick(eventTarget);

                    expect(datePickerComp.closeCalendar).toHaveBeenCalled();
                    done();
                });

            });
        });

        describe('closeCalendar', function () {
            it('should change state accordingly to not show calendar', function () {
                var datePickerComp = renderDatePicker();
                spyOn(datePickerComp, 'setState');

                datePickerComp.closeCalendar(_.noop);

                expect(datePickerComp.setState).toHaveBeenCalledWith({shouldShowCalendar: false}, jasmine.any(Function));
            });
        });

        describe('toggleCalendar', function () {
            it('should toggle shouldShowCalendar state', function (done) {
                var datePickerComp = renderDatePicker();
                var secondDatePicker = renderDatePicker();
                secondDatePicker.setState({shouldShowCalendar: true}, function () {
                    spyOn(datePickerComp, 'setState');
                    spyOn(secondDatePicker, 'setState');

                    datePickerComp.toggleCalendar();
                    secondDatePicker.toggleCalendar();

                    expect(datePickerComp.setState).toHaveBeenCalledWith({shouldShowCalendar: true}, jasmine.any(Function));
                    expect(secondDatePicker.setState).toHaveBeenCalledWith({shouldShowCalendar: false}, jasmine.any(Function));
                    done();
                });
            });
        });

        describe('onDateChange', function () {
            it('should update selectedDate and set component as valid', function () {
                var datePickerComp = renderDatePicker();
                var newDate = new Date(2016, 3, 3);
                spyOn(datePickerComp, 'setState');

                datePickerComp.onDateChange(newDate);

                expect(datePickerComp.setState).toHaveBeenCalledWith({
                    selectedDate: newDate,
                    valid: true
                }, jasmine.any(Function));
            });

            it('should not update component state is new date is same as selected date', function () {
                var selectedDate = new Date(2016, 1, 1);
                var datePickerComp = renderDatePicker({
                    compData: {
                        value: selectedDate.toISOString()
                    }
                });
                spyOn(datePickerComp, 'setState');

                datePickerComp.onDateChange(selectedDate);

                expect(datePickerComp.setState).not.toHaveBeenCalled();
            });
        });

        describe('validate', function () {
            it('should update comp as valid if it is not required', function () {
                var datePickerComp = renderDatePicker({
                    compProp: {
                        required: false
                    }
                });
                spyOn(datePickerComp, 'setState');

                datePickerComp.validate();

                expect(datePickerComp.setState).toHaveBeenCalledWith({valid: true});
            });

            it('should update comp as valid if it is required and there is selected date', function () {
                var datePickerComp = renderDatePicker({
                    compData: {
                        value: new Date(2016, 6, 11).toISOString()
                    },
                    compProp: {
                        required: true
                    }
                });
                spyOn(datePickerComp, 'setState');

                datePickerComp.validate();

                expect(datePickerComp.setState).toHaveBeenCalledWith({valid: true});
            });
            it('should update comp as not valid if it is required and there is no selected date', function () {
                var datePickerComp = renderDatePicker({
                    compData: {
                        value: null
                    },
                    compProp: {
                        required: true
                    }
                });
                spyOn(datePickerComp, 'setState');

                datePickerComp.validate();

                expect(datePickerComp.setState).toHaveBeenCalledWith({valid: false});
            });

            it('should call handle action with validate action', function () {
                var datePickerComp = renderDatePicker({
                    compData: {
                        value: new Date(2016, 6, 11).toISOString()
                    },
                    compProp: {
                        required: true
                    }
                });
                spyOn(datePickerComp, 'handleAction');

                datePickerComp.validate();

                expect(datePickerComp.handleAction).toHaveBeenCalledWith('validate');
            });
        });

        describe('getSkinProperties', function () {
            describe('root css classes', function () {
                it('should add focused css class when it should show calendar', function (done) {
                    var datePickerComp = renderDatePicker();
                    var newState = {
                        shouldShowCalendar: true,
                        dateUtilsInit: true
                    };
                    datePickerComp.setState(newState, function () {
                        var rootSkinProperties = datePickerComp.getSkinProperties()[''];
                        expect(rootSkinProperties.className).toContain(datePickerComp.props.styleId + '_focused');
                        done();
                    });
                });

                it('should add correct text direction css class', function () {
                    var direction = 'left';
                    var propsOverrides = {
                        compProp: {
                            textAlignment: direction
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                    expect(rootSkinProperties.className).toEqual(datePickerComp.props.styleId + '_' + direction + '-direction');
                });

                it('should add correct data-error class when comp is not valid', function (done) {
                    var datePickerComp = renderDatePicker();

                    datePickerComp.setState({valid: false}, function () {
                        var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                        expect(rootSkinProperties["data-error"]).toEqual(true);
                        done();
                    });
                });

                it('should not add data-error class when comp is valid', function () {
                    var datePickerComp = renderDatePicker();
                    var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                    expect(rootSkinProperties["data-error"]).toEqual(false);
                });

                it('should add correct data-disabled class when comp is disabled', function () {
                    var propsOverrides = {
                        compProp: {
                            isDisabled: true
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                    expect(rootSkinProperties["data-disabled"]).toEqual(true);
                });

                it('should not add data-disabled class when comp is not disabled', function () {
                    var propsOverrides = {
                        compProp: {
                            isDisabled: false
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                    expect(rootSkinProperties["data-disabled"]).toEqual(false);
                });

                it('should add correct read only class when comp is read only', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: true
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    var rootSkinProperties = datePickerComp.getSkinProperties()[''];

                    expect(rootSkinProperties.className).toContain(datePickerComp.props.styleId + '_read-only');
                });
            });

            describe('input wrapper', function () {
                it('should have correct click handler', function (done) {
                    var datePickerComp = renderDatePicker();

                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        expect(datePickerComp.getSkinProperties().inputWrapper.onClick).toEqual(datePickerComp.toggleCalendar);
                        done();
                    });
                });

                it('should not have click handler if date utils was not loaded', function () {
                    var datePickerComp = renderDatePicker();
                    expect(datePickerComp.getSkinProperties().inputWrapper.onClick).toEqual(null);
                });

                it('should not have click handler if comp is disabled', function (done) {
                    var datePickerComp = renderDatePicker({
                        compProp: {
                            isDisabled: true
                        }
                    });
                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        expect(datePickerComp.getSkinProperties().inputWrapper.onClick).toEqual(null);
                        done();
                    });
                });

                it('should toggle calendar view state upon click', function (done) {
                    var datePickerComp = renderDatePicker();

                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        spyOn(datePickerComp, 'setState');

                        var inputWrapperClass = datePickerComp.props.styleId + '_input-wrapper';
                        var inputWrapper = ReactTestUtils.findRenderedDOMComponentWithClass(datePickerComp, inputWrapperClass);

                        ReactTestUtils.Simulate.click(inputWrapper);

                        expect(datePickerComp.setState).toHaveBeenCalledWith({
                            shouldShowCalendar: !datePickerComp.state.shouldShowCalendar
                        }, jasmine.any(Function));
                        done();
                    });
                });
            });

            describe('input', function () {
                it('should have no value if there is no selected date', function () {
                    var datePickerComp = renderDatePicker();
                    expect(datePickerComp.getSkinProperties().input.value).toEqual('');
                });

                it('should have correct text padding according to center text alignment', function () {
                    var propsOverrides = {
                        compProp: {
                            textAlignment: 'center',
                            textPadding: 20
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);

                    expect(datePickerComp.getSkinProperties().input.style.paddingLeft).toEqual(20);
                    expect(datePickerComp.getSkinProperties().input.style.paddingRight).toBeUndefined();
                });

                it('should have correct text padding according to left text alignment', function () {
                    var propsOverrides = {
                        compProp: {
                            textAlignment: 'left',
                            textPadding: 20
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);

                    expect(datePickerComp.getSkinProperties().input.style.paddingLeft).toEqual(20);
                    expect(datePickerComp.getSkinProperties().input.style.paddingRight).toBeUndefined();
                });

                it('should have correct text padding according to right text alignment', function () {
                    var propsOverrides = {
                        compProp: {
                            textAlignment: 'right',
                            textPadding: 20
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);

                    expect(datePickerComp.getSkinProperties().input.style.paddingLeft).toBeUndefined();
                    expect(datePickerComp.getSkinProperties().input.style.paddingRight).toEqual(20);
                });

                it('should show selected date in correct date format', function (done) {
                    var propsOverrides = {
                        compData: {
                            value: new Date(2016, 6, 11).toISOString()
                        },
                        compProp: {
                            dateFormat: 'DD/MM/YYYY'
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);

                    datePickerComp.setState({dateUtilsInit: true}, function () {
                        expect(datePickerComp.getSkinProperties().input.value).toEqual('11/07/2016');
                        done();
                    });
                });

                it('should show placeholder text if exists and there is no selected date', function () {
                    var propsOverrides = {
                        compProp: {
                            placeholder: 'placeholder'
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);

                    expect(datePickerComp.getSkinProperties().input.placeholder).toEqual('placeholder');
                });

                it('should set placeholder text to empty if there is selected date', function () {
                    var propsOverrides = {
                        compData: {
                            value: new Date(2016, 6, 11).toISOString()
                        },
                        compProp: {
                            placeholder: 'placeholder'
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.placeholder).toEqual('');
                });

                it('should set placeholder text to empty if there is no selected date and no place holder text', function () {
                    var datePickerComp = renderDatePicker();
                    expect(datePickerComp.getSkinProperties().input.placeholder).toEqual('');
                });

                it('should be disabled if there is disabled property', function () {
                    var propsOverrides = {
                        compProp: {
                            isDisabled: true
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.disabled).toEqual(true);
                });

                it('should not be disabled if there is no disabled property', function () {
                    var datePickerComp = renderDatePicker();
                    expect(datePickerComp.getSkinProperties().input.disabled).toEqual(false);
                });

                it('should be read only if there is readonly property', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: true
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.readOnly).toEqual(true);
                });

                it('should not be read only if there is no disabled property', function () {
                    var datePickerComp = renderDatePicker();
                    expect(datePickerComp.getSkinProperties().input.readOnly).toEqual(false);
                });

                it('should have on focus handler that opens calendar if it is not disabled and not read only', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: false,
                            isDisabled: false
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.onFocus).toEqual(datePickerComp.handleInputFocus);
                });

                it('should have on blur handler that closes calendar if it is not disabled and not read only', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: false,
                            isDisabled: false
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.onBlur).toEqual(datePickerComp.handleInputBlur);
                });

                it('should not have on focus handler if read only or disabled', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: true,
                            isDisabled: false
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.onFocus).toBeNull();
                });

                it('should not have on focus handler if read only or disabled', function () {
                    var propsOverrides = {
                        compProp: {
                            readOnly: true,
                            isDisabled: true
                        }
                    };
                    var datePickerComp = renderDatePicker(propsOverrides);
                    expect(datePickerComp.getSkinProperties().input.onBlur).toBeNull();
                });
            });

            describe('calendar', function () {
                it('should not render calendar if calendar should not be shown', function () {
                    var datePickerComp = renderDatePicker();
                    var calendarComp = datePickerComp.getSkinProperties().calendar;

                    expect(calendarComp).toEqual({});
                });

                it('should pass correct props to calendar if should show calendar', function (done) {
                    var datePickerComp = renderDatePicker({
                        compData: {
                            value: new Date(2016, 1, 1).toISOString()
                        }
                    });

                    var newState = {
                        shouldShowCalendar: true,
                        dateUtilsInit: true
                    };
                    datePickerComp.setState(newState, function () {
                        var calendarComp = datePickerComp.getSkinProperties().calendar;
                        expect(calendarComp.props.id).toEqual(datePickerComp.props.id + 'calendar');
                        expect(calendarComp.props.style).toEqual({});
                        expect(calendarComp.props.calendarDate).toEqual(datePickerComp.state.selectedDate);
                        expect(calendarComp.props.closeCalendar).toEqual(datePickerComp.closeCalendar);
                        expect(calendarComp.props.onDateChange).toEqual(datePickerComp.onDateChange);
                        expect(calendarComp.props.disabledDates).toEqual(datePickerComp.props.compData.disabledDates);
                        expect(calendarComp.props.disabledDaysOfWeek).toEqual(datePickerComp.props.compData.disabledDaysOfWeek);
                        expect(calendarComp.props.allowPastDates).toEqual(datePickerComp.props.compData.allowPastDates);
                        expect(calendarComp.props.allowFutureDates).toEqual(datePickerComp.props.compData.allowFutureDates);
                        expect(calendarComp.props.minDate).toEqual(datePickerComp.props.compData.minDate);
                        expect(calendarComp.props.maxDate).toEqual(datePickerComp.props.compData.maxDate);
                        expect(calendarComp.props.selectedDate).toEqual(datePickerComp.state.selectedDate);
                        done();
                    });
                });
            });
        });
    });
});
