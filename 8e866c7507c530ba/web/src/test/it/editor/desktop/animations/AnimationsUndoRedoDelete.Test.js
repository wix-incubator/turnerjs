describe("Add an animation and check Undo/Redo", function () {

    // helpers

    /**
     * Undo
     * @returns {Q.promise}
     */
    function undoAction() {
        var promise = automation.controllers.Events.waitForEvent(W.UndoRedoManager, Constants.UrmEvents.UNDO_COMPLETE);
        W.UndoRedoManager.undo();
        return promise;
    }

    /**
     * Redo
     * @returns {Q.promise}
     */
    function redoAction() {
        var promise = automation.controllers.Events.waitForEvent(W.UndoRedoManager, Constants.UrmEvents.REDO_COMPLETE);
        W.UndoRedoManager.redo();
        return promise;
    }

    it('Should set an animation, undo -> check that there are no animations and then bring them back with redo', function () {

        var selectedComp,
            animationDialog;

        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function() {
                    // add button component
                    return automation.viewercomponents.ViewerComponent.addComponent('addButton');
                })
                .then(function(comp) {
                    selectedComp = comp;
                    // open animation dialog
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    animationDialog = dialogLogic;
                    // set FadeIn animation
                    animationDialog._animationsGallery.setValue({value:'FadeIn'});
                })
                .then(function() {
                    // save dialog
                    animationDialog._dialogWindow.endDialog();
                })
                .then(undoAction)
                .then(function() {
                    // getHeaviors() returns null when behaviors are removed from the component
                    expect(selectedComp.getBehaviors()).toBeNull();
                })
                .then(redoAction)
                .then(function() {
                    // expecting to have behaviors
                    expect(selectedComp.getBehaviors()).toBeDefined();
                });
        });
    });

    it('Should set an animation, save -> choose a new animation -> save, undo -> see if we got the original animation, redo -> see if we got the new one', function () {

        var selectedComp,
            animationDialog,
            originalBehaviors,
            newBehaviors;

        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function() {
                    // add button component
                    return automation.viewercomponents.ViewerComponent.addComponent('addButton');
                })
                .then(function(comp) {
                    // set selected component
                    selectedComp = comp;
                })
                .then(function() {
                    // open animation dialog
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    animationDialog = dialogLogic;
                    // set first animation ( ExpandIn )
                    animationDialog._animationsGallery.setValue({value:'ExpandIn'});

                })
                .then(function() {
                    var deferred = Q.defer();
                    // save dialog
                    animationDialog._dialogWindow.endDialog();
                    setTimeout(function() {
                        originalBehaviors = selectedComp.getBehaviors();
                        deferred.resolve();
                    }, 50);
                    return deferred.promise;
                })
                .then(function() {
                    // open the dialog once again
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    animationDialog = dialogLogic;
                    // choose a new animation ( SpinIn )
                    animationDialog._animationsGallery.setValue({value:'SpinIn'});
                })
                .then(function() {
                    var deferred = Q.defer();
                    // save dialog
                    animationDialog._dialogWindow.endDialog();
                    setTimeout(function() {
                        newBehaviors = selectedComp.getBehaviors();
                        deferred.resolve();
                    }, 50);
                    return deferred.promise;
                })
                .then(undoAction) // bring our previous component behaviors
                .then(function() {
                    // expecting to have the original behaviors
                    expect(selectedComp.getBehaviors()).toEqual(originalBehaviors);
                })
                .then(redoAction) // get the new behaviors
                .then(function() {
                    // expecting to have the new behaviors
                    expect(selectedComp.getBehaviors()).toEqual(newBehaviors);
                });
        });
    });

    it('Should set an animation, delete the component, then undo it and check if the animations are set', function() {
        var selectedComp,
            animationDialog,
            originalBehaviors;

        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function() {
                    // add button component
                    return automation.viewercomponents.ViewerComponent.addComponent('addButton');
                })
                .then(function(comp) {
                    selectedComp = comp;
                    // open animation dialog
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    animationDialog = dialogLogic;
                    // set first animation
                    animationDialog._animationsGallery.setValue({value:'FlyIn'});

                })
                .then(function() {
                    var deferred = Q.defer();
                    // save dialog
                    animationDialog._dialogWindow.endDialog();
                    setTimeout(function() {
                        originalBehaviors = selectedComp.getBehaviors();
                        deferred.resolve();
                    }, 50);
                    return deferred.promise;
                })
                .then(function() {
                    // delete the selected component
                    W.Editor.doDeleteSelectedComponent();
                })
                .then(undoAction) // bring our component back to live
                .then(function() {
                    // expecting to have the original behaviors
                    expect(selectedComp.getBehaviors()).toEqual(originalBehaviors);
                });
        });
    });

});
