define(["lodash", "utils"], function (_, /** utils */utils) {
    'use strict';

    var pageLinkPrefix = '#!';
    var externalHrefRegExp = /(:\/\/)|(^\/\/)/;

    var linksConvertMap = {
        'wix:Link': convertWixLink,
        'wix:DynamicPageLink': convertDynamicPageLink,
        'wix:PageLink': convertPageLink,
        'wix:ExternalLink': convertExternalLink,
        'wix:MailLink': convertEmailLink,
        'wix:PhoneLink': convertPhoneLink,
        'wix:DocLink': convertDocumentLink,
        'wix:AnchorLink': convertAnchorLink
    };

    /**
     * Converts wix:AnchorLink to AnchorLink object.
     * @param {wixAnchorLink} linkData
     * @param {function(string, string)} getDataById A function that return the data according to the dataId, pageId params.
     * @returns {{type: string, anchorName: string, anchorDataId: string, pageId: string}}
     */
    function convertAnchorLink(linkData, getDataById) {
        var pageId = (_.includes(['#masterPage', 'masterPage'], linkData.pageId) ? 'masterPage' : linkData.pageId) || '';
        var anchorData = getDataById(linkData.anchorDataId, pageId.replace('#', ''));
        return {
            type: 'AnchorLink',
            anchorName: linkData.anchorName,
            anchorDataId: _.isEmpty(anchorData) ? linkData.anchorDataId : anchorData,
            pageId: getDataById(linkData.pageId, 'masterPage')
        };
    }

    /**
     * Converts wix:DocLink to DocumentLink object.
     * @param {wixDocLink} linkData
     * @returns {{type: string, docId: string, name: string}}
     */
    function convertDocumentLink(linkData) {
        return {
            type: 'DocumentLink',
            docId: linkData.docId,
            name: linkData.docName
        };
    }

    /**
     * Converts wix:ExternalLink to ExternalLink object.
     * @param {wixExternalLink} linkData
     * @returns {{type: string, url: string, target: string?}}
     */
    function convertExternalLink(linkData) {
        return {
            type: "ExternalLink",
            url: linkData.protocol ? linkData.protocol + "://" + linkData.address : linkData.address,
            target: linkData.target
        };
    }

    /**
     * Converts wix:PageLink to PageLink object.
     * @param {wixPageLink} linkData
     * @param {function(string, string)} getDataById A function that return the data according to the dataId, pageId params.
     * @returns {{type: string, pageId: string}}
     */
    function convertPageLink(linkData, getDataById) {
        return {
            type: 'PageLink',
            pageId: getDataById(linkData.pageId, 'masterPage')
        };
    }

    function convertDynamicPageLink(linkData) {
        return {
            type: 'DynamicPageLink',
            routerId: linkData.routerId,
            innerRoute: linkData.innerRoute,
            anchorDataId: linkData.anchorDataId
        };
    }

    /**
     * Converts wix:PhoneLink to PhoneLink object.
     * @param {wixPhoneLink} linkData
     * @returns {{type: string, phoneNumber: string}}
     */
    function convertPhoneLink(linkData) {
        return {
            type: 'PhoneLink',
            phoneNumber: linkData.phoneNumber
        };
    }

    /**
     * Converts wix:MailLink to EmailLink object.
     * @param {wixMailLink} linkData
     * @returns {{type: string, recipient: string, subject: string?}}
     */
    function convertEmailLink(linkData) {
        return {
            type: 'EmailLink',
            recipient: linkData.email,
            subject: linkData.subject
        };
    }

    /**
     * Converts wix:Link to ExternalLink, PageLink or EmailLink
     * @param {wixLink} linkData
     * @param {function(string, string)} getDataById A function that return the data according to the dataId, pageId params.
     * @returns {{type: string, recipient: string, subject: string?}|{type: string, pageId: string}|{type: string, url: string, target: string?}}
     */
    function convertWixLink(linkData, getDataById) {
        var href = linkData.href;
        if (linkData.linkType === "WEBSITE" || externalHrefRegExp.test(href)) {
            var wixExternalLinkData = {
                address: href
            };

            return convertExternalLink(wixExternalLinkData);
        }

        if (utils.stringUtils.startsWith(href, pageLinkPrefix)) {
            return convertPageLink({pageId: href.substr(2)}, getDataById);
        }

        if (utils.stringUtils.startsWith(href, 'mailto:')) {
            var split = href.split('?');
            var subject = '';
            if (split.length > 1) {
                var params = utils.urlUtils.parseUrlParams(split[1]);
                subject = params.subject || '';
            }

            var emailLink = {
                subject: subject,
                email: split[0].substr(7) // Cut the mailto: from the string
            };

            return convertEmailLink(emailLink);
        }
    }

    /**
     * Converts the link from wixapps link objects to wix link objects.
     * @param {wixLink|wixAnchorLink|wixDocLink|wixPageLink|wixExternalLink|wixMailLink} data
     * @param {function(string, string)} getDataById A function that return the data according to the dataId, pageId params.
     * @returns {*} The wix object that is equal to the wixapps data object.
     */
    function convertLink(data, getDataById) {
        if (!data) {
            return null;
        }
        var convertFunc = linksConvertMap[data._type];

        return convertFunc && _.assign(convertFunc(data, getDataById), {id: data.linkId});
    }

    /**
     * @class wixappsCore.linksConverter
     */
    return convertLink;
});

/**
 * @typedef {object} wixAnchorLink
 * @property {string} anchorName
 * @property {string} anchorDataId
 * @property {string} pageId
 */

/**
 * @typedef {object} wixDocLink
 * @property {string} docId
 * @property {string} docName
 */

/**
 * @typedef {object} wixExternalLink
 * @property {string} address
 * @property {?string} protocol
 * @property {?string} target
 */

/**
 * @typedef {object} wixPageLink
 * @property {string} pageId
 */

/**
 * @typedef {object} wixMailLink
 * @property {string} email
 * @property {?string} subject
 */

/**
 * @typedef {object} wixLink
 * @property {?string} linkType
 * @property {string} href
 */
