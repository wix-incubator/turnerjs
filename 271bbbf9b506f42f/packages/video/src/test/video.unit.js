define(['lodash', 'testUtils', 'video'], function (_, testUtils, video) {
    'use strict';
    describe('Video component', function () {

        function createVideoProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(video, _.merge({
                compData : {
                    videoId: "83nu4yXFcYU",
                    videoType: "YOUTUBE"
                },
                compProp: {
                    autoplay: false,
                    lightTheme: true,
                    loop: false,
                    showControls: "always_show",
                    showinfo: true
                },
                structure: {
                    componentType: 'wysiwyg.viewer.components.Video'
                }
            }, partialProps));
        }

        it('Vimeo', function () {
            var props = createVideoProps({
                compData: {
                    videoId: "97816836",
                    videoType: "VIMEO"
                },
                compProp: {
                    autoplay: true,
                    lightTheme: false,
                    loop: false,
                    showControls: "always_show",
                    showinfo: false
                }
            });

            var videoComp = testUtils.getComponentFromDefinition(video, props);
            var refData = videoComp.getSkinProperties();
            var actual = refData.videoFrame.children.props;
            expect(actual).toEqual({
                src: '//player.vimeo.com/video/97816836?autoplay=true&loop=false&byline=false&portrait=false&title=false',
                height: "100%",
                width: "100%",
                allowFullScreen: true,
                frameBorder: '0'
            });
        });

        it('YouTube', function () {
            var props = createVideoProps({});
            var videoComp = testUtils.getComponentFromDefinition(video, props);
            var refData = videoComp.getSkinProperties();
            var actual = refData.videoFrame.children.props;
            expect(actual).toEqual({
                src: '//www.youtube.com/embed/83nu4yXFcYU?wmode=transparent&autoplay=0&theme=light&controls=1&autohide=0&loop=0&showinfo=1&rel=0&playlist=false&enablejsapi=0',
                height: "100%",
                width: "100%",
                allowFullScreen: true,
                frameBorder: '0'
            });
        });


        it('DailyMotion', function () {
            var props = createVideoProps({
                compData: {
                    videoId: "97816836",
                    videoType: "DAILYMOTION"
                },
                compProp: {
                    autoplay: true,
                    lightTheme: false,
                    showControls: "temp_show",
                    showinfo: false
                }
            });

            var videoComp = testUtils.getComponentFromDefinition(video, props);
            var refData = videoComp.getSkinProperties();
            var actual = refData.videoFrame.children.props;
            expect(actual).toEqual({
                src: '//www.dailymotion.com/embed/video/97816836?autoplay=true&ui-start-screen-info=0&controls=1&sharing-enable=0&ui-logo=0',
                height: "100%",
                width: "100%",
                allowFullScreen: true,
                frameBorder: '0'
            });
        });


        it('when height and width are 100% - keep them on the component', function () {
            var props = createVideoProps({
                style: {height: "100%", width: "100%"}
            });
            var videoComp = testUtils.getComponentFromDefinition(video, props);
            var refData = videoComp.getSkinProperties();
            expect(refData[""].style.height).toEqual("100%");
            expect(refData[""].style.width).toEqual("100%");
        });

        it('No video type', function () {
            var props = createVideoProps({});
            delete props.compData.videoType;

            var videoComp = testUtils.getComponentFromDefinition(video, props);
            var refData = videoComp.getSkinProperties();
            var actual = refData.videoFrame.children.props;
            expect(actual).toEqual({
                height: "100%",
                width: "100%",
                allowFullScreen: true,
                frameBorder: '0'
            });
        });
    });
});
