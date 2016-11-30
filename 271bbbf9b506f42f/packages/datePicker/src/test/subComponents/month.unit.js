define(['lodash',
    'testUtils',
    'dateUtils',
    'datePicker/subComponents/month'], function (_, testUtils, dateUtils, month) {
    'use strict';

    var defaultProps = {
        id: "id",
        styleId: "styleId",
        dateUtils: dateUtils,
        calendarDate: new Date(2016, 6, 11),
        today: new Date(2016, 6, 16),
        closeCalendar: _.noop,
        onDateChange: _.noop,
        selectedDate: {},
        allowPastDates: true,
        allowFutureDates: true,
        minDate: new Date(2016, 6, 2).toISOString(),
        maxDate: new Date(2016, 6, 24).toISOString(),
        disabledDates: [],
        disabledDaysOfWeek: [],
        skin: 'wysiwyg.viewer.skins.MonthDefaultSkin'
    };

    describe('month sub component', function () {
        var monthComp;

        beforeEach(function () {
            monthComp = renderMonth();
        });

        function renderMonth(propsOverrides) {
            var compProps = testUtils.santaTypesBuilder.getComponentProps(month, _.defaults(propsOverrides || {}, defaultProps));
            return testUtils.getComponentFromDefinition(month, compProps);
        }

        describe('getInitialState', function () {
            it('should set mobile state to notMobile if not mobile view or mobile device', function () {
                var monthCompDesktop = renderMonth();

                var initialState = monthCompDesktop.getInitialState();

                expect(initialState.$mobile).toEqual('notMobile');
            });

            it('should have $mobile - mobile if on mobile view', function () {
                var monthInMobileView = renderMonth({
                    isMobileView: true,
                    isMobileDevice: false
                });

                var initialState = monthInMobileView.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });

            it('should have $mobile - mobile if on mobile device', function () {
                var monthInMobileDevice = renderMonth({
                    isMobileView: false,
                    isMobileDevice: true
                });

                var initialState = monthInMobileDevice.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });
        });

        describe('generating weeks', function () {
            it('should generate correct number of weeks according to calendar date', function () {
                var secondMonth = renderMonth({calendarDate: new Date(2016, 9, 11)});

                expect(monthComp.getSkinProperties()[''].children.length).toEqual(5);
                expect(secondMonth.getSkinProperties()[''].children.length).toEqual(6);
            });

            it('should generate week with correct css class', function () {
                var monthSkinProperties = monthComp.getSkinProperties()[''];
                var week = monthSkinProperties.children[0];

                expect(week.props.className).toEqual(monthComp.props.styleId + '_week');
            });

            it('should generate correct number of days for each week', function () {
                var monthSkinProperties = monthComp.getSkinProperties()[''];

                _.forEach(monthSkinProperties.children, function (week) {
                    expect(week.props.children.length).toEqual(7);
                });
            });

            it('should pass correct props to each day in week', function () {
                var monthSkinProperties = monthComp.getSkinProperties()[''];
                var startDayOfTheMonth = dateUtils.helpers.getStartDayOfTheMonth(monthComp.props.calendarDate);
                var startOfFirstWeekInMonth = dateUtils.helpers.getStartDayOfTheWeek(startDayOfTheMonth, {weekStartsOn: 1});
                var dayOffset = 0;

                _.forEach(monthSkinProperties.children, function (week) {
                    _.forEach(week.props.children, function (day) {
                        var newDateOffset = startOfFirstWeekInMonth.getDate() + dayOffset++;
                        var expectedDayDate = new Date(startOfFirstWeekInMonth.getTime()).setDate(newDateOffset);

                        expect(day.props.dateUtils).toEqual(monthComp.props.dateUtils);
                        expect(day.props.day.getTime()).toEqual(expectedDayDate);
                        expect(day.props.today).toEqual(monthComp.props.today);
                        expect(day.props.onDateChange).toEqual(monthComp.props.onDateChange);
                        expect(day.props.closeCalendar).toEqual(monthComp.props.closeCalendar);
                        expect(day.props.selectedDate).toEqual(monthComp.props.selectedDate);
                        expect(day.props.calendarDate).toEqual(monthComp.props.calendarDate);
                        expect(day.props.disabledDates).toEqual(monthComp.props.disabledDates);
                        expect(day.props.disabledDaysOfWeek).toEqual(monthComp.props.disabledDaysOfWeek);
                        expect(day.props.allowPastDates).toEqual(monthComp.props.allowPastDates);
                        expect(day.props.allowFutureDates).toEqual(monthComp.props.allowFutureDates);
                        expect(day.props.minDate).toEqual(monthComp.props.minDate);
                        expect(day.props.maxDate).toEqual(monthComp.props.maxDate);
                    });
                });
            });
        });
    });
});
