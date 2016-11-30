define(['zepto'], function ($) {
    'use strict';

    var SCRIPT = 'http://widgets.pinterest.com/v1/urls/count.json?url=';

    return function (url, callback) {
        var result = 0;
        window._tempReceiveCount = window.receiveCount;
        window.receiveCount = function (obj) {
            result = obj.count;
        };
        $.ajax({
            url: SCRIPT + encodeURIComponent(url),
            dataType: 'script',
            complete: function () {
                callback(result);
                window.receiveCount = window._tempReceiveCount;
                delete window._tempReceiveCount;
            }
        });
    };
});
