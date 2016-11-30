describe("Testing the animation gallery functionality", function () {

    /**
     Cached local variables
     */
    var selectedComp,
        animationDialog;

    /**
     * Adds a button component
     * @returns {Q.promise}
     */
    function addButtonComponent() {
        return automation.viewercomponents.ViewerComponent.addComponent('addButton');
    }

    /**
     * Close dialog
     */
    function closeDialog() {
        animationDialog._dialogWindow.endDialog();
    }

    /**
     * fires and event on the first gallery item
     * @param event
     */
    function triggerEventOnFirstGalleryItem(event) {
        animationDialog._animationsGallery._getComps()[0].fireEvent(event);
    }

    /**
     * Play animations in the editor using the 'animationDialog._previewAnimation()' trigger and checks them
     * @returns {Q.promise}
     */
    function playAndCheckAnimationsInEditor(triggerEvent) {
        var promise = checkIfComponentHasPlayedInEditor();
        triggerEventOnFirstGalleryItem(triggerEvent);
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
     * Adds a button of the stage
     * @returns {Q.promise}
     */
    function prepareStage() {

        return Q.resolve()
            // add button component
            .then(addButtonComponent)

            // cache the comp logic
            .then(function(comp) {
                selectedComp = comp;
            })

            // open animation logic
            .then(function() {
                return automation.controllers.Animations.openAnimationDialog();
            })

            // cache animation dialog
            .then(function(dialogLogic) {
                animationDialog = dialogLogic;
            });
    }

    it('Should open animation dialog, click on the first item and check if the animation has played ( editor )', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(playAndCheckAnimationsInEditor.bind(this, 'click'))
                .then(closeDialog);
        });
    });

    it('Should open animation dialog, hover (mouseover) on the first item and check if the animation has played ( editor )', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(prepareStage)
                .then(playAndCheckAnimationsInEditor.bind(this, 'mouseenter'))
                .then(closeDialog);
        });
    });


});
