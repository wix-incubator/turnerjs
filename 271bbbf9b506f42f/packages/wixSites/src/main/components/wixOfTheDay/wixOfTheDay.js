/**
 * Created by eitanr on 9/21/14.
 */
define(['core', 'utils', 'imageClientApi', 'wixSites/components/wixOfTheDay/translations/wixOfTheDayTranslations'], function (core, utils, imageClientApi, translations) {
    'use strict';

    function getLanguage(siteData) {
        return utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl).toLowerCase();
    }

    return {
        displayName: 'WixOfTheDay',
        mixins: [core.compMixins.skinBasedComp],
        getInitialState: function () {
            return {
                $openState: 'closed'
            };
        },
        getSkinProperties: function () {
            var language = getLanguage(this.props.siteData);
            var langKeys = translations[language];
            var data = this.props.compData;
            var self = this;

            return {
                img: this.createChildComponent(
                    data,
                    'core.components.Image', 'img',
                    {
                        imageData: data,
                        containerWidth: 344,
                        containerHeight: 274,
                        displayMode: imageClientApi.fittingTypes.LEGACY_FIT_WIDTH
                    }
                ),
                introPreTitle: {
                    children: langKeys.INTRO_PRE_TITLE
                },
                introTitle: {
                    children: langKeys.INTRO_TITLE
                },
                introText: {
                    dangerouslySetInnerHTML: {__html: langKeys.INTRO_TEXT || ''}
                },
                descriptionText: {
                    children: data.description
                },
                shortDescriptionText: {
                    children: data.description
                },
                readOn: {
                    children: langKeys.READ_ON_BUTTON_LABEL,
                    onClick: function (/*ev*/) {
                        self.setState({$openState: 'opened'});
                    }
                },
                closeDescription: {
                    children: langKeys.CLOSE_DESCRIPTION_BUTTON_LABEL,
                    onClick: function (/*ev*/) {
                        self.setState({$openState: 'closed'});
                    }
                }
            };
        }
    };
});
