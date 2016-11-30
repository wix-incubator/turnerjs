/**
 * Created by Talm on 14/07/2014.
 */
define(['lodash'], function (_) {
    'use strict';

    function getStaggerValue() {
        return 0.1;
    }

    var sortingFunctions = {
        getDefultAnimationValues: function (sourceNode, destinationNode, timingFunctionIndex, transName) {
            return {
                sourceNodesArrSorted: [sourceNode],
                destNodesArrSorted: [destinationNode],
                stagger: 0,
                timingFunctionIndex: timingFunctionIndex,
                transName: transName,
                sporadicallyRandom: false
            };
        },
        getUpdatedTimingFunctionIndex: function (arr, timingFunctionIndex) {
            if (timingFunctionIndex > arr.length - 1) {
                timingFunctionIndex = 0;
            }
            return timingFunctionIndex;
        },
        getCrossFadePossibleTransitionByName: function (name) {
            switch (name) {
                case "crossFadeHorizWave":
                    return this.sortMatrixByRows;
                case "crossFadeVertWave":
                    return this.sortMatrixByCols;
                case "seq_crossFade_Diagonal":
                    return this.convertMatrixToDiagonal;
            }

        },
        convertArrayToMatrix: function (arr, rowNum, colsNum) {
            var index = 0;
            var matrix = new Array(rowNum);
            _.times(rowNum, function (row) {
                if (!matrix[row]) {
                    matrix[row] = [];
                }
                _.times(colsNum, function (col) {
                    if (index < arr.length) {
                        matrix[row][col] = arr[index];
                        index++;
                    } else {
                        matrix[row][col] = -1;
                    }
                });
            });
            return matrix;
        },
        sortMatrixByRows: function (arr) {
            return [arr];
        },

        sortMatrixByCols: function (arr, rowNum, colsNum) {
            var matrix = this.convertArrayToMatrix(arr, rowNum, colsNum);
            var sortedArr = [];
            var index = 0;
            _.times(colsNum, function (col) {
                _.times(rowNum, function (row) {
                    if (matrix[row][col] !== -1) {
                        sortedArr[index] = matrix[row][col];
                        index++;
                    }
                });
            });
            return [sortedArr];
        },
        reverseMatrix: function (arr) {
            return arr.reverse();
        },

        convertMatrixToDiagonal: function (arr, rowNum, colsNum) {
            var matrix = this.convertArrayToMatrix(arr, rowNum, colsNum);
            var sortedArr = [];
            var index = 0;
            _.times(rowNum + colsNum, function (line) {
                var startCol = Math.max(0, line - rowNum);
                var count = Math.min(colsNum - startCol, line, rowNum);
                _.times(count, function (j) {
                    var val = matrix[Math.min(rowNum, line) - j - 1][startCol + j];
                    if (val !== -1) {
                        sortedArr[index] = val;
                        index++;
                    }
                });
            });
            return [sortedArr];
        },

        convertMatrixToReverseDiagonal: function (arr, rowNum, colsNum) {
            var sortedArr = this.convertMatrixToDiagonal(arr, rowNum, colsNum);
            return this.reverseMatrix(sortedArr);
        },

        getMatrixByRows: function (arr, rowNum, colsNum) {
            var index = 0;
            var matrix = new Array(rowNum);
            _.times(rowNum, function (row) {
                if (!matrix[row]) {
                    matrix[row] = [];
                }
                _.times(colsNum, function (col) {
                    if (index < arr.length) {
                        matrix[row][col] = arr[index];
                        index++;
                    }
                });
            });
            return matrix;

        },
        getMatrixByRowsReverse: function (arr, rowNum, colsNum) {
            var sortedArr = this.getMatrixByRows(arr, rowNum, colsNum);
            return this.reverseMatrix(sortedArr);
        },
        getMatrixByColsReverse: function (arr, rowNum, colsNum) {
            var sortedArr = this.getMatrixByCols(arr, rowNum, colsNum);
            return this.reverseMatrix(sortedArr);
        },
        getMatrixByCols: function (arr, rowNum, colsNum) {
            var matrix = this.getMatrixByRows(arr, rowNum, colsNum);
            var sortedMatrix = new Array(colsNum);
            _.times(colsNum, function (col) {
                if (!sortedMatrix[col]) {
                    sortedMatrix[col] = [];
                }
                _.times(rowNum, function (row) {
                    if (matrix[row][col]) {
                        sortedMatrix[col][row] = matrix[row][col];
                    }
                });
            });
            return sortedMatrix;
        }
    };
    var matrixAnimationManipulation = {


        getSortedArrayAndStagger: function (transName, sourceNode, destinationNode, rowNum, colsNum, timingFunctionIndex) {
            switch (transName) {
                case "none":
                    return {
                        sourceNodesArrSorted: [sourceNode],
                        destNodesArrSorted: [destinationNode],
                        stagger: 0,
                        transName: 'NoTransition'
                    };
                case "seq_shrink_All":
                case "seq_crossFade_All":
                    var sortedArrFunctions = [sortingFunctions.sortMatrixByRows, sortingFunctions.sortMatrixByCols, sortingFunctions.reverseMatrix, sortingFunctions.convertMatrixToDiagonal, sortingFunctions.convertMatrixToReverseDiagonal, sortingFunctions.sortMatrixByRows];
                    timingFunctionIndex = sortingFunctions.getUpdatedTimingFunctionIndex(sortedArrFunctions, timingFunctionIndex);
                    var selectedSortFunction = sortedArrFunctions[timingFunctionIndex];
                    return {
                        sourceNodesArrSorted: selectedSortFunction.call(sortingFunctions, sourceNode, rowNum, colsNum),
                        destNodesArrSorted: selectedSortFunction.call(sortingFunctions, destinationNode, rowNum, colsNum),
                        stagger: (timingFunctionIndex === sortedArrFunctions.length - 1 || sourceNode.length !== destinationNode.length) ? 0 : 0.1,
                        timingFunctionIndex: timingFunctionIndex,
                        transName: (transName === "seq_shrink_All") ? "Shrink" : "CrossFade"
                    };
                case "swipe_horiz_All":
                    var sortedArrFunctionsHorizontal = [sortingFunctions.getMatrixByRows, sortingFunctions.getMatrixByRowsReverse];
                    timingFunctionIndex = sortingFunctions.getUpdatedTimingFunctionIndex(sortedArrFunctionsHorizontal, timingFunctionIndex);
                    var selectedSortFunctionHorizontal = sortedArrFunctionsHorizontal[timingFunctionIndex];

                    return {
                        sourceNodesArrSorted: selectedSortFunctionHorizontal.call(sortingFunctions, sourceNode, rowNum, colsNum),
                        destNodesArrSorted: selectedSortFunctionHorizontal.call(sortingFunctions, destinationNode, rowNum, colsNum),
                        stagger: getStaggerValue(),
                        timingFunctionIndex: timingFunctionIndex,
                        transName: "SlideHorizontal",
                        sporadicallyRandom: rowNum > 1
                    };
                case "swipe_vert_All":
                    var sortedArrFunctionsVertical = [sortingFunctions.getMatrixByCols, sortingFunctions.getMatrixByColsReverse];
                    timingFunctionIndex = sortingFunctions.getUpdatedTimingFunctionIndex(sortedArrFunctionsVertical, timingFunctionIndex);
                    var selectedSortFunctionVertical = sortedArrFunctionsVertical[timingFunctionIndex];
                    return {
                        sourceNodesArrSorted: selectedSortFunctionVertical.call(sortingFunctions, sourceNode, rowNum, colsNum),
                        destNodesArrSorted: selectedSortFunctionVertical.call(sortingFunctions, destinationNode, rowNum, colsNum),
                        stagger: getStaggerValue(),
                        timingFunctionIndex: timingFunctionIndex,
                        transName: "SlideVertical",
                        sporadicallyRandom: colsNum > 1
                    };
                case "seq_random" :
                    var transitionMapKeys = ["seq_shrink_All", "seq_crossFade_All", "swipe_horiz_All", "swipe_vert_All"];
                    var rndAnimationName = transitionMapKeys[Math.floor(Math.random() * (transitionMapKeys.length))];
                    return this.getSortedArrayAndStagger(rndAnimationName, sourceNode, destinationNode, rowNum, colsNum, timingFunctionIndex);

                case "horizSwipeAllAtOnce":
                    return sortingFunctions.getDefultAnimationValues(sourceNode, destinationNode, timingFunctionIndex, "SlideHorizontal");

                case "vertSwipeAllAtOnce":
                    return sortingFunctions.getDefultAnimationValues(sourceNode, destinationNode, timingFunctionIndex, "SlideVertical");

                case "crossFadeAllAtOnce":
                    return sortingFunctions.getDefultAnimationValues(sourceNode, destinationNode, timingFunctionIndex, "CrossFade");
                case "crossFadeHorizWave":
                case "crossFadeVertWave":
                case "seq_crossFade_Diagonal":
                    var sortFunction = sortingFunctions.getCrossFadePossibleTransitionByName(transName);
                    return {
                        sourceNodesArrSorted: sortFunction.call(sortingFunctions, sourceNode, rowNum, colsNum),
                        destNodesArrSorted: sortFunction.call(sortingFunctions, destinationNode, rowNum, colsNum),
                        stagger: 0.1,
                        timingFunctionIndex: timingFunctionIndex,
                        transName: "CrossFade"
                    };
                case "seq_swipe_alternate":
                    var possibleSortedFunctions = [sortingFunctions.getMatrixByRows, sortingFunctions.getMatrixByCols];
                    timingFunctionIndex = sortingFunctions.getUpdatedTimingFunctionIndex(possibleSortedFunctions, timingFunctionIndex);
                    return {
                        sourceNodesArrSorted: sourceNode,
                        destNodesArrSorted: destinationNode,
                        stagger: getStaggerValue(),
                        timingFunctionIndex: timingFunctionIndex,
                        transName: timingFunctionIndex === 0 ? "SlideHorizontal" : "SlideVertical"
                    };
            }
        }
    };
    return matrixAnimationManipulation;


});
