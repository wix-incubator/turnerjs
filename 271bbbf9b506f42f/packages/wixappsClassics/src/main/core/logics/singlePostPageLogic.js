define(['lodash',
    'utils',
    'wixappsCore',
    'wixappsClassics/core/data/converters/mediaPostConverter',
    'wixappsClassics/util/blogSinglePostPageLogicUtils',
    'experiment'
], function (_, utils, /** wixappsCore */wixapps, mediaPostConverter, blogSinglePostPageLogicUtils, experiment) {
    "use strict";

    var MAX_READ_TIME_TO_REPORT_MS = 1800000; // 30 minutes

    var wixappsClassicsLogger = utils.wixappsClassicsLogger;
    var blogAppPartNames = utils.blogAppPartNames;
    var socialShareHandler = utils.socialShareHandler;
    var socialCounterDatabaseAPI = utils.socialCounterDatabaseAPI;
    var initialCounters = {
        like: 0,
        share_google: 0,
        share_facebook: 0,
        share_twitter: 0,
        share_pinterest: 0,
        share_whatsapp: 0,
        share_linkedin: 0
    };

    function convertLargeNumberToLetterNotation(number) {
        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
        }
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return number;
    }

    function calculateCounters(countersData) {
        var resultObject = {};
        _.forEach(countersData.rows, function (item) {
            if (item.shareDestination !== "null") {
                resultObject['share_' + item.shareDestination] = convertLargeNumberToLetterNotation(item.shares);
            }
            if (experiment.isOpen('sv_blogLikeCounters')) {
                if (item.likes > 0) {
                    resultObject.like = convertLargeNumberToLetterNotation(item.likes);
                }
            }
        });

        for (var counter in initialCounters) {
            if (!resultObject[counter]) {
                resultObject[counter] = convertLargeNumberToLetterNotation(initialCounters[counter]);
            }
        }
        return resultObject;
    }

    function getPhotoOfSharedPost(post) {
        var photoUrl;
        if (post && post._type) {
            switch (post._type) {
                case "PhotoPost":
                    photoUrl = post.photo && this.partApi.resolveImageData(post.photo, this.partApi.getSiteData().serviceTopology, "blog").src;
                    break;
                case "VideoPost":
                    photoUrl = post.video && post.video.imageSrc;
                    break;
                default:
                    photoUrl = '';
                    break;
            }
        }
        return photoUrl;
    }

    function getSharedPostData() {
        var post = blogSinglePostPageLogicUtils.getSinglePost(this.partApi);
        post = mediaPostConverter.convertMediaPost(_.cloneDeep(post));

        var postUrl = this.partApi.getSiteData().getCurrentUrl(post.permalink && post.permalinkVersion && post.permalinkVersion.toString() === '1' ?
            utils.siteConstants.URL_FORMATS.HASH_BANG :
            this.partApi.getSiteData().getUrlFormat());
        var imgSrc = getPhotoOfSharedPost.call(this, post) || '';

        var hashTags = post.tags.filter(function onlyHashTags(tag) {
            return tag[0] === '#';
        }).join(' ');

        return {
            storeId: this.partApi.getAppService(),
            postId: post._iid,
            title: post.title,
            postUrl: postUrl,
            imgSrc: imgSrc,
            hashTags: hashTags
        };

    }

    function savePostUrlMapping(post, partApi) {
        if (post.permalink) {
            var permalink = post.permalink;
            var title = _.unescape(post.title).replace(/(?![a-z0-9])(?!\s)[\x00-\x7F]/gi, '').replace(/\s+/g, '-'); //eslint-disable-line no-control-regex
            partApi.getSiteData().setCustomUrlMapping(permalink, {id: post._iid, title: title});
        }
    }

    var logicFactory = wixapps.logicFactory;

    /**
     * @class core.SinglePostPageLogic
     * @param partApi
     * @constructor
     */
    function SinglePostPageLogic(partApi) {
        this.partApi = partApi;
    }

    SinglePostPageLogic.prototype = {
        sharePost: function (evt, domID, useOriginalUrl) {
            var partApi = this.partApi;

            var postData = getSharedPostData.call(this);

            function handleShareRequest(url) {
                wixappsClassicsLogger.reportEvent(partApi.getSiteData(), wixappsClassicsLogger.events.SHARE_CLICKED, {
                    type: evt.params.service,
                    post_id: postData.postId
                });

                socialShareHandler.handleShareRequest({
                    url: url,
                    service: evt.params.service,
                    title: postData.title,
                    hashTags: postData.hashTags || '',
                    imageUrl: postData.imgSrc,
                    postId: postData.postId,
                    storeId: postData.storeId,
                    addDeepLinkParam: false
                }, partApi.getSiteApi());
            }

            if (useOriginalUrl || partApi.getSiteData().isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
                handleShareRequest(postData.postUrl);
            } else {
                socialShareHandler.shortenURL(postData.postUrl, 2000, handleShareRequest, handleShareRequest.bind(null, postData.postUrl));
            }
        },

        toggleLikeForPost: function (evt) {
            var postShareData = getSharedPostData.call(this);
            var newValue;
            var counterToUpdate = 'likes';
            var counterValue;
            if (evt.params.isLiked) {
                this.socialCountersInfo.like--;
                newValue = false;
                counterValue = -1;
            } else {
                this.socialCountersInfo.like++;
                newValue = true;
                counterValue = 1;
            }
            this.partApi.setVarOfLayoutRootProxy('$isPostLiked', newValue);
            this.partApi.setVarOfLayoutRootProxy('$likeStateChanged', true);
            this.partApi.setVarOfLayoutRootProxy('socialCounters', this.socialCountersInfo);
            wixappsClassicsLogger.reportEvent(this.partApi.getSiteData(), wixappsClassicsLogger.events.LIKE_CLICKED, {
                like_status: counterToUpdate,
                post_id: postShareData.postId
            });
            socialCounterDatabaseAPI.updateCounter(counterToUpdate, null, counterValue, postShareData.storeId, postShareData.postId);
        },

        sharePostWithOriginalUrl: function (evt, domID) {
            this.sharePost(evt, domID, true);
        },


        preventClickPropagation: function (event) {
            if (this.partApi.getSiteApi().isSelectionSharerVisible()) {
                event.stopPropagation();
            }
        },

        clearSelection: function(event) {
            if (event.button === 0) {
                var selection = window.getSelection();
                if (selection.empty) {
                    selection.empty();
                }
                if (selection.removeAllRanges) {
                    selection.removeAllRanges();
                }
            }
        },

        startSelection: function (event) {
            if (!event.params.enabled) {
                return;
            }
            var sel = window.getSelection();
            var position = {};
            var partApi = this.partApi;
            if (sel.rangeCount && sel.toString().length > 0) {
                var postData = getSharedPostData.call(this);

                var selRect = sel.getRangeAt(0).getBoundingClientRect();
                var popUpWidth = 142;
                var popUpHeight = 45 + 10;
                position = {
                    x: (((selRect.left + selRect.right) / 2) - popUpWidth / 2) + (window.document.body.scrollLeft || window.document.documentElement.scrollLeft),
                    y: selRect.top - popUpHeight + (window.document.body.scrollTop + window.document.documentElement.scrollTop)
                };
                var container = window.document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }

                var shareInfo = {
                    url: postData.postUrl,
                    service: '',
                    title: postData.title,
                    postId: postData.postId,
                    storeId: this.partApi.getAppService(),
                    description: container.textContent,
                    hashTags: postData.hashTags || '',
                    imageUrl: postData.imgSrc,
                    addDeepLinkParam: false
                };
                partApi.getSiteApi().showSelectionSharer(position, shareInfo);
            } else {
                partApi.getSiteApi().hideSelectionSharer();
            }
        },

        countersRequestSuccessfulCallback: function (result) {
            if (result.firstTime) {
                this.socialCountersInfo = initialCounters;
            } else {
                this.socialCountersInfo = calculateCounters(result);
            }
            this.partApi.setVarOfLayoutRootProxy('socialCounters', this.socialCountersInfo);
        },

        countersRequestFailedCallback: function () {
            this.tryCount++;
            if (this.tryCount < 2) {
                var post = blogSinglePostPageLogicUtils.getSinglePost(this.partApi);
                setTimeout(socialCounterDatabaseAPI.getAllCountersForPost.bind(post._iid, this.countersRequestSuccessfulCallback.bind(this), this.countersRequestFailedCallback.bind(this)), 1000);
            }
        },

        reportReadFinished: function () {
            var postShareData = getSharedPostData.call(this);
            socialCounterDatabaseAPI.updateCounter('viewsEnded', null, 1, postShareData.storeId, this.socialCountersPostId);
            var timeSpentInPost = Date.now() - this.viewStartTime;
            if (timeSpentInPost <= MAX_READ_TIME_TO_REPORT_MS) {
                var timeInSeconds = Math.floor(timeSpentInPost / 1000);
                socialCounterDatabaseAPI.updateCounter('viewsTotalTime', null, timeInSeconds, postShareData.storeId, this.socialCountersPostId);
            }
        },

        isReady: function () {
            var post = blogSinglePostPageLogicUtils.getSinglePost(this.partApi);
            if (post && !_.isEmpty(post)) {
                if (!this.socialCountersInfo || this.socialCountersPostId !== post._iid) {
                    if (this.socialCountersPostId) {
                        this.reportReadFinished();
                    }
                    this.socialCountersInfo = {};
                    var postShareData = getSharedPostData.call(this);
                    this.socialCountersPostId = post._iid;
                    socialCounterDatabaseAPI.updateCounter('viewsStarted', null, 1, postShareData.storeId, this.socialCountersPostId);
                    this.viewStartTime = Date.now();
                    this.tryCount = 1;
                    var storeId = this.partApi.getAppService().datastoreId;
                    socialCounterDatabaseAPI.getAllCountersForPost(storeId, post._iid, this.countersRequestSuccessfulCallback.bind(this), this.countersRequestFailedCallback.bind(this));
                }

                post = blogSinglePostPageLogicUtils.transformPostIfPreview.call(this, post, this.partApi);
                blogSinglePostPageLogicUtils.updatePageTitleAndMetaTags.call(this, post, this.partApi);
                savePostUrlMapping.call(this, post, this.partApi);
            }
            return true;
        },

        beforeClose: function () {
            if (this.socialCountersPostId) {
                this.reportReadFinished();
            }
        }
    };

    logicFactory.register(blogAppPartNames.SINGLE_POST, SinglePostPageLogic);
});
