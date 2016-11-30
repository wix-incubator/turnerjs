define(["layout/util/layout"], function(/** layout.layout */ layout) {
    'use strict';

    function patchAnchor(id, patchers) {
        patchers.css(id, {width: '0px'});
    }

    layout.registerSAFEPatcher("wysiwyg.common.components.anchor.viewer.Anchor", patchAnchor);
});
