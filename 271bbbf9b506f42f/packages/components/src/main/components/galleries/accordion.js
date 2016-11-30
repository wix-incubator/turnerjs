define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.accordion
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'AccordionGallery',
        mixins: [tpaGallery],
        getGalleryType: function(){
            return 'Accordion';
        },
        getStyleProps: function(){
            return {
                "textColor": "color1",
                "descriptionColor": "color2",
                "textBackgroundColor": "color3",
                "borderColor": "color4"
            };
        }
    };
});