export default function getInventoryStatus(_inv, _mp) {
    let quantity = _mp && _mp.inventoryQuantity || _inv.quantity;
    return {
        quantity,
        isOutOfStock: _inv.trackingMethod === 'quantity' && quantity === 0 || _inv.status === 'out_of_stock' && !_mp || _mp && !_mp.inStockProductItemsCount,
        ...(_mp ? {
            status: _mp.productItemsCount === 0 || (_mp.productItemsCount - _mp.inStockProductItemsCount > 0) ? (_mp.inStockProductItemsCount ? 'partially_out_of_stock' : 'out_of_stock') : 'in_stock',
            showStatus: true
        } : {
            status: (_inv.trackingMethod === 'quantity' && quantity === 0 || _inv.status === 'out_of_stock') ? 'out_of_stock' : 'in_stock',
            showStatus: !(_inv.trackingMethod === 'quantity' && quantity !== 0 )
        })
    };
};