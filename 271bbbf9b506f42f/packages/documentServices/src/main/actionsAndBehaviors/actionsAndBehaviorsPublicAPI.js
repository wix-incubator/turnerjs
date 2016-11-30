define(['documentServices/actionsAndBehaviors/actionsAndBehaviors'], function(actionsAndBehaviors){
    "use strict";
    return {
        methods: {
            behaviors: {
                /**
                 * Return the definition containing settings and parameters of a behavior
                 * @member documentServices.behaviors
                 * @param {String} behaviorName
                 * @returns {Object|null}
                 */
                getDefinition: actionsAndBehaviors.getBehaviorDefinition,
                /**
                 * Get names of behaviors.
                 * Filter by optional compType and/or actionName
                 * @member documentServices.behaviors
                 * @param {String} [compType]
                 * @param {String} [actionName]
                 * @returns {Array}
                 */
                getNames: actionsAndBehaviors.getBehaviorNames,
                /**
                 * Update an existing behaviors or add a new one (if no such behavior exists), for the actionSourceRef behaviors
                 * @member documentServices.behaviors  actionSourceRef, action, behaviorTargetRef, behavior
                 * @param {AbstractComponent} actionSourceRef - a reference to the element the action is triggered on
                 * @param {ActionObj} action - The object representing the action {type: '', name: ''}
                 * @param {AbstractComponent} behaviorTargetRef - a reference to the behavior target entity
                 * @param {BehaviorObj} behavior - The object representing the behavior that should be activated on the behaviorTargetRef, once the action is triggered
                 */
                update: {dataManipulation: actionsAndBehaviors.updateBehavior},
                /**
                 * Returns the behaviors saved on a component structure
                 * @member documentServices.behaviors
                 * @param {AbstractComponent} actionSourceRef - a reference to the element the behaviors are saved on
                 * @returns {Array<BehaviorObjr>}
                 */
                get: actionsAndBehaviors.getBehaviors,
                /**
                 * Removes all behaviors between source and target refs that match action and behavior type and name
                 *
                 * @member documentServices.behaviors
                 * @param {AbstractComponent} actionSourceRef - a reference to the element the action is triggered on
                 * @param {ActionObj} action - The object representing the action {type: '', name: ''}
                 * @param {AbstractComponent} behaviorTargetRef - a reference to the behavior target entity
                 * @param {BehaviorObj} behavior - The object representing the behavior {type: '', name: ''}
                 */
                remove: {dataManipulation: actionsAndBehaviors.removeBehavior}
            },
            actions: {
                /**
                 * Return the definition containing settings and parameters of an action
                 * @member documentServices.actions
                 * @param {String} actionName
                 * @returns {Object|null}
                 */
                getDefinition: actionsAndBehaviors.getActionDefinition,
                /**
                 * Trigger an action
                 * @member documentServices.actions
                 * @param {String} actionName
                 */
                executeAction: actionsAndBehaviors.executeAction,
                /**
                 * Names of available actions, sorted a-z
                 * @member documentServices.actions
                 * @returns {Array}
                 */
                getNames: actionsAndBehaviors.getActionNames,

                /**
                 * Executes all animations for this page as if the page has reloaded
                 */
                executeAnimationsInPage: actionsAndBehaviors.executeAnimationsInPage
            },
            components: {
                is: {
                    /**
                     * Test if a component type can be animated
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @param {String} [actionName]
                     * @returns {Boolean}
                     */
                    animatable: actionsAndBehaviors.isBehaviorable
                },
                behaviors: {
                    /**
                     * Set behaviors to a component structure, will override any previous behaviors
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @param {SavedBehavior} behavior
                     * @param {String} [actionName]
                     */
                    update: {dataManipulation: actionsAndBehaviors.setComponentBehavior},
                    /**
                     * Returns the behaviors saved on a component structure
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @returns {Array<SavedBehavior>|null}
                     */
                    get: actionsAndBehaviors.getComponentBehaviors,
                    /**
                     * Remove a single behavior from a component structure
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @param {String} [behaviorName] if not set will remove all behaviors of actionName
                     * @param {String} actionName
                     * @deprecated
                     */
                    remove: {dataManipulation: actionsAndBehaviors.removeComponentSingleBehavior},
                    /**
                     * Remove behaviors from a component structure
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     */
                    removeAll: {dataManipulation: actionsAndBehaviors.removeComponentBehaviors},
                    /**
                     * Preview an animation on a component
                     * @deprecated
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @param {{name:string, duration:number, delay:number, params:object}} animationDef
                     * @param {object} transformationsToRestore a list of animation params that represent values of the component style that should be restored after clearProps
                     * @returns {string} sequence id (to be used with stopPreview)
                     */
                    preview: actionsAndBehaviors.deprecatedPreviewAnimation,
                    /**
                     * Stop animation preview by sequence id returned by previewAnimation
                     * @deprecated
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @param {string} sequenceId
                     */
                    stopPreview: actionsAndBehaviors.deprecatedStopPreviewAnimation,
                    /**
                     * Preview an animation on a component
                     * @member documentServices.components.behaviors
                     * @param {AbstractComponent} componentReference
                     * @param {{name:string, duration:number, delay:number, params:object}} animationDef
                     * @returns {string} sequence id (to be used with stopPreview)
                     */
                    previewAnimation: actionsAndBehaviors.previewAnimation,
                    /**
                     * Preview a transition on 2 components
                     * @param {AbstractComponent} srcCompReference
                     * @param {AbstractComponent} targetCompReference
                     * @param {{name:string, duration:number, delay:number, params:object}} transitionDef
                     * @param {function} onComplete a callback to run at the end of the preview animation
                     * @returns {string} sequence id (to be used with stopPreview)
                     */
                    previewTransition: actionsAndBehaviors.previewTransition,
                    /**
                     * Stop animation preview by sequence id returned by previewAnimatio
                     * @member documentServices.components.behaviors
                     * @param {string} sequenceId
                     */
                    stopPreviewAnimation: actionsAndBehaviors.stopPreviewAnimation
                }
            },
            pages: {
                transitions: {
                    /**
                     * Set the pages transition
                     * @member documentServices.pages.transitions
                     * @param {String} transitionName
                     */
                    set: {dataManipulation:  actionsAndBehaviors.setPagesTransition},
                    /**
                     * Get the current pages transition
                     * @member documentServices.pages.transitions
                     * @returns {String}
                     */
                    get: actionsAndBehaviors.getPagesTransition,
                    /**
                     * Returns the names of *legacy* transitions sorted a-z
                     * @member documentServices.pages.transitions
                     * @todo: this will change when we will have transition per page
                     * @returns {String[]}
                     */
                    getNames: actionsAndBehaviors.getPageTransitionsNames
                }
            }
        }
    };
});
