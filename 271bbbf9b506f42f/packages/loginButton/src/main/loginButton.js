define(['lodash', 'core', 'santaProps', 'loginButton/translations/loginButtonTranslations'], function(_, /** core */ core, santaProps, langKeys){
    'use strict';

    function getLoginButtonText(lang, textType) {

        return (langKeys[lang] && langKeys[lang][textType]) || langKeys.en[textType];
    }

    var siteMembersAspect;

    function onBtnClick(language) {
        if (isLoggedIn()) {
            siteMembersAspect.logout(language);
        } else {
            siteMembersAspect.showAuthenticationDialog(null, language);
        }
    }

    function getUserName() {
        var memberDetails = siteMembersAspect.getMemberDetails();
        return memberDetails ? (memberDetails.attributes && memberDetails.attributes.name || memberDetails.email) : "";
    }

    function getActionTitle(language) {
        if (!isLoggedIn()) {
            return getLoginButtonText(language, "Login_Button_Sign_In");
        }

        return getLoginButtonText(language, "Login_Button_Sign_Out");
    }

    function getMemberTitle(language) {
        var userName;

        if (isLoggedIn()) {
            userName = getUserName();
        }

        if (userName) {
            return getLoginButtonText(language, "Login_Button_Hello") + " " + userName;
        }

        return "";
    }

    function isLoggedIn() {
        if (siteMembersAspect) {
            return siteMembersAspect.isLoggedIn();
        }

        return false;
    }

    function isReadyToShow() {
        if (!siteMembersAspect) {
            return false;
        }

        return !siteMembersAspect.isLoggedIn() || getUserName().length > 0;
    }

    /**
     * @class components.loginButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "LoginButton",
        mixins: [core.compMixins.skinBasedComp],

        propTypes: {
            compData: santaProps.Types.Component.compData,
            style: santaProps.Types.Component.style.isRequired,
            siteMembersAspect: santaProps.Types.SiteAspects.siteMembers.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        componentWillMount: function () {
            siteMembersAspect = this.props.siteMembersAspect;
        },

        getSkinProperties: function () {
            var language = this.props.compData ? this.props.compData.language : 'en';

            return {
                "": {
                    style: {visibility: !isReadyToShow() ? 'hidden' : null}
                },
                "actionTitle": {
                    style: {width: this.props.style.width},
                    children: getActionTitle(language),
                    onClick: onBtnClick.bind(this, language)
                },
                "memberTitle": {
                    style: {
                        width: this.props.style.width,
                        display: !isLoggedIn() ? 'none' : null
                    },
                    children: getMemberTitle(language)
                }
            };
        }
    };
});
