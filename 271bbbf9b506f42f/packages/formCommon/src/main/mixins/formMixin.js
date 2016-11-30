define([
    'lodash',
    'santaProps',
    'core',
    'utils',
    'formCommon/bi/errors',
    'formCommon/bi/events',
    'experiment',
    'reactDOM',
    'react'
], function(_, santaProps, core, utils, biErrors, biEvents, experiment, ReactDOM, React) {
    'use strict';
    var mixins = core.compMixins,
        cookieUtils = utils.cookieUtils,
        dateTimeUtils = utils.dateTimeUtils,
        ajax = utils.ajaxLibrary;
    var WIX_CLIENT_COOKIE = 'wixClient';

    function createMessageStructure(fromEmail, fromName, toEmail, bccEmail, mailSubject, metaSiteId,
                                    message, contactPhone, formSubject, contactAddress) {
      if (experiment.isOpen('sendContactFormEmailsViaPong')) {
        return {
          'metaSiteId': metaSiteId || 'dc853130-4fb2-464f-878d-3b6667dc4f97',
          'to': [
              {
                  address: toEmail,
                  name: toEmail
              }
          ],
          'bcc': (bccEmail ? {address: bccEmail, name: bccEmail} : null),
          'from': {
              address: fromEmail,
              name: fromName

          },
            contactPhone : contactPhone,
            contactAddress: contactAddress,
           'formSubject': formSubject,
           'formMessage': message
        };
      }

      // Fallback to old message structure
      return {
          'to': [
              {
                  address: toEmail,
                  personal: toEmail
              }
          ],
          'bcc': bccEmail ? [
              {
                  address: bccEmail || 'n/a',
                  personal: bccEmail || 'n/a'
              }
          ] : [],
          'cc': [],
          'from': {
              address: fromEmail,
              personal: fromName
          },
          'subject': mailSubject,
          'metaSiteId': metaSiteId || 'dc853130-4fb2-464f-878d-3b6667dc4f97',
          'plainTextMessage': 'n/a'
      };
    }

    function createHtmlMessage(fields, websiteUrl, isPremium) {
        var date = new Date(),
            templates = {
                todayDate: '<%=todayDay%> <%=todayMonthName%>, <%=todayYear%>',
                singleField: '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b><%=fieldKey%></b> <%=fieldValue%></li>',
                outerMessage: '<ul style="list-style: none; margin: 0; padding: 0;">' +
                '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b><%=title%></b></li>' +
                '<li style="list-style: none; margin: 0 0 15px 0; padding: 0;"><%=via%> <%=websiteUrl%></li>' +
                '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b><%=details%></b></li>' +
                '<li style="list-style: none; margin: 0 0 25px 0; padding: 0;">' +
                '<ul style="margin: 0 0 0 20px; padding: 0;"><%=fields%></ul></li>' +
                '<li style="list-style: none; margin: 0 0 15px 0; padding: 0;"><b><%=sentOn%></b> <%=dateToday%></li>' +
                '<li style="list-style: none; margin: 0; padding: 0;"><%=thanks%></li></ul>'
            };

        return _.template(templates.outerMessage)({
            title: this.translatedKeys.title,
            via: this.translatedKeys.via,
            websiteUrl: websiteUrl,
            details: this.translatedKeys.details,
            fields: _.reduce(fields, function (result, value, key) {
                return result + _.template(templates.singleField)({fieldKey: key, fieldValue: value});
            }, ''),
            sentOn: this.translatedKeys.sentOn,
            dateToday: _.template(templates.todayDate)({
                todayDay: date.getDate(),
                todayMonthName: dateTimeUtils.getMonthName(date.getMonth()),
                todayYear: date.getFullYear()
            }),
            thanks: this.translatedKeys['thanks' + (isPremium ? '_premium' : '')]
        });
    }

    function createEmailMessage() {
        var fields = this.getFormFields.call(this),
            isPremium = this.props.isPremiumUser,
            message = createMessageStructure(
                this.state.email.value,
                this.getInputName(),
                this.props.compData.toEmailAddress,
                this.props.compData.bccEmailAddress,
                this.translatedKeys['subject' + (isPremium ? '_premium' : '')] + ' ' + (fields.email || fields.Email || fields[this.props.compData.emailFieldLabel]),
                this.props.metaSiteId,
                this.state.message && this.state.message.value,
                this.state.phone && this.state.phone.value,
                this.state.subject && this.state.subject.value,
                this.state.address && this.state.address.value
            );

        if (!experiment.isOpen('sendContactFormEmailsViaPong')) {
          message.htmlMessage = createHtmlMessage.call(this, fields, this.props.externalBaseUrl || '', isPremium);

          return message;
        }

        message.fields = fields;
        return message;
    }

    var COMMON_SERVICES_NOTIFICATION_PATH = '/_api/wix-common-services-webapp/notification/invoke';
    var FALLBACK_HOST = 'https://fallback.wix.com';
    var PONG_PATH = '/_api/crm-inbox-server/pong/message';

    function getSendMailEndpointUrl(externalBaseUrl) {
        var sendMessageEndpoint = experiment.isOpen('sendContactFormEmailsViaPong') ? PONG_PATH : COMMON_SERVICES_NOTIFICATION_PATH;

        //TODO: in preview mode, make changes to this.endpoint (need to add params: wixSession cookie, secured)
        if (!externalBaseUrl) { //preview
            var site = window.location.protocol + "//" + window.location.hostname;
            var cookie = cookieUtils.getCookie(WIX_CLIENT_COOKIE);
            var secured = 'Secured';
            var template = '{{site}}{{service}}{{secured}}?accept=json&contentType=json&appUrl={{site}}{{cookie}}';

            return template.replace(/\{\{site\}\}/g, site)
                .replace('{{service}}', sendMessageEndpoint)
                .replace('{{cookie}}', cookie)
                .replace('{{secured}}', secured);
        }

        var parsedUrl = utils.urlUtils.parseUrl(externalBaseUrl);
        var endpointUrl = parsedUrl.protocol + '//' + parsedUrl.host + sendMessageEndpoint +
            '?accept=json&contentType=json&appUrl=' + parsedUrl.protocol + '//' + parsedUrl.hostname;
        return endpointUrl;
    }

    function getFallbackUrl() {
        var url = FALLBACK_HOST + COMMON_SERVICES_NOTIFICATION_PATH + '?accept=json&contentType=json&appUrl=' + FALLBACK_HOST;
        return url;
    }

    function reportActivity(activityName, fields, activityInfo, fieldLabels) {
        var FormActivity = core.activityTypes[activityName];
        if (FormActivity) {
            core.activityService.reportActivity(new FormActivity(activityInfo, fields, fieldLabels));
        }
    }

    function shouldIgnoreActivity(props){
        return props.ignoreActivityReport || props.isTemplate;
    }

    function handleSubmitMessage() {
        var successMessage = this.props.compData.successMessage || this.translatedKeys.successMessage;
        this.showMessage(successMessage);
    }

    function handleSubmitLink() {
        var successLink = this.props.compData.link;
        if (!successLink) {
            return;
        }

        var linkVal = utils.linkRenderer.renderLink(successLink, this.props.linkRenderInfo, this.props.rootNavigationInfo);
        var successLinkData = utils.wixUrlParser.parseUrl(this.props.linkRenderInfo, utils.linkRenderer.getLinkUrlFromLinkProps(linkVal));
        if (!successLinkData) {
            return;
        }

        var anchorData = successLink.anchorDataId;
        _.assign(successLinkData, {anchorData: anchorData});

        if (successLinkData.pageId === this.props.rootNavigationInfo.pageId) {
            if (anchorData) {
                this.props.scrollToAnchor(anchorData);
            }
        } else {
            this.props.navigateToPage(successLinkData);
        }
    }

    function onSubmitSuccess(activityName) {
        this.props.reportBI(biEvents.FORM_SUBMIT_SUCCESS, {
            componentId: this.props.id,
            componentType: this.props.structure.componentType
        });

        this.setState({
            mailSent: true
        });

        if (this.props.compData.onSubmitBehavior === 'message') {
            handleSubmitMessage.call(this);
        } else {
            handleSubmitLink.call(this);
        }

        if (!shouldIgnoreActivity(this.props)) {
            reportActivity(activityName, this.getFieldsForActivityReporting(), this.props.activityInfo, this.getFieldLabels());
        }

        cleanForm.call(this, this.getFormInputs());
        this.isBusy = false;
    }

    var ERROR_STATUSES_TO_FALLBACK = ['abort', 'timeout'];

    function onSubmitError(response, status) {
        if (this.shouldSubmitFallbackRequest && _.includes(ERROR_STATUSES_TO_FALLBACK, status)) {
            this.props.reportBI(biErrors.FORM_SUBMIT_FAILURE, {
                componentId: this.props.id,
                componentType: this.props.structure.componentType,
                errorDesc: 'Unspecified error occurred, possibly a connection problem, fallback activated',
                response: response
            });
            submitFallbackRequest.call(this);
        } else {
            this.props.reportBI(biErrors.FORM_SUBMIT_FINAL_FALLBACK, {
                componentId: this.props.id,
                componentType: this.props.structure.componentType,
                errorDesc: 'Error occurred in Fallback Request',
                response: response
            });

            this.setState({
                mailSent: false
            });
            this.showMessage(this.translatedKeys.error, true);

            this.isBusy = false;
        }
    }

    function cleanForm(formInputs) {
        var newState = _.reduce(formInputs, function (res, key) {
            var inputKey = key.skinPart || key;
            res[inputKey] = this.state[inputKey];
            res[inputKey].value = '';

            return res;
        }, {}, this);

        this.setState(newState);
    }

    function getMessageTimeout(){
        if (experiment.isOpen('longer_timeouts_pong')) {
            return 30000;
        }
        return 8000;
    }

    function onSubmit() {
        if (this.shouldBlockSubmit && this.shouldBlockSubmit()) {
            this.blockSubmit(ReactDOM.findDOMNode(this));
            return;
        }
        var toEmail = this.props.compData.toEmailAddress;
        var isValidEmail = toEmail && toEmail !== 'a33012eff368a577d48f52f310c92140';
        if (!isValidEmail) {
            this.props.reportBI(biErrors.FORM_SUBMIT_INVALID_EMAIL, {
                email: toEmail
            });
            //this.showMessage(this.translatedKeys.noOwner, true);
        }

        var canSubmitNewRequest = !this.isBusy && this.isFormValid();
        if (canSubmitNewRequest) {
            this.shouldSubmitFallbackRequest = true;
            this.isBusy = true;
            var onSubmitAction = this.props.compData.onSubmitBehavior;
            if (onSubmitAction === 'message') {
                this.showMessage(this.translatedKeys.submitting);
            }

            this.props.reportBI(biEvents.FORM_SUBMIT, {
                componentId: this.props.id,
                componentType: this.props.structure.componentType
            });

            var emailMessage = createEmailMessage.call(this);
            ajax.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: getSendMailEndpointUrl(this.props.externalBaseUrl || ''),
                data: JSON.stringify(emailMessage),
                success: onSubmitSuccess.bind(this, this.getActivityName()),
                error: onSubmitError.bind(this),
                timeout: getMessageTimeout()
            });
        }
    }

    function submitFallbackRequest() {
        this.shouldSubmitFallbackRequest = false;
        var emailMessage = createEmailMessage.call(this);
        ajax.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            url: getFallbackUrl(),
            data: JSON.stringify(emailMessage),
            success: onSubmitSuccess.bind(this, this.getActivityName()),
            error: onSubmitError.bind(this)
        });
    }

    function getLanguage(cookie, currentUrl) {
        return utils.wixUserApi.getLanguage(cookie, currentUrl).toLowerCase() || 'en';
    }

    /*

     The following functions must be implemented in a form component in order to use formMixin:
     getFormInitialState,
     getFormSkinProperties,
     getFormFields,
     getFieldsForActivityReporting,
     getFieldLabels,
     isFormValid,
     getActivityName,
     getFormInputs,
     getInputName,
     getLangKeys

     */
    return {
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin],

        propTypes: {
            id: santaProps.Types.Component.id.isRequired,
            structure: santaProps.Types.Component.structure.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired,
            shouldResetComponent: santaProps.Types.RenderFlags.shouldResetComponent.isRequired,
            cookie: santaProps.Types.RequestModel.cookie.isRequired,
            currentUrl: santaProps.Types.currentUrl.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            isPremiumUser: santaProps.Types.isPremiumUser.isRequired,
            isTemplate: santaProps.Types.isTemplate.isRequired,
            metaSiteId: santaProps.Types.RendererModel.metaSiteId.isRequired,
            externalBaseUrl: santaProps.Types.PublicModel.externalBaseUrl,
            scrollToAnchor: santaProps.Types.scrollToAnchor.isRequired,
            navigateToPage: santaProps.Types.navigateToPage.isRequired,
            reportBI: santaProps.Types.reportBI.isRequired,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            activityInfo: santaProps.Types.Activity.activityInfo,
            ignoreActivityReport: React.PropTypes.bool
        },

        getInitialState: function () {
            this.shouldResetFields = this.props.shouldResetComponent;
            this.translatedKeys = this.getLangKeys(getLanguage(this.props.cookie, this.props.currentUrl));
            this.translatedKeys.submitting = '…';
            return _.merge(this.getFormInitialState(), {
                $mob: this.props.isMobileView ? 'mobile' : 'desktop',
                $dir: this.props.compData.textDirection || "left"
            });
        },

        showMessage: function (message, isError) {
            this.setState({
                notifications: {
                    message: message,
                    error: !!isError
                }
            });
        },

        componentWillReceiveProps: function (nextProps) {
            var newShouldResetFields = this.props.shouldResetComponent;

            if (newShouldResetFields && newShouldResetFields !== this.shouldResetFields) {
                cleanForm.call(this, this.getFormInputs());
            }
            this.shouldResetFields = newShouldResetFields;
            this.setState({
                $mob: nextProps.isMobileView ? 'mobile' : 'desktop',
                $dir: nextProps.compData.textDirection || "left"
            });
        },

        getSkinProperties: function () {
            if (this.state.notifications.message) {
                this.registerReLayout();
            }
            return _.merge(this.getFormSkinProperties(this.translatedKeys), {
                "": {
                    style: {
                        height: 'inherit'
                    }
                },
                submit: {
                    onClick: onSubmit.bind(this),
                    children: this.props.compData.submitButtonLabel || 'Send'
                }
            });
        }
    };
});
