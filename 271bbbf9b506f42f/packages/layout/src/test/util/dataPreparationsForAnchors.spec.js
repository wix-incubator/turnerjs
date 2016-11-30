define([
    'lodash',
    'testUtils',
    'layout/util/dataPreparationsForAnchors'
], function (_, testUtils, dataPreparationsForAnchors) {
    'use strict';



    function mockComp(id, y, height, anchors, children, rotation) {
        return {
            id: id,
            children: children ? children : [],
            layout: {x: 0, y: y, height: height, anchors: anchors ? anchors : [], rotationInDegrees: rotation || 0}
        };
    }

    function updateMeasureMap(measureMap, structure) {
        measureMap.height[structure.id] = structure.layout.height;
        _.forEach(structure.children, _.partial(updateMeasureMap, measureMap));
    }

    function markComponentAsCollapsed(compId, measureMap){
        measureMap.collapsed[compId] = true;
    }


    describe("dataPreparationsForAnchors", function () {
        var isMobileView = false;

        beforeEach(function () {
            this.structure = {
                id: "Page",
                children: [],
                layout: {x: 0, y: 0, width: 980, height: 600, anchors: []}
            };

            this.measureMap = testUtils.mockFactory.createBlankMeasureMap();
        });

        describe('collapsed components in dataMap', function(){
            beforeEach(function(){
                this.mockCompA = mockComp('a-collapsed', 20, 10);
                this.mockCompB = mockComp('b-collapsed', 10, 10);
                this.mockCollapsedChild = mockComp('child-comp', 30, 10);
                this.mockCompD = mockComp('d', 20, 10);
                this.mockCompB.children.push(this.mockCollapsedChild);
                this.structure.children.push(this.mockCompA);
                this.structure.children.push(this.mockCompB);
                this.structure.children.push(this.mockCompD);

                updateMeasureMap(this.measureMap, this.structure);
                markComponentAsCollapsed(this.mockCompA.id, this.measureMap);
                markComponentAsCollapsed(this.mockCompB.id, this.measureMap);
            });

            it('should copy collapsed data from measureMap to dataMap', function(){
                var structureData = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                var expectedCollapsedData = {};
                expectedCollapsedData[this.mockCompA.id] = true;
                expectedCollapsedData[this.mockCompB.id] = true;
                expect(structureData.collapsed).toEqual(expectedCollapsedData);
            });

            it('should set currentHeight 0 in data map to all collapsed components', function(){
                var structureData = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                expect(structureData.currentHeight[this.mockCompA.id]).toEqual(0);
                expect(structureData.currentHeight[this.mockCompB.id]).toEqual(0);
                expect(structureData.currentHeight[this.mockCompD.id]).toEqual(this.mockCompD.layout.height);
            });

            it('should not include children of collapsed component in data map', function(){
                var sorted = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).sortedIds;

                expect(_.includes(sorted, this.mockCollapsedChild.id)).toBeFalsy();
            });
        });

        describe("sorting", function () {
            it("should order siblings by top", function () {
                this.structure.children.push(mockComp('a', 20, 10));
                this.structure.children.push(mockComp('b', 10, 10));
                this.structure.children.push(mockComp('c', 30, 10));
                updateMeasureMap(this.measureMap, this.structure);

                var sorted = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).sortedIds;

                expect(sorted).toEqual(['b', 'a', 'c', 'Page']);

            });
            it("should put children before it's parents", function () {
                this.structure.children.push(mockComp('a', 0, 10, [], [mockComp('a1', 5, 10, [], [mockComp('a2', 5, 10)])]));
                updateMeasureMap(this.measureMap, this.structure);

                var sorted = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).sortedIds;

                expect(sorted).toEqual(['a2', 'a1', 'a', 'Page']);
            });

            it("should deal with parent size 0, children should be before parent", function () {
                this.structure.children.push(mockComp('a', 0, 0, [], [mockComp('a1', 3, 10, [], [mockComp('a2', 5, 10)])]));
                updateMeasureMap(this.measureMap, this.structure);

                var sorted = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).sortedIds;

                expect(sorted).toEqual(['a2', 'a1', 'a', 'Page']);
            });

            //the actual order can change with implementation
            it("the order between you and your brothers children doesn't matter :)", function () {
                this.structure.children.push(mockComp('a', 10, 100, [], [mockComp('a1', 0, 10)]));
                this.structure.children.push(mockComp('b', 20, 100, [], [mockComp('b1', 0, 10), mockComp('b2', 95, 5)]));
                updateMeasureMap(this.measureMap, this.structure);

                var sorted = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).sortedIds;

                expect(sorted).toEqual(['a1', 'b1', 'a', 'b2', 'b', 'Page']);
            });
        });

        function mockAnchor(type, target, distance, locked, topTop) {
            var anchor = {
                distance: distance,
                type: type,
                targetComponent: target,
                locked: !!locked
            };
            if (topTop) {
                anchor.topToTop = topTop;
            } else { //this is true only for LOCK_BOTTOM translated anchors
                anchor.notEnforcingMinValue = true;
            }
            return anchor;
        }


        describe("translate LOCK_BOTTOM anchors", function () {
            it("should add 2 way top top and 2 way bottom bottom anchors if 'origin' first", function () {
                this.structure.children.push(mockComp('a', 10, 100, [mockAnchor('LOCK_BOTTOM', 'b', 10, null, 20)]));
                this.structure.children.push(mockComp('b', 20, 100, []));
                updateMeasureMap(this.measureMap, this.structure);
                var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                expect(dataMap.flat.a.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', 20, true), mockAnchor('BOTTOM_BOTTOM', 'b', 10, true)]);
                expect(dataMap.flat.b.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'a', -20, true), mockAnchor('BOTTOM_BOTTOM', 'a', -10, true)]);
            });

            it("should add 2 way top top and 2 way bottom bottom anchors if 'origin' second", function () {
                this.structure.children.push(mockComp('a', 10, 100));
                this.structure.children.push(mockComp('b', 20, 100, [mockAnchor('LOCK_BOTTOM', 'a', 10, null, 20)]));
                updateMeasureMap(this.measureMap, this.structure);

                var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                expect(dataMap.flat.a.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', -20, true), mockAnchor('BOTTOM_BOTTOM', 'b', -10, true)]);
                expect(dataMap.flat.b.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'a', 20, true), mockAnchor('BOTTOM_BOTTOM', 'a', 10, true)]);
            });

            it("should add the 2 way anchors for 2 lock bottom anchors", function () {
                this.structure.children.push(mockComp('a', 10, 100));
                this.structure.children.push(mockComp('b', 20, 100, [
                    mockAnchor('LOCK_BOTTOM', 'a', 10, null, 20),
                    mockAnchor('LOCK_BOTTOM', 'c', 10, null, 20)
                ]));
                this.structure.children.push(mockComp('c', 10, 100));
                updateMeasureMap(this.measureMap, this.structure);

                var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                expect(dataMap.flat.a.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', -20, true), mockAnchor('BOTTOM_BOTTOM', 'b', -10, true)]);
                expect(dataMap.flat.b.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'a', 20, true), mockAnchor('BOTTOM_BOTTOM', 'a', 10, true),
                    mockAnchor('TOP_TOP', 'c', 20, true), mockAnchor('BOTTOM_BOTTOM', 'c', 10, true)]);
                expect(dataMap.flat.c.layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', -20, true), mockAnchor('BOTTOM_BOTTOM', 'b', -10, true)]);
            });

            it("should not change original structure", function () {
                var anchor = mockAnchor('LOCK_BOTTOM', 'b', 10, null, 20);
                this.structure.children.push(mockComp('a', 10, 100, [anchor]));
                this.structure.children.push(mockComp('b', 20, 100, []));
                updateMeasureMap(this.measureMap, this.structure);

                dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView);

                expect(this.structure.children[0].layout.anchors).toEqual([anchor]);
                expect(this.structure.children[1].layout.anchors).toEqual([]);
            });
        });

        describe("calculate rotated height and top", function () {
            function addComp(scope, id, height, width, top, rotation) {
                scope.structure.children.push(mockComp(id, top, height, [], [], rotation));
                scope.measureMap.height[id] = height;
                scope.measureMap.width[id] = width;
            }

            beforeEach(function () {
                this.measureMap = testUtils.mockFactory.createBlankMeasureMap({
                    height: {Page: 600},
                    width: {Page: 980}
                });
            });

            describe("getDataForAnchorsAndSort", function () {
                it("should set height to measure height and top to structure height if no rotate", function () {
                    addComp(this, 'a', 10, 20, 30, 0);
                    var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                    expect(dataMap.currentHeight).toEqual({Page: 600, a: 10});
                    expect(dataMap.currentY).toEqual({Page: 0, a: 30});
                });

                it("should set height and top to the rotated values and set noHeightChange to true if there is rotate", function () {
                    addComp(this, 'a', 10, 20, 30, 90);
                    var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;

                    expect(dataMap.currentHeight).toEqual({Page: 600, a: 20});
                    expect(dataMap.currentY).toEqual({Page: 0, a: 25});
                    expect(dataMap.noHeightChange).toEqual({a: true});
                });
            });

            it("it should remove the rotation diff previously added from height and top", function () {
                addComp(this, 'a', 10, 20, 30, 90);
                var dataMap = dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;
                dataPreparationsForAnchors.fixMeasureMap(this.measureMap, dataMap);

                expect(this.measureMap.height).toEqual({Page: 600, a: 10});
                expect(this.measureMap.top).toEqual({Page: 0, a: 30});
            });

            describe('dataMap dictionaries', function () {
                beforeEach(function () {
                    this.getDataMap = function () {
                        return dataPreparationsForAnchors.getDataForAnchorsAndSort(this.structure, this.measureMap, isMobileView).structureData;
                    }.bind(this);
                });

                describe('ignoreOriginalValue', function () {
                    it('should not ignore components usually', function () {
                        expect(this.getDataMap().ignoreOriginalValue).toEqual({});
                    });

                    it('should ignore a Document', function () {
                        this.structure.type = "Document";
                        expect(this.getDataMap().ignoreOriginalValue[this.structure.id]).toBe(true);
                    });

                    it('should ignore a PagesContainer', function () {
                        this.structure.componentType = "wysiwyg.viewer.components.PagesContainer";
                        expect(this.getDataMap().ignoreOriginalValue[this.structure.id]).toBe(true);
                    });
                });

                describe('shrinkableContainer', function () {
                    it('should not mark component as a shrinkable containerj', function () {
                        expect(this.getDataMap().shrinkableContainer).toEqual({});
                    });

                    it('should mark a component as a shrinkable container if it is marked as such in a measure map', function () {
                        addComp(this, 'idContainedInSpecialDictionaryOfMeasureMap', 10, 20, 30, 90);
                        this.measureMap.shrinkableContainer.idContainedInSpecialDictionaryOfMeasureMap = true;

                        expect(this.getDataMap().shrinkableContainer).toEqual({
                            idContainedInSpecialDictionaryOfMeasureMap: true
                        });
                    });
                });
            });
        });
    });
});
