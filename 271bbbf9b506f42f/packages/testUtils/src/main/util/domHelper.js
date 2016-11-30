define(['lodash'], function (_) {
    'use strict';

    function getStyleObject(domElement) {
        var styleProps = _(domElement.style).toArray().map(_.camelCase).value();
        return _.pick(domElement.style, styleProps);
    }

    return {
        getStyleObject: getStyleObject
    };
});