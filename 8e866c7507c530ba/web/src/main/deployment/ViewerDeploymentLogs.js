define.bootstrapClass('deployment.ViewerDeploymentLogs', function(){

    function sendPageLoadingBI340(timeoutSeconds){
        if (this.alreadyLoadedInPrev340) {
            return;
        }
        this.alreadyLoadedInPrev340 = W.Viewer.isSiteReady();

        if (window.viewMode && window.viewMode !== 'site') {
            return;
        }
        if (!LOG.isThisSiteInEventSampleRatio(wixEvents.LOAD_PAGE_DATA.sampleRatio)) {
            return;
        }

        var isFromEditor = (document.referrer.indexOf("editor.wix.com/html/editor") !== -1);

        var pageLoadData = {
            'isFromEditor':             isFromEditor,
            'isMobile':                 (W.Config.mobileConfig ? W.Config.mobileConfig.isMobileOrTablet() : 'unknown'),
            'isLoaded':                 W.Viewer.isSiteReady(),
            'classRepoIsReadyTime':     deployStatus.classRepoIsReadyTime,
            'experimentsIsReadyTime':   deployStatus.experimentsIsReadyTime
        };

        addStaticHtmlLoadingReportForBI340(pageLoadData);
        addViewerRenderReportForBI340(pageLoadData);
        addPagesLoadReportForBI340(pageLoadData);
        addDeploymentReportForBI340(pageLoadData);
        addWixAppsReportForBI340(pageLoadData);

        LOG.reportEvent(wixEvents.LOAD_PAGE_DATA, {
            'c1': JSON.stringify(pageLoadData),
            'c2': JSON.stringify(processFilesLoadingData()),
            'i1': timeoutSeconds
        });
    }

    function addStaticHtmlLoadingReportForBI340(pageLoadData){
        var staticLoadingLog = deployStatus.logs.loadStaticHtml || [];
        var loadEndTime = -1, loadStartTime = -1, domReadyTime = -1, error = null, hasGalleries = false;

        if(staticLoadingLog.length > 0 && staticLoadingLog[0].step === 'start loading') {
            loadStartTime = staticLoadingLog[0].time;
        }

        if(staticLoadingLog.length > 1 && staticLoadingLog[1].step === 'end loading') {
            loadEndTime = staticLoadingLog[1].time;
            error = staticLoadingLog[1].errorDesc;
        }
        if(staticLoadingLog.length > 2 && staticLoadingLog[2].step === 'dom ready') {
            domReadyTime = staticLoadingLog[2].time;
            hasGalleries = staticLoadingLog[2].hasGalleries;
        }
        pageLoadData.staticHtml = {
            'start': loadStartTime,
            'endLoading': loadEndTime,
            'done': domReadyTime
        };

        if(domReadyTime > 0){
            pageLoadData.staticHtml.hasTPAGalleries = hasGalleries;
        }
        if(error){
            pageLoadData.staticHtml.hadErrors = true;
        }
    }

    function addViewerRenderReportForBI340(pageLoadData){
        var viewerRenderLog = deployStatus.logs.viewerRender || [];
        var siteReadyTime = -1, renderStartTime = -1, renderEndTime = -1;

        if(viewerRenderLog.length > 1 && viewerRenderLog[1].step === 'site ready') {
            siteReadyTime = viewerRenderLog[1].time;
            renderEndTime = viewerRenderLog[1].time;
        }
        if(viewerRenderLog.length > 0) {
            renderStartTime = viewerRenderLog[0].time;
        }

        pageLoadData.render = {
            'start':    renderStartTime,
            'done':     renderEndTime
        };
        pageLoadData.siteReadyTime = siteReadyTime;
    }

    function addPagesLoadReportForBI340(pageLoadData){
        var pagesLog = deployStatus.logs.pageLoad || [];
        var pagesResults = getPagesReportForBI340(pagesLog);
        var pageLoadResults = pagesResults.pagesReport;
        var pagesStartTime =  pagesResults.startTime;

        pageLoadData.pages = {
            'start':    pagesStartTime,
            'pages':    pageLoadResults
        };
    }

    function getPagesReportForBI340(pagesLog){
        var pageLoadResults = {};
        var pagesStartTime = -1;
        for(var i = 0; i < pagesLog.length; ++i) {
            var logData = pagesLog[i];
            var pageId = logData.pageId;
            var pageData = pageLoadResults[pageId] = pageLoadResults[pageId] || {};
            pageData.steps = pageData.steps || {};

            if(pageData.error || pageData.steps[logData.type]){
                continue;
            }

            if(logData.type === "startData" && (pagesStartTime === -1 || logData.time < pagesStartTime)){
                pagesStartTime = logData.time;
            }
            pageData.steps[logData.type] = logData.time;
            pageData.time = logData.time;
            pageData.step = logData.type;
            if(logData.errorDesc) {
                var errorStr = typeof logData.errorDesc === 'string' ? logData.errorDesc : logData.errorDesc.toString();
                pageData.error = errorStr.substr(0, 50);
            }
        }
        return {
            'pagesReport': pageLoadResults,
            'startTime': pagesStartTime
        }
    };

    function addWixAppsReportForBI340(pageLoadData){
        pageLoadData.isEcom = false;
        var wixappsLog = deployStatus.logs.wixappsLoad || [];
        var wixappsPhases = {};

        if(wixappsLog.length > 1 && wixappsLog[1].step == 'loading ecom') {
            pageLoadData.isEcom = true;
        }

        if(wixappsLog.length) {
            pageLoadData.wixapps = {
                'start':    wixappsLog[0].time,
                'done':     _.last(wixappsLog).time,
                'phases':   {}
            };

            var lastTime = 0;
            for (var i = 0, len = wixappsLog.length; i < len; i++) {
                pageLoadData.wixapps.phases[i] = wixappsLog[i].time - lastTime;
                lastTime = wixappsLog[i].time;
            }
        }
    }

    function addDeploymentReportForBI340(pageLoadData){
        var deployLog = deployStatus.logs.phases || [];
        var phasesEndTime = -1;
        if(deployLog.length > 0) {
            phasesEndTime = _.last(deployLog).time;
        }
        var deploymentPhases={};
        var last=0;
        for (var i=0; i<deployLog.length; i++) {
            deploymentPhases[i] = deployLog[i].time-last;
            last = deployLog[i].time;
        }
        pageLoadData.deployment = {
            'start':    0,
            'done':     phasesEndTime,
            'phases':   deploymentPhases
        };
    }

    function processFilesLoadingData() {
        var filesPerTime = {}; var time;
        var keys = Object.keys(deployStatus.files);
        for (var i=0; i<keys.length; i++) {
            time = deployStatus.files[keys[i]].end - deployStatus.files[keys[i]].start;
            filesPerTime[time] = keys[i];
        }
        var times = Object.keys(filesPerTime);  //TODO: for some reason, this is already sorted, but just in case it's browser specific, i'll sort it anyway for now
        times.reverse(sort);
        var longestTimes = times.slice(0,10);

        var ret = {}; var path; var filename;
        for (var i=0; i<longestTimes.length; i++) {
            path = filesPerTime[longestTimes[i]].split('/');
            if(/index\.json/.test(path[path.length-1]) || /index\.debug\.json/.test(path[path.length-1])) {
                filename = path[path.length-3]; //if it's something like blablabla/web/2.354.0/index.json then we just want web
            }
            else {
                filename = path[path.length-1]; //otherwise, we want just the filename at the end
            }
            filename = encodeURIComponent(filename);
            ret[filename] = longestTimes[i];
        }

        return ret;

        function sort(a,b){
            return a==b ? 0 : Number(a)>Number(b) ? -1 : 1;
        }
    }

    function sendImageLoadingBI341() {
        if (window._imagePerformance) {
            /**
             count image buckets by size
             '5k':0, - less than 5k
             '500k':0, - between 5k and 500k
             '>500k':0 - above 500k
             */
            var imageBySizeBuckets = {
                '_100k':0,
                '_200k':0,
                '_300k':0,
                '_400k':0,
                '_500k':0,
                '_over500k':0
            };
            var imagesSamples = {
                '_100k':[],
                '_200k':[],
                '_300k':[],
                '_400k':[],
                '_500k':[],
                '_over500k':[]
            };

            var imageErrors = 0;

            var amountOfItemsToReturn = 3;
            function addSample(imageTiming, bucketKey) {
                if (imagesSamples[bucketKey].length < amountOfItemsToReturn) {
                    imagesSamples[bucketKey].push(imageTiming);
                }
            }

            for (var indx=0; indx< window._imagePerformance.timing.length; indx++) {
                var imageTiming = window._imagePerformance.timing[indx];
                var imgSize = imageTiming.size;

                if (imgSize < 100000) {
                    imageBySizeBuckets['_100k']++;
                    addSample(imageTiming, '_100k');
                } else if (imgSize < 200000) {
                    imageBySizeBuckets['_200k']++;
                    addSample(imageTiming, '_200k');
                } else if (imgSize < 300000) {
                    imageBySizeBuckets['_300k']++;
                    addSample(imageTiming, '_300k');
                } else if (imgSize < 400000) {
                    imageBySizeBuckets['_400k']++;
                    addSample(imageTiming, '_400k');
                } else if (imgSize < 500000) {
                    imageBySizeBuckets['_500k']++;
                    addSample(imageTiming, '_500k');
                } else {
                    imageBySizeBuckets['_over500k']++;
                    addSample(imageTiming, '_over500k');
                }

                if (imageTiming.hadError) {
                    imageErrors++;
                }
            }

            var imagePerf = {
                'loading': window._imagePerformance.started - window._imagePerformance.timing.length,
                'imagesBySize' : imageBySizeBuckets,
                'imagesSamples' : imagesSamples,
                'errors':imageErrors
            };

            LOG.reportEvent(wixEvents.LOAD_IMAGES_DATA, {
                'c1': JSON.stringify(imagePerf)
            });
        }
    }

    return {
        sendPageLoadingBI340: sendPageLoadingBI340,
        getPagesReportForBI340: getPagesReportForBI340,
        sendImageLoadingBI341: sendImageLoadingBI341
    };
});

