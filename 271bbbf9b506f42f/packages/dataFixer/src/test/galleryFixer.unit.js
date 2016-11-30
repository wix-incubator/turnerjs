define(['lodash', 'dataFixer/plugins/galleryFixer'], function(_, dataFixer) {
    'use strict';

    describe("galleryFixer spec", function () {
        beforeEach(function () {
            this.page = {
                data: {
                    component_properties: {
                        "gallery1": {
                            "type": "SlideShowGalleryProperties",
                            "expandEnabled": false,
                            "galleryImageOnClickAction": "unset"
                        },
                        "gallery2": {
                            "type": "SliderGalleryProperties",
                            "expandEnabled": true,
                            "galleryImageOnClickAction": "unset"
                        },
                        "gallery3": {
                            "type": "SliderGalleryProperties",
                            "expandEnabled": false,
                            "galleryImageOnClickAction": "zoomMode"
                        }
                    }
                }
            };
        });

        it("should fix the unset galleryImageOnClickAction with expandEnabled===false to disabled", function () {
            dataFixer.exec(this.page);
            expect(this.page.data.component_properties.gallery1.galleryImageOnClickAction).toEqual("disabled");
        });

        it("should fix the unset galleryImageOnClickAction with expandEnabled===true to zoomMode", function () {
            dataFixer.exec(this.page);
            expect(this.page.data.component_properties.gallery2.galleryImageOnClickAction).toEqual("zoomMode");
        });

        it("should not fix the gallery with galleryImageOnClickAction !== unset", function () {
            var expectedGallery = _.clone(this.page.data.component_properties.gallery3);
            dataFixer.exec(this.page);
            expect(this.page.data.component_properties.gallery3).toEqual(expectedGallery);
        });
    });
});
