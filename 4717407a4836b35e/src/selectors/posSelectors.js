export const cartTransform = (cart) => !cart ? null : {
    ...cart,
    itemsQuantity: cart.items.reduce((acc, item) => acc + item.quantity, 0)
  };