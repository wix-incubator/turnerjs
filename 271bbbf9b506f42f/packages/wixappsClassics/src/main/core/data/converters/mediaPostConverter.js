define([
    'lodash',
    'zepto',
    'utils',
    'wixappsCore',
    'wixappsClassics/core/langs/defaultPostsTranslation'
], function (_, $, utils, wixappsCore, defaultPostsTranslation) {
    "use strict";

    var POST_TYPES = {
        MEDIA: 'MediaPost',
        VIDEO: 'VideoPost',
        PHOTO: 'PhotoPost',
        TEXT: 'TextPost'
    };

    var TypesMap = {
        "wysiwyg.viewer.components.WPhoto": POST_TYPES.PHOTO,
        "wysiwyg.viewer.components.Video": POST_TYPES.VIDEO,
        "wysiwyg.viewer.components.MatrixGallery": POST_TYPES.PHOTO,
        "wysiwyg.viewer.components.SlideShowGallery": POST_TYPES.PHOTO,
        "default": POST_TYPES.TEXT
    };

    function isGallery(type) {
        return _.includes(['wysiwyg.viewer.components.MatrixGallery', 'wysiwyg.viewer.components.SlideShowGallery'], type);
    }

    var UnpublishedChangesFields = ['tags', 'title', 'date', 'mediaText'];

    /**
     * Get the path to the item in wixapps data
     * @param {Post} item
     * @param {string} collectionId
     * @returns {string[]} path to the item in wixapps data
     */
    function getMediaPostPath(item, collectionId) {
        var collectionPath;
        if (item._type === POST_TYPES.MEDIA) {
            collectionPath = ["converted", collectionId, item._iid];
        } else {
            collectionPath = [collectionId, item._iid];
        }
        return collectionPath;
    }

    function getCoverImageObjFromPost(post, pseudoType) {
        var coverObj;
        if (post.coverImageData && post.coverImageData.coverImageType) {
            coverObj = {
                _type: POST_TYPES[post.coverImageData.coverImageType.toUpperCase()]
            };
            coverObj[post.coverImageData.coverImageType] = post.coverImageData[post.coverImageData.coverImageType];
        } else {
            var coverPhotoJson = getCoverImageComp(post.mediaText.text);
            coverObj = _getCoverPhoto(pseudoType, post, coverPhotoJson);
        }

        return coverObj;
    }

    function _getCoverPhoto(pseudoType, convertedItem, coverPhotoJson) {
        var coverPhoto = {};
        if (pseudoType === POST_TYPES.VIDEO && convertedItem.mediaText.videoList.length) {
            coverPhoto._type = POST_TYPES.VIDEO;
            coverPhoto.isHD = false;
            if (_.has(coverPhotoJson, 'videoId')) {
                coverPhoto.video = _.find(convertedItem.mediaText.videoList, {videoId: coverPhotoJson.videoId}) || convertedItem.mediaText.videoList[0];
            } else {
                coverPhoto.video = convertedItem.mediaText.videoList[0];
            }
        } else if (pseudoType === POST_TYPES.PHOTO && convertedItem.mediaText.imageList.length) {
            var coverPhotoAttr = 'post-cover-photo';
            coverPhoto._type = POST_TYPES.PHOTO;
            if (_.has(coverPhotoJson, coverPhotoAttr)) {
                coverPhoto.photo = _.find(convertedItem.mediaText.imageList, function (img) {
                    return _.includes(coverPhotoJson[coverPhotoAttr], img.src);
                });
            } else {
                coverPhoto.photo = convertedItem.mediaText.imageList[0];
            }
        }
        return coverPhoto;
    }

    /**
     * Create a converted old item based on the given one.
     * @param {Post} item
     * @returns {TextPost|PhotoPost|VideoPost}
     */
    function convertMediaPost(item) {
        if (item._type !== POST_TYPES.MEDIA) {
            return item;
        }

        var convertedItem = _.clone(item);
        var pseudoType = getMediaPostPseudoType(convertedItem);

        if (pseudoType === POST_TYPES.TEXT) {
            convertedItem._type = POST_TYPES.TEXT;
        } else {
            var coverObj = getCoverImageObjFromPost(convertedItem, pseudoType);
            _.assign(convertedItem, coverObj);
        }

        var getConvertedPost = _.flow(getPostWithoutCertainExcerptStyling, getPostWithConvertedMobileTitle);
        convertedItem = getConvertedPost(convertedItem);

        return convertedItem;
    }

    /**
     * Get the converted post type
     * @param {MediaPost} item
     * @returns {string} 'TextPost', 'PhotoPost' or 'VideoPost'
     */
    function getMediaPostPseudoType(item) {
        if (item.coverImageData) {
            if (item.coverImageData.coverImageType) {
                return POST_TYPES[item.coverImageData.coverImageType.toUpperCase()];
            }
            return TypesMap.default;
        }
        var coverPhotoJson = getCoverImageComp(item.mediaText.text);
        return coverPhotoJson ? TypesMap[coverPhotoJson.componentType] : TypesMap.default;
    }

    /**
     * Gets the Json data of all the placeholders in the text
     * @param {string} mediaText
     * @returns {object[]} Array of objects for each of the comps placeholders
     */
    function getCompPlaceholdersJsonData(mediaText) {
        var placeHolders = getAllMatches(mediaText, new RegExp("wix-comp=[\"']({.*?})[\"']", "g"));
        return _.map(placeHolders, function (currentPh) {
            return JSON.parse(decodeJsonData(currentPh[1]));
        });
    }

    function escapeSrcAttr(html, srcPlaceholder) {
        return html.replace(/src=/gi, srcPlaceholder + '='); // prevent http requests
    }

    function getCoverImageComp(html) {
        var coverPhotoAttr = 'post-cover-photo',
            srcPlaceholder = 'data-src-placeholder',
            wixCompSelector = '[wix-comp]',
            rootElement = $('<div>' + escapeSrcAttr(html, srcPlaceholder) + '</div>');

        var wixComponentTypesThatContainImage = [
            "wysiwyg.viewer.components.Video",
            'wysiwyg.viewer.components.MatrixGallery',
            'wysiwyg.viewer.components.SlideShowGallery',
            "wysiwyg.viewer.components.WPhoto"
        ];

        var wixCompElements = rootElement.find(wixCompSelector);

        var wixCompJsons = _.map(wixCompElements, function extractWixCompJson(elem) {
            elem = $(elem);
            var json = JSON.parse(decodeJsonData(elem.attr('wix-comp')));
            if (!_.isNull(elem.attr(coverPhotoAttr))) {
                json[coverPhotoAttr] = elem.attr(srcPlaceholder);
            }
            return json;
        });
        var wixCompJsonsThatContainImage = _.filter(wixCompJsons, function (componentJson) {
            return _.includes(wixComponentTypesThatContainImage, componentJson.componentType);
        });

        return _.find(wixCompJsonsThatContainImage, coverPhotoAttr) || _.first(wixCompJsonsThatContainImage);
    }

    function getAllMatches(str, regex) {
        var myArray, elements = [];
        while ((myArray = regex.exec(str)) !== null) {
            elements.push(myArray);
        }
        return elements;
    }

    /**
     * Replace encoded data with it's javascript string. (i.e. '&gt;' -> '>')
     * @param {string} jsonStr
     * @returns {string}
     */
    function decodeJsonData(jsonStr) {
        return jsonStr.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&apos;/g, "'");
    }

    function fixMediaPostDataRefs(item) {
        if (item._type !== POST_TYPES.MEDIA || !item.mediaText) {
            return item;
        }
        var jsonData = getCompPlaceholdersJsonData(item.mediaText.text);
        var imgCount = 0;
        var videoCount = 0;
        item.mediaText.refMap = {};

        _.forEach(jsonData, function (json) {
            if (json.componentType === "wysiwyg.viewer.components.WPhoto") {
                item.mediaText.refMap[json.dataQuery] = item.mediaText.imageList[imgCount];
                imgCount++;
            }
            if (isGallery(json.componentType)) {
                _.forEach(json.imageList, function (img) {
                    item.mediaText.refMap[img.dataQuery] = item.mediaText.imageList[imgCount];
                    imgCount++;
                });
            }
            if (json.componentType === "wysiwyg.viewer.components.Video") {
                item.mediaText.refMap[json.dataQuery] = item.mediaText.videoList[videoCount];
                videoCount++;
            }
        });

        return item;
    }

    function overrideWithPreviewData(item) {
        if (item._type !== POST_TYPES.MEDIA) {
            return item;
        }
        if (item.unpublishedChanges) {
            UnpublishedChangesFields.filter(function (fieldName) {
                return item.unpublishedChanges[fieldName];
            }).forEach(function (fieldName) {
                item[fieldName] = _.clone(item.unpublishedChanges[fieldName]);
            });
        }
        return fixMediaPostDataRefs(item);

    }

    function addAuthorFieldWhenMissing(item) {
        if (!item.hasOwnProperty('author')) {
            item.author = '';
        }
        return item;
    }

    function doesTranslationExist(lang, postOverrides, item) {
        return lang !== 'en' &&
            postOverrides && postOverrides[item._iid] &&
            item.hasOwnProperty('defaultPost') && item.defaultPost &&
            item._createdAt === item._updatedAt;
    }

    function translateDefaultPosts(item, lang) {
        var postOverrides = defaultPostsTranslation[lang];
        if (doesTranslationExist(lang, postOverrides, item)) {
            var fieldsToOverride = ['title', ['mediaText', 'text'], ['text', 'text'], 'tags'];

            _.forEach(fieldsToOverride, function (field) {
                if (_.isArray(field)) {
                    utils.objectUtils.setInPath(item, field, utils.objectUtils.resolvePath(postOverrides[item._iid], field));
                } else {
                    item[field] = postOverrides[item._iid][field];
                }
            });


        }
        return item;
    }

    /**
     * Removes some of styles from post's excerpt (post.text.text and/or post.description.text property).
     * Fills post.description with post.text property, if description is missing
     * @param {MediaPost} post
     * @returns {MediaPost} post
     */
    function getPostWithoutCertainExcerptStyling(post) {
        var excerptFieldName = 'text',
            hasDescriptionField = !!_.get(post, 'description.text', '');
        if (hasDescriptionField) {
            excerptFieldName = 'description';
        }
        post.text.text = post[excerptFieldName].text
            .replace(/<(?:p|h1|h2|h3|h4|h5|h6)[^>]*>/g, '<hatul>')
            .replace(/<\/(?:p|h1|h2|h3|h4|h5|h6)>/g, '</hatul>')
            .replace(/(font-family:.*?;)/g, '')
            .replace(/(background-color:.*?;)/g, '')
            .replace(/(color:.*?;)/g, '')
            .replace(/(font-size:.*?;)/g, '')
            .replace(/(class=".*?")/g, '');

        return post;
    }

    function getPostWithConvertedMobileTitle(post) {
        post.mobileTitle = post.mobileTitle ? post.mobileTitle : post.title;
        return post;
    }

    /**
     * Resolves categories for posts requested that.
     * Optionally takes a post that needs category resolution.
     * @param {!Object} blogPackageData From site data.
     * @param {!Object=} optionalPost From response.
     */
    function resolveCategories(blogPackageData, optionalPost) {
        if (!blogPackageData.postCategoryResolutionNeedById) {
            blogPackageData.postCategoryResolutionNeedById = {};
        }

        if (optionalPost) {
            // If post categories won't be resolved (either because categories don't exist, or the post doesn't have
            // categories that need to be resolved), the post continues to have empty categories.
            optionalPost.categories = [];

            if (!_.isEmpty(optionalPost.categoryIds)) {
                // If the post has categories that need to be resolved, remember that the post needs category resolution.
                blogPackageData.postCategoryResolutionNeedById[optionalPost._iid] = true;
            }
        }

        var categoryStore = wixappsCore.wixappsDataHandler.getBlogCategoriesFromPackageData(blogPackageData);

        if (!categoryStore) {
            // If categories haven't yet been loaded, wait until they do.
            return;
        }

        if (!categoryStore.categories) {
            // If categories have already been loaded, but there is no any, forget about posts that need category
            // resolution.
            blogPackageData.postCategoryResolutionNeedById = {};
            return;
        }

        // If categories have been loaded and there's at least one category, resolve categories for posts that need
        // category resolution.
        _.forEach(blogPackageData.postCategoryResolutionNeedById, function (postCategoryResolutionNeed, postId) {
            // Forget about the post that needs category resolution.
            delete blogPackageData.postCategoryResolutionNeedById[postId];

            // Resolve categories for the post (if any).
            _([
                _.get(blogPackageData, ['items', 'Posts', postId]),
                _.get(blogPackageData, ['items', 'converted', 'Posts', postId])
            ])
                .compact()
                .forEach(function (post) {
                    post.categories = _(post.categoryIds)
                        .filter(function (categoryId) {
                            return (categoryId in categoryStore.categoryById);
                        })
                        .map(function (categoryId) {
                            return categoryStore.categoryById[categoryId];
                        })
                        .sortBy(function (category) {
                            return _.findIndex(categoryStore.orderedCategories, category);
                        })
                        .value();
                })
                .value();
        });
    }

    function fixMasterPageIdInLinksInside(post) {
        var TEXT_PROPERTY_NAMES = ['mediaText', 'text'];
        _.forEach(TEXT_PROPERTY_NAMES, function (propertyName) {
            var links = _.get(post, [propertyName, 'links']);
            _.forEach(links, function (link) {
                if (link.pageId === '#SITE_STRUCTURE') {
                    link.pageId = utils.siteConstants.MASTER_PAGE_ID;
                }
            });
        });
    }

    return {
        convertMediaPost: convertMediaPost,
        getMediaPostCollection: getMediaPostPath,
        getMediaPostPseudoType: getMediaPostPseudoType,
        fixMediaPostDataRefs: fixMediaPostDataRefs,
        overrideWithPreviewData: overrideWithPreviewData,
        addAuthorFieldWhenMissing: addAuthorFieldWhenMissing,
        translateDefaultPosts: translateDefaultPosts,
        getPostWithoutCertainExcerptStyling: getPostWithoutCertainExcerptStyling,
        resolveCategories: resolveCategories,
        getCoverImageObjFromPost: getCoverImageObjFromPost,
        fixMasterPageIdInLinksInside: fixMasterPageIdInLinksInside,
        getPostWithConvertedMobileTitle: getPostWithConvertedMobileTitle
    };

});
