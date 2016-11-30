define(function () {
    'use strict';

    var componentsNamesByProxy = {
        Button2:           'wysiwyg.viewer.components.SiteButton',
        Image:             'wysiwyg.viewer.components.WPhoto',
        Video:             'wysiwyg.viewer.components.Video',
        Label:             'wysiwyg.viewer.components.WRichText',
        ClippedParagraph2: 'wysiwyg.viewer.components.WRichText',
        LabelWithoutTheme: 'wysiwyg.viewer.components.WRichText',
        HorizontalLine:    'wysiwyg.viewer.components.FiveGridLine',
        Container:         'mobile.core.components.Container'
    };

    return {
        /**
         * @param {string} proxyName
         * @returns {string|undefined}
         */
        getComponentTypeByProxyName: function(proxyName) {
            return componentsNamesByProxy[proxyName];
        }
    };

});
