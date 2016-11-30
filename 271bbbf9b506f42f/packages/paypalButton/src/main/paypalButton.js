define(['core', 'lodash', 'santaProps', 'utils', 'reactDOM'], function(/** core */ core, _, santaProps, utils, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;
    var SantaTypes = santaProps.Types;

    var LOCALES = {
        da: {image: 'da_DK', pixel: 'da_DK'},
        de: {image: 'de_DE', pixel: 'de_DE'},
        en: {image: 'en_US', pixel: 'en_US'},
        es: {image: 'es_ES', pixel: 'es_ES'},
        fr: {image: 'fr_FR', pixel: 'fr_FR'},
        it: {image: 'it_IT', pixel: 'it_IT'},
        ja: {image: 'ja_JP', pixel: 'ja_JP'},
        jp: {image: 'ja_JP', pixel: 'ja_JP'},
        nl: {image: 'nl_NL', pixel: 'nl_NL'},
        no: {image: 'no_NO', pixel: 'en_US'},
        pl: {image: 'pl_PL', pixel: 'pl_PL'},
        pt: {image: 'pt_BR', pixel: 'pt_BR'},
        ru: {image: 'ru_RU', pixel: 'en_US'},
        sv: {image: 'sv_SE', pixel: 'sv_SE'},
        tr: {image: 'tr_TR', pixel: 'tr_TR'}
    };

    var notifyUrl = 'https://inventory.wix.com/ecommerce/ipn/paypal';
    var buttonImageUrlTemplate = 'https://www.paypalobjects.com/${locale}/i/btn/btn_${buttonType}${showCreditCards}${buttonSize}.gif';
    var trackingImageUrlTemplate = 'https://www.paypalobjects.com/${locale}/i/scr/pixel.gif';

    function getLanguage(propLang, cookie, currentUrl) {
        if (propLang === 'userLang') {
            return utils.wixUserApi.getLanguage(cookie, currentUrl);
        }
        return propLang;
    }

    function getLocale(propLang, cookie, currentUrl) {
        var lang = getLanguage(propLang, cookie, currentUrl) || '';
        return LOCALES[lang.toLowerCase()] || LOCALES.en;
    }

    /**
     * Returns set of params based on weather its a buy button or a donation button
     *
     * @param compProp
     * @returns {Object}
     */
    function getFormParamsBasedOnButtonType(compProp) {
        var params = {};

        if (compProp.buttonType === 'buy') {
            params.cmdType = '_xclick';
            params.buildNotation = 'Wix_BuyNow_WPS_IL';
            params.itemName = compProp.itemName;
            params.itemNumber = compProp.itemID;
        } else {
            params.cmdType = '_donations';
            params.buildNotation = 'Wix_Donate_WPS_IL';
            params.itemName = compProp.organizationName;
            params.itemNumber = compProp.organizationID;
        }

        return params;
    }

    /**
     * @class components.PayPalButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'PayPalButton',
        mixins: [
            mixins.skinBasedComp
        ],

        propTypes: {
            compData: SantaTypes.Component.compData,
            compProp: SantaTypes.Component.compProp,
            currentUrl: SantaTypes.currentUrl,
            cookie: SantaTypes.RequestModel.cookie
        },

        statics: {
            useSantaTypes: true
        },

        onImageChanged: function () {
            this.registerReLayout();
            this.forceUpdate();
        },
        submitForm: function () {
            ReactDOM.findDOMNode(this.refs.form).submit();
        },
        getSkinProperties: function () {
            var props = this.props;
            var formParams = getFormParamsBasedOnButtonType(props.compProp);
            var locale = getLocale(props.compProp.language, props.cookie, props.currentUrl);
            var currentUrlFull = props.currentUrl.full;
            var amount = props.compProp.amount;

            return {
                form: {
                    target: props.compProp.target
                },
                cmd: {value: formParams.cmdType},
                item_name: {value: formParams.itemName},
                item_number: {value: formParams.itemNumber},
                bn: {value: formParams.buildNotation},
                business: {value: props.compData.merchantID},
                currency_code: {value: props.compProp.currencyCode},
                notify_url: {value: notifyUrl},
                return: {value: currentUrlFull},
                cancel_return: {value: currentUrlFull},
                amount: {value: parseFloat(amount, 10) > 0 ? amount : undefined},
                trackingPixel: {
                    src: _.template(trackingImageUrlTemplate)({locale: locale.pixel})
                },
                submitImage: {
                    src: _.template(buttonImageUrlTemplate)({
                        locale: locale.image,
                        buttonType: props.compProp.buttonType === 'buy' ? 'buynow' : 'donate',
                        showCreditCards: props.compProp.showCreditCards && !props.compProp.smallButton ? 'CC' : '',
                        buttonSize: props.compProp.smallButton ? '_SM' : '_LG'
                    }),
                    onLoad: this.onImageChanged,
                    onClick: this.submitForm
                }

            };
        }
    };
});
