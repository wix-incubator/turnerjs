define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var MATRIX_GALLERY_TYPE = 'wysiwyg.viewer.components.MatrixGallery',
        MATRIX_GALLERY_SKIN = 'wysiwyg.viewer.skins.gallerymatrix.BlogMatrixGallery',
        SLIDSHOW_GALLERY_TYPE = "wysiwyg.viewer.components.SlideShowGallery",
        SLIDSHOW_GALLERY_SKIN = "skins.viewer.gallery.BlogSlideShow",
        GALLERY_TYPES = [MATRIX_GALLERY_TYPE, SLIDSHOW_GALLERY_TYPE],
        IMAGE_RATIO = 0.75;

    function isGalleryComponent(type) {
        return _.includes(GALLERY_TYPES, type);
    }

    function isMatrixGallery(type) {
        return type === MATRIX_GALLERY_TYPE;
    }

    function isSlidShowGallery(type) {
        return type === SLIDSHOW_GALLERY_TYPE;
    }

    function calcGalleryHeightByType(targetWidth, data) {
        var height = 0;
        if (isMatrixGallery(data.componentType)) {
            var bottomMargin = 26,
                cols = data.cols,
                rows = data.rows,
                margin = data.margin * 2, // should be multiple by 2 because the viewer use absolute margin and not per-image margin.
                cellWidth = Math.round((targetWidth - ((cols - 1) * margin)) / cols),
                desiredCellHeight = IMAGE_RATIO * cellWidth;
            height = Math.round(desiredCellHeight * rows) + ((rows - 1) * margin) + bottomMargin;
        } else if (isSlidShowGallery(data.componentType)) {
            height = Math.round(IMAGE_RATIO * targetWidth);
        }
        return height;
    }

    function buildStyleObject(defaultStyle, data) {
        var actualSinglePostWidth = defaultStyle.width;

        return {
            width: actualSinglePostWidth,
            height: calcGalleryHeightByType(actualSinglePostWidth, data),
            position: 'relative'
        };
    }

    function buildTypeSpecificGalleryProps(data) {
        var gallerySpecificProps = {};
        if (isMatrixGallery(data.componentType)) {
            gallerySpecificProps = {
                "skin": MATRIX_GALLERY_SKIN,
                "compProp": {
                    "type": "MatrixGalleryProperties",
                    "metaData": {
                        "schemaVersion": "1.0"
                    },
                    "expandEnabled": true,
                    "imageMode": data.fixedSize ? "clipImage" : "flexibleWidthFixed",
                    "numCols": data.cols,
                    "maxRows": data.rows,
                    "incRows": 2,
                    "margin": data.margin * 2, // should be multiple by 2 because the viewer use absolute margin and not per-image margin.
                    //"showMoreLabel": "Not supported",
                    //"goToLinkText": "Not supported",
                    "alignText": "left"
                }
            };
        } else if (isSlidShowGallery(data.componentType)) {
            gallerySpecificProps = {
                "skin": SLIDSHOW_GALLERY_SKIN,
                "compProp": {
                    autoplay: data.autoplay,
                    autoplayInterval: data.autoplayInterval,
                    bidirectional: false,
                    expandEnabled: true,
                    //goToLinkText: "Not supported",
                    imageMode: 'flexibleWidthFixed', // 'flexibleHeight', //
                    metaData: {schemaVersion: "1.0"},
                    reverse: false,
                    showAutoplay: true,
                    showCounter: true,
                    showExpand: false,
                    showNavigation: true,
                    showSocial: false,
                    transDuration: 1,
                    transition: "swipeHorizontal",
                    type: "SlideShowGalleryProperties"
                }
            };
        } else {
            utils.log.error('Unknown gallery type: ' + data.componentType);
        }
        return gallerySpecificProps;
    }

    function buildGalleryJsonFromCkData(data, innerCompsData, defaultStyle, loadedStyles) {
        var galleryType = data.componentType;
        var galleryDefinition = _.assign({
            "dataQuery": data.dataQuery,
            "propertyQuery": data.dataQuery,
            "componentType": data.componentType,
            "type": "Component",
            "style": buildStyleObject(defaultStyle, data),
            "compData": {
                "type": "ImageList",
                "items": _.map(data.imageList, function(item) {
                    var dataItem = _.get(innerCompsData, item.dataQuery);
                    return _.assign({}, item, dataItem, {
                        "type": "Image",
                        "id": item.id + item.uri,
                        "isRef": false,
                        "metaData": {
                            "isHidden": false,
                            "isPreset": true,
                            "schemaVersion": "1.0"
                        }
                    });
                }),
                //"id": "c12cv", // the pageID? currently seems unneeded
                "metaData": {
                    "isPreset": true,
                    "schemaVersion": "1.0",
                    "isHidden": false
                }
            }
        }, buildTypeSpecificGalleryProps(data));

        if (isSlidShowGallery(galleryType)) {
            galleryDefinition.styleId = loadedStyles[SLIDSHOW_GALLERY_SKIN];
        }

        if (isMatrixGallery(galleryType)) {
            galleryDefinition.styleId = loadedStyles[MATRIX_GALLERY_SKIN];
        }

        return galleryDefinition;
    }

    return {
        buildGalleryJsonFromCkData: buildGalleryJsonFromCkData,
        isGalleryComponent: isGalleryComponent
    };
});
