define(['lodash'], function (_) {
    'use strict';

    var defaults = {
        touched: false,
        moved: false,
        deltaCoords: {x: 0, y: 0},
        evObj: {}
    };

    var touchEvents = ['onSwipeLeft', 'onSwipeRight', 'onSwipeUp', 'onSwipeDown', 'onTap'];
    var swipeDirectionCallbacks = {
        left: 'onSwipeLeft',
        right: 'onSwipeRight',
        up: 'onSwipeUp',
        down: 'onSwipeDown'
    };

    /**
     *
     * @param e
     * @returns {{x: number, y: number}}
     */
    function getCoords(e) {
        if (e.touches && e.touches.length) {
            var touch = e.touches[0];
            return {
                x: touch.pageX,
                y: touch.pageY
            };
        }
    }

    /**
     *
     * @constructor
     */
    function Touchy() {
        this.data = {};
    }

    Touchy.prototype = {

        /**
         *
         * @param e
         */
        onTouchStart: function (e) {
            this.data = _.defaults({
                touched: true,
                numOfTouches: e.touches.length,
                startCoords: getCoords(e),
                startTime: Date.now(),
                evObj: _.clone(e)
            }, defaults);
        },

        /**
         *
         * @param e
         */
        onTouchMove: function (e) {
            var coords = getCoords(e);
            if (coords) {
                if (!this.data.startCoords) {
                    this.data.startCoords = coords;
                }

                var deltaX = this.data.startCoords.x - coords.x;
                var deltaY = this.data.startCoords.y - coords.y;

                this.data.moved = true;
                this.data.deltaCoords = {
                    x: deltaX,
                    y: deltaY
                };
            }
        },

        /**
         *
         * @param callbacks
         */
        onTouchEnd: function (callbacks) {
            var swipeDirection, swipeCallback;
            this.data.endTime = Date.now();

            if (_.isEmpty(callbacks)) {
                return;
            }

            if (this.isValidSwipe()) {
                swipeDirection = this.getSwipeDirection(this.data.deltaCoords.x, this.data.deltaCoords.y);
                swipeCallback = swipeDirectionCallbacks[swipeDirection];
                if (callbacks[swipeCallback]) {
                    callbacks[swipeCallback](this.data.evObj);
                }
            } else if (this.isValidTap()) {
                if (callbacks.onTap) {
                    callbacks.onTap(this.data.evObj);
                }
            }
        },

        /**
         *
         * @param ref
         */
        registerTouchEvents: function (ref) {
            var callbacks = _.pick(ref, touchEvents);
            if (!_.isEmpty(callbacks)) {
                ref.onTouchStart = this.onTouchStart.bind(this);
                ref.onTouchMove = this.onTouchMove.bind(this);
                ref.onTouchEnd = this.onTouchEnd.bind(this, callbacks);
            }
        },

        /**
         *
         * @returns {boolean}
         */
        isValidSwipe: function () {
            return this.data.moved &&
                this.data.numOfTouches === 1 &&
                (this.data.endTime - this.data.startTime) < 500 &&
                (Math.abs(this.data.deltaCoords.x) > 100 || Math.abs(this.data.deltaCoords.y) > 60);
        },

        /**
         *
         * @returns {boolean}
         */
        isValidTap: function () {
            return this.data.touched && !this.data.moved && this.data.numOfTouches === 1;
        },

        /**
         *
         * @param deltaX
         * @param deltaY
         * @returns {string}
         */
        getSwipeDirection: function (deltaX, deltaY) {
            var direction;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'left' : 'right';
            } else {
                direction = deltaY > 0 ? 'up' : 'down';
            }
            return direction;
        }
    };

    return Touchy;
});
