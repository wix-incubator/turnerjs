define.Class('wysiwyg.editor.components.addviamediagallery.BaseStrategy', function (def) {
    def.resources(['W.Data']);

    def.fields({
        compClass: '',
        compType: '',
        options: null
    });

    def.methods({
        initialize: function () {
            if (typeof Constants.CommonMediaGalleryArgs === "function") {
                Constants.CommonMediaGalleryArgs = Constants.CommonMediaGalleryArgs();
            }
        },
        getMediaGalleryCommandArgs: function () {
            return Constants.CommonMediaGalleryArgs[this.compClass].multiple;
        },
        getDefaultPreset: function () {
            var COMPONENT_TYPES = this.resources.W.Data.getDataByQuery('#COMPONENT_TYPES'),
                compData = COMPONENT_TYPES.get('items')[this.compType].component;

            compData = typeof compData === "function" ? compData() : compData;

            return {
                compType: this.compType,
                compData: _.cloneDeep(compData)
            };
        },
        computeLayout: function (rawData) {
            var layout = {
                    width: rawData.width || 0,
                    height: rawData.height || 0
                },
                preset;

            preset = (this.getDefaultPreset().compData || {}).layout || {};

            if (layout.width < 1) {
                layout.width = preset.width || 200;
            }

            if (layout.height < 1) {
                layout.height = preset.height || 200;
            }

            return layout;
        },
        applyToPreset: function () {
            // virtual method
        }
    });
});
