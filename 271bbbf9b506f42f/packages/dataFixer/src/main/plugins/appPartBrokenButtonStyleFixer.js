define([
    'lodash',
    'coreUtils'
], function (
    _,
    coreUtils
) {
    'use strict';

    var brokenButtonStyleIds = null;

    // Finds and removes broken button styles and blog components' customizations using the styles.
    return {
        exec: function (pageJson) {
            // Styles are stored in the master page that is processed first by data fixers.
            if (_.isNull(brokenButtonStyleIds)) {
                brokenButtonStyleIds = [];

                _.forEach(pageJson.data.theme_data, function (style, styleId, styleById) {
                    var buttonStyleIsBroken = _.matches({
                        componentClassName: 'wysiwyg.viewer.components.SiteButton',
                        skin: 'wysiwyg.viewer.skins.AppPartSkin'
                    })(style);

                    if (buttonStyleIsBroken) {
                        brokenButtonStyleIds.push(styleId);
                        delete styleById[styleId];
                    }
                });

                // Data fixers run synchronously.
                // Store broken button style IDs collected on the master page for use on other pages.
                // Free memory at the end.
                setTimeout(function () {
                    brokenButtonStyleIds = null;
                });
            }

            _(pageJson.data.document_data)
                .filter(function (compData) {
                    return (
                        compData.type === 'AppPart' &&
                        _.includes(coreUtils.blogAppPartNames, compData.appPartName)
                    );
                })
                .forEach(function (compData) {
                    _.remove(compData.appLogicCustomizations, function (customization) {
                        return (
                            customization.key === 'comp.style' &&
                            _.includes(brokenButtonStyleIds, customization.value)
                        );
                    });
                })
                .value();
        }
    };
});
