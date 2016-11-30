define(['lodash', 'wixappsCore', 'documentServices/dataModel/dataModel'], function (_, /** wixappsCore */ wixappsCore, dataModel) {
    'use strict';

    function convertLinkToWixappsData(wLink) {
        var rawData = {linkId: wLink.id};
        switch (wLink.type) {
            case "PageLink":
                _.assign(rawData, {
                    _type: 'wix:PageLink',
                    pageId: _.isPlainObject(wLink.pageId) ? wLink.pageId.id : wLink.pageId
                });
                break;
            case "DynamicPageLink":
                var anchorId = _.isPlainObject(wLink.anchorDataId) ? wLink.anchorDataId.id : wLink.anchorDataId;
                _.assign(rawData, {
                    _type: 'wix:DynamicPageLink',
                    routerId: wLink.routerId,
                    innerRoute: wLink.innerRoute,
                    anchorDataId: anchorId || ''
                });
                break;
            case "ExternalLink":
                var parseUrl = wLink.url.split('://');
                if (parseUrl.length === 1) {
                    parseUrl = ["http"].concat(parseUrl);
                }

                _.assign(rawData, {
                    _type: 'wix:ExternalLink',
                    target: wLink.target,
                    protocol: parseUrl[0],
                    address: parseUrl[1]
                });
                break;
            case "DocumentLink":
                _.assign(rawData, {
                    _type: 'wix:DocLink',
                    docId: wLink.docId,
                    docName: wLink.name
                });
                break;
            case "PhoneLink":
                _.assign(rawData, {
                    _type: 'wix:PhoneLink',
                    phoneNumber: wLink.phoneNumber
                });
                break;
            case "EmailLink":
                _.assign(rawData, {
                    _type: 'wix:MailLink',
                    email: wLink.recipient,
                    subject: wLink.subject
                });
                break;
            case "AnchorLink":
                _.assign(rawData, {
                    _type: 'wix:AnchorLink',
                    anchorName: wLink.anchorName,
                    anchorDataId: _.isPlainObject(wLink.anchorDataId) ? wLink.anchorDataId.id : wLink.anchorDataId,
                    pageId: _.isPlainObject(wLink.pageId) ? wLink.pageId.id : wLink.pageId
                });
                break;
        }
        return rawData;
    }

    return {
        convertWLinkToWixappsData: convertLinkToWixappsData,
        convertWixappsDataToWLink: function (ps, data) {
            return wixappsCore.linksConverter(data, function (dataItemId, pageId) {
                dataItemId = _.isString(dataItemId) && dataItemId.replace('#', '');
                pageId = _.isString(pageId) && pageId.replace('#', '');
                return dataModel.getDataItemById(ps, dataItemId, pageId);
            });
        }
    };
});
