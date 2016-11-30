define([
    'lodash',
    'core',
    'textCommon',
    'santaProps',
    'siteUtils',
    'datePicker/subComponents/calendar'], function (_, core, textCommon, santaProps, siteUtils, calendar) {
    'use strict';

    function getPublicState (state) {
        return {valid: _.get(state, 'valid', true)};
    }

    /**
     * @class components.DatePicker
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "DatePicker",
        propTypes: _.assign({
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            id: santaProps.Types.Component.id.isRequired,
            styleId: santaProps.Types.Component.styleId.isRequired,
            shouldResetComponent: santaProps.Types.RenderFlags.shouldResetComponent.isRequired,
            componentPreviewState: santaProps.Types.RenderFlags.componentPreviewState,
            windowClickEventAspect: santaProps.Types.SiteAspects.windowClickEventAspect.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            isMobileDevice: santaProps.Types.Device.isMobileDevice.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(calendar)),
        statics: {
            useSantaTypes: true,
            behaviors: {
                change: {methodName: 'validate'}
            }
        },
        mixins: [core.compMixins.skinBasedComp,
            core.compMixins.runTimeCompData,
            core.compMixins.compStateMixin(getPublicState),
            textCommon.textScaleMixin],
        getInitialState: function () {
            return {
                shouldShowCalendar: false,
                dateUtilsInit: false,
                valid: true,
                selectedDate: this.getSelectedDateFromProps(this.props.compData.value, this.props.compProp.defaultTextType),
                $mobile: this.props.isMobileDevice || this.props.isMobileView ? "mobile" : "notMobile"
            };
        },
        componentWillReceiveProps: function (nextProps) {
            var newState = {
                selectedDate: this.getSelectedDateFromProps(nextProps.compData.value, nextProps.compProp.defaultTextType)
            };

            if (nextProps.shouldResetComponent) {
                this.closeCalendar();
                newState.valid = true;
            }

            this.setState(newState);
        },
        componentDidMount: function () {
            this.props.windowClickEventAspect.registerToDocumentClickEvent(this.props.id);
            var self = this;
            require(["dateUtils"], function (dateUtils) {
                self.dateUtils = dateUtils;
                self.setState({dateUtilsInit: true});
            });
        },
        componentWillUnmount: function () {
            this.props.windowClickEventAspect.unRegisterToDocumentClickEvent(this.props.id);
        },
        onDocumentClick: function (element) {
            var targetClassName = element.target.className;
            var targetId = element.target.id;
            var styleId = this.props.styleId;
            var isDatePickerClicked = _.includes(targetId, this.props.id) && _.includes(targetClassName, styleId + 'input');
            var isCalendarClicked = this.props.isMobileDevice || this.props.isMobileView ?
                !_.isEqual(targetId, this.props.id + 'calendar') :
                _.includes(targetClassName, styleId + 'calendar');

            if (this.state.shouldShowCalendar && !isDatePickerClicked && !isCalendarClicked) {
                this.handleInputBlur();
            }
        },
        openCalendar: function (callback) {
            this.setState({shouldShowCalendar: true}, callback);
        },
        closeCalendar: function (callback) {
            this.setState({shouldShowCalendar: false}, callback);
        },
        toggleCalendar: function () {
            if (this.state.shouldShowCalendar) {
                this.handleInputBlur();
            } else {
                this.handleInputFocus();
            }
        },
        onDateChange: function (newDate) {
            if (!this.dateUtils.helpers.isEqual(this.state.selectedDate, newDate)) {
                var newState = {
                    selectedDate: newDate,
                    valid: true
                };

                this.setState(newState, function () {
                    this.updateData({value: newDate.toISOString()});
                    this.handleAction(siteUtils.constants.ACTION_TYPES.CHANGE);
                    this.handleAction(siteUtils.constants.ACTION_TYPES.VALIDATE);
                }.bind(this));
            }
        },
        getSelectedDateFromProps: function (value, defaultTextType) {
            var selectedDate = null;

            if (value) {
                selectedDate = new Date(value);
            } else if (defaultTextType === 'today') {
                if (this.dateUtils) {
                    selectedDate = this.dateUtils.helpers.getStartOfToday();
                } else {
                    selectedDate = new Date();
                    selectedDate.setHours(0, 0, 0, 0);
                }
            }

            return selectedDate;
        },
        isPreviewState: function (state) {
            return _.includes(this.props.componentPreviewState, state);
        },
        getCalendarProperties: function () {
            var startOfToday = this.dateUtils.helpers.getStartOfToday();

            return {
                id: this.props.id + 'calendar',
                ref: this.props.id + 'calendar',
                style: {},
                dateUtils: this.dateUtils,
                calendarDate: this.state.selectedDate || startOfToday,
                today: startOfToday,
                closeCalendar: this.closeCalendar,
                onDateChange: this.onDateChange,
                allowPastDates: this.props.compData.allowPastDates,
                allowFutureDates: this.props.compData.allowFutureDates,
                disabledDates: this.props.compData.disabledDates,
                disabledDaysOfWeek: this.props.compData.disabledDaysOfWeek,
                minDate: this.props.compData.minDate,
                maxDate: this.props.compData.maxDate,
                selectedDate: this.state.selectedDate
            };
        },
        getCalendar: function () {
            var shouldRenderCalendar = this.state.shouldShowCalendar && this.state.dateUtilsInit;
            return shouldRenderCalendar ? this.createChildComponent(
                {},
                'wysiwyg.viewer.components.Calendar',
                'calendar',
                this.getCalendarProperties()
            ) : {};
        },
        getDateInputText: function () {
            var inputText = '';
            if (this.state.selectedDate && this.state.dateUtilsInit) {
                inputText = this.dateUtils.helpers.getDateByFormat(this.state.selectedDate, this.props.compProp.dateFormat);
            }

            return inputText;
        },
        getPlaceholderText: function () {
            var placeholder = this.props.compProp.placeholder;
            return this.state.selectedDate || !placeholder ? '' : placeholder;
        },
        getHostSkinProperties: function () {
            var classSet = {};
            classSet.focused = this.state.shouldShowCalendar;
            classSet[this.props.compProp.textAlignment + '-direction'] = true;
            classSet['read-only'] = !!this.props.compProp.readOnly;

            return {
                className: this.classSet(classSet),
                "data-disabled": !!this.props.compProp.isDisabled,
                "data-error": !this.state.valid
            };
        },
        handleInputFocus: function (event) {
            this.openCalendar(this.handleAction.bind(this, siteUtils.constants.ACTION_TYPES.FOCUS, event));
        },
        handleInputBlur: function (event) {
            this.closeCalendar(this.handleAction.bind(this, siteUtils.constants.ACTION_TYPES.BLUR, event));
        },
        getInputSkinProperties: function () {
            var isReadOnly = !!this.props.compProp.readOnly;
            var isDisabled = !!this.props.compProp.isDisabled;
            var textPadding = this.props.compProp.textPadding;
            var textAlignment = this.props.compProp.textAlignment;
            var padding = (textAlignment === 'right') ? {paddingRight: textPadding} : {paddingLeft: textPadding};

            return {
                value: this.getDateInputText(),
                placeholder: this.getPlaceholderText(),
                onFocus: !isReadOnly && !isDisabled ? this.handleInputFocus : null,
                onBlur: !isReadOnly && !isDisabled ? this.handleInputBlur : null,
                readOnly: isReadOnly,
                disabled: isDisabled,
                style: _.merge(this.getFontSize(this.props), padding)
            };
        },
        validate: function () {
            var isValid = this.props.compProp.required ? !!this.state.selectedDate : true;
            this.setState({valid: isValid});
            this.handleAction(siteUtils.constants.ACTION_TYPES.VALIDATE);
        },
        getSkinProperties: function () {
            return {
                '': this.getHostSkinProperties(),
                inputWrapper: {
                    onClick: !this.state.dateUtilsInit ||
                    this.props.compProp.isDisabled ||
                    this.props.compProp.readOnly ? null : this.toggleCalendar
                },
                input: this.getInputSkinProperties(),
                calendar: this.getCalendar()
            };
        }
    };
});
