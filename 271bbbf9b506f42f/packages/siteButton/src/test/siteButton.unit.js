define(['lodash', 'testUtils', 'siteButton'],
    function (_, /** testUtils */testUtils, siteButton) {
        'use strict';

        describe('SiteButton component', function () {

            function createButtonProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(siteButton, _.merge({
                    compData: {
                        type: 'LinkableButton',
                        label: 'MY BUTTON',
                        link: null,
                        id: 'data'
                    },
                    compProp: {
                        type: 'ButtonProperties',
                        id: 'props',
                        align: "center",
                        isDisabled: false
                    },
                    style: {
                        width: 500,
                        height: 500
                    },
                    skin: 'wysiwyg.viewer.skins.button.SiteButtonSkin',
                    structure: {
                        layout: {
                            scale: 2
                        }
                    },
                    compTheme: {
                        style: {
                            properties: {
                                fnt: 'font_0'
                            }
                        }
                    },
                    fontsMap: [
                        'normal normal normal 120px/1.4em Open+Sans {color_14}'
                    ]
                }, partialProps));
            }

            function createButtonComp(partialProps) {
                var props = createButtonProps(partialProps);
                return testUtils.getComponentFromDefinition(siteButton, props);
            }

            it('should have SPIDER PIG label and not have link by default', function () {
                var siteButtonComp = createButtonComp({
                    compData: {
                        label: 'SPIDER PIG'
                    }
                });

                var skinProperties = siteButtonComp.getSkinProperties();
                expect(skinProperties.label.children).toEqual(['SPIDER PIG']);
                expect(testUtils.getStyleObject(siteButtonComp.refs.label)).toEqual({});
                expect(siteButtonComp.refs.link.tagName).toEqual('DIV');
            });

            it('should have an anchor element when data contains link', function () {
                var link = testUtils.mockFactory.dataMocks.externalLinkData();
                var partialProps = {
                    compData: {
                        link: link
                    }
                };

                var siteButtonComp = createButtonComp(partialProps);
                var skinProperties = siteButtonComp.getSkinProperties();

                expect(skinProperties.link.href).toEqual(link.url);
                expect(siteButtonComp.refs.link.tagName).toEqual('A');
            });

            it('should set font-size when viewing on mobile device', function () {
                var partialProps = {
                    isMobileView: true,
                    structure: {
                        layout: {
                            scale: 3
                        }
                    },
                    getFont: function () {
                        return 'normal normal normal 120px/1.4em Open+Sans {color_14}';
                    }
                };
                var siteButtonComp = createButtonComp(partialProps);

                expect(testUtils.getStyleObject(siteButtonComp.refs.label)).toEqual({
                    'fontSize': 150 + 'px'
                });
            });

            describe('alignment', function() {

                it('should be aligned left', function () {
                    var partialProps = {
                        compProp: {
                            align: 'left',
                            margin: 10
                        }
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    expect(testUtils.getStyleObject(siteButtonComp.refs.label)).toEqual({
                        "marginLeft": partialProps.compProp.margin + 'px'
                    });
                });

                it('should be aligned right', function () {
                    var partialProps = {
                        compProp: {
                            align: 'right',
                            margin: 12
                        }
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    expect(testUtils.getStyleObject(siteButtonComp.refs.label)).toEqual({
                        "marginRight": partialProps.compProp.margin + 'px'
                    });
                });

                it('should be aligned center', function () {
                    var partialProps = {
                        compProp: {
                            align: 'center',
                            margin: 11
                        }
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    expect(testUtils.getStyleObject(siteButtonComp.refs.label)).toEqual({});
                });

            });


            describe('onClick event handler', function () {

                it('should add an onClick handler if props.onClick is a function', function () {
                    var onClickHandler = _.noop;
                    var siteButtonComp = createButtonComp({
                        onClick: onClickHandler
                    });

                    var skinProperties = siteButtonComp.getSkinProperties();

                    expect(skinProperties[''].onClick).toBe(onClickHandler);
                });

                it('should not add an onClick handler if props.onClick is function and the component is disabled', function () {
                    var onClickHandler = _.noop;
                    var siteButtonComp = createButtonComp({
                        onClick: onClickHandler,
                        compProp: {
                            isDisabled: true
                        }
                    });

                    var skinProperties = siteButtonComp.getSkinProperties();

                    expect(skinProperties[''].onClick).not.toBeDefined();
                });

                it('should not add an onClick handler if props.onClick is not function', function () {
                    var siteButtonComp = createButtonComp();

                    var skinProperties = siteButtonComp.getSkinProperties();

                    expect(skinProperties[''].onClick).not.toBeDefined();
                });

            });

            describe("link auto-generation", function(){
                it("should link unlinked button to whatever phone, email or url that is written on it", function () {
                    var partialProps = {
                        compData: {
                            label: "054 111 2222"
                        },
                        isMobileView: true
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    var skinProperties = siteButtonComp.getSkinProperties();
                    expect(skinProperties.link.href).toBe("tel:0541112222");
                });

                it("should not change already linked buttons", function () {
                    var link = testUtils.mockFactory.dataMocks.externalLinkData();
                    var partialProps = {
                        compData: {
                            label: "054 111 2222",
                            link: link
                        },
                        isMobileView: true
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    var skinProperties = siteButtonComp.getSkinProperties();
                    expect(skinProperties.link.href).toBe(link.url);
                });

                it("should not auto generated phone links if not in mobile view", function () {
                    var partialProps = {
                        compData: {
                            label: "054 111 2222"
                        }
                    };

                    var siteButtonComp = createButtonComp(partialProps);
                    var skinProperties = siteButtonComp.getSkinProperties();
                    expect(skinProperties.link.href).toBeUndefined();
                });
            });
        });
    });
