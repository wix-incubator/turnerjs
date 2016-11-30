/**
 * @Class wysiwyg.viewer.components.wixhomepage.HomePageLogin
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.viewer.components.wixhomepage.HomePageLogin', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.traits();

    def.utilize();

    def.binds(['_onStyleChange', '_doLogout', '_doLogin']);

    def.skinParts({
        actionTitle: {type: 'htmlElement'},
        memberTitle: {type: 'htmlElement'}
    });

    def.states(["auth", "no_auth"]);

    def.dataTypes(['HomePageLogin']);

    def.resources(['W.Config']);

    def.fields({
        Translations: {
            en: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Sign up",
                HOMEPAGE_LOGIN_SIGN_OUT: "Log out",
                HOMEPAGE_LOGIN_HELLO: "Hello"
            },
            de: {
                HOMEPAGE_LOGIN_SIGN_IN: "Anmelden/Registrieren",
                HOMEPAGE_LOGIN_SIGN_OUT: "Abmelden",
                HOMEPAGE_LOGIN_HELLO: "Hallo"
            },
            es: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/ Regístrate",
                HOMEPAGE_LOGIN_SIGN_OUT: "Cerrar Sesión",
                HOMEPAGE_LOGIN_HELLO: "Hola"
            },
            fr: {
                HOMEPAGE_LOGIN_SIGN_IN: "Connexion/ Inscription",
                HOMEPAGE_LOGIN_SIGN_OUT: "Déconnexion",
                HOMEPAGE_LOGIN_HELLO: "Bonjour"
            },
            it: {
                HOMEPAGE_LOGIN_SIGN_IN: "Accedi/Registrati",
                HOMEPAGE_LOGIN_SIGN_OUT: "Esci",
                HOMEPAGE_LOGIN_HELLO: "Ciao"
            },
            pl: {
                HOMEPAGE_LOGIN_SIGN_IN: "Zaloguj się/Zarejestruj się",
                HOMEPAGE_LOGIN_SIGN_OUT: "Wyloguj się",
                HOMEPAGE_LOGIN_HELLO: "Witaj"
            },
            pt: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Registre-se",
                HOMEPAGE_LOGIN_SIGN_OUT: "Sair",
                HOMEPAGE_LOGIN_HELLO: "Olá"
            },
            ko: {
                HOMEPAGE_LOGIN_SIGN_IN: "로그인/등록",
                HOMEPAGE_LOGIN_SIGN_OUT: "로그아웃",
                HOMEPAGE_LOGIN_HELLO: "안녕하세요?"
            },
            ja: {
                HOMEPAGE_LOGIN_SIGN_IN: "ログイン/サインアップ",
                HOMEPAGE_LOGIN_SIGN_OUT: "ログアウト",
                HOMEPAGE_LOGIN_HELLO: "こんにちは"
            },
            ru: {
                HOMEPAGE_LOGIN_SIGN_IN: "Логин/Вход",
                HOMEPAGE_LOGIN_SIGN_OUT: "Выйти",
                HOMEPAGE_LOGIN_HELLO: "Здравствуйте"
            },

            nl: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Sign up",
                HOMEPAGE_LOGIN_SIGN_OUT: "Log out",
                HOMEPAGE_LOGIN_HELLO: "Hello"
            },

            tr: {
                HOMEPAGE_LOGIN_SIGN_IN: "Giriş/Kaydol",
                HOMEPAGE_LOGIN_SIGN_OUT: "Çıkış",
                HOMEPAGE_LOGIN_HELLO: "Merhaba"
            },
            sv: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Sign up",
                HOMEPAGE_LOGIN_SIGN_OUT: "Log out",
                HOMEPAGE_LOGIN_HELLO: "Hello"
            },
            no: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Sign up",
                HOMEPAGE_LOGIN_SIGN_OUT: "Log out",
                HOMEPAGE_LOGIN_HELLO: "Hello"
            },
            da: {
                HOMEPAGE_LOGIN_SIGN_IN: "Login/Sign up",
                HOMEPAGE_LOGIN_SIGN_OUT: "Log out",
                HOMEPAGE_LOGIN_HELLO: "Hello"
            }

        }
    });

    /**
     * @lends wysiwyg.viewer.components.wixhomepage.HomePageLogin
     */
    def.methods({
        initialize: function(compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            if (window['userApi']) {
                this._userApi = window.userApi;
            }
        },

        _translate: function(key) {
            var languageID = 'en';
            if (this._userApi) {
                languageID = this._userApi.getLanguage();
            }

            return this.Translations[languageID][key];
        },

        _onStyleReady: function(){
            this.parent();
            this._style.addEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._onStyleChange);
        },

        _onStyleChange: function(){
            this._wCheckForSizeChangeAndFireAutoSized(10);
        },


        _onAllSkinPartsReady: function(){
            this._updateTextsAndEvents();
        },

        _doLogout: function(){
            var actionTitle = this._skinParts.actionTitle;
            actionTitle.removeEvent("click", arguments.callee);

            //  make it work only on public ot debug mode
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                this._userApi.logout();
                window.location.href = "http://www.wix.com";
            }
            else
            {
                this.injects().Commands.executeCommand('adminLogin.submitAttempt', { component: this.getViewNode() }, this);
            }
        },

        _doLogin: function(){
            var actionTitle = this._skinParts.actionTitle;
            actionTitle.removeEvent("click", arguments.callee);
            //  make it work only on public ot debug mode
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                this._openLoginDialog();
            }
            else
            {
                this.injects().Commands.executeCommand('adminLogin.submitAttempt', { component: this.getViewNode() }, this);
            }
        },

        _updateView: function(actionTitleStr, memberTitleStr, onActionTitleClickFunc) {
            var actionTitle = this._skinParts.actionTitle;
            var memberTitle = this._skinParts.memberTitle;

            actionTitle.set("text", actionTitleStr);
            memberTitle.set("text", memberTitleStr);
            actionTitle.addEvent("click", onActionTitleClickFunc);
        },

        _updateTextsAndEvents: function() {
            var userApi = this._userApi;

            if (userApi && userApi.isSessionValid()) {
                this._updateView(this._translate('HOMEPAGE_LOGIN_SIGN_OUT'), this._translate('HOMEPAGE_LOGIN_HELLO') + " " + userApi.getUserName(), this._doLogout);
                this.setState("auth");
            }
            else
            {
                this._updateView(this._translate('HOMEPAGE_LOGIN_SIGN_IN'), "", this._doLogin);
                this.setState("no_auth");
            }
        },

        _openLoginDialog: function () {
            var postLoginUrl = this._data.get('postLoginUrl');
            var postSignUpUrl = this._data.get('postSignUpUrl');
            var startWith = this._data.get('startWith');

            // using empty string should redirect to the same page
            if (!postLoginUrl) {
                postLoginUrl = location.href;
            }

            // using empty string should redirect to the same page
            if (!postSignUpUrl) {
                postSignUpUrl = location.href;
            }

            window['animateForm']['callForm']([ postSignUpUrl, postLoginUrl, startWith, "HTML"]);
        }
    });
});