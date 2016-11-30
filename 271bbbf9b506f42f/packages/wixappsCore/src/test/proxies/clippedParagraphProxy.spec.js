define(['lodash', 'testUtils', 'reactDOM'], function(_, /** testUtils */testUtils, ReactDOM) {
    'use strict';

    describe('ClippedParagraph', function () {
        var viewDef, proxyData;

        beforeEach(function () {
            viewDef = {
                "comp": {
                    "name": "ClippedParagraph",
                    "max-chars": 5
                }
            };
            proxyData = {
                "_type": "wix:RichText",
                "text": "<hatul class=\"font_8\"><span>I’m an answer. Click here to edit my style or click Edit FAQ to customize me. I’m a great place to answer the questions your visitors ask most. My text is rich, so you can change my <span class=\"color_5\">color</span>, <em>font</em> and add <u><a dataquery=\"#faq_570B61BC\">links</a></u> inside the FAQ editor.</span></hatul>\n",
                "links": [
                    {
                        "linkId": "faq_570B61BC",
                        "_type": "wix:ExternalLink",
                        "target": "_blank",
                        "protocol": "http",
                        "address": "www.wix.com/support/main/html5/"
                    }
                ],
                "version": 2
            };
        });

        it('should clip wix:RichText', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('ClippedParagraph', props);
            var component = proxy.refs.component;

            expect(component.props.compData.text).toEqual('<p class="font_8"><span>I’m a...</span></p>');
        });

        it('should clip wix:RichText', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('ClippedParagraph', props);

            expect(ReactDOM.findDOMNode(proxy).style.overflow).toEqual('hidden');
        });

        it('should set min-height to single line', function () {
            viewDef.comp.singleLine = true;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            props.viewProps.siteData.getFont.and.returnValue("normal normal normal 22px/1.4em din-next-w01-light {color_14}");
            var proxy = testUtils.proxyBuilder('ClippedParagraph', props);

            expect(ReactDOM.findDOMNode(proxy).style["min-height"]).toEqual('27.5px');
        });

        it('should set min-height to minLines', function () {
            viewDef.comp.minLines = 2;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            props.viewProps.siteData.getFont.and.returnValue("normal normal normal 22px/1.4em din-next-w01-light {color_14}");
            var proxy = testUtils.proxyBuilder('ClippedParagraph', props);

            expect(ReactDOM.findDOMNode(proxy).style["min-height"]).toEqual('55px');
        });
    });
});
