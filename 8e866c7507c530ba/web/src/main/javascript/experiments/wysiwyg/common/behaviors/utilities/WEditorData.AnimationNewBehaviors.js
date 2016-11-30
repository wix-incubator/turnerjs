define.experiment.newDataItem('ANIMATION_DIALOG_MAP.AnimationNewBehaviors', function() {
    return {
        type: 'map',
        items: {
            groups: {
                'basic': ['FadeIn', 'FloatIn', 'ExpandIn', 'SpinIn', 'FlyIn', 'TurnIn'],
                'advanced': ['Reveal', 'SlideIn', 'DropIn', 'FlipIn', 'FoldIn', 'ArcIn']
            },
            defaultGroups: ['basic', 'advanced'],
            components: {}
        }
    };
});
