define(['lodash', 'react', 'core', 'utils'], function (_, React, core, utils) {
    'use strict';

    var mixins = core.compMixins,
        userApi = utils.wixUserApi;

    var menuData = [
        {languageCode: 'en', languageSubdomain: 'www', iconURL: '', languageLabel: 'English'},
        {languageCode: 'de', languageSubdomain: 'de', iconURL: '', languageLabel: 'Deutsch'},
        {languageCode: 'es', languageSubdomain: 'es', iconURL: '', languageLabel: 'Español'},
        {languageCode: 'fr', languageSubdomain: 'fr', iconURL: '', languageLabel: 'Français'},
        {languageCode: 'it', languageSubdomain: 'it', iconURL: '', languageLabel: 'Italiano'},
        {languageCode: 'pl', languageSubdomain: 'pl', iconURL: '', languageLabel: 'Polski'},
        {languageCode: 'pt', languageSubdomain: 'pt', iconURL: '', languageLabel: 'Português'},
        {languageCode: 'ru', languageSubdomain: 'ru', iconURL: '', languageLabel: 'Pусский'}
    ];

    var CLASS_NAME_OPTION_CONTAINER = "optionContainer";
    var CLASS_NAME_SELECTED = 'selected';

    function getSelected(subDomain) {
        var item = getOptionBySubDomain(subDomain);
        if (item) {
            return item.languageLabel;
        }
        return 'English';
    }

    function getOptionBySubDomain(subDomain){
        return _.find(menuData, {languageSubdomain: subDomain});
    }

    function initMenu() {
        return _.map(menuData, function (item) {
            var attributes = {
                'data-subdomain': item.languageSubdomain,
                'data-languagecode': item.languageCode,
                'className': CLASS_NAME_OPTION_CONTAINER
            };
            return React.DOM.li(attributes, item.languageLabel);
        });
    }

    function changeLanguageSuccess (subDomain) {
        var hostNoSubDomain = window.location.hostname.substring(window.location.hostname.indexOf('.'));

        var newURL = window.location.protocol + "//" + subDomain + hostNoSubDomain + window.location.pathname + window.location.search + window.location.hash;

        // Refreshing the page (If it's the same URL)
        if (window.location.href.toLowerCase() === newURL.toLowerCase()) {
            window.location.href.reload();
        } else {
            window.location.href = newURL;
        }
    }

    function changeLanguageFailed() {
    }

    function changeLanguage(newSubDomain){
        var languageCode = getOptionBySubDomain(newSubDomain).languageCode;

        userApi.setLanguage(languageCode, changeLanguageFailed, changeLanguageSuccess.bind(this, newSubDomain));
    }

    return {
        displayName: 'LanguagesDropDown',
        mixins: [mixins.skinBasedComp],

        getSkinProperties: function () {
            return {
                options: {
                    onClick: this.onOptionClick,
                    children: initMenu()
                },
                select: {
                    children: getSelected(this.state.subDomain)
                }
            };
        },

        getInitialState: function () {
            var state = {
                subDomain: 'www'
            };

            var siteData = this.props.siteData;
            var currentLanguage = userApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

            if (currentLanguage){
                var currentLangItem = _.find(menuData, {languageCode: currentLanguage});

                if (currentLangItem){
                    state.subDomain = currentLangItem.languageSubdomain;
                }
            }

            return state;
        },

        onOptionClick: function(event){
            event = event || {};

            var option = event.target;
            // looking for the real option (This is where out data is)
            while (!option.classList.contains(CLASS_NAME_OPTION_CONTAINER)) {
                option = option.parentNode;
            }

            option.classList.add(CLASS_NAME_SELECTED);

            var newSubDomain = option.getAttribute('data-subdomain');
            var currentSubDomain = this.state.subDomain;

            this.setState({subDomain: newSubDomain});

            if (newSubDomain && newSubDomain !== currentSubDomain) {
                changeLanguage(newSubDomain);
            }
        }
    };
});
