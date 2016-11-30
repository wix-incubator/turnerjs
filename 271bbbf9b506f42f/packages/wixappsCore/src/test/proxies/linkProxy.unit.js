define(['utils', 'testUtils', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/linkProxy'], function (/** utils */utils, /** testUtils */testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('Link proxy', function () {

        var viewDef;

        beforeEach(function () {
            viewDef = {
                comp: {
                    name: 'Link',
                    items: []
                }
            };
        });

        it('should be rendered to an anchor element', function () {
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('Link', props);

            expect(proxy.refs.component.nodeName).toEqual('A');
        });

        it('should use typesConverter to convert its data and then create the anchor props using utils.linkRenderer', function () {
            var proxyData = {};
            var compProps = {
                href: 'http://www.google.com/'
            };
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);

            var convertedData = {};
            spyOn(typesConverter, 'link').and.returnValue(convertedData);
            spyOn(utils.linkRenderer, 'renderLink').and.returnValue(compProps);

            // Create the proxy with dummy data
            var proxy = testUtils.proxyBuilder('Link', props);

            // Expect the proxy to convert the data using the typesConverter
            expect(typesConverter.link).toHaveBeenCalledWith(proxyData, jasmine.any(Function));

            // Expect it to use the result of the typesConverter with the linkRenderer
            expect(utils.linkRenderer.renderLink).toHaveBeenCalledWith(convertedData, props.viewProps.siteData, props.viewProps.rootNavigationInfo);

            // Expect it to pass the result of the linkRenderer.renderLink to the props of the anchor element.
            expect(proxy.refs.component.href).toEqual(compProps.href);
        });
    });
});
