//wysiwyg.viewer.components.VKShareButton
define(['react', 'testUtils', 'components/components/vKShareButton/vKShareButton'], function (React, testUtils, vKShareButton) {
    'use strict';
    describe('VKShareButton tests', function () {


        function getComponent(props) {
            return testUtils.getComponentFromDefinition(vKShareButton, props);
        }

        beforeEach(function () {
            this.props = testUtils.mockFactory.mockProps().setCompData({
                style: 'Some Style',
                text: 'Some Text'
            });

            this.props.skin = 'skins.viewer.vkshare.VKShareSkin';
            this.props.structure.componentType = 'wysiwyg.viewer.components.VKShareButton';

            this.props.siteAPI.registerMockSiteAspect('vkPostMessage', {
                registerToPostMessage: function () {
                },
                unRegisterToPostMessage: function () {
                }
            });
        });

        describe('VKShareButton iframe src', function () {
            beforeEach(function () {
                this.getSrc = function () {
                    var comp = getComponent(this.props);
                    var iframe = React.addons.TestUtils.findRenderedDOMComponentWithTag(comp, 'iframe');
                    return iframe.src;
                };
            });

            it('Should contain VKShare.html', function () {
                expect(this.getSrc()).toContain('/static/external/VKShare.html?');
            });

            it('Should contain style parameter', function () {
                expect(this.getSrc()).toContain(encodeURIComponent(this.props.compData.style));
            });

            it('Should contain text parameter', function () {
                expect(this.getSrc()).toContain(encodeURIComponent(this.props.compData.text));
            });
        });
    });
});
