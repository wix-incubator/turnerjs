define.Class('wysiwyg.viewer.managers.pages.data.RemoteDataResolver', function(classDefinition){

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.managers.pages.data.LocalDataResolver');

    def.methods({
        initialize: function(data){

            this.parent(data);

            this._deferredRequests = [];
            this._pagesIdsToLoad = _.clone(this._pageIds);
            this._failedPagesIdsToLoad = [];
        },

        _preparePageData: function(){

            _.forEach(this._siteData.pageList.pages, function(page){

                this._pageIds.push(page.pageId);

                var pageUrlMaps = page.urls.map(function(url){
                    return resource.url(url, this._getRequestMethod(url), this._shouldLoadOnce(url));
                }, this);

                // _onTrialFailure
                define.resource(this._getResourceIdFromPageID(page.pageId))
                    .withUrls(pageUrlMaps)
                    .withTrials(3)
                    .withTimeBetween(3000)
                    .withTrialFailNotification(this._onTrialFailure.bind(this, page.pageId));

            }, this);

            var masterPageUrlMaps = this._siteData.pageList.masterPage.map(function(url){
                return resource.url(url, this._getRequestMethod(url), this._shouldLoadOnce(url));
            }, this);

            define.resource(this._getResourceIdFromPageID('master'))
                .withUrls(masterPageUrlMaps)
                .withTrials(3)
                .withTimeBetween(3000)
                .withTrialFailNotification(this._onTrialFailure.bind(this, 'master'));
        },

        _getResourceIdFromPageID: function(pageId){
            return 'pages.' + pageId;
        },

        _isStaticPage: function(url){
            return !~url.indexOf('archive.');
        },

        _getRequestMethod: function(url){
            return this._isStaticPage(url) ? 'cors' : 'jsonp';
        },

        _shouldLoadOnce: function(url){
            return !!this._isStaticPage(url);
        },

        getMasterPageData: function(){

            return this.getPageData('master');
        },


        getMainPageId: function(){
            return this._siteData.pageList.mainPageId;
        },

        getPageData: function(pageId){

            var promise;

            if(this._pagesData && this._pagesData[pageId]) {

                promise = Q(this._pagesData[pageId]);

            } else if(this._deferredRequests[pageId]) {

                promise = this._deferredRequests[pageId].promise;

            } else {

                var deferred = Q.defer();

                this._logPageRender_(pageId, "startData");
                resource.getResourceValue(this._getResourceIdFromPageID(pageId),
                    this._onGetResourceSuccess.bind(this, pageId, deferred),
                    this._onGetResourcesFailure.bind(this, pageId, deferred));

                this._deferredRequests[pageId] = deferred;

                promise = deferred.promise;
            }

            return promise;
        },

        _onGetResourceSuccess: function(pageId, deferred, json){
            this._logPageRender_(pageId, "endData");

            this._handleGetPageResource(pageId);

            this._pagesData[pageId] = json;

            this._fixPageData(json);

            this._setData(json.data);

            deferred.resolve(json);
        },

        _onTrialFailure: function(pageId, url, fallBackNum, cycleNum){
            // would be good to get the number of trials and cycles
            var m,domain;
            if(m=url.match(/^http:..([^/]+)/)){
                domain=m[1];
            }
            LOG.reportError(wixErrors.SINGLE_PAGE_RETRIEVAL_ATTEMPT_FAILED, 'PageManager', 'RemoteDataResolver', {p1: domain, p2: pageId, p3: fallBackNum, p4: cycleNum});
        },

        _onGetResourcesFailure: function(pageId, deferred){
            this._logPageRender_(pageId, "endData", "all load attempts failed");

            LOG.reportError(wixErrors.ALL_PAGE_RETRIEVAL_ATTEMPTS_FAILED, 'PageManager', 'loadPageById');

            this._handleGetPageResource(pageId);

            this._failedPagesIdsToLoad.push(pageId);

            deferred.reject(new Error("Failed to get json page " + pageId));
        },

        _handleGetPageResource: function(pageId){

            this._deferredRequests[pageId] = null;
            delete this._deferredRequests[pageId];

            this._pagesIdsToLoad = _.without(this._pagesIdsToLoad, pageId);
        },

        _logPageRender_: function(pageId, step, error) {
            deployStatus('pageLoad', {
                'pageId': pageId,
                'type': step,
                'time': LOG.getSessionTime(),
                'errorDesc': error
            });
        }
    });
});
