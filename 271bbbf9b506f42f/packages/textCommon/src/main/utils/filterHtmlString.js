define(['lodash', 'xss', 'experiment', 'textCommon/bi/events'], function (_, xss, experiment, biEvents) {
    'use strict';

    // this ugly thing is only to pass jasmine:units, since requireJs shim is not supported in node
    if (!xss) {
        return _.identity;
    }

    var allowedAdditionalAttributes = ['style', 'class', 'dir', 'wix-comp'];

    var iframeTag = {
        iframe: ['frameborder', 'height', 'width', 'src', 'marginheight', 'marginwidth', 'name', 'scrolling', 'longdesc'].concat(allowedAdditionalAttributes)
    };


    function configureWhiteLists() {

        var additionalSecureTags = {
            strike: [],
            hatul: []
        };
        var cssPropsWhiteList = [
            'color',
            'background-color',
            'font-size',
            'font-family',
            'font-style',
            'text-decoration',
            'line-height',
            'text-shadow',
            'direction'
        ];

        _.assign(xss.whiteList, additionalSecureTags);

        xss.whiteList.a.push('data-anchor');
        xss.whiteList.a.push('dataquery');

        _.forOwn(xss.whiteList, function enableStyleAndClass(tag) {
            tag.push.apply(tag, allowedAdditionalAttributes);
        });


        _.forEach(cssPropsWhiteList, function enableCssProp(cssProp) {
            xss.cssFilter.options.whiteList[cssProp] = true;
        });
    }


    configureWhiteLists();

    function getSafeAttrValue(tag, name, value, cssFilter) {
        return xss.safeAttrValue(tag, name, value, cssFilter);
    }

    function addItemToArrayDistinct(filteredArray, filteredItem) {
        var uniqueItem = _.find(filteredArray, filteredItem);
        if (uniqueItem) {
            uniqueItem.count++;
        } else {
            filteredArray.push(_.assign(filteredItem, {count: 1}));
        }
    }

    function shouldIgnoreAddToFiltered(attr, value) {
        return attr.toLowerCase() === 'style' && value === '';
    }

    function sendBiOfFilteredContent(filteredContent, compId, compName, reportBI) {
        reportBI(biEvents.UNSAFE_HTML_IN_TEXT_COMPONENT, {
            filtered_content: JSON.stringify(filteredContent),
            component_id: compId,
            component_type: compName
        });
    }

    function hasFilteredContent(filteredContent) {
        return _.some(_.values(filteredContent), _.size);
    }

    return function filterHtmlString(componentHtml, allowIframes, compName, compId, reportBI) {
        var filteredContent = {
            tags: [],
            attrs: [],
            attrValues: []
        };

        if (allowIframes) {
            _.assign(xss.whiteList, iframeTag);
        } else {
            //Since filterHtmlString is a singleton, we need to make sure that iframe is not in the whitelist when it shouldn't
            delete xss.whiteList.iframe;
        }

        var safeHtmlString = xss(componentHtml, {
            stripIgnoreTagBody: true,
            /**
             * once sv_textCompFilter is merged this snippet should be deleted
             */
            onTag: function(tag, html, options) {
                if (!options.isWhite && !options.isClosing) {
                    var filteredItem = {tagName: tag};
                    addItemToArrayDistinct(filteredContent.tags, filteredItem);
                }
            },
            onIgnoreTag: function onUnsafeTag(tag) {
                var filteredItem = {tagName: tag};
                addItemToArrayDistinct(filteredContent.tags, filteredItem);
            },
            onIgnoreTagAttr: function onUnsafeTagAttr(tag, name) {
                var filteredItem = {tagName: tag, attrName: name};
                addItemToArrayDistinct(filteredContent.attrs, filteredItem);
            },
            /**
             * sv_textCompFilter Until here
             */
            safeAttrValue: function onAttrValue(tag, name, value, cssFilter) {
                var safeAttrValue = getSafeAttrValue(tag, name, value, cssFilter);
                if (safeAttrValue) {
                    return safeAttrValue;
                } else if (!shouldIgnoreAddToFiltered(name, value)) {
                    var filteredItem = {tagName: tag, attrName: name, attrValue: value};
                    addItemToArrayDistinct(filteredContent.attrValues, filteredItem);
                }
                return '';
            }
        });

        if (experiment.isOpen('sv_textCompFilter') && hasFilteredContent(filteredContent)) {
            sendBiOfFilteredContent(filteredContent, compId, compName, reportBI);
        }

        if (experiment.isOpen('sv_safeHtmlString')) {
            return safeHtmlString;
        }

        return componentHtml;
    };
});
