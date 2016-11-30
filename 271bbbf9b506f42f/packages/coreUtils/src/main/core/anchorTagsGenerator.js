define(['lodash', 'coreUtils/core/textPatternRecognizer', 'coreUtils/core/fragment'], function(_, textPatternRecognizer, fragment) {
    'use strict';

    var Pattern = textPatternRecognizer.Pattern;

    function generateAnchorsInHtml(htmlText, includedPatterns) {
        if (!_.some(includedPatterns)) {
            return htmlText;
        }

        var parseResult = parseHtmlTextNodes(htmlText);
        _.forEach(parseResult.textNodes, _.partial(patternReplacer, _, includedPatterns));
        return parseResult.container.innerHTML;
    }

    function parseHtmlTextNodes(htmlText) {
        var docfrag = fragment.document.createDocumentFragment();
        var container = docfrag.appendChild(fragment.document.createElement('div'));
        container.innerHTML = htmlText;
        var textNodes = findTextNodes(container);
        return {
            container: container,
            textNodes: textNodes
        };
    }

    function findTextNodes(node, results) {
        results = results || [];
        if (isTextNode(node)){
            results.push(node);
        }

        if (isAnchorNode(node)){
            return results;
        }

        node = node.firstChild;
        while (node) {
            findTextNodes(node, results);
            node = node.nextSibling;
        }
        return results;
    }

    function isTextNode(node){
        return node.nodeType === fragment.Node.TEXT_NODE;
    }

    function isAnchorNode(node){
        return node.nodeType === fragment.Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'a';
    }

    function patternReplacer(node, includedPatterns) {
        var newNodes = [];
        var parentNode = node.parentNode;
        var text = node.data;
        var items = textPatternRecognizer.findAll(text, includedPatterns);
        if (items.length === 0) {
            return;
        }

        _(items)
            .sortByOrder('index', 'desc')
            .forEach(function(item) {
                newNodes.push(fragment.document.createTextNode(text.slice(item.index + item.key.length)));
                newNodes.push(anchorBuilder(item));
                text = text.slice(0, item.index);
            })
            .value();

        newNodes.push(fragment.document.createTextNode(text));
        _.forEach(newNodes.reverse(), function(n){
            parentNode.insertBefore(n, node);
        });
        parentNode.removeChild(node);
    }

    function anchorBuilder(item) {
        var anchorData = buildAnchorData(item);
        var aTag = fragment.document.createElement('a');
        aTag.innerHTML = item.key;
        aTag.classList.add(anchorData.className);

        _.forEach(_.omit(anchorData, ['className']), function(value, key){
            aTag.setAttribute(key, value);
        });

        var objectTag = fragment.document.createElement('object');
        objectTag.appendChild(aTag);
        objectTag.setAttribute('height', 0);
        return objectTag;
    }

    function buildAnchorData(item) {
        var anchorData = {
            "data-auto-recognition": "true",
            "data-content": item.key,
            "className": "auto-generated-link"
        };

        switch (item.pattern) {
            case textPatternRecognizer.Pattern.PHONE :
                return _.assign(anchorData, {
                    href: "tel:" + item.value,
                    "data-type": "phone"
                });

            case textPatternRecognizer.Pattern.MAIL :
                return _.assign(anchorData, {
                    href: "mailto:" + item.value,
                    "data-type": "mail"
                });

            case textPatternRecognizer.Pattern.URL :
                return _.assign(anchorData, {
                    href: item.value,
                    target: "_blank",
                    "data-type": "external"
                });

            default :
                throw "Unknown Pattern: " + item.pattern;
        }
    }

    function findDataForAnchors(htmlText, includedPatterns) {
        if (!_.some(includedPatterns)) {
            return [];
        }

        var parseResult = parseHtmlTextNodes(htmlText);
        return _(parseResult.textNodes)
            .map('data')
            .map(_.partial(textPatternRecognizer.findAll, _, includedPatterns))
            .flatten()
            .map(buildAnchorData)
            .value();
    }

    function getIncludedPatterns(experiment, isMobileView){
        var includedPatterns = {};
        includedPatterns[Pattern.PHONE] = isMobileView;
        includedPatterns[Pattern.MAIL] = true;
        includedPatterns[Pattern.URL] = true;
        return includedPatterns;
    }

    return {
        generateAnchorsInHtml: generateAnchorsInHtml,
        findDataForAnchors: findDataForAnchors,
        getIncludedPatterns: getIncludedPatterns
    };
});
