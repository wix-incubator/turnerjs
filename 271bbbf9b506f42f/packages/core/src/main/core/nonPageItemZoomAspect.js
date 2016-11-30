define(['santaProps', 'utils', 'core/core/pageItemRegistry', 'core/core/siteAspectsRegistry'],
  function (santaProps, utils, /** core.pageItemRegistry */ pageItemRegistry, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
      'use strict';

      function getZoomComp(structure, aspectSiteAPI, loadedStyles) {
          var props = santaProps.componentPropsBuilder.getCompProps(structure, aspectSiteAPI.getSiteAPI(), null, loadedStyles);
          var zoomedImageData = utils.nonPageItemZoom.getZoomedImageData();
          props.compData = zoomedImageData;
          var compConstructor = utils.compFactory.getCompClass(structure.componentType);
          props.closeFunction = utils.nonPageItemZoom.unzoom;
          props.pageItemAdditionalData = zoomedImageData.galleryData;
          return compConstructor(props);
      }

      function getZoomStructure(siteData) {
          var zoomedImageData = utils.nonPageItemZoom.getZoomedImageData();
          if (zoomedImageData === undefined) {
              return null;
          }
          var structure = pageItemRegistry.getCompStructure('Image', zoomedImageData, null, siteData);
          delete structure.dataQuery;
          structure.compData = zoomedImageData;
          return structure;
      }

      function BlogGalleryZoom(aspectSiteAPI) {
          this._aspectSiteAPI = aspectSiteAPI;
      }

      BlogGalleryZoom.prototype = {
          getReactComponents: function (loadedStyles) {
              var structure = getZoomStructure(this._aspectSiteAPI.getSiteData());
              return structure && [getZoomComp(structure, this._aspectSiteAPI, loadedStyles)];
          },

          getComponentStructures: function () {
              var structure = getZoomStructure(this._aspectSiteAPI.getSiteData());
              return structure ? [structure] : null;
          }
      };

      siteAspectsRegistry.registerSiteAspect('nonPageItemZoom', BlogGalleryZoom);
  });
