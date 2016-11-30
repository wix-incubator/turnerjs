define(['lodash'], function(_) {
    'use strict';

    var galleryPropertyTypes = ["GalleryExpandProperties", "MatrixGalleryProperties", "PaginatedGridGalleryProperties", "SliderGalleryProperties", "SlideShowGalleryProperties"];

    var fixGalleryFn = function (gallery) {
        if (_.isUndefined(gallery.galleryImageOnClickAction) || gallery.galleryImageOnClickAction === "unset") {
            if (gallery.expandEnabled === false) {
                gallery.galleryImageOnClickAction = "disabled";
            } else {
                gallery.galleryImageOnClickAction = "zoomMode";
            }
        }
        return gallery;
    };

    var fixDataNodesForTypes = function (dataMap, types, mapper) {
        return _(dataMap)
            .pick(function (dataNode) {
                return _.includes(types, dataNode.type);
            })
            .mapValues(mapper)
            .value();
    };

    /**
     * @exports utils/dataFixer/plugins/galleryFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            fixDataNodesForTypes(pageJson.data.component_properties, galleryPropertyTypes, fixGalleryFn);
        }
    };

    return exports;
});