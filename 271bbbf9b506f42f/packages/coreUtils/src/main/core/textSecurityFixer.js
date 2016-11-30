define(['lodash', 'coreUtils/core/htmlTransformer'], function (_, htmlTransformer) {
    'use strict';

    var IMAGE_WHITE_LIST_ATTRIBUTES = ["src", "style", "wix-comp"];
    var FORBIDDEN_TAGS = ["script", "iframe", "embed", "object", "meta"];
    var SENSITIVE_ATTRIBUTES = ["href", "src", "style"];
    var FORBIDDEN_TAGS_AND_ATTRIBUTES = ["script", "iframe", "embed", "object", "meta", "expression", "id", "comp", "dataquery", "propertyquery", "styleid", "skin",
        "skinpart", "y", "x", "scale", "angle", "idprefix", "state", "container", "listposition", "hasproxy", "vcfield", "vcview", "vctype", "pos", "onabort",
        "onactivate", "onafterprint", "onafterupdate", "onbeforeactivate", "onbeforecopy", "onbeforecut", "onbeforedeactivate", "onbeforeeditfocus",
        "onbeforepaste", "onbeforeprint", "onbeforeunload", "onbeforeupdate", "onbegin", "onblur", "onbounce", "oncellchange", "onchange", "onclick",
        "oncontextmenu", "oncontrolselect", "oncopy", "oncut", "ondataavailable", "ondatasetchanged", "ondatasetcomplete", "ondblclick", "ondeactivate",
        "ondrag", "ondragend", "ondragleave", "ondragenter", "ondragover", "ondragdrop", "ondragstart", "ondrop", "onend", "onerror",
        "onerrorupdate", "onfilterchange", "onfinish", "onfocus", "onfocusIn", "onfocusout", "onhashchange", "onhelp", "oninput", "onkeydown",
        "onkeypress", "onkeyup", "onlayoutcomplete", "onload", "onlosecapture", "onmediacomplete", "onmediaerror", "onmessage", "onmousedown",
        "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onmove", "onmoveend",
        "onmovestart", "onoffline", "ononline", "onoutofsync", "onpaste", "onpause", "onpopstate", "onprogress", "onpropertychange",
        "onreadystatechange", "onredo", "onrepeat", "onreset", "onresize", "onresizeend", "onresizestart", "onresume", "onreverse", "onrowsenter",
        "onrowexit", "onrowdelete", "onrowinserted", "onscroll", "onseek", "onselect", "onselectionchange", "onselectstart", "onstart", "onstop",
        "onstorage", "onsyncrestored", "onsubmit", "ontimeerror", "ontrackchange", "onundo", "onunload", "onurlflip", "seeksegmenttime"];

    function shouldTagBeRemoved(tag){
        return _.some(FORBIDDEN_TAGS, function(forbiddenTag){
            return tag.toLowerCase() === forbiddenTag;
        }, this);
    }

    function getAttributesNames(attributes){
        var attrNames = _.map(attributes, function(attribute) {
            return attribute.name.toLowerCase();
        });
        return attrNames;
    }

    function getForbiddenImageAttributesNames(attributes){
        var attributesNames = getAttributesNames(attributes);
        return _.difference(attributesNames, IMAGE_WHITE_LIST_ATTRIBUTES);
    }

    function getForbiddenBaseAttributesNames(tag){
        if (tag.toLowerCase() === 'a'){
            return _.without(FORBIDDEN_TAGS_AND_ATTRIBUTES, 'dataquery');
        }
        return FORBIDDEN_TAGS_AND_ATTRIBUTES;
    }

    function isImageNode(tag){
        return tag.toLowerCase() === 'img';
    }

    function removeForbiddenValuesFromSensitiveAttributes(attributes){
        return _.reject(attributes, function(attribute) {
            return _.includes(SENSITIVE_ATTRIBUTES, attribute.name.toLowerCase()) && !!/script|expression/.test(attribute.escaped.toLowerCase());
        });
    }

    function removeForbiddenAttributes(tag, attributes) {
        var attrs2remove = isImageNode(tag) ? getForbiddenImageAttributesNames(attributes) : getForbiddenBaseAttributesNames(tag);
        return _.reject(attributes, function(attribute) {
            return _.includes(attrs2remove, attribute.name.toLowerCase());
        });
    }

    function normalizeStartTag(tag, attributes, selfClosing) {
        if (shouldTagBeRemoved(tag)) {
            return null;
        }
        attributes = removeForbiddenAttributes(tag, attributes);
        attributes = removeForbiddenValuesFromSensitiveAttributes(attributes);
        return {
            tag: tag,
            attributes: attributes,
            selfClosing: selfClosing
        };
    }

    function normalizeEndTag(tag) {
        if (shouldTagBeRemoved(tag)){
            return null;
        }
        return tag;
    }

    function removeComment() {
        return "";
    }

    function handleChars(text, startTag){
        return _.includes(FORBIDDEN_TAGS, startTag.toLowerCase()) ? '' : text;
    }

    function fixSecurityIssuesInText(textData) {
        var handler = {
            start: normalizeStartTag,
            end: normalizeEndTag,
            comment: removeComment,
            chars: handleChars
        };
        textData.text = htmlTransformer.transformHTMLString(textData.text, handler);
        return textData;
    }

    return {
        /**
         * @param {object} textData
         * @returns {*}
         */
        fixSecurityIssuesInText: fixSecurityIssuesInText
    };
});
