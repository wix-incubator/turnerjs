define(['documentServices/structure/layoutCalcPlugins/popupContainerPositioning'],
    function(popupContainerPositioning){
   'use strict';

        var plugins = {};
        plugins['wysiwyg.viewer.components.PopupContainer'] = popupContainerPositioning;

        return plugins;

});