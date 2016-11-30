define(["testUtils", "lodash", "components/components/skypeCallButton/skypeCallButton"],
    function(testUtils, _, skypeCallButton) {
    "use strict";

    var initialData = {},
        initialProperties = {},
        baseUrl = "http://mysite.wix.com";

    describe("SkypeCallButton component", function() {
        beforeEach(function() {
            initialData = {};
            initialProperties = {};
        });

        describe("CSS state", function() {
            function theState() {
                return createSkypeCallButton().getInitialState();
            }

            describe("when button type = 'Call'", function() {
                beforeEach(function() {
                    initialData.buttonType = "call";
                });

                it("should have $buttontype = 'call'", function() {
                    expect(theState().$buttontype).toBe('call');
                });
            });

            describe("when button type = 'Chat'", function() {
                beforeEach(function() {
                    initialData.buttonType = "chat";
                });

                it("should have $buttontype = 'chat'", function() {
                    expect(theState().$buttontype).toBe('chat');
                });
            });

            describe("when image size is small", function() {
                beforeEach(function() {
                    initialProperties.imageSize = "small";
                });

                it("should have $imagesize = 'small'", function() {
                    expect(theState().$imagesize).toBe('small');
                });
            });

            describe("when image size is medium", function() {
                beforeEach(function() {
                    initialProperties.imageSize = "medium";
                });

                it("should have $imagesize = 'medium'", function() {
                    expect(theState().$imagesize).toBe('medium');
                });
            });

            describe("when image size is large", function() {
                beforeEach(function() {
                    initialProperties.imageSize = "large";
                });

                it("should have $imagesize = 'large'", function() {
                    expect(theState().$imagesize).toBe('large');
                });
            });

            describe("when image color is blue", function() {
                beforeEach(function() {
                    initialProperties.imageColor = "blue";
                });

                it("should have $imagesize = 'blue'", function() {
                    expect(theState().$imagecolor).toBe('blue');
                });
            });

            describe("when image color is white", function() {
                beforeEach(function() {
                    initialProperties.imageColor = "white";
                });

                it("should have $imagesize = 'white'", function() {
                    expect(theState().$imagecolor).toBe('white');
                });
            });
        });

        describe("the placeholder image", function() {
            describe("when Skype login is not empty", function() {
                beforeEach(function() {
                    initialData.skypeName = "echo123";
                });

                it("should be visible", function() {
                    expect(thePlaceholder().style.display).toBe('block');
                });
            });

            describe("when Skype login is empty", function() {
                beforeEach(function() {
                    initialData.skypeName = "";
                });

                it("should be visible", function() {
                    expect(thePlaceholder().style.display).toBe('block');
                });
            });
        });

        describe("component size", function() {
            describe("when buttonType = call", function() {
                beforeEach(function() {
                    initialData.buttonType = "call";
                });

                describe("when imageSize = small", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "small";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 38x16", function() {
                            var skypeVisual = skypeButton.placeholder;

                            expect(skypeVisual.style.width).toEqual(38);
                            expect(skypeVisual.style.height).toEqual(16);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 38x16", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(38);
                            expect(placeholder.style.height).toEqual(16);
                        });
                    });
                });

                describe("when imageSize = medium", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "medium";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 56x24", function() {
                            var skypeButtonVisual = skypeButton.placeholder;

                            expect(skypeButtonVisual.style.width).toEqual(56);
                            expect(skypeButtonVisual.style.height).toEqual(24);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 56x24", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(56);
                            expect(placeholder.style.height).toEqual(24);
                        });
                    });
                });

                describe("when imageSize = large", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "large";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 73x32", function() {
                            var skypeButtonVisual = skypeButton.placeholder;

                            expect(skypeButtonVisual.style.width).toEqual(73);
                            expect(skypeButtonVisual.style.height).toEqual(32);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 73x32", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(73);
                            expect(placeholder.style.height).toEqual(32);
                        });
                    });
                });
            });

            describe("when buttonType = chat", function() {
                beforeEach(function() {
                    initialData.buttonType = "chat";
                });

                describe("when imageSize = small", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "small";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 45x16", function() {
                            var skypeButtonVisual = skypeButton.placeholder;

                            expect(skypeButtonVisual.style.width).toEqual(45);
                            expect(skypeButtonVisual.style.height).toEqual(16);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 45x16", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(45);
                            expect(placeholder.style.height).toEqual(16);
                        });
                    });
                });

                describe("when imageSize = medium", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "medium";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 65x24", function() {
                            var skypeButtonVisual = skypeButton.placeholder;

                            expect(skypeButtonVisual.style.width).toEqual(65);
                            expect(skypeButtonVisual.style.height).toEqual(24);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 65x24", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(65);
                            expect(placeholder.style.height).toEqual(24);
                        });
                    });
                });

                describe("when imageSize = large", function() {
                    beforeEach(function() {
                        initialProperties.imageSize = "large";
                    });

                    describe("when Skype login is not empty", function() {

                        var skypeButton;

                        beforeEach(function() {
                            initialData.skypeName = "echo123";
                            skypeButton = createSkypeCallButton().getSkinProperties();
                        });

                        it("should resize placeholder to 86x32", function() {
                            var skypeButtonVisual = skypeButton.placeholder;

                            expect(skypeButtonVisual.style.width).toEqual(86);
                            expect(skypeButtonVisual.style.height).toEqual(32);
                        });
                    });

                    describe("when Skype login is empty", function() {
                        beforeEach(function() {
                            initialData.skypeName = "";
                        });

                        it("should resize placeholder to 86x32", function() {
                            var placeholder = thePlaceholder();

                            expect(placeholder.style.width).toEqual(86);
                            expect(placeholder.style.height).toEqual(32);
                        });
                    });
                });
            });
        });
    });

        function createSkypeCallButton() {
            var compProps = testUtils.mockFactory.mockProps();
            compProps.setCompData(compProps.siteData.mock.skypeCallButtonData(initialData))
                .setCompProp(compProps.siteData.mock.skypeCallButtonProperties(initialProperties))
                .setSkin("wysiwyg.common.components.skypecallbutton.viewer.skins.SkypeCallButtonSkin");
            compProps.structure.componentType = 'wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton';
            compProps.siteData.santaBase = baseUrl;

            return testUtils.getComponentFromDefinition(skypeCallButton, compProps);
        }

    function thePlaceholder() {
        return createSkypeCallButton().getSkinProperties().placeholder;
    }
});
