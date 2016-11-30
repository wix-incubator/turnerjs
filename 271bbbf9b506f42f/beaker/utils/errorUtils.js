define(["lodash"], function (_) {
    "use strict";

    var waitForErrorCallbacks;

    function waitForError(documentServices, callback, errorToWaitFor) {

        function errorCallback(errorInfo) {
            documentServices.unRegisterFromErrorThrown(errorCallback);

            var message = errorInfo.error.message || errorInfo.error;
            if (errorToWaitFor) {
                if (message !== errorToWaitFor) {
                    expect(message).toBe(errorToWaitFor);
                }
            } else {
                console.log(message);
            }

            _.defer(callback);
        }

        waitForErrorCallbacks = waitForErrorCallbacks || [];
        waitForErrorCallbacks.push(errorCallback);

        documentServices.registerToErrorThrown(errorCallback);
    }

    function waitForSuccess(documentServices, callback) {
        function errorCallback(error) {
            fail({stack: _.get(error, ['error', 'stack']), message: _.get(error, ['error', 'message'])});
        }

        waitForErrorCallbacks = waitForErrorCallbacks || [];
        waitForErrorCallbacks.push(errorCallback);

        documentServices.registerToErrorThrown(errorCallback);

        documentServices.waitForChangesApplied(function() {
            return _.defer(callback);
        });
    }

    function cleanWaitForErrorCallbacks(documentServices) {
        if (!waitForErrorCallbacks) {
            return;
        }
        for (var i = 0; i < waitForErrorCallbacks.length; i++) {
            var callback = waitForErrorCallbacks[i];
            documentServices.unRegisterFromErrorThrown(callback);
        }
    }

    return {
        waitForError: waitForError,
        waitForSuccess: waitForSuccess,
        cleanWaitForErrorCallbacks: cleanWaitForErrorCallbacks
    };
});
