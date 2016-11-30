/**@class wysiwyg.viewer.utils.MatrixTransitions */
define.Class('wysiwyg.viewer.utils.MatrixTransitions', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.viewer.utils.TransitionUtils']);
    def.binds([
        '_matrixCrossFade',
        '_crossFade',
        '_shrinkFade',
        '_vertSwipe',
        '_horizSwipe',
        '_transitionSequence',
        '_transitionSequenceGenerator',
        '_generalTransition',
        '_destroyHolder',
        '_rotateDiagonalTiming',
        '_noTransition',
        '_timingDiagonalWave'
    ]);
    def.fields({
        _transitionUtils: null,
        _sequenceIndex: 0,
        _positioningFunc: null,
        _itemsContainer: null
    });
    /**@lends wysiwyg.viewer.utils.MatrixTransitions */
    def.methods({

        initialize: function () {
            this._transitionUtils = new this.imports.TransitionUtils();
        },

        setupTransitionMap: function (positioningFunc, itemsContainer) {
            this._positioningFunc = positioningFunc;
            this._itemsContainer = itemsContainer;

            var transMap = {
                'crossFadeAllAtOnce': this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingAllAtOnce)),
                'crossFadeSequential': this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingSequential)),
                'crossFadeHorizWave': this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingHorizontalWave)),
                'crossFadeVertWave': this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingVerticalWave)),
                'crossFadeDiagonal': this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingDiagonalWave)),

                'shrinkFadeAllAtOnce': this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingAllAtOnce)),
                'shrinkFadeSequential': this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingSequential)),
                'shrinkFadeHorizWave': this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingHorizontalWave)),
                'shrinkFadeVertWave': this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingVerticalWave)),
                'shrinkFadeDiagonal': this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingDiagonalWave)),

                'vertSwipeAllAtOnce': this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeAllAtOnce, this._swipeSingleDirection)),
                'vertSwipeWave': this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                'vertSwipeAlternate': this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate)),

                'horizSwipeAllAtOnce': this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeAllAtOnce, this._swipeSingleDirection)),
                'horizSwipeWave': this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                'horizSwipeAlternate': this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate)),

                /* this._Sequences */

                /* this._Basic, this._all-this._inclusive this._sequences */

                'seq_crossFade_All': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingAllAtOnce)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingSequential)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingHorizontalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._reverseTiming(this._timingHorizontalWave))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingVerticalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._reverseTiming(this._timingVerticalWave))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 0))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 1))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 2))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 3)))
                ]),

                'seq_shrink_All': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingAllAtOnce)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingSequential)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingHorizontalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._reverseTiming(this._timingHorizontalWave))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingVerticalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._reverseTiming(this._timingVerticalWave))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 0))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 1))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 2))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 3)))
                ]),

                'swipe_horiz_All': this._transitionSequence([
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeAllAtOnce, this._swipeSingleDirection)),
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._reverseTiming(this._timingSwipeWave), this._swipeSingleDirection)),
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate))
                ]),

                'swipe_vert_All': this._transitionSequence([
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeAllAtOnce, this._swipeSingleDirection)),
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._reverseTiming(this._timingSwipeWave), this._swipeSingleDirection)),
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate))
                ]),

                /* this._Cross-this._Fade this._sequences */
                'seq_crossFade_Horiz': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingHorizontalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._reverseTiming(this._timingHorizontalWave)))
                ]),

                'seq_crossFade_Vert': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingVerticalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._reverseTiming(this._timingVerticalWave)))
                ]),

                'seq_crossFade_Seq': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._timingSequential)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._reverseTiming(this._timingSequential)))
                ]),

                'seq_crossFade_Diagonal': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 0))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 1))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 2))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._matrixCrossFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 3)))
                ]),

                /* this._Shrink-this._Fade this._sequences */

                'seq_shrink_Horiz': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingHorizontalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._reverseTiming(this._timingHorizontalWave)))
                ]),

                'seq_shrink_Vert': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingVerticalWave)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._reverseTiming(this._timingVerticalWave)))
                ]),

                'seq_shrink_Seq': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._timingSequential)),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._reverseTiming(this._timingSequential)))
                ]),

                'seq_shrink_Diagonal': this._transitionSequence([
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 0))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 1))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 2))),
                    this._generalTransition(this._matrixCrossFadePrepare, this._shrinkFade(this._rotateDiagonalTiming(this._timingDiagonalWave, 3)))
                ]),

                /* this.Swipe */

                'seq_swipe_alternate': this._transitionSequence([
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate)),
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeAllAtOnce, this._swipeAlternate))
                ]),

                'seq_swipe_vert_wave': this._transitionSequence([
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                    this._generalTransition(this._vertSwipePrepare, this._vertSwipe(this._reverseTiming(this._timingSwipeWave), this._swipeSingleDirection))
                ]),

                'seq_swipe_horiz_wave': this._transitionSequence([
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._timingSwipeWave, this._swipeSingleDirection)),
                    this._generalTransition(this._horizSwipePrepare, this._horizSwipe(this._reverseTiming(this._timingSwipeWave), this._swipeSingleDirection))
                ])
            };

            transMap['none'] = this._generalTransition(this._matrixCrossFadePrepare, this._noTransition);
            this._transitionMap = transMap;

            transMap['seq_random'] = this._transitionSequenceGenerator(this._transitionRandomPicker(this.getTransitionList()));
        },

        getTransition: function (transName) {
            return this._transitionMap[transName];
        },

        getTransitionList: function () {
            var result = [];
            for (var transName in this._transitionMap) {
                result.push(transName);
            }
            return result;
        },

        _generalTransition: function (prepareFunc, transitionFunc) {
            return function (currentItems, incomingItems, numCols, numRows, direction, duration, onComplete) {
                var holderList = prepareFunc(currentItems, incomingItems, numCols, numRows, this._itemsContainer, this._positioningFunc);
                transitionFunc(holderList, numCols, numRows, direction, duration, onComplete);
            }.bind(this);
        },

        _transitionSequence: function (transNameList) {
            return function (currentItems, incomingItems, numCols, numRows, direction, duration, onComplete) {
                this._sequenceIndex = this._sequenceIndex < transNameList.length ? this._sequenceIndex : 0;
                var transition = transNameList[this._sequenceIndex++];
                var transFunc = (typeOf(transition) === "function") ? transition : transMap[transition];
                transFunc(currentItems, incomingItems, numCols, numRows, direction, duration, onComplete);
            }.bind(this);
        },

        _transitionSequenceGenerator: function (generatorFunc) {
            return function (currentItems, incomingItems, numCols, numRows, direction, duration, onComplete) {
                var transFunc = generatorFunc(this._sequenceIndex);
                transFunc(currentItems, incomingItems, numCols, numRows, direction, duration, onComplete);
            }.bind(this);
        },

        _transitionRandomPicker: function (candidateList) {
            return function () {
                var transName = (candidateList[parseInt(Math.random() * candidateList.length)]);
                return this._transitionMap[transName];
            }.bind(this);
        },

        _destroyHolder: function (holder, index) {
            var incomingDiv = holder.children[0];
            if (incomingDiv) {
                this._itemsContainer.adopt(incomingDiv);
                var pos = this._positioningFunc(index);
                incomingDiv.setStyles({ position: "absolute", left: pos.left + "px", top: pos.top + "px"});
            }
            holder.destroy();
        },

        _matrixCrossFadePrepare: function (currentItems, incomingItems, numCols, numRows, itemsContainer, positioningFunc) {
            // Create holders
            var holderList = [];
            var holder;
            var currentItem;
            var incomingItem;
            var holderPos;

            itemsContainer.empty();
            var itemCount = numCols * numRows;
            for (var i = 0; i < itemCount; i++) {
                holder = new Element('div');
                itemsContainer.adopt(holder);
                currentItem = currentItems[i] || new Element('div');
                incomingItem = incomingItems[i] || new Element('div');
                holder.adopt(incomingItem, currentItem);

                if (!currentItems[i]) {
                    incomingItem.setStyles({
                        "opacity": "0.0"
                    });
                }
                currentItem.setStyles({
                    left: '0px',
                    top: '0px'
                });
                incomingItem.setStyles({
                    left: '0px',
                    top: '0px'
                });


                holderList.push(holder);
                holderPos = positioningFunc(i);
                holder.setStyles({ position: "absolute", left: holderPos.left + "px", top: holderPos.top + "px"});
            }
            return holderList;
        },

        _noTransition: function (holderList, numCols, numRows, direction, duration, onComplete) {
            holderList.forEach(this._destroyHolder);
            onComplete();
        },

        _crossFade: function (transitionFunc, timingFunc) {
            var self = this;
            return function (holderList, numCols, numRows, direction, duration, onComplete) {
                var transCount = holderList.length;
                for (var i = 0; i < holderList.length; i++) {
                    (function () {
                        var index = i;
                        setTimeout(
                            function () {
                                var currentDiv = holderList[index].children[1];
                                var incomingDiv = holderList[index].children[0];
                                transitionFunc(currentDiv, incomingDiv, 0,
                                    duration,
                                    function () {
                                        self._destroyHolder(holderList[index], index);
                                        transCount--;
                                        if (transCount <= 0) {
                                            onComplete();
                                        }
                                    });
                            },
                            timingFunc(index, duration * 1000, numCols, numRows));
                    })();
                }
            };
        },

        _matrixCrossFade: function (timingFunc) {
            return this._crossFade(this._transitionUtils.getTransition(Constants.TransitionTypes.CROSS_FADE), timingFunc);
        },

        _shrinkFade: function (timingFunc) {
            return this._crossFade(this._transitionUtils.getTransition(Constants.TransitionTypes.SHRINK_FADE), timingFunc);
        },

        _vertSwipePrepare: function (currentItems, incomingItems, numCols, numRows, itemsContainer, positioningFunc) {
            // Create holders
            var holderList = [];
            var holder;
            var currentItem;
            var incomingItem;
            var holderPos;
            var itemIndex;
            var itemPos;
            var currentHolder;
            var incomingHolder;
            var holderHeight;

            itemsContainer.empty();
            holderHeight = positioningFunc(numRows * numCols).top;
            var itemCount = numCols * numRows;
            for (var i = 0; i < numCols; i++) {
                holder = new Element('div');
                itemsContainer.adopt(holder);
                currentHolder = new Element('div');
                holder.adopt(currentHolder);
                incomingHolder = new Element('div');
                holder.adopt(incomingHolder);
                currentHolder.setStyles({ "position": "absolute", "top": "0px", "height": holderHeight + "px" });
                incomingHolder.setStyles({ "position": "absolute", "top": holderHeight + "px", "height": holderHeight + "px" });

                for (var j = 0; j < numRows; j++) {
                    itemIndex = (j * numCols) + i;
                    itemPos = positioningFunc(itemIndex);
                    currentItem = currentItems[itemIndex] || new Element('div');
                    incomingItem = incomingItems[itemIndex] || new Element('div');
                    incomingHolder.adopt(incomingItem);
                    currentHolder.adopt(currentItem);

                    currentItem.setStyles({
                        left: '0px',
                        top: itemPos.top + 'px'
                    });
                    incomingItem.setStyles({
                        left: '0px',
                        top: itemPos.top + 'px'
                    });
                }

                holderList.push(holder);
                holderPos = positioningFunc(i);
                holder.setStyles({ position: "absolute", left: holderPos.left + "px"});
            }
            return holderList;
        },

        _horizSwipePrepare: function (currentItems, incomingItems, numCols, numRows, itemsContainer, positioningFunc) {
            // Create holders
            var holderList = [];
            var holder;
            var currentItem;
            var incomingItem;
            var holderPos;
            var itemIndex;
            var itemPos;
            var currentHolder;
            var incomingHolder;
            var holderWidth;

            itemsContainer.empty();
            itemPos = positioningFunc(numCols - 1);
            holderWidth = itemPos.left + itemPos.width;
            var itemCount = numCols * numRows;
            for (var i = 0; i < numRows; i++) {
                holder = new Element('div');
                itemsContainer.adopt(holder);
                currentHolder = new Element('div');
                holder.adopt(currentHolder);
                incomingHolder = new Element('div');
                holder.adopt(incomingHolder);
                currentHolder.setStyles({ "position": "absolute", "left": "0px", "width": holderWidth + "px" });
                incomingHolder.setStyles({ "position": "absolute", "left": holderWidth + "px", "width": holderWidth + "px" });

                for (var j = 0; j < numCols; j++) {
                    itemIndex = (i * numCols) + j;
                    itemPos = positioningFunc(itemIndex);
                    currentItem = currentItems[itemIndex] || new Element('div');
                    incomingItem = incomingItems[itemIndex] || new Element('div');
                    incomingHolder.adopt(incomingItem);
                    currentHolder.adopt(currentItem);

                    currentItem.setStyles({
                        top: '0px',
                        left: itemPos.left + 'px'
                    });
                    incomingItem.setStyles({
                        top: '0px',
                        left: itemPos.left + 'px'
                    });
                }

                holderList.push(holder);
                holderPos = positioningFunc(i * numCols);
                holder.setStyles({ position: "absolute", top: holderPos.top + "px"});
            }
            return holderList;
        },

        _vertSwipe: function (timingFunc, swipeFunc) {
            var transitionFunc = this._transitionUtils.getTransition(Constants.TransitionTypes.SWIPE_VERTICAL);
            var self = this;
            return function (holderList, numCols, numRows, direction, duration, onComplete) {
                var transCount = holderList.length;
                for (var i = 0; i < holderList.length; i++) {
                    (function () {
                        var index = i;
                        setTimeout(
                            function () {
                                swipeFunc(transitionFunc, holderList, index, direction, duration,
                                    function () {
                                        var incomingDivList = holderList[index].children[1].children;
                                        for (var j = incomingDivList.length - 1; j >= 0; j--) {
                                            var incomingDiv = incomingDivList[j];
                                            self._itemsContainer.adopt(incomingDiv);
                                            var pos = self._positioningFunc((j * numCols) + index);
                                            incomingDiv.setStyles({ position: "absolute", left: pos.left + "px", top: pos.top + "px"});
                                        }

                                        holderList[index].destroy();

                                        transCount--;
                                        if (transCount <= 0) {
                                            onComplete();
                                        }
                                    });
                            },
                            timingFunc(index, duration * 1000, holderList.length));
                    })();
                }
            };
        },

        _horizSwipe: function (timingFunc, swipeFunc) {
            var transitionFunc = this._transitionUtils.getTransition(Constants.TransitionTypes.SWIPE_HORIZONTAL);
            var self = this;
            return function (holderList, numCols, numRows, direction, duration, onComplete) {
                var transCount = holderList.length;
                for (var i = 0; i < holderList.length; i++) {
                    (function () {
                        var index = i;
                        setTimeout(
                            function () {
                                swipeFunc(transitionFunc, holderList, index, direction, duration,
                                    function () {
                                        var incomingDivList = holderList[index].children[1].children;
                                        for (var j = incomingDivList.length - 1; j >= 0; j--) {
                                            var incomingDiv = incomingDivList[j];
                                            self._itemsContainer.adopt(incomingDiv);
                                            var pos = self._positioningFunc((index * numCols) + j);
                                            incomingDiv.setStyles({ position: "absolute", left: pos.left + "px", top: pos.top + "px"});
                                        }

                                        holderList[index].destroy();
                                        transCount--;
                                        if (transCount <= 0) {
                                            onComplete();
                                        }
                                    });
                            },
                            timingFunc(index, duration * 1000, holderList.length));
                    })();
                }
            };
        },


        _swipeSingleDirection: function (transitionFunc, holderList, index, direction, duration, onComplete) {
            transitionFunc(holderList[index].children[0], holderList[index].children[1], direction, duration, onComplete);
        },

        _swipeAlternate: function (transitionFunc, holderList, index, direction, duration, onComplete) {
            if (index % 2 === 0) {
                transitionFunc(holderList[index].children[0], holderList[index].children[1], direction, duration, onComplete);
            } else {
                direction = direction == 0 ? 1 : 0;
                transitionFunc(holderList[index].children[0], holderList[index].children[1], direction, duration, onComplete);
            }
        },

        _timingAllAtOnce: function (index, duration, numCols, numRows) {
            return 0;
        },

        _timingSequential: function (index, duration, numCols, numRows) {
            return (index / (numCols * numRows)) * duration;
        },

        _timingHorizontalWave: function (index, duration, numCols, numRows) {
            var col = index % numCols;
            var row = Math.floor((index - col) / numCols);
            return (col / numCols) * duration;
        },

        _timingVerticalWave: function (index, duration, numCols, numRows) {
            var col = index % numCols;
            var row = Math.floor((index - col) / numCols);
            return (row / numRows) * duration;
        },

        _reverseTiming: function (timingFunc) {
            return function (index, duration) {
                return duration - timingFunc.apply(this, arguments);
            };
        },

        _standardDiagonalDistFunc: function (col, row) {
            return Math.sqrt(col * col + row * row);
        },

        _timingDiagonalWave: function (index, duration, numCols, numRows, distFunc) {
            distFunc = distFunc || this._standardDiagonalDistFunc;
            var col = index % numCols;
            var row = Math.floor((index - col) / numCols);
            var dist = distFunc(col, row, numCols, numRows);
            var maxDist = Math.sqrt(numCols * numCols + numRows * numRows);
            return (dist / maxDist) * duration;
        },

        _timingSwipeAllAtOnce: function (index, duration, totalCount) {
            return 0;
        },

        _timingSwipeWave: function (index, duration, totalCount) {
            return (0.6 + (index * 0.4 / totalCount)) * duration;
        },

        _rotateDiagonalTiming: function (diagonalTimingFunc, quadrant) {
            var distFunc;
            var self = this;
            if (quadrant <= 0 || quadrant > 3) {
                distFunc = this._standardDiagonalDistFunc;
            } else if (quadrant == 1) {
                distFunc = function (col, row, numCols, numRows) {
                    return self._standardDiagonalDistFunc(numCols - col, row);
                };
            } else if (quadrant == 2) {
                distFunc = function (col, row, numCols, numRows) {
                    return self._standardDiagonalDistFunc(numCols - col, numRows - row);
                };
            } else {
                distFunc = function (col, row, numCols, numRows) {
                    return self._standardDiagonalDistFunc(col, numRows - row);
                };
            }
            return function (index, duration, numCols, numRows) {
                return diagonalTimingFunc(index, duration, numCols, numRows, distFunc);
            };
        }
    });
});
