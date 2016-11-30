define([
        "lodash",
        "utils",
        'wixappsCore/util/richTextDefaultStyles',
        'wixappsCore/util/styleMapping',
        "fonts",
        "experiment"
    ],
    function (_, /** utils */ utils, richTextDefaultStyles, styleMapping, fonts, experiment) {
        'use strict';

        function cleanLinkTags(data) {
            // removes all <a></a> tags
            return data.replace(/<a\b[^>]*>(.*?)<\/a>/ig, "$1");
        }

        function getStyle(styleName) {
            return styleMapping.styleToFontClass(styleName);
        }

        function renderAttributes(attributes) {
            var ret = _.map(attributes, function (attr) {
                if (_.includes(attr.value, '"')) {
                    return attr.name + "='" + attr.value + "'";
                }
                return attr.name + '="' + attr.value + '"';
            }).join(" ");

            return ret.length ? " " + ret : ret;
        }

        function getOpening(tags) {
            return _.map(tags, function (tag) {
                return "<" + tag.name + renderAttributes(tag.attributes) + ">";
            }).join("");
        }

        function getClosing(tags) {
            return _.map(tags, function (tag) {
                return "</" + tag.name + ">";
            }).reverse().join("");
        }

        function mergeElements(ret) {
            return _(ret)
                .groupBy('name')
                .map(function (elements, elementName) {
                    var attributes = _(elements)
                        .pluck('attributes')
                        .flattenDeep()
                        .compact()
                        .groupBy('name')
                        .map(function (value, attribute) {
                            return {
                                name: attribute,
                                value: _.pluck(value, 'value').join(' ')
                            };
                        }).value();
                    return {
                        name: elementName,
                        attributes: attributes
                    };
                }).value();
        }

        function translateHatul(defaultTagName, attributes, getCompProp, additionalHatulStyle) {
            var attrObj = _.reduce(attributes, function (result, attr) {
                result[attr.name] = attr.value;
                return result;
            }, {});

            attrObj.class = getStyle(getCompProp('style') || 'Body M');
            if (getCompProp('singleLine')) {
                attrObj.class += " singleLine";
            }

            if (experiment.isOpen('sv_fixColorOfHatulOnHover')) {
                var color = getCompProp('color');
                if (color) {
                    if (_.first(color) !== '#') {
                        attrObj.class += ' ' + color;
                    } else {
                        attrObj.style = attrObj.style || '';
                        attrObj.style = 'color:' + color + ';' + attrObj.style;
                    }
                }
            }

            var viewDefLineHeight = getCompProp("line-height");
            if (viewDefLineHeight) {
                attrObj.style = attrObj.style || "";
                if (!/line-height:/.test(attrObj.style)) {
                    attrObj.style = "line-height:" + viewDefLineHeight + "em;" + attrObj.style;
                }
            }

            var fontFamily = getCompProp("fontFamily");
            if (fontFamily) {
                attrObj.style = attrObj.style || "";
                if (!/font-family:/.test(attrObj.style)) {
                    attrObj.style = "font-family:" + fonts.fontUtils.getFontFamilyWithFallbacks(fontFamily) + ";" + attrObj.style;
                }
            }

            var fontSize = getCompProp("fontSize");
            if (fontSize) {
                attrObj.style = attrObj.style || "";
                if (!/font-size:/.test(attrObj.style)) {
                    attrObj.style = "font-size:" + fontSize + "px;" + attrObj.style;
                }
            }

            if (additionalHatulStyle) {
                attrObj.style = attrObj.style || "";
                attrObj.style = additionalHatulStyle + ';' + attrObj.style;
            }

            var ret = [
                {
                    name: defaultTagName || "p",
                    attributes: _.reduce(attrObj, function (result, value, key) {
                        result.push({name: key, value: value});
                        return result;
                    }, [])
                }
            ];

            var properties = ['color', 'backgroundColor', 'bold', 'italic', 'lineThrough', 'underline'];

            if (experiment.isOpen('sv_fixColorOfHatulOnHover')) {
                properties = _.pull(properties, 'color');
            }

            _.forEach(properties, function (compProp) {
                var compPropValue = getCompProp(compProp);
                if (!_.isUndefined(compPropValue) && !_.isNull(compPropValue)) {
                    ret.push(richTextDefaultStyles[compProp](compPropValue));
                }
            });

            return mergeElements(ret);
        }

        function shouldMigrate(data) {
            return data._type === "wix:RichText" && _.get(data, 'version', 0) < 2;
        }

        function shouldIgnoreHatulTags(data, partVersion) {
            return data._type === "wix:RichText" && partVersion === '2.0' && _.get(data, 'version', 0) >= 2;
        }

        function migrateText(text) {
            var stack = [];
            var output = [];
            utils.htmlParser(text, {
                start: function (tagName, attributes, isSingleton) {
                    var tags = [
                        {
                            name: (!isSingleton && stack.length === 0) ? "hatul" : tagName,
                            attributes: attributes
                        }
                    ];
                    if (!isSingleton) {
                        stack.push(getClosing(tags));
                    }
                    output.push(getOpening(tags));
                },
                end: function () {
                    output.push(stack.pop());
                },
                chars: function (txt) {
                    if (stack.length === 0) {
                        output.push("<hatul>");
                        output.push(txt);
                        output.push("</hatul>");
                    } else {
                        output.push(txt);
                    }
                }
            });

            return output.join("");
        }

        function getDataWithDefaultStyleForRichText(getCompProp, data, defaultElementTag, partVersion, additionalHatulStyle) {
            return getDataWithDefaultStyle(getCompProp, data.text, defaultElementTag, shouldMigrate(data), shouldIgnoreHatulTags(data, partVersion), additionalHatulStyle);
        }

        function getDataWithDefaultStyleForString(getCompProp, data, defaultElementTag) {
            return getDataWithDefaultStyle(getCompProp, data, defaultElementTag, false, false);
        }

        function getDataWithDefaultStyle(getCompProp, rawText, defaultElementTag, shouldMig, ignoreHatulTags, additionalHatulStyle) {
            var text = getCompProp('disableLinks') ? cleanLinkTags(rawText) : rawText;
            var migratedText = shouldMig ? migrateText(text) : text;

            var isSingleLine = getCompProp("singleLine");
            var stopCollecting = false;
            var stack = [];
            var output = [];
            var hasRealText = false;
            utils.htmlParser(migratedText, {
                start: function (tagName, attributes, isSingleton) {
                    if (stopCollecting) {
                        return;
                    }
                    if (isSingleLine && (tagName === "img" || tagName === "br")) {
                        return;
                    }
                    var isRootElement = stack.length === 0;
                    var tags;
                    if (tagName === "hatul") {
                        if (!isRootElement && ignoreHatulTags) {
                            tags = [{
                                name: 'span',
                                attributes: []
                            }];
                        } else {
                            tags = translateHatul(defaultElementTag, attributes, getCompProp, additionalHatulStyle);
                        }
                    } else {
                        tags = [{
                            name: tagName,
                            attributes: attributes
                        }];
                    }
                    if (!isSingleton) {
                        stack.push(getClosing(tags));
                    }
                    output.push(getOpening(tags));
                },
                end: function () {
                    if (stopCollecting) {
                        return;
                    }
                    output.push(stack.pop());
                    if (stack.length === 0 && isSingleLine) {
                        if (!hasRealText) {
                            output = [];
                        } else {
                            stopCollecting = true;
                        }
                    }
                },
                chars: function (txt) {
                    if (stopCollecting) {
                        return;
                    }
                    if (stack.length === 0 && /^\s+$/.test(txt)) {
                        return;
                    }
                    hasRealText = hasRealText || !(/^(&nbsp;)+$/.test(txt));
                    output.push(txt);
                }
            });

            return output.join("");
        }

        return {
            getDataWithDefaultStyleForRichText: getDataWithDefaultStyleForRichText,
            getDataWithDefaultStyle: getDataWithDefaultStyle,
            getDataWithDefaultStyleForString: getDataWithDefaultStyleForString
        };
    }
);
