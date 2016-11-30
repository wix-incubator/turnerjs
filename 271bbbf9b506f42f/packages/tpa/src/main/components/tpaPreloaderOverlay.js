define(['core'], function(core) {
	'use strict';

	var compRegistrar = core.compRegistrar;
	var mixins = core.compMixins;

    /**
     * @class components.TPAPreloader
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     */
    var tpaPreloader = {
        mixins: [mixins.skinBasedComp],
        getSkinProperties: function () {
            return {
                preloader: {
                    className: 'circle-preloader'
                }
            };
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAPreloaderOverlay", tpaPreloader);

});
