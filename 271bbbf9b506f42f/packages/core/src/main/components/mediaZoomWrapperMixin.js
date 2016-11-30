define(['lodash', 'core/components/skinBasedComp'],
    function (_, skinBasedComp) {
    'use strict';

    /**
     * @class core.mediaZoomWrapperMixin
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     * @property {function(): object} actualNavigateToItem
     * @property {function(): object} getBoxDimensions
     * @property {function(): object} getChildCompInfo
     * @property {function(): object} getPrevAndNextState
     */
    return {
        mixins: [skinBasedComp],

        componentWillMount: function () {
            // register to 'ESC', 'Right Arrow', 'Left Arrow' key events
            var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
            windowKeyboardEvent.registerToEscapeKey(this);

            var windowTouchEventsAspect = this.props.siteAPI.getSiteAspect('windowTouchEvents');
            windowTouchEventsAspect.registerToWindowTouchEvent('touchMove', this);

            var prevAndNextState = this.getPrevAndNextState();
            if (prevAndNextState.next) {
                windowKeyboardEvent.registerToArrowRightKey(this);
            }
            if (prevAndNextState.prev) {
                windowKeyboardEvent.registerToArrowLeftKey(this);
            }
        },

        componentWillUnmount: function () {
            // un register from keyboard listeners
            this.props.siteAPI.getSiteAspect('windowKeyboardEvent').unRegisterKeys(this);
            this.props.siteAPI.getSiteAspect('windowTouchEvents').unregisterFromWindowTouchEvent('touchMove', this);
        },

        getSkinProperties: function () {
            var componentType = this.getChildZoomComponentType();
            var isMobile = componentType === 'wysiwyg.viewer.components.MobileMediaZoom';
            return {
                '': {
                    children: this.createChildComponent(this.props.compData, componentType, 'mediaZoom', {
                        ref: this.props.compData.id,
                        actualNavigateToItemFunc: this.actualNavigateToItem,
                        getBoxDimensionsFunc: this.getBoxDimensions,
                        getChildCompFunc: this.getChildComp,
                        getPrevAndNextStateFunc: this.getPrevAndNextState,
                        isDataChangedFunc: this.isDataChanged,
                        closeFunction: this.props.closeFunction,
                        enableInnerScrolling: this.enableInnerScrolling || false
                    }),
                    style: {
                        width: "100%",
                        height: "100%",
                        position: isMobile ? 'static' : 'absolute'
                    }
                }
            };
        },

        // Sorry, I couldn't rename the onEscapeKey method.
        closeMediaZoom: function () {
            this.refs[this.props.compData.id].closeMediaZoom();
        },

        /**
         * Handle 'ESC' key event
         */
        onEscapeKey: function () {
            this.closeMediaZoom();
        },

        /**
         * Handle right arrow key event
         */
        onArrowLeftKey: function () {
            this.refs[this.props.compData.id].clickOnPreviousButton();
        },

        /**
         * Handle left arrow key event
         */
        onArrowRightKey: function () {
            this.refs[this.props.compData.id].clickOnNextButton();
        },

        /**
         * Prevent page scroll
         * */
        onWindowTouchMove: function (event) {
            if (!this.enableInnerScrolling) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };
});
