define(['lodash', 'core', 'testUtils', 'linkBar', 'image'],
    function (_, core, /** testUtils */ testUtils, linkBar, image) {
        'use strict';

        describe('LinkBar component', function () {

            var images;

            beforeAll(function () {
                core.compRegistrar.register('wysiwyg.viewer.components.LinkBarItem', linkBar.linkBarItem);
                core.compRegistrar.register('core.components.Image', image);
            });

            function createLinkBarProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(linkBar.linkBar, _.merge({
                    browser: {},
                    compData: {
                        type: 'ImageList',
                        id: 'mock-comp-data'
                    },
                    compProp: {
                        "type": "LinkBarProperties",
                        "gallery": "social_icons",
                        "iconSize": 30,
                        "spacing": 5,
                        "bgScale": 1,
                        "orientation": "HORIZ"
                    },
                    skin: 'wysiwyg.viewer.skins.LinkBarNoBGSkin',
                    structure: {componentType: 'wysiwyg.viewer.components.LinkBar'}
                }, partialProps));
            }

            function createLinkBarComp(numberOfItems, partialProps) {
                partialProps = partialProps || {};
                var dataMocks = testUtils.mockFactory.dataMocks;
                var links = _.times(numberOfItems, dataMocks.externalLinkData());
                images = _.times(numberOfItems, function (i) {
                    return dataMocks.imageData({"link": dataMocks.utils.toRef(links[i])});
                });
                var imageList = dataMocks.imageList({"items": images});
                partialProps.compData = imageList;
                var props = createLinkBarProps(partialProps);
                return testUtils.getComponentFromDefinition(linkBar.linkBar, props);
            }

            function getComponentOneLineLongDimension(numOfIcons, iconSize, spacing) {
                return numOfIcons * (iconSize + spacing) - spacing;
            }

            describe('comp structure and state', function () {

                it('should verify linkBar full tree is rendered with right props', function () {
                    this.linkBarComp = createLinkBarComp(3);
                    var refData = this.linkBarComp.refs;
                    expect(refData).toBeDefined();
                    expect(refData.itemsContainer).toBeDefined();
                    for (var i = 0; i < images.length; i++) {

                        var linkBarItem = refData[images[i].id];
                        expect(linkBarItem.props.compData).toEqual(images[i]);
                        expect(linkBarItem.props.compProp).toEqual(this.linkBarComp.props.compProp);
                        expect(linkBarItem).toBeComponentOfType("wysiwyg.viewer.components.LinkBarItem");

                        var imageRef = linkBarItem.refs.image;
                        expect(imageRef).toBeComponentOfType("core.components.Image");
                        expect(imageRef.props.compData).toEqual(images[i]);
                        expect(imageRef.props.compProp).toEqual(this.linkBarComp.props.compProp);

                        var link = linkBarItem.refs.link;
                        expect(link).toBeDefined();
                    }
                });

                it('should indicate that linkBar rendered in mobile state', function () {
                    var linkBarProps = {
                        isMobileView: true
                    };

                    this.linkBarComp = createLinkBarComp(3, linkBarProps);
                    expect(this.linkBarComp.state.$mobile).toEqual("mobileView");
                });

                it('should indicate that  linkBar rendered in desktop state', function () {
                    var linkBarProps = {
                        isMobileView: false
                    };
                    this.linkBarComp = createLinkBarComp(3, linkBarProps);
                    expect(this.linkBarComp.state).toEqual({});
                });
            });

            describe('component size in mobile view', function () {

                describe('horizontal orientation', function () {

                    it('should calculate component size when items fit in a single line up to 300px width', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "HORIZ"
                            },
                            isMobileView: true
                        };

                        this.linkBarComp = createLinkBarComp(3, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        var expectedWidth = getComponentOneLineLongDimension(images.length,
                            this.linkBarComp.props.compProp.iconSize,
                            this.linkBarComp.props.compProp.spacing);
                        expect(refData[""].style.width).toEqual(expectedWidth);
                        expect(refData[""].style.height).toEqual(this.linkBarComp.props.compProp.iconSize);
                    });

                    it('should limit width to 300px, and break icons to additional lines', function () {
                        // adding 13 lines, with iconSize 40 and spacing 10.
                        // should fit 6 icons in one 300px line
                        // and display icons in 3 lines
                        var linkBarProps = {
                            compProp: {
                                "orientation": "HORIZ",
                                iconSize: 40,
                                spacing: 10
                            },
                            isMobileView: true
                        };

                        this.linkBarComp = createLinkBarComp(13, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        expect(refData[""].style.width).toEqual(300);
                        expect(refData[""].style.height).toEqual(this.linkBarComp.props.compProp.iconSize * 3);
                    });

                    it('should have a default size of {width: 5, height: iconSize} if it has no items', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "HORIZ"
                            },
                            isMobileView: true
                        };

                        this.linkBarComp = createLinkBarComp(0, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        expect(refData[""].style.width).toEqual(5);
                        expect(refData[""].style.height).toEqual(this.linkBarComp.props.compProp.iconSize);
                    });

                });

                describe('vertical orientation', function () {

                    it('should calculate component size right', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "VERT"
                            },
                            isMobileView: true
                        };

                        var numOfImagesInLinkBar = 7;

                        this.linkBarComp = createLinkBarComp(numOfImagesInLinkBar, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();
                        var expectedHeight = getComponentOneLineLongDimension(numOfImagesInLinkBar,
                            this.linkBarComp.props.compProp.iconSize,
                            this.linkBarComp.props.compProp.spacing);

                        expect(refData[""].style.width).toEqual(this.linkBarComp.props.compProp.iconSize);
                        expect(refData[""].style.height).toEqual(expectedHeight);
                    });
                });

            });

            describe('component size in desktop view', function () {

                describe('horizontal orientation', function () {

                    it('should calculate component size when items fit in a single line up to 300px width', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "HORIZ"
                            },
                            isMobileView: false
                        };

                        var numOfImagesInLinkBar = 3;
                        this.linkBarComp = createLinkBarComp(numOfImagesInLinkBar, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        var expectedWidth = getComponentOneLineLongDimension(numOfImagesInLinkBar,
                            this.linkBarComp.props.compProp.iconSize,
                            this.linkBarComp.props.compProp.spacing);
                        expect(refData[""].style.width).toEqual(expectedWidth);
                        expect(refData[""].style.height).toEqual(this.linkBarComp.props.compProp.iconSize);
                    });

                    it('should not limit width to 300px and break icons to additional lines', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "HORIZ",
                                iconSize: 40,
                                spacing: 10
                            },
                            isMobileView: false
                        };

                        var numOfImagesInLinkBar = 13;
                        this.linkBarComp = createLinkBarComp(numOfImagesInLinkBar, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        var expectedWidth = getComponentOneLineLongDimension(numOfImagesInLinkBar,
                            this.linkBarComp.props.compProp.iconSize,
                            this.linkBarComp.props.compProp.spacing);
                        expect(refData[""].style.width).toEqual(expectedWidth);
                        expect(refData[""].style.height).toEqual(this.linkBarComp.props.compProp.iconSize);
                    });

                });

                describe('vertical orientation', function () {

                    it('should calculate component size right', function () {
                        var linkBarProps = {
                            compProp: {
                                "orientation": "VERT"
                            },
                            isMobileView: false
                        };
                        var numOfImagesInLinkBar = 7;

                        this.linkBarComp = createLinkBarComp(numOfImagesInLinkBar, linkBarProps);
                        var refData = this.linkBarComp.getSkinProperties();

                        var expectedHeight = getComponentOneLineLongDimension(numOfImagesInLinkBar,
                            this.linkBarComp.props.compProp.iconSize,
                            this.linkBarComp.props.compProp.spacing);


                        expect(refData[""].style.width).toEqual(this.linkBarComp.props.compProp.iconSize);
                        expect(refData[""].style.height).toEqual(expectedHeight);
                    });
                });

            });
        });
    });
