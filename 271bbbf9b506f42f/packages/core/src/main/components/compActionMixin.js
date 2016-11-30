define(['lodash', 'santaProps'], function (_, santaProps) {
    'use strict';

    function getEvent(syntheticEvent) {
        var basicEvent = {
            id: this.props.id,
            timeStamp: window.performance ? window.performance.now() : window.Date.now()
        };

        if (!syntheticEvent) {
            return basicEvent;
        }

        basicEvent.timeStamp = syntheticEvent.timeStamp || basicEvent.timeStamp;
        return _.defaults(basicEvent, syntheticEvent);
    }

    return {
        propTypes: {
            id: santaProps.Types.Component.id,
            handleAction: santaProps.Types.Behaviors.handleAction,
            compActions: santaProps.Types.Component.compActions
        },

        handleAction: function (actionName, syntheticEvent) {
            var actionToHandle = _.get(this.props.compActions, actionName);
            if (actionToHandle) {
                this.props.handleAction(actionToHandle, getEvent.call(this, syntheticEvent));
            }
        }
    };
});
