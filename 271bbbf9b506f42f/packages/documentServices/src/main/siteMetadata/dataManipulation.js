define(['lodash', 'documentServices/pathHelpers/siteMetadataPropertiesInfo', 'utils'], function(_, siteMetadataPropertiesInfo, utils) {
    'use strict';

    var PROPERTY_INFO = siteMetadataPropertiesInfo;
    // the paths are NOT exposed to the consumer
    var PROPERTY_NAMES = _.mapValues(PROPERTY_INFO, function(info, prop) { return prop;});

    function getRevertibleMetaDataInfo() {
        return _.filter(PROPERTY_INFO, {revertible: true});
    }

    function getNonRevertibleMetaDataInfo() {
        return _.filter(PROPERTY_INFO, {revertible: false});
    }

    /**
     * get a siteMetaData param value
     * @param privateServices
     * @param {PROPERTY_NAMES} param one of the keys in the PROPERTY_NAMES exported enum
     * @return {*} the value of that param from the data
     */
    function getProperty(privateServices, param) {
        var pointer = privateServices.pointers.metadata.getSiteMetaDataPointer(param);
        if (!pointer) {
            utils.log.error('SiteMetaData getProperty was called with an invalid metadata property');
            return null;
        }
        return privateServices.dal.get(pointer);
    }

    /**
     * set a site metadata parameter
     * @param privateServices
     * @param {PROPERTY_NAMES} param a key from the exported PROPERTY_NAMES enum
     * @param value the value to be set for the parameter
     */
    function setProperty(privateServices, param, value) {
        var pointer = privateServices.pointers.metadata.getSiteMetaDataPointer(param);
        if (!pointer) {
            utils.log.error('SiteMetaData setProperty was called with an invalid metadata property');
            return;
        }
        privateServices.dal.set(pointer, value);
    }

    return {
        getRevertibleMetaDataInfo: getRevertibleMetaDataInfo,
        getNonRevertibleMetaDataInfo: getNonRevertibleMetaDataInfo,
        getProperty: getProperty,
        setProperty: setProperty,
        PROPERTY_NAMES: PROPERTY_NAMES
    };
});
