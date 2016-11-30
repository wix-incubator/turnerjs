define([], function () {
    'use strict';

    var loadCss = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    var currentWindowOnload;
    var boot = function () {
        currentWindowOnload = window.onload;
        window.onload = function() {};
    };

    var playBall = function () {
        currentWindowOnload();
    };

    return {
        loadCss: loadCss,
        boot: boot,
        playBall: playBall
    };

});
