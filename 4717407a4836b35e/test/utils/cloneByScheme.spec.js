import { getDataByScheme, generateEmptyDataByScheme } from '../../src/utils/builders/CloneByScheme';

describe('Clone object by scheme', () => {

    let productObject;

    beforeEach(() => {
        productObject = {
            id: '111',
            name: 'Product',
            description: 'Some Description',
            price: 124,
            ribbon: 'sale',
            inventory: {
                quantity: 1,
                status: 'in_stock',
                trackingMethod: 'quantity'
            },
            collections: [{
                id: 0,
                name: 'collection 1'
            }, {
                id: 0,
                name: 'collection 2'
            }],
            variants: {
                k1: {
                    quantity: 1,
                    status: 'string'
                },
                k2: {
                    quantity: 2,
                    status: 'string'
                }
            }
        }
    });

    it('should return new object', () => {
        const scheme = {
            id: 'string'
        };

        const cloneProduct = getDataByScheme(scheme, productObject);
        expect(cloneProduct !== productObject && ('id' in cloneProduct)).toBeTruthy()
    });

    it('should return new object with keys following by scheme', () => {
        const scheme = {
            id: 'string'
        };

        const cloneProduct = getDataByScheme(scheme, productObject);
        expect(Object.keys(cloneProduct).length).toEqual(1)
    });

    it('should not change the base object after clone object has been changed', () => {
        const scheme = {
            price: 'number',
        };

        const cloneProduct = getDataByScheme(scheme, productObject);
        cloneProduct.price = 312;

        expect(cloneProduct.price === productObject.price).toBeFalsy();
    });

    it('should clone complex structure', () => {
        const scheme = {
            id: 'string',
            inventory: {
                type: 'object',
                scheme: {
                    quantity: 'number',
                    status: 'string',
                    trackingMethod: 'string'
                }
            },
        };

        const cloneProduct = getDataByScheme(scheme, productObject);
        expect( ('inventory' in cloneProduct) && ('status' in cloneProduct.inventory)).toBeTruthy();
    });

    it('should clone array structure', () => {
        const scheme = {
            id: 'string',
            collections: {
                type: 'array',
                scheme: {
                    id: 'string',
                    name: 'string'
                }
            },
        };

        const cloneProduct = getDataByScheme(scheme, productObject);
        expect(('collections' in cloneProduct) && cloneProduct.collections.leading === productObject.collections.leading).toBeTruthy();
    });

    it('should clone enum object structure', () => {
        const scheme = {
            id: 'string',
            variants: {
                type: 'enumObject',
                scheme: {
                    quantity: 'number',
                    status: 'string'
                }
            }
        };

        const cloneProduct = getDataByScheme(scheme, productObject);

        expect(('variants' in cloneProduct) && Object.keys(cloneProduct.variants).length === Object.keys(productObject.variants).length).toBeTruthy();
    });


});

describe('Create Object by scheme', () => {

    it('should create new empty object with simple property ', () => {
        const scheme = {
            id: 'string'
        };

        const newObject = generateEmptyDataByScheme(scheme);

        expect(newObject).toEqual({
            id: ''
        })

    })

    it('should create new empty object with array property without deep props', () => {
        const scheme = {
            id: 'string',
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

        const newObject = generateEmptyDataByScheme(scheme, ['media']);

        expect(newObject).toEqual({
            id: '',
            media: []
        });
    });

    it('should create new empty object with array property with deep object property', () => {
        const scheme = {
            id: 'string',
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
            options: {
                type: 'object',
                scheme: {
                    options: 'array'
                }
            },
        };

        const newObject = generateEmptyDataByScheme(scheme, ['media']);

        expect(newObject).toEqual({
            id: '',
            media: [],
            options: {
                options: []
            }
        });
    });

    it('should create new empty object with default property', () => {
        const scheme = {
            id: 'string',
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
            inventory: {
                type: 'object',
                scheme: {
                    quantity: 'number',
                    status: {
                        type: 'string',
                        defaultValue: 'in_stock'
                    },
                    trackingMethod: {
                        type: 'string',
                        defaultValue: 'status'
                    }
                }
            },
            manageProductItems: {
                type: 'string',
                defaultValue: 'disabled'
            },
        };

        const newObject = generateEmptyDataByScheme(scheme, ['media']);

        expect(newObject).toEqual({
            id: '',
            media: [],
            inventory: {
                quantity: 0,
                status: 'in_stock',
                trackingMethod: 'status'
            },
            manageProductItems: 'disabled'
        });
    });
});
