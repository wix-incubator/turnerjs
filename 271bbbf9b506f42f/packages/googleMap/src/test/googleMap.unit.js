define(['reactDOM', 'lodash', 'utils', 'testUtils', 'googleMap'], function (reactDOM, _, utils, testUtils, googleMap) {
    'use strict';

    describe('google map spec', function () {

        function createGoogleMapProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(googleMap, _.merge({
                skin: "wysiwyg.viewer.skins.GoogleMapSkin",
                compData: {
                    "address": "500 Terry Francois Street, 6th Floor. San Francisco, CA 94158",
                    "latitude": 37.77065,
                    "longitude": -122.387301,
                    "addressInfo": "Wix Office",
                    "mapStyle": []
                },
                compProp: {
                    "showZoom": true,
                    "showStreetView": true,
                    "showMapType": true,
                    "mapDragging": false,
                    "mapType": "ROADMAP",
                    "language": "en"
                },
                structure: {
                    layout: {
                        width: 200,
                        height: 200
                    }
                },
                requestModelCookie: '',
                currentUrl: '',
                santaBase: '',
                cannotHideIframeWithinRoundedCorners: false
            }, partialProps));
        }

        function createGoogleMap(partialProps) {
            var props = createGoogleMapProps(partialProps);
            return testUtils.getComponentFromDefinition(googleMap, props);
        }

        function getIframeUrl(googleMapIframe) {
            return googleMapIframe.getSkinProperties().mapContainer.children[0].props.src;
        }

        describe('iframe url', function(){
            it("should start with props.santaBase + '/static/external/googleMap.html'", function(){
                var googleMapComponent = createGoogleMap({santaBase: 'santaBase'});
                var iframeUrl = getIframeUrl(googleMapComponent);

                expect(iframeUrl).toStartWith('santaBase/static/external/googleMap.html');
            });

            describe('query paramas', function(){

                function getParameterByName(name, url) {
                    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                        results = regex.exec(url);
                    if (!results) { return null; }
                    if (!results[2]) { return ''; }
                    return results[2];
                }

                describe('language', function(){

                    function getLanguageQueryParam(url){
                        return getParameterByName('language', url);
                    }

                    it('should be user language if compProp.language is userLang', function(){
                        spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('fr');
                        var googleMapComponent = createGoogleMap({compProp: {
                            language: 'userLang'
                        }});
                        var iframeUrl = getIframeUrl(googleMapComponent);
                        var languageQueryParam = getLanguageQueryParam(iframeUrl);

                        expect(languageQueryParam).toEqual('fr');
                    });

                    it("should be 'en' by default if user language is not supported language", function(){
                        spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('no_supported');
                        var googleMapComponent = createGoogleMap({compProp: {
                            language: 'userLang'
                        }});
                        var iframeUrl = getIframeUrl(googleMapComponent);
                        var languageQueryParam = getLanguageQueryParam(iframeUrl);

                        expect(languageQueryParam).toEqual('en');
                    });

                    it('should equal to language in compProp if defined', function(){
                        var googleMapComponent = createGoogleMap({compProp: {
                            language: 'ru'
                        }});
                        var iframeUrl = getIframeUrl(googleMapComponent);
                        var languageQueryParam = getLanguageQueryParam(iframeUrl);

                        expect(languageQueryParam).toEqual('ru');
                    });

                    it("should be 'en' by default if language in compProps is not supported language", function(){
                        var googleMapComponent = createGoogleMap({compProp: {
                            language: 'no_supported'
                        }});
                        var iframeUrl = getIframeUrl(googleMapComponent);
                        var languageQueryParam = getLanguageQueryParam(iframeUrl);

                        expect(languageQueryParam).toEqual('en');
                    });
                });
            });
        });

        describe("squared corners state", function () {
            var cornersState;

            it('should be activated if browser cannot hide iframe within rounded corners', function () {
                var googleMapComponent = createGoogleMap({cannotHideIframeWithinRoundedCorners: true});

                cornersState = googleMapComponent.state.$corners;
                expect(cornersState).toBe('squared');
            });

            it('should be activated if browser supports hiding iframe within rounded corners', function () {
                var googleMapComponent = createGoogleMap({cannotHideIframeWithinRoundedCorners: false});

                cornersState = googleMapComponent.state.$corners;
                expect(cornersState).not.toBeDefined();
            });
        });

        describe('post message', function () {
            function createExpectedMapProperties(props) {
                var data = props.compData;
                var properties = props.compProp;
                var expectedMapProps = {
                    address: data.address,
                    addressInfo: data.addressInfo,
                    mapType: properties.mapType,
                    mapInteractive: properties.mapDragging,
                    showZoom: properties.showZoom,
                    showStreetView: properties.showStreetView,
                    showMapType: properties.showMapType,
                    lat: data.latitude,
                    long: data.longitude,
                    ts: (props.structure.layout.width + props.structure.layout.height),
                    mapStyle: JSON.stringify(data.mapStyle || [])
                };

                return expectedMapProps;
            }

            var postMsgSpy;
            var iFrameNodeMock;

            beforeEach(function () {
                postMsgSpy = jasmine.createSpy('postMsg');
                iFrameNodeMock = {
                    contentWindow: {
                        postMessage: postMsgSpy
                    }
                };
                spyOn(reactDOM, 'findDOMNode').and.returnValue(iFrameNodeMock);
            });

            it('should pass data in post message to the iFrame including mapStyle', function () {
                var compData = {
                    mapStyle: [
                        {
                            "featureType": "all",
                            "elementType": "geometry",
                            "stylers": [
                                {
                                    "saturation": 0
                                },
                                {
                                    "lightness": 0
                                },
                                {
                                    "hue": "#ff007b"
                                }
                            ]
                        }
                    ]
                };

                var googleMapComponent = createGoogleMap({compData: compData});
                iFrameNodeMock.onload();

                expect(postMsgSpy).toHaveBeenCalledWith(JSON.stringify(createExpectedMapProperties(googleMapComponent.props)), '*');
            });

            it('should pass data in post message to the iFrame without mapStyle', function () {
                var compData = {
                    mapStyle: undefined
                };

                var googleMapComponent = createGoogleMap({compData: compData});
                iFrameNodeMock.onload();

                expect(postMsgSpy).toHaveBeenCalledWith(JSON.stringify(createExpectedMapProperties(googleMapComponent.props)), '*');
            });
        });
    });
});
