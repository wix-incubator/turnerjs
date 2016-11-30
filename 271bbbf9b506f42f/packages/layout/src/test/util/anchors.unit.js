define(['lodash', 'testUtils', 'layout/util/anchors'], function (_, testUtils, anchors) {
    'use strict';


    var mockedStructure = {
        id: "Page",
        children: [],
        layout: {x: 0, y: 0, width: 980, height: 600, anchors: []}
    };

    var anchorsMap;
    var isMobileView = false;

    function mockComp(id, y, height, anchs, children) {
        var res = {
            id: id,
            children: children ? children : [],
            layout: {x: 0, y: y, height: height, rotationInDegrees: 0}
        };

        return res;
    }

    function mockAnchor(type, target, distance, locked, originalValue, topTop) {
        return {
            distance: distance,
            type: type,
            targetComponent: target,
            locked: !!locked,
            originalValue: originalValue ? originalValue : distance,
            topToTop: topTop || 0
        };
    }

    describe('anchors', function () {
        beforeEach(function () {
            anchorsMap = {};
            testUtils.experimentHelper.openExperiments('viewerGeneratedAnchors', 'removeJsonAnchors');
        });

        describe("without anchors", function () {
            it("should not change currentY of the comps if the comps don't resize", function () {
                var structure = _.cloneDeep(mockedStructure);
                structure.children.push(mockComp("a", 100, 150));
                structure.children.push(mockComp("b", 260, 50));
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {a: 150, b: 50, "Page": 600}
                });

                anchors.enforceAnchors(structure, measureMap, anchorsMap, isMobileView);

                expect(measureMap.top).toEqual({"a": 100, "b": 260, "Page": 0});
                expect(measureMap.height).toEqual({"a": 150, "b": 50, "Page": 600});
            });

            it("should not change currentY of the comps if the comps do resize", function () {
                var structure = _.cloneDeep(mockedStructure);
                structure.children.push(mockComp("a", 100, 150));
                structure.children.push(mockComp("b", 260, 50));
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {a: 220, b: 50, "Page": 600}
                });

                anchors.enforceAnchors(structure, measureMap, anchorsMap, isMobileView);

                expect(measureMap.top).toEqual({"a": 100, "b": 260, "Page": 0});
                expect(measureMap.height).toEqual({"a": 220, "b": 50, "Page": 600});
            });
        });

        function getStructureAndMeasureForTopTop(anchor, pushedOriginalTop, gapBetweenTops) {
            var pusherTop = pushedOriginalTop - gapBetweenTops;
            var structure = _.cloneDeep(mockedStructure);
            structure.children = [
                mockComp("pushed", pushedOriginalTop, 50),
                mockComp("pusher", pusherTop, 50)
            ];

            anchorsMap.pusher = [anchor];

            return {
                structure: structure,
                heights: {"Page": 600, "pushed": 50, "pusher": 50},
                tops: {"Page": 0, "pushed": pushedOriginalTop, "pusher": pusherTop}
            };
        }

        function getStructureAndMeasureForBottomTop(anchor, pushedOriginalTop, gapBottomTop) {
            var pusherHeight = 10;
            var pusherTop = pushedOriginalTop - gapBottomTop - pusherHeight;
            var structure = _.cloneDeep(mockedStructure);
            structure.children = [
                mockComp("pushed", pushedOriginalTop, 50),
                mockComp("pusher", pusherTop, pusherHeight)
            ];

            anchorsMap.pusher = [anchor];

            return {
                structure: structure,
                heights: {"Page": 600, "pushed": 50, "pusher": pusherHeight},
                tops: {"Page": 0, "pushed": pushedOriginalTop, "pusher": pusherTop},
                anchorsMap: anchorsMap
            };
        }

        function getStructureAndMeasureForBottomParent(anchor, pushedOriginalHeight, gapBetweenBottoms) {
            var pusherTop = 10;
            var structure = _.cloneDeep(mockedStructure);
            structure.children = [mockComp("pushed", 0, pushedOriginalHeight, null, [mockComp("pusher", pusherTop, pusherHeight)])];
            anchorsMap.pusher = [anchor];
            anchorsMap.pushed = [];

            var pusherHeight = pushedOriginalHeight - pusherTop - gapBetweenBottoms;
            return {
                structure: structure,
                heights: {"Page": 600, "pushed": pushedOriginalHeight, "pusher": pusherHeight},
                tops: {"Page": 0, "pushed": 0, "pusher": pusherTop}
            };
        }

        function getStructureAndMeasureForBottomBottom(anchor, pushedOriginalHeight, gapBetweenBottoms) {
            var pusherTop = 40;
            var pushedTop = 20;
            var structure = _.cloneDeep(mockedStructure);
            structure.children = [
                mockComp("pushed", pushedTop, pushedOriginalHeight),
                mockComp("pusher", pusherTop, pusherHeight)
            ];
            anchorsMap.pusher = [anchor];
            var pusherHeight = pushedOriginalHeight + pushedTop - pusherTop - gapBetweenBottoms;
            return {
                structure: structure,
                heights: {"Page": 600, "pushed": pushedOriginalHeight, "pusher": pusherHeight},
                tops: {"Page": 0, "pushed": pushedTop, "pusher": pusherTop}
            };
        }

        function getStructureAndMeasures(anchor, pushedOriginal, gap) {
            switch (anchor.type) {
                case "BOTTOM_PARENT":
                    return getStructureAndMeasureForBottomParent(anchor, pushedOriginal, gap);
                case "BOTTOM_BOTTOM":
                    return getStructureAndMeasureForBottomBottom(anchor, pushedOriginal, gap);
                case "BOTTOM_TOP":
                    return getStructureAndMeasureForBottomTop(anchor, pushedOriginal, gap);
                case "TOP_TOP":
                    return getStructureAndMeasureForTopTop(anchor, pushedOriginal, gap);
            }
        }

        function getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, changedValue) {
            var expected = {
                heights: _.clone(structureAndMeasure.heights),
                tops: _.clone(structureAndMeasure.tops)
            };
            if (anchorType === "BOTTOM_TOP" || anchorType === "TOP_TOP") {
                expected.tops.pushed = changedValue;
            } else {
                expected.heights.pushed = changedValue;
            }
            return expected;
        }


        function testResults(structureAndMeasure, expected) {
            var measureMap = testUtils.mockFactory.createBlankMeasureMap(_.defaults(
                {height: _.clone(structureAndMeasure.heights)},
                structureAndMeasure.measureMap
            ));
            var flatStructure = anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView);

            expect(measureMap.height).toEqual(expected.heights);
            expect(measureMap.top).toEqual(expected.tops);
            expect(_.keys(flatStructure)).toEqual(_.keys(measureMap.top));
        }

        function checkAddDistanceForLocked(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, true, 0);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 10);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 120);

            testResults(structureAndMeasure, expected);
        }

        function checkAddDefaultMarginForNotLocked(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, false, 0);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 5);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 105);

            testResults(structureAndMeasure, expected);
        }

        function checkAddNothingIfPushedIsPage(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, false, 0);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 5);
            var pushed = _.find(structureAndMeasure.structure.children, {"id": "pushed"});
            _.set(structureAndMeasure, ['measureMap', 'shrinkableContainer', pushed.id], true);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 95);

            testResults(structureAndMeasure, expected);

        }

        function checkNotShrinkingBeyondOriginalValueIfNotLocked(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, false, 90);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 50);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 90);

            testResults(structureAndMeasure, expected);
        }

        function checkShrinkingToAnchorValueIfLocked(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, true, 90);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 50);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 80);

            testResults(structureAndMeasure, expected);
        }

        function checkShrinkingToAnchorValueIfPageAndSuch(anchorType) {
            var anchor = mockAnchor(anchorType, "pushed", 30, false, 150);
            var structureAndMeasure = getStructureAndMeasures(anchor, 100, 5);
            var pushed = _.find(structureAndMeasure.structure.children, {"id": "pushed"});
            _.set(structureAndMeasure, ['measureMap', 'shrinkableContainer', pushed.id], true);
            var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 95);

            testResults(structureAndMeasure, expected);
            expected.heights.pushed = 105; //default margin

            _.set(structureAndMeasure, ['measureMap', 'shrinkableContainer', pushed.id], false);

            pushed.type = 'Document';
            testResults(structureAndMeasure, expected);

            pushed.type = 'Component';
            pushed.componentType = 'wysiwyg.viewer.components.PagesContainer';
            testResults(structureAndMeasure, expected);
        }

        describe("with anchors BOTTOM_PARENT", function () {
            describe('with viewer generated anchors and no json anchors', function () {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('viewerGeneratedAnchors', 'removeJsonAnchors');
                });

                it("should change height, add anchor distance to pusher bottom if locked", function () {
                    checkAddDistanceForLocked("BOTTOM_PARENT");
                });
            });

            it("should change height, add anchor distance to pusher bottom if locked", function () {
                checkAddDistanceForLocked("BOTTOM_PARENT");
            });

            it("should change height, add anchor default margin to pusher bottom if not locked", function () {
                checkAddDefaultMarginForNotLocked("BOTTOM_PARENT");
            });

            it("should not add anything to pusher bottom if pushed is page and not locked", function () {
                checkAddNothingIfPushedIsPage("BOTTOM_PARENT");
            });

            it("should not allow the pushed to shrink beyond original value if anchor not locked", function () {
                checkNotShrinkingBeyondOriginalValueIfNotLocked("BOTTOM_PARENT");
            });

            it("should allow the pushed to shrink as needed by anchor if locked", function () {
                checkShrinkingToAnchorValueIfLocked("BOTTOM_PARENT");
            });

            it("should allow pushed to shrink as needed if pushed is page, site structure or pages container", function () {
                checkShrinkingToAnchorValueIfPageAndSuch("BOTTOM_PARENT");
            });

            it("should ignore BOTTOM_PARENT anchors to a rotated component", function () {

            });

            it("should add the container margin to the height when anchor locked", function () {
                var structure = _.cloneDeep(mockedStructure);
                structure.children.push(mockComp("a", 100, 500));
                anchorsMap.a = [mockAnchor("BOTTOM_PARENT", "Page", 20, true)];
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {a: 500, "Page": 600},
                    containerHeightMargin: {"Page": 50}
                });
                anchors.enforceAnchors(structure, measureMap, anchorsMap, isMobileView);

                expect(measureMap.height).toEqual({"a": 500, "Page": 670});
            });

            it("should add the container margin to the height when anchor not locked", function () {
                var structure = _.cloneDeep(mockedStructure);
                structure.children.push(mockComp("a", 100, 500));
                anchorsMap.a = [mockAnchor("BOTTOM_PARENT", "Page", 20, false)];
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {a: 500, "Page": 600},
                    containerHeightMargin: {"Page": 50}
                });
                anchors.enforceAnchors(structure, measureMap, anchorsMap, isMobileView);

                expect(measureMap.height).toEqual({"a": 500, "Page": 660});
            });
        });

        //TODO: add tests that the pushed anchors are applied again if the pusher is below the pushed
        describe("with anchors BOTTOM_BOTTOM", function () {
            it("should change height, set (pusher bottom + distance - pushed top) when anchor locked, pusher below pushed", function () {
                checkAddDistanceForLocked("BOTTOM_BOTTOM");
            });
            //not sure it can actually happen
            it("should change height, set (pusher bottom + distance - pushed top) when anchor locked, pusher above pushed", function () {
                var structure = _.cloneDeep(mockedStructure);
                structure.children.push(mockComp("pushed", 30, 80));
                structure.children.push(mockComp("pusher", 10, 50));
                anchorsMap.pusher = [mockAnchor("BOTTOM_BOTTOM", "pushed", 50, true)];
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {"Page": 600, "pushed": 100, "pusher": 50}
                });
                anchors.enforceAnchors(structure, measureMap, anchorsMap, isMobileView);

                expect(measureMap.height).toEqual({"pushed": 80, "pusher": 50, "Page": 600});
            });

            it("should change height, set (pusher bottom + default margin - pushed top) when anchor not locked", function () {
                checkAddDefaultMarginForNotLocked("BOTTOM_BOTTOM");
            });

            it("should change height, set (pusher bottom  - pushed top) when anchor not locked and pushed is page", function () {
                checkAddNothingIfPushedIsPage("BOTTOM_BOTTOM");
            });

            it("should not allow the pushed to shrink beyond original value if anchor not locked", function () {
                checkNotShrinkingBeyondOriginalValueIfNotLocked("BOTTOM_BOTTOM");
            });

            it("should allow the pushed to shrink as needed by anchor if locked", function () {
                checkShrinkingToAnchorValueIfLocked("BOTTOM_BOTTOM");
            });

            it("should allow pushed to shrink as needed if pushed is page, site structure or pages container", function () {
                checkShrinkingToAnchorValueIfPageAndSuch("BOTTOM_BOTTOM");
            });

            it("should ignore BOTTOM_BOTTOM anchors to a rotated component", function () {

            });

            it('should ignore BOTTOM_BOTTOM anchors if flag is true ', function () {
                var anchor = mockAnchor('BOTTOM_BOTTOM', "pushed", 30, false, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 5);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, 'BOTTOM_BOTTOM', 100);

                var measureMap = testUtils.mockFactory.createBlankMeasureMap(_.defaults(
                    {height: _.clone(structureAndMeasure.heights)},
                    structureAndMeasure.measureMap
                ));
                var flatStructure = anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView, false, null, null, true);

                expect(measureMap.height).toEqual(expected.heights);
                expect(measureMap.top).toEqual(expected.tops);
                expect(_.keys(flatStructure)).toEqual(_.keys(measureMap.top));
            });
        });

        //BOTTOM_LOCK anchors are translated to BOTTOM_BOTTOM
        describe("multiple to bottom (height) anchors", function () {
            it("should set height to the max height by anchor when they are of different types, max BOTTOM_BOTTOM ", function () {
                var bottomParentAnchor = mockAnchor("BOTTOM_PARENT", "pushed", 30, true);
                var structureAndMeasure = getStructureAndMeasureForBottomParent(bottomParentAnchor, 100, 20); //110
                var brotherTop = structureAndMeasure.tops.pushed + 10;
                structureAndMeasure.structure.children.push(mockComp('brother', brotherTop, 80));
                anchorsMap.brother = [mockAnchor("BOTTOM_BOTTOM", 'pushed', 60, true)];
                structureAndMeasure.tops.brother = brotherTop;
                structureAndMeasure.heights.brother = 80;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_PARENT", 150);

                testResults(structureAndMeasure, expected);
            });

            it("should set height to the max height by anchor when they are of different types, max BOTTOM_PARENT ", function () {
                var bottomParentAnchor = mockAnchor("BOTTOM_PARENT", "pushed", 30, true);
                var structureAndMeasure = getStructureAndMeasureForBottomParent(bottomParentAnchor, 100, 20); //110
                var brotherTop = structureAndMeasure.tops.pushed + 10;
                structureAndMeasure.structure.children.push(mockComp("brother", brotherTop, 80, [mockAnchor("BOTTOM_BOTTOM", "pushed", 15, true)]));
                structureAndMeasure.tops.brother = brotherTop;
                structureAndMeasure.heights.brother = 80;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_PARENT", 110);

                testResults(structureAndMeasure, expected);
            });

            it("should set height to the max height by anchor when it's first", function () {
                var bottomParentAnchor = mockAnchor("BOTTOM_PARENT", "pushed", 30, true);
                var structureAndMeasure = getStructureAndMeasureForBottomParent(bottomParentAnchor, 100, 50); //80
                var anotherChildTop = structureAndMeasure.tops.pusher + 10;
                var anotherChild = mockComp("anotherChild", anotherChildTop, 5);
                anchorsMap.anotherChild = [mockAnchor("BOTTOM_PARENT", "pushed", 0, true)];
                structureAndMeasure.structure.children[0].children.push(anotherChild);
                structureAndMeasure.tops.anotherChild = anotherChildTop;
                structureAndMeasure.heights.anotherChild = 5;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_PARENT", 80);

                testResults(structureAndMeasure, expected);
            });

            it("should set the height to the originalValue if it's max,  even if there are locked anchors to height", function () {
                var bottomParentAnchor = mockAnchor("BOTTOM_PARENT", "pushed", 30, true);
                var structureAndMeasure = getStructureAndMeasureForBottomParent(bottomParentAnchor, 100, 50); //80
                var anotherChildTop = structureAndMeasure.tops.pusher - 10;
                var anotherChild = mockComp("anotherChild", anotherChildTop, 5);
                anchorsMap.anotherChild = [mockAnchor("BOTTOM_PARENT", "pushed", 0, false, 120)];
                structureAndMeasure.structure.children[0].children.push(anotherChild);
                structureAndMeasure.tops.anotherChild = anotherChildTop;
                structureAndMeasure.heights.anotherChild = 5;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_PARENT", 120);

                testResults(structureAndMeasure, expected);
            });
            //when we'll have second round, add tests that they don't mix
        });

        describe("with anchors BOTTOM_TOP", function () {
            it("should change top, add distance to pusher bottom if locked", function () {
                checkAddDistanceForLocked("BOTTOM_TOP");
            });

            it("should change top, add default margin to pusher bottom if not locked", function () {
                checkAddDefaultMarginForNotLocked("BOTTOM_TOP");
            });

            it("should not decrease top more than anchor original value if not locked", function () {
                checkNotShrinkingBeyondOriginalValueIfNotLocked("BOTTOM_TOP");
            });

            it("should decrease top as needed if anchor locked", function () {
                checkShrinkingToAnchorValueIfLocked("BOTTOM_TOP");
            });
            it("should NOT ignore BOTTOM_TOP anchors to a rotated component", function () {

            });
            it('should push component only in integer number', function () {
                var anchorType = "BOTTOM_TOP";
                var anchor = mockAnchor(anchorType, "pushed", 30.5, true, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 10);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 120);
                testResults(structureAndMeasure, expected);
            });

            it('should push component only in integer number for not locked anchor', function () {
                var anchorType = "BOTTOM_TOP";

                var anchor = mockAnchor(anchorType, "pushed", 30, false, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 0.5);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 109);

                testResults(structureAndMeasure, expected);
            });
        });

        describe("with anchor TOP_TOP", function () {
            it("should change top, add distance to pusher top if locked", function () {
                checkAddDistanceForLocked("TOP_TOP");
            });

            it("should change top, add distance to pusher top if not locked", function () {
                var anchor = mockAnchor("TOP_TOP", "pushed", 30, false, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 10);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "TOP_TOP", 120);

                testResults(structureAndMeasure, expected);
            });
            it("should decrease top as needed if anchor locked", function () {
                checkShrinkingToAnchorValueIfLocked("TOP_TOP");
            });
            it("should decrease top as needed if anchor not locked", function () {
                var anchor = mockAnchor("TOP_TOP", "pushed", 30, true, 90);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 50);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "TOP_TOP", 80);

                testResults(structureAndMeasure, expected);
            });

            it('should push component only in integer number', function () {
                var anchorType = "TOP_TOP";
                var anchor = mockAnchor(anchorType, "pushed", 30.5, true, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 10);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 120);

                testResults(structureAndMeasure, expected);
            });

            it('should push component only in integer number for not locked anchor', function () {
                var anchorType = "TOP_TOP";

                var anchor = mockAnchor(anchorType, "pushed", 30, false, 0);
                var structureAndMeasure = getStructureAndMeasures(anchor, 100, 0.5);
                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, anchorType, 129);

                testResults(structureAndMeasure, expected);
            });

            it("should NOT ignore TOP_TOP anchors to a rotated component", function () {

            });
        });

        //BOTTOM_LOCK anchors are translated to TOP_TOP
        describe("multiple to top (y) anchors", function () {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('viewerGeneratedAnchors', 'removeJsonAnchors');
            });

            it("should take the max top when anchors of different type BOTTOM_TOP", function () {
                var structureAndMeasure = getStructureAndMeasureForBottomTop(mockAnchor("BOTTOM_TOP", "pushed", 30, true), 100, 20); //110
                var fromTopCompTop = structureAndMeasure.tops.pushed - 50;
                var fromTopComp = mockComp("fromTopComp", fromTopCompTop, 5, [mockAnchor("TOP_TOP", "pushed", 50, true)]);
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = fromTopCompTop;
                structureAndMeasure.heights.fromTopComp = 5;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 110);

                testResults(structureAndMeasure, expected);

            });

            it("should take the max top when anchors of different type TOP_TOP", function () {
                var structureAndMeasure = getStructureAndMeasureForBottomTop(mockAnchor("BOTTOM_TOP", "pushed", 30, true), 100, 20); //110
                var fromTopCompTop = structureAndMeasure.tops.pushed - 50;
                var fromTopComp = mockComp("fromTopComp", fromTopCompTop, 100);
                anchorsMap.fromTopComp = [mockAnchor("TOP_TOP", "pushed", 100, true)];
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = fromTopCompTop;
                structureAndMeasure.heights.fromTopComp = 100;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 150);

                testResults(structureAndMeasure, expected);
            });

            it("should ignore originalValue if there is a locked anchor further down the comps order", function () {
                var structureAndMeasure = getStructureAndMeasureForBottomTop(mockAnchor("BOTTOM_TOP", "pushed", 30, true), 100, 20); //110
                var nonLockedPusherTop = structureAndMeasure.tops.pusher - 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10, [mockAnchor("BOTTOM_TOP", "pushed", 100, false, 130)]);
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 110);

                testResults(structureAndMeasure, expected);
            });

            it("should ignore originalValue if there is a locked anchor earlier in the comps order", function () {
                var structureAndMeasure = getStructureAndMeasureForBottomTop(mockAnchor("BOTTOM_TOP", "pushed", 30, true), 100, 20); //110
                var nonLockedPusherTop = structureAndMeasure.tops.pusher + 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10, [mockAnchor("BOTTOM_TOP", "pushed", 100, false, 130)]);
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 110);

                testResults(structureAndMeasure, expected);
            });

            it("should ignore originalValue if there is a top top locked anchor further down the comps order", function () {
                var structureAndMeasure = getStructureAndMeasureForTopTop(mockAnchor("TOP_TOP", "pushed", 30, true), 100, 20); //110
                var nonLockedPusherTop = structureAndMeasure.tops.pusher - 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10);
                anchorsMap.fromTopComp = [mockAnchor("BOTTOM_TOP", "pushed", 100, false, 130)];
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 110);

                testResults(structureAndMeasure, expected);
            });

            // THIS WILL WORK ONLY FOR POPUPS BECAUSE WE ARE CHICKENS :(
            it("should ignore originalValue if there is a top top NOT locked anchor further down the comps order", function () {
                var structureAndMeasure = getStructureAndMeasureForTopTop(mockAnchor("TOP_TOP", "pushed", 30, false, 150), 100, 20); //110
                var nonLockedPusherTop = structureAndMeasure.tops.pusher - 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10);
                anchorsMap.fromTopComp = [mockAnchor("BOTTOM_TOP", "pushed", 100, false, 130)];
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", 110);

                testResults(structureAndMeasure, expected);
            });

            it("should use the calculated value by a NOT locked top top anchor even if there is a locked to top anchor if it is bigger (negative values)", function () {
                var structureAndMeasure = getStructureAndMeasureForTopTop(mockAnchor("TOP_TOP", "pushed", 50, false, 40), -100, 20); //-70
                var nonLockedPusherTop = structureAndMeasure.tops.pusher + 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10);
                anchorsMap.fromTopComp = [mockAnchor("BOTTOM_TOP", "pushed", 100, false, -10)];
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", -70);

                testResults(structureAndMeasure, expected);
            });

            //in this test the top top anchor should be calculated before the bottom top - the pusher should be higher
            it("should use the calculated value by a NOT locked top top anchor even if there is a locked to top anchor if it is bigger (negative values)", function () {
                var structureAndMeasure = getStructureAndMeasureForTopTop(mockAnchor("TOP_TOP", "pushed", 50, false, 40), -100, 20); //-70
                var nonLockedPusherTop = structureAndMeasure.tops.pusher + 10;
                var fromTopComp = mockComp("fromTopComp", nonLockedPusherTop, 10);
                anchorsMap.fromTopComp = [mockAnchor("BOTTOM_TOP", "pushed", 50, true)];  //-50
                structureAndMeasure.structure.children.push(fromTopComp);
                structureAndMeasure.tops.fromTopComp = nonLockedPusherTop;
                structureAndMeasure.heights.fromTopComp = 10;

                var expected = getExpectedHeightsAndTopsWithTheChange(structureAndMeasure, "BOTTOM_TOP", -50);

                testResults(structureAndMeasure, expected);
            });
        });

        function addBottomTopToPushed(structureAndMeasure) {
            var otherPushedTop = structureAndMeasure.tops.pushed + structureAndMeasure.heights.pushed;
            var otherPushed = mockComp("otherPushed", otherPushedTop, 50);
            var otherPushedAnchor = mockAnchor("BOTTOM_TOP", "otherPushed", 0, true);
            anchorsMap.pushed = [otherPushedAnchor];
            structureAndMeasure.structure.children.push(otherPushed);
            structureAndMeasure.heights.otherPushed = 50;
            structureAndMeasure.tops.otherPushed = otherPushedTop;
        }

        describe("anchors that apply to components before them", function () {
            it("should enforce pusher anchors again when bottom bottom anchor applied", function () {
                var anchor = mockAnchor("BOTTOM_BOTTOM", "pushed", 200, true);
                var structureAndMeasure = getStructureAndMeasureForBottomBottom(anchor, 100, 50);
                addBottomTopToPushed(structureAndMeasure);
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: structureAndMeasure.heights
                });

                var expectedTop = structureAndMeasure.tops.pusher + structureAndMeasure.heights.pusher + 200;
                anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView);
                expect(measureMap.top.otherPushed).toBe(expectedTop);
            });

            it("should enforce pusher anchors again when top top anchor distance is negative", function () {
                var anchor = mockAnchor("TOP_TOP", "pushed", -100, true);
                var structureAndMeasure = getStructureAndMeasureForTopTop(anchor, 50, 0);
                addBottomTopToPushed(structureAndMeasure);
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: structureAndMeasure.heights
                });

                var expectedTop = structureAndMeasure.tops.pusher - 100 + structureAndMeasure.heights.pushed;
                anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView);
                expect(measureMap.top.otherPushed).toBe(expectedTop);
            });
            //it's hard to explain those..
            //the idea is we need to always use the max value by the anchors,
            // and if we go back in the queue, the max value might get smaller
            it("when enforcing again, decrease the value to the new anchor value, even if it's smaller than the old one, but bigger than the rest", function () {
                var anchor = mockAnchor("BOTTOM_BOTTOM", "pushed", 0, true);
                var structureAndMeasure = getStructureAndMeasureForBottomBottom(anchor, 100, 50);
                addBottomTopToPushed(structureAndMeasure);
                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: structureAndMeasure.heights
                });

                var expectedTop = structureAndMeasure.tops.pusher + structureAndMeasure.heights.pusher + 0;
                anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView);
                expect(measureMap.top.otherPushed).toBe(expectedTop);

            });

            it("when enforcing again, decrease the value to the  one before max, if it's bigger than the new anchor value", function () {
                var anchor = mockAnchor("BOTTOM_BOTTOM", "pushed", 0, true);
                var structureAndMeasure = getStructureAndMeasureForBottomBottom(anchor, 100, 50);
                addBottomTopToPushed(structureAndMeasure);

                var newByAnchorTop = structureAndMeasure.tops.pusher + structureAndMeasure.heights.pusher + 0;
                var expectedTop = newByAnchorTop + 20;

                structureAndMeasure.structure.children.push(mockComp("otherPusher", 0, expectedTop));
                anchorsMap.otherPusher = [mockAnchor("BOTTOM_TOP", "otherPushed", 0, true)];
                structureAndMeasure.heights.otherPusher = expectedTop;

                var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: structureAndMeasure.heights
                });

                anchors.enforceAnchors(structureAndMeasure.structure, measureMap, anchorsMap, isMobileView);
                expect(measureMap.top.otherPushed).toBe(expectedTop);
            });
        });

        function getStructureForLockBottom() {
            var structure = _.cloneDeep(mockedStructure);
            structure.children = [
                mockComp("top", 20, 100),
                mockComp("middle", 40, 60),
                mockComp("bottom", 60, 60)
            ];
            anchorsMap.middle = [
                mockAnchor('LOCK_BOTTOM', 'top', 20, true, 0, -20),
                mockAnchor('LOCK_BOTTOM', 'bottom', 20, true, 0, 20)
            ];
            return {
                structure: structure,
                measureMap: testUtils.mockFactory.createBlankMeasureMap({
                    height: {"Page": 600, "top": 100, "middle": 60, "bottom": 60}
                })
            };
        }

        function addPushingComponent(structureAndMeasure, target, type, change) {
            var anchor = mockAnchor(type === 'height' ? 'BOTTOM_BOTTOM' : 'TOP_TOP', target, 0, true);
            var targetComp = _.find(structureAndMeasure.structure.children, {id: target});
            var compHeight = 5;
            var top = type === 'top' ?
            targetComp.layout.y + change :
                (targetComp.layout.y + targetComp.layout.height - compHeight + change);
            var comp = mockComp('pushing', top, compHeight);
            anchorsMap.pushing = [anchor];
            structureAndMeasure.structure.children.push(comp);
            structureAndMeasure.measureMap.height[comp.id] = compHeight;
        }

        function getExpectedMeasureMap(structureAndMeasure, change, type) {
            var measureMap = testUtils.mockFactory.createBlankMeasureMap({
                height: _.clone(structureAndMeasure.measureMap.height)
            });
            var structure = structureAndMeasure.structure;
            measureMap.top = _.transform(structure.children, function (result, child) {
                result[child.id] = child.layout.y;
            }, {});
            measureMap.top.Page = structure.layout.y;
            measureMap[type] = _.transform(measureMap[type], function (result, value, compId) {
                result[compId] = _.includes(['top', 'middle', 'bottom'], compId) ? value + change : value;
            });
            measureMap.minHeight = structureAndMeasure.measureMap.minHeight;
            return measureMap;
        }

        //these are translated to 2 way TOP_TOP and 2 way BOTTOM_BOTTOM anchors (so the multiple anchors should work the same)
        //lets call all the comps link by the LOCK_BOTTOM anchor as hGroup
        xdescribe("with anchors LOCK_BOTTOM", function () {
            it("should change height of the all comps in hGroup if the height of the top most is changed", function () {
                var structureAndMeasure = getStructureForLockBottom();
                addPushingComponent(structureAndMeasure, 'top', 'height', -10);
                var expectedMeasureMap = getExpectedMeasureMap(structureAndMeasure, -10, 'height');

                anchors.enforceAnchors(structureAndMeasure.structure, structureAndMeasure.measureMap, anchorsMap, isMobileView);

                expect(structureAndMeasure.measureMap).toEqual(expectedMeasureMap);
            });

            it("should change height of all comps in hGroup if the height of the bottom most is changed", function () {
                var structureAndMeasure = getStructureForLockBottom();
                addPushingComponent(structureAndMeasure, 'bottom', 'height', 10);
                var expectedMeasureMap = getExpectedMeasureMap(structureAndMeasure, 10, 'height');

                anchors.enforceAnchors(structureAndMeasure.structure, structureAndMeasure.measureMap, anchorsMap, isMobileView);

                expect(structureAndMeasure.measureMap).toEqual(expectedMeasureMap);
            });

//            it("should shrink the all the comps if ")

            it("should change top of all comps in hGroup if the top of the top most is changed", function () {
                var structureAndMeasure = getStructureForLockBottom();
                addPushingComponent(structureAndMeasure, 'top', 'top', 10);
                var expectedMeasureMap = getExpectedMeasureMap(structureAndMeasure, 10, 'top');

                anchors.enforceAnchors(structureAndMeasure.structure, structureAndMeasure.measureMap, anchorsMap, isMobileView);

                expect(structureAndMeasure.measureMap).toEqual(expectedMeasureMap);
            });

            it("should change top of all comps in hGroup if the top of the bottom most is changed", function () {
                var structureAndMeasure = getStructureForLockBottom();
                addPushingComponent(structureAndMeasure, 'bottom', 'top', -10);
                var expectedMeasureMap = getExpectedMeasureMap(structureAndMeasure, -10, 'top');

                anchors.enforceAnchors(structureAndMeasure.structure, structureAndMeasure.measureMap, anchorsMap, isMobileView);

                expect(structureAndMeasure.measureMap).toEqual(expectedMeasureMap);
            });

            it("should enforce min height if specified", function () {
                var structureAndMeasure = getStructureForLockBottom();
                addPushingComponent(structureAndMeasure, 'top', 'height', -10);
                var expectedMeasureMap = getExpectedMeasureMap(structureAndMeasure, 0, 'height');
                structureAndMeasure.measureMap.minHeight.bottom = structureAndMeasure.measureMap.height.bottom;

                anchors.enforceAnchors(structureAndMeasure.structure, structureAndMeasure.measureMap, anchorsMap, isMobileView);

                expect(structureAndMeasure.measureMap).toEqual(expectedMeasureMap);
            });
        });

    });
});
