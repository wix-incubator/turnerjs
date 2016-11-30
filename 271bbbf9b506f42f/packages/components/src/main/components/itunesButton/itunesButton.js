define(['lodash', 'react', 'core', 'utils'], function (_, React, /** core */ core, utils) {
    'use strict';

    var languagePlaceHolder = '{{langCode}}';
    var imageFileName = 'iTunesBtn_' + languagePlaceHolder + '.svg';
    var itunesImagesFolder = '/static/images/itunesButton/';

    var SUPPORTED_LANGS = ['da', 'de', 'en', 'es', 'fr', 'it', 'jp', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'];

    function createDownloadButtonObject(compProps, compData) {
        var downloadButton = {
            parentConst: React.DOM.a,
            target: compProps.openIn
        };
        if (compData.downloadUrl) {
            downloadButton.href = compData.downloadUrl;
        }
        return downloadButton;
    }

    function getLanguage(propLang, siteData) {
        if (propLang === 'userLang') {
            return utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);
        }
        return propLang;
    }

    function getButtonImageSrc(compProps, siteData) {
        var imageBaseUrl = getButtonImageBaseUrl(siteData);
        var language = getLanguage(compProps.language, siteData);
        if (!_.includes(SUPPORTED_LANGS, language)) {
            language = 'en';
        }
        return imageBaseUrl.replace(languagePlaceHolder, language.toUpperCase());  //Server saves data in lowercase, image file name is in uppercase
    }

    function getButtonImageBaseUrl(siteData) {
        var imageBasePath = siteData.santaBase + itunesImagesFolder;
        return imageBasePath + imageFileName;
    }

    /**
     * @class components.itunesButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "ItunesButton",
        mixins: [core.compMixins.skinBasedComp],
        getSkinProperties: function () {
            return {
                downloadButton: createDownloadButtonObject(this.props.compProp, this.props.compData),
                itunesImg: {
                    src: getButtonImageSrc(this.props.compProp, this.props.siteData)
                }
            };
        }
    };
});
