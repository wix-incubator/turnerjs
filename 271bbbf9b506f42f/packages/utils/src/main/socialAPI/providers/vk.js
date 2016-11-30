define([], function () {
    'use strict';

    var SCRIPT = 'http://vk.com/share.php?act=count&url=';

    function cleanScript(script){
        window.VK = window._tempVK;
        delete window._tempVK;
        window.document.head.removeChild(script);
    }

    return function (url, callback) {
        var script = window.document.createElement('script');
        var result = 0;

        window._tempVK = window.VK;
        window.VK = {
            Share: {
                count: function (index, count) {
                    result = count;
                }
            }
        };

        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', SCRIPT + encodeURIComponent(url));
        script.addEventListener('load', function () {
            callback(result);
            cleanScript(script);
        });
        script.addEventListener('error', function () {
            callback(result);
            cleanScript(script);
        });

        window.document.head.appendChild(script);
    };
});
