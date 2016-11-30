define(['lodash', 'testUtils', 'wixappsCore/core/typesConverter'], function (_, testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe("typesConverter", function () {

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
        });

        describe('linkableButton', function () {
            it('no data', function () {
                var actual = typesConverter.linkableButton(undefined, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: '',
                    link: null
                };

                expect(actual).toEqual(expected);
            });

            it('escaped text - unescaped', function () {
                var data = "read more &gt;&gt;";

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "read more >>",
                    link: null
                };

                expect(actual).toEqual(expected);
            });

            it('has only label with escaped text - unescape it', function () {
                var data = {label: "some text &gt;"};

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "some text >",
                    link: null
                };

                expect(actual).toEqual(expected);
            });

            it('data is string', function () {
                var data = "read more";

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "read more",
                    link: null
                };

                expect(actual).toEqual(expected);
            });

            it('has linkId and pageId - id is the link', function () {
                this.siteData.mock.externalLinkData({id: 'link-12'});
                var data = {linkId: "link-12", pageId: "page", label: "some text"};

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "some text",
                    link: this.siteData.getDataByQuery('link-12')
                };

                expect(actual).toEqual(expected);
            });

            it('has only label', function () {
                var data = {label: "some text"};

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "some text",
                    link: null
                };

                expect(actual).toEqual(expected);
            });

            it('has only linkId - id is the link', function () {
                this.siteData.mock.externalLinkData({id: 'link-1'});
                var data = {linkId: "link-1", label: "some text"};

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "some text",
                    link: this.siteData.getDataByQuery('link-1')
                };

                expect(actual).toEqual(expected);
            });

            it('has only pageId - id is the page', function () {
                this.siteData.addPageWithDefaults('pageId-12');
                var data = {pageId: "pageId-12", label: "some text"};

                var actual = typesConverter.linkableButton(data, this.siteData);

                var expected = {
                    type: "LinkableButton",
                    label: "some text",
                    link: {
                        type: 'PageLink',
                        pageId: this.siteData.getDataByQuery('pageId-12')
                    }
                };

                expect(actual).toEqual(expected);
            });
        });

        describe('Icon converter', function () {
            it('icon', function () {
                var data = {src: 'src', width: 50, height: 60, title: 'title'};

                var resolvedData;
                var dataFixer = function dataFixer(iconData) {
                    resolvedData = {src: 'resolvedSrc', width: 100, height: 100, title: iconData.title};
                    return resolvedData;
                };

                var componentData = typesConverter.icon(data, dataFixer, this.siteData.serviceTopology, 'packageName');

                var expected = {type: 'Icon', url: resolvedData.src, width: resolvedData.width, height: resolvedData.height, title: 'title'};

                expect(componentData).toEqual(expected);
            });
        });

        describe('selectableList', function () {
            it('selectableList - null values - only enabled property should be set to true', function () {
                var data = {
                    selectedValue: null,
                    items: [
                        {"value": null, "text": null, "enabled": null, "description": null}
                    ]};

                var selectableList = typesConverter.selectableList(data);

                var expected = {
                    type: 'SelectableList',
                    options: [
                        {type: 'SelectOption', "value": null, "text": null, "disabled": false, "description": null}
                    ],
                    "value": null};

                expect(selectableList).toEqual(expected);
            });

            it('selectableList - has values', function () {
                var expectedDisabledValues = [true, false, false];
                var actual = [false, true, undefined];
                _.forEach(actual, function (enabled, index) {
                    var data = {
                        selectedValue: "val",
                        items: [
                            {"value": "a", "text": "b", "enabled": enabled, "description": "d"}
                        ]
                    };

                    var selectableList = typesConverter.selectableList(data);

                    var expected = {
                        type: 'SelectableList',
                        options: [
                            {type: 'SelectOption', "value": "a", "text": "b", "disabled": expectedDisabledValues[index], "description": "d"}
                        ],
                        "value": "val"
                    };

                    expect(selectableList).toEqual(expected);
                });
            });

            it('selectableList - has values with a function as text property', function () {
                var selectedValue = 'val';
                var data = {
                    selectedValue: selectedValue,
                    items: [
                        {"value": "a", "text": "bbb", "getText": _.identity, "enabled": true, "description": "d"}
                    ]
                };

                var selectableList = typesConverter.selectableList(data);

                expect(selectableList.options[0].text).toEqual(selectedValue);
            });
        });

        describe('link', function () {
            beforeEach(function () {
                this.getDataById = this.siteData.getDataByQuery.bind(this.siteData);
            });

            it('should convert wix:PageLink to PageLink', function () {
                this.siteData.addPageWithDefaults('pageId-1');
                var data = {
                    _type: 'wix:PageLink',
                    linkId: 'testLinkId',
                    pageId: 'pageId-1'
                };

                var expected = {
                    type: 'PageLink',
                    id: 'testLinkId',
                    pageId: this.siteData.getDataByQuery('pageId-1')
                };

                expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
            });

            it('should convert wix:ExternalLink to ExternalLink', function () {
                var protocols = ['http', 'https', 'ftp'];
                var address = 'google.com';
                var targets = ['_blank', undefined];

                var expectedAddress = ['http://google.com', 'https://google.com', 'ftp://google.com'];

                _.forEach(protocols, function (protocol, index) {
                    _.forEach(targets, function (target) {
                        var data = {
                            _type: 'wix:ExternalLink',
                            linkId: 'testLinkId',
                            protocol: protocol,
                            address: address,
                            target: target
                        };

                        var expected = {
                            type: 'ExternalLink',
                            id: 'testLinkId',
                            url: expectedAddress[index],
                            target: target
                        };

                        expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
                    }, this);
                }, this);
            });

            it('should convert wix:PhoneLink to PhoneLink', function () {
                var data = {
                    _type: 'wix:PhoneLink',
                    linkId: 'testLinkId',
                    phoneNumber: '972541111111'
                };

                var expected = {
                    type: 'PhoneLink',
                    id: 'testLinkId',
                    phoneNumber: data.phoneNumber
                };

                expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
            });

            it('should convert wix:MailLink to EmailLink', function () {
                var data = {
                    _type: 'wix:MailLink',
                    linkId: 'testLinkId',
                    email: 'test@wix.com',
                    subject: 'wix:MailLink is my subject'
                };

                var expected = {
                    type: 'EmailLink',
                    id: 'testLinkId',
                    recipient: data.email,
                    subject: data.subject
                };

                expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
            });

            it('should convert wix:DocLink to DocumentLink', function () {
                var data = {
                    _type: 'wix:DocLink',
                    linkId: 'testLinkId',
                    docId: '1234E',
                    docName: 'DocumentLink name'
                };

                var expected = {
                    type: 'DocumentLink',
                    id: 'testLinkId',
                    docId: data.docId,
                    name: data.docName
                };

                expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
            });

            it('should convert wix:AnchorLink to AnchorLink', function () {
                this.siteData.mock.anchorLinkData({id: 'nxa12'});

                var data = {
                    _type: 'wix:AnchorLink',
                    linkId: 'testLinkId',
                    anchorName: 'anchor name',
                    anchorDataId: '#nxa12',
                    pageId: 'masterPage'
                };

                var expected = {
                    type: 'AnchorLink',
                    id: 'testLinkId',
                    anchorName: data.anchorName,
                    anchorDataId: this.siteData.getDataByQuery(data.anchorDataId),
                    pageId: this.siteData.getDataByQuery(data.pageId)
                };

                expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
            });

            it('should convert wix:Link with linkType WEBSITE to ExternalLink', function () {
                var urls = ['http://google.com', 'https://google.com', 'ftp://google.com', 'google.com'];

                _.forEach(urls, function (url) {
                    var data = {
                        _type: 'wix:Link',
                        linkId: 'testLinkId',
                        linkType: 'WEBSITE',
                        href: url
                    };

                    var expected = {
                        type: 'ExternalLink',
                        id: 'testLinkId',
                        url: url,
                        target: undefined
                    };

                    expect(typesConverter.link(data)).toEqual(expected);
                });
            });

            it('should convert wix:Link with relative (i.e. starts with //) url in its href to ExternalLink', function () {
                var urls = ['//google.com', '/google.com', 'google.com'];

                _.forEach(urls, function (url, index) {
                    var data = {
                        _type: 'wix:Link',
                        linkId: 'testLinkId',
                        href: url
                    };

                    var expected;
                    if (index === 0) {
                        expected = {
                            type: 'ExternalLink',
                            id: 'testLinkId',
                            url: url,
                            target: undefined
                        };
                    }

                    expect(typesConverter.link(data)).toEqual(expected);
                });
            });

            it('should convert wix:Link with absolute url in its href to ExternalLink', function () {
                var urls = ['http://google.com', 'HTTP://GOOGLE.COM', 'https://google.com', 'HTTPS://GOOGLE.COM', 'ftp://google.com', 'google.com'];
                var expectedUrls = ['http://google.com', 'HTTP://GOOGLE.COM', 'https://google.com', 'HTTPS://GOOGLE.COM', 'ftp://google.com', undefined];

                _.forEach(urls, function (url, index) {
                    var data = {
                        _type: 'wix:Link',
                        linkId: 'testLinkId',
                        href: url
                    };

                    var expectedUrl = expectedUrls[index];
                    var expected = expectedUrl && {
                        type: 'ExternalLink',
                        id: 'testLinkId',
                        url: expectedUrl,
                        target: undefined
                    };

                    expect(typesConverter.link(data)).toEqual(expected);
                });
            });

            it('should convert wix:Link with pageLink (i.e. starts with #!) href to PageLink', function () {
                var urls = ['#!masterPage', '#!chet3', '!#dfvf1'];
                this.siteData.addPageWithDefaults('chet3');
                this.siteData.addPageWithDefaults('dfvf1');

                _.forEach(urls, function (url, index) {
                    var data = {
                        _type: 'wix:Link',
                        linkId: 'testLinkId',
                        href: url
                    };

                    var expected;
                    if (index !== 2) {
                        expected = {
                            type: 'PageLink',
                            id: 'testLinkId',
                            pageId: this.siteData.getDataByQuery(url.substring(2))
                        };
                    }

                    expect(typesConverter.link(data, this.getDataById)).toEqual(expected);
                }, this);
            });

            it('should convert wix:Link with mailto address to EmailLink', function () {
                var urls = [
                    'mailto:nirn@wix.com',
                    'mailto:nirn@wix.com?subject=this is my subject',
                    'mailto:nirn@wix.com?subject=this is my subject&cc=test@wix.com',
                    'mailto:nirn@wix.com?cc=test@wix.com&subject=this is my subject',
                    'mailto:nirn@wix.com?cc=test@wix.com&subject=this is my subject&bcc=a@wix.com'
                ];

                _.forEach(urls, function (url, index) {
                    var data = {
                        _type: 'wix:Link',
                        linkId: 'testLinkId',
                        href: url
                    };

                    var expected = {
                        type: 'EmailLink',
                        id: 'testLinkId',
                        recipient: 'nirn@wix.com',
                        subject: index !== 0 ? 'this is my subject' : ''
                    };

                    expect(typesConverter.link(data)).toEqual(expected);
                });
            });
        });

        describe('image', function () {

            var PACKAGE_NAME = 'appbuilder';

            it('should not change the data if the image is from wix media', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var src = '8d13be_232af915f9984e0bb5a42dd5382abad8.jpg';
                var width = 700;
                var height = 467;
                var imageData = testUtils.proxyData.createImageData(src, width, height);
                var convertedData = typesConverter.image(imageData, _.identity, siteData.serviceTopology, PACKAGE_NAME);

                var expected = {
                    type: "Image",
                    uri: src,
                    width: width,
                    height: height,
                    title: ''
                };

                expect(convertedData).toEqual(expected);
            });

            it('should add quality to Image. if called with a quality value', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var src = '8d13be_232af915f9984e0bb5a42dd5382abad8.jpg';
                var width = 700;
                var height = 467;
                var imageData = testUtils.proxyData.createImageData(src, width, height);
                var imageQuality = {quality: 90, unsharpMask: {r: 1}};
                var convertedData = typesConverter.image(imageData, _.identity, siteData.serviceTopology, PACKAGE_NAME, imageQuality);
                expect(convertedData.quality).toEqual(imageQuality);
            });

            it('should not add quality to Image data. if called with empty data', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var src = '8d13be_232af915f9984e0bb5a42dd5382abad8.jpg';
                var width = 700;
                var height = 467;
                var imageData = testUtils.proxyData.createImageData(src, width, height);
                var imageQuality = {};
                var convertedData = typesConverter.image(imageData, _.identity, siteData.serviceTopology, PACKAGE_NAME, imageQuality);
                expect(convertedData.quality).toBeUndefined();
            });


            it('should resolve the path of the src according to the dataFixer', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var src = '8d13be_232af915f9984e0bb5a42dd5382abad8.jpg';
                var width = 700;
                var height = 467;
                var imageData = testUtils.proxyData.createImageData(src, width, height);
                var resolvedImage = testUtils.proxyData.createImageData('http://shahar.zur/image.jpg', 500, 500);

                var dataFixer = jasmine.createSpy('pathResolved').and.returnValue(resolvedImage);
                var convertedData = typesConverter.image(imageData, dataFixer, siteData.serviceTopology, PACKAGE_NAME);

                var expected = {
                    type: "Image",
                    uri: resolvedImage.src,
                    width: resolvedImage.width,
                    height: resolvedImage.height,
                    title: ''
                };

                expect(dataFixer).toHaveBeenCalledWith(imageData, siteData.serviceTopology, PACKAGE_NAME);
                expect(convertedData).toEqual(expected);
            });
        });

        describe('text', function () {
            it('should create a valid TextInput data type', function () {
                var data = 'heli - wow';

                var componentData = typesConverter.text(data);

                var expected = {type: 'TextInput', value: data};

                expect(componentData).toEqual(expected);
            });

            it('should unescape the data', function () {
                var originalData = '<div>heli - wow</div>';
                var data = _.escape(originalData);

                var componentData = typesConverter.text(data);

                var expected = {type: 'TextInput', value: originalData};

                expect(componentData).toEqual(expected);
            });

            it('should set maxLength parameter to the maxLength data property', function () {
                var data = 'heli - wow';

                var maxLength = 50;
                var componentData = typesConverter.text(data, maxLength);

                var expected = {type: 'TextInput', value: data, maxLength: maxLength};

                expect(componentData).toEqual(expected);
            });
        });

        describe('numeric', function () {
            it('should create a valid NumericStepper data', function () {
                var data = '7';

                var componentData = typesConverter.numeric(data);

                var expected = {type: 'NumericStepper', value: data};

                expect(componentData).toEqual(expected);
            });
        });
    });

});
