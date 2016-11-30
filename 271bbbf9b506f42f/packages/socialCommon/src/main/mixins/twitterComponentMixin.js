define(['lodash', 'utils', 'santaProps'], function (_, utils, santaProps) {
    'use strict';

    var SUPPORTED_LANGS = ['da', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'];

    function getLanguage(dataLang, cookie, currentUrl) {
        if (dataLang === 'userLang') {
            return utils.wixUserApi.getLanguage(cookie, currentUrl);
        }
        return dataLang;
    }

    return {
        getInitialState: function () {
            return {
                width: this.props.style.width,
                height: this.props.style.height
            };
        },
        propTypes: {
            compProp: santaProps.Types.Component.compProp.isRequired,
            cookie: santaProps.Types.RequestModel.cookie,
            currentUrl: santaProps.Types.currentUrl,
            id: santaProps.Types.Component.id.isRequired,
            style: santaProps.Types.Component.style.isRequired
        },
        componentDidMount: function () {
            window.addEventListener('message', this.processMessage);
        },
        componentWillUnmount: function () {
            window.removeEventListener('message', this.processMessage);
        },
        processMessage: function (event) {
            if (event.data && event.data.type === 'twitterSize' && event.data.compId === this.props.id) {
                this.registerReLayout();
                this.setState(event.data.size);
            }
        },
        getLanguage: function () {
            var lang = getLanguage(this.props.compProp.dataLang, this.props.cookie, this.props.currentUrl);
            return _.includes(SUPPORTED_LANGS, lang) ? lang : 'en';
        },
        getSkinProperties: function () {
            return {
                "": {
                    style: {
                        width: this.state.width,
                        height: this.state.height
                    }
                },
                iframe: {
                    src: this.getIFrameSrc(),
                    width: this.state.width,
                    height: this.state.height
                }
            };
        }
    };
});
