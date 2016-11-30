define(['testUtils'], function (/** testUtils */testUtils) {
    'use strict';
    describe('inline spacer proxy', function () {
        var viewDef;

        beforeEach(function () {
            viewDef = {
                comp: {
                    name: 'TestSpacerProxy',
                    size: 20
                }
            };
        });

        it('Should create a inline spacer div with the expected style', function () {
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('InlineSpacer', props);
            var proxyProps = proxy.refs.component;
            expect(proxyProps.style.display).toEqual("inline");
            expect(proxyProps.style.wordSpacing).toEqual('20px');
        });

        it('Should have a space character innerText', function () {
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('InlineSpacer', props);
            var proxyChild = proxy.refs.component.innerHTML;
            expect(proxyChild).toEqual(' ');
        });
    });
});
