define([], function () {
    'use strict';

    var aliases = {
        'mobile.core.components.Container': 'core.components.Container',
        'mobile.core.components.Page': 'core.components.Page',
        'tpa.viewer.components.tpapps.TPASection': 'wysiwyg.viewer.components.tpapps.TPASection',
        'tpa.viewer.components.tpapps.TPAMultiSection': 'wysiwyg.viewer.components.tpapps.TPAMultiSection',
        'tpa.viewer.components.tpapps.TPAWidget': 'wysiwyg.viewer.components.tpapps.TPAWidget',
        'tpa.viewer.components.tpapps.TPAGluedWidget': 'wysiwyg.viewer.components.tpapps.TPAGluedWidget',
        'wysiwyg.viewer.components.PopupCloseTextButton' :'wysiwyg.viewer.components.SiteButton'
    };

    return {
        getAlias: function (compType) {
            return aliases[compType] || compType;
        }
    };
});
