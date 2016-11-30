/**
 * @class wysiwyg.viewer.components.PasswordLogin
 */
define.component('wysiwyg.viewer.components.PasswordLogin', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Utils', 'W.Data', 'W.Config', 'W.Commands']);

    def.skinParts({
        'blockingLayer': {'type': 'htmlElement'},
        'passwordInput':{type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindPasswordField"},
        'submitButton': {'type': 'htmlElement'},
        'xButton': {'type': 'htmlElement', 'command': 'WViewerCommands.PasswordLogin.Close'},
        'cancel': {'type': 'htmlElement'},
        'favIcon': {'type': 'htmlElement'},
        'faveIconAhref': {'type': 'htmlElement'},
        'header': {'type': 'htmlElement'},
        'title': {'type': 'htmlElement'},
        'dialog': {'type': 'htmlElement'}
    });
    def.statics({
        langKeys: {
            en: {
                "PasswordLogin_Header":"Enter password to view this page",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Please enter the correct password",
                "PasswordLogin_Password":"Password",
                "PasswordLogin_Submit":"OK" //missing Translation
            },
            es: {
                "PasswordLogin_Wrong_Password": "Por favor introduce la clave correcta",
                "PasswordLogin_Password": "Clave",
                "PasswordLogin_Header": "Escribe la clave para ver esta página",
                "PasswordLogin_Submit": "OK", //missing Translation
                "PasswordLogin_Error_General": "Server error - Unable to log in"
            },
            de: {
                "PasswordLogin_Wrong_Password": "Bitte geben Sie das richtige Passwort ein.",
                "PasswordLogin_Password": "Passwort",
                "PasswordLogin_Header": "Geben Sie ein Passwort ein, um diese Seite zu sehen.",
                "PasswordLogin_Submit": "OK", //missing Translation,
                "PasswordLogin_Error_General": "Server error - Unable to log in"
            },
            fr: {
                "PasswordLogin_Header":"Veuillez saisir un mot de passe afin d'accéder à cette page",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Veuillez saisir le mot de passe correct",
                "PasswordLogin_Password":"Mot de passe",
                "PasswordLogin_Submit":"OK" //missing Translation

            },
            it: {
                "PasswordLogin_Header":"Inserisci la password per visualizzare questa pagina",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Ti preghiamo di inserire la password corretta",
                "PasswordLogin_Password":"Password",
                "PasswordLogin_Submit":"OK" //missing Translation
            },
            ja: {
                "PasswordLogin_Wrong_Password": "正しいパスワードを入力してください",
                "PasswordLogin_Password": "パスワード",
                "PasswordLogin_Header": "このページを開くためには、パスワードを入力する必要があります。",
                "PasswordLogin_Submit": "OK", //missing Translation
                "PasswordLogin_Error_General": "Server error - Unable to log in"
            },
            ko: {
                "PasswordLogin_Wrong_Password": "올바른 비밀번호를 입력하세요.",
                "PasswordLogin_Password": "비밀번호",
                "PasswordLogin_Header": "비밀번호를 입력하세요.",
                "PasswordLogin_Submit": "OK", //missing Translation
                "PasswordLogin_Error_General": "Server error - Unable to log in"
            },
            pl: {
                "PasswordLogin_Header":"Wpisz haslo, aby zobaczyc te strone",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Wpisz poprawne haslo",
                "PasswordLogin_Password":"Haslo",
                "PasswordLogin_Submit":"OK" //missing Translation
            },
            pt: {
                "PasswordLogin_Header":"Insira a senha para ver esta página",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Por favor, insira a senha correta",
                "PasswordLogin_Password":"Senha",
                "PasswordLogin_Submit":"OK" //missing Translation
            },
            ru: {
                "PasswordLogin_Wrong_Password": "Пожалуйста, введите правильный пароль",
                "PasswordLogin_Password": "Пароль",
                "PasswordLogin_Header": "Введите пароль, чтобы просмотреть эту страницу",
                "PasswordLogin_Submit": "OK", //missing Translation
                "PasswordLogin_Error_General": "Server error - Unable to log in"
            },

            nl:{
                "PasswordLogin_Header" : "Deze pagina is afgeschermd",
                "PasswordLogin_Error_General" : "Serverfout - kan niet inloggen",
                "PasswordLogin_Wrong_Password" : "Vul het juiste wachtwoord in",
                "PasswordLogin_Password" : "Wachtwoord",
                "PasswordLogin_Submit" : "Verzenden",
                "PasswordLogin_Cancel" : "Cancel",

                "PasswordLogin_AdministratorLogin" : "Administrator Login"
            },


            tr: {
                "PasswordLogin_Header":"Bu sayfayi görüntülemek için sifreyi girin",
                "PasswordLogin_Error_General":"Server error - Unable to log in",
                "PasswordLogin_Wrong_Password":"Lütfen dogru sifreyi girin",
                "PasswordLogin_Password":"Sifre",
                "PasswordLogin_Submit":"OK" //missing Translation
            },

            sv: {
                "PasswordLogin_Header" : "Skriv in lösenord för att visa den här sidan",
                "PasswordLogin_Error_General" : "Server error - Unable to log in",
                "PasswordLogin_Wrong_Password" : "Vänligen skriv in rätt lösenord",
                "PasswordLogin_Password" : "Lösenord",
                "PasswordLogin_Submit" : "Skicka",
                "PasswordLogin_Cancel" : "Cancel",
                "PasswordLogin_AdministratorLogin" : "Administrator Login"
            },

            no: {
                "PasswordLogin_Header" : "Angi passord for å vise denne siden",
                "PasswordLogin_Error_General" : "Server error - Unable to log in",
                "PasswordLogin_Wrong_Password" : "Angi riktig passord.",
                "PasswordLogin_Password" : "Passord",
                "PasswordLogin_Submit" : "Send",
                "PasswordLogin_Cancel" : "Cancel",
                "PasswordLogin_AdministratorLogin" : "Administrator Login"
            },

            da: {

                "PasswordLogin_Header" : "Indtast kodeord for at se denne side",
                "PasswordLogin_Error_General" : "Server error - Unable to log in",
                "PasswordLogin_Wrong_Password" : "Venligst indtast det korrekte kodeord",
                "PasswordLogin_Password" : "Kodeord",
                "PasswordLogin_Submit" : "Indsend",
                "PasswordLogin_Cancel" : "Cancel",
                "PasswordLogin_AdministratorLogin" : "Administrator Login"

            }
        },
        _keys:{}
    });
    def.binds(['centerDialog', '_onSubmit', '_reportError', '_invalidateErrorState', '_onKeyPress', '_handleCancel', '_onPasswordSuccess']);

    def.states({
        displayDevice : ['mobile']
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.isVolatile = true;
            this.parent(compId, viewNode, args);

            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);

            this.VIEWER_STRINGS = {
                'LOGIN_HEADER': "Enter password to view this page",
                'LOGIN_ERR_GENERAL': "Server error - Unable to log in",
                "LOGIN_ERR_WRONG_PASSWORD":"Please enter the correct password",
                'PASSWORD_LABEL': "Password"
            };

            this._digestedPassword = args && args.digestedPassword;
            this._authCallback = args && args.authCallback;
            this._disableCancel = args && args.disableCancel;

            this.resources.W.Commands.registerCommandAndListener("WPreviewCommands.ViewerStateChanged", this, this._onEditorModeChanged);
            if(this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState('mobile', 'displayDevice');
            }
            this._setDictionary((args&&args.dialogsLanguage) ?args.dialogsLanguage:"en");
        },
        _setDictionary: function (language){
            this._keys= language&&this.langKeys[language] ? this.langKeys[language] : this.langKeys["en"] ;
        },
        centerDialog: function() {
            var windowSize = this.resources.W.Utils.getWindowSize();
            var viewNode = this._skinParts.dialog;
            viewNode.setPosition({
                'x': (windowSize.width / 2) - (viewNode.getSize().x / 2),
                'y': (windowSize.height / 2) - (viewNode.getSize().y / 2)
            });
            this._skinParts.submitButton.value = this._keys["PasswordLogin_Submit"];

        },

        _onAllSkinPartsReady : function(parts) {

            if (this._disableCancel) {
                parts.xButton.hide();
                parts.cancel.setStyle("visibility", "hidden");
            }
            else {
                parts.cancel.addEvent("click", this._handleCancel);
                parts.xButton.addEvent("click", this._handleCancel);
                parts.blockingLayer.addEvent("click", function(event) {
                    if (event.target == parts.blockingLayer) {
                        this._handleCancel();
                    }
                }.bind(this));
            }


            parts.submitButton.addEvent("click", this._onSubmit);
            parts.title.set("text", this._keys["PasswordLogin_Header"]); //TODO: take it from viewer translations

            if (this.resources.W.Config.isPremiumUser()) {
                parts.faveIconAhref.removeAttribute('href');
                var favIconUri = (window.publicModel && window.publicModel.favicon);
                if (favIconUri) { // Only if premium
                    parts.favIcon.src = this.resources.W.Config.getMediaStaticUrl(favIconUri) + favIconUri;
                }
                else  {
                    parts.favIcon.src = this.resources.W.Config.getServiceTopologyProperty('staticThemeUrlWeb') + "/viewer/blank-favicon.png";
                }
            }

            parts.passwordInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyPress);

        },

        _handleCancel: function() {
            this._closeDialog();
            this._reportAuthStatusChange( false, {"cancel":true} );
        },

        _reportAuthStatusChange: function (success, data) {
            if (this._authCallback) {
                this._authCallback ({
                    authResponse: success,
                    data: data
                });
            }
        },

        _onEditorModeChanged: function(){
            this._handleCancel();
        },

        _onKeyPress: function(e) {
            if (e.code == 13) {
                this._onSubmit();
            }

            this._invalidateErrorState();
        },

        _onSubmit: function() {
            this._invalidateErrorState();

            var password = this._skinParts.passwordInput._data.get("text");
            this._validatePassword( password, function() {
                this._invalidateErrorState();
                this._onPasswordSuccess();
            }.bind(this), function( errMessage ) {
                // On error //
                this._reportError( errMessage );
            }.bind(this));
        },

        _onPasswordSuccess: function() {
            // On success //
            this._closeDialog();
            this._reportAuthStatusChange( true );
        },
        _closeDialog: function(){
            this.resources.W.Commands.executeCommand('WViewerCommands.PasswordLogin.Close', null, null);
            var cmdEditorMode = this.resources.W.Commands.getCommand("WPreviewCommands.WEditModeChanged");
            if (cmdEditorMode){
                  cmdEditorMode.unregisterListener(this);
            }
            var cmdViewerDevice = this.resources.W.Commands.getCommand("WPreviewCommands.ViewerStateChanged");
            if (cmdViewerDevice){
                cmdViewerDevice.unregisterListener(this);
            }
        },

        _validatePassword: function( password, onSuccess, onError) {
            if (this._digestedPassword) {
                var digest = W.Utils.hashing.SHA256.b64_sha256(password);
                if (digest == this._digestedPassword) {
                    onSuccess();
                }
                else {
                    onError(  this._keys["PasswordLogin_Wrong_Password"] ); // Illegal password
                }
            }
        },

        _reportError: function (errMsg) {
            this._skinParts.passwordInput.setError(errMsg);
        },

        _invalidateErrorState: function() {
            this._skinParts.passwordInput.setValidationState(true);
        },

        _bindPasswordField: function (definition) {
            definition.argObject = {
                label: this._keys["PasswordLogin_Password"],
                passwordField: true
            };

            definition.dataItem = this.resources.W.Data.createDataItem({'text': '', 'type':'Text'}, 'Text');
            return definition;
        }

    });

});