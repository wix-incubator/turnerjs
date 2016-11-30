(function () {
    var model = (editorModel || rendererModel);
    if (model && model.runningExperiments && checkIfExperimentIsRunning(model.runningExperiments,'windowonerror')) {
        describe('window.onerror', function () {
            xit('should not report a caught runtime error', function() {
                spyOn(LOG, 'reportError');
                callFunctionLater(function(){
                        try {
                            throw('some error');
                        }
                        catch (e) {}
                    },
                    function(){expect(LOG.reportError).not.toHaveBeenCalled();}
                );
            })

            xit('should report error on an uncaught runtime error', function () {
                spyOn(LOG, 'reportError');
                callFunctionLater(function(){throw('some error');},
                    function(){expect(LOG.reportError).toHaveBeenCalled();}
                );
            });

            xit('should report error on an uncaught runtime error, only the first time it happens', function () {
                spyOn(LOG, 'reportError');
                callFunctionLater(function(){throw('some error');},function(){});
                callFunctionLater(function(){throw('some error');},function(){
                    expect(LOG.reportError.callCount).toBe(1);}
                );
            });
        });
    }

    function callFunctionLater(func,exp) {
        var cond=false;
        setTimeout(function() {
            cond=true;
            func();
        },10);
        waitsFor(function(){
            return cond;
        });
        runs(exp);
    }

    function checkIfExperimentIsRunning(collection,expName) {
        var val=_.find(collection, function(v,k){return k.toLowerCase()===expName.toLowerCase();});
        if (val) {return val.toLowerCase() === 'new'}
        return false;
    }
}())