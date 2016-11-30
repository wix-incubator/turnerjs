//wysiwyg.viewer.components.EbayItemsBySeller
define(['react', 'core', 'utils', 'reactDOM', 'testUtils', 'definition!components/components/ebayItemsBySeller/ebayItemsBySeller'], function
    (React, /** core */ core, /** utils */ utils, ReactDOM, /** testUtils */ testUtils, ebayItemsBySellerDef) {
    'use strict';
    describe('ebay items by seller', function () {

        var urlUtils = utils.urlUtils;
        var staticUrlObject = {
            'EKServer': '',
            "ai": "aj|kvpqvqlvxwkl",
            "cid": "0",
            "eksize": "1",
            "encode": "UTF-8",
            "endcolor": "FF0000",
            "endtime": "y",
            "fbgcolor": "FFFFFF",
            "fs": '0',
            'hdrsrch': 'n',
            "img": "y",
            "logo": "6",
            "numbid": "n",
            "paypal": "n",
            "popup": "y",
            "prvd": "9",
            "r0": "3",
            "shipcost": "y",
            "sort": "MetaEndSort",
            "sortby": "endtime",
            "sortdir": "asc",
            "srchdesc": "n",
            "title": '',
            "tlecolor": 'FFFFFF',
            "tlefs": "0",
            "tlfcolor": "000000",
            "toolid": "10004",
            "track": "5335838312"
        };
        var getSkinParamMock = function (paramName) {
            return {
                value: {
                    hexString: function () {
                        return '#' + paramName;
                    }
                }
            };
        };
        var iFrameMock;
        var compDef, ebayItemsBySeller, props;

        beforeEach(function () {
            compDef = ebayItemsBySellerDef(React, ReactDOM, core, utils);
            props = testUtils.mockFactory.mockProps().setCompData({
                sellerId: 'someId'
            }).setCompProp({
                headerImage: 'imageUrl'
            });

            props.structure = {
                componentType: 'wysiwyg.viewer.components.EbayItemsBySeller',
                layout: {
                    width: 10,
                    height: 15
                }
            };
            iFrameMock = {
                src: '',
                contentWindow: {
                    document: {
                        write: jasmine.createSpy('documentWrite')
                    }
                }
            };
            spyOn(core.compMixins.skinInfo, 'getParamFromDefaultSkin').and.callFake(getSkinParamMock);
        });

        describe('iFrame creation', function () {
            beforeEach(function () {
                ebayItemsBySeller = testUtils.getComponentFromDefinition(compDef, props);
                spyOn(ReactDOM, 'findDOMNode').and.returnValue({
                    querySelector: function () {
                        return iFrameMock;
                    }
                });
            });
            it('Should not create the iframe if there is no sellerId', function () {
                props.compData.sellerId = undefined;

                var skinProperties = ebayItemsBySeller.getSkinProperties();

                expect(skinProperties.iFrameHolder.children[0]).not.toBeDefined();
            });

            it('Should create the iframe if sellerId is defined', function () {
                var skinProperties = ebayItemsBySeller.getSkinProperties();

                expect(skinProperties.iFrameHolder.children[0]).toBeDefined();
            });

            it('Should not use the iframe src if browser is IE lower than 10', function () {
                props.siteData.getBrowser = function () {
                    return {
                        ie: 'true',
                        version: '9'
                    };
                };

                var skinProperties = ebayItemsBySeller.getSkinProperties();

                expect(skinProperties.iFrameHolder.children[0].props.src).toEqual('');
            });

            it('Should write to the iframe document after render if sellerId is defined and browser is IE lower than 10', function () {
                props.siteData.getBrowser = function () {
                    return {
                        ie: 'true',
                        version: '9'
                    };
                };

                spyOn(ebayItemsBySeller, 'getScriptUrl');

                ebayItemsBySeller.componentWillMount();
                ebayItemsBySeller.componentDidMount();

                expect(iFrameMock.contentWindow.document.write).toHaveBeenCalled();
            });
        });
        describe('creating the script src', function () {
            it('Should return a valid url built from the base url, the static params and the return value of _prepareOptions', function () {
                ebayItemsBySeller = testUtils.getComponentFromDefinition(compDef, props);
                var mockOptions = {
                        someKey: 'someValue'
                    },
                    expected = 'http://lapi.ebay.com/ws/eBayISAPI.dll' + '?' + urlUtils.toQueryString(staticUrlObject) + '&' + urlUtils.toQueryString(mockOptions);
                spyOn(ebayItemsBySeller, '_prepareOptions').and.returnValue(mockOptions);

                var returnedValue = ebayItemsBySeller.getScriptUrl();

                expect(returnedValue).toEqual(expected);
            });


            it('Should create the script options by using the skin params for colors', function () {
                ebayItemsBySeller = testUtils.getComponentFromDefinition(compDef, props);
                var expected = {
                    width: props.structure.layout.width,
                    hdrimage: props.compProp.headerImage,
                    fntcolor: "fontColor",
                    bdrcolor: "borderColor",
                    hdrcolor: "headerColor",
                    tbgcolor: "backgroundColor",
                    lnkcolor: "linkColor",
                    num: Math.floor((props.structure.layout.height - 100) / 70),
                    si: 'someId',
                    sid: 'someId',
                    siteid: 0
                };

                var actual = ebayItemsBySeller._prepareOptions();

                expect(actual).toEqual(expected);
            });
        });

    });
});
