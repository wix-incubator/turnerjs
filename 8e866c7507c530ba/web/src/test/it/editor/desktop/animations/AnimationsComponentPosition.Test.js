//integration.requireExperiments(['animationphase1:new', 'animationeditorphase1:new']);

describe("Component position test", function () {

    /**
     Cached local variables
     */
    var selectedComp,
        selectedCompOriginalBoundingClientRect,
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
     * Sets animation for the dialog
     * @returns {Q.promise}
     */
    function setComponentAnimation(dialogLogic) {
        animationDialog = dialogLogic;
        animationDialog._animationsGallery.setValue({value:'SpinIn'});
    }

    /**
     * Click on the 'preview button' to emulate animation event
     */
    function playAndCheckAnimationsInEditor() {
        var promise = checkIfComponentHasPlayedInEditor();
        animationDialog._previewAnimation();
        return promise;
    }

    /**
     * Check if the component has played in the editor
     */
    function checkIfComponentHasPlayedInEditor() {
        return automation.controllers.Animations.waitForAnimationComplete(function(args) {
            return args && args.tweens && args.tweens[0].target.id === selectedComp.$view.id;
        }, true);
    }

    /**
     * Check if the original position of the component has changed ( it shouldn't! )
     */
    function CheckIfComponentRevertedToOriginalPosition() {
        expect(selectedCompOriginalBoundingClientRect).toEqual(selectedComp.$view.getBoundingClientRect());
    }

    /**
     * Save the animation dialog ( its like clicking the 'OK' button )
     */
    function saveAnimationDialog() {
        animationDialog._dialogWindow.endDialog();
    }

    /**
     * Scroll to the bottom of the page 'slowly' emulating user's scroll
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

    it('Add a component, play it in the editor & preview and verify that it returned to its original position',function(){
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                // add button component
                .then(addButtonComponent)

                // cache comp logic, save original coords and open the animation dialog
                .then(function(comp) {
                    selectedComp = comp;
                    selectedCompOriginalBoundingClientRect = selectedComp.$view.getBoundingClientRect();
                    return automation.controllers.Animations.openAnimationDialog();
                })

                // set component animation
                .then(setComponentAnimation)

                // play component in the editor
                .then(playAndCheckAnimationsInEditor)

                // check if the component has retained the same position
                .then(CheckIfComponentRevertedToOriginalPosition)

                // save animation dialog
                .then(saveAnimationDialog)

                // change to preview
                .then(function() {
                    automation.controllers.States.changeToPreviewSync();
                })

                // waits until preview site is ready
                .then(function() {
                    return waitForPreviewSite();
                })

                // scroll to the bottom of the page
                .then(function() {
                    return scrollToBottomOfThePage();
                })

                // change to edit mode
                .then(function() {
                    automation.controllers.States.changeToEditModeSync();
                })

                // check if the component has retained the same position
                .then(CheckIfComponentRevertedToOriginalPosition);
        });
    });

});
