define(['lodash', 'previewExtensionsCore'],
    function (_, previewExtensionsCore) {
        'use strict';

        var CALENDAR_PREVIEW_STATES = {
            FAKE_DATA: 'fakeData',
            OPEN: 'open'
        };
        var compType = 'wysiwyg.viewer.components.inputs.DatePicker';
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;

        var extension = {
            getCalendarPreviewProperties: function getCalendarPreviewProperties() {
                return this.isPreviewState(CALENDAR_PREVIEW_STATES.FAKE_DATA) ? {
                    id: this.props.id + 'calendar',
                    ref: this.props.id + 'calendar',
                    style: {},
                    dateUtils: this.dateUtils,
                    calendarDate: new Date(2080, 8, 12),
                    today: new Date(2080, 8, 12),
                    closeCalendar: _.noop,
                    onDateChange: _.noop,
                    allowPastDates: false,
                    allowFutureDates: true,
                    selectedDate: new Date(2080, 8, 13)
                } : this.getCalendarProperties();
            },
            transformRefData: function transformRefData(refData) {
                var shouldRenderPreviewCalendar = this.isPreviewState(CALENDAR_PREVIEW_STATES.FAKE_DATA) ||
                    this.isPreviewState(CALENDAR_PREVIEW_STATES.OPEN);

                if (!this.props.isMobileView && shouldRenderPreviewCalendar) {
                    refData.calendar = this.createChildComponent(
                        {},
                        'wysiwyg.viewer.components.Calendar',
                        'calendar',
                        this.getCalendarPreviewProperties()
                    );
                }
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    });
