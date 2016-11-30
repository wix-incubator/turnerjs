define(['zepto'], function ($) {
    'use strict';

    var SCRIPT = 'http://api.facebook.com/restserver.php?format=json&method=links.getStats&urls=';

    function getNumbers(result) {
        return {
            likesAndShares: result.total_count || 0, //surprisingly enough, facebook counts them as the same thing. If you use the wysiwyg.viewer.components.FacebookShare to share a page, its like counter (wysiwyg.viewer.components.WFacebookLike) will grow too :)
            comments: result.commentsbox_count || 0
        };
    }

    return function (url, callback) {
        $.ajax({
            url: SCRIPT + encodeURIComponent(url),
            dataType: 'json',
            success: function (result, status) {
                if (status === 'success' && result[0]) {
                    var numbers = getNumbers(result[0]);
                    callback(numbers.likesAndShares, numbers.comments);
                } else {
                    callback(0, 0);
                }
            },
            error: function () {
                callback(0, 0);
            }
        });
    };
});
