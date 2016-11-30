define.experiment.dataItem('ANIMATION_DIALOG_MAP.AnimationText',  function (experimentStrategy) {
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;
    return strategy.merge({
        items: {
            groups: {
                'basic': ['FadeIn', 'FloatIn', 'ExpandIn', 'SpinIn', 'FlyIn', 'TurnIn'],
                'advanced': ['Reveal', 'SlideIn', 'DropIn', 'FlipIn', 'FoldIn', 'ArcIn'],
                'text': ['TextWave', 'TextFusilli', 'TextScrabble', 'TextRollIn', 'TextTypewriter', 'TextFlyIn'],
                'title': ['TitleOne', 'TitleTwo', 'TitleThree', 'TitleFour', 'TitleFive', 'TitleSix']
            },
            defaultGroups: ['basic', 'advanced'],
            components: {
                'wysiwyg.viewer.components.WRichText': ['title', 'basic', 'advanced']
            }
        }
    });
});
