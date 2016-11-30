'use strict';

import * as _ from 'lodash';
import * as siteMetadataAPI from 'documentServices/siteMetadata/siteMetadata';
import * as dataModel from 'documentServices/dataModel/dataModel';
import * as dataValidators from 'documentServices/dataModel/dataValidators';

/**
 * Enum for preloader possible properties
 * @enum {String} documentServices.mobile.preloader.options
 */
var PRELOADER_PROPS = {
    COMPANEY_NAME: 'companyName',
    LOGO_URL: 'logoUrl'
};

/**
 * Enum for quick actions possible properties
 * @enum {String} documentServices.mobile.actionBar.actions.options
 */
var QUICK_ACTIONS_PROPS = {
    NAVIGATION_MENU: {type: 'boolean', id: 'navigationMenu'},
    PHONE: {type: 'string', id: 'phone'},
    EMAIL: {type: 'string', id: 'email'},
    ADDRESS: {type: 'string', id: 'address'},
    SOCIAL_LINKS: {type: 'object', id: 'socialLinks'}
};


/**
 * Enum for quick actions possible properties
 * @enum {String} documentServices.mobile.actionBar.actions.socialLinksOptions
 */
var SOCIAL_LINKS_IDS = _.reduce(dataModel.getDataSchemaByType(undefined, 'SocialLinks'), function (obj, schema, socialLinkName) {
    obj[socialLinkName.toUpperCase()] = socialLinkName;
    return obj;
}, {});

/**
 * initializes the siteMetaData param with default values (mainly for old sites with missing siteMetaData)
 * @param {PrivateDocumentServices} privateServices
 */
function initialize(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    if (!siteMetaData) {
        siteMetaData = buildDefaultSiteMetaData(ps);
        siteMetadataAPI.setProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA, siteMetaData);
    }
}

function convertToSocialLinksDTO(socialLinks) {
    var socialLinksDto = [];
    _.forEach(socialLinks, function (value, key) {
        if (value) {
            socialLinksDto.push({
                'id': key,
                'url': value
            });
        }
    });
    return socialLinksDto;
}

function convertToSiteMetaDataDTO(quickActions, contactInfo, multipleStructureOffering, socialLinks) {
    var dtoSiteMetaData = {
        contactInfo: {
            address: contactInfo.address,
            companyName: contactInfo.companyName,
            email: contactInfo.email,
            fax: contactInfo.fax,
            phone: contactInfo.phone
        },
        adaptiveMobileOn: multipleStructureOffering.adaptiveMobileOn,
        preloader: {
            enabled: contactInfo.preloaderEnabled,
            uri: contactInfo.logoUrl
        },
        quickActions: {
            colorScheme: quickActions.colorScheme,
            configuration: {
                addressEnabled: quickActions.addressEnabled,
                emailEnabled: quickActions.emailEnabled,
                navigationMenuEnabled: quickActions.navigationMenuEnabled,
                phoneEnabled: quickActions.phoneEnabled,
                quickActionsMenuEnabled: quickActions.quickActionsMenuEnabled,
                socialLinksEnabled: quickActions.socialLinksEnabled
            },
            socialLinks: convertToSocialLinksDTO(socialLinks)
        }
    };
    return dtoSiteMetaData;
}

function buildDefaultSiteMetaData(ps: ps) {
    var quickActions = dataModel.createDataItemByType(ps, 'QuickActions');
    var contactInfo = dataModel.createDataItemByType(ps, 'ContactInformation');
    var multipleStructureOffering = dataModel.createDataItemByType(ps, 'MultipleStructureOffering');
    var socialLinks = {};
    _.forEach(SOCIAL_LINKS_IDS, function (id: any) {
        socialLinks[id] = '';
    });
    return convertToSiteMetaDataDTO(quickActions, contactInfo, multipleStructureOffering, socialLinks);
}

function setSocialLinks(ps: ps, newValueObject) {
    if (typeof newValueObject === 'object') {
        var currSocialLinks = convertToSocialLinksObject(ps);
        _.forEach(newValueObject, function (url, key) {
            if (typeof url === 'string') {
                if (currSocialLinks[key] !== undefined) {
                    currSocialLinks[key] = url;
                } else {
                    throw new Error('Social link "' + key + '" is not valid. Valid values are [' + _.values(SOCIAL_LINKS_IDS) + ']');
                }
            } else {
                throw new Error('Value "' + url + '" is not valid for type socialLinks with id "' + key + '"');
            }
        });

        var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
        siteMetaData.quickActions.socialLinks = convertToSocialLinksDTO(currSocialLinks);
        siteMetadataAPI.setProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA, siteMetaData);

    } else {
        throw new Error('Value "' + newValueObject + '" is not valid for type socialLinks');
    }
}

function setSiteMetaData(ps: ps, newValue, schemaName, schemaField, setFunc) {
    var stubItem = {};
    stubItem = dataValidators.resolveDefaultItem(schemaName, stubItem);
    stubItem[schemaField] = newValue;
    dataValidators.validateItem(stubItem, 'data', {schemaName: schemaName});
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    setFunc(siteMetaData, newValue);
    siteMetadataAPI.setProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA, siteMetaData);
}


function doesActionHaveEmptyValue(ps: ps, action) {
    var actions = <any> getActions(ps);
    return !actions[action] ||
        (action === 'socialLinks' && _.compact(_.values(actions.socialLinks)).length === 0);
}

function convertToSocialLinksObject(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    var socialLinksObj = {};
    _.forEach(SOCIAL_LINKS_IDS, function (id: any) {
        socialLinksObj[id] = '';
    });

    _.forEach(siteMetaData.quickActions.socialLinks, function (socialLink) {
        socialLinksObj[socialLink.id] = socialLink.url;
    });
    return socialLinksObj;
}


/*********************** PUBLIC FUNCTIONS ***************************/


function enableQuickActions(ps: ps, enabled) {
    var setFunc = function (siteMetaData, value) {
        siteMetaData.quickActions.configuration.quickActionsMenuEnabled = value;
    };
    setSiteMetaData(ps, enabled, 'QuickActions', 'quickActionsMenuEnabled', setFunc);
}


function isQuickActionsEnabled(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    return siteMetaData.quickActions.configuration.quickActionsMenuEnabled;
}


function setQuickActionsColorScheme(ps: ps, colorScheme) {
    var setFunc = function (siteMetaData, value) {
        siteMetaData.quickActions.colorScheme = value;
    };
    setSiteMetaData(ps, colorScheme, 'QuickActions', 'colorScheme', setFunc);
}

function enableActions(ps: ps, actionToIsEnabledMap) {
    //first validate
    _.forEach(actionToIsEnabledMap, function (enabled, action:any) {
        if (_.includes(_.map(<any> QUICK_ACTIONS_PROPS, 'id'), action)) {

            var actionType = (<any> _.find(<any> QUICK_ACTIONS_PROPS, {'id': action})).type;

            if (enabled && doesActionHaveEmptyValue(ps, action) && actionType !== 'boolean') {
                throw new Error('Action "' + action.id + '" has a missing value and thus cannot be enabled');
            }
        } else {
            throw new Error('Action "' + action.id + '" is not valid. Valid values are [' + _.pluck(<any> QUICK_ACTIONS_PROPS, 'id') + ']');
        }
    });

    //then change
    _.forEach(actionToIsEnabledMap, function (enabled, action) {
        var fieldName = action + 'Enabled';
        var setFunc = function (siteMetaData, value) {
            siteMetaData.quickActions.configuration[fieldName] = value;
        };
        setSiteMetaData(ps, enabled, 'QuickActions', fieldName, setFunc);
    });
}

function getQuickActionsColorScheme(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    return siteMetaData.quickActions.colorScheme;
}

function getQuickActionsEnabledMap(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    var result = {};
    _.forEach(QUICK_ACTIONS_PROPS, function (propName) {
        result[propName.id] = siteMetaData.quickActions.configuration[propName.id + 'Enabled'];
    });
    return result;
}


function updateActions(ps: ps, actionToValueMap) {
    var notBooleanActions = _(QUICK_ACTIONS_PROPS)
        .reject('type', 'boolean')
        .pluck('id')
        .value();

    _.forEach(actionToValueMap, function (value, action) {
        if (!_.includes(notBooleanActions, action)) {
            throw new Error('Action "' + action + '" is not valid. Valid values are [' + notBooleanActions + ']');
        }
    });

    _.forEach(actionToValueMap, function (value, action) {
        if (action === 'phone' || action === 'email' || action === 'address') {
            var setFunc = function (siteMetaData, val) {
                siteMetaData.contactInfo[action] = val;
            };
            setSiteMetaData(ps, value, 'ContactInformation', action, setFunc);

        } else if (action === 'socialLinks') {
            setSocialLinks(ps, value);
        }
    });
}


function getActions(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    var actionKeys = _(QUICK_ACTIONS_PROPS)
        .filter({type: 'string'})
        .pluck('id')
        .value();

    var actionValues = _.map(actionKeys, function (propName:any) {
        return siteMetaData.contactInfo[propName];
    });

    return _(actionKeys)
        .zipObject(actionValues)
        .assign({socialLinks: convertToSocialLinksObject(ps)})
        .value();
}


function enablePreloader(ps: ps, enabled) {
    var setFunc = function (siteMetaData, value) {
        siteMetaData.preloader.enabled = value;
    };
    setSiteMetaData(ps, enabled, 'ContactInformation', 'preloaderEnabled', setFunc);
}

function isPreloaderEnabled(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    return siteMetaData.preloader.enabled;
}

function setPreloaderProperties(ps: ps, propsToSet) {
    _.forEach(propsToSet, function (propertyValue, propertyName) {
        if (!_.includes(_.values(PRELOADER_PROPS), propertyName)) {
            throw new Error('Property "' + propertyName + '" is not valid. Valid values are [' + _.values(PRELOADER_PROPS) + ']');
        }
    });

    var setFunc;
    _.forEach(propsToSet, function (propertyValue, propertyName) {
        if (propertyName === PRELOADER_PROPS.COMPANEY_NAME) {
            setFunc = function (siteMetaData, value) {
                siteMetaData.contactInfo.companyName = value;
            };
            setSiteMetaData(ps, propertyValue, 'ContactInformation', 'companyName', setFunc);
        } else if (propertyName === PRELOADER_PROPS.LOGO_URL) {
            setFunc = function (siteMetaData, value) {
                siteMetaData.preloader.uri = value;
            };
            setSiteMetaData(ps, propertyValue, 'ContactInformation', 'logoUrl', setFunc);
        }
    });
}

function getPreloaderProperties(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    var props = {};
    props[PRELOADER_PROPS.COMPANEY_NAME] = siteMetaData.contactInfo.companyName;
    props[PRELOADER_PROPS.LOGO_URL] = siteMetaData.preloader.uri;
    return props;
}

function enableOptimizedView(ps: ps, enabled) {
    var setFunc = function (siteMetaData, value) {
        siteMetaData.adaptiveMobileOn = value;
    };
    setSiteMetaData(ps, enabled, 'MultipleStructureOffering', 'adaptiveMobileOn', setFunc);
}


function isMobileOptimizedViewOn(ps: ps) {
    var siteMetaData = siteMetadataAPI.getProperty(ps, siteMetadataAPI.PROPERTY_NAMES.SITE_META_DATA);
    //TODO - make sure server scheme passes this parameter (['editorModel', 'metaSiteData', 'adaptiveMobileOn'])
    return siteMetaData.adaptiveMobileOn;
}


var mobileSettings = {
    initialize: initialize,
    QUICK_ACTIONS_PROPS: QUICK_ACTIONS_PROPS,
    SOCIAL_LINKS_IDS: SOCIAL_LINKS_IDS,
    PRELOADER_PROPS: PRELOADER_PROPS,
    /**
     * Enables or disables the mobile optimized view based on enabled param that is passed.
     * when the optimized view is on you let the user see the optimized version of the website suitable for the device.
     * @member documentServices.mobile
     * @param {boolean} enabled - true - activate the optimize view , false - disables the optimize view
     */
    enableOptimizedView: enableOptimizedView,
    /**
     * Returns whether the mobile optimized view is enabled or not.
     * @member documentServices.mobile
     * @return {boolean} returns if the mobile optimized view is enabled or not.
     * @example
     * // returns true
     */
    isOptimized: isMobileOptimizedViewOn,
    /**
     * @class documentServices.mobile.actionBar
     */
    actionBar: {
        /**
         * enables or disables the mobile action bar based on enabled param.
         * when mobile action bar is enabled a layer appears on mobile sites that allows users to navigate the site more easily.
         * @param {boolean} enabled  true - show the quick actions bar , false - hides the quick actions bar
         */
        enable: enableQuickActions,
        /**
         * Returns whether the mobile action bar is enabled or not
         * @return {bool} returns if the mobile actions bar is enabled or not
         * @example
         * // returns true
         */
        isEnabled: isQuickActionsEnabled,
        /**
         * @class documentServices.mobile.actionBar.colorScheme
         */
        colorScheme: {
            /**
             * Sets the mobile action bar color scheme
             * @param {String} colorScheme possible values are 'light' or 'dark'
             */
            set: setQuickActionsColorScheme,
            /**
             * Returns the mobile action bar's color scheme
             * @return {string} string describing color schema (possible values 'light' or 'dark')
             * @example
             * // dark
             */
            get: getQuickActionsColorScheme
        },
        /**
         * @class documentServices.mobile.actionBar.actions
         */
        actions: {
            /**
             *  enable or disable specific functionalities of the mobile action bar.
             *  Possible to pass only the functionality we want to change.
             *  possible functionalities are ["navigationMenu", "phone", "email", "address", "socialLinks"]
             * @param {Object.<string, boolean>} actionToIsEnabledMap - a map of actions and their enabled state
             * @example {navigationMenu: true, phone: false, email: false, address: false, socialLinks: false}
             */
            enable: enableActions,
            /**
             * returns a map containing  all the functionalities of the mobile action bar and returns if each functionality is enabled or not.
             * @returns {Object.<string, boolean>} actionToIsEnabledMap - a map of actions and their enabled state
             * possible actions are ["navigationMenu", "phone", "email", "address", "socialLinks"]
             * @example
             * //returns {navigationMenu: true, phone: false, email: false, address: false, socialLinks: false}
             */
            getEnabled: getQuickActionsEnabledMap,
            /**
             * Updates the functionalities of the mobile action bar based on a map that is passed. the map will contain the functionality name and the value.
             * @param {Object.<string, (string|object)>} actionToValueMap  map of functionalities and their values. Possible actions are ["phone", "email", "address", "socialLinks"]
             * @example {phone: "05233333", email: "x@example.com", address: "example address", socialLinks:{blogger: "",facebook: "",flickr: "",google_plus: "",linkedin: "",pinterest: "",tumblr: "",twitter: "",vimeo: "",youtube: ""}}
             *
             */
            update: updateActions,
            /**
             * Gets all possible functionalities of the mobile action bar and their value
             * possible actions are ["phone", "email", "address", "socialLinks"]
             * @returns {Object.<string, (string|object)>} - a map of actions and their values
             *@example
             * //return  {phone: "", email: "x@example.com", address: "", socialLinks: Object}
             *
             */
            get: getActions,
            socialLinksOptions: SOCIAL_LINKS_IDS,
            options: QUICK_ACTIONS_PROPS
        }
    },
    /**
     * @class documentServices.mobile.preloader
     */
    preloader: {
        /**
         * Enables or disables mobile preloader based on the enabled param that is passed.
         * when the preloder is on when the site loads, users will see a simplified site version or your logo or company name (based on preloader properties)
         * @param {bool} true - enables the preloads, false- disables the preloader.
         */
        enable: enablePreloader,
        /**
         * Returns whether the mobile preloader is enabled or not.
         * @return {bool}
         * @example
         * //returns true
         */
        isEnabled: isPreloaderEnabled,
        /**
         * sets the mobile preloader properties. the functions receive and object with the properties we want to update.
         * Possible properties are: companyName, logoUrl
         * @example {companyName: "wix", logoUrl: "urlToLogo"}
         * @param {Object.<string, string>} propsToSet  object with the properies we want to update. object key is the propery we want to update (companyName/logo) and the value.
         */
        update: setPreloaderProperties,
        /**
         * Gœets the mobile preloader properties object. The preloder propery is and object that contains companyName and logoUtl
         * @returns {object} object containing preloader properties
         * //returns {companyName: "wix", logoUrl: "urlToLogo"}
         */
        get: getPreloaderProperties,
        options: PRELOADER_PROPS
    }
};

export = mobileSettings
