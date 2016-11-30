define(['lodash',
    'coreUtils'
], function (_, coreUtils) {
    "use strict";

    var likedPostsLocalStorageIndex = 'likedBlogPosts';
    // var baseUrl = 'http://docker01.aus.wixpress.com:26770/blog-social-counters/';
    // var baseUrl = 'http://localhost:3000/api/';
    var baseUrl = '//blog-social-counters.wix.com/_api/blog-social-counters/';

    var socialCounterDatabaseAPI = {

        defaultQuerySuccessCallback: function () {
            //console.log('In success callback with response: ', res);
        },

        defaultQueryCollectFailureCallback: function () {
            //console.log('In failure callback with response: ', res);
        },

        getLikesForPostsList: function (postsList, successCallback, failureCallback) {
            var data = {
                postsList: postsList
            };
            var url = baseUrl + 'query-feed/';
            coreUtils.ajaxLibrary.ajax({
                type: 'GET',
                url: url,
                crossDomain: true,
                data: data,
                contentType: 'application/json',
                dataType: 'json',
                success: successCallback || this.defaultQuerySuccessCallback,
                error: failureCallback || this.defaultQueryCollectFailureCallback
            });
        },

        getAllCountersForPost: function (storeId, postId, successCallback, failureCallback) {
            var data = {
                storeId: storeId,
                postId: postId
            };
            var url = baseUrl + 'query-post/';
            coreUtils.ajaxLibrary.ajax({
                type: 'GET',
                url: url,
                crossDomain: true,
                data: data,
                contentType: 'application/json',
                dataType: 'json',
                success: successCallback || this.defaultQuerySuccessCallback,
                error: failureCallback || this.defaultQueryCollectFailureCallback
            });
        },

        updateCounter: function (counterType, counterName, counterValue, storeId, postId, successCallback, failureCallback) {
            if (counterType === 'like' || counterType === 'unlike') {
                this.toggleUserLike(postId);
            }

            var sendObject = {
                storeId: storeId.datastoreId,
                postId: postId,
                counterType: counterType,
                counterName: counterName,
                counterValue: counterValue
            };

            var url = baseUrl + 'collector/';
            coreUtils.ajaxLibrary.ajax({
                url: url,
                crossDomain: true,
                type: "POST",
                data: sendObject,
                dataType: 'json',
                contentType: 'application/json',
                success: successCallback || this.defaultQuerySuccessCallback,
                error: failureCallback || this.defaultQueryCollectFailureCallback
            });
        },

        updateCategoryTagSearchesCounter: function (counterType, counterName, storeId) {
            this.updateCounter(counterType, counterName, storeId);
        },

        toggleUserLike: function (postId) {
            var likedPosts = JSON.parse(window.localStorage.getItem(likedPostsLocalStorageIndex)) || {};
            if (likedPosts[postId] === false || !_.has(likedPosts, postId)) {
                likedPosts[postId] = true;
            } else {
                likedPosts[postId] = false;
            }
            window.localStorage.setItem(likedPostsLocalStorageIndex, JSON.stringify(likedPosts));
        }
    };

    return {
        getAllCountersForPost: socialCounterDatabaseAPI.getAllCountersForPost,
        updateCounter: socialCounterDatabaseAPI.updateCounter,
        toggleUserLike: socialCounterDatabaseAPI.toggleUserLike,
        updateCategoryTagSearchesCounter: socialCounterDatabaseAPI.updateCategoryTagSearchesCounter
    };

});
