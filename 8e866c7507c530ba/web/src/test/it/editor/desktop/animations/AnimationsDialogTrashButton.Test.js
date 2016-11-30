describe("Testing trash button functionality", function () {

    it('Should set an animation, delete the behaviors via the trash button and verify that no behaviors are left on the component', function () {

        var selectedComp,
            animationDialog;

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
                    // set animation
                    animationDialog = dialogLogic;
                    animationDialog._animationsGallery.setValue({value:'ExpandIn'});
                })
                .then(function() {
                    // save dialog
                    animationDialog._dialogWindow.endDialog();
                })
                .then(function() {
                    // we should have behaviors
                    expect(selectedComp.getBehaviors()).toBeDefined();
                    // open the dialog once again
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    // click on the trash icon, but wait 50ms before ( it seems like the dialog isn't ready yet )
                    var deferred = Q.defer();
                    animationDialog = dialogLogic;
                    setTimeout(function() {
                        // get the trash icon
                        animationDialog.$view.getElement('[skin="wysiwyg.editor.skins.buttons.ButtonImageManagerDeleteBtnSkin"]').click();
                        // the trash icon should fire - W.Commands.executeCommand('AnimationDialog.RemoveAnimation');
                        animationDialog._dialogWindow.endDialog();
                        deferred.resolve();
                    }, 50);
                    return deferred.promise;
                })
                .then(function() {
                   // behaviors should be deleted by now
                   expect(selectedComp.getBehaviors()).toBeNull();
                });
        });
    });

    it('Should set an animation, delete the behaviors via the trash button and click on "Cancel", verify that the behaviors are kept and not deleted', function() {
        var selectedComp,
            animationDialog,
            behaviors;

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
                    // set animation
                    animationDialog = dialogLogic;
                    animationDialog._animationsGallery.setValue({value:'ExpandIn'});
                })
                .then(function() {
                    // click on 'cancel'
                    animationDialog._dialogWindow.endDialog();
                })
                .then(function() {
                    behaviors = selectedComp.getBehaviors();
                    // we should have behaviors
                    expect(behaviors).toBeDefined();
                    // open the dialog once again
                    return automation.controllers.Animations.openAnimationDialog();
                })
                .then(function(dialogLogic) {
                    // click on the trash icon, but wait 50ms before ( it seems like the dialog isn't ready yet )
                    var deferred = Q.defer();
                    animationDialog = dialogLogic;
                    setTimeout(function() {
                        // get the trash icon
                        animationDialog.$view.getElement('[skin="wysiwyg.editor.skins.buttons.ButtonImageManagerDeleteBtnSkin"]').click();
                        // the trash icon should fire - W.Commands.executeCommand('AnimationDialog.RemoveAnimation');
                        // click on 'cancel' button
                        animationDialog._dialogWindow.endDialog(W.EditorDialogs.DialogButtons.CANCEL);
                        deferred.resolve();
                    }, 50);
                    return deferred.promise;
                })
                .then(function() {
                    // behaviors should be deleted by now
                    expect(selectedComp.getBehaviors()).toEqual(behaviors);
                });
        });
    });

});
