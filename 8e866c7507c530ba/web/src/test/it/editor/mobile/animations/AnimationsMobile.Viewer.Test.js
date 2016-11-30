describe("Testing animations on mobile viewer", function () {

    /**
        Cached local variables
     */
    var selectedComp,
        animationDialog,
        previewSite;

    /**
     * Adds a button component
     * @returns {Q.promise}
     */
    function addButtonComponent() {
        return automation.viewercomponents.ViewerComponent.addComponent('addButton');
    }

    /**
     * Set animation for our component
     * @param animationName
     */
    function setComponentAnimation(animationName) {
        animationDialog._animationsGallery.setValue({value:animationName});
    }

    /**
     * Scroll to the bottom of the page 'slowly' emulating user's scroll
     * If we would just to the bottom of the page using scrollTo(0, pageYbottom) then we
     * will not trigger the animations!
     * @returns {Q.promise}
     */
    function scrollToBottomOfThePage() {
        var bottomY = previewSite.getScrollSize().y;

        return automation.controllers.Animations.scrollToY(bottomY, {
            previewContext: true,
            delay: 50,
            deltaY: 50
        });
    }

    /**
     * Wait for preview manager to become ready
     * @returns {Q.promise}
     */
    function waitForPreviewSite() {
        var deferred = Q.defer();

        resource.getResourceValue('W.Preview', function(previewManager) {
            previewSite = previewManager.getPreviewSite();
            deferred.resolve();
        });

        return deferred.promise;
    }

    /**
     * Check if the component has played in the mobile viewer
     */
    function checkIfComponentHasNotPlayedInMobileViewer() {
        expect(W.Preview.getPreviewManagers().Commands.executeCommand).not.toHaveBeenCalledWith('TweenEngine.AnimationStart', jasmine.any(Object), 'TweenEngine');
    }

    it('Should open animation dialog, set an animation, switch to mobile and see that no animation is played there', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                // add button component
                .then(addButtonComponent)

                // cache comp logic and open animation dialog
                .then(function(comp) {
                    selectedComp = comp;
                    return automation.controllers.Animations.openAnimationDialog();
                })

                // cache dialog logic and set animation
                .then(function(dialogLogic) {
                    animationDialog = dialogLogic;
                    setComponentAnimation('ExpandIn');
                })

                // save animation dialog
                .then(function() {
                    animationDialog._dialogWindow.endDialog();
                })

                // change to mobile editor
                .then(function() {
                    return automation.controllers.States.switchToMobileEditor();
                })

                // switch to mobile preview
                .then(function() {
                    automation.controllers.States.changeToPreviewSync();
                })

                // spy on executeCommand
                .then(function() {
                    spyOn(W.Preview.getPreviewManagers().Commands, 'executeCommand');
                })

                // waits until preview site is ready
                .then(function() {
                    return waitForPreviewSite();
                })

                // scroll to the bottom of the page ( should trigger the animations )
                .then(scrollToBottomOfThePage)

                // check if component did not animate in mobile viewer
                .then(checkIfComponentHasNotPlayedInMobileViewer)

                // change to edit mode
                .then(function() {
                    automation.controllers.States.changeToEditModeSync();
                })

                // change to desktop
                .then(function() {
                    automation.controllers.States.switchToDesktopEditorSync();
                });
        });
    });

});
