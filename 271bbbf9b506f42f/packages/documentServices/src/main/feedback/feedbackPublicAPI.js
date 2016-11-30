define(['documentServices/feedback/feedback'], function(feedback){
    "use strict";
    return {
        methods: {
            feedback: {
                comments: {
                    create: feedback.comments.create,
                    add: feedback.comments.add,
                    get: feedback.comments.get,
                    remove: feedback.comments.remove,
                    markAsRead: feedback.comments.markAsRead
                },
                generateShareUrl: feedback.generateShareUrl,
                isSiteShared: feedback.isSiteShared,
                markSiteAsShared: feedback.markSiteAsShared
            }
        }
    };
});