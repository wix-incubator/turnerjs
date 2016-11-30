define(['testUtils', 'wixappsCore/core/typesConverter', 'lodash'], function(testUtils, typesConverter, _){
    'use strict';

    describe('video proxy', function(){

        var viewDef = {
            comp: {
                name: 'Video'
            }
        };

        var vimeoData = {
            type: 'Video',
            videoId: '22439234',
            videoType: 'VIMEO'
        };

        var youTubeData = {
            type: 'Video',
            videoId: 'zMrNAljWWMQ',
            videoType: 'YOUTUBE'
        };

        var data = [vimeoData, youTubeData];

        data.forEach(function(proxyData) {

            describe(proxyData.videoType, function () {

                it('should have default skin', function () {
                    var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
                    var proxy = testUtils.proxyBuilder('Video', props);
                    var component = proxy.refs.component;
                    expect(component.props.skin).toEqual('wysiwyg.viewer.skins.video.VideoDefault');
                });

                it('should convert its data using typeConverter', function () {
                    spyOn(typesConverter, 'video').and.callThrough();
                    var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
                    var proxy = testUtils.proxyBuilder('Video', props);
                    var component = proxy.refs.component;
                    expect(component.props.compData).toEqual(typesConverter.video(proxyData));
                    expect(typesConverter.video).toHaveBeenCalledWith(proxy.proxyData);
                });

                it('should set compProp according to the view definition', function () {
                    var componentProps = {
                        'showControls': 'always_show',
                        'autoplay': false,
                        'loop': true,
                        'showinfo': true,
                        'lightTheme': false
                    };

                    _.merge(viewDef.comp, componentProps);
                    var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
                    var proxy = testUtils.proxyBuilder('Video', props);
                    var component = proxy.refs.component;
                    expect(component.props.compProp).toEqual(componentProps);
                });
            });
        });
    });
});
