define([], function() {
    'use strict';

    var blockOuterScroll = function (e) {
        var contentNode = e.currentTarget;
        var totalHeight = e.currentTarget.scrollHeight;
        var maxScroll = totalHeight - e.currentTarget.offsetHeight;
        var delta = e.deltaY % 3 ? (e.deltaY) : (e.deltaY * 10);
        if (contentNode.scrollTop + delta <= 0) {
            contentNode.scrollTop = 0;
            e.preventDefault();
        } else if (contentNode.scrollTop + delta >= maxScroll) {
            contentNode.scrollTop = maxScroll;
            e.preventDefault();
        }
        e.stopPropagation();
    };

    return {
        blockOuterScroll: blockOuterScroll
    };
});
