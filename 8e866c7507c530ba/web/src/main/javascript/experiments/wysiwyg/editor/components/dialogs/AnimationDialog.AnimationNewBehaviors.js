define.experiment.component('wysiwyg.editor.components.dialogs.AnimationDialog.AnimationNewBehaviors', function(compDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = compDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.binds(strategy.merge(['_onPreviewStart', '_updateProgressBar', '_onPreviewComplete']));

    def.resources(strategy.merge(['W.Data']));

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
            this._animationsMap = this.resources.W.Data.getDataByQuery('#ANIMATION_DIALOG_MAP');

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
        /**
         * Build and return a data item in a structure ThumbsGallery can understand
         * @returns {{type: string, items: Array}}
         * @private
         */
        _getAnimationsGalleryData: function() {
            var data = {type: 'list', items: []};
            var map = this._animationsMap.get('items');
            var compTypes = this._compTypes;
            var groups = [];
            var animations = [];
            var definition, animationName, group, name, index;

            for (index = 0; index < compTypes.length; index++) {
                name = compTypes[index];
                if (map.components[name]) {
                    groups = groups.length ? _.intersection(groups, map.components[name]) : map.components[name];
                }
                else {
                    groups = map.defaultGroups;
                    break;
                }
            }

            for (index = 0; index < groups.length; index++) {
                group = groups[index];
                animations = animations.concat(map.groups[group]);
            }

            for (index = 0; index < animations.length; index++) {
                animationName = animations[index];
                definition = this._animations.getAnimationDefinition(animationName);

                if (!definition || !definition.editorPart) {
                    continue;
                }

                data.items.push({
                    iconUrl: definition.editorPart.iconUrl,
                    label: this._translate(definition.editorPart.displayName),
                    value: animationName
                });
            }

            return data;
        },

        /**
         * A mediator function to build AutoPanel controls, translates the passed 'control' object to the corresponding AutoPanel function signature
         * @param {Object} control
         * @param {wysiwyg.editor.components.panels.base.AutoPanel} panel
         * @param {String} fieldToBind
         * @returns {wysiwyg.editor.components.panels.base.InputFieldProxy}
         */
        _addControl: function(control, panel, fieldToBind) {
            var leftLabel, rightLabel, field;
            if (control.label) {
                control.label = this._translate(control.label, control.label);
            }
            switch (control.type) {
                case 'Slider':
                    field = panel.addSliderField(control.label, control.min, control.max, control.step, control.hideInput, true, false, control.tooltipId, control.units).bindToField(fieldToBind);
                    break;
                case 'SliderWithLabels':
                    leftLabel = control.leftLabel && this._translate(control.leftLabel);
                    rightLabel = control.rightLabel && this._translate(control.rightLabel);
                    field = panel.addSliderFieldWithLabels(control.label, control.min, control.max, control.step, control.hideInput, true, false, control.tooltipId, control.units, leftLabel, rightLabel).bindToField(fieldToBind);
                    break;
                case 'ComboBox':
                    if (!control.listTranslated) {
                        for (var item = 0; item < control.list.length; item++) {
                            control.list[item].label = this._translate(control.list[item].label);
                        }
                        control.listTranslated = true;
                    }
                    field = panel.addComboBoxField(control.label, control.list, null, control.size, control.tooltipId).bindToField(fieldToBind);
                    break;
                case 'CheckBox':
                    field = panel.addCheckBoxField(control.label).bindToField(fieldToBind);
            }

            return field;
        },

        /**
         * Preview animation on component
         * @param {Object} [overrides] animation params to override the ones loaded from the dialog data (for quick preview)
         * @private
         */
        _previewAnimation: function(overrides, eventReporting) {
            var data = this._data.getData();
            var element, callbacks;
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

            callbacks = {
                onStart: this._onPreviewStart,
                onUpdate: this._updateProgressBar,
                onComplete: this._onPreviewComplete,
                onInterrupt: this._onPreviewComplete
            };

            this._previewSequence = this._actionsManager.getAnimationClass().sequence(animations, {autoClear: true, callbacks: callbacks});

            if (eventReporting) {
                this._reportEvent(wixEvents.ANIMATIONS_GALLERY_QUICK_PREVIEW_BUTTON);
            }
        },

        _onPreviewComplete: function() {
            this._releaseMouseEventOnPreview();
            this.setTimeout(function() {
                if (this._previewSequence && this._previewSequence.paused()) {
                    this._previewProgress.setValue(0);
                }
            }.bind(this), 150);
        },

        _onPreviewStart: function(params) {
            this._catchMouseEventOnPreview(params);
        },

        _catchMouseEventOnPreview: function() {
            $(document.body).addEvent('click', this._clearPreviewTween);
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
        _releaseMouseEventOnPreview: function() {
            $(document.body).removeEvent('click', this._clearPreviewTween);
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
            }
            this._previewProgress.setValue(0);

        },

        _updateProgressBar: function() {
            if (!this._previewSequence){
                return;
            }
            var progress = Math.floor(this._previewSequence.progress() * 100);
            progress = (progress > 98) ? 100 : progress;
            this._previewProgress.setValue(progress);
        },

        _onDialogOpened: function() {

            this.resources.W.Commands.registerCommandAndListener('AnimationDialog.RemoveAnimation', this, this._removeAnimation);
            this.resources.W.Commands.registerCommandAndListener('AnimationDialog.Preview', this, function() {
                this._previewAnimation(null, true);
            });

            this._reportEvent(wixEvents.ANIMATIONS_DIALOG_OPENED);
        }
    });

});
