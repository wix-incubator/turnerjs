define(['lodash'], function (_) {
    "use strict";


    var MAX_ITEMS = 9999;


    function convertFromCartProduct(rawData) {
        var item = {
            '_type': 'ProductItem',
            'id': rawData.id,
            'title': rawData.title,
            'quantity': rawData.quantity,
            'origQuantity': rawData.quantity,
            'inventory': rawData.inventory || MAX_ITEMS,
            'optionsDescription': rawData.selectedOptionsList.map(function (opDescription) {
                return {title: opDescription.title || '', description: opDescription.description || ''};
            }),
            'options': [],
            'price': rawData.calculatedPrice,
            'isInStock': true
        };

        item.image = _createItemImage(rawData.mediaItem);
        item.quantityRange = {
            "_type": "wix:NumberInRange",
            "value": rawData.quantity,
            "minValue": 1,
            "maxValue": item.inventory
        };
        return item;
    }

    function convertFromProductBundle(rawData, productBundle) {
        var item = {
            '_type': 'ProductItem',
            'id': rawData.id,
            'title': productBundle.title || '',
            'quantity': 1,
            'origQuantity': 1,
            'inventory': 0,
            'quantityRange': '',
            'optionsDescription': [],
            'options': rawData.optionSelectionList,
            /* if rawData price is "0.00" it uses the productBundle price "<br />" */
            'price': shouldUseRawDataPrice(rawData.totalPrice) ? rawData.totalPrice : productBundle.price,
            'image': productBundle.currentImage || '',
            'isInStock': !productBundle.isInventoryManaged || rawData.inventory > 0
        };
        return item;
    }

    /**
     * Checks whether to use rawData price or if rawData price is "$0.00" or "R$0.00" or "USD0.00" returns false
     * @param priceStringToCheck
     * @returns {boolean}
     */
    function shouldUseRawDataPrice(priceStringToCheck) {
        var firstNumericIndex = _.findIndex(priceStringToCheck, function (character) {
            return !isNaN(character);
        });
        var actualPrice = priceStringToCheck.slice(firstNumericIndex);
        return !!parseFloat(actualPrice);
    }

    function _createItemImage(img) {
        var itemImg = '';
        if (img && img.mediaType) {
            var imgSrc = '';
            switch (img.mediaType) {
                case 'PHOTO_MEDIA':
                    imgSrc = img.mediaURL;
                    break;
                case 'VIDEO_MEDIA':
                    imgSrc = img.mediaIconURL;
                    break;
                default:
                    throw ('EcomProductItemConverter._createItemImage - unsupported media type');
            }
            if (imgSrc) {
                itemImg = {"_type": "wix:Image", "src": imgSrc, "width": img.mediaWidth, "height": img.mediaHeight};
            }
        }
        return itemImg;
    }

    return {
        convertFromProductBundle: convertFromProductBundle,
        convertFromCartProduct: convertFromCartProduct
    };
});

