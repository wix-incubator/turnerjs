define(['lodash', 'santaProps', 'core', 'utils', 'socialCommon'], function (_, santaProps, /** core */ core, utils, socialCommon) {
    'use strict';

    var BASE_URL = '//www.facebook.com/plugins/like.php?a=a';
    var LOCALES = {
        da: 'da_DK',
        de: 'de_DE',
        en: 'en_US',
        es: 'es_ES',
        fr: 'fr_FR',
        it: 'it_IT',
        ja: 'ja_JP',
        kr: 'ko_KR',
        nl: 'nl_NL',
        no: 'nn_NO',
        pl: 'pl_PL',
        pt: 'pt_BR',
        ru: 'ru_RU',
        sv: 'sv_SE',
        tr: 'tr_TR'
    };

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    function getIFrameProperties(props, currentUrl) {
        return {
            src: getIFrameSrc(props, currentUrl),
            frameBorder: '0',
            width: props.structure.layout.width,
            height: props.structure.layout.height,
            scrolling: 'no',
            overflow: 'hidden',
            allowTransparency: 'true'
        };
    }

    function getLanguage(propLang, cookie, currentUrl) {
        if (propLang === 'userLang') {
            return utils.wixUserApi.getLanguage(cookie, currentUrl);
        }
        return propLang;
    }

    function getLocale(propLang, cookie, currentUrl) {
        var lang = getLanguage(propLang, cookie, currentUrl);
        return LOCALES[lang] || LOCALES.en;
    }

    function getIFrameSrc(props, currentUrl) {
        var compProp = props.compProp;
        var params = {
            href: currentUrl,
            layout: compProp.layout,
            show_faces: compProp.show_faces,
            action: compProp.action,
            colorscheme: compProp.colorScheme,
            send: compProp.send,
            locale: getLocale(compProp.language, props.cookie, props.currentUrl)
        };
        return BASE_URL + '&' + urlUtils.toQueryString(params);
    }

    /**
     * @class components.facebookLike
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'FacebookLike',
        mixins: [mixins.skinBasedComp, socialCommon.socialCompMixin],
        propTypes: {
            rootId: santaProps.Types.Component.rootId,
            structure: santaProps.Types.Component.structure.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            currentUrl: santaProps.Types.currentUrl,
            cookie: santaProps.Types.RequestModel.cookie
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            return {
                iframe: getIFrameProperties(this.props, this.getSocialUrl(this.props.rootId === 'masterPage'))
            };
        }
    };
});
