import { getDataByScheme } from '../../src/utils/builders/CloneByScheme';
import { changeDeepProperty } from '../../src/utils/builders/DeepPropertyChanger';

import CqrsCommandBuilder from  '../../src/utils/builders/CqrsCommandsBuilder';


describe('CQRS Commands builder', () => {

    const scheme = {
        id: 'string',
        name: 'string',
        inventory: {
            type: 'object',
            scheme: {
                quantity: 'number',
                status: 'string',
                trackingMethod: 'string'
            }
        },
        collections: {
            type: 'array',
            scheme: {
                id: 'string',
                name: 'string'
            }
        },
        discount: {
            type: 'object',
            scheme: {
                mode: 'string',
                value: 'number'
            }
        },
        manageProductItems: 'boolean',
        isVisible: 'boolean',
        managedProductItems: {
            type: 'enumObject',
            scheme: {
                inventory: {
                    type: 'object',
                    scheme: {
                        quantity: 'number',
                        status: 'string'
                    }
                },
                optionsSelections: 'array',
                visibility: 'string'
            }
        },
        media: {
            type: 'array',
            scheme: {
                height: 'number',
                index: 'number',
                mediaType: 'string',
                title: 'string',
                url: 'string',
                width: 'number'
            }
        },
    };

    const product = {
        id: '123',
        name: 'product',
        inventory: {
            quantity: 0,
            status: 'out_of_stock',
            trackingMethod: 'status'
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
            value: 134
        },
        isVisible: true,
        manageProductItems: true,
        managedProductItems: {
            0: {
                inventory: {
                    quantity: 0,
                    status: 'out_of_stock'
                },
                optionsSelections: [0, 1]
            },
            1: {
                inventory: {
                    quantity: 1,
                    status: 'in_stock'
                },
                optionsSelections: [1, 2]
            }
        },
        media: [{
            height: 100,
            index: 0,
            mediaType: 'string',
            title: 'string',
            url: '123',
            width: 100
        }, {
            height: 100,
            index: 1,
            mediaType: 'string',
            title: 'string',
            url: '321',
            width: 100
        }, {
            height: 100,
            index: 2,
            mediaType: 'string',
            title: 'string',
            url: '123456',
            width: 100
        }]
    };

    it('should return array empty', () => {
        expect(CqrsCommandBuilder({}, {})).toEqual([]);
    });

    it('should return NameProduct command', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty('name', 'new name', editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([{
            name: 'NameProduct',
            data: {
                name: 'new name'
            }
        }]);
    });

    it('should return IsVisible command', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty('isVisible', false, editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([{
            name: 'HideProduct',
            data: {}
        }]);
    });

    it('should return manageProductItems command', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty('manageProductItems', false, editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([{
            name: 'DoNotManageProductItems',
            data: {}
        }]);
    });

    it('should return discount command', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty('discount.value', 321, editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([{
            name: 'SetDiscountAmount',
            data: {
                discountAmount: 321
            }
        }]);
    });

    it('should return Collection command', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty(
            'collections',
            [{
                id: 1,
                name: 'coll_1'
            }, {
                id: 3,
                name: 'coll_3'
            }],
            editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([
            {name: 'RemoveProductFromCategory', data: {categoryId: 2}},
            {name: 'AddProductToCategory', data: {categoryId: 3}}
        ]);
    });

    it('should return Inventory commands', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty(
            'inventory.quantity',
            2,
            editedProduct);

        editedProduct = changeDeepProperty(
            'inventory.status',
            'in_stock',
            editedProduct);

        editedProduct = changeDeepProperty(
            'inventory.trackingMethod',
            'quantity',
            editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual([
            {name: 'SetInventoryTrackingMethod', data: {trackingMethod: 'quantity'}},
            {name: 'IncreaseInventoryQuantity', data: {quantity: 2}},
            {name: 'UpdateInventoryStatus', data: {status: 'in_stock'}}
        ]);
    });

    it('should return managedProductItems commands', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty(
            'managedProductItems.0.inventory.quantity',
            2,
            editedProduct);

        editedProduct = changeDeepProperty(
            'managedProductItems.1.inventory.status',
            'out_of_stock',
            editedProduct);

        editedProduct = changeDeepProperty(
            'managedProductItems', {
                ...editedProduct.managedProductItems,
                2: {
                    inventory: {
                        quantity: 2,
                        status: "in_stock"
                    },
                    optionsSelections: [2, 2],
                    visibility: 'visible'
                },
                3: {
                    inventory: {
                        quantity: 3,
                        status: "in_stock"
                    },
                    optionsSelections: [3, 2],
                    visibility: 'visible'
                }
            },
            editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual(
            [
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 0, 1 ], quantity: 2 } },
                { name: 'UpdateInventoryStatus', data: { optionsSelections: [ 1, 2 ], status: 'out_of_stock' } },
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 2, 2 ], quantity: 2 } },
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 3, 2 ], quantity: 3 } }
            ]

        );
    });

    it('should return managedProductItems commands', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty(
            'managedProductItems.0.inventory.quantity',
            2,
            editedProduct);

        editedProduct = changeDeepProperty(
            'managedProductItems.1.inventory.status',
            'out_of_stock',
            editedProduct);

        editedProduct = changeDeepProperty(
            'managedProductItems', {
                ...editedProduct.managedProductItems,
                2: {
                    inventory: {
                        quantity: 2,
                        status: "in_stock"
                    },
                    optionsSelections: [2, 2],
                    visibility: 'visible'
                },
                3: {
                    inventory: {
                        quantity: 3,
                        status: "in_stock"
                    },
                    optionsSelections: [3, 2],
                    visibility: 'visible'
                }
            },
            editedProduct);

        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual(
            [
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 0, 1 ], quantity: 2 } },
                { name: 'UpdateInventoryStatus', data: { optionsSelections: [ 1, 2 ], status: 'out_of_stock' } },
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 2, 2 ], quantity: 2 } },
                { name: 'IncreaseInventoryQuantity', data: { optionsSelections: [ 3, 2 ], quantity: 3 } }
            ]

        );
    });

    it('should return managedProductItems commands', () => {
        let editedProduct = getDataByScheme(scheme, product);
        editedProduct = changeDeepProperty(
            'media',
            [{
                height: 100,
                index: 0,
                mediaType: 'string',
                title: 'string',
                url: 'q123',
                width: 100
            }, {
                height: 100,
                index: 1,
                mediaType: 'string',
                title: 'string',
                url: '123456',
                width: 100
            },  {
                height: 100,
                index: 2,
                mediaType: 'string',
                title: 'string',
                url: '321',
                width: 100
            }],
            editedProduct);


        expect(CqrsCommandBuilder(product, editedProduct, scheme)).toEqual(
            [{
                name: 'RemoveProductMediaItem',
                data: {
                    url: '123'
                }
            }, {
                name: 'AddMediaItemToProduct',
                data: {
                    media: {
                        height: 100,
                        index: 0,
                        mediaType: 'string',
                        title: 'string',
                        url: 'q123',
                        width: 100
                    }
                }
            }, {
                name: 'UpdateProductMediaItem',
                data: {
                    media: {
                        height: 100,
                        index: 2,
                        mediaType: 'string',
                        title: 'string',
                        url: '321',
                        width: 100
                    }
                }
            }, {
                name: 'UpdateProductMediaItem',
                data: {
                    media: {
                            height: 100,
                            index: 1,
                            mediaType: 'string',
                            title: 'string',
                            url: '123456',
                            width: 100
                        }
                    }
                }
            ]
        );
    });
});

