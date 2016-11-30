define([
    "lodash"
], function (_) {
    'use strict';

    /*eslint no-unused-vars:0*/

    var FEEDBACK_SERVER = "http://wixfeedbackserver.appspot.com";
    var FEEDBACK_LOCAL_SERVER = "http://localhost:8888";

    var FEEDBACK_SERVER_MARK_AS_SHARED = "/markSiteShared";
    var FEEDBACK_SERVER_MARK_AS_READ = "/markAsRead";
    var FEEDBACK_SERVER_LOAD_COMMENTS = "/list";
    var FEEDBACK_SERVER_APPEND = "/append";
    var FEEDBACK_SERVER_DELETE = "/delete";
    var BITLY_SERVER = "https://api-ssl.bitly.com/v3/shorten?access_token=6e283dc921f56df2eff5951bd2bf5bab041d8ac2&longUrl=";
    var CAMPAIGN_PARAMS = "&utm_campaign=vir_wixad_feedback";

    var COMMENT_MOODS = ["happy", "sad", "noMood"];

    var _useMockedData = false;
    var _useLocalServer = false;

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    /**
     * generates a short url for a dedicated feedback site.
     * call wix server to create a token for shared site, generate a dedicated url,
     * run it through bitly service and return the shortened url.
     * If no editorLanguage is given - uses 'en' by default.
     *
     * @param {PrivateDocumentServices} privateServices
     * @param {string} [editorLanguage=en] editor language (default = en)
     * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
     */
    function getSharedSiteURL(privateServices, editorLanguage, callbacks) {
        // EDITOR ONLY! (so... what should we do with it? deprecated?)
        var siteId = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteId"]);
        var metaSiteId = privateServices.dal.getByPath(["rendererModel", "metaSiteId"]);

        editorLanguage = editorLanguage || "en";

        __createPreviewSite(siteId, metaSiteId, {
            onSuccess: function (response) {
                var previewSiteURL = response.payload && response.payload.url;
                var paramsPrefix = _.includes(previewSiteURL, '?') ? '&' : '?';
                var feedbackSiteURL = previewSiteURL + paramsPrefix + "feedback=true&lang=" + editorLanguage + CAMPAIGN_PARAMS;
                __createBitlyAddress(feedbackSiteURL, {
                    onSuccess: function (res) {
                        if (hasHandler(callbacks, 'onSuccess')) {
                            callbacks.onSuccess(res.data.url);
                        }
                    },
                    onError: function () {
                        // TODO: handle errors
                    }
                });
            },
            onError: function () {
                // TODO: handle errors
            }
        });
    }

    function __createPreviewSite(siteId, metaSiteId, callbacks) {
        var origin = "//" + window.location.host; // editor.wix.com
        var previewTokenUrl = "http:" + origin + "/html/editor/web/review/createToken/" + siteId + "?metaSiteId=" + metaSiteId;
        __sendCORSRequest("GET", previewTokenUrl, null, {
            onSuccess: function (response) {
                var obj = JSON.parse(response);
                if (hasHandler(callbacks, 'onSuccess')) {
                    callbacks.onSuccess(obj);
                }
            },
            onError: function () {
                // TODO: handle errors
            }
        });
    }

    function __createBitlyAddress(previewSiteURL, callbacks) {
        var bitlyRequestURL = BITLY_SERVER + encodeURIComponent(previewSiteURL);
        __sendCORSRequest("GET", bitlyRequestURL, null, {
            onSuccess: function (response) {
                var obj = JSON.parse(response);
                if (hasHandler(callbacks, 'onSuccess')) {
                    callbacks.onSuccess(obj);
                }
            },
            onError: function () {
                // TODO: handle errors
            }
        });
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function loadSiteComments(privateServices, callbacks) {
        var siteId = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteId"]);
        var requestURL = __getFeedbackServer() + FEEDBACK_SERVER_LOAD_COMMENTS + "?siteId=" + siteId;
        __sendCORSRequest("GET", requestURL, null, {
            onSuccess: function (response) {
                var commentsByPage = __parseServerComment(JSON.parse(response));
                if (hasHandler(callbacks, 'onSuccess')) {
                    callbacks.onSuccess(commentsByPage);
                }
            },
            onError: function () {
                // TODO: handle errors
            }
        });
    }

    function __parseServerComment(comments) {
        _.forEach(comments, function (comment) {
            comment.commentId = comment.key.id;
            comment.x = comment.propertyMap.x.value;
            comment.y = comment.propertyMap.y.value;
            comment.face = comment.propertyMap.face.value;
            comment.submitter = comment.propertyMap.submitter.value;
            comment.text = comment.propertyMap.text.value.value;
            comment.pageId = comment.propertyMap.pageId;
            comment.unread = comment.propertyMap.unread;
            comment.time = new Date(comment.propertyMap.time);
        });
        var commentsByPage = _.groupBy(comments, 'pageId');
        return commentsByPage;
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function saveSiteFeedback(privateServices, commentsDataArray, generalComment, submitter, callbacks) {

        var siteId = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteId"]);
        var metaSiteId = privateServices.dal.getByPath(["rendererModel", "metaSiteId"]);
        var userId = privateServices.dal.getByPath(["rendererModel", "userId"]);
        var siteName = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteTitleSEO"]);

        var dataString = JSON.stringify({
            "siteId": siteId,
            "data": commentsDataArray,
            "generalComment": generalComment,
            "submitter": submitter,
            "userGuid": userId,
            "metaSiteId": metaSiteId,
            "siteName": siteName
        });

        __sendCORSRequest("POST", __getFeedbackServer() + FEEDBACK_SERVER_APPEND, dataString, callbacks);
    }

    function createCommentData(privateServices, pageId, x, y, text, submitter, face) {
        /** @class feedbackComment */
        var comment = {
            pageId: pageId || "mainPage",
            x: x || "100px",
            y: y || "100px",
            text: text || "untitled",
            submitter: submitter || "anonymous",
            time: Date.now(),
            face: face || COMMENT_MOODS[COMMENT_MOODS.length - 1],
            unread: true
        };
        return comment;
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function isSiteShared(privateServices, callbacks) {
        var siteId = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteId"]);
        var requestURL = __getFeedbackServer() + FEEDBACK_SERVER_MARK_AS_SHARED + "?siteId=" + siteId;
        __sendCORSRequest("GET", requestURL, {}, callbacks);
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function markSiteAsShared(privateServices, callbacks) {
        var siteId = privateServices.dal.getByPath(["rendererModel", "siteInfo", "siteId"]);
        var requestURL = __getFeedbackServer() + FEEDBACK_SERVER_MARK_AS_SHARED;
        __sendCORSRequest("POST", requestURL, JSON.stringify({'siteId': siteId}), callbacks);
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function markCommentAsRead(privateServices, commentId, callbacks) {
        var requestURL = __getFeedbackServer() + FEEDBACK_SERVER_MARK_AS_READ;
        __sendCORSRequest("POST", requestURL, JSON.stringify({'commentId': commentId}), callbacks);
    }

    // ======================----------------------------------------------------------------------
    // ======================----------------------------------------------------------------------

    function deleteComment(privateServices, commentId, callbacks) {
        var requestURL = __getFeedbackServer() + FEEDBACK_SERVER_DELETE;
        __sendCORSRequest("POST", requestURL, JSON.stringify({'commentId': commentId}), callbacks);
    }

    // ==============================================================================================
    // UTILS ========================================================================================
    // ==============================================================================================

    function __getFeedbackServer() {
        return _useLocalServer ? FEEDBACK_LOCAL_SERVER : FEEDBACK_SERVER;
    }

    function __sendCORSRequest(method, url, data, callbacksObj) {

        if (this._useMockedData) {
            if (hasHandler(callbacksObj, 'onSuccess')) {
                callbacksObj.onSuccess("MOCKED");
            }
            return;
        }

        var XDomainRequest = window.XDomainRequest;
        var xhr = new window.XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest !== "undefined") {
            // handle IE
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }

        if (!xhr) {
            return;
        }

        if (method === "POST") {
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        }

        xhr.onload = function () {
            if (hasHandler(callbacksObj, 'onSuccess')) {
                callbacksObj.onSuccess(xhr.responseText);
            }
        };

        xhr.onerror = function () {
            var errResponse = {error: true};
            if (hasHandler(callbacksObj, 'onError')) {
                callbacksObj.onError(errResponse);
            }
        };

        xhr.send(data || null);
    }

    function hasHandler(callbacks, eventName) {
        return _.isFunction(_.get(callbacks, eventName));
    }

    // ==============================================================================================
    // MOCKED =======================================================================================
    // ==============================================================================================

    /**
     * for tests only!
     *
     * @param {PrivateDocumentServices} privateServices
     */
    function enableMockedData(privateServices) {
        _useMockedData = true;
    }

    /**
     * for tests only!
     *
     * @param {PrivateDocumentServices} privateServices
     */
    function disableMockedData(privateServices) {
        _useMockedData = false;
    }

    /**
     * for tests only!
     *
     * @param {PrivateDocumentServices} privateServices
     */
    function enableLocalTestServer(privateServices) {
        _useLocalServer = true;
    }

    /**
     * for tests only!
     *
     * @param {PrivateDocumentServices} privateServices
     */
    function disableLocalTestServer(privateServices) {
        _useLocalServer = false;
    }

    function getUnreadMockedComment(privateServices, submitter) {
        var comment = {
            pageId: "mainPage",
            x: parseInt(Math.random() * 500, 10),
            y: parseInt(Math.random() * 500, 10),
            text: "title [" + Date.now() + "]",
            submitter: submitter || "anonymous",
            time: Date.now(),
            face: COMMENT_MOODS[parseInt(Math.random() * COMMENT_MOODS.length, 10)],
            unread: true
        };
        return comment;
    }


    var testApi = {
        // public for tests!
        enableMockedData: enableMockedData,
        disableMockedData: disableMockedData,
        enableLocalTestServer: enableLocalTestServer,
        disableLocalTestServer: disableLocalTestServer,
        getUnreadMockedComment: getUnreadMockedComment,
        __sendCORSRequest: __sendCORSRequest
    };
    /**
     * @class documentServices.feedback
     */
    return _.merge({
        /**
         * generates a short url for a dedicated feedback site.
         * call wix server to create a token for shared site, generate a dedicated url,
         * run it through bitly service and return the shortened url.
         * If no editorLanguage is given - uses 'en' by default.
         *
         * @param {string} [editorLanguage=en] editor language (default = en)
         * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
         */
        generateShareURL: getSharedSiteURL,
        /**
         * check if site is shared.
         *
         * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
         */
        isSiteShared: isSiteShared,
        /**
         * mark site as shared.
         *
         * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
         */
        markSiteAsShared: markSiteAsShared,
        /**
         * @class documentServices.feedback.comments
         */
        comments: {
            /**
             * @param pageId
             * @param x
             * @param y
             * @param text
             * @param submitter
             * @param face
             * @returns {{pageId: (*|string), x: (*|string), y: (*|string), text: (*|string), submitter: (*|string), time: number, face: (*|string), unread: boolean}}
             */
            create: createCommentData,
            /**
             * save new feedback for a specific site.
             *
             * @param {[feedbackComment]} commentsDataArray array of comments (u can use createCommentData to fill this array)
             * @param {string} [generalComment] general description for group of comments
             * @param {string} [submitter] the submitter name
             * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
             */
            add: saveSiteFeedback,
            /**
             * load all comments for a specific site.
             *
             * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
             */
            get: loadSiteComments,
            /**
             * delete comment by id.
             *
             * @param {string} commentId comment identifier for deletion
             * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
             */
            remove: deleteComment,
            /**
             * mark comment as read.
             *
             * @param {string} commentId comment identifier for deletion
             * @param {Object} [callbacks] callbacks pattern: {onSuccess:function, onError:function}
             */
            markAsRead: markCommentAsRead
        }
    }, testApi);
});
