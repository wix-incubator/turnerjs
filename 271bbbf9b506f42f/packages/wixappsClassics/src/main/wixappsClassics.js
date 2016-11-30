define([
    "core",
    "wixappsCore",
    "wixappsClassics/blog/blog",
    "wixappsClassics/comps/appPart",
    "wixappsClassics/comps/appPartZoom",
    "wixappsClassics/util/viewCacheUtils",
    "wixappsClassics/util/numberOfPostsPerPageGetter",
    "wixappsClassics/util/componentTypeUtil",
    "wixappsClassics/util/descriptorUtils",
    "wixappsClassics/util/blogSinglePostPageLogicUtils",
    "wixappsClassics/core/appPartDataRequirementsChecker",
    "wixappsClassics/core/appPartStyleCollector",
    "wixappsClassics/ecommerce/ecommerce",

    "wixappsClassics/core/data/converters/mediaPostConverter",
    "wixappsClassics/core/langs/defaultPostsTranslation",

    "wixappsClassics/util/fontUtils",

    //core logics
    "wixappsClassics/core/logics/twoLevelCategoryLogic",
    "wixappsClassics/core/logics/listFromPageLogic",
    "wixappsClassics/core/logics/archiveLogic",
    "wixappsClassics/core/logics/singlePostPageLogic",
    "wixappsClassics/core/logics/customFeedLogic",
    "wixappsClassics/core/logics/relatedPostsLogic"
], function (
    core,
    wixappsCore,
    blog,
    appPart,
    appPartZoom,
    viewCacheUtils,
    numberOfPostsPerPageGetter,
    componentTypeUtil,
    descriptorUtils,
    blogSinglePostPageLogicUtils
) {
    'use strict';

    var functionLibrary = wixappsCore.FunctionLibrary;
    functionLibrary.prototype.addFunctions(blog.functionLibrary);

    core.compRegistrar.register("wixapps.integration.components.AppPart", appPart);
    core.compRegistrar.register("wixapps.integration.components.AppPartZoom", appPartZoom);

    return {
        viewCacheUtils: viewCacheUtils,
        numberOfPostsPerPageGetter: numberOfPostsPerPageGetter,
        componentTypeUtil: componentTypeUtil,
        descriptorUtils: descriptorUtils,
        blogSinglePostPageLogicUtils: blogSinglePostPageLogicUtils
    };
});
