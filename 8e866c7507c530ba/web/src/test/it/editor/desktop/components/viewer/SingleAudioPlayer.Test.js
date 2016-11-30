integration.noAutomation();


describe('SingleAudioPlayer Tests', function () {
    var compPreset = {
            'compType': 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer',
            'layout': {
                'width': 280,
                'height': 68
            },
            'styleId': 1
        },
        skinList = {
            'Round Play': 'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerRoundPlay',
            'Framed Play': 'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerFramedPlay',
            'Large Play': 'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerLargePlay',
            'Basic Play': 'wysiwyg.common.components.singleaudioplayer.viewer.skins.SingleAudioPlayerSkin'
        };

    describe('SingleAudioPlayer spec', function () {
        it('Should add player with preset and then delete it', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.viewercomponents.ViewerComponent.removeComponent(comp);
                    });
            });
        });

        it('Should add multiple player and change skins', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.Component.setSkinForComponent(comp, skinList['Round Play']);
                    })
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.Component.setSkinForComponent(comp, skinList['Framed Play']);
                    });
            });
        });
    });
});



