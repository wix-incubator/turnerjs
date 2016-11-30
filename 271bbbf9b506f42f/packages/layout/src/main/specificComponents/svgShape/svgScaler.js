/**
 * Created by eitanr on 6/23/14.
 */
define(['lodash',
    'layout/specificComponents/svgShape/svgScalerUtils',
    'layout/specificComponents/svgShape/svgPathScaler',
    'layout/specificComponents/svgShape/svgPolygonScaler',
    'layout/specificComponents/svgShape/svgCircleScaler',
    'layout/specificComponents/svgShape/svgRectScaler',
    'layout/specificComponents/svgShape/svgEllipseScaler',
    'layout/specificComponents/svgShape/svgPolylineScaler',
    'layout/specificComponents/svgShape/svgLineScaler'], function (_, utils, pathScaler, polygonScaler, circleScaler, rectScaler, ellipseScaler, polylineScaler, lineScaler) {
    'use strict';
    var isValidSvgChild = function (elementName) {
            return _.includes(['path', 'polygon', 'rect', 'circle', 'ellipse', 'polyline', 'line'], elementName.toLowerCase());
        },
        calculateScale = function (oldSize, newSize, maintainAspectRatio, originalAspectRatio) {
            var currentAspectRatio = newSize.width / newSize.height,
                scaleX,
                scaleY,
                growsInWidth = currentAspectRatio > originalAspectRatio,
                growsInHeight = currentAspectRatio < originalAspectRatio,
                newWidth,
                newHeight;

            if (!oldSize.width) {
                scaleX = 1;
            } else if (maintainAspectRatio && growsInWidth) {
                newWidth = newSize.height * originalAspectRatio;
                scaleX = newWidth / oldSize.width;
            } else {
                scaleX = newSize.width / oldSize.width;
            }

            if (!oldSize.height) {
                scaleY = 1;
            } else if (maintainAspectRatio && growsInHeight) {
                newHeight = newSize.width / originalAspectRatio;
                scaleY = newHeight / oldSize.height;
            } else {
                scaleY = newSize.height / oldSize.height;
            }

            return {
                scaleX: utils.round(scaleX),
                scaleY: utils.round(scaleY)
            };
        },
        isEqualSize = function (size1, size2, tolerance) {
            return Math.abs(size1.width - size2.width) < tolerance && Math.abs(size1.height - size2.height) < tolerance;
        },
        translateShapePosition = function (groupElement, stroke, box) {
            groupElement.setAttribute('transform', 'translate(' + parseFloat((-1 * box.x) + stroke * 0.5) + ',' + parseFloat((-1 * box.y) + stroke * 0.5) + ')');
        },
        getOriginalAspectRatio = function (svgElement) {
            var originalAspectRatio = svgElement.getAttribute('data-original-aspect-ratio');
            return originalAspectRatio ? Number(originalAspectRatio) : null;
        },
        setOriginalAspectRatio = function (svgElement, aspectRatio) {
            if (!svgElement.hasAttribute('data-original-aspect-ratio')) {
                svgElement.setAttribute('data-original-aspect-ratio', aspectRatio);

                //fix for IE 10, somehow attribute viewBox could not be removed
                svgElement.setAttribute('viewBox', '');
                svgElement.removeAttribute('viewBox');
            }
        },
        scale = function (svgElement, requestedSize, currentBoundingBox, strokeWidth, maintainAspectRatio) {
            var groupElement = svgElement.getElementsByTagName('g')[0],
                currentSize = _.pick(currentBoundingBox, ['width', 'height']),
                currentAspectRatio = currentSize.width / currentSize.height,
                currentPosition = _.pick(currentBoundingBox, ['x', 'y']),
                scalers = {
                    path: pathScaler,
                    polygon: polygonScaler,
                    rect: rectScaler,
                    circle: circleScaler,
                    ellipse: ellipseScaler,
                    polyline: polylineScaler,
                    line: lineScaler
                };
            if (!groupElement){
                return;
            }
            var originalAspectRatio = getOriginalAspectRatio(svgElement);
            if (!originalAspectRatio) {
                originalAspectRatio = currentBoundingBox.width / currentBoundingBox.height;
                setOriginalAspectRatio(svgElement, originalAspectRatio);
            }

            if (isEqualSize(requestedSize, currentSize, 1) && (!maintainAspectRatio || currentAspectRatio === originalAspectRatio)) {
                return;
            }

            var scaleFactor = calculateScale(currentSize, requestedSize, maintainAspectRatio, originalAspectRatio);

            _(groupElement.childNodes)
                .filter(function (elem) {
                    return isValidSvgChild(elem.nodeName);
                }).forEach(function (elem) {
                var nodeName = elem.nodeName.toLowerCase();
                scalers[nodeName].scale(elem, scaleFactor.scaleX, scaleFactor.scaleY);
            }).commit();

            translateShapePosition(groupElement, strokeWidth, {
                x: currentPosition.x * scaleFactor.scaleX,
                y: currentPosition.y * scaleFactor.scaleY
            });

            svgElement.style.width = Math.ceil(currentSize.width * scaleFactor.scaleX + strokeWidth) + 'px';
            svgElement.style.height = Math.ceil(currentSize.height * scaleFactor.scaleY + strokeWidth) + 'px';
        };

    return {
        scale: scale
    };

});
