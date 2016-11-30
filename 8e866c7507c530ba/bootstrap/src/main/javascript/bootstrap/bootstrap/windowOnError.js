(function(){
    try {
        var model = (window.editorModel || window.rendererModel);
        if (model && model.runningExperiments && model.runningExperiments.windowonerror && model.runningExperiments.windowonerror.toLowerCase() === 'new') {
            var anErrorHasOccurred = false;
            function handleFatalError(error, url, lineNumber){
                //we want this to happen only once, and then to disable the whole onerror here, so:
                if (!anErrorHasOccurred) {
                    anErrorHasOccurred = true;
                    LOG.reportError(wixErrors.WINDOW_ON_ERROR, {c1: error, c2: url, i1: lineNumber});
                    if (console && console.error) {
                        console.error('An error occurred in the code: ', error, url, lineNumber);
                    }
                    
                    //openCrashDialog();
                }
            }

            var oldOnError = window.onerror;
            window.onerror = function(error, url, lineNumber){
                handleFatalError(error, url, lineNumber);
                if (typeof oldOnError === 'function') {
                    oldOnError.apply(this, arguments);
                }
            };
        }
    }
    catch(e){}
}());