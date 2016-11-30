import _ from 'lodash';

export const mediaCommands = {
    addImage: 'addImage',
    updateMediaItem: 'updateMediaItem',
    deleteMediaItem: 'deleteMediaItem'
};

//public removeProductFromCategory(productId:string, categoryId:string):ng.IPromise<any> {
//    return this.executeCategoryCommand(REMOVE_FROM_CATEGORY, {
//        id: productId,
//        categoryId: categoryId
//    });
//}
//
//public removeProductsFromCategory(productIdsList:any[], categoryId:string):ng.IPromise<any> {
//    return this.executeCategoryCommand(BULK_REMOVE_FROM_CATEGORY, {
//        ids: productIdsList,
//        categoryId: categoryId
//    });
//}
//
//public addProductToCategory(productId:string, categoryId:string):ng.IPromise<any> {
//    return this.executeCategoryCommand(ADD_TO_CATEGORY, {
//        id: productId,
//        categoryId: categoryId
//    });
//}
//
//public addProductsToCategory(productIdsList:any[], categoryId:string):ng.IPromise<any> {
//    return this.executeCategoryCommand(BULK_ADD_TO_CATEGORY, {
//        ids: productIdsList,
//        categoryId: categoryId
//    });
//}


//{"commands":[{"name":"SetInventoryTrackingMethod","data":{"id":"109ff1e7-b315-f016-d47c-fd9bfa956f8e","trackingMethod":"status"}}]}

//{"commands":[{"name":"IncreaseInventoryQuantity","data":{"id":"109ff1e7-b315-f016-d47c-fd9bfa956f8e","quantity":3}}]} //how match
//{"commands":[{"name":"ReduceInventoryQuantity","data":{"id":"109ff1e7-b315-f016-d47c-fd9bfa956f8e","quantity":2}}]} //how match

const commands = {
    discount : {
        command: 'SetDiscountAmount',
        dataType: 'property',
        type: 'single'
    },
    addToCollection: {
        command: 'AddProductToCategory',
        dataType: 'property',
        field: 'categoryId',
        type: 'many'
    },
    removeFromCollection: {
        command: 'RemoveProductFromCategory',
        dataType: 'property',
        field: 'categoryId',
        type: 'many'
    },
    reduceInventoryQuantity: {
        command: 'ReduceInventoryQuantity',
        dataType: 'fields',
        type: 'many'
    },
    increaseInventoryQuantity: {
        command: 'IncreaseInventoryQuantity',
        dataType: 'fields',
        type: 'many'
    },
    updateInventoryStatus: {
        command: 'UpdateInventoryStatus',
        dataType: 'fields',
        type: 'many'
    },
    trackingMethod: {
        command: 'SetInventoryTrackingMethod',
        dataType: 'property',
        type: 'single'
    },
    status: {
        command: 'UpdateInventoryStatus',
        dataType: 'property',
        type: 'single'
    },
    quantity: {
        command: 'IncreaseInventoryQuantity',
        dataType: 'mutate',
        type: 'single'
    },
    name: {
        command: 'NameProduct',
        dataType: 'property',
        type: 'single'
    },
    price: {
        command: 'SetProductPrice',
        dataType: 'property',
        type: 'single'
    },
    description: {
        command: 'DescribeProduct',
        dataType: 'property',
        type: 'single'
    },
    ribbon: {
        command: 'DecorateProductWithRibbon',
        dataType: 'property',
        type: 'single'
    },
    isVisible: {
        command: ['UnhideProduct', 'HideProduct'],
        dataType: 'boolean',
        type: 'single'
    },
    manageProductItems: {
        command: ['ManageProductItems', 'DoNotManageProductItems'],
        dataType: 'boolean',
        type: 'single'
    },
    createProduct: {
        command: 'CreateProduct',
        type: 'single'
    },
    deleteProduct: {
        command: 'DeleteProduct',
        type: 'many'
    },
    [mediaCommands.addImage]: {
        command: 'AddMediaItemToProduct',
        dataType: 'object',
        field: 'media',
        type: 'many'
    },
    [mediaCommands.updateMediaItem]: {
        command: 'UpdateProductMediaItem',
        dataType: 'object',
        field: 'media',
        type: 'many'
    },
    [mediaCommands.deleteMediaItem]: {
        command: 'RemoveProductMediaItem',
        dataType: 'property',
        field: 'url',
        type: 'many'
    },
    bulkDeleteProduct: {
        command: 'BulkDeleteProduct',
        dataType: 'property',
        field: 'ids',
        type: 'many'
    }
};

const exceptions = {
    quantity: {
        getCorrectValue(key, commandProps, baseData){
            return {[commands[key].field || key]: Math.abs(commandProps[key] - baseData[key])}
        },
        getCorrectCommand(key, commandProps, baseData){
            if (commandProps[key] < baseData[key]) return 'ReduceInventoryQuantity';
            else return 'IncreaseInventoryQuantity';
        }
    },
    discount: {
        getCorrectValue(key, commandProps, baseData){
            return {discountAmount: commandProps[key].value};
        },
        getCorrectCommand() {
            return 'SetDiscountAmount';
        }
    }
};


function getCorrectValue(key, commandProps, baseData){
    if (exceptions[key] && exceptions[key].getCorrectValue) return exceptions[key].getCorrectValue(key, commandProps, baseData);
    if (commands[key].dataType && commands[key].dataType !== 'boolean') {
        if (commands[key].dataType === 'fields') {
            return {...commandProps[key]};
        }
        return {[commands[key].field || key]: commandProps[key] !== undefined ? commandProps[key] : baseData[key]}
    }

    return {}
}

function getCorrectCommand(key, commandProps, baseData){
    if (exceptions[key] && exceptions[key].getCorrectCommand) return exceptions[key].getCorrectCommand(key, commandProps, baseData);

    return commands[key].dataType === 'boolean' ?
        (commandProps[key] ? commands[key].command[0] : commands[key].command[1])
        : commands[key].command;
}


export default function(data){
    let _baseData = _.cloneDeep(data);
    let _commandData = {};

    return {
        pushCommand(prop, value) {
            if (!commands[prop]) return this;

            if (commands[prop].type === 'single'){
                _commandData[prop] = [{[prop]: value}];
            } else {
                _commandData[prop] = _commandData[prop] || [];
                _commandData[prop].push({[prop]: value});
            }

            return this;
        },
        getResult(){
            return _.keys(_commandData).reduce(function(acc, key){

                let cmdResult = _.filter(_.map(_commandData[key], (cmd) => {
                    if (!_.isEqual(cmd[key], _baseData[key])){
                        return {
                            name: getCorrectCommand(key, cmd, _baseData),
                            data: {...getCorrectValue(key, cmd, _baseData)}
                        };
                    }
                }), val => !!val);

                return [...acc, ...cmdResult];
            }, [])
        }
    };
}