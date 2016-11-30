define.component('wysiwyg.previeweditorcommon.components.FeedbackQuickTourItem', function(componentDefinition){
        /**@type core.managers.component.ComponentDefinition */
        var def = componentDefinition;

        def.inherits('wysiwyg.common.components.QuickTourItem');

    def.resources(['W.Resources']);

        def.skinParts({
            title: {type:'htmlElement'},
            body: {type:'htmlElement'},
            navList: {type:'htmlElement'},
            nextButton: {type:'wysiwyg.previeweditorcommon.components.SiteFeedbackButton', argObject:{
                label:'slideBtn',
                enabled:true
            }},
            arrowContainer: {type:'htmlElement'}
        });

        def.statics({
            TITLE_PATTERN: 'FEEDBACK_REVIEW_INTRO_TITLE',
            BODY_PATTERN: 'FEEDBACK_REVIEW_INTRO_TEXT',
            BUTTON_LABEL_PATTERN: 'FEEDBACK_REVIEW_INTRO_BUTTON'
        });

        def.methods({
            _translate: function (key, fallback) {
                return this.resources.W.Resources.get('FEEDBACK_REVIEW', key, fallback);
            }
        });
    });
