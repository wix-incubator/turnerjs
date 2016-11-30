//describe('YouTubeSubscribeButton Component', function() {
//    var defaultChannal = 'wixmypage';
//    var defaultLayout = 'default';
//    var defaultTheme = 'light';
//
//    testRequire()
//        .classes('core.managers.components.ComponentBuilder')
//        .components('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton')
//        .resources('W.Data', 'W.ComponentLifecycle', 'W.Utils', 'W.Config');
//
//    beforeEach(function(){
//        var componentLogicName = 'YouTubeSubscribeButton';
//        this[componentLogicName] = null;
//
//        this.createYouTubeSubscribeButtonComponent = function(componentLogic){
//            var data = this.W.Data.createDataItem({type: 'YouTubeSubscribeButton', youtubeChannelId: defaultChannal}),
//
//                builder = new this.ComponentBuilder(document.createElement('div'));
//
//            builder
//                .withType('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton')
//                .withSkin('wysiwyg.common.components.youtubesubscribebutton.viewer.skins.YouTubeSubscribeButtonSkin')
//                .withData(data)
//                .onCreated(function(createdComponent){
//                    this[componentLogic] = createdComponent;
//                }.bind(this))
//                .create();
//
//            waitsFor(function() {
//                return this[componentLogic];
//            }, componentLogic + " to be ready", 1000);
//        };
//
//        this.createYouTubeSubscribeButtonComponent(componentLogicName);
//
//    });
//
//    describe('Acceptance Test - Component structure', function () {
//        it('Skin parts should be defined', function () {
//            expect(this.YouTubeSubscribeButton._skinParts.youtubeIframe).toBeDefined();
//        });
//
//        it('iframe should be defined', function () {
//            expect(this.YouTubeSubscribeButton._skinParts.youtubeIframe.getElementsByTagName("iframe")[0]).toBeDefined();
//        });
//
//        it('width and height should be defined', function () {
//            var iframe = this.YouTubeSubscribeButton._skinParts.youtubeIframe.getElementsByTagName("iframe")[0];
//            expect(iframe.getAttribute('width')).toBeDefined();
//            expect(iframe.getAttribute('height')).toBeDefined();
//        });
//
//    });
//
//    describe('basic features', function(){
//        it("should have the expected params in the iframe's url", function(){
//            var urlParams = 'channel=' + defaultChannal + '&layout=' + defaultLayout + '&theme=' + defaultTheme;
//            this.ComponentLifecycle["@testRenderNow"](this.YouTubeSubscribeButton);
//            var compUrlParams = this.YouTubeSubscribeButton._skinParts.youtubeIframe.getElementsByTagName("iframe")[0].getAttribute('src').split('?')[1];
//            expect(compUrlParams).toBe(urlParams);
//        });
//    });
//});