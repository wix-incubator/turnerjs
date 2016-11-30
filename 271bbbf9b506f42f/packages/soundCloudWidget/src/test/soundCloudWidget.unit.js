define(['lodash', 'testUtils', 'soundCloudWidget'], function (_, testUtils, soundCloudWidget) {
    'use strict';

    describe('SoundCloudWidget spec', function () {

        function createSoundCloudWidgetProps(partialProps) {

            return testUtils.santaTypesBuilder.getComponentProps(soundCloudWidget, _.merge({
                skin: "wysiwyg.viewer.skins.SoundCloudWidgetSkin",
                compData: {
                    "url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/262375023&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true",
                    "showArtWork": true,
                    "autoPlay": true
                },
                style: {
                    "top": 100,
                    "bottom": "",
                    "left": 100,
                    "right": "",
                    "width": 482,
                    "height": 171,
                    "position": "absolute"
                },
                os: {
                    "ios": false
                },
                isPlayingAllowed: true
            }, partialProps));
        }

        function createSoundCloudWidget(partialProps) {
            var props = createSoundCloudWidgetProps(partialProps);
            return testUtils.getComponentFromDefinition(soundCloudWidget, props);
        }

        it("Should Contain one skinpart - iFrameHolder", function(){
            var soundCloudWidgetComponent = createSoundCloudWidget();

            var skinProperties = soundCloudWidgetComponent.getSkinProperties();
            expect(_.size(skinProperties)).toBe(1);
        });

        describe('getSoundCloudUrl', function(){
            function getQueryParams(url){
                url = decodeURIComponent(url);
                var params = url.split('?')[1];

                if (!params){
                    return {};
                }

                var keyValPairs = params.split('&');
                return _.reduce(keyValPairs, function(result, currentParam){
                    var currentParamAsPair = currentParam.split('=');
                    var key = currentParamAsPair[0];
                    if (key.length) {
                        result[key] = currentParamAsPair[1];
                    }

                    return result;
                }, {});
            }

            function getIframeUrl(soundCloudComponent) {
                return soundCloudComponent.getSkinProperties().iFrameHolder.children[0].props.src;
            }

            it('should return legal soundcloud url', function () {
                var soundCloudWidgetComponent = createSoundCloudWidget();

                var iframeUrl = getIframeUrl(soundCloudWidgetComponent);

                expect(iframeUrl).toStartWith('https://w.soundcloud.com/player/');
            });

            describe('queryParams', function(){
                it('should include all the query params exists in the compData.url', function(){
                    var compData = {
                        "url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/262375023&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true"
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});
                    var queryParams = getQueryParams(compData.url);

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    _.forEach(queryParams, function(paramValue, paramKey){
                        expect(paramValue).toEqual(soundCloudUrlQueryParams[paramKey]);
                    });
                });

                it('should have visual=true if compData.showArtWork is true', function(){
                    var compData = {
                        "showArtWork": true
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    expect(soundCloudUrlQueryParams.visual).toEqual('true');
                });

                it('should have visual=false if compData.showArtWork is false', function(){
                    var compData = {
                        "showArtWork": false
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    expect(soundCloudUrlQueryParams.visual).toEqual('false');
                });

                it('should have auto_play=true if compData.autoPlay is true', function(){
                    var compData = {
                        "autoPlay": true
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    expect(soundCloudUrlQueryParams.auto_play).toEqual('true');
                });

                it('should have auto_play=false if compData.autoPlay is false', function(){
                    var compData = {
                        "autoPlay": false
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    expect(soundCloudUrlQueryParams.auto_play).toEqual('false');
                });

                it('should have auto_play=false if compData.autoPlay is true and renderFlag isPlayingAllowed is false', function(){
                    var compData = {
                        "autoPlay": true
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData, isPlayingAllowed: false});

                    var iframeUrl = getIframeUrl(soundCloudWidgetComponent);
                    var soundCloudUrlQueryParams = getQueryParams(iframeUrl);

                    expect(soundCloudUrlQueryParams.auto_play).toEqual('false');
                });
            });

            describe('dataState', function(){
                it('$trackUrl should be emptyString if compData.url is not empty', function(){
                    var compData = {
                        "url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/262375023&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true"
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    expect(soundCloudWidgetComponent.state.$trackUrl).toEqual('');
                });

                it("$trackUrl should be 'noContent' if compData.url is empty", function(){
                    var compData = {
                        "url": ""
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({compData: compData});

                    expect(soundCloudWidgetComponent.state.$trackUrl).toEqual('noContent');
                });
            });

            it('should get width and height from props.style', function(){
                var style = {
                    width: 200,
                    height: 200
                };

                var soundCloudWidgetComponent = createSoundCloudWidget({style: style});

                var iframeWidth = soundCloudWidgetComponent.getSkinProperties().iFrameHolder.children[0].props.width;
                var iframeHeight = soundCloudWidgetComponent.getSkinProperties().iFrameHolder.children[0].props.height;

                expect(iframeWidth).toEqual(style.width);
                expect(iframeHeight).toEqual(style.height);
            });

            describe('style', function(){
                it('should have empty style props if os.ios is false', function(){
                    var os = {
                        ios: false
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({os: os});

                    var iframeStyle = soundCloudWidgetComponent.getSkinProperties().iFrameHolder.children[0].props.style;

                    expect(iframeStyle).toEqual({});
                });

                it('should have additional style property for ios devices if os.ios is true', function(){
                    var os = {
                        ios: true
                    };

                    var soundCloudWidgetComponent = createSoundCloudWidget({os: os});

                    var iframeStyle = soundCloudWidgetComponent.getSkinProperties().iFrameHolder.children[0].props.style;
                    var additionalStylesForIosDevices = {'overflow': 'scroll', '-webkit-overflow-scrolling': 'touch'};

                    expect(iframeStyle).toEqual(additionalStylesForIosDevices);
                });
            });
        });
    });
});
