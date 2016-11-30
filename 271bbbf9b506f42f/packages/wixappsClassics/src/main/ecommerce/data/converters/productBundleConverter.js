define(['lodash', 'wixappsClassics/ecommerce/data/converters/optionListConverter',
        'wixappsClassics/ecommerce/data/converters/productItemConverter',
        'wixappsClassics/ecommerce/data/converters/productMediaConverter',
        'utils'],
    function (_, optionListConverter, productItemConverter, productMediaConverter, utils) {
        "use strict";


        function convertProductBundleList(rawData, error) {
            var list = {
                '_type': 'ItemsList',
                'items': [],
                'emptyGalleryLabel': ''
            };

            if (error) {
                utils.log.verbose(error);
                return list;
            }
            var length = rawData.length;
            var idToProductMap = {};

            for (var i = 0; i < length; i++) {
                if (rawData[i]) {
                    var product = convertProductBundle(rawData[i]);
                    list.items.push(product);
                    idToProductMap[product.id] = product;
                }
            }

            return list;
        }

        function convertProductBundle(rawData) {

            var product = {
                '_type': 'ProductBundle',
                'id': rawData.id,
                'title': rawData.title || '<br/>',
                'ribbon': rawData.ribbon || '',
                'price': rawData.priceFormatted || '<br/>',
                'retailPrice': rawData.retailPriceFormatted || '<br/>',
                'options': rawData.optionsList && rawData.optionsList.map(optionListConverter.convertOptionsList) || [],
                'outOfStock': false
            };
            _addImagesToProduct(rawData, product);
            product.productItems = _getProductItems(rawData.productsItemsList, product);
            product.details = (rawData.details || '').replace(/\n/g, '<br/>');
            product.overview = (rawData.overview || '').replace(/\n/g, '<br/>');
            product.origPrice = product.price;
            cleanProductBundle(product);
            return product;
        }

        function cleanProductBundle(productData){
            productData.price = productData.origPrice;
            productData.selectedItemIndex = -1;
            var optionLists = productData.options;
            var existingOptions = {};
            _.forEach(optionLists, function(optionList){
                if (_.has(optionList, 'valid')){
                    //reset ivalidation errors
                    optionList.valid = true;
                }
                if (optionList.isSelectableList) {
                    //clear selected value
                    optionList.selectedValue = -1;
                    _.forEach(optionList.items, function(option){
                        existingOptions[option.value] = option;
                    });
                } else { // clean a text option
                    optionList.text = '';
                }
            });

            setAvailabilityOfOptions(existingOptions, productData.productItems);
        }

        function setAvailabilityOfOptions(existingOptions, productItems){
            _.forEach(productItems, function(productItem){
                _.forEach(productItem.options, function(productItemOptionVal){
                    if (existingOptions[productItemOptionVal]){
                        existingOptions[productItemOptionVal].enabled = true;
                        delete existingOptions[productItemOptionVal];
                    }
                });
            });

            _.forOwn(existingOptions, function(option){
                option.enabled = false;
            });
        }

        function _addImagesToProduct(rawData, product) {
            product.imageList = [];
            product.mediaItems = [];

            _.forEach(rawData.mediaList, function (value) {
                var image = {"_type": "wix:Image", "width": value.mediaWidth, "height": value.mediaHeight};
                switch (value.mediaType) {
                    case 'PHOTO_MEDIA':
                        image.src = value.mediaURL;
                        product.mediaItems.push(image);
                        break;
                    case 'VIDEO_MEDIA':
                        image.src = value.mediaIconURL;
                        var video = productMediaConverter.convertVideoUrl(value.mediaURL);
                        product.mediaItems.push(video);
                        break;
                    default:
                        throw ('EcomProductBundleConverter._addImagesToProduct - unsupported media type');
                }
                product.imageList.push(image);
            });
            if (product.mediaItems.length > 0) {
                product.productMedia = product.mediaItems[0];
                product.currentImage = product.imageList[0];
            } else {
                product.productMedia = {'_type': 'MediaItem'};
                product.currentImage = '';
            }
            product.imagesCount = product.imageList.length;
        }

        function _getProductItems(rawItems, productBundle) {
            var items = [];
            for (var i = 0; i < rawItems.length; i++) {
                var item = productItemConverter.convertFromProductBundle(rawItems[i], productBundle);
                if (item) {
                    items.push(item);
                }
            }
            return items;
        }

        function setDefaultSelctionForOptions(product){
            return _.map(product.options, function(option){
                return optionListConverter.setDefaultSelection(option);
            });
        }

        return {
            convertProductBundleList: convertProductBundleList,
            setDefaultSelctionForOptions: setDefaultSelctionForOptions,
            convertProductBundle: convertProductBundle,
            cleanProductBundle: cleanProductBundle
        };
    });


