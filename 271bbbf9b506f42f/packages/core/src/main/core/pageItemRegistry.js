define(['utils'], function(utils){
    'use strict';
   var registry = {
       'Image': function(imageData, propertyQuery, siteData){
           var mediaZoom = {
               id: 'imageZoomComp',
               key: 'imageZoomComp',
               styleId: 'zoom',
               dataQuery: '#' + imageData.id,
               skin: 'wysiwyg.skins.ImageZoomSkin',
               componentType: 'wysiwyg.components.imageZoom'
           };

           if (propertyQuery){
               mediaZoom.propertyQuery = propertyQuery;
           }

           if (siteData.isMobileView()) {
               mediaZoom.skin = 'wysiwyg.viewer.skins.TouchMediaZoomSlideshow';
               mediaZoom.componentType = 'wysiwyg.viewer.components.TouchMediaZoomSlideshow';
               mediaZoom.layout = {docked:{top:true, bottom:true}};
           } else if (siteData.isMobileDevice() || siteData.isTabletDevice()) {
               mediaZoom.skin = 'wysiwyg.skins.NonOptimizedImageZoomSkin';
           }

           return mediaZoom;
       },
       "PermaLink": function(permaLinkData, propertyQuery, siteData){
           var mediaZoom = {
               id: 'appPartZoomComp',
               key: 'appPartZoomComp',
               styleId: 'zoom',
               dataQuery: '#' + permaLinkData.id,
               skin: 'wysiwyg.skins.AppPartZoomSkin',
               componentType: 'wixapps.integration.components.AppPartZoom'
           };

           if (propertyQuery){
               mediaZoom.propertyQuery = propertyQuery;
           }

           if (siteData.isMobileView()) {
               mediaZoom.skin = 'wysiwyg.skins.MobileAppPartZoomSkin';
           }

           return mediaZoom;
       }

   };

    /**
     * @class core.pageItemRegistry
     */
    return {
        /**
         *
         * @param {string} dataItemType
         * @param {function(string): {object}} compStructureGetter gets an id and return the component structure
         */
        registerPageItem: function(dataItemType, compStructureGetter){
            if (registry[dataItemType]){
                utils.log.error("page item already registered " + dataItemType);
                return;
            }
            registry[dataItemType] = compStructureGetter;
        },

        /**
         *
         * @param {string} dataItemType
         * @return {object|null} return the structure of the component if registered
         * @param dataItem
         * @param propertyQuery
         * @param siteData
         */
        getCompStructure: function(dataItemType, dataItem, propertyQuery, siteData){
            if (registry[dataItemType]){
                return registry[dataItemType](dataItem, propertyQuery, siteData);
            }
            return null;
        },

        clear: function () {
            registry = {};
        }
    };
});
