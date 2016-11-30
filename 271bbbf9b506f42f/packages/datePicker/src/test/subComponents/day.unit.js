define(['react',
    'reactDOM',
    'lodash',
    'testUtils',
    'dateUtils',
    'datePicker/subComponents/day'], function (React, ReactDOM, _, testUtils, dateUtils, day) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;
    var defaultProps = {
        id: "id",
        styleId: "styleId",
        dateUtils: dateUtils,
        isMobileView: false,
        isMobileDevice: false,
        day: new Date(2016, 6, 11),
        today: new Date(2016, 6, 16),
        calendarDate: new Date(2016, 6, 11),
        selectedDate: {},
        onDateChange: _.noop,
        closeCalendar: _.noop,
        disabledDates: [],
        disabledDaysOfWeek: [],
        allowPastDates: true,
        allowFutureDates: true,
        skin: 'wysiwyg.viewer.skins.DayDefaultSkin'
    };

    describe('day sub component', function () {

        function renderDay(propsOverrides) {
            var compProps = testUtils.santaTypesBuilder.getComponentProps(day, _.defaults(propsOverrides || {}, defaultProps));
            return testUtils.getComponentFromDefinition(day, compProps);
        }

        describe('getInitialState', function () {
            it('should set mobile state to notMobile if not mobile view or mobile device', function () {
                var dayComp = renderDay();

                var initialState = dayComp.getInitialState();

                expect(initialState.$mobile).toEqual('notMobile');
            });

            it('should have $mobile - mobile if on mobile view', function () {
                var dayInMobileView = renderDay({
                    isMobileView: true,
                    isMobileDevice: false
                });

                var initialState = dayInMobileView.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });

            it('should have $mobile - mobile if on mobile device', function () {
                var dayInMobileDevice = renderDay({
                    isMobileView: false,
                    isMobileDevice: true
                });

                var initialState = dayInMobileDevice.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });
        });

        describe('componentWillMount', function () {
            it('should call isDisabled with props', function () {
                var dayComp = renderDay();
                spyOn(dayComp, 'isDayDisabled');

                dayComp.componentWillMount();

                expect(dayComp.isDayDisabled).toHaveBeenCalledWith(dayComp.props);
            });
        });

        describe('componentWillReceiveProps', function () {
            it('should call isDisabled with new props', function () {
                var dayComp = renderDay();
                spyOn(dayComp, 'isDayDisabled');

                var nextProps = _.assign({}, dayComp.props, {newProps: 'new'});
                dayComp.componentWillReceiveProps(nextProps);

                expect(dayComp.isDayDisabled).toHaveBeenCalledWith(nextProps);
            });
        });

        describe('day click event handler', function () {
            it('should add to root onMouseDown event handler', function () {
                var dayComp = renderDay();
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.onMouseDown).toEqual(dayComp.handleDayClick);
            });

            it('should not add to root onMouseDown event handler if day is disabled', function () {
                var dayComp = renderDay({disabledDates: [defaultProps.day.toISOString()]});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.onMouseDown).toBeNull();
            });

            it('should invoke onDateChange with day as parameter', function () {
                var dayComp = renderDay({onDateChange: jasmine.createSpy('onDateChange')});

                ReactTestUtils.Simulate.mouseDown(ReactDOM.findDOMNode(dayComp));

                expect(dayComp.props.onDateChange).toHaveBeenCalledWith(dayComp.props.day);
            });

            it('should invoke closeCalendar function', function () {
                var dayComp = renderDay({closeCalendar: jasmine.createSpy('closeCalendar')});

                ReactTestUtils.Simulate.mouseDown(ReactDOM.findDOMNode(dayComp));

                expect(dayComp.props.closeCalendar).toHaveBeenCalled();
            });

            it('should not do anything if day is disabled', function () {
                var dayComp = renderDay({disabledDates: [defaultProps.day.toISOString()]});
                spyOn(dayComp, 'handleDayClick').and.callThrough();

                ReactTestUtils.Simulate.mouseDown(ReactDOM.findDOMNode(dayComp));

                expect(dayComp.handleDayClick).not.toHaveBeenCalled();
            });
        });

        describe('root css classes', function () {
            it('should return correct css class for today', function () {
                var dayComp = renderDay({day: defaultProps.today});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('today');
            });

            it('should return correct css class for selected day', function () {
                var dayComp = renderDay({selectedDate: defaultProps.day});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('selected');
            });

            it('should return correct css class for hidden day', function () {
                var dayComp = renderDay({day: new Date(2016, 5, 30)});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('hidden');
            });

            it('should return correct css class for specific date disable', function () {
                var dayComp = renderDay({disabledDates: [defaultProps.day.toISOString()]});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class for specific week day', function () {
                var dayComp = renderDay({disabledDaysOfWeek: [1]});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class when day is in the past and past dates are not allowed', function () {
                var dayComp = renderDay({allowPastDates: false});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class when day is in the future and future dates are not allowed', function () {
                var propsOverrides = {
                    day: new Date(2016, 6, 17),
                    allowFutureDates: false
                };
                var dayComp = renderDay(propsOverrides);
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class when day is after the max date allowed', function () {
                var propsOverrides = {
                    day: new Date(2016, 6, 19),
                    maxDate: new Date(2016, 6, 17).toISOString()
                };
                var dayComp = renderDay(propsOverrides);
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class when day is before the min date allowed', function () {
                var propsOverrides = {
                    day: new Date(2016, 6, 14),
                    minDate: new Date(2016, 6, 17).toISOString()
                };
                var dayComp = renderDay(propsOverrides);
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toContain('disabled');
            });

            it('should return correct css class when day is in the past and past dates are allowed', function () {
                var dayComp = renderDay();
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toEqual('');
            });

            it('should return correct css class when day is in the future and future dates are allowed', function () {
                var dayComp = renderDay({day: new Date(2016, 6, 17)});
                var rootSkinProperties = dayComp.getSkinProperties()[''];

                expect(rootSkinProperties.className).toEqual('');
            });
        });

        describe('day content', function () {
            it('should render day number as day content', function () {
                var dayComp = renderDay();
                var dayContentSkinProperties = dayComp.getSkinProperties().dayContent;

                expect(dayContentSkinProperties.children).toEqual(dayComp.props.day.getDate());
            });
        });

    });
});
