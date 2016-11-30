define(['experiment',
    'documentServices/hooks/hooks',
    'documentServices/hooks/componentHooks/anchor',
    'documentServices/hooks/componentHooks/boxSlideShow',
    'documentServices/hooks/componentHooks/wRichTextHooks',
    'documentServices/hooks/componentHooks/nickname',
    'documentServices/hooks/componentHooks/modesHooks',
    'documentServices/hooks/componentHooks/columns',
    'documentServices/hooks/componentHooks/stripColumnsContainer',
    'documentServices/hooks/componentHooks/wFacebookLike',
    'documentServices/hooks/componentHooks/wFacebookComment',
    'documentServices/hooks/componentHooks/pinterestPinIt',
    'documentServices/hooks/componentHooks/vkShareButton',
    'documentServices/hooks/componentHooks/facebookShare',
    'documentServices/hooks/componentHooks/popupPageHooks',
    'documentServices/hooks/componentHooks/fiveGridLineHooks',
    'documentServices/hooks/componentHooks/appController',
    'documentServices/hooks/componentHooks/connectionsHooks',
    'documentServices/hooks/componentHooks/contactFormHooks'
], function (experiment, hooks, anchor, boxSlideShow, wRichTextHooks, nickname, modesHooks, columns, stripColumnsContainer, wFacebookLike,
             wFacebookComment, pinterestPinIt, vkShareButton, facebookShare, popupPageHooks, fiveGridLineHooks, appController, connectionsHooks, contactFormHooks) {
    'use strict';

    init();

    function init() {
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, anchor, 'wysiwyg.common.components.anchor.viewer.Anchor');
        hooks.registerHook(hooks.HOOKS.SERIALIZE.SET_CUSTOM, wRichTextHooks.setLinksCustomData, 'wysiwyg.viewer.components.WRichText');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, wRichTextHooks.duplicateLinksDataItems, 'wysiwyg.viewer.components.WRichText');

        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, boxSlideShow.verifySlideShowStructureOnAdd, 'wysiwyg.viewer.components.BoxSlideShow');
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, boxSlideShow.verifySlideShowStructureOnAdd, 'wysiwyg.viewer.components.StripContainerSlideShow');
        hooks.registerHook(hooks.HOOKS.COMPONENT.STYLE_UPDATE_AFTER, boxSlideShow.updateSlidesStyle, 'wysiwyg.viewer.components.BoxSlideShow');
        hooks.registerHook(hooks.HOOKS.REMOVE.BEFORE, boxSlideShow.verifySlideShowStructureOnDelete, 'wysiwyg.viewer.components.BoxSlideShowSlide');
        hooks.registerHook(hooks.HOOKS.REMOVE.BEFORE, boxSlideShow.verifySlideShowStructureOnDelete, 'wysiwyg.viewer.components.StripContainerSlideShowSlide');

        hooks.registerHook(hooks.HOOKS.ADD.AFTER, fiveGridLineHooks.replaceFullScreenPropertyWithDocking, 'wysiwyg.viewer.components.FiveGridLine');

        // columns
        hooks.registerHook(hooks.HOOKS.REMOVE.BEFORE, columns.handleColumnDeletion, 'wysiwyg.viewer.components.Column');
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, columns.deleteContainerIfHasNoMoreColumns, 'wysiwyg.viewer.components.Column');
        hooks.registerHook(hooks.HOOKS.ADD_ROOT.BEFORE, columns.handleSplitToColumns, 'wysiwyg.viewer.components.Column');
        hooks.registerHook(hooks.HOOKS.PROPERTIES.UPDATE_BEFORE, columns.handleFullWidthPropertyChange, 'wysiwyg.viewer.components.StripColumnsContainer');

        if (experiment.isOpen('layout_verbs_with_anchors')){
            hooks.registerHook(hooks.HOOKS.PROPERTIES.UPDATE_BEFORE, columns.handleRowMarginPropertyChange, 'wysiwyg.viewer.components.StripColumnsContainer');
        }

        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, stripColumnsContainer, 'wysiwyg.viewer.components.StripColumnsContainer');

        //social comps
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, wFacebookLike, 'wysiwyg.viewer.components.WFacebookLike');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, wFacebookComment, 'wysiwyg.viewer.components.WFacebookComment');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, pinterestPinIt, 'wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, vkShareButton, 'wysiwyg.viewer.components.VKShareButton');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, facebookShare, 'wysiwyg.viewer.components.FacebookShare');

        //wixCode
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, nickname.removeNicknameFromSerializedComponentIfInvalid);
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, connectionsHooks.updateSerializedConnectionsData);
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, nickname.generateNicknamesForComponent);
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, appController.handleControllerAddition, 'platform.components.AppController');
        hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.BEFORE, nickname.deleteNicknameFromComponentIfInvalid);
        hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.BEFORE, connectionsHooks.removeInvalidConnections);
        hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.AFTER, nickname.generateNicknamesForComponent);
        hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.BEFORE, appController.handleControllerParentChange, 'platform.components.AppController');
        hooks.registerHook(hooks.HOOKS.MOBILE_CONVERSION.AFTER, nickname.generateNicknamesForComponent);
        hooks.registerHook(hooks.HOOKS.SERIALIZE.SET_CUSTOM, appController.handleControllerSerialization, 'platform.components.AppController');
        hooks.registerHook(hooks.HOOKS.REMOVE.BEFORE, appController.handleControllerDeletion, 'platform.components.AppController');

        // popups
        hooks.registerHook(hooks.HOOKS.ADD_ROOT.GET_CONTAINER_TO_ADD_TO, popupPageHooks.getContainerToAddTo, 'mobile.core.components.Page');
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, popupPageHooks.removeDeadBehaviors, 'mobile.core.components.Page');
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, popupPageHooks.removeBehaviorsFromAddedPage, 'mobile.core.components.Page');

        // contactForm DATA hook
        contactFormHooks.initContactFromHooks(hooks);

        //modes
        hooks.registerHook(hooks.HOOKS.MOBILE_CONVERSION.BEFORE, modesHooks.activatePageMobileHoverModes);
    }

});
