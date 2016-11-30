/**
 * @Class wysiwyg.editor.components.panels.ContactFormPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.ContactFormPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.resources(['W.Resources', 'W.Data', 'W.Config', 'W.Experiments', 'W.Utils']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ContactForm']);

    def.propertiesSchemaType('ContactFormProperties');

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._optionalFields = ['nameFieldLabel', 'emailFieldLabel', 'phoneFieldLabel', 'addressFieldLabel', 'subjectFieldLabel', 'messageFieldLabel'];
        },

        _onAllSkinPartsReady: function () {
            if (this.resources.W.Config.siteNeverSavedBefore()) {
                this._translateUserMsg();
            }
        },

        _dropGatewayEmail: function (logic) {
            logic._skinParts.input.addEvent('change', function () {
                this._previewComponent.setComponentProperty('useCookie', false);
            }.bind(this));
        },

        _doPlaceholder: function (dataKey) {
            if (!/(email|name)/.test(dataKey)) {
                return 'Field label';
            }

            return dataKey.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/(.)/, function (s) {
                return s.toUpperCase();
            });
        },

        _createFields: function () {
            var panel = this,
                mailValidator = {
                    validators: [this._validateEmailAddress.bind(panel)]
                },
                bccFieldValidator = {
                    validators: [this._validateEmailOrLeaveBlank.bind(panel)]
                },
                messageValidator = {
                    validators: [this._validateMessage.bind(panel)]
                },
                setHeight = function (logic) {
                    logic._skinParts.textarea.style.resize = 'none';
                },
                iconObj = [
                    {
                        value: 'left',
                        image: 'radiobuttons/radio_button_states.png',
                        dimensions: {
                            w: '35px',
                            h: '33px'
                        },
                        icon: 'radiobuttons/alignment/left.png'
                    },
                    {
                        value: 'right',
                        image: 'radiobuttons/radio_button_states.png',
                        dimensions: {
                            w: '35px',
                            h: '33px'
                        },
                        icon: 'radiobuttons/alignment/right.png'
                    }
                ],

                jabber = {
                    'fppTitle': panel._translate('FPP_CForm'),
                    'style': panel._translate('CHOOSE_STYLE_COMPONENT_CForm'),
                    'addComp': panel._translate('ADD_CFORM'),
                    'compName': panel._translate('COMP_CForm'),
                    'compDesc': panel._translate('COMP_DESC_CForm'),
                    'emailTo': panel._translate('CFORM_FIELDS_emailTo'),
                    'bccTo': panel._translate('CFORM_FIELDS_bccTo'),
                    'reqDesc': panel._translate('CFORM_DESC_required'),
                    'sending': panel._translate('SENDING'),
                    'tip_email': 'CForm_toEmailAddress',
                    'tip_required': 'CForm_required_field',
                    'tip_txtDir': 'CForm_textDirection',
                    'tip_btn': 'CForm_submitButtonLabel',
                    'tip_okMsg': 'CForm_successMessage',
                    'tip_errMsg': 'CForm_errorMessage',
                    'tip_errValidMsg': 'CForm_validationErrorMessage',
                    'fld_name': panel._translate('CFORM_FIELDS_name'),
                    'fld_email': panel._translate('CFORM_FIELDS_email'),
                    'fld_phone': panel._translate('CFORM_FIELDS_phone'),
                    'fld_subject': panel._translate('CFORM_FIELDS_subject'),
                    'fld_message': panel._translate('CFORM_FIELDS_message'),
                    'fld_address': panel._translate('CFORM_FIELDS_address'),
                    'fld_placeholder': panel._translate('CFORM_FIELDS_placeholder'),
                    'msg_submit': panel._translate('CFORM_FIELDS_submitButtonLabel'),
                    'msg_success': panel._translate('CFORM_FIELDS_successMessage'),
                    'msg_error': panel._translate('CFORM_FIELDS_errorMessage'),
                    'msg_validationError': panel._translate('CFORM_FIELDS_validationErrorMessage'),
                    'err_toLong': panel._translate('CFORM_ERRORS_toLong'),
                    'err_toShort': panel._translate('CFORM_ERRORS_toShort'),
                    'err_noOwner': panel._translate('CFORM_ERRORS_noOwner'),
                    'err_404': panel._translate('CFORM_ERRORS_404'),
                    'err_main': panel._translate('CFORM_ERRORS_main'),
                    'err_timeOut': panel._translate('CFORM_ERRORS_timeOut'),
                    'ttl_fields': panel._translate('CFORM_TITLES_fields'),
                    'ttl_directions': panel._translate('CFORM_TITLES_directions'),
                    'ttl_req': panel._translate('CFORM_TITLES_directions'),
                    'ttl_texts': panel._translate('CFORM_TITLES_texts')
                };

            this.addInputGroupField(function () {
                this.addInputField(jabber.emailTo, 'Enter email address', 0, 200, mailValidator, null, jabber.tip_email).bindToField("toEmailAddress").runWhenReady(panel._dropGatewayEmail.bind(panel));
                this.addInputField(jabber.bccTo, null, 0, 200, bccFieldValidator).bindToField("bccEmailAddress");
            });

            this.resources.W.Data.getDataByQuery("#STYLES", this._createStylePanel);

            this.addInputGroupField(function () {
                this.addLabel(jabber.ttl_directions, null, null, null, null, null, jabber.tip_txtDir);
                this.addRadioImagesField('', iconObj, 'left', '', 'inline').bindToField('textDirection');
            });

            var optionalFieldsGroup = this.addInputGroupField(function () {
                this.addLabel(jabber.ttl_fields, {'margin': '0'}, null, null, null, null, jabber.tip_required);
                this.addLabel(jabber.reqDesc, null, null, 'icons/mandatory-single-icon.png', null, {
                    width: '25px',
                    height: '22px',
                    'margin-right': '5px'
                }).runWhenReady(function (logic) {
                        logic._skinParts.icon.style.marginRight = '5px';
                    });

                panel._optionalFields.forEach(function (dataKey) {
                    this.addInputGroupField(function () {
                        var propertyHiddenName = 'hidden_' + dataKey,
                            propertyRequiredName = 'required_' + dataKey,
                            isHiddenLogic,
                            textInputLogic,
                            isRequiredLogic,
                            isVisibleInputProxy = this.addCheckBoxField()
                                .bindToProperty(propertyHiddenName)
                                .runWhenReady(function (logic) {
                                    isHiddenLogic = logic;
                                }),
                            textInputFieldProxy = this.addInputField(null, panel._doPlaceholder(dataKey), 0, 64)
                                .bindToField(dataKey)
                                .runWhenReady(function (logic) {
                                    textInputLogic = logic;
                                }),
                            isRequiredInputFieldProxy = this.addCheckBoxImageField(null, null, 'icons/required.png', {w: '25px', h: '22px'})
                                .bindToProperty(propertyRequiredName)
                                .runWhenReady(function (logic) {
                                    isRequiredLogic = logic;
                                });

                        setTimeout(function () {
                            if (!isHiddenLogic._isDisposed && !isHiddenLogic.getValue()) {
                                isRequiredLogic.disable();
                                textInputLogic.disable();
                            }

                            if (textInputLogic._dataFieldName === 'emailFieldLabel') {
                                isRequiredLogic._stopListeningToInput();
                                isHiddenLogic._stopListeningToInput();
                                isRequiredLogic.disable();
                                isHiddenLogic.disable();
                            }
                        }, 100);

                        if (dataKey === 'emailFieldLabel') {
                            panel.addEnabledCondition(isVisibleInputProxy, function () {
                                return false;
                            });

                            panel.addEnabledCondition(isRequiredInputFieldProxy, function () {
                                return false;
                            });

                            panel.addEnabledCondition(textInputFieldProxy, function () {
                                return true;
                            });
                        } else {
                            panel.addEnabledCondition(textInputFieldProxy, function () {
                                return !!panel._previewComponent.getComponentProperty(propertyHiddenName);
                            });

                            panel.addEnabledCondition(isRequiredInputFieldProxy, function () {
                                return !!panel._previewComponent.getComponentProperty(propertyHiddenName);
                            });
                        }

                    }, 'cform');
                }.bind(this));

            }).hideOnMobile();

            this.addInputGroupField(function () {
                this.addTextAreaField(jabber.msg_submit, '30px', null, null, messageValidator, 'default')
                    .bindToField('submitButtonLabel')
                    .runWhenReady(setHeight);

                this.addTextAreaField(jabber.msg_success, '30px', null, null, messageValidator, 'default', jabber.tip_okMsg)
                    .bindToField('successMessage')
                    .runWhenReady(setHeight);

                this.addTextAreaField(jabber.msg_error, '30px', null, null, messageValidator, 'default', jabber.tip_errValidMsg)
                    .bindToField('errorMessage')
                    .runWhenReady(setHeight);

                this.addTextAreaField(jabber.msg_validationError, '30px', null, null, messageValidator, 'default', jabber.tip_errMsg)
                    .bindToField('validationErrorMessage')
                    .runWhenReady(setHeight);
            });

            this.addAnimationButton();
        },

        _translateUserMsg: function () {
            var data = this._previewComponent.getDataItem();
            this._translateIfAllowed(data, 'submitButtonLabel', 'CFORM_user_submitButtonLabel', 'Send');
            this._translateIfAllowed(data, 'successMessage', 'CFORM_user_successMessage', 'Your details were sent successfully!');
            this._translateIfAllowed(data, 'errorMessage', 'CFORM_user_errorMessage', 'Please provide a valid email');
            this._translateIfAllowed(data, 'validationErrorMessage', 'CFORM_user_validationErrorMessage', 'Please fill in all required fields.');

            this._translateIfAllowed(data, 'nameFieldLabel', 'CFORM_FIELDS_name', 'Name');
            this._translateIfAllowed(data, 'emailFieldLabel', 'CFORM_FIELDS_email', 'Email');
            this._translateIfAllowed(data, 'phoneFieldLabel', 'CFORM_FIELDS_phone', 'Phone');
            this._translateIfAllowed(data, 'subjectFieldLabel', 'CFORM_FIELDS_subject', 'Subject');
            this._translateIfAllowed(data, 'messageFieldLabel', 'CFORM_FIELDS_message', 'Message');
            this._translateIfAllowed(data, 'addressFieldLabel', 'CFORM_FIELDS_address', 'Address');
        },

        _translateIfAllowed: function (data, dataKey, translationKey, defaultValue) {
            var comp = this._previewComponent;
            if (comp._canKeyBeTranslated(dataKey) && !comp._isKeyOveriddenByUser(dataKey)) {
                data.set(dataKey, this._translate(translationKey, defaultValue));
            }
        },
        _validateMessage: function (text) {
            if (/[\>\<[\]\{\}\(\)\%\$\#\~\&\^]/g.test(text)) {
                return this._translate('INPUT_INVALID_CHARACTERS');
            }
            if (text.trim().length < 2) {
                return this._translate('CFORM_ERRORS_toShort');
            }
            if (text.trim().length > 200) {
                return this._translate('CFORM_ERRORS_toLong');
            }
        },
        _validateEmailAddress: function (text) {
            if (!this.resources.W.Utils.isValidEmail(text)) {
                return this._translate('CFORM_ERRORS_badMail');
            }
        },

        _validateEmailOrLeaveBlank: function(text) {
            if(text !== '') {
                return this._validateEmailAddress(text);
            }
        }
    });
});
