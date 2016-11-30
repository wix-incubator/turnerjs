/**
 * @Class wysiwyg.editor.components.panels.PageSecurityPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.PageSecurityPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.utilize(['wysiwyg.common.utils.SiteMemberLanguages']);

    def.resources(['W.Config', 'W.Utils']);

    def.binds(['_onBeforeClose', '_togglePasswordInputField', '_radioValueToData', '_dataToRadioValue','_dataToPasswordInputValue','_passwordInputValueToData', '_resetSettings']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.statics({
        NONE       : "noRestriction",
        USER_LOGIN : "userLogin",
        PASSWORD   : "password",
        BLANK_PASSWORD : "",
        _selectedLanguage: "en"
    });

    /**
     * @lends wysiwyg.editor.components.panels.PageSecurityPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            var currentPageLogic = (args && args.previewComponent) || W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().$logic;
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._data = currentPageLogic.getDataItem();

            this._originalSecurityObj = {
                requireLogin : this._getRequireLogin(),
                passwordDigest: this._getPasswordDigest()
            };

            this._okCallback = args && args.okCallback;
            this._cancelCallback = args && args.cancelCallback;
            this._originalSecurityObj.dialogLanguage= this._data.get("pageSecurity").dialogLanguage;

        },

        _createFields: function(){
            var options =[
                { label: this._translate("PAGE_SECURITY_NO_RESTRICTION"), value: this.NONE},
                { label: this._translate("PAGE_SECURITY_REQUIRE_USER_LOGIN"), value: this.USER_LOGIN},
                { label: this._translate("PAGE_SECURITY_REQUIRE_PASSWORD_PROTECT"), value:this.PASSWORD }
            ];

            var $this = this;
            this.addBreakLine('10px');
            this.addSubLabel( this._translate("PAGE_SECURITY_PANEL_DESCRIPTION") );
            var radioField = this.addRadioButtonsField("", options, this.USER_LOGIN)
                .bindToField("pageSecurity")
                .bindHooks(this._radioValueToData, this._dataToRadioValue);


            radioField.runWhenReady( function (logic) {
                this._radioLogic = logic;
                this._radioLogic.addEvent("inputChanged", $this._togglePasswordInputField);
                var pageSecurity = this._data.get("pageSecurity");
                this._radioLogic.setValue( this._getDefaultRadioValue( pageSecurity ) );
                this._radioLogic.fireEvent("inputChanged"); // without it inputToData will not be called
            }.bind(this));

            this.addBreakLine('10px');
            var self=this;
            var languagesObj=new this.imports.SiteMemberLanguages();
            var langugesArr= languagesObj._getLanguages(this);
            this._selectedLanguage = this._getCurrentSelectedLanguage();
            this.addInputGroupField( function( panel ) {
                var placeHolder = this._translate("PAGE_SECURITY_PASSWORD_PH");

                panel._passField = this.addInputField(this._translate("PAGE_SECURITY_PASSWORD_LABEL") , placeHolder, 1, 15, {validators: [this._inputValidators.htmlCharactersValidator]});
                panel._passField.bindToField("pageSecurity") ;
                panel._passField.bindHooks(panel._passwordInputValueToData, panel._dataToPasswordInputValue) ;
                panel._passField.setValue("") ;


                panel._passField.runWhenReady( function (logic) {
                    var pwdDigest = this._data.get("pageSecurity").passwordDigest;
                    logic._skinParts.input.style.paddingLeft = "7px";
                    if (pwdDigest) {
                        logic.setInputType("password");
                        logic.setValue("BubblesBubbles", true);
                        logic.getViewNode().addEvent("keypress", function() {
                            logic.setValue("");
                            logic.setInputType("text");
                            logic.getViewNode().removeEvent("keypress", arguments.callee);
                        });
                    }

                }.bind(this));
                this.addBreakLine(10, "1px solid #E5E5E5", 7);
                var langsComboBox = this.addComboBoxField(this._translate("PAGE_SECURITY_CHOOSE_SITE_MEMBER_LANG"),langugesArr);
                langsComboBox._htmlElement.style.fontSize = "14px";
                langsComboBox._htmlElement.style.color = "#404040";
                langsComboBox.setValue(self._selectedLanguage);
                langsComboBox.addEvent(Constants.CoreEvents.INPUT_CHANGE, function (data) {
                    self._selectedLanguage = data.value;
                });
            }).runWhenReady( function (logic) {
                    logic.collapseGroup();
                    $this._passwordArea = logic;
                });




            this.addInputGroupField( function (panel) {
                this.addSubLabel(this._translate("PAGE_SECURITY_REQUIRE_USER_LOGIN_INFO")).runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyle("margin-bottom", "0px");

                });
                this.addBreakLine(10, "1px solid #E5E5E5", 7);
                var langsComboBox = this.addComboBoxField(this._translate("PAGE_SECURITY_CHOOSE_SITE_MEMBER_LANG"),langugesArr);
                langsComboBox._htmlElement.style.fontSize = "13px";
                langsComboBox.setValue(self._selectedLanguage);
                langsComboBox.addEvent(Constants.CoreEvents.INPUT_CHANGE, function (data) {
                    self._selectedLanguage = data.value;
                });
            }).runWhenReady( function (logic) {
                    logic.collapseGroup();
                    $this._requireLoginInfoArea = logic;
                });

            this._togglePasswordInputField();
        },

        _passwordInputValueToData: function ( password ) {
            // Digest Password
            var digest = W.Utils.hashing.SHA256.b64_sha256(password);
            return {
                requireLogin: false,
                passwordDigest : digest,
                dialogLanguage: this._selectedLanguage
            };
        },

        _dataToPasswordInputValue: function (data) {
            return this._passField.getValue();
        },

        _radioValueToData: function( value ) {
            switch (value) {
                case this.NONE:
                    return {
                        requireLogin: false,
                        passwordDigest: null,
                        dialogLanguage: this._data.get("pageSecurity").dialogLanguage
                    };
                case this.USER_LOGIN:
                    return {
                        requireLogin: true,
                        passwordDigest: null,
                        dialogLanguage: this._data.get("pageSecurity").dialogLanguage
                    };
                case this.PASSWORD:
                    return {
                        requireLogin: false,
                        passwordDigest: this._originalSecurityObj.passwordDigest || this.BLANK_PASSWORD,
                        dialogLanguage: this._data.get("pageSecurity").dialogLanguage
                    };
            }
        },

        _getDefaultRadioValue: function ( pageSecurityData) {
            if (pageSecurityData.passwordDigest) {
                return this.PASSWORD;
            } else if (pageSecurityData.requireLogin) {
                return this.USER_LOGIN;
            } else {
                return this.NONE;
            }
        },

        _dataToRadioValue: function (pageSecurityData) {
            if (pageSecurityData.requireLogin) {
                return this.USER_LOGIN;
            } else if (pageSecurityData.passwordDigest || pageSecurityData.passwordDigest == this.BLANK_PASSWORD) {
                return this.PASSWORD;
            } else {
                return this.NONE;
            }
        },

        _togglePasswordInputField: function () {
            if (!this._radioLogic || !this._passwordArea || !this._requireLoginInfoArea) {
                this.callLater(this._togglePasswordInputField);
                return;
            }

            if (this._radioLogic.getValue() == this.PASSWORD) {
                this._passwordArea.uncollapseGroup();
            } else {
                this._passwordArea.collapseGroup();
            }

            if (this._radioLogic.getValue() == this.USER_LOGIN) {
                this._requireLoginInfoArea.uncollapseGroup();
            } else {
                this._requireLoginInfoArea.collapseGroup();
            }
        },

        _getPasswordDigest: function() {
            var pageSecurity = this._data.get("pageSecurity");
            return pageSecurity && pageSecurity.passwordDigest;
        },

        _getRequireLogin: function() {
            var pageSecurity = this._data.get("pageSecurity");
            return pageSecurity && pageSecurity.requireLogin;
        },

        _onBeforeClose: function(e) {
            if (e && e.result == 'OK'){
                var checkboxState = true;
                var self = this;
                switch ( this._radioLogic.getValue() ) {
                    case this.USER_LOGIN:
                        this.injects().SMEditor.provisionIfNeeded( function() {
                            // Success
                            if (this._okCallback) {
                                this._okCallback( checkboxState );
                            }
                            self._data.set("pageSecurity", {
                                requireLogin:true,
                                passwordDigest: null,
                                dialogLanguage: self._selectedLanguage
                            });
                        }, this._resetSettings);
                        break;
                    case this.PASSWORD:
                        self._data.set("pageSecurity", {
                            requireLogin:false,
                            passwordDigest: this._data.get("pageSecurity").passwordDigest,
                            dialogLanguage: self._selectedLanguage
                        });
                        if (!this._getPasswordDigest() || !this._passField.getValue() || this._passField.getValue().length === 0) {
                            this._data.get("pageSecurity").passwordDigest = null;
                            checkboxState = false;
                            if (this._okCallback) {
                                this._okCallback(checkboxState) ;
                            }
                        }
                        break;
                    case this.NONE:
                        checkboxState = false;
                }

                // reset validation on this page
                var pageId = this._data.get("id");
                this.injects().Preview.getPreviewManagers().Viewer.setPageAsNotValidated( pageId );
            } else {
                this._resetSettings();
            }
        },

        _resetSettings: function() {
            this._data.set("pageSecurity", {
                requireLogin: this._originalSecurityObj.requireLogin,
                passwordDigest: this._originalSecurityObj.passwordDigest,
                dialogLanguage: this._originalSecurityObj.dialogLanguage
            });

            if (this._cancelCallback) {
                this._cancelCallback();
            }
        },
        _getCurrentSelectedLanguage: function (){
            var pageData = this._data.get("pageSecurity");
            if ((pageData.requireLogin === true || pageData.passwordDigest !== null)&& (pageData.dialogLanguage === undefined)){
                return "en";
            }else{
                return pageData.dialogLanguage || this.resources.W.Config.getLanguage() || "en";
            }
        }
    });
});