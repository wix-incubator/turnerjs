define(['lodash', 'react', 'core', 'utils', 'wixSites/components/homePageLogin/translations/homePageLoginTranslations'], function (_, React, /** core */ core, utils, translations) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;
    var userApi = utils.wixUserApi;


    function translate(key, siteData) {
        var lang = getUserLanguage(siteData) || 'en';
        return (translations[lang] || translations.en)[key] || '';
    }

    function logout(loginToWixAspect, e) {
        e.preventDefault();
        loginToWixAspect.logout();
    }

    function getUserLanguage(siteData) {
        return userApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);
    }

    function getUsername(siteData) {
        return userApi.getUsername(siteData);
    }

    function getLoggedInSkinProperties(siteData, loginToWixAspect) {
        return {
            "memberTitle": {
                children: [translate('HELLO', siteData) + ' ' + getUsername(siteData)]
            },
            "actionTitle": {
                parentConst: React.DOM.a,
                onClick: logout.bind(null, loginToWixAspect),
                children: [translate('SIGN_OUT', siteData)]
            }
        };

    }

    function getLoggedOutSkinProperties(compData, siteData, navInfo) {
        var loginLink = linkRenderer.renderLink(createLoginLinkItem(compData), siteData, navInfo);

        return {
            "memberTitle": {},
            "actionTitle": {
                parentConst: React.DOM.a,
                href: loginLink.href,
                children: [translate('SIGN_IN', siteData)]
            }
        };
    }

    function createLoginLinkItem(compData) {
        return {
            type: 'LoginToWixLink',
            postLoginUrl: compData.postLoginUrl,
            postSignupUrl: compData.postSignUpUrl,
            dialog: compData.startWith,
            sendMail: compData.sendMail,
            mailTemplate: compData.mailTemplate,
            userColor: compData.userColor
        };
    }

    /**
     * @class components.HomePageLogin
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'HomePageLogin',
        mixins: [mixins.skinBasedComp],
        getInitialState: function () {
            this.loginToWixAspect = this.props.siteAPI.getSiteAspect('LoginToWix');
            return {
                'isLoggedIn': !!this.loginToWixAspect.isLoggedInToWix()
            };
        },
        componentWillReceiveProps: function () {
            this.loginToWixAspect = this.props.siteAPI.getSiteAspect('LoginToWix');
            if (this.loginToWixAspect.isLoggedInToWix()){
                if (!this.state.isLoggedIn){
                    this.setState({isLoggedIn: true});
                }
            } else if (this.state.isLoggedIn){
                this.setState({isLoggedIn: false});
            }
        },
        getSkinProperties: function () {
            var refData;
            var siteData = this.props.siteData;
            if (this.state.isLoggedIn) {
                refData = getLoggedInSkinProperties(siteData, this.loginToWixAspect);
            } else {
                refData = getLoggedOutSkinProperties(this.props.compData, siteData, this.props.rootNavigationInfo);
            }

            return refData;
        }
    };
});
