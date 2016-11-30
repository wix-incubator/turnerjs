define(['testUtils', 'utils', 'wTwitterFollow'], function (testUtils, utils, wTwitterFollow) {
    'use strict';

    function getComponent(props) {
        return testUtils.getComponentFromDefinition(wTwitterFollow, props);
    }

    describe('wTwitterFollow Component', function () {

        it('Should have a valid source according to given properties', function () {
            var fakeSantaBase = 'http://localhost';
            var fakeOrigin = 'http://www.example.com';
            var twitterFollowRelativePath = '/static/external/twitter.html';

            var props = testUtils.santaTypesBuilder.getComponentProps(wTwitterFollow, {
                compData: {
                    accountToFollow: '@Double_O_Seven'
                },
                compProp: {
                    showCount: false,
                    showScreenName: false,
                    dataLang: 'en'
                },
                style: {
                    width: 100,
                    height: 20
                },
                santaBase: fakeSantaBase,
                origin: fakeOrigin
            });

            var comp = getComponent(props);
            var screenName = props.compData.accountToFollow.replace('@', '');
            var urlParams = {
                'screen_name': screenName,
                'href': 'https://twitter.com/' + screenName,
                'show_count': props.compProp.showCount.toString(),
                'show_screen_name': props.compProp.showScreenName.toString(),
                'lang': props.compProp.dataLang,
                'align': 'left',
                compId: comp.props.id,
                origin: fakeOrigin,
                widgetType: 'FOLLOW'
            };

            var expectedIframeSource = fakeSantaBase +
                twitterFollowRelativePath +
                '?' + utils.urlUtils.toQueryString(urlParams);

            expect(comp.getSkinProperties().iframe.src).toBe(expectedIframeSource);
        });
    });
});
