//'wysiwyg.viewer.components.htmlComponent
define([
    'lodash', 'testUtils', 'htmlComponent'], function (_, testUtils, htmlComponent) {
    'use strict';
    describe('html component tests', function () {

        function createHtmlComp(compData, isSandboxed, isios) {
                var mockedSiteData = testUtils.mockFactory.mockSiteData();

                if (!_.isUndefined(isSandboxed)) {
                    mockedSiteData = mockedSiteData.setUseSandboxInHTMLComp(isSandboxed);
                }

                var props = testUtils.santaTypesBuilder.getComponentProps(htmlComponent, {
                    os: {ios: isios || false},
                    serviceTopologyStaticHTMLComponentUrl: 'fakeServiceTopologyStaticHTMLComponentUrl',
                    compData: compData,
                    skin:'wysiwyg.viewer.skins.HtmlComponentSkin'},
                    mockedSiteData);

                var comp = testUtils.getComponentFromDefinition(htmlComponent, props);
                return comp;
        }

        function getIframe(comp) {
            return comp.refs.iFrameHolder.children[0];
        }

        describe('hasContent component state', function () {
            it('Should render component', function () {
                var comp = createHtmlComp({url: 'http://some-fake-url.com'});
                expect(comp).toBeDefined();
            });

            it('Shoud be hasContent if url is not empty', function () {
                var comp = createHtmlComp({url: 'fake-protocol://fake-url.com'});
                expect(comp.getInitialState().$content).toBe('hasContent');
            });

            it('Should be noContent if url is empty', function () {
                var comp = createHtmlComp({url: ''});
                expect(comp.getInitialState().$content).toBe('noContent');
            });
        });

        describe('url', function () {
            beforeEach(function() {
                this.staticURL = 'static.wixstatic.com';
            });

            it('should replace the staticURL with the  service topology url to non external url', function() {
                var baseURL = 'http://some-fake-url.com/' + this.staticURL;
                var fullURL = baseURL + this.staticURL;
                var iframe = getIframe(createHtmlComp({'sourceType': 'nonexternal', 'url': fullURL}));
                expect(iframe.getAttribute('src')).toBe(baseURL + this.staticURL);
            });

            it('should prepend the topology url to a non external url that starts with html', function() {
                var baseURL = 'html/some-fake-url.com/' + this.staticURL;
                var fullURL = baseURL + this.staticURL;
                var iframe = getIframe(createHtmlComp({url: fullURL}, true, {'sourceType': 'nonexternal', 'url': fullURL}));
                expect(iframe.getAttribute('src')).toBe("http://fakeServiceTopologyStaticHTMLComponentUrl" + baseURL + this.staticURL);
            });
        });

        describe('mobile safari', function() {
            it('adds CSS property scroll to the style when browsing with mobile safari', function() {
                var comp = createHtmlComp({url: 'someurl'}, undefined, true);
                var skinProperties = comp.getSkinProperties()[''].style;
                expect(skinProperties.overflow).toBe('scroll');
                expect(skinProperties['-webkit-overflow-scrolling']).toBe('touch');
            });
        });

        describe('content logic', function() {
            it("changes the $content if the component has been provided with a URL on compData", function() {
                var props = testUtils.santaTypesBuilder.getComponentProps(htmlComponent, {compData: {url: 'nir.com'}, skin:'wysiwyg.viewer.skins.HtmlComponentSkin'});
                var comp = testUtils.getComponentFromDefinition(htmlComponent, props);
                comp.componentWillReceiveProps(props);
                expect(comp.state.$content).toBe('hasContent');
            });

            it("changes the $content if the component has been provided with a URL on compData", function() {
                var props = testUtils.santaTypesBuilder.getComponentProps(htmlComponent, {compData: {}, skin:'wysiwyg.viewer.skins.HtmlComponentSkin'});
                var comp = testUtils.getComponentFromDefinition(htmlComponent, props);
                comp.componentWillReceiveProps(props);
                expect(comp.state.$content).toBe('noContent');
            });
        });

        describe('sandbox logic', function () {
            it('should not have sandbox attribute if rendererModel.useSandboxInHTMLComp is undefined', function () {
                var comp = createHtmlComp({url: 'http://some-fake-url.com'});
                var iframe = getIframe(comp);

                expect(iframe.getAttribute('sandbox')).toBe(null);
            });

            it('should not have sandbox attribute if rendererModel.useSandboxInHTMLComp is false', function () {
                var comp = createHtmlComp({url: 'http://some-fake-url.com'}, false);
                var iframe = getIframe(comp);
                comp.render();

                expect(iframe.getAttribute('sandbox')).toBe(null);
            });

            it('should have sandbox attribute if rendererModel.useSandboxInHTMLComp is true', function () {
                var comp = createHtmlComp({url: 'http://some-fake-url.com'}, true);
                var iframe = getIframe(comp);
                expect(iframe.getAttribute('sandbox')).toBe('allow-same-origin allow-forms allow-popups allow-scripts allow-pointer-lock');
            });
        });
    });
});
