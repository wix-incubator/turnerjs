define(['lodash', 'testUtils', 'experiment', 'layout',
    'documentServices/siteAccessLayer/SiteUpdatesHandler',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/anchors/anchors',
    'documentServices/siteAccessLayer/postUpdateOperations'], function (_, testUtils, experiment, layout, SiteUpdatesHandler, privateServicesHelper, anchors, postUpdateOperations) {

    'use strict';

    var factory = testUtils.mockFactory;
    var textType = 'wysiwyg.viewer.components.WRichText';
    var containerType = 'mobile.core.components.Container';
    var textId = 'text';
    var otherId = 'other';
    var pusherId = 'pusher';
    var BOTTOM_TOP = 'BOTTOM_TOP';
    var BOTTOM_PARENT = 'BOTTOM_PARENT';
    var lockedAnchorDistance = 35;
    var unlockedAnchorDistance = 201;


    function createStupidNodesMap(pointers, rootPointer) {
        var all = pointers.components.getChildrenRecursively(rootPointer);
        var nodesMap = _.indexBy(all, 'id');
        nodesMap[rootPointer.id] = true;
        return nodesMap;
    }

    function updateMeasureMap(ps, measureMap, reLayoutedCompsMap, rootPointer) {
        var all = ps.pointers.components.getChildrenRecursively(rootPointer);
        all.push(rootPointer);
        _.forEach(all, function (pointer) {
            var compLayout = ps.dal.get(pointer).layout;
            var minHeight = measureMap.minHeight[pointer.id] || 0;
            measureMap.height[pointer.id] = measureMap.height[pointer.id] || Math.max(compLayout.height, minHeight) || 0;
            measureMap.top[pointer.id] = measureMap.top[pointer.id] || compLayout.y || 0;
            measureMap.width[pointer.id] = compLayout.width || 0;

            reLayoutedCompsMap[pointer.id] = true;
        });
    }

    function getCompLayoutFromDal(ps, compId, pagePointer) {
        var comp = ps.pointers.components.getComponent(compId, pagePointer);
        var layoutPointer = ps.pointers.getInnerPointer(comp, 'layout');
        return ps.dal.get(layoutPointer);
    }

    function updateCompMeasure(measureMap, reLayoutedCompsMap, compId, params) {
        measureMap.height[compId] = params.height || 0;
        measureMap.width[compId] = params.width || 10;
        measureMap.top[compId] = params.top || 0;
        measureMap.minHeight[compId] = params.minHeight;
        measureMap.left[compId] = params.left || 0;

        reLayoutedCompsMap[compId] = true;
    }

    describe("pack text", function () {
        beforeEach(function () {
            var siteData = factory.mockSiteData(null, true);
            siteData.addPageWithDefaults('page1');
            siteData.addMeasureMap();
            siteData.setCurrentPage('page1');
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            this.page = this.ps.pointers.components.getPage('page1', 'DESKTOP');
            this.measureMap = siteData.measureMap;
            this.reLayoutedCompsMap = siteData.reLayoutedCompsMap;
            this.updatesHandler = new SiteUpdatesHandler(this.ps, _.noop);

            var originalForceUpdate = this.ps.siteAPI.forceUpdate.bind(this.ps.siteAPI);
            spyOn(this.ps.siteAPI, 'forceUpdate').and.callFake(function () {
                var structure = this.ps.dal.get(this.page);
                updateMeasureMap(this.ps, this.measureMap, this.reLayoutedCompsMap, this.page);
                layout.enforceAnchors(structure, this.measureMap, null, null, false, null, createStupidNodesMap(this.ps.pointers, this.page));
                originalForceUpdate();
            }.bind(this));
        });

        afterEach(function () {
            postUpdateOperations.reset();
        });

        //test the beforeEach infra structure for the real tests
        it("should update dal according to measure map - no text", function () {
            this.ps.dal.addDesktopComps([factory.createStructure('someComp', {
                layout: {
                    height: 20,
                    y: 20
                }
            }, 'comp1')], this.page);
            updateCompMeasure(this.measureMap, this.reLayoutedCompsMap, 'comp1', {minHeight: 50});

            this.ps.siteAPI.forceUpdate();

            expect(getCompLayoutFromDal(this.ps, 'comp1', this.page).height).toBe(50);
        });

        it("should enforce anchors", function () {
            this.ps.dal.addDesktopComps([factory.createStructure('someComp', {
                layout: {
                    height: 20, y: 20,
                    anchors: [factory.createAnchor('comp1', 'comp2', 'BOTTOM_TOP', 30)]
                }
            }, 'comp1'),
                factory.createStructure('someComp', {layout: {height: 10, y: 0}}, 'comp2')
            ], this.page);

            this.ps.siteAPI.forceUpdate();

            expect(getCompLayoutFromDal(this.ps, 'comp2', this.page).y).toBe(70);
        });

        function getCalculatedByAnchorValue(savedStructureLayout, actualLayout, distance, isLocked) {
            var minActualDistanceBetweenComps = isLocked ? distance : 10;
            var actualTextHeight = Math.max(savedStructureLayout.height, actualLayout.height);
            var valueByActualSize = actualTextHeight + actualLayout.top + minActualDistanceBetweenComps;

            var result = {
                anchorOriginalValue: undefined,
                calculatedByAnchorValue: undefined
            };

            if (isLocked) {
                result.calculatedByAnchorValue = valueByActualSize;
            } else {
                var valueBySavedStructure = savedStructureLayout.height + savedStructureLayout.top + distance;
                result.calculatedByAnchorValue = Math.max(valueByActualSize, valueBySavedStructure);
                //this is what happens according to the old logic, today, I think, that it depends.....
                result.anchorOriginalValue = valueBySavedStructure;
            }

            return result;
        }

        function isLockedDistance(distanceToAnchoredComp) {
            return distanceToAnchoredComp <= 80;
        }

        function getSavedStructureComps(textStructureHeight, textContentHeight, textStructureTop, anchorType, distanceToAnchoredComp) {
            var isAnchorLocked = isLockedDistance(distanceToAnchoredComp);
            var distance = isAnchorLocked ? distanceToAnchoredComp : undefined;
            var anchorShit = getCalculatedByAnchorValue(
                {height: textStructureHeight, top: textStructureTop},
                {height: textContentHeight, top: textStructureTop},
                distanceToAnchoredComp, isAnchorLocked);

            var anchor = factory.createAnchor(textId, otherId, anchorType, distance, isAnchorLocked, anchorShit.anchorOriginalValue);

            var textComp = factory.createStructure(textType, {
                layout: {
                    y: textStructureTop,
                    height: textStructureHeight,
                    anchors: [anchor]
                }
            }, textId);

            var otherComp = factory.createStructure(otherId, {layout: {}}, otherId);

            //create pusher comp
            //pusher top is equal to text comp top - it will push the text by the pusher height and pusher anchor distance
            var pusherHeight = 10;
            var pusherDistance = 30;

            var pusherAnchor = factory.createAnchor(pusherId, textId, BOTTOM_TOP, pusherDistance, true, undefined);
            var pusherComp = factory.createStructure(containerType, {
                layout: {
                    y: textStructureTop,
                    height: pusherHeight,
                    anchors: [pusherAnchor]
                }
            }, pusherId);

            return {
                textComp: textComp,
                otherComp: otherComp,
                pusherComp: pusherComp,
                otherCompAnchorCalculatedValue: anchorShit.calculatedByAnchorValue,
                pushedOtherCompAnchorCalculatedValue: anchorShit.calculatedByAnchorValue + pusherHeight + pusherDistance
            };
        }

        function validateLayoutAfterPackText(anchorType, distanceToAnchoredComp, textSavedStructureTop, textStructureHeight, textContentHeight) {
            //we do this to enforce anchors after the change, so that we can check the result
            this.ps.siteAPI.forceUpdate();

            var textLayout = getCompLayoutFromDal(this.ps, textId, this.page);
            expect(textLayout.height).toBe(textContentHeight);
            expect(textLayout.anchors.length).toBe(1);
            //this is ugly, we use the data that we validate to calculate the validation values.... it will be nice to find something better
            var textAnchor = textLayout.anchors[0];
            if (!isLockedDistance(distanceToAnchoredComp)) {
                expect(textAnchor.locked).toBe(false);
            }

            var anchorShit = getCalculatedByAnchorValue(
                {height: textStructureHeight, top: textSavedStructureTop},
                {height: textContentHeight, top: this.measureMap.top[textId]},
                distanceToAnchoredComp, textAnchor.locked);


            var otherLayout = getCompLayoutFromDal(this.ps, otherId, this.page);
            if (anchorType === BOTTOM_TOP) {
                expect(otherLayout.y).toBe(anchorShit.calculatedByAnchorValue);
            } else {
                expect(otherLayout.height).toBe(anchorShit.calculatedByAnchorValue);
            }

        }

        function updateMeasureAndValidate(currentTextContentHeight, savedTextCompHeight) {
            this.measureMap.minHeight[textId] = currentTextContentHeight;
            this.reLayoutedCompsMap[textId] = true;

            //we do this to run pack text after the enforeAnchors
            this.ps.siteAPI.forceUpdate();

            this.validateLayoutAfterPackText(savedTextCompHeight, currentTextContentHeight);
        }

        function runTest(savedTextCompHeight, savedTextContentHeight, currentTextContentHeight) {
            this.addCompsToDal(savedTextCompHeight, savedTextContentHeight);
            updateMeasureAndValidate.call(this, currentTextContentHeight, savedTextCompHeight);
        }


        var tests = function () {
            /**
             *  Bottom_Top      Bottom_Parent
             *
             *  ***    ***    *******     *******
             *  *T* => *T*    *     *     *     *
             *  ***    ***    * *** *     * *** *
             *                * *T* *     * *T* *
             *  ***    ***    * *** *  => * *** *
             *  ***    ***    *     *     *     *
             *  ***    ***    *******     *******
             *
             */
            it("should not change the text size if saved structure height, saved content height and current content height are the same", function () {
                var savedTextCompHeight = 40;

                runTest.call(this, savedTextCompHeight, savedTextCompHeight, savedTextCompHeight);
            });

            /**
             *  Bottom_Top      Bottom_Parent
             *
             *  ***    ***    *******     *******
             *  *T* => *T*    *     *     *     *
             *  *T*    *T*    * *** *     * *** *
             *   T     *T*    * *T* *     * *T* *
             *         ***    * *T* *     * *T* *
             *                *  T  *     * *T* *
             *  ***    ***    *     *  => * *** *
             *  ***    ***    *     *     *     *
             *  ***    ***    *******     *******
             *
             */
            it("should change text height and not update anchor when saved content height and current content height are bigger than saved structure height", function () {
                var savedTextCompHeight = 40;
                var savedTextContentHeight = 80;

                runTest.call(this, savedTextCompHeight, savedTextContentHeight, savedTextContentHeight);
            });

            /**
             *  Bottom_Top      Bottom_Parent
             *
             *  ***    ***    *******     *******
             *  *T* => *T*    *     *     *     *
             *  *T*    *T*    * *** *     * *** *
             *   T     *T*    * *T* *     * *T* *
             *         ***    * *T* *     * *T* *
             *                *  T  *     * *T* *
             *  ***    ***    *     *  => * *** *
             *  ***    ***    *     *     *     *
             *  ***    ***    *******     *******
             *
             */
            describe('New Anchor is locked:', function () {
                it("should change text height and not update anchor when saved content height and current content height are bigger than saved structure height", function () {
                    var savedTextCompHeight = 40;
                    var savedTextContentHeight = 200;

                    runTest.call(this, savedTextCompHeight, savedTextContentHeight, savedTextContentHeight);
                });
            });

            /**
             *  Bottom_Top      Bottom_Parent
             *
             *  ***    ***    *******     *******
             *  *T* => *T*    *     *     *     *
             *  *T*    ***    * *** *     * *** *
             *  * *           * *T* *     * *T* *
             *  ***           * *T* *     * *** *
             *                * * * *     *     *
             *  ***    ***    * *** *  => *     *
             *  ***    ***    *     *     *     *
             *  ***    ***    *******     *******
             *
             */
            it("should change text height and enlarge anchor when saved content height and current content height are smaller than saved structure height", function () {
                var savedTextCompHeight = 40;
                var savedTextContentHeight = 20;

                runTest.call(this, savedTextCompHeight, savedTextContentHeight, savedTextContentHeight);
            });

            //Run all possible test combinations
            //
            // function runMultiTest(savedTextCompHeight, savedTextContentHeight, currentTextContentHeight) {
            //    describe('Multiple Generated Texts: savedTextCompHeight = ' + savedTextCompHeight + ', savedTextContentHeight = ' + savedTextContentHeight + ', currentTextContentHeight = ' + currentTextContentHeight, function () {
            //        it('Should push the other component and update the component height in dal to be the content height and keep the anchor distance', function () {
            //            runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);
            //        });
            //    });
            //}
            //
            //var values = [20,40,80];
            //
            //_.forEach(values, function(savedTextCompHeight) {
            //    _.forEach(values, function(savedTextContentHeight) {
            //        _.forEach(values, function(currentTextContentHeight) {
            //            runMultiTest(savedTextCompHeight, savedTextContentHeight, currentTextContentHeight)
            //        });
            //    });
            //});

            describe('Current content Height different than saved content height (Save Theme):', function () {
                /**
                 *  Bottom_Top      Bottom_Parent
                 *  saved  current packed      saved     current    packed
                 *  ***      ***     ***      *******    *******    *******
                 *  *T*      *T*     *T*      *     *    *     *    *     *
                 *  * * =>   *T* =>  *T*      * *** *    * *** *    * *** *
                 *  ***      *T*     *T*      * *T* *    * *T* *    * *T* *
                 *            T      *T*      * *** *    * *T* *    * *T* *
                 *  ***              ***      *     * => *  T  * => * *T* *
                 *  ***                       *******    *     *    * *** *
                 *  ***      ***     ***                 *     *    *     *
                 *           ***     ***                 *******    *******
                 *           ***     ***
                 *
                 *
                 */
                describe('When current content height is bigger than the saved content height and the saved text component height:', function () {
                    it('Should push the other component and update the component height in dal to be the content height and keep the anchor distance', function () {
                        var savedTextCompHeight = 40;
                        var savedTextContentHeight = 20;
                        var currentTextContentHeight = 80;

                        runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);
                    });
                });

                /**
                 *  Bottom_Top      Bottom_Parent
                 *  saved  current packed      saved     current     packed
                 *  ***      ***     ***      *******    *******    *******
                 *  *T*      *T*     *T*      *     *    *     *    *     *
                 *  *T* =>   *T* =>  *T*      * *** *    * *** *    * *** *
                 *  *T*      *T*     *T*      * *T* *    * *T* *    * *T* *
                 *   T       *T*     *T*      * *T* *    * *T* * => * *T* *
                 *   T               ***      *  T  * => *  T  *    * *T* *
                 *   T                        *  T  *    *     *    * *** *
                 *   T       ***     ***      *  T  *    *     *    *     *
                 *           ***     ***      *  T  *    *******    *******
                 *  ***      ***     ***      *     *
                 *  ***                       *******
                 *  ***
                 *
                 */
                describe('When current content height is smaller than the saved content height and the bigger than the saved text component height:', function () {
                    it('Should pull the other component and update the component height in dal to be the content height and keep the anchor distance', function () {
                        var savedTextCompHeight = 40;
                        var savedTextContentHeight = 80;
                        var currentTextContentHeight = 55;

                        runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);
                    });
                });

                /**
                 *  Bottom_Top      Bottom_Parent
                 *
                 *  ***    ***      *******    *******
                 *  *T*    *T*      *     *    *     *
                 *  *T* => *T*      * *** *    * *** *
                 *  *T*    *T*      * *T* *    * *T* *
                 *   T     *T*      * *T* *    * *T* *
                 *   T     ***      *  T  * => * *T* *
                 *   T              *  T  *    * *** *
                 *   T     ***      *  T  *    *     *
                 *         ***      *  T  *    *******
                 *  ***    ***      *     *
                 *  ***             *******
                 *  ***
                 */
            });

            describe("font loads with fallback first", function () {
                beforeEach(function () {
                    spyOn(this.ps.siteAPI, 'hasPendingFonts').and.returnValue(true);
                });

                /**
                 *  Saved   Fallback  Loaded
                 *          &packed   &packed
                 *   ***      ***       ***
                 *   *T*      *T*       *T*
                 *   * *      *T*       ***
                 *   ***      *T*
                 *            *T*
                 *   ***      ***       ***
                 *   ***                ***
                 *   ***      ***       ***
                 *            ***
                 *            ***
                 */
                describe('When current content height with fallback is bigger than the text component saved heightand with the loaded font is smaller than the text component saved height:', function () {
                    it("Should pull the other component up to the its original saved top", function () {
                        var savedTextCompHeight = 40;
                        var savedTextContentHeight = 20;
                        var currentTextContentHeight = 80;

                        runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);

                        currentTextContentHeight = savedTextContentHeight;

                        updateMeasureAndValidate.call(this, currentTextContentHeight, savedTextCompHeight);
                    });

                    describe('When the anchor is locked with the fallback font:', function () {
                        it("Should pull the other component up to the its original saved top", function () {
                            var savedTextCompHeight = 40;
                            var savedTextContentHeight = 20;
                            var currentTextContentHeight = 200;

                            runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);

                            currentTextContentHeight = savedTextContentHeight;

                            updateMeasureAndValidate.call(this, currentTextContentHeight, savedTextCompHeight);
                        });
                    });
                });

                /**
                 *  Saved   Fallback  Loaded
                 *          &packed   &packed
                 *   ***      ***       ***
                 *   *T*      *T*       *T*
                 *   *T*      ***       *T*
                 *   * *                ***
                 *   * *
                 *   ***
                 *
                 *   ***      ***       ***
                 *   ***      ***       ***
                 *   ***      ***       ***
                 *
                 *
                 */
                describe('When current content height with fallback is smaller than with the loaded font:', function () {
                    it("Other component should stay without change", function () {
                        var savedTextCompHeight = 40;
                        var savedTextContentHeight = 20;
                        var currentTextContentHeight = 10;

                        runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);

                        currentTextContentHeight = savedTextContentHeight;

                        updateMeasureAndValidate.call(this, currentTextContentHeight, savedTextCompHeight);
                    });
                });

                /**
                 *  Saved   Fallback  Loaded
                 *          &packed   &packed
                 *   ***      ***       ***
                 *    T       *T*       *T*
                 *            *T*       ***
                 *             T
                 *   ***       T        ***
                 *   ***       T        ***
                 *   ***                ***
                 *            ***
                 *            ***
                 *            ***
                 *
                 *
                 */
                describe('When current content height with fallback is smaller than with the loaded font:', function () {
                    it("Other component should stay without change", function () {
                        var savedTextCompHeight = 5;
                        var savedTextContentHeight = 15;
                        var currentTextContentHeight = 80;

                        runTest.call(this, savedTextCompHeight, savedTextContentHeight, currentTextContentHeight);

                        currentTextContentHeight = savedTextContentHeight;

                        updateMeasureAndValidate.call(this, currentTextContentHeight, savedTextCompHeight);
                    });
                });
            });
        };

        function runTestsWithLockedParam(isLocked) {
            var describeMessage = isLocked ? 'locked' : 'unlocked';
            describe(describeMessage + " anchors", function () {
                beforeEach(function () {
                    this.distanceToAnchoredComp = isLocked ? lockedAnchorDistance : unlockedAnchorDistance;
                    this.validateLayoutAfterPackText = validateLayoutAfterPackText.bind(this, this.anchorType, this.distanceToAnchoredComp, this.textStructureTop);
                });

                tests();
            });
        }

        describe("BOTTOM_TOP anchors", function () {
            beforeEach(function () {
                this.anchorType = BOTTOM_TOP;
                this.textStructureTop = 20;
                this.otherCompHeight = 30;
                this.distanceToAnchoredComp = null;
                var self = this;

                this.addCompsToDal = function (textStructureHeight, textContentHeight) {
                    var result = getSavedStructureComps(textStructureHeight, textContentHeight, self.textStructureTop, this.anchorType, this.distanceToAnchoredComp);
                    result.otherComp.layout.y = result.otherCompAnchorCalculatedValue;
                    result.otherComp.layout.height = self.otherCompHeight;
                    self.ps.dal.addDesktopComps([result.textComp, result.otherComp], self.page);
                };
            });

            describe('When text comp is pushed:', function () {
                beforeEach(function () {
                    var self = this;

                    this.addCompsToDal = function (textStructureHeight, textContentHeight) {
                        var result = getSavedStructureComps(textStructureHeight, textContentHeight, self.textStructureTop, this.anchorType, this.distanceToAnchoredComp);
                        result.otherComp.layout.y = result.pushedOtherCompAnchorCalculatedValue;
                        result.otherComp.layout.height = self.otherCompHeight;
                        self.ps.dal.addDesktopComps([result.pusherComp, result.textComp, result.otherComp], self.page);
                    };
                });

                runTestsWithLockedParam(true);
                runTestsWithLockedParam(false);
            });

            runTestsWithLockedParam(true);
            runTestsWithLockedParam(false);
        });

        describe("BOTTOM_PARENT anchors", function () {
            beforeEach(function () {
                this.anchorType = BOTTOM_PARENT;
                this.textStructureTop = 20;
                this.otherCompTop = 30;
                this.distanceToAnchoredComp = null;
                var self = this;

                this.addCompsToDal = function (textStructureHeight, textContentHeight) {
                    var result = getSavedStructureComps(textStructureHeight, textContentHeight, self.textStructureTop, this.anchorType, this.distanceToAnchoredComp);
                    result.otherComp.layout.height = result.otherCompAnchorCalculatedValue;
                    result.otherComp.layout.y = self.otherCompTop;
                    result.otherComp.components = [result.textComp];
                    result.otherComp.componentType = containerType;
                    self.ps.dal.addDesktopComps([result.otherComp], self.page);
                };
            });

            describe('When text comp is pushed:', function () {
                beforeEach(function () {
                    var self = this;

                    this.addCompsToDal = function (textStructureHeight, textContentHeight) {
                        var result = getSavedStructureComps(textStructureHeight, textContentHeight, self.textStructureTop, this.anchorType, this.distanceToAnchoredComp);
                        result.otherComp.layout.height = result.pushedOtherCompAnchorCalculatedValue;
                        result.otherComp.layout.y = self.otherCompTop;
                        result.otherComp.components = [result.pusherComp, result.textComp];
                        result.otherComp.componentType = containerType;
                        self.ps.dal.addDesktopComps([result.otherComp], self.page);
                    };
                });

                runTestsWithLockedParam(true);
                runTestsWithLockedParam(false);
            });

            runTestsWithLockedParam(true);
            runTestsWithLockedParam(false);
        });

        /**
         *  Saved   Fallback   Loaded
         *
         * *** ***  *** ***   *** ***
         * *** *T*  *** *T*   *** *T*
         * *** *T*  *** *T*   *** *T*
         * *** *T*  *** *T*   *** *T*
         *     ***      *T*       ***
         *               T
         * *******            *******
         * *******  *******   *******
         *          *******
         */
        describe('SE-14125:', function () {
            it('The pushed component ', function () {
                var textStructureTop = 10;
                var textStructureHeight = 40;
                var textToOtherDistance = 10;
                var pushedTop = textStructureTop + textStructureHeight + textToOtherDistance;

                var textWithFallback = 45;
                var textWithLoadedFont = 35;

                var anchor = factory.createAnchor(textId, otherId, BOTTOM_TOP, textToOtherDistance, true, pushedTop);

                var textComp = factory.createStructure(textType, {
                    layout: {
                        y: textStructureTop,
                        height: textStructureHeight,
                        anchors: [anchor]
                    }
                }, textId);

                var pusherAnchor = factory.createAnchor(pusherId, otherId, BOTTOM_TOP, textToOtherDistance, true, pushedTop);

                var textSibling = factory.createStructure(containerType, {
                    layout: {
                        y: textStructureTop,
                        height: textStructureHeight,
                        anchors: [pusherAnchor]
                    }
                }, pusherId);

                var pushedComp = factory.createStructure(containerType, {layout: {
                    y: pushedTop
                }}, otherId);

                this.ps.dal.addDesktopComps([textComp, textSibling, pushedComp], this.page);

                this.measureMap.minHeight[textId] = textWithFallback; //FALLBACK;

                this.ps.siteAPI.forceUpdate();

                this.measureMap.minHeight[textId] = textWithLoadedFont; //LOADED;
                this.measureMap.height[textId] = textWithLoadedFont; //LOADED;

                //we do this to run pack text after the enforeAnchors
                this.ps.siteAPI.forceUpdate();

                var textLayout = getCompLayoutFromDal(this.ps, textId, this.page);
                var pushedLayout = getCompLayoutFromDal(this.ps, otherId, this.page);

                expect(textLayout.height).toBe(textWithLoadedFont);
                expect(pushedLayout.y).toBe(pushedTop);
            });
        });
    });
});
