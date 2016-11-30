/**
 * Created by Shaharz on 10/23/13.
 */
define.experiment.component('wysiwyg.editor.components.inputs.Slider.AnimationNewBehaviors', function(componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.binds(['_listenToInput', '_changeEventHandler']);

    def.methods({

        initialize: strategy.after(function(compId, viewNode, args) {
            this._leftLabel = args.leftLabel;
            this._rightLabel = args.rightLabel;
        }),

        _onAllSkinPartsReady: strategy.after(function(){
            var iconFullUrl, bgValue;
            this.parent();
            //Show / Hide input
            if (this._hideInput){
                this._skinParts.input.collapse();
                this._skinParts.sliderContainer.setStyle('margin-right', '4px');
            }
            this._skinParts.input.setValue(this._value);
            this._skinParts.input.setUnits(this._units);
            // Make room for the units (no way to do it through the skin...)
            if (this._units && !this._hideInput){
                this._skinParts.sliderContainer.setStyle('margin-right', '7em');
            }
            if (this._skinParts.leftIcon && this._leftIcon) {
                iconFullUrl = this._buildIconFullUrl(this._leftIcon);
                bgValue = this._buildBgValueString(iconFullUrl);
                this._skinParts.leftIcon.setStyle('background', bgValue);
            }
            if (this._skinParts.rightIcon && this._rightIcon) {
                iconFullUrl = this._buildIconFullUrl(this._rightIcon);
                bgValue = this._buildBgValueString(iconFullUrl);
                this._skinParts.rightIcon.setStyle('background', bgValue);
            }

            if (this._skinParts.leftLabel && this._leftLabel) {
                this._skinParts.leftLabel.set('text', this._leftLabel);
                this._skinParts.leftLabel.uncollapse();
            }
            if (this._skinParts.rightLabel && this._rightLabel) {
                 this._skinParts.rightLabel.set('text', this._rightLabel);
                this._skinParts.rightLabel.uncollapse();

            }
        })


    });

});
