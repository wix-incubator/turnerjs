/**
 * @class bootstrap.utils.LayoutUtils
 */
define.utils('Layout', function() {
    return ({
        /**
         * @returns {number} the bounding width according to given params.
         * @param {number} width - component width as int
         * @param {number} height - component height as int
         * @param {number} angleInRadians - component
         */
        getBoundingWidth: function(width, height, angleInRadians) {
            return parseInt(Math.abs(width * Math.cos(angleInRadians)) + Math.abs(height * Math.sin(angleInRadians)), 10);
        },

        /**
         * @returns {number} the bounding height according to given params. If angleInRadians === 0, return value === height
         * @param {number} width
         * @param {number} height
         * @param {number} angleInRadians
         */
        getBoundingHeight: function(width, height, angleInRadians) {
            return parseInt(Math.abs(width * Math.sin(angleInRadians)) + Math.abs(height * Math.cos(angleInRadians)), 10);
        },

        /**
         * @returns {number} the bounding box's x according to given params. If the component isn't rotated boundingX === component.x
         * @param {number} x - component x as int
         * @param {number} width - component width as int
         * @param {number} boundingWidth - component boundingWidth as int
         */
        getBoundingX: function(x, width, boundingWidth) {
            return parseInt(x - (boundingWidth - width) / 2, 10);
        },

        /**
         * @returns {number} the bounding box's y according to given params. If the component isn't rotated boundingY === component.y
         * @param {number} y - component y as int
         * @param {number} height - component height as int
         * @param {number} boundingHeight - component boundingHeight as int
         */
        getBoundingY: function(y, height, boundingHeight) {
            return parseInt(y - (boundingHeight - height) / 2, 10);
        },

        /**
         * Get all position coordinates of a Wix component, like mootools getCoordinates and like native getBoundingClientRect for html elements
         * Use when you can't trust the DOM.
         * If the component or one of it's parents is fixed positioned, will ignore page scroll
         * NOTE: The calculations are not accurate because components are relative inner box of their parent container and not to their location
         * @param {BaseComp|BaseComponent|HTMLElement} comp the component
         * @returns {{top: number, left: number, bottom: number, right: number, width: number, height: number}} in pixels
         */
        getComponentApproximateCoordinates: function(comp){
            comp = (comp.$view)? comp : comp.$logic;
            var offset = this.getComponentApproximateOffset(comp);
            var isFixed = this.isComponentOrParentsFixedPositioned(comp);
            var dimensions = {width: comp.getWidth(), height: comp.getHeight()};
            var scroll = (isFixed)? {x:0, y:0} : {x: comp.$view.ownerDocument.window.pageXOffset, y: comp.$view.ownerDocument.window.pageYOffset};
            return {
                top: offset.top - scroll.y,
                left: offset.left - scroll.x,
                bottom: dimensions.height + offset.top - scroll.y,
                right: dimensions.width + offset.left - scroll.x,
                width: dimensions.width,
                height: dimensions.height
            };
        },

        /**
         * Return true if a component or one of it's parents has "position:fixed"
         * @param (BaseComp|BaseComponent} comp
         * @returns {boolean}
         */
        isComponentOrParentsFixedPositioned: function(comp){
            while (comp) {
                if (comp.isFixedPositioned()){
                    return true;
                }
                comp = comp.getParentComponent();
            }
            return false;
        },

        /**
         * get the absolute x and y of a component
         * NOTE: The calculations are not accurate because components are relative inner box of their parent container and not to their location
         * @param {BaseComponent|BaseComp} comp
         * @returns {{top: number, left: number}}
         */
        getComponentApproximateOffset: function(comp) {
            var top = 0, left = 0;
            var prevComp = comp;
            while (comp) {
                top = top + parseInt(comp.getY(), 10);
                left = left + parseInt(comp.getX(), 10);
                prevComp = comp;
                comp = comp.getParentComponent();
            }
            //NOTE: fix WSiteStructure not having the correct 'left' value
            left = left + (prevComp.$view.ownerDocument.window.innerWidth - prevComp.getWidth())/2;
            return {top: top, left: left};
        }

    });
});