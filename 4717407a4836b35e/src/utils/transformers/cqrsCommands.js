const inventoryCommands = {
    status([_, value]) {
        return {
            name: 'UpdateInventoryStatus',
            priority: 2,
            data: {
                status: value
            }
        };
    },
    quantity([type ,value]) {
        return {
            name: ({'inc': 'IncreaseInventoryQuantity', 'dec': 'ReduceInventoryQuantity'})[type],
            priority: 2,
            data: {
                quantity: value
            }
        }
    },
    trackingMethod([_, value]) {
        return {
            name: 'SetInventoryTrackingMethod',
            priority: 1,
            data: {
                trackingMethod: value
            }
        }
    }
};

const discountCommands = {
    value([_, value]) {
        return {
            name: 'SetDiscountAmount',
            data: {
                discountAmount: value
            }
        };
    }
};

const variantsCommands = {
    status([_, value], sectionValue) {
        return {
            name: 'UpdateInventoryStatus',
            data: {
                optionsSelections: [...sectionValue.optionsSelections],
                status: value
            }

        }
    },
    quantity([type, value], sectionValue) {
        return {
            name: ({'inc': 'IncreaseInventoryQuantity', 'dec': 'ReduceInventoryQuantity'})[type],
            data: {
                optionsSelections: [...sectionValue.optionsSelections],
                quantity: value
            }
        }
    }
};

const genericPropToCommand = (commandList) => (props, sectionValue) => Object.keys(props).reduce((commands, propName)=> {
    if (commandList[propName]) {
        commands = [...commands, commandList[propName](props[propName], sectionValue, propName)]
    }
    return commands;
}, []);

export function id([_, value]) {
    return {
        name: 'CreateProduct',
        priority: 0,
        data: {}
    }
}

export function name([_, value]) {
    return {
        name: 'NameProduct',
        data: {
            name: value
        }
    }
}

export function description([_, value]) {
    return {
        name: 'DescribeProduct',
        data: {
            description: value
        }
    }
}

export function price([_, value]){
    return {
        name: 'SetProductPrice',
        data: {
            price: value
        }
    }
}

export function ribbon([_, value]) {
    return {
        name: 'DecorateProductWithRibbon',
        data: {
            ribbon: value
        }
    }
}

export function isVisible([_, value]){
    return {
        name: value ? 'UnhideProduct' : 'HideProduct',
        data: {}
    }
}

export function manageProductItems([_, value]){
    return {
        name: value ? 'ManageProductItems' : 'DoNotManageProductItems',
        data: {}
    }
}

export const media = (mediaChanges = []) => mediaChanges
    .map(([comm, item]) => ({
        name: ({
            'added': 'AddMediaItemToProduct',
            'deleted': 'RemoveProductMediaItem',
            'updated': 'UpdateProductMediaItem',
        })[comm],
        data: {
            [comm !== 'deleted' ? 'media' : 'url']: comm !== 'deleted' ? item : item.url
        }
    }));

export const discount = genericPropToCommand(discountCommands);

export const inventory = genericPropToCommand(inventoryCommands);

export const collections = (collectionChanges = []) => collectionChanges
    .filter(([coll]) => coll === 'added' || coll === 'deleted')
    .map(([comm, coll]) => ({
        name: ({'added': 'AddProductToCategory', 'deleted': 'RemoveProductFromCategory'})[comm],
        data: {
            categoryId: coll.id
        }
    }));

export const managedProductItems = (args, sectionValue) => {
    return Object.keys(args).reduce((v, n) => {
        v = [...v, ...genericPropToCommand(variantsCommands)((args[n] || {} ).inventory, sectionValue[n])];
        return v;
    }, []);
};

export const deleteProduct = () => {
    return {
        name: 'DeleteProduct',
        data: {}
    }
};
