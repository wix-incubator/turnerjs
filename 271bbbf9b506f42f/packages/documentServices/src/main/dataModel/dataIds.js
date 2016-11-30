define(['utils'], function (utils) {
    'use strict';

    function generateItemIdWithPrefix(prefix) {
        return utils.guidUtils.getUniqueId(prefix, '-');
    }

    /**
     * Generates a new data Item ID.
     * usually the path to the page to add the data to.
     */
    function generateNewDataItemId() {
        return generateItemIdWithPrefix("dataItem");
    }

    /**
     * Generates a new property Item ID.
     * usually the path to the page to add the data to.
     */
    function generateNewPropertiesItemId() {
        return generateItemIdWithPrefix("propItem");
    }

    /**
     * return the function to generate a new id
     *
     * @param {string} idType (data || props || style)
     */
    function generateNewId(idType) {
        switch (idType){
            case 'data':
                return generateNewDataItemId();
            case 'props':
            case 'properties':
                return generateNewPropertiesItemId();
            case 'design':
                return generateNewDataItemId();
            case 'style':
                return generateItemIdWithPrefix("style");
            case 'behaviors':
                return generateItemIdWithPrefix("behavior");
            case 'connections':
                return generateItemIdWithPrefix("connection");
            default:
                return null;
        }
    }

    /**
     * Generates a new inner design ID.
     * used to compare two design data objects
     */
    function generateNewDesignId () {
        return generateItemIdWithPrefix('design');
    }

    return {
        generateNewId: generateNewId,
        generateNewDataItemId: generateNewDataItemId,
        generateNewPropertiesItemId: generateNewPropertiesItemId,
        generateNewDesignId: generateNewDesignId
    };

});