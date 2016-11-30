define(['lodash', 'layout/util/reduceDistancesAlgorithm/minHeightDataUtils'], function (_, minHeightDataUtils) {
    'use strict';

    describe('minHeightDataUtils', function () {

        function isMinHeightDataEqual(minHeightData, minHeightDataToCompare) {
            return (minHeightDataToCompare.absoluteHeight === minHeightData.absoluteHeight &&
            minHeightDataToCompare.topPercents === minHeightData.topPercents &&
            minHeightDataToCompare.bottomPercents === minHeightData.bottomPercents);
        }

        function isMinHeightsDataEqual(minHeightsData, minHeightsDataToCompare){
            if (minHeightsData.length !== minHeightsDataToCompare.length){
                return false;
            }

            var i;
            for (i = 0; i < minHeightsData.length; i++){
                if (!isMinHeightDataEqual(minHeightsData[i], minHeightsDataToCompare[i])){
                    return false;
                }
            }

            return true;
        }

        describe('MinHeightData', function(){
            describe('createMinHeightData', function(){
                it('should return object with the given absoluteHeight, topPercents, bottomPercents', function(){
                    var absoluteHeight = 100, topPercents = 10, bottomPercents = 10;
                    var result = minHeightDataUtils.createMinHeightData(absoluteHeight, topPercents, bottomPercents);

                    expect(result.absoluteHeight).toEqual(absoluteHeight);
                    expect(result.topPercents).toEqual(topPercents);
                    expect(result.bottomPercents).toEqual(bottomPercents);
                });

                it('absoluteHeight value should be 0 if absoluteHeight parameter is undefined', function(){
                    var absoluteHeight, topPercents = 10, bottomPercents = 10;
                    var result = minHeightDataUtils.createMinHeightData(absoluteHeight, topPercents, bottomPercents);

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.topPercents).toEqual(topPercents);
                    expect(result.bottomPercents).toEqual(bottomPercents);
                });

                it('should get default minHeightData if no parameters sent', function(){
                    var result = minHeightDataUtils.createMinHeightData();

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.topPercents).not.toBeDefined();
                    expect(result.bottomPercents).not.toBeDefined();
                });

                it('topPercents should be undefined if topPercents parameter is undefined', function(){
                    var absoluteHeight = 100, topPercents, bottomPercents = 10;
                    var result = minHeightDataUtils.createMinHeightData(absoluteHeight, topPercents, bottomPercents);

                    expect(result.topPercents).not.toBeDefined();
                });

                it('bottomPercents should be undefined if bottomPercents parameter is undefined', function(){
                    var absoluteHeight = 100, topPercents = 10, bottomPercents;
                    var result = minHeightDataUtils.createMinHeightData(absoluteHeight, topPercents, bottomPercents);

                    expect(result.bottomPercents).not.toBeDefined();
                });
            });

            describe('createMinHeightDataForDockedTopData', function(){
                it('should return minHeightData object: absoluteHeight should be equal to dockData.px and topPercents should be equal to dockData.pct', function(){
                    var dockTopData = {px: 20, pct: 10};
                    var result = minHeightDataUtils.createMinHeightDataForDockedTopData(dockTopData);

                    expect(result.absoluteHeight).toEqual(dockTopData.px);
                    expect(result.topPercents).toEqual(dockTopData.pct);
                });

                it('topPercents should be undefined if dockData.pct is undefined', function(){
                    var dockTopData = {px: 20};
                    var result = minHeightDataUtils.createMinHeightDataForDockedTopData(dockTopData);

                    expect(result.absoluteHeight).toEqual(dockTopData.px);
                    expect(result.topPercents).not.toBeDefined();
                });

                it('absoluteHeight should be 0 if dockData.px is undefined', function(){
                    var dockTopData = {pct: 10};
                    var result = minHeightDataUtils.createMinHeightDataForDockedTopData(dockTopData);

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.topPercents).toEqual(dockTopData.pct);
                });
            });

            describe('createMinHeightDataForDockedBottomData', function(){
                it('should return minHeightData object: absoluteHeight should be equal to dockData.px and bottomPercents should be equal to dockData.pct', function(){
                    var dockBottomData = {px: 20, pct: 10};
                    var result = minHeightDataUtils.createMinHeightDataForDockedBottomData(dockBottomData);

                    expect(result.absoluteHeight).toEqual(dockBottomData.px);
                    expect(result.bottomPercents).toEqual(dockBottomData.pct);
                });

                it('bottomPercents should be undefined if dockData.pct is undefined', function(){
                    var dockBottomData = {px: 20};
                    var result = minHeightDataUtils.createMinHeightDataForDockedBottomData(dockBottomData);

                    expect(result.absoluteHeight).toEqual(dockBottomData.px);
                    expect(result.bottomPercents).not.toBeDefined();
                });

                it('absoluteHeight should be 0 if dockData.px is undefined', function(){
                    var dockBottomData = {pct: 10};
                    var result = minHeightDataUtils.createMinHeightDataForDockedBottomData(dockBottomData);

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.bottomPercents).toEqual(dockBottomData.pct);
                });
            });

            describe('createMinHeightDataForVerticallyCenteredDockedData', function(){
                it('minHeightData absoluteHeight should equal 0 if dockData.px is undefined', function(){
                    var dockedCenterData = {pct: 20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.absoluteHeight).toEqual(0);
                });

                it('minHeightData absoluteHeight should equal to absolute value of dockData.px * 2', function(){
                    var dockedCenterData = {px: -20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.absoluteHeight).toEqual(40);
                });

                it('bottomPercents and topPercents should be undefined if dockData.pct is undefined', function(){
                    var dockedCenterData = {px: 20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.topPercents).not.toBeDefined();
                    expect(result.bottomPercents).not.toBeDefined();
                });

                it('when dock data has negative pct value bottomPercents should equal to the absolute value * 2', function(){
                    var dockedCenterData = {pct: -20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.bottomPercents).toEqual(40);
                });

                it('when dock data has positive pct value topPercents should equal to the value * 2', function(){
                    var dockedCenterData = {pct: 20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.topPercents).toEqual(40);
                });

                it('when dock data has pct and absolute value should return absoluteHeight and topPercents', function(){
                    var dockedCenterData = {px: 20, pct: 20};
                    var result = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(dockedCenterData);

                    expect(result.absoluteHeight).toEqual(40);
                    expect(result.topPercents).toEqual(40);
                });
            });

            describe('clone', function(){
                it('should create new object', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 20, 30);

                    var result = minHeightData.clone();

                    var isSameObj = (minHeightData === result);

                    expect(isSameObj).toBeFalsy();
                });

                it('should copy all the properties to the new object', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 20, 30);

                    var result = minHeightData.clone();

                    expect(isMinHeightDataEqual(minHeightData, result)).toBeTruthy();
                });
            });

            describe('addAbsoluteHeight', function(){
                it('should add the given absolute height to absoluteHeight property', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10);
                    minHeightData.addAbsoluteHeight(20);

                    expect(minHeightData.absoluteHeight).toEqual(30);
                });
            });

            describe('addMinHeightData', function(){
                it('should merge all properties', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 20, 30);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, 20, 30);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.absoluteHeight).toEqual(20);
                    expect(minHeightData.topPercents).toEqual(40);
                    expect(minHeightData.bottomPercents).toEqual(60);
                });

                it('topPercents should be undefined when topPercents is undefined in both minHeightData', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, null, 10);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, null, 10);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.topPercents).not.toBeDefined();
                });

                it('when topPercents defined only in first object should be equal to this topPercents value', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 20, 10);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, null, 10);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.topPercents).toEqual(20);
                });

                it('when topPercents defined only in second object should be equal to this topPercents value', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, null, 10);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, 20, 10);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.topPercents).toEqual(20);
                });

                it('bottomPercents should be undefined when bottomPercents is undefined in both minHeightData', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 10, null);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, 10, null);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.bottomPercents).not.toBeDefined();
                });

                it('when bottomPercents defined only in first object should be equal to this bottomPercents value', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 10, 20);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, 10, null);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.bottomPercents).toEqual(20);
                });

                it('when bottomPercents defined only in second object should be equal to this bottomPercents value', function(){
                    var minHeightData = minHeightDataUtils.createMinHeightData(10, 10, null);
                    var minHeightDataToAdd = minHeightDataUtils.createMinHeightData(10, 10, 20);

                    minHeightData.addMinHeightData(minHeightDataToAdd);

                    expect(minHeightData.bottomPercents).toEqual(20);
                });
            });
        });

        describe('ChainMinHeightData', function(){
            describe('createChainMinHeightData', function(){
                it('should return default chainMinHeightData if the given minHeightsData is undefined', function(){
                    var result = minHeightDataUtils.createChainMinHeightData();

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.dynamicHeights).toEqual([]);
                });

                it('should return default chainMinHeightData if the given minHeightsData is empty', function(){
                    var result = minHeightDataUtils.createChainMinHeightData([]);

                    expect(result.absoluteHeight).toEqual(0);
                    expect(result.dynamicHeights).toEqual([]);
                });

                describe('absoluteHeight', function(){
                    it('should be equal to maximum of all the absolute minHeightData', function(){
                        var absoluteMinHeightsData = [
                            minHeightDataUtils.createMinHeightData(10),
                            minHeightDataUtils.createMinHeightData(20),
                            minHeightDataUtils.createMinHeightData(30),
                            minHeightDataUtils.createMinHeightData(40)
                        ];

                        var result = minHeightDataUtils.createChainMinHeightData(absoluteMinHeightsData);

                        expect(result.absoluteHeight).toEqual(40);
                    });

                    it('should be null if all minHeightsData is dynamic', function(){
                        var dynamicMinHeightsData = [
                            minHeightDataUtils.createMinHeightData(10, 10),
                            minHeightDataUtils.createMinHeightData(20, 20),
                            minHeightDataUtils.createMinHeightData(30, 30),
                            minHeightDataUtils.createMinHeightData(40, 40)
                        ];

                        var result = minHeightDataUtils.createChainMinHeightData(dynamicMinHeightsData);

                        expect(result.absoluteHeight).toEqual(0);
                    });
                });

                describe('dynamicHeights', function(){
                    it('should be empty if all minHeightsData are absolute', function(){
                        var absoluteMinHeightsData = [
                            minHeightDataUtils.createMinHeightData(10),
                            minHeightDataUtils.createMinHeightData(20),
                            minHeightDataUtils.createMinHeightData(30),
                            minHeightDataUtils.createMinHeightData(40)
                        ];

                        var result = minHeightDataUtils.createChainMinHeightData(absoluteMinHeightsData);

                        expect(result.dynamicHeights.length).toEqual(0);
                    });

                    it('should contain all the dynamic minHeightsData', function(){
                        var abdMinHeightData1 = minHeightDataUtils.createMinHeightData(10),
                            abdMinHeightData2 = minHeightDataUtils.createMinHeightData(20),
                            dynMinHeightData1 = minHeightDataUtils.createMinHeightData(30, 30),
                            dynMinHeightData2 = minHeightDataUtils.createMinHeightData(40, 40);

                        var minHeightsData = [abdMinHeightData1, abdMinHeightData2, dynMinHeightData1, dynMinHeightData2];

                        var result = minHeightDataUtils.createChainMinHeightData(minHeightsData);

                        expect(result.dynamicHeights.length).toEqual(2);
                        expect(_.includes(result.dynamicHeights, dynMinHeightData1)).toBeTruthy();
                        expect(_.includes(result.dynamicHeights, dynMinHeightData2)).toBeTruthy();
                    });
                });
            });

            describe('merge', function(){

                var abdMinHeightData1, abdMinHeightData2, abdMinHeightData3,
                    dynMinHeightData1, dynMinHeightData2, dynMinHeightData3, dynMinHeightData4;

                beforeEach(function(){
                    abdMinHeightData1 = minHeightDataUtils.createMinHeightData(10);
                    abdMinHeightData2 = minHeightDataUtils.createMinHeightData(20);
                    abdMinHeightData3 = minHeightDataUtils.createMinHeightData(30);
                    dynMinHeightData1 = minHeightDataUtils.createMinHeightData(30, 30);
                    dynMinHeightData2 = minHeightDataUtils.createMinHeightData(40, 40);
                    dynMinHeightData3 = minHeightDataUtils.createMinHeightData(50, 50);
                    dynMinHeightData4 = minHeightDataUtils.createMinHeightData(60, 60);

                });

                it('should concat the dynamicHeights arrays', function(){
                    var minHeightsData1 = [abdMinHeightData1, abdMinHeightData2, dynMinHeightData1, dynMinHeightData2];
                    var minHeightsData2 = [abdMinHeightData3, dynMinHeightData3, dynMinHeightData4];

                    var firstChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData1);
                    var secondChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData2);

                    firstChainMinHeightData.merge(secondChainMinHeightData);

                    var allDynamicHeights = [dynMinHeightData1, dynMinHeightData2, dynMinHeightData3, dynMinHeightData4];
                    expect(isMinHeightsDataEqual(firstChainMinHeightData.dynamicHeights, allDynamicHeights)).toBeTruthy();
                });

                it('absoluteHeight should be the maximum', function(){
                    var minHeightsData1 = [abdMinHeightData1, abdMinHeightData2, dynMinHeightData1, dynMinHeightData2];
                    var minHeightsData2 = [abdMinHeightData3, dynMinHeightData3, dynMinHeightData4];

                    var firstChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData1);
                    var secondChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData2);

                    firstChainMinHeightData.merge(secondChainMinHeightData);

                    expect(firstChainMinHeightData.absoluteHeight).toEqual(30);
                });

                it('absoluteHeight should be null if there are no absolute height chains', function(){
                    var minHeightsData1 = [dynMinHeightData1, dynMinHeightData2];
                    var minHeightsData2 = [dynMinHeightData3, dynMinHeightData4];

                    var firstChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData1);
                    var secondChainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightsData2);

                    firstChainMinHeightData.merge(secondChainMinHeightData);

                    expect(firstChainMinHeightData.absoluteHeight).toEqual(0);
                });
            });

            describe('solve', function(){
                it('should return the absoluteHeight if dynamicHeights is empty', function(){
                    var absoluteOnlyMinHeightData = [
                        minHeightDataUtils.createMinHeightData(10),
                        minHeightDataUtils.createMinHeightData(20),
                        minHeightDataUtils.createMinHeightData(30)
                    ];

                    var chainMinHeightData = minHeightDataUtils.createChainMinHeightData(absoluteOnlyMinHeightData);
                    var result = chainMinHeightData.solve();

                    expect(result).toEqual(30);
                });

                it('when all chains are dynamic - should return the maximum between all of the dynamic chains in px round upward', function(){
                    var dynamicOnlyMinHeightData = [
                        minHeightDataUtils.createMinHeightData(150, 10, 10), // px min height -> 187.5
                        minHeightDataUtils.createMinHeightData(120, 15, 15), // px min height -> 171.42
                        minHeightDataUtils.createMinHeightData(100, 20, 20)  // px min height -> 166.66
                    ];
                    var chainMinHeightData = minHeightDataUtils.createChainMinHeightData(dynamicOnlyMinHeightData);
                    var result = chainMinHeightData.solve();

                    expect(result).toEqual(188);
                });

                it('should return the absoluteHeight if is bigger then all dynamic heights', function(){
                    var minHeightData = [
                        minHeightDataUtils.createMinHeightData(200),
                        minHeightDataUtils.createMinHeightData(150, 10, 10), // px min height -> 187.5
                        minHeightDataUtils.createMinHeightData(120, 15, 15), // px min height -> 171.42
                        minHeightDataUtils.createMinHeightData(100, 20, 20)  // px min height -> 166.66
                    ];
                    var chainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightData);

                    var result = chainMinHeightData.solve();

                    expect(result).toEqual(200);
                });

                it('should return the max dynamic height if is bigger then absoluteHeight', function(){
                    var minHeightData = [
                        minHeightDataUtils.createMinHeightData(160),
                        minHeightDataUtils.createMinHeightData(150, 10, 10), // px min height -> 187.5
                        minHeightDataUtils.createMinHeightData(120, 15, 15), // px min height -> 171.42
                        minHeightDataUtils.createMinHeightData(100, 20, 20)  // px min height -> 166.66
                    ];
                    var chainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightData);

                    var result = chainMinHeightData.solve();

                    expect(result).toEqual(188);
                });

                it('should add the added pixels caused by rounding the percents value', function(){
                    var minHeightData = [
                        minHeightDataUtils.createMinHeightData(301),
                        minHeightDataUtils.createMinHeightData(162, 23, 23) // px min height -> 300
                    ];
                    var chainMinHeightData = minHeightDataUtils.createChainMinHeightData(minHeightData);

                    var result = chainMinHeightData.solve();

                    // min height from chains = 301

                    // checking dynamic chain rounding effects
                    // 70  - top percents to px = 301 * 0.23 = 69.23
                    // 162 - abs height
                    // 70  - bottom percents to px = 301 * 0.23 = 69.23
                    // 302 - min height = 70 + 162 + 70
                    expect(result).toEqual(302);
                });
            });
        });
    });
});
