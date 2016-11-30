define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.tpa3DGallery
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'TPA3DGallery',
        mixins: [tpaGallery],
        getGalleryType: function(){
            return 'Slicebox';
        },
        getStyleProps: function(){
            return {};
        }
    };
});