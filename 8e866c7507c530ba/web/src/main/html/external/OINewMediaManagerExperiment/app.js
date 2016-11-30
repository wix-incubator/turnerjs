/*global window, document, $, angular*/

if ('transition' in document.documentElement.style){
    window.transitionName = 'transition';
    window.transitionEndEvent = 'transitionend';
} else if('webkitTransition' in document.documentElement.style){
    window.transitionName = 'webkitTransition';
    window.transitionEndEvent = 'webkitTransitionEnd';
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.$win = $(window);

var app = angular.module('organizeImages', ['translation', 'bi']);

app.constant({
    helpId: '/node/6041'
});