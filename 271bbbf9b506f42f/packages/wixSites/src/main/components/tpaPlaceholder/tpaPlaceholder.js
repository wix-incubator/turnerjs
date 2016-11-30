define(['skins', 'react', 'core'], function(skinsPackage, React, core) {

    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    /**
     * @class components.TPAPlaceholder
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    var TPAPlaceholder = {
        displayName: "TPAPlaceholder",

        mixins: [mixins.skinBasedComp],

        getSkinProperties: function() {
            var data = this.props.compData;
            var style = this.props.style;
            var compProp = this.props.compProp;
            return {
                img: this.createChildComponent(
                    data,
                    'core.components.Image', 'img',
                    {
                        imageData: data,
                        containerWidth: style.width,
                        containerHeight: style.height,
                        displayMode: compProp.displayMode
                    }
                )
            };
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAPlaceholder", TPAPlaceholder);
    return TPAPlaceholder;
});
