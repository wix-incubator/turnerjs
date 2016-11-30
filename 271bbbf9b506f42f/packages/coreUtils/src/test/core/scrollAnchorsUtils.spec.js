define(['lodash', 'testUtils', 'coreUtils/core/scrollAnchorsUtils'], function(_, testUtils, scrollAnchorsUtils) {
    'use strict';

    var siteData;
    var siteAPI;
    var anchorData;

    function getAnchorData() {
        return {
            id: 'dataItem-someAnchorData',
            compId: 'comp-id'
        };
    }

    function getPageComps(connectionQuery) {
        var compStructure = {
            type: 'Anchor',
                id: 'comp-id',
            dataQuery: 'dataItem-someAnchorData'
        };
        if (connectionQuery) {
            compStructure.connectionQuery = connectionQuery;
        }
        return [compStructure];
    }

    // IMPORTANT: DO NOT rename the file name to .unit.js

    describe('scrollAnchorsUtils spec', function() {
        beforeEach(function() {
            siteData = testUtils.mockFactory
                .mockSiteData()
                .addPageWithDefaults('page-id', getPageComps())
                .setCurrentPage('page-id')
                .addData(getAnchorData(), 'page-id')
                .addMeasureMap({
                    height: {
                        masterPage: window.document.body.scrollHeight,
                        screen: window.document.body.scrollHeight,
                        SITE_HEADER: 20,
                        WIX_ADS: 0
                    },
                    custom: {
                        SITE_HEADER: {
                            isFixedPosition: false
                        }
                    },
                    siteOffsetTop: 0
                });
            siteData.renderFlags = {
                extraSiteHeight: 0
            };
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            anchorData = 'dataItem-someAnchorData';
        });

        describe('When anchor is at the top of the page', function() {
            it('Should return y=0 as the anchor position', function() {
                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition('SCROLL_TO_TOP', siteAPI);

                expect(anchorPosition.y).toEqual(0);
            });

        });

        describe('When anchor is at the bottom of the page', function() {

            beforeEach(function() {
                anchorData = 'SCROLL_TO_BOTTOM';
            });

            describe('When the page is smaller than / equal to the window height', function() {

                it('Should return y=0 as the anchor position if the page and window heights are equal', function() {
                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual(0);
                });

                it('Should return y=0 as the anchor position if the page height is smaller than the window heights', function() {
                    siteData.measureMap.height.masterPage -= 10;

                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual(0);
                });

            });

            describe('When the page is larger than the window', function() {

                it('Should return y=page-window as the anchor position', function() {
                    siteData.measureMap.height.masterPage += 10;

                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual(siteData.measureMap.height.masterPage - siteData.measureMap.height.screen);
                });
            });

            describe('When there is WixAds at the bottom of the page', function() {

                it('Should return y=(page+margin)-window as the anchor position', function() {
                    siteData.measureMap.WIX_ADS = 40;

                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual((siteData.measureMap.height.masterPage + siteData.measureMap.height.WIX_ADS) - siteData.measureMap.height.screen);
                });

            });

            describe('When there is WixAds at the top of the page', function() {

                it('Should return y=(page+mobileAds)-window as the anchor position', function() {
                    siteData.measureMap.WIX_ADS = 30;

                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual((siteData.measureMap.height.masterPage + siteData.measureMap.height.WIX_ADS) - siteData.measureMap.height.screen);
                });

            });
        });

        describe('When anchor is at a specific point', function() {

            describe('When the page is smaller than the window', function() {

                beforeEach(function() {
                    siteData.addMeasureMap({
                        absoluteTop: {
                            'comp-id':  100
                        }
                    });
                });

                it('Should return y=0 as the anchor position if the page and window heights are equal', function() {
                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual(0);
                });

                it('Should return y=0 as the anchor position if the page height is smaller than the window heights', function() {
                    siteData.measureMap.height.masterPage -= 10;

                    var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                    expect(anchorPosition.y).toEqual(0);
                });

            });

            describe('When the page is larger than the window', function() {

                beforeEach(function() {
                    siteData.measureMap.height.masterPage += 100;
                });

                describe('When anchor\'s top is smaller than the difference between the page and the window', function() {

                    it('Should return y=anchorTop as the anchor position', function() {
                        siteData.addMeasureMap({
                            absoluteTop: {
                                'comp-id': 90
                            }
                        });

                        var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                        expect(anchorPosition.y).toEqual(90);
                    });

                });

                describe('When anchor\'s top is larger than the difference between the page and the window', function() {

                    it('Should return y=page-window as the anchor position', function() {
                        siteData.addMeasureMap({
                            absoluteTop: {
                                'comp-id': 110
                            }
                        });

                        var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                        expect(anchorPosition.y).toEqual(siteData.measureMap.height.masterPage - siteData.measureMap.height.screen);
                    });

                });

                describe('And when WIX_ADS rendered on mobile device (siteOffsetTop > 0)', function() {

                    it('Should return anchor.y + siteOffsetTop (WIX_ADS height)', function() {
                        siteData.addMeasureMap({
                            absoluteTop: {
                                'comp-id':  50
                            }
                        });
                        siteData.measureMap.siteOffsetTop = 30;

                        var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                        expect(anchorPosition.y).toEqual(50 + 30);
                    });
                });
            });

        });

        describe('When there is a fixed position header', function() {

            beforeEach(function() {
                siteData.addMeasureMap({
                    top: {
                        'comp-id': 80
                    },
                    absoluteTop: {
                        'comp-id': 80 + siteData.measureMap.height.SITE_HEADER
                    }
                });
                siteData.measureMap.height.masterPage += 200;
            });

            it('Should return the correct y position according to the site header height', function() {
                siteData.measureMap.custom.SITE_HEADER.isFixedPosition = true;

                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                expect(anchorPosition.y).toEqual(80);
            });

            it('Should return correct y position, also when on landing pages (meaning the header is not in the measureMap)', function() {
                siteData.measureMap.custom = {};

                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                expect(anchorPosition.y).toEqual(80 + siteData.measureMap.height.SITE_HEADER);
            });
        });

        describe('When site container has top > 0', function() {

            beforeEach(function() {
                siteData.addMeasureMap({
                    absoluteTop: {
                        'comp-id': 300
                    }
                });
                siteData.measureMap.height.masterPage += 160;
            });

            it('Should return the correct y position according to the site container top', function() {
                siteData.measureMap.siteOffsetTop += 60;

                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);
                var maxScroll = siteData.measureMap.height.masterPage + siteData.measureMap.siteOffsetTop - siteData.measureMap.height.screen;

                expect(anchorPosition.y).toEqual(maxScroll);
            });
        });

        describe('When there is no anchor data (i.e. anchor was deleted)', function() {

            beforeEach(function() {
                anchorData = undefined;
            });

            it('Should scroll to 0 by default', function() {

                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                expect(anchorPosition.y).toEqual(0);
            });
        });

        describe('When there is no anchor data in measure map', function() {

            beforeEach(function() {
                siteData.addMeasureMap({
                    absoluteTop: {
                    }
                });
            });

            it('Should return null active anchor', function() {

                var activeAnchor = scrollAnchorsUtils.getActiveAnchor(siteData, 100);

                expect(activeAnchor).toBe(null);
            });
        });

        describe('When anchor is set dynamically through wixcode', function() {

            beforeEach(function() {
                testUtils.experimentHelper.openExperiments('connectionsData');
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('anchor1')];
                var pageId = 'page-id';
                siteData = testUtils.mockFactory
                    .mockSiteData()
                    .addPageWithDefaults(pageId, getPageComps('connection1'))
                    .setCurrentPage(pageId)
                    .addData(getAnchorData(), pageId)
                    .addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'connection1'), pageId)
                    .addMeasureMap({
                        height: {
                            masterPage: window.document.body.scrollHeight,
                            screen: window.document.body.scrollHeight,
                            SITE_HEADER: 20,
                            WIX_ADS: 0
                        },
                        custom: {
                            SITE_HEADER: {
                                isFixedPosition: false
                            }
                        },
                        siteOffsetTop: 0
                    });
                siteData.renderFlags = {
                    extraSiteHeight: 0
                };
                siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                anchorData = 'anchor1';
            });

            it('Should return anchor by anchor name', function() {

                var anchorPosition = scrollAnchorsUtils.calcAnchorScrollToPosition(anchorData, siteAPI);

                expect(anchorPosition.anchorQuery).toEqual('dataItem-someAnchorData');
            });
        });

        describe('getPageAnchors', function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
            });

            it("should return an empty array when anchor's page have not being loaded", function () {
                var pageAnchors = scrollAnchorsUtils.getPageAnchors(this.siteData, 'differentPage');
                expect(pageAnchors).toEqual([]);
            });

            it('should return SCROLL_TO_TOP if the page exist and has no anchors on it', function () {
                var primaryPageId = this.siteData.getPrimaryPageId();
                var pageAnchors = scrollAnchorsUtils.getPageAnchors(this.siteData, primaryPageId);
                expect(pageAnchors).toEqual([{
                    compId: 'PAGE_TOP_ANCHOR',
                    id: 'SCROLL_TO_TOP',
                    name: '',
                    type: 'Anchor',
                    pageId: primaryPageId
                }]);
            });

            it('should return SCROLL_TO_TOP and the anchors of the page if the page exist', function () {
                var primaryPageId = this.siteData.getPrimaryPageId();
                var anchorComp = testUtils.mockFactory.mockComponent('wysiwyg.common.components.anchor.viewer.Anchor', this.siteData, primaryPageId, {data: testUtils.mockFactory.dataMocks.anchorData({name: 'testName'})});
                var data = this.siteData.getData(anchorComp.dataQuery, primaryPageId);
                data.compId = anchorComp.id;

                var pageAnchors = scrollAnchorsUtils.getPageAnchors(this.siteData, primaryPageId);
                var expected = [{
                    type: 'Anchor',
                    id: 'SCROLL_TO_TOP',
                    compId: 'PAGE_TOP_ANCHOR',
                    name: '',
                    pageId: primaryPageId
                }, {
                    type: 'Anchor',
                    id: data.id,
                    compId: anchorComp.id,
                    name: 'testName'
                }];
                expect(pageAnchors).toEqual(expected);
            });
        });

        it('getAnchor', function() {
            testUtils.experimentHelper.openExperiments('connectionsData');
            var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('anchor1')];
            var pageId = 'page-id';
            siteData = testUtils.mockFactory
                .mockSiteData()
                .addPageWithDefaults(pageId, getPageComps('connection1'))
                .setCurrentPage(pageId)
                .addData(getAnchorData(), pageId)
                .addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'connection1'), pageId);
            var anchor = scrollAnchorsUtils.getAnchor('anchor1', pageId, siteData);
            expect(anchor).toEqual({
                type: 'Anchor',
                id: 'comp-id',
                dataQuery: 'dataItem-someAnchorData',
                connectionQuery: 'connection1'
            });
        });
    });


});
