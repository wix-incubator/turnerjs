export default {
    id: 'string',
    name: 'string',
    description: 'string',
    price: {
        type: 'number',
        defaultValue: ''
    },
    ribbon: 'string',
    fileItems: {
        type: 'array',
        scheme: {
            fileId: 'string',
            fileName: 'string',
            fileType: 'string'
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
    collections: {
        type: 'array',
        scheme: {
            id: 'string',
            name: 'string'
        }
    },
    options: {
        type: 'object',
        scheme: {
            options: 'array'
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
    discount: {
        type: 'object',
        scheme: {
            mode: {
                type: 'string',
                defaultValue: 'AMOUNT'
            },
            value: 'number'
        }
    },
    isVisible: {
        type: 'boolean',
        defaultValue: true
    }
};