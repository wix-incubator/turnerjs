define(['imageClientApi/engines/transforms'], function (transforms) {
    "use strict";

    describe('getImageURI', function () {

        beforeEach(function(){
            this.transformObj = {
                "fileName": "testimage",
                "fileExtension": "jpg",
                "fileType": "jpg",
                "isWEBPSupport": false,
                "fittingType": "fill",
                "src": {
                    "id": "testimage.jpg",
                    "width": 200,
                    "height": 500,
                    "isCropped": false,
                    "cropped": true
                },
                "quality": 80,
                "progressive": true,
                "unsharpMask": {
                    "radius": "0.66",
                    "amount": "1.00",
                    "threshold": "0.01"
                },
                "parts": [
                    {
                        "transformType": "crop",
                        "x": 0,
                        "y": 0,
                        "width": 200,
                        "height": 500,
                        "upscale": false,
                        "forceUSM": false,
                        "scaleFactor": 1,
                        "cssUpscaleNeeded": false
                    },
                    {
                        "transformType": "fill",
                        "width": 100,
                        "height": 300,
                        "alignment": "c",
                        "upscale": false,
                        "forceUSM": false,
                        "scaleFactor": 0.176657824933687,
                        "cssUpscaleNeeded": false
                    }]
            };

        });

        it('should construct valid image URI', function () {

            var validURI = "testimage.jpg/v1/crop/x_0,y_0,w_200,h_500/fill/w_100,h_300,al_c,q_80,usm_0.66_1.00_0.01/testimage.jpg";

            var actualURI = transforms.getImageURI(this.transformObj);
            expect(actualURI).toEqual(validURI);
        });

        it('should construct valid image webp URI', function () {
            this.transformObj.isWEBPSupport = true;
            var validURI = "testimage.jpg/v1/crop/x_0,y_0,w_200,h_500/fill/w_100,h_300,al_c,q_80,usm_0.66_1.00_0.01/testimage.webp";

            var actualURI = transforms.getImageURI(this.transformObj);
            expect(actualURI).toEqual(validURI);
        });
    });
});
