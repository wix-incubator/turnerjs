define(['core', 'tpa/mixins/tpaPreviewEditorMixin'], function(core, tpaPreviewEditorMixin) {
	'use strict';

	var compRegistrar = core.compRegistrar;
	var mixins = core.compMixins;

    /**
     * @class components.TPAUnresponsive
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     */
    var tpaPreloader = {
        displayName: "TPAUnavailableMessageOverlay",
        mixins: [mixins.skinBasedComp, tpaPreviewEditorMixin],
        getInitialState: function() {
            return {
                showOverlay: true
            };
        },

        getSkinProperties: function() {

            var refData = {
                text: {
                    children: [this.props.compData.text]
                },
                dismissButton: {
                    onClick: this.props.compData.hideOverlayFunc
                },
                openHelp: this.openHelp
            };

            return refData;
        }
    };

	compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay", tpaPreloader);

});
