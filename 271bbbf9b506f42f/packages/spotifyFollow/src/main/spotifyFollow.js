define(['core', 'santaProps', 'lodash'], function (/** core */core, santaProps, _) {
    'use strict';

    var mixins = core.compMixins;

    var defaultSizes = {
        large: {
            width: 225,
            height: 56,
            label: 'detail'
        },
        small: {
            width: 156,
            height: 25,
            label: 'basic'
        }
    };

    function getPlaceHolderState(props) {
        var layout = defaultSizes[props.compProp.size].label,
            color = props.compProp.theme === 'dark' ? 'light' : 'dark',
            counter = props.compProp.showFollowersCount,
            stateArr = [];

        if (layout === 'basic') {
            stateArr.push('basic');
            stateArr.push('all');
        } else {
            stateArr.push('detailed');
            stateArr.push(color);
        }

        stateArr.push(counter ? 'show' : 'hide');

        return stateArr.join('_');
    }

    function sanitizeSpotifyURI(uri) {
        var sanitizedValue = null;
        if (uri) {
            var spotifyParts = uri.split(':');
            if (spotifyParts.length === 3) {
                sanitizedValue = ((spotifyParts[0] + ':').toLowerCase()) +
                                 ((spotifyParts[1] + ':').toLowerCase()) + spotifyParts[2] || '';
            }
        }
        return sanitizedValue;
    }

    function getIFrameSrc(props) {
        var srcArray = [];
        srcArray.push('https://embed.spotify.com/follow/1/?uri=');
        var sanitizedURI = sanitizeSpotifyURI(props.compData.uri);
        srcArray.push(sanitizedURI);
        srcArray.push('&size=');
        srcArray.push(defaultSizes[props.compProp.size].label);
        srcArray.push('&theme=');
        srcArray.push(props.compProp.theme);
        srcArray.push('&show-count=');
        srcArray.push(props.compProp.showFollowersCount ? 1 : 0);
        return srcArray.join('');
    }

    function getIFrameProperties(hasValidUri, props) {
        var iFrameProps = {};

        if (hasValidUri) {
            iFrameProps.src = getIFrameSrc(props);
            iFrameProps.style = {
                width: defaultSizes[props.compProp.size].width,
                height: defaultSizes[props.compProp.size].height
            };
        } else {
            iFrameProps.style = {
                display: "none"
            };
        }

        return iFrameProps;
    }

    function getPlaceHolderProperties(hasValidUri) {
        var placeHolderProps = {};

        if (hasValidUri) {
            placeHolderProps.style = {
                display: "none"
            };
        }

        return placeHolderProps;
    }

    function checkValidUri(uri) {
        return _.size(uri) > 0;
    }

    function getValidSpotifyDimensions(props) {
        var layout = defaultSizes[props.compProp.size];
        return {
            //We add stupid extra 2 pixels for backward compatibility with HTML-CLIENT
            height: layout.height + 2,
            width: layout.width
        };
    }

    /**
     * @class components.SpotifyFollow
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "SpotifyFollow",
        mixins: [mixins.skinBasedComp],

        propTypes: {
            compData: santaProps.Types.Component.compData,
            compProp: santaProps.Types.Component.compProp
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {
                $placeholder: getPlaceHolderState(this.props)
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({$placeholder: getPlaceHolderState(nextProps)});
        },

        getSkinProperties: function () {
            var hasValidUri = checkValidUri(this.props.compData.uri);
            return {
                "": {
                    style: getValidSpotifyDimensions(this.props),
                    'data-valid-uri' : '' + hasValidUri
                },
                iframe: getIFrameProperties(hasValidUri, this.props),
                placeholder: getPlaceHolderProperties(hasValidUri)
            };
        }
    };
});