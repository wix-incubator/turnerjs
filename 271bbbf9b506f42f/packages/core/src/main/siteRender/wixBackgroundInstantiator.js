define(['santaProps', 'siteUtils'], function(santaProps, siteUtils) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.SiteBackground';

    var structure = {
        id: 'SITE_BACKGROUND',
        skin: 'wysiwyg.viewer.skins.siteBackgroundSkin',
        componentType: compType,
        styleId: 'siteBackground'
    };

    return {
        getWixBgStructure: function() {
            return structure;
        },

        getWixBgComponent: function(siteAPI) {
            var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI);
            var wixBgConstructor = siteUtils.compFactory.getCompClass(compType);
            return wixBgConstructor(props);
        }
    };
});
