define([
    'lodash',
    'utils',
    'wixappsClassics/core/data/converters/mediaPostConverter',
    'experiment'
], function(
    _,
    utils,
    mediaPostConverter,
    experiment
) {
    'use strict';

    function getCoverImage(post, partApi) {
        var image = {};
        var pseudoType = mediaPostConverter.getMediaPostPseudoType(post);

        if (pseudoType !== 'TextPost') {
            var coverImageObj = mediaPostConverter.getCoverImageObjFromPost(post, pseudoType);
            if (coverImageObj._type === 'PhotoPost') {
                image.height = coverImageObj.photo.height;
                image.width = coverImageObj.photo.width;
                image.src = partApi.resolveImageData(coverImageObj.photo, partApi.getSiteData().serviceTopology, "blog").src;
            } else if (coverImageObj._type === 'VideoPost') {
                image.src = coverImageObj.video && coverImageObj.video.thumbnail;
            }

            if (image.src && !utils.urlUtils.isExternalUrl(image.src)) {
                image.src = partApi.getSiteData().getMediaFullStaticUrl(image.src);
            }
        }

        return image;
    }

    function getOgTags(post, partApi) {
        var tags = [];
        var coverImage = getCoverImage(post, partApi);

        if (coverImage.src) {
            tags.push({
                'property': 'og:image',
                'content': coverImage.src
            });
        }

        return tags;
    }

    function getJsonld(post, partApi) {
        var siteData = partApi.getSiteData();

        var jsonld = {
            '@context': 'http://schema.org',
            '@type': 'BlogPosting',
            '@id': post._iid,
            'mainEntityOfPage': siteData.getCurrentUrl(),
            'headline': siteData.getCurrentUrlPageTitle(),
            'datePublished': post.date.iso,
            'dateModified': post._updatedAt,
            'publisher': {
                '@type': 'Organization',
                'name': siteData.rendererModel.siteInfo.siteTitleSEO
            }
        };

        var coverImage = getCoverImage(post, partApi);
        if (coverImage.src) {
            jsonld.image = {
                '@type': 'ImageObject',
                'url': coverImage.src,
                'height': coverImage.height,
                'width': coverImage.width
            };
        }

        if (post.author) {
            jsonld.author = {
                '@type': 'Person',
                'name': post.author
            };
        }

        return jsonld;
    }

    function getSinglePost(partApi) {
        var dataAspect = partApi.getDataAspect();
        var partId = partApi.getPartData().id;
        var packageName = partApi.getPackageName();
        var path = dataAspect.getDataByCompId(packageName, partId);
        return path ? dataAspect.getDataByPath(packageName, path) : null;
    }

    function transformPostIfPreview(post, partApi) {
        if (utils.stringUtils.isTrue(partApi.getSiteData().currentUrl.query.preview)) {
            return mediaPostConverter.overrideWithPreviewData(post);
        }
        return post;
    }

    function _getPageTitle(siteAPI, post) {
        var title = siteAPI.getSiteData().isMobileView() && post.mobileTitle || post.metaTitle || post.title || '';
        return _.unescape(title).replace(/(<|>)/g, '');
    }

    function _getPageDescription(post) {
        var description = post.metaDescription || _.get(post, ['text', 'text']) || '';
        return description.replace(/(<([^>]+)>)/ig, '').substring(0, 159);
    }

    function _getPageTitleSEO(siteAPI, post) {
        return _getPageTitle(siteAPI, post) + ' | ' + siteAPI.getSiteData().rendererModel.siteInfo.siteTitleSEO;
    }

    function updatePageTitleAndMetaTags(post, partApi) {
        var siteAPI = partApi.getSiteApi();

        var pageTitle = _getPageTitle(siteAPI, post);
        var metaDescription = _getPageDescription(post);
        var pageTitleSEO = _getPageTitleSEO(siteAPI, post);

        siteAPI.setPageTitle(pageTitle, metaDescription, pageTitleSEO);
        siteAPI.setPageMetaKeywords(post.tags ? post.tags.toString() : '');
        siteAPI.setPageMetaOgTags(getOgTags(post, partApi));

        if (experiment.isOpen('sv_addJsonldToHeadForSEO')) {
           siteAPI.setPageJsonld(getJsonld(post, partApi));
        }
    }

    return {
        getSinglePost: getSinglePost,
        transformPostIfPreview: transformPostIfPreview,
        updatePageTitleAndMetaTags: updatePageTitleAndMetaTags
    };
});
