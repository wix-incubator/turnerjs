define(['lodash',
        'definition!componentsPreviewLayer/previewExtensions/datePickerPreviewExtension',
        'fake!previewExtensionsCore'],
    function (_, datePickerPreviewExtensionDef, previewExtensionsCore) {
        'use strict';

        describe('date picker preview extension', function () {
            var CALENDAR_PREVIEW_STATES = {
                FAKE_DATA: 'fakeData',
                OPEN: 'open'
            };

            var extension, refData;
            var previewExtensionsRenderPlugin = previewExtensionsCore.registrar;
            var mockComp = {
                props: {
                    id: 'datePickerId'
                },
                isPreviewState: _.noop,
                getCalendarPreviewProperties: _.noop,
                getCalendarProperties: _.noop,
                createChildComponent: _.noop
            };

            beforeEach(function () {
                spyOn(previewExtensionsRenderPlugin, 'registerCompExtension').and.callFake(function (compType, ext) {
                    extension = ext;
                });

                datePickerPreviewExtensionDef(_, previewExtensionsCore);

                refData = {key: 'val'};
            });

            it('should register the extension in the extensions registrar', function () {
                var argsFor = previewExtensionsRenderPlugin.registerCompExtension.calls.argsFor(0)[0];
                expect(argsFor).toEqual('wysiwyg.viewer.components.inputs.DatePicker');
            });

            describe('transformRefData', function () {

                beforeEach(function () {
                    spyOn(mockComp, 'getCalendarPreviewProperties').and.returnValue('previewProps');
                    spyOn(mockComp, 'createChildComponent');
                });

                it('should call create calendar child component with preview properties result if preview state is open', function () {
                    spyOn(mockComp, 'isPreviewState').and.callFake(function (state) {
                        return state === CALENDAR_PREVIEW_STATES.OPEN;
                    });

                    extension.transformRefData.call(mockComp, refData);

                    expect(mockComp.createChildComponent).toHaveBeenCalledWith(
                        {},
                        'wysiwyg.viewer.components.Calendar',
                        'calendar',
                        mockComp.getCalendarPreviewProperties());
                });

                it('should call create calendar child component with preview properties result if preview state is fakeData', function () {
                    spyOn(mockComp, 'isPreviewState').and.callFake(function (state) {
                        return state === CALENDAR_PREVIEW_STATES.FAKE_DATA;
                    });

                    extension.transformRefData.call(mockComp, refData);

                    expect(mockComp.createChildComponent).toHaveBeenCalledWith(
                        {},
                        'wysiwyg.viewer.components.Calendar',
                        'calendar',
                        mockComp.getCalendarPreviewProperties());
                });

                it('should not call create calendar child component if not calendar preview state', function () {
                    spyOn(mockComp, 'isPreviewState').and.returnValue(false);

                    extension.transformRefData.call(mockComp, refData);

                    expect(mockComp.createChildComponent).not.toHaveBeenCalled();
                });
            });

            describe('getCalendarPreviewProperties', function () {
                it('should pass fake props to calendar if it has preview state of fakeData', function () {
                    spyOn(mockComp, 'isPreviewState').and.callFake(function (state) {
                        return state === CALENDAR_PREVIEW_STATES.FAKE_DATA;
                    });

                    var properties = extension.getCalendarPreviewProperties.call(mockComp);

                    expect(properties.id).toBe(mockComp.props.id + 'calendar');
                    expect(properties.style).toEqual({});
                    expect(properties.calendarDate.getTime()).toBe(new Date(2080, 8, 12).getTime());
                    expect(properties.today.getTime()).toBe(new Date(2080, 8, 12).getTime());
                    expect(properties.closeCalendar).toBe(_.noop);
                    expect(properties.onDateChange).toBe(_.noop);
                    expect(properties.allowPastDates).toBe(false);
                    expect(properties.allowFutureDates).toBe(true);
                    expect(properties.selectedDate.getTime()).toBe(new Date(2080, 8, 13).getTime());
                });

                it('should pass calendar props from get calendar properties method', function () {
                    var expectedProperties = {props: {someProp: 1}};
                    spyOn(mockComp, 'isPreviewState').and.callFake(function (state) {
                        return state === CALENDAR_PREVIEW_STATES.OPEN;
                    });
                    spyOn(mockComp, 'getCalendarProperties').and.returnValue(expectedProperties);

                    var calendarProperties = extension.getCalendarPreviewProperties.call(mockComp);
                    expect(mockComp.getCalendarProperties).toHaveBeenCalled();
                    expect(calendarProperties).toBe(expectedProperties);
                });
            });
        });
    });
