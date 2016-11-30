define.component('wysiwyg.editor.components.dialogs.AnimationDialog', function(compDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = compDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.utilize(['wysiwyg.common.behaviors.Animations']);

    def.resources(['W.Editor', 'W.Preview', 'W.Commands', 'W.Resources']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.binds(['_onDialogOpened', '_onDialogClosed', '_animationSelected', '_clearPreviewTween', '_quickPreviewAnimation', '_quickPreviewOnHover', '_previewOnClick']);

    def.statics({
        QUICK_PREVIEW_DELAY: 350,
        MULTIPLE_BEHAVIORS: 'multiple'
    });

    def.fields({
        /** Caching for values for UX consistency */
        _dataFieldsCache: {},
        _persistentDataFields: ['playOnce'],

        /** Placeholders for inputGroupFields */
        _animationsGallery: null,
        _generalControlsGroup: null,
        _animationControlsGroup: null,
        _animateOnceControlsGroup: null,
        _animateOnceCheckBox: null,

        /** Actions */
        _dialogAction: Constants.Actions.SCREEN_IN,

        _screenInAction: Constants.Actions.SCREEN_IN,
        _pageInAction: Constants.Actions.PAGE_IN,
        /** For backwards compatibility with PageIn, keep notes on which action was set on each component */
        _componentActions: {},
        _previewProgress: null

    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};

            var sourceComp = this.resources.W.Editor.getEditedComponent();
            var sourceComps = (sourceComp.isMultiSelect) ? this._getComponentsWithAnimationEnabled(sourceComp.getSelectedComps()) : [sourceComp];
            //Dialog Init
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosed);
            this.resources.W.Commands.registerCommand('WEditorCommands.AnimationUpdated', true);

            //Comp init
            this._pageId = sourceComp.$view.$pageId;
            this._sourceIds = _.map(sourceComps, function(comp) {
                return comp.getComponentId();
            });
            this._compTypes = _.map(sourceComps, function(comp) {
                return comp.$className;
            });

            this._originalBehavior = null;
            //Actions Init
            this._actionsManager = this.resources.W.Preview.getPreviewManagers().Actions;
            this._animations = new this.imports.Animations();
            this._previewAnimations = this._actionsManager.getAnimationClass();
            this._previewSequence = null;

            this._setDataFromComponentsBehaviors();
        },

        _createFields: function() {

            this._buildAnimationGallery();

            this.addLabel(this._translate('ANIMATION_SELECTED'));

            this._buildControlGroups();
        },

        /**
         * filter out components with animation turned off.
         * @param {Array} sourceComponents
         * @returns {Array}
         * @private
         */
        _getComponentsWithAnimationEnabled: function(sourceComponents) {
            return _.filter(sourceComponents, function(comp) {
                var componentCommands = this.resources.W.Editor.getComponentMetaData(comp) || {};
                return componentCommands.general && componentCommands.general.animation !== false;
            }, this);
        },

        /**
         * Check if all passed behaviors (in case of multiselect) are identical
         * Has several cases:
         * 1. If all behaviors are identical - return the behavior as saved
         * 2. If behavior names are identical but has different values, return default for this behavior
         * 3. If at least one behavior is different return 'MULTIPLE_BEHAVIORS'
         * @param {Array<String>} sourceIds
         * @returns {Object|null}
         * @private
         */
        _combineBehaviorsForComponents: function(sourceIds) {
            var compBehavior = null;
            var behaviors = [];
            var values = [];
            var isSameBehavior;
            var isSameValue;
            var defaultBehavior = {name: '', duration: 1, delay: 0};
            var multiBehavior = {name: this.MULTIPLE_BEHAVIORS};

            // Build comparison lists
            _.forEach(sourceIds, function(id) {
                compBehavior = this._getBehaviorsForComponent(id)[0];
                behaviors.push(compBehavior && compBehavior.name);
                values.push(compBehavior && _.omit(compBehavior, ['sourceId', 'targetId', 'pageId']));
            }, this);

            // Test if after reducing the lists we have not more than one field
            isSameBehavior = _.uniq(behaviors).length === 1;
            isSameValue = isSameBehavior && _.every(values, function(value, index, collection) {
                return _.isEqual(value, collection[0]);
            });

            //1. If all behaviors are identical - return the behavior as saved
            if (isSameBehavior && isSameValue) {
                compBehavior = values[0] || defaultBehavior;
            }
            //2. If behavior names are identical but has different values, return default for this behavior
            else if (isSameBehavior) {
                compBehavior = compBehavior || {name: compBehavior.name};
            }
            //3. If at least one behavior is different return 'MULTIPLE_BEHAVIORS'
            else {
                compBehavior = multiBehavior;
            }

            return compBehavior;
        },

        /**
         * Return the component behaviors, first try getting screen in action, if no behaviors found then try page load action.
         * Side effect: The function also sets the this._componentActions map with the actions for the selected components
         * @param {String} sourceId Id of the component to get behaviors from
         * @returns {Array}
         * @private
         */
        _getBehaviorsForComponent: function(sourceId) {

            var behaviors = [];
            var action = this._dialogAction;

            var screenInBehaviors = this._actionsManager.getBehaviorsForComponentAction(sourceId, this._screenInAction);
            var pageInBehaviors = this._actionsManager.getBehaviorsForComponentAction(sourceId, this._pageInAction);

            if (screenInBehaviors) {
                behaviors = screenInBehaviors;
                action = this._screenInAction;
            }
            else if (pageInBehaviors) {
                behaviors = pageInBehaviors;
                action = this._pageInAction;
            }

            this._componentActions[sourceId] = action;
            return behaviors;
        },

        /**
         * Build the animations gallery and attach all relevant events
         * @private
         */
        _buildAnimationGallery: function() {
            var behaviorName = this._data.get('name');
            var animationRawData = this._getAnimationsGalleryData();
            var animationsDataItem = this.resources.W.Data.createDataItem(animationRawData);
            var selectedIndex = this._getIndexOfBehaviorInBehaviorList(animationRawData.items, behaviorName);
            var previewOnClickDebounced = _.debounce(this._previewOnClick, 100, true);

            this.addSelectionListInputFieldWithDataProvider(this._translate('ANIMATION_SELECT_ANIMATION'), animationsDataItem,
                {
                    type: 'wysiwyg.editor.components.ThumbGallery',
                    skin: 'wysiwyg.editor.skins.ThumbGallerySkin',
                    numToShow: 6,
                    selectedIndex: selectedIndex
                },
                {
                    type: 'wysiwyg.editor.components.AnimationGalleryItem',
                    skin: 'wysiwyg.editor.skins.AnimationGalleryItemSkin',
                    numRepeatersInLine: 3

                }).runWhenReady(function(logic) {
                    this._animationsGallery = logic;
                }.bind(this));

            this._animationsGallery.addEvent('inputChanged', this._animationSelected);
            this._animationsGallery.addEvent('updateSelection', previewOnClickDebounced);
            this._animationsGallery.addEvent('itemOver', this._quickPreviewOnHover);
            this._animationsGallery.addEvent('itemOut', this._clearPreviewTween);
        },

        /**
         * Build the outer group that holds all control states (animation, empty, multiple)
         * @private
         */
        _buildControlGroups: function() {
            this.addInputGroupField(function(panel) {

                this.addInputGroupField(function(panel) {
                }, 'skinless')
                    .runWhenReady(function(logic) {
                        this._generalControlsGroup = logic;
                    }.bind(panel));

                this.addInputGroupField(function() {
                }, 'skinless')
                    .runWhenReady(function(logic) {
                        this._animationControlsGroup = logic;
                    }.bind(panel));

                this.addInputGroupField(function(panel) {
                }, 'skinless')
                    .runWhenReady(function(logic) {
                        this._animateOnceControlsGroup = logic;
                    }.bind(panel));

            }).runWhenReady(function(logic) {
                this._buildGeneralControls();
                this._buildAnimateOnceControls();

                var behaviorName = this._data.get('name');
                this._animationsGallery.setValue({value: behaviorName});
            }.bind(this));
        },

        /**
         * Build the customization controls for the animation
         * @param {String} behaviorName
         * @private
         */
        _createFieldsFromAnimationData: function(behaviorName) {
            var animation;

            if (behaviorName) {
                animation = this._animations.getAnimationDefinition(behaviorName);
            }

            if (!behaviorName || !animation || !animation.editorPart) {
                this._updateDataItemFromAnimation(null);
                this._buildEmptyAnimationGroup();
                this._animationsGallery.clearSelection();
                this._generalControlsGroup.collapse();
                this._animateOnceControlsGroup.collapse();
            }
            else if (behaviorName === this.MULTIPLE_BEHAVIORS) {
                this._buildMultipleAnimationsGroup();
                this._animationsGallery.clearSelection();
                this._generalControlsGroup.collapse();
                this._animateOnceControlsGroup.collapse();
            }
            else {
                this._updateDataItemFromAnimation(behaviorName, animation.editorPart);
                this._updateGeneralControls(animation.editorPart);
                this._updateAnimateOnceControls();
                this._buildAnimationSpecificControls(animation.editorPart);
            }
            this.trigger('innerDialogResize');
        },

        /**
         * Build the "no animation" message
         * @private
         */
        _buildEmptyAnimationGroup: function() {
            var panel = this._animationControlsGroup;

            panel.disposeFields();

            panel.addBreakLine('10px');
            panel.addLabel(this._translate('ANIMATION_NO_ANIMATION_SELECTED'), {'text-align': 'center'}, null, 'animation/icon-animation-empty.png', {x: 0, y: 0}, {width: 46, height: 42}, null, {'color': '#888', 'font-size': '14px', 'vertical-align': 'middle', 'margin-bottom': 0});
            panel.addBreakLine('10px');
        },

        /**
         * Build the "multiple animations" message
         * @private
         */
        _buildMultipleAnimationsGroup: function() {
            var panel = this._animationControlsGroup;

            panel.disposeFields();

            panel.addBreakLine('10px');
            panel.addLabel(this._translate('ANIMATION_MULTIPLE_ANIMATIONS_SELECTED'), {'text-align': 'center'}, null, 'animation/icon-animation-multi.png', {x: 0, y: 0}, {width: 46, height: 42}, null, {'color': '#888', 'font-size': '14px', 'vertical-align': 'middle', 'margin-bottom': 0});
            panel.addBreakLine('10px');
        },

        /**
         * Build the icon, title, delete button and preview button that appears in all animations
         * @param {Object} editorPart
         * @private
         */
        _buildGeneralControls: function() {
            var panel = this._generalControlsGroup;

            panel.addInputGroupField(function(mainPanel) {
                this.setNumberOfItemsPerLine(3, 2, 'middle');
                this.addLabel(' ', {'margin-left': '-10px', 'vertical-align': 'middle', 'float': 'left'}, null, 'animation/icon-animation-default.png', {x: 0, y: 0}, {width: 70, height: 40}, null, {'margin-left': '-15px', 'color': '#404040', 'font-size': '14px'})
                    .runWhenReady(function(logic) {
                        mainPanel._animationLabel = logic;
                    }.bind(this));

                this.addInputGroupField(function() {
                    this.addBreakLine('10px');
                    this.setNumberOfItemsPerLine(3, 2, 'middle');
                    this.addButtonField('', '', false, {iconSrc: 'buttons/imagemanager_delete.png', iconSize: {width: 12, height: 14}, spriteOffset: {x: 0, y: 0}}, 'imageManagerDeleteBtn', null, 'Animation_Remove_ttid', 'AnimationDialog.RemoveAnimation');
                    this.addButtonField('', '', false, {iconSrc: 'buttons/imagemanager_moveright.png', iconSize: {width: 12, height: 14}, spriteOffset: {x: 0, y: 0}}, 'imageManager', null, 'Animation_Preview_ttid', 'AnimationDialog.Preview');
                    this.$view.setStyle('float', 'right');
                }, 'skinless');
            }, 'skinless');

            panel.addBreakLine('10px', '1px solid #eee', 0);

            panel.addProgressBar('progress', 1, '#8ccded', null, 0)
                .runWhenReady(function(logic) {
                    logic.$view.setStyles({
                        'position': 'relative',
                        'top': '-1px'
                    });
                    this._previewProgress = logic;
                }.bind(this));

            panel.addBreakLine(0, null, '5px');
        },

        /**
         * Build the "Animate Once" checkbox.
         * NOTE: if the component is on mastepage, set playOnce to be always true and disabled (force play only once),
         * but DON'T update the data on the component
         * @private
         */
        _buildAnimateOnceControls: function() {
            var panel = this._animateOnceControlsGroup;

            panel.addBreakLine('10px', '1px solid #eee', '15px');

            this._animateOnceControl = null;

        },

        /**
         * Build the "Animate Once" checkbox.
         * NOTE: if the component is on mastepage, set playOnce to be always true and disabled (force play only once),
         * but DON'T update the data on the component
         * @private
         */
        _updateAnimateOnceControls: function() {
            var panel = this._animateOnceControlsGroup;
            var pageId = this._pageId;

            if(this._animateOnceControl){
                this._animateOnceControl.dispose();
            }
            panel.uncollapse();

            var control = panel.addCheckBoxField(this._translate('ANIMATION_CONTROL_ANIMATE_ONCE'), 'Animation_Animate_Once_ttid')
                .omitEnableDisableUpdate();

            if (pageId === 'master') {
                control.setValue(true);
                _.defer(control.disable.bind(control));
            }
            else {
                control.bindToField('playOnce');
            }

            this._animateOnceControl = control;
        },

        /**
         * Update the general controls group
         * @param {Object} editorPart the animation editor part
         * @private
         */
        _updateGeneralControls: function(editorPart) {
            var panel = this._generalControlsGroup;

            panel.uncollapse();

            this._animationLabel.setValue(this._translate(editorPart.displayName));
            this._animationLabel.setParameters({
                spriteSrc: editorPart.iconUrl,
                spriteOffset: {x: 0, y: 0},
                spriteSize: {width: 70, height: 40},
                labelStyles: {'margin-left': '-15px'}
            }, true);

        },

        /**
         * build or update the animation specific controls
         * @param {Object} editorPart
         * @private
         */
        _buildAnimationSpecificControls: function(editorPart) {
            var panel = this._animationControlsGroup;
            var controls = editorPart.panelControls;

            panel.disposeFields();

            for (var type in controls) {
                panel.addBreakLine('7px');
                this._addControl(controls[type], panel, type);
            }
        },

        /**
         * Update the dialog data item
         * @param {String|null} behaviorName
         * @param {Object} [editorPart] optional if behaviorName is null
         * @private
         */
        _updateDataItemFromAnimation: function(behaviorName, editorPart) {
            var controls = null;
            var currentRawData = this._data.getData();
            delete currentRawData.metaData;

            this._updateDataFieldsCache(currentRawData);

            //Clear all data non persistent values
            for (var field in currentRawData) {
                if (this._persistentDataFields.contains(field)) {
                    continue;
                }
                this._data.set(field, null);
            }

            //Set new behavior name (even if empty)
            this._data.set('name', behaviorName);

            // create new controls values to data item if not empty
            if (behaviorName && editorPart) {
                controls = editorPart.panelControls;
                for (var type in controls) {
                    var cachedValue = this._dataFieldsCache[behaviorName] && this._dataFieldsCache[behaviorName][type];

                    this._data.set(type, (typeof cachedValue !== 'undefined') ? cachedValue : controls[type].value);
                }
            }

        },

        /**
         * save current values to dialog values cache
         * @param {Object} rawData
         * @private
         */
        _updateDataFieldsCache: function(rawData) {
            var behaviorName = rawData.name;
            if (!behaviorName) {
                return;
            }
            if (!this._dataFieldsCache[behaviorName]) {
                this._dataFieldsCache[behaviorName] = {};
            }

            _.extend(this._dataFieldsCache[behaviorName], rawData);

            _.forEach(this._persistentDataFields, function(field) {
                delete this._dataFieldsCache[behaviorName][field];
            }, this);

        },

        /**
         * Clear animation from component
         * @private
         */
        _removeAnimation: function() {
            this._animationSelected({value: {value: ''}});
            this._reportEvent(wixEvents.ANIMATIONS_GALLERY_ANIMATION_DELETED);
        },

        /**
         * Handler to invoke when an animation in the animations gallery is selected or when animations are cleared
         * @param {Object} event
         * @private
         */
        _animationSelected: function(event) {
            var animationName = event.value.value;
            this._createFieldsFromAnimationData(animationName);
        },

        /**
         * Preview animation on component
         * @param {Object} [overrides] animation params to override the ones loaded from the dialog data (for quick preview)
         * @private
         */
        _previewAnimation: function(overrides, eventReporting, fireUpdateCommand) {
            var data = this._data.getData();
            var element;
            delete data.metaData;
            data = this._expandFlattenObject(data);
            data.params = data.params || {};
            data.params.autoClear = true;

            if (overrides) {
                _.extend(data, overrides);
            }

            this._clearPreviewTween();

            var animations = [];
            for (var i = 0; i < this._sourceIds.length; i++) {
                element = this.resources.W.Preview.getCompByID(this._sourceIds[i]);
                animations.push(this._actionsManager.getAnimationClass().applyTween(data.name, element, data.duration, 0, data.params));
            }

            this._previewSequence = this._actionsManager.getAnimationClass().sequence(animations, {autoClear: true, fireUpdateCommand: fireUpdateCommand});

            if (eventReporting) {
                this._reportEvent(wixEvents.ANIMATIONS_GALLERY_QUICK_PREVIEW_BUTTON);
            }
        },

        /**
         * Preview animation on gallery item click
         * @param {Object} [event]
         * @private
         */
        _previewOnClick: function(event) {
            this._previewAnimation(null, null, true);
            this._reportEvent(wixEvents.ANIMATIONS_GALLERY_ANIMATION_SELECTED);
        },

        _onPreviewComplete: function(params) {
            if (params.timeline === this._previewSequence) {
                this._releaseMouseEventOnPreview(params);
                this.setTimeout(function() {
                    if (this._previewSequence && this._previewSequence.paused()) {
                        this._previewProgress.setValue(0);
                    }
                }.bind(this), 150);
            }
        },

        _onPreviewStart: function(params) {
            if (params.timeline === this._previewSequence) {
                this._catchMouseEventOnPreview(params);
            }
        },

        /**
         * Quick preview animation on gallery item hover
         * @param {Object} event
         * @private
         */
        _quickPreviewOnHover: function(event) {
            var behaviorName = this._data.get('name');

            if (behaviorName === event.data.value) {
                return;
            }

            this._quickPreviewTimer = _.delay(function() {
                this._quickPreviewAnimation(event.data.value);
            }.bind(this), this.QUICK_PREVIEW_DELAY, event);
        },

        /**
         * Preview animation overriding original with editorPart.previewParams
         * @param {String} behaviorName
         * @private
         */
        _quickPreviewAnimation: function(behaviorName) {
            var editorPart = this._animations.getAnimationDefinition(behaviorName).editorPart;
            var previewParams = _.cloneDeep(editorPart.previewParams);
            previewParams.name = behaviorName;
            this._previewAnimation(previewParams, false, true);
        },

        _updateProgressBar: function(params) {
            if (!params.timeline) {
                return;
            }
            var progress = Math.floor(params.timeline.progress() * 100);
            progress = (progress > 98) ? 100 : progress;
            this._previewProgress.setValue(progress);
        },


        /**
         * Clear animation residues from component after preview
         * @private
         */
        _clearPreviewTween: function() {
            if (this._quickPreviewTimer) {
                clearTimeout(this._quickPreviewTimer);
            }
            if (this._previewSequence) {
                this._previewAnimations.clear(this._previewSequence);
                this._previewSequence = null;
                this._releaseMouseEventOnPreview();
            }
            this._previewProgress.setValue(0);
        },

        /**
         * Helper function for stupid ThumbGallery to select an animation on load
         * @param {Array} items
         * @param {String} behaviorName
         * @returns {number} -1 if no animation >=0 to select the right animation in the gallery
         * @private
         */
        _getIndexOfBehaviorInBehaviorList: function(items, behaviorName) {
            for (var i = 0; i < items.length; i++) {
                if (items[i] && items[i].value === behaviorName) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * Build a data item from component behavior structure data
         * Since the animation data structure has some levels we are flattening the data to a one level object
         * @private
         */
        _setDataFromComponentsBehaviors: function() {
            var behavior = this._combineBehaviorsForComponents(this._sourceIds);
            this._originalBehavior = behavior;
            var rawDataItem = this._flattenObject(behavior);
            var dataItem = this.resources.W.Data.createDataItem(rawDataItem);
            this.setDataItem(dataItem);

        },

        /**
         * Build and return a data item in a structure ThumbsGallery can understand
         * @returns {{type: string, items: Array}}
         * @private
         */
        _getAnimationsGalleryData: function() {
            var data = {type: 'list', items: []};
            var animations = this._animations.getAllAnimationDefinitions();
            for (var name in animations) {
                var item = {};
                var definition = animations[name];

                if (!definition || !definition.editorPart) {
                    continue;
                }

                item.iconUrl = definition.editorPart.iconUrl;
                item.label = this._translate(definition.editorPart.displayName);
                item.value = name;

                data.items.push(item);
            }
            _.sortBy(data.items, function(item) {
                return item.label;
            });

            return data;
        },

        /**
         * Get the 'human friendly' name of a component
         * @returns {String}
         * @private
         */
        _getCompName: function() {
            var editedComponent = this.resources.W.Editor.getEditedComponent();
            return this.resources.W.Editor.getComponentFriendlyName(editedComponent.$className, editedComponent.getDataItem());
        },

        _catchMouseEventOnPreview: function(params) {
            if (!params || params.timeline === this._previewSequence) {
                $(document.body).addEvent('click', this._clearPreviewTween);
            }
        },

        /**
         * Stop listening to mouse clicks on editor body element
         *
         * @param {Object} [params]
         * @param {String} [params.type]
         * @param {Timeline} [params.timeline]
         * @param {Array.<Tween>} [params.tweens]
         * @private
         */
        _releaseMouseEventOnPreview: function(params) {
            if (!params || params.timeline === this._previewSequence) {
                $(document.body).removeEvent('click', this._clearPreviewTween);
            }
        },

        _onDialogOpened: function() {

            this.resources.W.Commands.registerCommandAndListener('AnimationDialog.RemoveAnimation', this, this._removeAnimation);
            this.resources.W.Commands.registerCommandAndListener('AnimationDialog.Preview', this, function() {
                this._previewAnimation(null, true, true);
            });

            this.resources.W.Preview.getPreviewManagers().Commands.registerCommandAndListener('TweenEngine.AnimationStart', this, this._onPreviewStart);
            this.resources.W.Preview.getPreviewManagers().Commands.registerCommandAndListener('TweenEngine.AnimationUpdate', this, this._updateProgressBar);
            this.resources.W.Preview.getPreviewManagers().Commands.registerCommandAndListener('TweenEngine.AnimationComplete', this, this._onPreviewComplete);

            this._reportEvent(wixEvents.ANIMATIONS_DIALOG_OPENED);
        },

        _onDialogClosed: function(event) {

            if (event.result !== 'CANCEL') {
                this._updateComponentAnimation();
            }

            this.resources.W.Commands.unregisterListener(this);
            //This also calls _releaseMouseEventOnPreview
            this._clearPreviewTween();
        },

        /**
         * Handler that invokes on "ok", saves the animation parameters (or clears them) to the component.
         * NOTE: This function assumes that targetId === sourceId and that we are assigning one behavior per component
         * @private
         */
        _updateComponentAnimation: function() {

            var oldBehavior = this._originalBehavior || {};
            var newBehavior = this._getParsedDataForSave();

            if (newBehavior.name === this.MULTIPLE_BEHAVIORS) {
                return;
            }

            if (_.isEqual(newBehavior, oldBehavior)) {
                return;
            }

            this._saveBehaviorToComponents(newBehavior);
            this._reportEvent(wixEvents.ANIMATIONS_DIALOG_SAVED);
            this.resources.W.Commands.executeCommand('WEditorCommands.AnimationUpdated', {sourceIds: this._sourceIds, name: newBehavior.name});
        },

        /**
         * Parse dialog data object to a form friendly for saving behaviors
         * @returns {Object}
         * @private
         */
        _getParsedDataForSave: function() {
            var data = this._data.getData();

            delete data.metaData;
            for (var field in data) {
                if (data[field] === null) {
                    delete data[field];
                }
            }
            data = this._expandFlattenObject(data);

            return data;
        },

        /**
         * Loop over all edited components and save the new behavior
         * Also notify undo on save.
         * @param {Object} data the new behaviors to save
         * @private
         */
        _saveBehaviorToComponents: function(data) {
            var sourceId,
                targetId,
                behaviorFromData,
                newBehaviors = null,
                oldBehaviors = null;

            //UNDO LISTENER STARTS HERE
            this.injects().UndoRedoManager.startTransaction();
            for (var i = 0; i < this._sourceIds.length; i++) {
                sourceId = this._sourceIds[i];

                // In our Action source and target are the same
                targetId = sourceId;

                oldBehaviors = this._actionsManager.getBehaviorsForComponentAction(sourceId, this._componentActions[sourceId]);
                if (data.name) {
                    behaviorFromData = _.cloneDeep(data);
                    behaviorFromData.targetId = targetId;
                    behaviorFromData.sourceId = sourceId;
                    behaviorFromData.pageId = this._pageId;
                    newBehaviors = [behaviorFromData];
                }

                this._reportBehaviorsChangeToURM(oldBehaviors, newBehaviors, sourceId);
                this._actionsManager.setBehaviorsForComponentAction(sourceId, this._componentActions[sourceId], null);
                this._actionsManager.setBehaviorsForComponentAction(sourceId, this._dialogAction, newBehaviors);
            }
            this.injects().UndoRedoManager.endTransaction();
            //UNDO LISTENER ENDS HERE
        },

        /**
         * Report a single component behaviors change to urm
         * @param {Object} oldBehaviors
         * @param {Object} newBehaviors
         * @param {String} sourceId
         * @private
         */
        _reportBehaviorsChangeToURM: function(oldBehaviors, newBehaviors, sourceId) {
            var oldActions = {};
            var newActions = {};
            var originalAction = this._componentActions[sourceId];

            oldActions[originalAction] = oldBehaviors;
            newActions[this._dialogAction] = newBehaviors;

            var data = {
                data: {
                    changedComponentIds: [sourceId],
                    oldState: oldActions,
                    newState: newActions
                }
            };
            this.injects().Commands.executeCommand('WEditorCommands.ComponentBehaviorsChanged', data);
        },

        /**
         * A mediator function to build AutoPanel controls, translates the passed 'control' object to the corresponding AutoPanel function signature
         * @param {Object} control
         * @param {wysiwyg.editor.components.panels.base.AutoPanel} panel
         * @param {String} fieldToBind
         * @returns {wysiwyg.editor.components.panels.base.InputFieldProxy}
         */
        _addControl: function(control, panel, fieldToBind) {
            if (control.label) {
                control.label = this._translate(control.label, control.label);
            }
            switch (control.type) {
                case 'Slider':
                    return panel.addSliderField(control.label, control.min, control.max, control.step, false, true, false, control.tooltipId, control.units).bindToField(fieldToBind);

                case 'ComboBox':
                    if (!control.listTranslated) {
                        for (var item = 0; item < control.list.length; item++) {
                            control.list[item].label = this._translate(control.list[item].label);
                        }
                        control.listTranslated = true;
                    }
                    return panel.addComboBoxField(control.label, control.list, null, control.size, control.tooltipId).bindToField(fieldToBind);
            }
        },

        /**
         * Flatten a deep object
         * Original function: https://gist.github.com/penguinboy/762197
         * @todo move this to Utils
         * @param {Object} object an Object
         * @param {String=_} [delimiter]
         * @returns {Object}
         * @private
         */
        _flattenObject: function(object, delimiter) {
            var toReturn = {};
            delimiter = delimiter || '_';

            for (var key in object) {
                if (!object.hasOwnProperty(key)) {
                    continue;
                }

                if (typeof object[key] === 'object') {
                    var flatObject = this._flattenObject(object[key], delimiter);
                    for (var flatKey in flatObject) {
                        if (!flatObject.hasOwnProperty(flatKey)) {
                            continue;
                        }

                        toReturn[key + delimiter + flatKey] = flatObject[flatKey];
                    }
                }
                else {
                    toReturn[key] = object[key];
                }
            }
            return toReturn;
        },

        /**
         * Expand a flattened object
         * Original function: http://stackoverflow.com/a/7794127
         * @todo move this to Utils
         * @param {Object} flatObject
         * @param {String=_} [delimiter]
         * @returns {Object}
         * @private
         */
        _expandFlattenObject: function(flatObject, delimiter) {
            delimiter = delimiter || '_';

            var toReturn = {};
            var current;
            var parts, part;

            for (var flattenedKey in flatObject) {
                if (!flatObject.hasOwnProperty(flattenedKey)) {
                    continue;
                }

                current = toReturn;
                parts = flattenedKey.split(delimiter);
                var key = parts.pop();
                while (parts.length) {
                    part = parts.shift();
                    current[part] = current[part] || {};
                    current = current[part];
                }
                current[key] = flatObject[flattenedKey];
            }
            return toReturn;
        },

        /**
         * Wrapper for LOG.reportEvent ( BI event reporting )
         * @param {Object} wixEvents
         * @private
         */
        _reportEvent: function(event) {
            LOG.reportEvent(event, {c1: this._compTypes.toString(), c2: this._dialogAction + '|' + (this._data && this._data.get('name'))});
        }

    });

});
