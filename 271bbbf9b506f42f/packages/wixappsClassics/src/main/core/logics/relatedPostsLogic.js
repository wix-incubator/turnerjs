define(['wixappsCore', 'utils', 'lodash', 'experiment'], function (wixapps, utils, _, experiment) {
    "use strict";

    var logicFactory = wixapps.logicFactory;
    var blogAppPartNames = utils.blogAppPartNames;

    /**
     * @class wixappsClassics.TwoLevelCategoryLogic
     * @param partApi
     * @constructor
     */
    function RelatedPostsLogic (partApi) {
        this.partApi = partApi;
    }

    RelatedPostsLogic.prototype = {
        getViewVars: function () {
            return {
                isEditMode: false
            };
        },
        isHeightResizable: function () {
            var data = this.partApi.getPartData();
            var compData = wixapps.wixappsDataHandler.getDataByCompId(this.partApi.getSiteData(), 'blog', data.id);

            return !_.isEmpty(compData);
        }
    };

    if (experiment.isOpen('sv_blogRelatedPosts')) {
        logicFactory.register(blogAppPartNames.RELATED_POSTS, RelatedPostsLogic);
    }
});
