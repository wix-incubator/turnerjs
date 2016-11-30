'use strict';

var _template = require('lodash/string/template');

var anchorLinkBaseTemplate = _template('/<%=linkObject.pageId%>#<%=linkObject.anchorDataId%>', { variable: 'linkObject' });
var pageLinkBaseTemplate = _template('/<%=linkObject.pageId%>', { variable: 'linkObject' });

var LINK_URL_TEMPLATES = {
  PageLink: getPageLinkTemplate,
  DocumentLink: _template('document://<%=linkObject.docId%>', { variable: 'linkObject' }),
  PhoneLink: _template('tel:<%=linkObject.phoneNumber%>', { variable: 'linkObject' }),
  EmailLink: _template('mailto:<%=linkObject.recipient%>?subject=<%=linkObject.subject%>', { variable: 'linkObject' }),
  ExternalLink: _template('<%=linkObject.url%>', { variable: 'linkObject' }),
  DynamicPageLink: getDynamicPageLinkTemplate,
  AnchorLink: getAnchorLinkTemplate
};

function getAnchorName(anchorDataId) {
  var knownAnchorNames = {
    SCROLL_TO_TOP: 'top',
    SCROLL_TO_BOTTOM: 'bottom'
  };
  return knownAnchorNames[anchorDataId] || anchorDataId;
}

function getDynamicPagePrefix(routersMap, linkObject) {
  var routerConfig = routersMap[linkObject.routerId];
  return routerConfig && routerConfig.prefix;
}

function getDynamicPageLinkTemplate(linkObject, routersMap) {
  var customLinkObject = {
    pageId: getDynamicPagePrefix(routersMap, linkObject) + '/' + linkObject.innerRoute,
    anchorDataId: getAnchorName(linkObject.anchorDataId)
  };
  return customLinkObject.anchorDataId ? anchorLinkBaseTemplate(customLinkObject) : LINK_URL_TEMPLATES.PageLink(customLinkObject); //eslint-disable-line new-cap
}

function getPageLinkTemplate(linkObject) {
  return pageLinkBaseTemplate({
    pageId: linkObject.pageId.replace('#', '')
  });
}

function getAnchorLinkTemplate(linkObject) {
  return anchorLinkBaseTemplate({
    pageId: linkObject.pageId.replace('#', ''),
    anchorDataId: getAnchorName(linkObject.anchorDataId)
  });
}

function convertLinkObjectToUrl(routersMap, linkObject) {
  if (!linkObject || !LINK_URL_TEMPLATES[linkObject.type]) {
    throw new Error('Provided link type is not supported');
  }
  var template = LINK_URL_TEMPLATES[linkObject.type];
  return template(linkObject, routersMap);
}

module.exports = {
  convertLinkObjectToUrl: convertLinkObjectToUrl
};
