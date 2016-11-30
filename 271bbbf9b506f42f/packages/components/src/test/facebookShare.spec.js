//'wysiwyg.viewer.components.FacebookShare
define(['lodash', 'testUtils', 'components/components/facebookShare/facebookShare'], function (_, testUtils, facebookShare) {
    'use strict';

    describe('FacebookShare tests', function () {

        var comp;

        function getProps(urlChoice) {
            var siteData = testUtils.mockFactory.mockSiteData();
            var props = testUtils.mockFactory.mockProps(siteData).setCompData({
                label: 'Some Label',
                urlChoice: urlChoice || 'Current page',
                id: 'data'
            });
            props.structure.componentType = 'wysiwyg.viewer.components.FacebookShare';

            return props;
        }

        function getComponent(urlChoice) {
            var compInstance = testUtils.getComponentFromDefinition(facebookShare, getProps(urlChoice));
            spyOn(compInstance, 'getSocialUrl');
            return compInstance;
        }

        describe('Url to be shared', function () {

            it('Should share Current Page url when urlChoice is set to "Current Page"', function () {
                comp = getComponent();
                comp.getUrlToBeShared();
                expect(comp.getSocialUrl).toHaveBeenCalledWith(false);
            });

            it('Should share Site url when urlChoice is set to "Site"', function () {
                comp = getComponent('Site');
                comp.getUrlToBeShared();
                expect(comp.getSocialUrl).toHaveBeenCalledWith(true);
            });

        });

        describe('getFacebookSharer', function () {

            it('Should return facebook sharer url', function () {
                comp = getComponent();
                expect(comp.getFacebookSharer()).toEqual('http://www.facebook.com/sharer.php?u=');
            });

        });
    });
});
