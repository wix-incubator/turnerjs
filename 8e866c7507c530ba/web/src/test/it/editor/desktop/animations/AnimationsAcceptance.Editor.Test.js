describe("Add 6 components on stage, each with a different animation, test in editor", function () {

    /**
     Cached local variables
     */
    var selectedComp,
        animationDialog,
        compPosition = 0,
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
     * Play animations in the editor using the 'animationDialog._previewAnimation()' trigger and checks them
     * @returns {Q.promise}
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
        return automation.controllers.Animations.waitForAnimationStart(function(args) {
            return args && args.tweens && args.tweens[0].target.id === selectedComp.$view.id;
        }, true);
    }

    /**
     * Save the animation dialog ( its like clicking the 'OK' button )
     */
    function saveAnimationDialog() {
        animationDialog._dialogWindow.endDialog();
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
            // play animations in editor
            .then(playAndCheckAnimationsInEditor)
            // save animation dialog
            .then(saveAnimationDialog);
    }

    // ExpandIn

    it('Should open animation dialog, set ExpandIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'ExpandIn'))
                .then(testAnimations);
        });
    });
    // FadeIn

    it('Should open animation dialog, set FadeIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FadeIn'))
                .then(testAnimations);
        });
    });

    // SpinIn

    it('Should open animation dialog, set SpinIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'SpinIn'))
                .then(testAnimations);
        });
    });

    // FloatIn

    it('Should open animation dialog, set FloatIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FloatIn'))
                .then(testAnimations);
        });
    });

    // FlyIn

    it('Should open animation dialog, set FlyIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'FlyIn'))
                .then(testAnimations);
        });
    });

    // TurnIn

    it('Should open animation dialog, set TurnIn animation and play it in editor', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(setComponentAnimation.bind(this, 'TurnIn'))
                .then(testAnimations);
        });
    });
});