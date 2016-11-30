/**
 * @class bootstrap.utils.StringUtils
 */
define.utils('Math', function(){
    return ({
        inRange: function(number, lowerBound, higherBound) {
            return (number>=lowerBound && number<=higherBound);
        },

        degreesToRadians: function(angleInDegrees){
            return angleInDegrees * Math.PI / 180;
        },

        radiansToDegrees: function(angleInRadians){
            return angleInRadians * 180 / Math.PI;
        },

        _enforceMinMax:function (val, min, max) {
            return Math.min(Math.max(val, min), max);
        }
    });
});