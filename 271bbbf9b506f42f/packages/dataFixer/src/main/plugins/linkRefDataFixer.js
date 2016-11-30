define(['lodash', 'coreUtils'], function(_, coreUtils) {
    'use strict';

    /**
     * @exports utils/dataFixer/plugins/fiveGridLineLayoutFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            /***************************************************************************************************
             * This plugin is part of the link refactor (merged experiment: linkrefdata).                             *
             * It does 3 things:                                                                               *
             * 1. Convert link data items to new ones (with new schemas)                                       *
             * 2. Covert FlashComponent & SiteButton to new schemas (with new links like #1)                   *
             * 3. Fixes Image schema to support the new links and updates schema version (for server support)  *
             ***************************************************************************************************/


            //Handle cases that the DataFixer is running but the DataManager is not available yet.
            //This DataFixer plugin will be called again when the data DataManager is ready
            //(skipped JSONs will be fixed later)
//                if(!window.W.Data) {
//                    return pageJson;
//                }

            var schemasNames = {
                    toFix: ['FlashComponent', 'SiteButton', 'Image'],
                    newNames: ['LinkableFlashComponent', 'LinkableButton', 'Image'],  //Image keeps the schema name and updates the schema version
                    originalLink: ['TextLink', 'Link']
                },
                linkDataAttributes = ['href', 'text', 'target', 'icon', 'linkType'],
                linkTargets = {
                    oldValues: ['same', 'other'],
                    newValues: ['_self', '_blank']
                };

            var filterSchemasToFix = function (items) {
                return _.filter(items, function (dataItem) {
                    var isImage = dataItem.type === schemasNames.toFix[2];
                    var isOldImageSchema = !isImage || dataItem.metaData.schemaVersion !== '2.0';

                    return !dataItem.link && _.includes(schemasNames.toFix, dataItem.type) && isOldImageSchema;
                }, this);
            };

            var filterLinkItemsToFix = function (items) {
                return _.filter(items, function (dataItem) {
                    return (dataItem.linkType && _.includes(schemasNames.originalLink, dataItem.type));
                }, this);
            };

            var createItemFromNewSchema = function (dataItem) {
                var schemaIndex = _.indexOf(schemasNames.toFix, dataItem.type);
                var newSchemaName = schemasNames.newNames[schemaIndex];
                //Copy schema specific attributes from original data item (without old link attributes)
                var newDataItem = _.defaults({type: newSchemaName}, _.omit(dataItem, linkDataAttributes));

                //Create a new link data item and add reference to it in the new data item
                var linkItem = createNewLinkItem(dataItem, true);
                if (linkItem) {
                    newDataItem.link = createLinkRef(linkItem.id);
                    newLinkDataItems[linkItem.id] = linkItem;  //Save it to be added later to DataManager
                }

                //If the schema name wasn't changes (Image) - update the schema version
                if (dataItem.type === newDataItem.type) {
                    newDataItem.metaData.schemaVersion = '2.0';
                }

                return newDataItem;
            };

            var createNewLinkItem = function (dataItem, shouldGetUniqueId) {
                var linkType = dataItem.linkType || '';
                var lowerCaseLinkType = linkType.toLowerCase();
                var id = (shouldGetUniqueId) ? createUniqueId() : dataItem.id;

                switch (lowerCaseLinkType) {
                    case "page":
                        return createPageLink(id, dataItem);
                    case "website":
                        return createExternalLink(id, dataItem);
                    case "email":
                        return createEmailLink(id, dataItem);
                    case "document":
                        return createDocumentLink(id, dataItem);
                    case "login":
                        return createLoginToWixLink(id, dataItem);
                    case "admin_login":
                        return null;  //This link type is deprecated. AdminLoginButton component doesn't use it anymore
                    case "free_link":
                        return null;  //Nothing to do with this link (used by eCom, wixapps handles them)
                    case "":
                        return null;  //Nothing to do (there is no link)
                    default:
                        return null;
                }
            };

            var createExternalLink = function (uniqueLinkId, dataItem) {
                var linkItem = {};
                linkItem.id = uniqueLinkId;
                linkItem.type = "ExternalLink";
                linkItem.target = getLinkTarget(dataItem.target);
                var url = dataItem.href;
                if (!url) {
                    return null;
                }
                linkItem.url = url;
                return linkItem;
            };

            var createPageLink = function (uniqueLinkId, dataItem) {
                var linkItem = {};
                linkItem.id = uniqueLinkId;
                linkItem.type = "PageLink";
                var url = dataItem.href;
                if (!url) {
                    return null;
                }
                var indexOfPageId = url.lastIndexOf("/");
                if (indexOfPageId < 0) {
                    indexOfPageId = url.lastIndexOf("|");  //Legacy sites
                }
                url = url.substr(indexOfPageId + 1);
                linkItem.pageId = createLinkRef(url);
                return linkItem;
            };

            var createDocumentLink = function (uniqueLinkId, dataItem) {
                var linkItem = {};
                var docId;
                var queryParamStartIndex;
                linkItem.type = "DocumentLink";
                linkItem.id = uniqueLinkId;
                var docURL = dataItem.href;
                if (!docURL) {
                    return null;
                }
                docId = docURL.substr(docURL.lastIndexOf("/") + 1);

                queryParamStartIndex = docId.indexOf('?dn=');
                if (queryParamStartIndex !== -1) {
                    docId = docId.substring(0, queryParamStartIndex);
                }
                linkItem.docId = docId;

                linkItem.name = dataItem.text;
                return linkItem;
            };

            var createEmailLink = function (uniqueLinkId, dataItem) {
                var linkItem = {};
                linkItem.id = uniqueLinkId;
                linkItem.type = "EmailLink";
                var url = dataItem.href;
                if (!url || !url.toLowerCase) {
                    return null;
                }
                if (coreUtils.stringUtils.startsWith(url, "mailto:", true)) {
                    url = url.substr("mailto:".length);
                }
                var emailAndParams = url.split("?");
                linkItem.recipient = emailAndParams[0];
                if (emailAndParams[1]) {
                    var params = parseUrlParams(emailAndParams[1]);
                    if (params.subject) {
                        linkItem.subject = params.subject;
                    }
                    if (params.body) {
                        linkItem.body = params.body;
                    }
                }

                return linkItem;
            };

            var createLoginToWixLink = function (uniqueLinkId, dataItem) {
                var linkItem = {};
                linkItem.id = uniqueLinkId;
                linkItem.type = "LoginToWixLink";

                var loginParams = dataItem.text;
                if (loginParams && coreUtils.stringUtils.startsWith(loginParams, '{')) {
                    loginParams = JSON.parse(loginParams);
                    linkItem.postLoginUrl = loginParams.postLoginUrl;
                    linkItem.postSignupUrl = loginParams.postSignupUrl;
                    linkItem.dialog = loginParams.type;
                }

                return linkItem;
            };

            var createLinkRef = function (linkId) {
                if (!linkId) {
                    return null;
                }
                if (linkId && coreUtils.stringUtils.startsWith(linkId, "#")) {
                    return linkId;
                }
                return "#" + linkId;
            };

            var getLinkTarget = function (oldTarget) {
                var newTarget;
                var oldTargetsIndex = _.indexOf(linkTargets.oldValues, oldTarget);

                if (_.includes(linkTargets.newValues, oldTarget)) {
                    newTarget = oldTarget;
                } else if (oldTargetsIndex !== -1) {
                    newTarget = linkTargets.newValues[oldTargetsIndex];  //The the corresponding new target value
                } else {
                    newTarget = linkTargets.newValues[1];  //fallback - _blank target
                }

                return newTarget;
            };

            var parseUrlParams = function (paramsStr) {
                var mailParamsObj = {},
                    keyValueRegEx = /([^&=]+)=([^&]*)/g,
                    tmp;

                //Extract all key-value pairs (format: key=value) from the mail parameters string
                while (tmp = keyValueRegEx.exec(paramsStr)) { // eslint-disable-line no-cond-assign
                    mailParamsObj[tmp[1]] = tmp[2];
                }

                return mailParamsObj;
            };

            var createUniqueId = function () {
                var existingIds = _.keys(pageJson.data.document_data);
                var id;

                do {
                    id = (new Date()).getTime().toString(36) + "_" + Math.round(Math.random() * 99999).toString(36);
                    id = id.replace(/\s/g, "_");
                } while (existingIds[id]) ;

                return id;
            };

// commented out by Eitan 30/07 - this function doesn't do anything
//                var markDataItemAsDirty = function (id) {
//                    var idWithoutHash = id;
//                    if (coreUtils.stringUtils.startsWith(id, '#')) {
//                        idWithoutHash = id.substr(1);
//                    }
//                };

            var data = pageJson.data;
            var dataItems = data.document_data;
            var newLinkDataItems = {};
            var dataItemsToFix;

            //Fix (convert) schemas to 'linkable' schemas
            dataItemsToFix = filterSchemasToFix(dataItems);
            _.forEach(dataItemsToFix, function (dataItem) {
                var newDataItem = createItemFromNewSchema(dataItem);
                if (newDataItem) {
                    dataItems[dataItem.id] = newDataItem;  //Override the existing data item with the new one (same ID)
//                        markDataItemAsDirty(dataItem.id);
                }
            }, this);

            //Fix (convert) links data items (create new link data items with same id and replace the original)
            dataItemsToFix = filterLinkItemsToFix(dataItems);
            _.forEach(dataItemsToFix, function (dataItem) {
                var newLinkDataItem = createNewLinkItem(dataItem);
                if (newLinkDataItem) {
                    dataItems[dataItem.id] = newLinkDataItem;

                    //Don't mark the converted links as dirty because they are not referenced and will be deleted
                    //by the server GC in the next save.
                }
            }, this);

            //NOTE: when we start to work with 'dirty' data items, we should probably mark the newLinkDataItems as dirty later, so that they will be saved in the document data
            _.assign(dataItems, newLinkDataItems);
        }
    };

    return exports;
});
