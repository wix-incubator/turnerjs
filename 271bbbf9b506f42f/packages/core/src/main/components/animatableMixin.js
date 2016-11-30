define(['reactDOM', 'lodash'], function (ReactDOM, _) {
    'use strict';

    function forceRedraw(comp) {
        var display = comp.style.display;
        comp.style.display = 'none';
        // no need to store this anywhere, the reference is enough
        comp.offsetHeight; // eslint-disable-line no-unused-expressions
        comp.style.display = display;
    }

    /**
     * @class core.animatableMixin
     */

    return {
        isAnimatable: true,
        shouldChildrenUpdate: true,

        /**
         * Reset the animations counter
         */
        componentWillMount: function () {
            this._animatableMixin = {
                animationsCounter: 0,
                deferredStates: []
            };
        },

        componentDidMount: function () {
            this._animatableMixin.setStateOrig = this.setState;
        },

        /**
         * Reset the layout update when unmounting
         */
        componentWillUnmount: function () {
            this._animatableMixin.updateOnAnimationEnded = false;
            // TODO delete sequence if unmounting
        },

        /**
         * Increase the animations counter when an animation starts
         */
        animationStarted: function () {
            if (++this._animatableMixin.animationsCounter === 1) {
                this.setState = this.setStateDeferred;
                this.isAnimating = true;
            }
            if (!this.shouldChildrenUpdate) {
                _(this.refs)
                    .filter('isAnimatable')
                    .invoke('animationStarted')
                    .value();
            }
        },
        /**
         * Decrease the animations counter when an animation ends.
         * @param {boolean} [shouldUpdate=true]
         */
        animationEnded: function (shouldUpdate) {
            shouldUpdate = shouldUpdate !== false;

            if (!this.shouldChildrenUpdate) {
                _(this.refs)
                    .filter('isAnimatable')
                    .invoke('animationEnded', false)
                    .value();
            }

            var animatableMixin = this._animatableMixin;
            if (animatableMixin.animationsCounter) {
                if (--animatableMixin.animationsCounter === 0) {
                    this.setState = animatableMixin.setStateOrig;
                    this.isAnimating = false;
                }
            }

            if (shouldUpdate) {
                if (animatableMixin.deferredStates.length) {
                    var deferredStates = animatableMixin.deferredStates;
                    for (var i = 0; i < deferredStates.length; i += 2) {
                        animatableMixin.setStateOrig.call(this, deferredStates[i], deferredStates[i + 1]);
                    }
                    deferredStates.length = 0;
                } else if (animatableMixin.updateOnAnimationEnded) {
                    this.forceUpdate();
                }
            }
            this._updateOnAnimationEnded = false;

            if (this.forceRedrawOnAnimationEnded === true) {
                forceRedraw(ReactDOM.findDOMNode(this));
            }
        },

        setStateDeferred: function (newState, callback) {
            var deferredStates = this._animatableMixin.deferredStates;
            var length = deferredStates.length;
            if (length === 0 || deferredStates[length - 1] || callback) {
                deferredStates.push(newState);
                deferredStates.push(callback);
            } else {
                _.assign(deferredStates[length - 2], newState);
                deferredStates[length - 1] = callback;
            }
        },

        /**
         * Return false if this component is currently animating and should not be updated
         * @returns {boolean}
         */
        shouldComponentUpdateAnimatable: function () {
            var goingToUpdate = this._animatableMixin.animationsCounter === 0;
            if (!goingToUpdate) {
                this._animatableMixin.updateOnAnimationEnded = true;
            }

            return goingToUpdate;
        }
    };
});
