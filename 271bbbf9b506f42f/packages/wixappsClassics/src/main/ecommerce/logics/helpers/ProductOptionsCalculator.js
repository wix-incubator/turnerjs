define(['lodash'], function(_){
    "use strict";

    var NON_OPTION_VALUE = -1;

    function ProductOptionsCalculator(productBundle){
        this._selectedOptions = [];
        /** an array of list indexes */
        this._optionListsWithoutSelection = [];
        this._selectableListCount = 0;
        this._possibleOptionsMap = null;
        this.product = productBundle;
        this._initPrivateLists();
    }

    ProductOptionsCalculator.prototype = {
        _initPrivateLists: function(){
            var optionLists = this.product.options;

            for (var i = 0; i < optionLists.length; i++) {
                if (optionLists[i].isSelectableList) {
                    this._optionListsWithoutSelection.push(i);
                    this._selectableListCount++; //eslint-disable-line space-unary-ops
                }
            }
            this.addPossibleOptionsToItemsMapToProduct();
        },

        _clearOptions: function(dataChangesBatch){
            this._optionListsWithoutSelection = [];
            var optionLists = this.product.options;

            for (var i = 0; i < optionLists.length; i++) {
                if (optionLists[i].isSelectableList) {
                    this._optionListsWithoutSelection.push(i);
                    this._cleanSelectedOptionFromData(i, dataChangesBatch);
                }
            }

            _.forEach(this._optionListsWithoutSelection, function (listIndex) {
                this.setOptionsAvailability(listIndex, [], dataChangesBatch);
            }, this);

            dataChangesBatch.push({path: ['price'], value: this.product.origPrice});
        },

        allOptionsSelected: function () {
          return this._selectableListCount === this._selectedOptions.length;
        },

        validateOptions: function(dataChangesBatch){
            var allValid = true;
            _.forEach(this.product.options, function(optionList, optionIndex){
                var valid = !optionList.isMandatory || (optionList.isSelectableList && optionList.selectedValue !== NON_OPTION_VALUE) || !!optionList.text;
                allValid = allValid && valid;
                dataChangesBatch.push({path: ['options', optionIndex, 'valid'], value: valid});
            });

            return allValid;
        },

        /**
         * will update the product bundle options enabled state
         * and return the corresponding product item if there are enough selections made
         * @param {Number} optionListIndex the index of the option list in the product bundle
         * @param {Number} selectedOptionId
         * @return {object} the product item that matches the selected options or null if there is none
         * @param dataChangesBatch
         */
        selectOption: function (optionListIndex, selectedOptionId, dataChangesBatch) {
            //if possible find a product item
            //if no product item matches new option id -> clean prev
            var productItem = null;
            if (this._optionListsWithoutSelection.length === 0 && this._selectableListCount > 1) {
                productItem = this._findExistingProductItem(optionListIndex, selectedOptionId, dataChangesBatch);
            } else {
                productItem = this._selectSingleOption(optionListIndex, selectedOptionId, dataChangesBatch);
            }
//            if (productItem){
//                dataChangesBatch.push({path: ['options', optionListIndex, 'selectedValue'], value: selectedOptionId});
//            }

            return productItem;
        },

        _selectSingleOption: function (optionListIndex, selectedOptionId, dataChangesBatch) {
            this._cleanPrevSelection(optionListIndex);
            if (selectedOptionId < 0) {
                this._clearOptions(dataChangesBatch);
                return null;
            }

            var selectedOptionIds = this._addSelectedOption(optionListIndex, selectedOptionId);

            this._optionListsWithoutSelection = _.without(this._optionListsWithoutSelection, optionListIndex);
            _.forEach(this._optionListsWithoutSelection, function (listIndex) {
                this.setOptionsAvailability(listIndex, selectedOptionIds, dataChangesBatch);
                this._cleanSelectedOptionFromData(listIndex, dataChangesBatch);
            }, this);
            var selectedItem = null;
            if (this._optionListsWithoutSelection.length === 0) {
                selectedItem = this.getProductItem(selectedOptionIds);
            }
            return selectedItem;
        },

        _findExistingProductItem: function (optionListIndex, selectedOptionId, dataChangesBatch) {
            this._cleanExistingSelection(optionListIndex);
            if (selectedOptionId < 0) {
                this._cleanSelectedOptionFromData(optionListIndex, dataChangesBatch);
                this._optionListsWithoutSelection.push(optionListIndex);
                return null;
            }
            var prevListIndex = this._selectedOptions.length > 0 ? this._selectedOptions[0].listIndex : optionListIndex;
            this.setOptionsAvailability(prevListIndex, [selectedOptionId], dataChangesBatch);

            var selectedOptionIds = this._addSelectedOption(optionListIndex, selectedOptionId);

            var selectedItem = this.getProductItem(selectedOptionIds);
            if (!selectedItem) {
                this._cleanSelectedOptionFromData(prevListIndex, dataChangesBatch);
            }
            return selectedItem;
        },

        _addSelectedOption: function(optionListIndex, selectedOptionId){
            //selected option is set to data by the proxy
            this._selectedOptions.push({
                'listIndex': optionListIndex,
                'selectedOptionId': selectedOptionId
            });

            return _.map(this._selectedOptions, 'selectedOptionId');
        },

        _cleanSelectedOptionFromData: function (listIndex, dataChangesBatch) {
            dataChangesBatch.push({path: ['options', listIndex, 'selectedValue'], value: NON_OPTION_VALUE});
        },

        _cleanPrevSelection: function (optionListIndex) {
            var existingSelectionIndex = _.findIndex(this._selectedOptions, {'listIndex': optionListIndex});
            if (existingSelectionIndex >= 0) {
                for (var i = this._selectedOptions.length - 1; i >= existingSelectionIndex; i--) {
                    this._optionListsWithoutSelection.push(this._selectedOptions[i].listIndex);
                    this._selectedOptions.pop();
                }
            }
        },

        _cleanExistingSelection: function (optionListIndex) {
            var existingSelectionIndex = _.findIndex(this._selectedOptions, {'listIndex': optionListIndex});
            if (existingSelectionIndex >= 0) {
                this._selectedOptions.splice(existingSelectionIndex, 1);
            }
        },


        /** for internal use
         * can work for any number of option lists, but..
         * probably will work well for up to 2 options!!!
         * cause for 3 you'll get n1 * n2 * n3 * 3! space..
         */
        addPossibleOptionsToItemsMapToProduct: function () {
            if (this._selectableListCount === 0) {
                this._possibleOptionsMap = 0;
                return;
            }
            var items = this.product.productItems;
            var possibleOptions = {};
            _.forEach(items, function (item, index) {
                if (!item.isInStock) {
                    return;
                }
                var itemOptions = item.options;
                this._buildOptionsMapForItemRecursively(possibleOptions, itemOptions || [], index);
            }, this);

            this._possibleOptionsMap = possibleOptions;
        },

        _buildOptionsMapForItemRecursively: function (map, remainingItemOptions, itemIndex) {
            var lastIteration;
            if (remainingItemOptions.length <= 1) {
                lastIteration = true;
            }
            _.forEach(remainingItemOptions, function (optionId) {
                if (lastIteration) {
                    map[optionId] = itemIndex;
                    return;
                }
                map[optionId] = map[optionId] || {};
                var newOps = _.without(remainingItemOptions, optionId);
                this._buildOptionsMapForItemRecursively(map[optionId], newOps, itemIndex);
            }, this);
        },

        /**
         *
         * @param {number[]=} selectedOptionIds if non passed will take the current
         * @return {object} the product item that corresponds to the options
         */
        getProductItem: function (selectedOptionIds) {
            if (!selectedOptionIds){
                selectedOptionIds = _.map(this._selectedOptions, 'selectedOptionId');
            }
            var productItemIndex = this._possibleOptionsMap;
            for (var i = 0; i < selectedOptionIds.length; i++) {
                var index = productItemIndex[selectedOptionIds[i]];
                if (typeof (index) !== 'number' && !index) {
                    return null;
                }
                productItemIndex = index;
            }
            if (typeof (productItemIndex) !== 'number') {
                return null;
            }
            return this.product.productItems[productItemIndex];
        },

        /**
         * updated the product bundle options enabled state according to the product items list
         * @param {Number} listIndex the index of the options list in the product bundle
         * @param {Array<Number>} selectedOptionIds
         * @param dataChangesBatch
         */
        setOptionsAvailability: function (listIndex, selectedOptionIds, dataChangesBatch) {
            var optionsList = this.product.options[listIndex];
            var filteredPossibleOptionsMap = this._possibleOptionsMap;
            for (var i = 0; i < selectedOptionIds.length; i++) {
                var filtered = filteredPossibleOptionsMap[selectedOptionIds[i]];
                if (!filtered) {
                    throw {
                        name: 'wrong args passed',
                        message: 'one of selected options passed is wrong'
                    };
                }
                filteredPossibleOptionsMap = filtered;
            }
            optionsList.items.forEach(function (option, index) {
                var opId = option.value;
                var optionPossible = !!filteredPossibleOptionsMap[opId] || filteredPossibleOptionsMap[opId] === 0;
                dataChangesBatch.push({path: ['options', listIndex, 'items', index, 'enabled'], value: optionPossible});
            });
        }
    };

    return ProductOptionsCalculator;
});
