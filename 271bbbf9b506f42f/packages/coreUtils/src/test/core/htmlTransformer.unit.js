define(['lodash', 'coreUtils/core/htmlTransformer'], function (_, htmlTransformer) {
    'use strict';

    describe("htmlTransformer", function () {
        it("should transform html string", function () {
            var htmlStr = '<a    href  = "JaVaScriPt:alert(Hi);">Test1</a   >gaga';
            var handler = {
                start: function (tag, attributes, selfClosing) {
                    return {
                        tag: tag,
                        attributes: attributes,
                        selfClosing: selfClosing
                    };
                },
                end: function (tag) {
                    return tag;
                },
                chars: function (text) {
                    return text;
                },
                comment: function (text) {
                    return text;
                }
            };
            var result = htmlTransformer.transformHTMLString(htmlStr, handler);
            expect(result).toEqual('<a href="JaVaScriPt:alert(Hi);" >Test1</a>gaga');
        });
    });
});
