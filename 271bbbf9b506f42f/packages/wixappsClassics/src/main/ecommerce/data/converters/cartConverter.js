define(['wixappsClassics/ecommerce/data/converters/productItemConverter',
        'wixappsClassics/ecommerce/data/converters/shippingConverter'],
    function (productItemConverter, shippingConverter) {
        "use strict";

        var NULL_CART_ID = 'nullCartId';


        function convertCart(rawData, couponCode) {
            if (!rawData) {
                return _getDummyData();
            }
            var cart = {
                '_type': 'Cart',
                'totalPrice': rawData.cart.total,
                'subTotal': rawData.cart.subTotal || "",
                'id': rawData.cart.cartId,
                'items': [],
                'hasCoupon': rawData.cart.hasCoupon || false,
                'coupon': {"_type": "Coupon", "couponCode": couponCode || '', "couponName": '', "discountAmount": '', "validationMessage": ''},
                'hasFees': rawData.cart.hasFees || false,
                'fees': {'_type': "Fees", 'destination': {'_type': "Destination", 'shippable': false}, 'shippingFees': "", 'taxFees': ""},
                'emptyCartImage': {"_type": "wix:Image", "title": "Cart", "src": "images/empty_cart.png", "width": 70, "height": 60},
                'hasProductsOptions': false,
                'hasExternalCheckoutUrl': rawData.cart.hasCheckout || false
            };
            cart.itemsCount = _populateCartItems(rawData.productCartItems, cart);
            _setCouponData(rawData, cart);
            _setFeesData(rawData, cart);

            return cart;
        }

        function _getDummyData() {
            return {
                '_type': 'Cart',
                'totalPrice': '',
                'subTotal': '',
                'id': NULL_CART_ID,
                'items': [],
                'itemsCount': 0,
                'hasCoupon': false,
                'coupon': {},
                'hasFees': false,
                'fees': {},
                'emptyCartImage': {"_type": "wix:Image", "title": "Cart", "src": "images/empty_cart.png", "width": 70, "height": 60},
                'hasProductsOptions': false,
                'hasExternalCheckoutUrl': false
            };
        }

        function _setCouponData(rawData, cart) {
            var couponData = rawData.cart.coupon;
            if (cart.hasCoupon && couponData) {
                if (couponData.name) {
                    cart.coupon.couponName = couponData.name; //coupon name isn't mandatory field
                }
                cart.coupon.discountAmount = couponData.discountAmount;
            }
        }

        function _setFeesData(rawData, cart) {
            var feesData = rawData.cart.fees;
            if (cart.hasFees && feesData) {
                cart.fees.shippingFees = feesData.shipping && feesData.shipping.cost || "";
                cart.fees.taxFees = feesData.tax && feesData.tax.cost || "";
                cart.fees.destination = shippingConverter.convertCartDestination(feesData.destination);

                if (feesData.destination.type === 'unresolved') {
                    cart.preloadShipping = true;
                }
            }
        }

        function _populateCartItems(rawCartItems, cart) {
            var itemsCount = 0;
            for (var i = 0; i < rawCartItems.length; i++) {
                var item = productItemConverter.convertFromCartProduct(rawCartItems[i]);
                if (item) {
                    cart.items.push(item);
                    itemsCount += item.quantity;

                    if (!cart.hasProductsOptions && item.optionsDescription.length) {
                        cart.hasProductsOptions = true;
                    }
                }
            }

            return itemsCount;
        }

        return {
            convertCart: convertCart,
            NULL_CART_ID: NULL_CART_ID
        };
    });

