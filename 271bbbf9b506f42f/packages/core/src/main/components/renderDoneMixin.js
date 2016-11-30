define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var pendingCallbacks = [];
    var renderCounter = 0;
    var renderToStringCounter = 0;

    function flushPendingCallbacksIfNotRenderingAndHasPending() {
        if (pendingCallbacks.length && renderCounter === 0) {
            var copyOfPendingCallbacks = pendingCallbacks;
            pendingCallbacks = [];
            _.forEach(copyOfPendingCallbacks, function (callback) {
                callback();
            });
            flushPendingCallbacksIfNotRenderingAndHasPending();
        }
    }

    function finishedRendering() {
        if (renderToStringCounter === 0) {
            renderCounter--;
            flushPendingCallbacksIfNotRenderingAndHasPending();
        }
    }

    function startedRendering() {
        if (renderToStringCounter === 0) {
            renderCounter++;
        }
    }

    function toggleRenderToString(renderingToString) {
        renderToStringCounter += renderingToString ? 1 : -1;
    }

    function callAfterRenderDone(callback) {
        if (!this.isMounted()) {
            utils.log.error('only invoke callAfterRenderDone if the component is mounted');
            return;
        }
        if (renderCounter === 0) {
            callback();
        } else {
            pendingCallbacks.push(callback);
        }
    }

    /**
     * @class core.renderDoneMixin
     */
    return {
        componentDidMount: finishedRendering,
        componentDidUpdate: finishedRendering,
        componentWillMount: startedRendering,
        componentWillUpdate: startedRendering,
        toggleRenderToString: toggleRenderToString,
        callAfterRenderDone: callAfterRenderDone
    };
});
