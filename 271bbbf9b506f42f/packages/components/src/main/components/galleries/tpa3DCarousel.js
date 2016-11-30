define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.tpa3DCarousel
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'TPA3DCarouselGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Carousel';
        },
        getStyleProps: function () {
            return {};
        }
    };
});
