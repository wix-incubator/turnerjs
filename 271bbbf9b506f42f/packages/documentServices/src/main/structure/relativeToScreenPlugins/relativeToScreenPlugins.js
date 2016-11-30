define(['lodash',
        'documentServices/component/componentStructureInfo',
        'documentServices/componentsMetaData/metaDataUtils',
        'documentServices/page/popupUtils',

        /* Plugins */
        'documentServices/structure/relativeToScreenPlugins/columnsPlugin',
        'documentServices/structure/relativeToScreenPlugins/screenWidthPlugin',
        'documentServices/structure/relativeToScreenPlugins/fullViewPortPlugin',
        'documentServices/structure/relativeToScreenPlugins/siteStructurePlugin',
        'documentServices/structure/relativeToScreenPlugins/anchorPlugin',
        'documentServices/structure/relativeToScreenPlugins/textHeightPlugin',
        'documentServices/structure/relativeToScreenPlugins/verticalLinePlugin',
        'documentServices/structure/relativeToScreenPlugins/horizontalLinePlugin',
        'documentServices/structure/relativeToScreenPlugins/popupContainerWidthPlugin'
    ],
    function(_, componentStructureInfo, metaDataUtils, popupUtils, columnsPlugin, screenWidthPlugin,
             fullViewPortPlugin, siteStructurePlugin, anchorPlugin, textHeightPlugin, verticalLinePlugin,
             horizontalLinePlugin, popupContainerWidthPlugin) {
        'use strict';

        var screenLayoutPlugins = {
            'wysiwyg.viewer.components.Column': columnsPlugin,
            'wysiwyg.viewer.components.StripColumnsContainer': columnsPlugin,
            'wysiwyg.common.components.anchor.viewer.Anchor': anchorPlugin,
            'wysiwyg.viewer.components.WSiteStructure': siteStructurePlugin,
            'wysiwyg.viewer.components.WRichText': textHeightPlugin,
            'wysiwyg.viewer.components.FiveGridLine': horizontalLinePlugin,
            'wysiwyg.viewer.components.VerticalLine': verticalLinePlugin,
            'wysiwyg.viewer.components.PopupContainer': popupContainerWidthPlugin
        };

        return {
            getPlugin: function(privateApi, compPointer) {
                var compType = componentStructureInfo.getType(privateApi, compPointer);
                var plugin = screenLayoutPlugins[compType];

                if (!plugin && metaDataUtils.isLegacyFullWidthContainer(privateApi, compPointer)){
                    plugin = popupUtils.isPopup(privateApi, compPointer.id) ?
                        fullViewPortPlugin :
                        screenWidthPlugin;
                }

                return plugin;
            }
        };
    });
