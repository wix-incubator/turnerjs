define(['lodash', 'coreUtils/core/anchorTagsGenerator'], function (_, anchorTagsGenerator) {
    'use strict';

    var allPatterns = {
        'PHONE': true,
        'MAIL': true,
        'URL': true
    };

    function generateHtmlFromNodes(nodes) {
        var docfrag = window.document.createDocumentFragment();
        var container = docfrag.appendChild(window.document.createElement('div'));
        _.forEach(nodes, _.bind(container.appendChild, container));
        return container.innerHTML;
    }

    function generateContainerFromHtml(htmlText) {
        var docfrag = window.document.createDocumentFragment();
        var container = docfrag.appendChild(window.document.createElement('div'));
        container.innerHTML = htmlText;
        return container;
    }

    describe('anchorTagsGenerator', function () {
        describe('generateAnchorsInHtml', function () {

            it("Should replace text nodes with anchor nodes for phones emails and external urls", function(){
                var textNodes = [
                    window.document.createTextNode("aliquamin sollicitud 972541112222 inut"),
                    window.document.createElement('span'),
                    window.document.createTextNode("sollicitudin jizant.hapus@wix.com lacus"),
                    window.document.createElement('span'),
                    window.document.createTextNode("consequat http://foo.com/blah_blah_(wikipedia) ut")
                ];
                var inputHtml = generateHtmlFromNodes(textNodes);
                var outputHtml = anchorTagsGenerator.generateAnchorsInHtml(inputHtml, allPatterns);
                var htmlContainer = generateContainerFromHtml(outputHtml);
                var anchorNodes = htmlContainer.querySelectorAll("a");
                expect(anchorNodes.length).toBe(3);
                expect(_(anchorNodes).map('dataset').filter({"autoRecognition": "true"}).value().length).toBe(3);
                expect(_(anchorNodes).map('dataset').filter({"type": "phone"}).value().length).toBe(1);
                expect(_(anchorNodes).map('dataset').filter({"type": "mail"}).value().length).toBe(1);
                expect(_(anchorNodes).map('dataset').filter({"type": "external"}).value().length).toBe(1);
            });

            it("Should replace text nodes deep in DOM heirarchy", function(){
                var span = window.document.createElement('span');
                span.appendChild(window.document.createTextNode("sollicitudin jizant.hapus@wix.com lacus"));

                var nodes = [
                    window.document.createTextNode("aliquamin sollicitud 972541112222 inut"),
                    span,
                    window.document.createTextNode("consequat http://foo.com/blah_blah_(wikipedia) ut")
                ];
                var inputHtml = generateHtmlFromNodes(nodes);
                var outputHtml = anchorTagsGenerator.generateAnchorsInHtml(inputHtml, allPatterns);
                var outputNodes = generateContainerFromHtml(outputHtml).childNodes;

                span = _(outputNodes).filter({'tagName': 'SPAN'}).first();
                var objectContainingAnchor = _(span.childNodes).filter({'tagName': 'OBJECT'}).first();
                var deepAnchor = _(objectContainingAnchor.childNodes).filter({'tagName': 'A'}).first();
                expect(deepAnchor.dataset.type).toBe('mail');

                var deepTextNode = deepAnchor.childNodes[0];
                expect(deepTextNode.data).toBe('jizant.hapus@wix.com');
            });

            it("Should not create anchors inside existing anchors", function(){
                var anchor = window.document.createElement('a');
                anchor.appendChild(window.document.createTextNode("sollicitudin jizant.hapus@wix.com lacus"));

                var nodes = [
                    window.document.createTextNode("aliquamin sollicitud 972541112222 inut"),
                    anchor,
                    window.document.createTextNode("consequat http://foo.com/blah_blah_(wikipedia) ut")
                ];
                var inputHtml = generateHtmlFromNodes(nodes);
                var outputHtml = anchorTagsGenerator.generateAnchorsInHtml(inputHtml, allPatterns);
                var htmlContainer = generateContainerFromHtml(outputHtml);
                var anchorNodes = htmlContainer.querySelectorAll("a");
                expect(_(anchorNodes).map('dataset').filter({"autoRecognition": "true"}).value().length).toBe(2);
                expect(_(anchorNodes).map('dataset').filter({"type": "mail"}).value().length).toBe(0);
            });

            it("Should break a single text node with 2 recognized patterns to 3 text nodes and 2 anchors", function(){
                var nodes = [
                    window.document.createTextNode("aliquamin sollicitud 972541112222 inut sollicitudin jizant.hapus@wix.com lacus")
                ];

                var inputHtml = generateHtmlFromNodes(nodes);
                var outputHtml = anchorTagsGenerator.generateAnchorsInHtml(inputHtml, allPatterns);
                var outputNodes = generateContainerFromHtml(outputHtml).childNodes;
                expect(outputNodes.length).toBe(5);
                expect(outputNodes[0].data).toBe('aliquamin sollicitud ');
                expect(outputNodes[1].tagName).toBe('OBJECT');
                expect(outputNodes[2].data).toBe(' inut sollicitudin ');
                expect(outputNodes[3].tagName).toBe('OBJECT');
                expect(outputNodes[4].data).toBe(' lacus');
            });
        });
    });
});
