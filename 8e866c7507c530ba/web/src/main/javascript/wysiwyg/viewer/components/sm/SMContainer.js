/** @type wysiwyg.viewer.components.sm.SMContainer */
define.component('wysiwyg.viewer.components.sm.SMContainer', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent') ;

    def.resources(['W.Config', 'W.Utils', 'W.Viewer', 'W.Commands', 'W.SiteMembers']);

    def.binds(['_handleSubmit','onFormError','onFormSuccess', '_getCurrentForm', '_handleCancel', '_handleConfirmationOk']) ;

    def.states({
        DEFAULT: ['normal', 'confirm'] ,
        displayDevice : ['mobile']
    }) ;

    def.skinParts({
        'blockingLayer': {'type': 'htmlElement'},
        'submitButton': {type: "htmlElement"},
        'okButton': {type: "htmlElement"},
        'content': {type: "htmlElement"},
        'contentInner': {hookMethod:"_createInnerDialog"},
        'confirmationText': {type: "htmlElement"},
        'errMsg': {type:'htmlElement'},
        'title': {type: "htmlElement"},
        'infoTitle': {type: "htmlElement"},
        'note': {type: "htmlElement"},
        'cancel': {type: "htmlElement"},
        'xButton' : {type: "htmlElement"}
    }) ;

    def.statics({
        INTENTS: {
            LOGIN: "LOGIN",
            REGISTER: "REGISTER",
            UPDATE_USER: "UPDATE",
            EMAIL_RESET_PASSWORD: "EMAILRESETPASSWORD",
            RESET_PASSWORD: "RESETPASSWORD"
        },
        langKeys: {
            en: {
                "SMContain_Cancel": "Cancel",
                "SMContainer_Need_Log_In":"To view this page, you need to be logged in.",
                "SMContainer_Show_Confirm":"This page is protected with a member login. Your users will be able to see this page once they are logged in.",
                "SMContainer_Show_Confirm2":" To manage your site's members, go to your site in My Account and click Site Members",
                "SMContainer_OK":"OK"
            },
            es: {
                "SMContain_Cancel": "Cancelar",
                "SMContainer_Need_Log_In":"Para ver esta página, tienes que iniciar sesión.",
                "SMContainer_Show_Confirm":"Esta página está protegida con un login de miembro. Tus usuarios podrán ver esta página una vez hayan iniciado sesión.",
                "SMContainer_Show_Confirm2":"Para administrar los miembros de tu sitio, ve a tu sitio y en Mi Cuenta haz clic en Miembros del Sitio",
                "SMContainer_OK":"OK"
            },
            de: {
                "SMContain_Cancel": "Abbrechen",
                "SMContainer_Need_Log_In":"Sie müssen angemeldet sein, um diese Seite zu sehen.",
                "SMContainer_Show_Confirm":"Diese Seite ist mit der Mitgliederanmeldung geschützt. Ihre Besucher können diese Seite erst sehen, wenn diese angemeldet sind.",
                "SMContainer_Show_Confirm2":"Gehen Sie zu \"Mein Konto\" und klicken Sie auf \"Site-Mitglieder\", um Ihre Mitglieder zu verwalten.",
                "SMContainer_OK":"OK"
            },
            fr: {
                "SMContain_Cancel": "Annulation",
                "SMContainer_Need_Log_In":"Pour voir cette page, vous devez être connecté",
                "SMContainer_Show_Confirm":"Cette page est protégée par une connexion membre. Vos utilisateurs verront cette page une fois qu'ils seront connectés.",
                "SMContainer_Show_Confirm2": "Pour gérer vos membres, allez sur votre site dans Mon Compte et cliquez sur Membres du Site.",
                "SMContainer_OK":"OK"
            },
            it: {
                "SMContain_Cancel": "Cancella",
                "SMContainer_Need_Log_In":"Per visualizzare questa pagina, devi aver fatto il login.",
                "SMContainer_Show_Confirm":"Questa pagina è protetta da un login membri. I tuoi utenti saranno in grado di vedere questa pagina una volta che avranno effettuato l'accesso.",
                "SMContainer_Show_Confirm2":"Per gestire i membri del tuo sito, vai nel tuo sito ne Il Mio Account e clicca Membri del Sito",
                "SMContainer_OK":"OK"
            },
            ja: {
                "SMContain_Cancel": "キャンセル",
                "SMContainer_Need_Log_In":"ページにアクセスするには、ログインしてください",
                "SMContainer_Show_Confirm": "このページは会員専用ページです。サイト訪問者はログイン後、このページにアクセスすることができます。",
                "SMContainer_Show_Confirm2": "サイト会員の管理は、マイアカウントの「サイト会員」セクションで行います。",
                "SMContainer_OK":"OK"
            },
            ko: {
                "SMContain_Cancel": "취소",
                "SMContainer_Need_Log_In":"이 페이지를 보려면 로그인하세요.",
                "SMContainer_Show_Confirm": "회원 로그인 기능으로 보호되어 있는 페이지입니다. 방문자들은 로그인 후에 이 페이지에 접속할 수 있습니다.",
                "SMContainer_Show_Confirm2": "내 사이트 회원들을 관리하려면 \"내 계정\" 페이지에서 내 사이트로 이동해 \"사이트 회원\"을 클릭합니다.",
                "SMContainer_OK":"확인"
            },
            pl: {
                "SMContain_Cancel": "Anuluj",
                "SMContainer_Need_Log_In":"Musisz być zalogowany, aby zobaczyć tę stronę.",
                "SMContainer_Show_Confirm":"Ta strona jest zabezpieczona loginem witryny. Twoi użytkownicy zobaczą treść tej strony po zalogowaniu.",
                "SMContainer_Show_Confirm2":"Aby zarządzać użytkownikami twojej witryny, idź do Mojego Konta i kliknij na Login Witryny.",
                "SMContainer_OK":"OK"
            },
            pt: {
                "SMContain_Cancel": "Cancelar",
                "SMContainer_Need_Log_In":"Para ver esta página, você precisa fazer login.",
                "SMContainer_Show_Confirm":"Esta página está protegida com login de membros. Seus usuários poderão ver esta página depois de fazerem login.",
                "SMContainer_Show_Confirm2":"Para gerenciar os membros de seu site, vá para seu site em Minha Conta e clique em Membros do Site",
                "SMContainer_OK":"OK"
            },
            ru: {
                "SMContain_Cancel": "Отменить",
                "SMContainer_Need_Log_In":"Для просмотра страницы введите пароль",
                "SMContainer_Show_Confirm": "Страница доступна только зарегистрированным пользователям. Пользователи смогут увидеть эту страницу только если они залогинились на сайт.",
                "SMContainer_Show_Confirm2": "Для управления пользователями сайта перейдите в Мой Аккаунт и нажмите на Пользователи сайта",
                "SMContainer_OK":"OK"
            },

            nl: {

                "SMContain_Cancel" : "Annuleren",
                "SMContainer_Need_Log_In" : "U moet inloggen om deze pagina te bekijken.",
                "SMContainer_Show_Confirm" : "Deze pagina is afgeschermd met een inlogscherm. Bezoekers kunnen deze pagina zien zodra ze zijn ingelogd.",
                "SMContainer_Show_Confirm2" : "Ga naar Mijn websites > Website beheren > Mijn contactpersonen > Websiteleden om uw websiteleden te beheren",
                "SMContainer_OK" : "OK"
            },


            tr: {
                "SMContain_Cancel": "İptal",
                "SMContainer_Need_Log_In":"Bu sayfayı görüntülemek için giriş yapmanız gerekir.",
                "SMContainer_Show_Confirm":"Bu sayfa üye girişiyle korunmaktadır. Kullanıcılarınız giriş yaptıktan sonra bu sayfayı görebilecekler.",
                "SMContainer_Show_Confirm2":"Sitenizin üyelerini yönetmek için Hesabım'dan sitenize gidip Site Üyeleri üstünde tıklatın.",
                "SMContainer_OK":"OK"
            },


            sv: {
                "SMContain_Cancel" : "Avbryt",
                "SMContainer_Need_Log_In" : "Om du vill visa den här sidan måste du logga in.",
                "SMContainer_Show_Confirm" : "Den här sidan skyddas av en medlemsinloggning. Dina användare kan se den här sidan först när de har loggat in.",
                "SMContainer_Show_Confirm2" : "To manage your site's members, go to your My Sites> Manage Site> My Contacts> Site Members",
                "SMContainer_OK" : "OK"
            },


            no: {
                "SMContain_Cancel" : "Avbryt",
                "SMContainer_Need_Log_In" : "Du må logge på for å se denne siden.",
                "SMContainer_Show_Confirm" : "Denne siden er beskyttet med medlemspålogging. Brukerne vil se denne siden når de logger på.",
                "SMContainer_Show_Confirm2" : "To manage your site's members, go to your My Sites> Manage Site> My Contacts> Site Members",
                "SMContainer_OK" : "OK"
            },

            da: {

                "SMContain_Cancel" : "Annuller",
                "SMContainer_Need_Log_In" : "For at se denne side skal du logge ind.",
                "SMContainer_Show_Confirm" : "Denne side er beskyttet med et login til medlemmer. Dine brugere vil kunne se denne side, når de er logget ind.",
                "SMContainer_Show_Confirm2" : "To manage your site's members, go to your My Sites> Manage Site> My Contacts> Site Members",
                "SMContainer_OK" : "OK"


            }


        },
        _keys:{}
    }) ;

    def.methods({
        initialize: function (compId, viewNode, args) {
            this._args = args;
            this._initiatorId = this._initiatorId || args && args.initiator;
            this.isVolatile = true;
            this.parent(compId, viewNode, args);
            this._intent = args && args.intent;
            this._authCallback = args && args.authCallback;
            this._hashRedirectTo = args && args.hashRedirectTo;
            this._cameFromHashChange = args &&args.cameFromHashChange;
            this._openedByPageSecurity = args && args.openedByPageSecurity;
            this._disableCancel = args && args.disableCancel;
            this._shouldCloseContainer = true ;
            this._formData = args && args.formData ;
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._closeSMContainer);
            this.resources.W.Commands.registerCommandAndListener("WPreviewCommands.ViewerStateChanged", this, this._closeSMContainer);

            if(this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState('mobile', 'displayDevice');

            }
        },

        _onAllSkinPartsReady: function( parts ){
            this.setState("normal", 'DEFAULT');

            parts.submitButton.addEvent("click", this._handleSubmit);

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

            parts.okButton.addEvent("click", this._handleConfirmationOk);

            this._initializeForm( parts.contentInner);

            this.callLater( this.centerDialog );
            this._updateTranslation();
        },
        _setDictionary: function(language){
            this._keys= language&&this.langKeys[language] ? this.langKeys[language] : this.langKeys["en"] ;
        },
        _updateTranslation : function(){
            this._skinParts.cancel.innerHTML = this._keys["SMContain_Cancel"];
            this._skinParts.okButton.value = this._keys["SMContainer_OK"];
        },
        _getFormType: function( intent ) {
            var siteMembersMgr = this.resources.W.SiteMembers;
            if (!intent) {
                if (siteMembersMgr.isNotAuthenticatedWithCookie()) {
                      intent = this.INTENTS.LOGIN;
                } else {
                    intent = this.INTENTS.REGISTER;
                }
            }

            switch  (intent) {
                case "REGISTER":
                    var collectionType = siteMembersMgr.getCollectionType();
                    switch (collectionType) {
                        case "Open":
                            return "register";
                        case "ApplyForMembership":
                            return "applyForMembership";
                    }
                    break;
                case "LOGIN":
                    return "login";
//                case "UPDATE":
//                    return "profile"
            }
        },

        _createInnerDialog: function( definition) {
            this._assureIntentExists() ;
            this._enrichDefinitionByType(definition);
            return definition ;
        },

        _assureIntentExists: function() {
            var siteMembersMgr = this.resources.W.SiteMembers;
            if (!this._intent) {
                if (siteMembersMgr.isNotAuthenticatedWithCookie()) {
                    this._intent = this.INTENTS.LOGIN;
                } else {
                    this._intent = this.INTENTS.REGISTER ;
                }
            }
        },

        _enrichDefinitionByType: function(definition) {
            var type = null;
            switch (this._intent) {
                case this.INTENTS.REGISTER:
                    var collectionType = this.resources.W.SiteMembers.getCollectionType();
                    switch (collectionType) {
                        case "Open": type = "register"; break;
                        case "ApplyForMembership": type = "applyForMembership"; break;
                        default : type = "register"; break;
                    }
                    break;
                case this.INTENTS.LOGIN: type = "login"; break ;
                case this.INTENTS.EMAIL_RESET_PASSWORD: {
                    type = 'ResetPasswordEmail' ; break ;
                }
                case this.INTENTS.RESET_PASSWORD: {
                    type = 'ResetPassword' ; break ;
                }; break ;
            }

            if (type !== null) {
                this._enrichDefinitionType(definition, type);
            }
            return definition;
        },

        _enrichDefinitionType: function(definition, type) {
            definition.type = 'wysiwyg.viewer.components.sm.SM' + type.capitalize();
            definition.skin = 'wysiwyg.viewer.skins.sm.SM' + type.capitalize() + 'Skin';
            definition.argObject = { container: this, formData: this._formData};
        },

        _setConfirmationOkCaption: function(captionToSet) {
            this._skinParts.okButton.value = captionToSet ;
        },

        _initializeForm: function( innerCompLogic ) {
            this._currentForm = innerCompLogic;

             var header = this._skinParts.title;
             header.set("html", this._currentForm.getDisplayName());

             var submitButton = this._skinParts.submitButton;
             submitButton.set("value", this._currentForm.getButtonLabel());

             var subHeader = this._skinParts.note;
             var subHeaderObj = this._currentForm.getSubHeaderElement();
             if (subHeaderObj) {
                 var el = subHeaderObj.el;
                 var intent = subHeaderObj.intent;
                 el.getElements("a").addEvent("click", function() {
                     this.resources.W.SiteMembers.openSiteMembersPopup({
                         'intent': intent,
                         'disableCancel': this._disableCancel,
                         'openedByPageSecurity': this._openedByPageSecurity,
                         'hashRedirectTo': this._hashRedirectTo,
                         'cameFromHashChange' : this._cameFromHashChange,
                        'formData': this._formData,
                        'dialogsLanguage':this._args.dialogsLanguage
                     });
                 }.bind(this));

                 subHeader.adopt(el.childNodes);
             }

            this._addCurrentFormEvents();
            this._setDictionary(this._args.dialogsLanguage);
            if (this._openedByPageSecurity) {
               if( this.resources.W.Config.env.$isPublicViewerFrame || this.resources.W.Config.isInDebugMode()) {
                    this._skinParts.infoTitle.set("text", this._keys["SMContainer_Need_Log_In"] );
                   this._skinParts.note.setStyle("float", "right"); //TODO: ??
                   this._skinParts.infoTitle.setStyle("display", "block");
               }
               else {
                    this.showConfirmation({message: ''.concat(this._keys["SMContainer_Show_Confirm"],
                        this._keys["SMContainer_Show_Confirm2"])}, function() {
                       this.reportAuthStatusChange(true);
                       this._closeSMContainer();
                   }.bind(this));
               }

            }
        },

        setActiveForm: function (formType) {
//            this._initializeForm ( innerCompLogic, onFormCreation )
        },

        centerDialog: function() {
           var viewNode = this._skinParts.dialog;
           viewNode.setStyles({
                   'margin-left':  -(viewNode.getSize().x / 2),
                   'margin-top':  -(viewNode.getSize().y / 2)
           });
        },

        _removeCurrentFormEvents:function () {
           var currentForm = this._getCurrentForm();
           currentForm.removeEvent("error", this._onFormError);
           currentForm.removeEvent("success", this._onFormSuccess);
        },

        _addCurrentFormEvents:function () {
           var currentForm = this._getCurrentForm();
           currentForm.addEvent("error", this._onFormError);
           currentForm.addEvent("success", this._onFormSuccess);
        },

        onFormError: function ( errMsg ) {
            this._skinParts.errMsg.set("html", errMsg);
        },

        onFormSuccess: function  ( data ) {
            this._closeSMContainer();
        },

        closeAndRedirect: function() {
          this._closeSMContainer();

          if (this._hashRedirectTo && !this._cameFromHashChange){
              var parts = this.resources.W.Utils.hash.getHashParts( this._hashRedirectTo );
              this.resources.W.Utils.hash.setHash(parts.id, parts.title, parts.extData, true);
              window.location.hash = this._hashRedirectTo;
          }
          location.reload();
        },

        reportAuthStatusChange: function (success, data ) {
            if (this._authCallback) {
                this.resources.W.SiteMembers.reportAuthStatusChange (this._authCallback, success,  data );
            }
        },

        showConfirmation: function(confirmationTexts, confirmCallback, shouldCloseContainer) {
            this.setState("confirm", 'DEFAULT') ;
            this._updateConfirmationDialogTexts(confirmationTexts);
            this._confirmCallback = confirmCallback ;
            this._shouldCloseContainer = shouldCloseContainer ;
            if(shouldCloseContainer === undefined) {
                this._shouldCloseContainer = true ;
            }
        },

        _updateConfirmationDialogTexts: function (confirmationTexts) {
            this._skinParts.confirmationText.set("text", confirmationTexts.message);
            this._skinParts.confirmationTitleText.set("text", confirmationTexts.title);
        },

        _handleConfirmationOk: function () {
            if (this._confirmCallback) {
                this._confirmCallback();
            }

            if (this._shouldCloseContainer) {
                this._closeSMContainer();
            }
            this._shouldCloseContainer = true;
        },

        closeAndRedirectTo: function (urlToRedirectTo) {
            this._closeSMContainer();

            if (this._hashRedirectTo && !this._cameFromHashChange) {
                var parts = this.resources.W.Utils.hash.getHashParts(this._hashRedirectTo);
                this.resources.W.Utils.hash.setHash(parts.id, parts.title, parts.extData, true);
                window.location.hash = this._hashRedirectTo;
            }
            if (urlToRedirectTo) {

                 urlToRedirectTo = this._removeResetForgotPasswordParameterIfExists() ;
                this._directToUrl(urlToRedirectTo);
            } else {
                this._reload();
            }
        },
        _removeResetForgotPasswordParameterIfExists: function() {
            var url = window.location.href ;
            if(url.indexOf(this.resources.W.SiteMembers.RESET_PASSWORD_KEY_PARAMETER) >= 0) {
                return this._removeParameterFromUrl(url, this.resources.W.SiteMembers.RESET_PASSWORD_KEY_PARAMETER) ;
            }
            return url ;
        },

        _removeParameterFromUrl: function(url, parameterToRemove) {
            if(url && parameterToRemove) {
                var paramBeginIndex = url.indexOf(parameterToRemove) ;
                if(paramBeginIndex >= 0) {
                    var paramEndIndex = url.substr(paramBeginIndex).indexOf("&") ;
                    if(paramEndIndex < 0) {
                        paramEndIndex = url.length ;
                    }
                    return url.slice(0, paramBeginIndex) + url.slice(paramBeginIndex + paramEndIndex + "&".length) ;
                }
            }
            return url ;
        },
        _directToUrl: function (urlToRedirectTo) {
            if (urlToRedirectTo) {
                this._setURL(urlToRedirectTo);
                if (this._isUrlContainHash(urlToRedirectTo)) {
                    setTimeout(function () {
                        this._reload();
                    }.bind(this), 10);
                }
            }
        },

        _isUrlContainHash: function (url) {
            return String(url).indexOf("#") !== -1;
        },

        _setURL: function (urlToSet) {
            location.href = urlToSet;
        },

        _reload: function () {
            location.reload();
        },

        _handleCancel: function() {
            this._getCurrentForm().onCancel();
            this.reportAuthStatusChange( false, {cancel: true});
            this._closeSMContainer();
        },

        _onKeyPress: function(e) {
            if (e.code == 13) {
                this._handleSubmit();
            }
        },

        _handleSubmit: function() {
            if (!this.resources.W.Config.env.$isPublicViewerFrame && !this.resources.W.Config.isInDebugMode() ) {
                this.resources.W.Commands.executeCommand('adminLogin.submitAttempt', { component: this._skinParts.submitButton }, this);
                return;
            }

            this._skinParts.errMsg.set("html", "");
            this._getCurrentForm().onSubmit();
        },

        _closeSMContainer: function() {
            this.resources.W.Commands.executeCommand('WViewerCommands.SiteMembers.Close', null, null);
        },

        _getCurrentForm: function() {
            return this._currentForm;
        }
    }) ;
});
