describe('SkypeCallButton', function() {
    testRequire().
        classes('core.managers.components.ComponentBuilder').
        components('wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton').
        resources('W.Data', 'W.ComponentLifecycle');
    
    function createComponent() {
        var that = this;
        this.componentLogic = null;

        this.mockData = this.W.Data.createDataItem({
            id: 'mockData',
            type: 'SkypeCallButton'
        });
        this.mockProps = this.W.Data.createDataItem({
            id: 'mockProps',
            type: 'SkypeCallButtonProperties'
        });

        var builder = new this.ComponentBuilder(document.createElement('DIV'));
        builder.
            withType('wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton').
            withSkin('wysiwyg.common.components.skypecallbutton.viewer.skins.SkypeCallButtonSkin').
            withData(this.mockData).
            onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.setComponentProperties(that.mockProps);
            }).
            create();
    }

    beforeEach(function () {
        createComponent.call(this);

        this.forceRenderComponent = function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
        };

        waitsFor(function () {
            return this.componentLogic !== null;
        }, "SkypeCallButton component to be ready", 1000);
    });

    describe("component skinparts", function () {
        it("should have iframe skinpart", function () {
            expect(this.componentLogic._skinParts.iframe).toBeDefined();
        });

        it("should have placeholder skinpart", function () {
            expect(this.componentLogic._skinParts.placeholder).toBeDefined();
        });
    });

    describe("component data and properties by default", function () {
        it("should have empty skypeName", function () {
            var skypeName = this.componentLogic._data.get('skypeName');

            expect(skypeName).toBe("");
        });

        it("should have button type = call", function () {
            var buttonType = this.componentLogic._data.get('buttonType');

            expect(buttonType).toBe("call");
        });

        it("should have medium image size", function () {
            var imageSize = this.componentLogic._properties.get('imageSize');

            expect(imageSize).toBe("medium");
        });

        it("should have blue image color", function () {
            var imageColor = this.componentLogic._properties.get('imageColor');

            expect(imageColor).toBe("blue");
        });
    });

    describe("component state", function () {
        var state;

        it("should contain 'call' if buttonType='call'", function () {
            this.componentLogic._data.set("buttonType", "call");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.buttonType;
            expect(state).toBe('call');
        });

        it("should contain 'chat' if buttonType='chat'", function () {
            this.componentLogic._data.set("buttonType", "chat");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.buttonType;
            expect(state).toBe('chat');
        });

        it("should contain 'blue' if imageColor='blue'", function () {
            this.componentLogic._properties.set("imageColor", "blue");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.imageColor;
            expect(state).toBe('blue');
        });

        it("should contain 'white' if imageColor='white'", function () {
            this.componentLogic._properties.set("imageColor", "white");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.imageColor;
            expect(state).toBe('white');
        });

        it("should contain 'small' if imageSize='small'", function () {
            this.componentLogic._properties.set("imageSize", "small");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.imageSize;
            expect(state).toBe('small');
        });

        it("should contain 'medium' if imageSize='medium'", function () {
            this.componentLogic._properties.set("imageSize", "medium");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.imageSize;
            expect(state).toBe('medium');
        });

        it("should contain 'large' if imageSize='large'", function () {
            this.componentLogic._properties.set("imageSize", "large");
            this.forceRenderComponent();

            state = this.componentLogic._selectedStates.imageSize;
            expect(state).toBe('large');
        });
    });

    describe("component iframe state", function () {
        var iframe, iframeState;

        beforeEach(function () {
            this.forceRenderComponent();

            iframe = this.componentLogic._skinParts.iframe;
        });

        it("should be loading immediately after render", function () {
            iframeState = this.componentLogic.getState('iframe');
            expect(iframeState).toBe('iframe_loading');
        });

        it("should be ready after iframe is loaded", function () {
            iframe.fireEvent('load');

            iframeState = this.componentLogic.getState('iframe');
            expect(iframeState).toBe('iframe_ready');
        });
    });

    describe("component behavior", function () {
        describe("when no Skype name entered", function () {
            beforeEach(function () {
                this.componentLogic._data.setFields({ "skypeName": "" });
                this.forceRenderComponent();
            });

            it("should hide skype iframe", function () {
                var isIFrameHidden = this.componentLogic._skinParts.iframe.hasClass('hidden');

                expect(isIFrameHidden).toBe(true);
            });

            it("should make iframe src blank", function () {
                var iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toBe("about:blank");
            });

            it("should show placeholder image", function () {
                var isPlaceholderHidden = this.componentLogic._skinParts.placeholder.hasClass('hidden');

                expect(isPlaceholderHidden).toBe(false);
            });
            
            describe("warning tooltip", function () {
                var placeholder;

                beforeEach(function () {
                    spyOn(W.Commands, 'executeCommand');
                    placeholder = this.componentLogic._skinParts.placeholder;
                });

                afterEach(function () {
                    expect(W.Commands.executeCommand.callCount).toBe(1);
                    expect(W.Commands.executeCommand).toHaveBeenCalledWith(
                        'CustomPreviewBehavior.interact',
                        jasmine.any(Object),
                        jasmine.any(Object)
                    );
                });

                it("should appear on click on placeholder", function () {
                    placeholder.click();
                });

                it("should appear when hovering placeholder", function () {
                    var e;
                    if (document.createEvent) {
                        e = document.createEvent('MouseEvents');
                        e.initEvent( 'mouseover', true, false );
                        placeholder.dispatchEvent(e);
                    } else if (document.createEventObject) {
                        placeholder.fireEvent('onmouseover');
                    }
                });
            });
        });

        describe("when Skype name entered", function () {
            beforeEach(function () {
                this.componentLogic._data.setFields({ "skypeName": "echo123" });
                this.forceRenderComponent();
            });

            it("should show skype iframe", function () {
                var isIFrameHidden = this.componentLogic._skinParts.iframe.hasClass('hidden');

                expect(isIFrameHidden).toBe(false);
            });

            it("should add skypeName parameter to iframe src", function () {
                var iframe = this.componentLogic._skinParts.iframe,
                    skypeName = this.componentLogic._data.get('skypeName');

                expect(iframe.src).toContain("skypeName=" + encodeURIComponent(skypeName));
            });

            it("should hide placeholder image", function () {
                var isPlaceholderHidden = this.componentLogic._skinParts.placeholder.hasClass('hidden');

                expect(isPlaceholderHidden).toBe(true);
            });

        });

        describe("when button size is set to small", function () {
            var iframe,
                placeholder;

            beforeEach(function () {
                this.componentLogic._data.set("skypeName", "echo123");
                this.componentLogic._properties.set("imageSize", "small");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;
                placeholder = this.componentLogic._skinParts.placeholder;
            });

            it ("should change iframe height to 16px", function () {
                expect(iframe.style.height).toBe('16px');
            });

            it ("should change placeholder height to 16px", function () {
                expect(placeholder.style.height).toBe('16px');
            });

            it ("should change iframe width to 38px", function () {
                expect(iframe.style.width).toBe('38px');
            });

            it ("should change placeholder width to 38px", function () {
                expect(placeholder.style.width).toBe('38px');
            });

            it("should add &imageSize=16 to iframe src", function () {
                expect(iframe.src).toContain("&imageSize=16");
            });
        });

        describe("when button size is set to medium", function () {
            var iframe,
                placeholder;

            beforeEach(function () {
                this.componentLogic._data.set("skypeName", "echo123");
                this.componentLogic._properties.set("imageSize", "medium");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;
                placeholder = this.componentLogic._skinParts.placeholder;
            });

            it ("should change iframe height to 24px", function () {
                expect(iframe.style.height).toBe('24px');
            });

            it ("should change placeholder height to 24px", function () {
                expect(placeholder.style.height).toBe('24px');
            });

            it ("should change iframe width to 56px", function () {
                expect(iframe.style.width).toBe('56px');
            });

            it ("should change placeholder width to 56px", function () {
                expect(placeholder.style.width).toBe('56px');
            });

            it("should add &imageSize=24 to iframe src", function () {
                expect(iframe.src).toContain("&imageSize=24");
            });
        });

        describe("when button size is set to large", function () {
            var placeholder,
                iframe;

            beforeEach(function () {
                this.componentLogic._data.set("skypeName", "echo123");
                this.componentLogic._properties.set("imageSize", "large");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;
                placeholder = this.componentLogic._skinParts.placeholder;
            });

            it ("should change iframe height to 32px", function () {
                expect(iframe.style.height).toBe('32px');
            });

            it ("should change placeholder height to 32px", function () {
                expect(placeholder.style.height).toBe('32px');
            });

            it ("should change iframe width to 73px", function () {
                expect(iframe.style.width).toBe('73px');
            });

            it ("should change placeholder width to 73px", function () {
                expect(placeholder.style.width).toBe('73px');
            });

            it("should add &imageSize=32 to iframe src", function () {
                expect(iframe.src).toContain("&imageSize=32");
            });
        });

        describe("iframe SRC", function () {
            var iframe;

            // remove this test when the following URL will be accesible via HTTPS :
            // https://www.skypeassets.com/i/scom/js/skype-uri.js
            it("should change iframe src protocol from HTTPS to HTTP", function () {
                this.componentLogic.resources.topology.wysiwyg = "https://static.boogle.com/web-2.0/";
                this.componentLogic._data.set("skypeName", "echo123");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain("http://static.boogle.com/web-2.0/");
            });

            it("should not change iframe src protocol if it is already HTTP", function () {
                var httpUrl = "http://static.boogle.com/web-2.0/";
                this.componentLogic.resources.topology.wysiwyg = httpUrl;
                this.componentLogic._data.set("skypeName", "echo123");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain(httpUrl);
            });

            it("should contain '&imageColor=blue' if color is set to blue", function () {
                this.componentLogic._data.set("skypeName", "echo123");
                this.componentLogic._properties.set("imageColor", "blue");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain("&imageColor=blue");
            });

            it("should contain '&imageColor=white' if color is set to white", function () {
                this.componentLogic._data.set("skypeName", "echo123");
                this.componentLogic._properties.set("imageColor", "white");
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain("&imageColor=white");
            });

            it("should contain '&buttonType=chat' if button is set to chat", function () {
                this.componentLogic._data.setFields({
                    "skypeName": "echo123",
                    "buttonType": "chat"
                });
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain("&buttonType=chat");
            });

            it("should contain '&buttonType=call' if button is set to call", function () {
                this.componentLogic._data.setFields({
                    "skypeName": "echo123",
                    "buttonType": "call"
                });
                this.forceRenderComponent();

                iframe = this.componentLogic._skinParts.iframe;

                expect(iframe.src).toContain("&buttonType=call");
            });
        });
    });
});
