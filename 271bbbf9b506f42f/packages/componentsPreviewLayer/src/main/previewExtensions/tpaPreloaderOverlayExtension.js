define([
        'lodash',
        'previewExtensionsCore',
        'componentsPreviewLayer/previewExtensions/translations/tpaExtensionTranslations'
    ],
function (_, previewExtensionsCore, tpaExtensionTranslations) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.tpapps.TPAPreloaderOverlay';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {

        transformRefData: function transformRefData(refData) {
            var clientSpecMap = this.props.siteData.rendererModel.clientSpecMap;
            var applicationId = this.props.compData.applicationId;
            var name = clientSpecMap && clientSpecMap[applicationId] ? clientSpecMap[applicationId].appDefinitionName : '';
            var lang = this.props.siteData.rendererModel.languageCode;

            var lineHeight = this.props.compData.style.height;

            var refDataChanges = {
                content: {
                    style: {
                        textAlign: 'center',
                        fontSize: '13px'
                    }
                },
                preloader: {
                    style: {
                        marginTop: '-45px'
                    }
                },
                loadingText: {
                    style: {
                        lineHeight: lineHeight + 'px'
                    },
                    children: getTranslatedText(lang, 'TPA_PRELOADER_LOADING') + ' ' + name + ' ...'
                }
            };
            _.merge(refData, refDataChanges);
        }
    };

    var getTranslatedText = function(lang, key) {
        return tpaExtensionTranslations[lang] && tpaExtensionTranslations[lang][key] ? tpaExtensionTranslations[lang][key] : tpaExtensionTranslations.en[key];
    };

    previewExtensionsRegistrar.registerCompExtension(compType, extension);
});
