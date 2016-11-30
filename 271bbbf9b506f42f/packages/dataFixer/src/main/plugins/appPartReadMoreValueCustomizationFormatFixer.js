define([
    'lodash',
    'coreUtils'
], function (
    _,
    coreUtils
) {
    'use strict';

    /**
     * For each component data of a blog feed app part in a given page JSON, changes the format of affected "read more"
     * value customizations from "" to "*" and removes the corresponding unaffected customizations if any (to avoid
     * issues with having multiple customizations that differ in value).
     */
    var fixer = {
        exec: function (pageJson) {
            if (!pageJson.data) {
                return;
            }

            _(pageJson.data.document_data)
                .filter(function (componentData) {
                    return (componentData.type === fixer.getAppPartType() &&
                            _.includes(fixer.getBlogFeedAppPartNames(), componentData.appPartName));
                })
                .forEach(function (blogFeedAppPartComponentData) {
                    var customizations = blogFeedAppPartComponentData.appLogicCustomizations;
                    _(customizations)
                        .compact() // Can contain null.
                        .filter(function (customization) {
                            return (customization.fieldId === fixer.getReadMoreValueCustomizationFieldId() &&
                                    customization.key === fixer.getReadMoreValueCustomizationKey() &&
                                    customization.format === '' &&
                                    _.includes(fixer.getAffectedReadMoreValueCustomizationViews(), customization.view));
                        })
                        .forEach(function (affectedReadMoveValueCustomization) {
                            // Drop existing corresponding customizations if any with the format '*' to avoid issues
                            // with having multiple customizations that differ in value.
                            _.remove(customizations, {
                                fieldId: affectedReadMoveValueCustomization.fieldId,
                                format: '*',
                                key: affectedReadMoveValueCustomization.key,
                                view: affectedReadMoveValueCustomization.view
                            });

                            affectedReadMoveValueCustomization.format = '*';
                        })
                        .value();
                })
                .value();
        },

        // The methods below are used for testing purposes (to simplify a number of test cases by replacing return
        // value).
        getAppPartType: function () {
            return 'AppPart';
        },
        getBlogFeedAppPartNames: function () {
            return [
                coreUtils.blogAppPartNames.FEED,
                coreUtils.blogAppPartNames.CUSTOM_FEED
            ];
        },
        getReadMoreValueCustomizationFieldId: function () {
            return 'ReadMoreBtn';
        },
        getReadMoreValueCustomizationKey: function () {
            return 'value';
        },
        getAffectedReadMoreValueCustomizationViews: function () {
            return [
                'MediaLeft',
                'MediaLeftPage',
                'MediaRight',
                'MediaRightPage',
                'MediaZigzag',
                'MediaZigzagPage',
                'Masonry',
                'MasonryPage'
            ];
        }
    };

    return fixer;
});
