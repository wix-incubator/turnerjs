import _ from 'lodash/fp'
import {
  getManagedProductItemsSummary,
  getInventoryStatus,
  getVariants,
  media,
  prodCollections,
  salePrice,
  formatPrice
} from '../../src/selectors/productSelectors';

import { changeDeepProperty } from '../../src/utils/builders/DeepPropertyChanger';

describe('Product Property Filters', () => {
    let initialProduct;

    beforeEach(function () {
        initialProduct = {
            id: '123',
            name: 'product',
            price: 500,
            inventory: {
                quantity: 0,
                status: 'out_of_stock',
                trackingMethod: 'quantity'
            },
            collections: [{
                id: 1,
                name: 'coll_1'
            }, {
                id: 2,
                name: 'coll_2'
            }],
            discount: {
                mode: 'AMOUNT',
                value: 200
            },
            isVisible: true,
            manageProductItems: 'enabled',
            options: {
                options: [{
                    selections: [{
                        id:1,
                        description: '1'
                    }, {
                        id:2,
                        description: '2'
                    }]
                }, {
                    selections: [{
                        id:3,
                        description: '3'
                    }, {
                        id:4,
                        description: '4'
                    }]
                }]
            },
            managedProductItems: {
                0: {
                    inventory: {
                        quantity: 3,
                        status: 'in_stock'
                    },
                    optionsSelections: [1, 3],
                    visibility: 'visible'
                },
                1: {
                    inventory: {
                        quantity: 1,
                        status: 'in_stock'
                    },
                    optionsSelections: [2, 4],
                    visibility: 'visible'
                }
            },
            media: [{index: 0}, {index: 1}]
        };
    });

    describe('getManagedProductItemsSummary', () => {
        it('should return result of summary with inventory.trackingMethod eq. quantity', () => {

            const res = getManagedProductItemsSummary(initialProduct);

            expect(res).toEqual({
                inStockProductItemsCount: 2,
                productItemsCount: 4
            })

        });

        it('should return result of summary with inventory.trackingMethod eq. status', () => {
            const res = getManagedProductItemsSummary(changeDeepProperty('inventory.trackingMethod', 'status', initialProduct));

            expect(res).toEqual({
                inStockProductItemsCount: 4,
                productItemsCount: 4
            });
        });

        it('should return result of summary with managedProductItems inventory status eq. out_of_stock', () => {
            const product = _.compose(
                changeDeepProperty('managedProductItems.1.inventory.status', 'out_of_stock'),
                changeDeepProperty('managedProductItems.0.inventory.status', 'out_of_stock'),
                changeDeepProperty('inventory.trackingMethod', 'status')
            )(initialProduct);

            const res = getManagedProductItemsSummary(product);

            expect(res).toEqual({
                inStockProductItemsCount: 2,
                productItemsCount: 4
            });
        });
    });

    describe('getInventoryStatus', () => {

        it('should return partially_out_of_stock status regarding options quantity', () => {
            const res = getInventoryStatus(initialProduct);

            expect(res).toEqual({
                quantity: 0,
                status: 'partially_out_of_stock',
                showStatus: true
            });
        });

        it('should return in_stock status regarding options quantity', () => {
            let product = changeDeepProperty('managedProductItems', {
                0: {
                    inventory: {
                        quantity: 3,
                        status: 'in_stock'
                    },
                    optionsSelections: [1, 3],
                    visibility: 'visible'
                },
                1: {
                    inventory: {
                        quantity: 1,
                        status: 'in_stock'
                    },
                    optionsSelections: [1, 4],
                    visibility: 'visible'
                },
                2: {
                    inventory: {
                        quantity: 1,
                        status: 'in_stock'
                    },
                    optionsSelections: [2, 3],
                    visibility: 'visible'
                },
                3: {
                    inventory: {
                        quantity: 1,
                        status: 'in_stock'
                    },
                    optionsSelections: [2, 4],
                    visibility: 'visible'
                }
            }, initialProduct);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 0,
                status: 'in_stock',
                showStatus: true
            });
        });

        it('should return out_of_stock status regarding options quantity', () => {
            const product = _.compose(
              changeDeepProperty('managedProductItems.0.inventory.quantity', '0'),
              changeDeepProperty('managedProductItems.1.inventory.quantity', '0')
            )(initialProduct);

            console.log(product);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 0,
                status: 'out_of_stock',
                showStatus: true
            });
        });

        it('should return in_stock status regarding options status', () => {
            const product = _.compose(
              changeDeepProperty('inventory.trackingMethod', 'status')
            )(initialProduct);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 0,
                status: 'in_stock',
                showStatus: true
            });
        });

        it('should return partially_out_of_stock status regarding options status', () => {
            const product = _.compose(
              changeDeepProperty('managedProductItems.0.inventory.status', 'out_of_stock'),
              changeDeepProperty('inventory.trackingMethod', 'status')
            )(initialProduct);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 0,
                status: 'partially_out_of_stock',
                showStatus: true
            });
        });

        it('should return out_of_stock status regarding options status', () => {
            const product = _.compose(
              changeDeepProperty('managedProductItems', {
                  0: {
                      inventory: {
                          quantity: 3,
                          status: 'out_of_stock'
                      },
                      optionsSelections: [1, 3],
                      visibility: 'visible'
                  },
                  1: {
                      inventory: {
                          quantity: 1,
                          status: 'out_of_stock'
                      },
                      optionsSelections: [1, 4],
                      visibility: 'visible'
                  },
                  2: {
                      inventory: {
                          quantity: 1,
                          status: 'out_of_stock'
                      },
                      optionsSelections: [2, 3],
                      visibility: 'visible'
                  },
                  3: {
                      inventory: {
                          quantity: 1,
                          status: 'out_of_stock'
                      },
                      optionsSelections: [2, 4],
                      visibility: 'visible'
                  }
              }),
              changeDeepProperty('inventory.trackingMethod', 'status')
            )(initialProduct);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 0,
                status: 'out_of_stock',
                showStatus: true
            });
        });

        it('should return showStatus eq. false', () => {
            const product = _.compose(
              changeDeepProperty('inventory.quantity', 10),
              changeDeepProperty('inventory.trackingMethod', 'quantity'),
              changeDeepProperty('manageProductItems', 'disabled')
            )(initialProduct);

            const res = getInventoryStatus(product);

            expect(res).toEqual({
                quantity: 10,
                status: 'out_of_stock',
                showStatus: false
            });
        });

    });

    describe('getVariants', () => {

        it('should generate variants list', () => {
            const res = getVariants(initialProduct);
            expect(res).toEqual({
                '0': {
                    optionsSelections: [ 1, 3 ],
                    description: [ '1', '3' ],
                    visibility: 'visible',
                    inventory: { quantity: 3, status: 'in_stock' }
                },
                '1': {
                    optionsSelections: [ 2, 3 ],
                    description: [ '2', '3' ],
                    visibility: 'visible',
                    inventory: { status: 'in_stock', quantity: 0 }
                },
                '2': {
                    optionsSelections: [ 1, 4 ],
                    description: [ '1', '4' ],
                    visibility: 'visible',
                    inventory: { status: 'in_stock', quantity: 0 }
                },
                '3': {
                    optionsSelections: [ 2, 4 ],
                    description: [ '2', '4' ],
                    visibility: 'visible',
                    inventory: { quantity: 1, status: 'in_stock' }
                }
            });
        });
    });

    describe('Media Items', function () {

        it('should return empty array', () => {
            const res = media({editProduct: {}, products: {}});

            expect(res.length).toEqual(0);
        });

        it('should not return empty array', () => {
            const res = media({editProduct: {
                editedProduct: initialProduct
            }, products: {
                product: initialProduct
            }});

            expect(res.length).toEqual(2);
        });

    });
    describe('Product Collections', () => {

        it('should return empty array', () => {
            const res = prodCollections(initialProduct);
            expect(res.length).toEqual(0);
        });

        it('should return one collection for current product', () => {
            const collections = {
                testCollection: {
                    id: 'testCollection',
                    name: 'testCollection',
                    productIds: ['432', 'sdfsdf', initialProduct.id]
                },
                secondTestCollection: {
                    id: 'secondTestCollection',
                    name: 'secondTestCollection',
                    productIds: ['432', 'sdfsdf']
                }
            };

            const res = prodCollections(initialProduct, collections);
            expect(res.length).toEqual(1);
        });

        it('should return all collections with current product', () => {
            const collections = {
                testCollection: {
                    id: 'testCollection',
                    name: 'testCollection',
                    productIds: ['432', initialProduct.id]
                },
                secondTestCollection: {
                    id: 'secondTestCollection',
                    name: 'secondTestCollection',
                    productIds: ['432', 'sdfsdf', initialProduct.id]
                }
            };

            const res = prodCollections(initialProduct, collections);
            expect(res.length).toEqual(2);
        });

    });

    describe('Sale Price', () => {

        it('should return empty string', () => {

            const product = {
                ...initialProduct,
                discount: {
                    value: 0
                }
            };

            const res = salePrice({editProduct: {
                editedProduct: product
            }});

            expect(res).toBe('');
        });

        it('should return correct sale price', () => {
            const res = salePrice({editProduct: {
                editedProduct: initialProduct
            }});

            expect(res).toBe(300);
        });

        it('should return sale price based on percent discount', () => {

            const product = {
                ...initialProduct,
                discount: {
                    value: 50,
                    mode: 'PERCENT'
                }
            };

            const res = salePrice({editProduct: {
                editedProduct: product
            }});

            expect(res).toBe(250);
        });
    });

    describe('Format Price', () => {

        it('should format price with default params', () => {
            const res = formatPrice(1000.20, {});
            expect(res).toBe('1,000.20');
        });

        it('should format price with default params without floating digits', () => {
            const res = formatPrice(1000, {});
            expect(res).toBe('1,000.00');
        });

        it('should format price with given params', () => {
            const res = formatPrice(1000, {
                currencyFractionSize: 3,
                currencyDecimalSeparator: ',',
                currencyGroupSeparator: '.'
            });
            expect(res).toBe('1.000,000');
        });
    });
});
