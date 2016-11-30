define([], function(){
    'use strict';

    var HORIZONTAL = {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right'
    };

    var VERTICAL = {
        TOP: 'top',
        CENTER: 'center',
        BOTTOM: 'bottom'
    };


    return {
        /**
         * this method assumes the the component parent is horizontally centered relative to screen
         * AND when the screen is smaller than the parent, you will see the left (and not center) side of the parent
         * like page :)
         * @param {{horizontalAlignment: string, horizontalOffset: int}} compAlignmentProps
         * @param compWidth
         * @param screenWidth
         * @param pageWidth
         * @returns {*}
         */
        getLeft: function(compAlignmentProps, compWidth, screenWidth, pageWidth){
            var left;
            var visibleWidthOfPage = Math.min(pageWidth, screenWidth);
            var pageToScreenDistance = (screenWidth - pageWidth) / 2;

            switch (compAlignmentProps.horizontalAlignment){
                case HORIZONTAL.LEFT:
                    left = -Math.max(0, pageToScreenDistance);
                    left += compAlignmentProps.horizontalOffset;
                    break;
                case HORIZONTAL.RIGHT:
                    left = visibleWidthOfPage - compWidth + Math.max(0, pageToScreenDistance);
                    left -= compAlignmentProps.horizontalOffset;
                    break;
                case HORIZONTAL.CENTER:
                    left = (visibleWidthOfPage - compWidth) / 2;
                    left += compAlignmentProps.horizontalOffset;
                    break;
            }

            return left;
        },

        /**
         * this method assumes that the component parent is at top = 0
         * @param {{verticalAlignment: string, verticalOffset: int}} compAlignmentProps
         * @param compHeight
         * @param screenHeight
         * @returns {*}
         */
        getTop: function(compAlignmentProps, compHeight, screenHeight){
            var top;
            var diffScreenToCompHeight = screenHeight - compHeight;
            switch (compAlignmentProps.verticalAlignment){
                case VERTICAL.TOP:
                    top = compAlignmentProps.verticalOffset;
                    break;
                case VERTICAL.BOTTOM:
                    top = Math.max(diffScreenToCompHeight - compAlignmentProps.verticalOffset, 0);
                    break;
                case VERTICAL.CENTER:
                    top = Math.max(diffScreenToCompHeight / 2, 0);
                    top += compAlignmentProps.verticalOffset;
                    break;
            }

            return top;
        }
    };
});