define(['siteUtils/core/constants', 'experiment'], function(constants, experiment) {
    'use strict';
    return {
        default: {
            to: {allow: true},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.THRESHOLD}
        },
        'wysiwyg.viewer.components.Column': {
            to: {allow: true},
            from: {allow: false, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
        },
        'wysiwyg.viewer.components.PageGroup': {
            to: {allow: true},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        'mobile.core.components.Page': {
            to: {allow: true},
            from: {allow: false, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
        },
        'wysiwyg.viewer.components.PagesContainer': {
            to: {allow: true},
            from: {allow: true, lock: experiment.isOpen('viewerGeneratedAnchors') ? constants.ANCHORS.LOCK_CONDITION.THRESHOLD : constants.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        'wysiwyg.viewer.components.PopupContainer': {
            to: {allow: true},
            from: {allow: false}
        },
        'wysiwyg.viewer.components.SiteSegmentContainer': {
            to: {allow: true},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        'wysiwyg.viewer.components.WSiteStructure': {
            to: {allow: true, distance: 0},
            from: {allow: false, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
        },
        'wysiwyg.viewer.components.tpapps.TPASection': {
            to: {allow: true},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
        },
        'wysiwyg.viewer.components.tpapps.TPAMultiSection': {
            to: {allow: true},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
        },
        'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton': {
            from: {allow: false}
        },
        'wysiwyg.viewer.components.tpapps.TPAGluedWidget': {
            from: {allow: false}
        },
        'wixapps.integration.components.AppPage': {
            from: {allow: false}
        },
        'platform.components.AppController': {
            to: {allow: false},
            from: {allow: false}
        }
    };
});
