export default {
    id: 'string',
    name: 'string',
    ribbon: 'string',
    mediaUrl: 'string',
    isVisible: 'boolean',
    price: 'number',
    inventory: {
        type: 'object',
        scheme: {
            quantity: 'number',
            status: 'string',
            trackingMethod: 'string'
        }
    },
    managedProductItemsSummary: {
        inStockProductItemsCount: 'number',
        inventoryQuantity: 'number',
        productItemsCount: 'number'
    },
    discount: {
        type: 'object',
        scheme: {
            mode: 'string',
            value: 'number'
        }
    }
};
