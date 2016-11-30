define.Class('wysiwyg.viewer.managers.pages.LazyPageLoader', function(classDefinition){
    "use strict";

    var def = classDefinition;

    def.binds(['_loadPageLazy','_loadNextPage']);

    def.statics({
        FirstLazyPageLoadDelay: 10000,
        NextLazyPageLoadDelay: 3000,
        MaxNumberOfPagesToLoad: 5

    });

    def.methods({
        initialize: function(dataResolver){

            this._dataResolver = dataResolver;

            this._numberOfPagesToLoad = 0;
        },

        start:function(){

            Q.delay(this.FirstLazyPageLoadDelay).then(this._loadPageLazy);
        },

        _loadPageLazy:function(){

            if(!this._dataResolver.isAllPagesDataLoaded()){

                var pageId = _.first(this._dataResolver.getPagesIdsToLoad());

                this._dataResolver.getPageData(pageId)
                    .then(this._loadNextPage)
                    .fail(this._loadNextPage);

                this._numberOfPagesToLoad++;
            }
        },

        _loadNextPage:function(){

            if(this._numberOfPagesToLoad < this.MaxNumberOfPagesToLoad){
                Q.delay(this.NextLazyPageLoadDelay).then(this._loadPageLazy);
            }
        }
    });
});