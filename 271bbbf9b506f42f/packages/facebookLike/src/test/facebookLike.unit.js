define(['lodash', 'utils', 'testUtils', 'facebookLike'], function (_, /** utils */ utils, /** testUtils */ testUtils, facebookLike) {
    'use strict';

    describe('facebookLike', function () {

        var BASE_FACEBOOK_SRC = '//www.facebook.com/plugins/like.php';

        function createProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(facebookLike, _.merge({
                rootId: 'c1dmp',
                structure: {
                    'type': 'Component',
                    'styleId': 'fbl1',
                    'id': 'comp-ivgmym26',
                    'dataQuery': '#dataItem-ivgmym2s',
                    'skin': 'skins.core.FacebookLikeSkin',
                    'layout': {
                        'width': 170,
                        'height': 20,
                        'x': 421,
                        'y': 340,
                        'scale': 1,
                        'rotationInDegrees': 0,
                        'anchors': [
                            {
                                'distance': 6,
                                'originalValue': 366,
                                'type': 'BOTTOM_TOP',
                                'locked': true,
                                'targetComponent': 'comp-im0o9drn'
                            }
                        ],
                        'fixedPosition': false
                    },
                    'propertyQuery': 'propItem-ivgmym2t',
                    'componentType': 'wysiwyg.viewer.components.WFacebookLike'
                },
                compProp: {
                    'type': 'WFacebookLikeProperties',
                    'metaData': {
                        'schemaVersion': '1.0'
                    },
                    'width': 225,
                    'font': 'helvetica',
                    layout: 'standard',
                    show_faces: 'show_facesMock',
                    action: 'like',
                    colorScheme: 'colorSchemeMock',
                    send: 'sendMock',
                    language: 'fr'
                },
                currentUrl: {
                    'full': 'http://naamaa.wixsite.com/mysite?debug=all',
                    'protocol': 'http:',
                    'host': 'naamaa.wixsite.com',
                    'hostname': 'naamaa.wixsite.com',
                    'port': '',
                    'path': '/mysite',
                    'search': '?debug=all',
                    'hash': '',
                    'query': {
                        'debug': 'all'
                    }
                },
                cookie: 'svSession=c96092b8d333c6e6b4c182c4fcfbe997f62fb39f278338ba8652c9fbeeb2762ab43528ce2541ef3a03b30bee6286d4ac1e60994d53964e647acf431e4f798bcdf9a53a9b77a9cf9fe911d55f6d833f989d12bbc7f256bf4fb8d1521d1bde73c5; _ga=GA1.2.1693699451.1473685542'
            }, partialProps));
        }

        function createComp(partialProps) {
            var props = createProps(partialProps);
            return testUtils.getComponentFromDefinition(facebookLike, props);
        }


        beforeEach(function () {
            spyOn(utils.wixUrlParser, 'getUrl').and.returnValue('mockCurrentUrl');
        });

        function getIframeSrc(props) {
            var facebookLikeComp = createComp(props);
            var iframe = facebookLikeComp.getSkinProperties().iframe;
            return iframe.src;
        }

        it('should use comp props in the iframe src', function () {
            var actualSrc = getIframeSrc(this.props);
            var actualParsed = utils.urlUtils.parseUrl(actualSrc);

            expect(actualParsed.query).toEqual({
                href: 'mockCurrentUrl',
                layout: 'standard',
                show_faces: 'show_facesMock',
                action: 'like',
                colorscheme: 'colorSchemeMock',
                send: 'sendMock',
                locale: 'fr_FR',
                a: 'a'
            });
            expect(actualSrc.indexOf(BASE_FACEBOOK_SRC)).toEqual(0);
        });

        it('should return the user locale if language is userLang', function () {
            var actualSrc = getIframeSrc({
                compProp: {
                    language: 'userLang'
                }
            });
            var actualParsed = utils.urlUtils.parseUrl(actualSrc);

            expect(actualParsed.query).toEqual({
                href: 'mockCurrentUrl',
                layout: 'standard',
                show_faces: 'show_facesMock',
                action: 'like',
                colorscheme: 'colorSchemeMock',
                send: 'sendMock',
                locale: 'en_US',
                a: 'a'
            });
            expect(actualSrc.indexOf(BASE_FACEBOOK_SRC)).toEqual(0);
        });
    });
});
