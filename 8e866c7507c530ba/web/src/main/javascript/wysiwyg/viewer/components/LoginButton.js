define.component('wysiwyg.viewer.components.LoginButton', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.SiteMembers','W.Data']);

    def.dataTypes(['LoginButton',""]);

    def.binds(['_onStyleChange']);

    def.skinParts({
        container: {type: 'htmlElement'},
        actionTitle: {type: 'htmlElement'},
        memberTitle: {type: 'htmlElement'}
    });

    def.states(["auth", "no_auth"]); //Obj || Array

    def.statics({
        EDITOR_META_DATA:{
            general: {
                settings: true, //Show Property Panel link
                design: true //Show Design Panel link
            },
            mobile: {
                allInputsHidden: true
            }
        },
        langKeys: {
            en: {
                "Login_Button_Sign_In": "Login/Sign up",
                "Login_Button_Sign_Out": "Log out",
                "Login_Button_Hello": "Hello"
            },
            es: {
                "Login_Button_Sign_In": "Inicia Sesión/Regístrate",
                "Login_Button_Sign_Out": "Salir",
                "Login_Button_Hello": "Hola"
            },
            de: {
                "Login_Button_Hello": "Hallo",
                "Login_Button_Sign_In": "Anmelden/Registrieren",
                "Login_Button_Sign_Out": "Abmelden"
            },
            fr: {
                "Login_Button_Hello": "Bonjour",
                "Login_Button_Sign_In": "Connexion / Inscription",
                "Login_Button_Sign_Out": "Déconnexion"
            },
            it: {
                "Login_Button_Hello": "Ciao",
                "Login_Button_Sign_In": "Login/ Registrati",
                "Login_Button_Sign_Out": "Esci"
            },
            ja: {
                "Login_Button_Hello": "こんにちは、",
                "Login_Button_Sign_In": "ログイン／会員登録",
                "Login_Button_Sign_Out": "ログアウト"
            },
            ko: {
                "Login_Button_Hello": "안녕하세요, ",
                "Login_Button_Sign_In": "로그인/가입하기",
                "Login_Button_Sign_Out": "로그아웃"
            },
            pl: {
                "Login_Button_Hello": "Witaj",
                "Login_Button_Sign_In": "Zaloguj się/Zarejestruj się",
                "Login_Button_Sign_Out": "Wyloguj się"
            },
            pt: {
                "Login_Button_Hello": "Olá",
                "Login_Button_Sign_In": "Login / Registre-se",
                "Login_Button_Sign_Out": "Sair"
            },
            ru: {
                "Login_Button_Hello": "Здравствуйте,",
                "Login_Button_Sign_In": "Войти/Зарегистрироваться",
                "Login_Button_Sign_Out": "Выйти"
            },

            nl: {
                "Login_Button_Sign_In" : "Inloggen/registreren",
                "Login_Button_Sign_Out" : "Uitloggen",
                "Login_Button_Hello" : "Hallo",
                "Login_Button__More_Info" : "U kunt pagina's afschermen voor niet-leden via Pagina's > Instellingen > Deze pagina afschermen."
            },

            sv:{
                "Login_Button_Sign_In" : "Logga in/registrera dig",
                "Login_Button_Sign_Out" : "Logga ut",
                "Login_Button_Hello" : "Hej",
                "Login_Button__More_Info" : "För att begränsa åtkomst till alla sidor till endast sidmedlemmar \ngår du till Sidor > Inställningar > Skydda den här sidan. "
            },

            no:{
                "Login_Button_Sign_In" : "Logg på / registrer deg",
                "Login_Button_Sign_Out" : "Logg av",
                "Login_Button_Hello" : "Hei",
                "Login_Button__More_Info" : "Hvis du vil begrense til at kun medlemmer på nettstedet har tilgang,\ngår du til Sider > Innstillinger > Beskytt denne siden."
            },


            tr: {
                "Login_Button_Hello": "Merhaba",
                "Login_Button_Sign_In": "Giriş / Kayıt",
                "Login_Button_Sign_Out": "Çıkış"
            },
            sv: {
                "Login_Button_Sign_In" : "Logga in/registrera dig",
                "Login_Button_Sign_Out" : "Logga ut",
                "Login_Button_Hello" : "Hej",
                "Login_Button__More_Info" : "För att begränsa åtkomst till alla sidor till endast sidmedlemmar \ngår du till Sidor > Inställningar > Skydda den här sidan. "
            },
            no: {
                "Login_Button_Sign_In" : "Logg på / registrer deg",
                "Login_Button_Sign_Out" : "Logg av",
                "Login_Button_Hello" : "Hei",
                "Login_Button__More_Info" : "Hvis du vil begrense til at kun medlemmer på nettstedet har tilgang,\ngår du til Sider > Innstillinger > Beskytt denne siden."
            },
            da: {

                "Login_Button_Sign_In" : "Login/Opret",
                "Login_Button_Sign_Out" : "Log ud",
                "Login_Button_Hello" : "Hej",
                "Login_Button__More_Info" : "For at begrænse adgang til en side, for kun hjemmeside medlemmer, \ngå til Sider > Indstillinger > Beskyt denne side.",

            }


        },
        _keys:{}
    });

    def.methods({
        initialize: function(compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
        },
        _setDictionary: function(language){
            this._keys= language&&this.langKeys[language] ? this.langKeys[language] : this.langKeys["en"] ;
            this._loadTranslations(language);
        },
        _loadTranslations :function (language){
            W.Resources.loadLanguageBundle('SITE_MEMBER_MANAGER',function(){},language);
        },
        _onStyleReady: function(){
            this.parent();
            this._style.addEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._onStyleChange);
        },

        _onStyleChange: function(){
            this._centerButton();
            this._wCheckForSizeChangeAndFireAutoSized(10);
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        render: function () {
            this.parent();
            if (!this.getDataItem()){
                var newItemData=this.resources.W.Data.addDataItemWithUniqueId("",{type: 'LoginButton',language:'en'});
                this.setDataItem(newItemData.dataObject);
            }else{
                if (this.getDataItem() && ! this.getDataItem()._data.language){
                    this.getDataItem().set("language", this.resources.W.Config.getLanguage() || "en");
                }
            }
            this._updateTextsAndEvents();
            this._centerButton();
        },

        _updateTextsAndEvents: function() {

            this._setDictionary(this.getDataItem() && this.getDataItem()._data.language ? this.getDataItem()._data.language : "en");
            var parts = this._skinParts;
            var siteMembersViewMgr = this.injects().SiteMembers;
            var actionTitle = parts.actionTitle;
            var memberTitle = parts.memberTitle;
            var thisComponent = this;

            if (this.injects().SiteMembers.isLoggedIn()) {
                actionTitle.set("text", this._keys["Login_Button_Sign_Out"]);
                actionTitle.addEvent("click", this._addLogoutMemberHandler(actionTitle));

                this.injects().SiteMembers.getMemberDetails( function( data ) {
                    var userName = data.attributes && data.attributes.name || data.email;
                    memberTitle.set("text", this._keys["Login_Button_Hello"] + " " + userName);
                }.bind(this));

                this.setState("auth");
            }
            else {
                actionTitle.set("text", this._keys["Login_Button_Sign_In"]);
                actionTitle.addEvent("click", function() {
                    siteMembersViewMgr.openSiteMembersPopup({
                        'dialogsLanguage':thisComponent.getDataItem() && thisComponent.getDataItem()._data.language ? thisComponent.getDataItem()._data.language :"en" ,
                        'authCallback': function (authObj) {
                            if (authObj.authResponse === true) {
                                thisComponent._renderIfReady();
                            }
                        }
                    });
                    actionTitle.removeEvent("click", arguments.callee);
                }.bind(this));

                memberTitle.set("text", "");
                this.setState("no_auth");
            }
        },

        _addLogoutMemberHandler: function(actionTitle) {
            var $this = this ;
            var logoutHandler = function() {
                $this.resources.W.SiteMembers.logout();
            } ;
            return logoutHandler ;
        },

        _centerButton: function() {
            var container = this._skinParts.container;
            var containerSize = container.getSize();
            var containerWidth = containerSize.x;
            var containerHeight = containerSize.y;

            var diffY = this.getHeight() - containerHeight;
            var diffX = this.getWidth() - containerWidth;
//            container.setStyle('margin-left', diffX / 2);
//            container.setStyle('margin-right', diffX / 2);
            container.setStyle('margin-top', diffY / 2);
//            container.setStyle('margin-bottom', diffY / 2);

            this._skinParts.actionTitle.setStyle("width", this.getWidth());
            this._skinParts.memberTitle.setStyle("width", this.getWidth());

            this.setMinH( containerHeight );
        },

        _onResize: function() {
            this._centerButton();
            this.parent();
        }
    });
});