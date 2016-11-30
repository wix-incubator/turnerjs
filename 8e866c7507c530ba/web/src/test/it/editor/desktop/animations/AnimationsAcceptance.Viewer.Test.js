describe("Add 6 components on stage, each with a different animation, test in preview", function () {

    /**
     Cached local variables
     */
    var selectedComp,
        animationDialog,
        compPosition = 0,
        previewSite,
        compPositions = [
            /* above the fold */
            {
                x: 100,
                y: 100
            },
            {
                x: 200,
                y: 200
            },
            {
                x: 300,
                y: 300
            },
            /* below the fold */
            {
                x: 400,
                y: 1000
            },
            {

                x: 500,
                y: 1100
            },
            {
                x: 600,
                y: 1200
            }
        ];

    /**
     * Add a button component
     * @returns {Q.promise}
     */
    function addButtonComponent() {
        return automation.viewercomponents.ViewerComponent.addComponent('addButton');
    }

    /**
     * Set component position based on compPositions map
     * @param {Object} comp
     */
    function setComponentPosition(comp) {
        var _compPos = compPosition++;
        selectedComp = comp;
        selectedComp.setX(compPositions[_compPos].x);
        selectedComp.setY(compPositions[_compPos].y);
    }

    /**
     * Set animation for our component
     * @param animationName
     */
    function setComponentAnimation(animationName) {
        animationDialog._animationsGallery.setValue({value:animationName});
    }

    /**
     * Save the animation dialog ( its like clicking the 'OK' button )
     */
    function saveAnimationDialog() {
        animationDialog._dialogWindow.endDialog();
    }

    /**
     * Play animations in the viewer using the 'scrollToBottomOfThePage()' trigger and checks them
     * @returns {Q.promise}
     */
    function playAndCheckAnimationsInViewer() {
        return Q.all([scrollToBottomOfThePage(), checkIfComponentHasPlayedInViewer()]);
    }

    /**
     * Check if the component has played in the viewer
     */
    function checkIfComponentHasPlayedInViewer() {
        return automation.controllers.Animations.waitForAnimationStart(function(args) {
            console.log(selectedComp.$view.id);
            return args && args.tweens && args.tweens[0].target.id === selectedComp.$view.id;
        }, true);
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
     * Check if the component has played in the viewer
     */
    function checkIfNoComponentsPlayedOnViewer() {
        expect(W.Preview.getPreviewManagers().Commands.executeCommand).not.toHaveBeenCalledWith('TweenEngine.AnimationStart', jasmine.any(Object), 'TweenEngine');
    }

    /**
     * Wait for preview manager to become ready
     * @returns {Q.promise|Boolean}
     */
    function waitForPreviewSite() {
        if (previewSite) { return true; }

        var deferred = Q.defer();

        resource.getResourceValue('W.Preview', function(previewManager) {
            previewSite = previewManager.getPreviewSite();
            deferred.resolve();
        });

        return deferred.promise;
    }

    /**
     * Adds a button of the stage
     * @returns {Q.promise}
     */
    function prepareStage() {

        return Q.resolve()
            // add button component
            .then(addButtonComponent)

            // set button position
            .then(setComponentPosition)

            // open animation dialog
            .then(automation.controllers.Animations.openAnimationDialog)

            // cache dialog logic
            .then(function(dialogLogic) {
                animationDialog = dialogLogic;
            });
    }

    /**
     * Our tests plays the animation in both preview/editor
     * and checks
     * @returns {Q.promise}
     */
    function testAnimations() {
        return Q.resolve()
            // save animation dialog
            .then(saveAnimationDialog)

            // change to preview
            .then(function() {
                automation.controllers.States.changeToPreviewSync();
            })

            // waits until preview site is ready
            .then(function() {
                return waitForPreviewSite()
            })

            // play animations in viewer
            .then(playAndCheckAnimationsInViewer)

            // change to edit mode
            .then(function() {
                automation.controllers.States.changeToEditModeSync();
            })

            // spy on executeCommand
            .then(function() {
                spyOn(W.Preview.getPreviewManagers().Commands, 'executeCommand');
            })

            // check if animations are being played in viewer
            .then(checkIfNoComponentsPlayedOnViewer);
    }

    // ExpandIn

    it('Should open animation dialog, set ExpandIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'ExpandIn'))
                .then(testAnimations);
        });
    });

    // FadeIn

    it('Should open animation dialog, set FadeIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FadeIn'))
                .then(testAnimations);
        });
    });

    // SpinIn

    it('Should open animation dialog, set SpinIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'SpinIn'))
                .then(testAnimations);
        });
    });

    // FloatIn

    it('Should open animation dialog, set FloatIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FloatIn'))
                .then(testAnimations);
        });
    });

    // FlyIn

    it('Should open animation dialog, set FlyIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FlyIn'))
                .then(testAnimations);
        });
    });

    // TurnIn

    it('Should open animation dialog, set TurnIn animation and play it in preview', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'TurnIn'))
                .then(testAnimations);
        });
    });
});