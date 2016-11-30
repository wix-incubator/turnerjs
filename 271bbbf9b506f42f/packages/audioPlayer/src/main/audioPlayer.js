define(['core', 'santaProps'], function (/** core */ core, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var santaTypes = santaProps.Types;

    /**
     * @class components.AudioPlayer
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {core.skinInfo}
     * @property {comp.properties} props
     * @extends {core.audioMixin}
     * @property {comp.properties} props
     */
    return {
        displayName: 'AudioPlayer',
        mixins: [
            mixins.skinBasedComp,
            mixins.skinInfo,
            mixins.audioMixin
        ],
        propTypes: {
            compData: santaTypes.Component.compData.isRequired
        },
        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            this.audioVolume = this.props.compData.volume;

            return {
                $playerState: 'waiting'
            };
        },

        finishedPlayingAudio: function () {
            this.isAudioPlaying = false;
            if (this.props.compData.loop) {
                this.initiatePlay();
            } else {
                this.initiatePause();
            }
        },

        getSkinProperties: function () {
            // we need this as member values because of audioMixin,
            // (for example singleAudioPlayer has the "autoplay" value on compProps instead of compData)
            this.audioVolume = this.props.compData.volume;
            this.autoPlay = this.props.compData.autoPlay;

            this.updateAudioObject();
            return {
                'playButton': {
                    onClick: this.initiatePlay
                },
                'pauseButton': {
                    onClick: this.initiatePause
                }
            };
        }
    };
});
