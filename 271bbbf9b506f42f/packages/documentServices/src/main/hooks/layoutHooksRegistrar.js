define(['documentServices/hooks/hooks',
    'documentServices/hooks/layoutHooks/wphoto',
    'documentServices/hooks/layoutHooks/wFacebookComment',
    'documentServices/hooks/layoutHooks/documentMedia',
    'documentServices/hooks/layoutHooks/verticalMenu',
    'documentServices/hooks/layoutHooks/boxSlideShow',
    'documentServices/hooks/layoutHooks/tinyMenu',
    'documentServices/hooks/layoutHooks/columns',
    'documentServices/hooks/layoutHooks/column',
    'documentServices/hooks/layoutHooks/verticalAnchorsMenu'
],
function (hooks, wphoto, wFacebookComment, documentMedia, verticalMenu, boxSlideShow, tinyMenu, columns, column, verticalAnchorsMenu) {
    'use strict';

    init();

    function init() {

        //before
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, wphoto, 'wysiwyg.viewer.components.WPhoto');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, documentMedia, 'wysiwyg.viewer.components.documentmedia.DocumentMedia');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, boxSlideShow, 'wysiwyg.viewer.components.BoxSlideShow');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, boxSlideShow, 'wysiwyg.viewer.components.StripContainerSlideShow');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, columns, 'wysiwyg.viewer.components.StripColumnsContainer');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, tinyMenu, 'wysiwyg.viewer.components.mobile.TinyMenu');

        //after
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, wFacebookComment, 'wysiwyg.viewer.components.WFacebookComment');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, verticalMenu, 'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, verticalAnchorsMenu, 'wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu');
        hooks.registerHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, column, 'wysiwyg.viewer.components.Column');
    }

});
