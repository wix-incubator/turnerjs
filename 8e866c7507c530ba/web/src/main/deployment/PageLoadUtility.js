/**
 * @class deployment.PageLoadUtility
 */
define.Class('deployment.PageLoadUtility', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Utils']);

    /** @lends deployment.PageLoadUtility */
    def.methods({

        definePageResource: function(pageId, pagesList){
            var pageResourceName = this._getResourceIdFromPageID(pageId);
            if(define.getDefinition('resource.' + pageResourceName)){
                return;
            }

            var pageUrls = pageId === 'master'
                ?   pagesList.masterPage
                :  _.find(pagesList.pages, function(page){
                         return page.pageId === pageId;
                    }).urls;

            var pageUrlMaps = _.map(pageUrls, function(url){
                return resource.url(url, this._getRequestMethod(url), this._shouldLoadOnce(url));
            }, this);

            define.resource(pageResourceName).withUrls(pageUrlMaps).withTrials(3).withTimeBetween(3000);
        },

        getPageDataPromise: function(pageId){
            var deferred = Q.defer();
            var self = this;

            this._logPageRender_(pageId, "startData");

            resource.getResourceValue(this._getResourceIdFromPageID(pageId),
                function(json){
                    self._logPageRender_(pageId, "endData");
                    deferred.resolve(json);
                }, function(){
                    self._logPageRender_(pageId, "endData", "all load attempts failed");
                    deferred.reject(new Error("Failed to get json page " + pageId));
                });

            return deferred.promise;
        },

        getFirstPageId: function(pagesIds, mainPageId){
            var pageIdToLoad,
                hashParts = this.resources.W.Utils.hash.getHashParts(),
                pageIdFromHash = (hashParts.id === 'zoom') ? hashParts.extData.match("([^/]+)/([^/]+)")[1] : hashParts.id;

            if(!!pageIdFromHash && _.contains(pagesIds, pageIdFromHash)) {

                pageIdToLoad = pageIdFromHash;

            } else if(mainPageId && _.contains(pagesIds, mainPageId)) {

                pageIdToLoad = mainPageId;

            } else {

                pageIdToLoad = _.first(pagesIds);
            }

            return pageIdToLoad;
        },



        _getResourceIdFromPageID: function(pageId){
            return 'pages.' + pageId;
        },

        _isStaticPage: function(url){
            return !~url.indexOf('archive.');
        },

        _shouldLoadOnce: function(url){
            return !!this._isStaticPage(url);
        },

        _getRequestMethod: function(url){
            return this._isStaticPage(url) ? 'cors' : 'jsonp';
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