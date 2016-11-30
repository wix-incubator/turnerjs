(function() {
    window.__profiler = window.__profiler || {} ;

    // profiler
    window.__profiler.___profileFunction = function(originalFunction, functionName, className) {
        if(!_isProfiling()){
            return originalFunction ;
        }
        _initProfilerStats();

        var overrideMethod = null ;

        if (originalFunction) {
            overrideMethod = _createFunctionProxy(originalFunction, functionName, className);
            originalFunction.$wrapperFunction = overrideMethod;
        }

        return overrideMethod;
    } ;

    function _initProfilerStats() {
        var profilerNS      = window.__profiler ;
        profilerNS.runTime  = profilerNS.runTime || {};
        profilerNS.runtimeCallStack   = profilerNS.runtimeCallStack || [];
        profilerNS.rtCanon  = profilerNS.rtCanon || {};
    }

    function _createFunctionProxy(originalFunction, functionName, className) {
        return function () {
            if (!_isProfiling() || _stopProfiling()) {
                return originalFunction.apply(this, arguments);
            }
            var profilerNS = window.__profiler;

            var funcFullName = className + "::" + functionName;
            var myRTCanon = _getOrCreateRTCanon(funcFullName);
            profilerNS.runtimeCallStack.push(myRTCanon);

            if (!profilerNS.runTime[funcFullName]) {
                profilerNS.runTime[funcFullName] = _createFunctionRTStatistics();
            }

            var methodRT = profilerNS.runTime[funcFullName];

            // execute original
            myRTCanon.selfTimeCalls.push(0);
            var start = performance.now();
            var result = originalFunction.apply(this, arguments);
            var end = performance.now();
            var duration = end - start;

            myRTCanon.totalTime += duration;
            myRTCanon.counter++;

            methodRT.runs.push(duration);
            methodRT.selfRuns.push([myRTCanon.selfTimeCalls[myRTCanon.selfTimeCalls.length - 1] + duration, arguments]);
            methodRT.totalTime += duration;

            // Check parent caller
            var parentMethodRT;
            if (profilerNS.runtimeCallStack.length > 1) {
                var parentCaller = profilerNS.runtimeCallStack[profilerNS.runtimeCallStack.length - 2];
                var parentMethodRTRef = parentCaller.ref;
                parentMethodRT = profilerNS.runTime[parentMethodRTRef];

                parentCaller.childrenTime += duration;
                parentMethodRT.childrenTotalTime += duration;

                if (parentCaller === myRTCanon) {
                    parentCaller.selfTimeCalls[parentCaller.selfTimeCalls.length - 2] -= duration;
                } else {
                    parentCaller.selfTimeCalls[parentCaller.selfTimeCalls.length - 1] -= duration;
                }
            }

            myRTCanon.selfTimeCalls.pop();
            profilerNS.runtimeCallStack.pop();
            return result;
        };
    }

    function _isProfiling() {
        if(!window.__profiler._isProfiling) {
            window.__profiler._isProfiling = location.href.indexOf("profiler=true") > -1 ;
        }
        return window.__profiler._isProfiling;
    }

    function _isSiteReadyByViewMode(){
        if(window.viewMode === 'site'){
            return window.W && window.W.Viewer && window.W.Viewer._activeViewer_ && window.W.Viewer._activeViewer_._isSiteReady;
        }else if(window.viewMode === 'editor'){
            return window.W && window.W.Preview && window.W.Preview._previewReady;
        }
    }
    function _stopProfiling(){
        if(window._stopProfiling){
            return true;
        }
        if(_isSiteReadyByViewMode()){
            window._stopProfiling = true;
            return true;
        }
        return false;
    }

    function _createFunctionRTStatistics() {
        return {
            totalTime: 0,
            childrenTotalTime: 0,
            runs: [],
            selfRuns: []
        };
    }

    var _getOrCreateRTCanon = function (funcFullName) {
        var profilerNS  = window.__profiler ;
        var result;
        if (profilerNS.runtimeCallStack.length === 0) {
            // first function being called in the call stack
            if (!profilerNS.rtCanon[funcFullName]) { //was it called already as first function
                result = profilerNS.rtCanon[funcFullName] = _createEmptyRTCanon(funcFullName);
            } else {
                result = profilerNS.rtCanon[funcFullName];
            }
        } else {
            // other function called me
            //the last item in the path is the previous function in the call
            var callerRTCanon = profilerNS.runtimeCallStack[profilerNS.runtimeCallStack.length - 1];

            if (!callerRTCanon.next[funcFullName]) { //was it called already from the caller function - it is in the "next" object
                //not on caller add me to it
                result = callerRTCanon.next[funcFullName] = _createEmptyRTCanon(funcFullName);
            } else {
                result = callerRTCanon.next[funcFullName];
            }
        }
        return result;
    };

    var _createEmptyRTCanon = function (funcRef) {
        return {
            "ref":funcRef,
            "totalTime": 0,
            "childrenTime": 0,
            "counter": 0,
            "next": {},
            "selfTimeCalls": []
        };
    };



    // ============== Profiler Utility methods ==============
    var profilerUtilities = {

        // Profiler Utils.
        filterAbove: function (aboveMillis) {
            var profUtil = window.__profiler ;
            var ra = {};
            for (var item in profUtil.rtCanon) {
                if (profUtil.rtCanon[item].totalTime > aboveMillis) {
                    ra[item] = profUtil.rtCanon[item];
                }
            }
            return ra ;
        },

        findBiggestRootFrom: function(node) {
            if (!node) {
                return null;
            }

            var calls = 0;
            var max = -1;
            var nodeHasChildren = true;
            var parents = [node];

            while (node && nodeHasChildren) {
                nodeHasChildren = false;
                calls++;
                var nextMax = null;
                var child = null;
                for (child in node.next) {
                    nodeHasChildren = true;
                    if (child && node.next[child] && node.next[child].totalTime > max) {
                        max = node.next[child].totalTime;
                        nextMax = child;
                    }
                }
                var max = -1;
                if (child) {
                    parents.push(node);
                    node = node.next[nextMax];
                }
            }
            return [calls, parents, node];
        },


        getPathFromNode: function (rootNode, toNodeName) {
            function getPathFromNodeHelper(rootNode, toNodeName, path) {
                if (!rootNode || !toNodeName) {
                    return "Not Found";
                }
                path.push(rootNode);
                if (rootNode.ref === toNodeName) {
                    return path;
                } else {
                    var result;
                    for (var item in rootNode.next) {
                        result = getPathFromNodeHelper(rootNode.next[item], toNodeName, path);
                        if (result) {
                            return result;
                        }
                        path.pop();
                    }
                }
                return null;
            }
            return getPathFromNodeHelper(rootNode, toNodeName, []);
        },

        getMethodPerformance: function (methodName) {
            var calls = [];
            var profilerNS = window.__profiler;
            for (var f in profilerNS.rtCanon) {
                var res = profilerNS.getPathFromNode(profilerNS.rtCanon[f], methodName);
                if (res) {
                    calls.push(res);
                }
            }
            return calls;
        },

        getManualStatistics: function() {
            // statistics
            var getTotalTime = function(attrib) {
                if(!window.statistics[attrib] || window.statistics[attrib].length === 0) {
                    return 0 ;
                }
                return window.statistics[attrib].map(function(i){return i[1];}).reduce(
                    function(a,b){
                        if(!Number.isNaN(a) && !Number.isNaN(b)) {
                            return a + b;
                        } else {
                            if(Number.isNaN(a)) {
                                if(Number.isNaN(b)) {
                                    return 0 ;
                                }
                                return b ;
                            } else if(Number.isNaN(b)) {
                                if(Number.isNaN(a)) {
                                    return 0 ;
                                }
                                return a ;
                            } else {
                                return 0 ;
                            }
                        }
                    },0) ;
            };

            var s = "";
            for(var item in window.statistics) {
                s+= item + " = " + getTotalTime(item) ;
                if(window.statistics[item].length > 0 && window.statistics[item][0].length >= 3) {
                    s+= ", parent: " + window.statistics[item][0][2] ;
                }
                s+= ";" ;
            }
            s.split(";").sort().join("\n");
            return s ;
        },

        getSortedMethodsBySelf: function () {
            var profilerNS = window.__profiler;
            var ra = [];
            for (var i in profilerNS.runTime) {
                ra.push([i, profilerNS.runTime[i].totalTime, profilerNS.runTime[i].childrenTotalTime, profilerNS.runTime[i].runs]);
            }
            return _.sortBy(ra, function (a) {
                if (a) {
                    return a[1] - a[2];
                }
                return 0;
            });
        },

        getSortedMethodsByCount: function() {
            var profilerNS = window.__profiler ;
            var ra = [];
            for (var i in profilerNS.runTime) {
                ra.push([i, profilerNS.runTime[i].totalTime, profilerNS.runTime[i].childrenTotalTime, profilerNS.runTime[i].runs]);
            }
            return _.sortBy(ra, function(i){return i[3].length || 0;});
        },

        getSortedMethodsByAvg: function() {
            var profilerNS = window.__profiler ;
            var ra = []; for(var i in profilerNS.runTime) {
                var methodRuntime = profilerNS.runTime[i];
                ra.push([i, methodRuntime.totalTime, methodRuntime.childrenTotalTime, methodRuntime.runs, methodRuntime.selfRuns]);
            }
            return _.sortBy(ra, function(item){
                var averageSelf = item[4][0] === 0 ? 0 : item[4].reduce(function (a, b) {
                    return [a[0] + b[0], ""];
                }, [0,""])[0] / item[4].length ;
                item.averageSelfTime = averageSelf ;
                return averageSelf ;});
        },

        getSortedMethodsByLargestSelfRuntime: function(){
            var arr = this.getSortedMethodsByAvg();

            var result = {totalTime: 0, coll: []};
            var mapper = function (val){
                var name = val[0],
                    average = val.averageSelfTime,
                    count = val[3].length;

                var newItem = {
                    name: name,
                    average: average,
                    count: count,
                    totalTime:  average*count
                };
                result.coll.push(newItem);
                result.totalTime += newItem.totalTime;
            };

            _.forEach(arr, mapper);
            result.coll.reverse();
            return result;
        }
    } ;

    if(_isProfiling()) {
        var profUtil                        = window.__profiler ;
        profUtil.filterAbove                = profilerUtilities.filterAbove ;
        profUtil.findBiggestRootFrom        = profilerUtilities.findBiggestRootFrom ;
        profUtil.getPathFromNode            = profilerUtilities.getPathFromNode ;
        profUtil.getMethodPerformance       = profilerUtilities.getMethodPerformance ;
        profUtil.getManualStatistics        = profilerUtilities.getManualStatistics ;
        profUtil.getSortedMethodsBySelf     = profilerUtilities.getSortedMethodsBySelf ;
        profUtil.getSortedMethodsByCount    = profilerUtilities.getSortedMethodsByCount ;
        profUtil.getSortedMethodsByAvg      = profilerUtilities.getSortedMethodsByAvg ;
        profUtil.getSortedMethodsByLargestSelfRuntime = profilerUtilities.getSortedMethodsByLargestSelfRuntime ;
    }
})() ;
