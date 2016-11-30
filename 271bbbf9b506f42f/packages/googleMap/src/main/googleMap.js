define(['react', 'lodash', 'core', 'utils', 'reactDOM', 'santaProps'], function (React, _, core, utils, ReactDOM, santaProps) {
    'use strict';

    var mixins = core.compMixins;

    var SUPPORTED_LANGS = ['da', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'];
    var LOCALES = {pt: 'pt-BR'};

    var getLanguage = function (props) {
        var languageProperty = props.compProp.language;

        var lang = languageProperty === 'userLang' ? utils.wixUserApi.getLanguage(props.requestModelCookie,
            props.currentUrl) : languageProperty;
        var language = _.includes(SUPPORTED_LANGS, lang) ? lang : 'en';
        return LOCALES[language] || language;
    };

    function getMapParamsFromProps(props) {
        return {
            address: props.compData.address,
            addressInfo: props.compData.addressInfo,
            mapType: props.compProp.mapType,
            mapInteractive: props.compProp.mapDragging,
            showZoom: props.compProp.showZoom,
            showStreetView: props.compProp.showStreetView,
            showMapType: props.compProp.showMapType,
            lat: props.compData.latitude,
            long: props.compData.longitude,
            ts: (props.structure.layout.width + props.structure.layout.height),
            mapStyle: JSON.stringify(props.compData.mapStyle || [])
        };
    }

    function getIframeUrl(props) {
        var queryString = 'language=' + getLanguage(props);
        return props.santaBase + '/static/external/googleMap.html?' + queryString;
    }

    /**
     * @class components.GoogleMap
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'GoogleMap',
        mixins: [mixins.skinBasedComp],
        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            structure: santaProps.Types.Component.structure.isRequired,
            requestModelCookie: santaProps.Types.requestModel.cookie.isRequired,
            currentUrl: santaProps.Types.currentUrl.isRequired,
            santaBase: santaProps.Types.santaBase.isRequired,
            cannotHideIframeWithinRoundedCorners: santaProps.Types.mobile.cannotHideIframeWithinRoundedCorners.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getInitialState: function () {
            var state = {};
            if (this.props.cannotHideIframeWithinRoundedCorners) {
                state.$corners = 'squared';
            }

            this.restartMap(this.props);

            return state;
        },
        componentDidMount: function () {
            this.iFrameNode = ReactDOM.findDOMNode(this.refs.iframe);
            this.iFrameNode.onload = function () {
                var params = getMapParamsFromProps(this.props);
                this.updateMapParams(params);
            }.bind(this);
        },
        componentWillReceiveProps: function (newProps) {
            var newMapProperties = getMapParamsFromProps(newProps);

            var shouldUpdateMapParams = getLanguage(this.props) === getLanguage(newProps);
            if (shouldUpdateMapParams) {
                this.updateMapParams(newMapProperties);
            } else {
                this.restartMap(newProps);
            }
        },
        updateMapParams: function (params) {
            var iFrameNode = ReactDOM.findDOMNode(this.refs.iframe);
            iFrameNode.contentWindow.postMessage(JSON.stringify(params), '*');
        },
        restartMap: function (props) {
            this.iframeUrl = getIframeUrl(props);
        },
        getMapParamsFromProps: getMapParamsFromProps,
        getSkinProperties: function () {
            return {
                "mapContainer": {
                    key: 'mapContainer',
                    children: [
                        React.DOM.iframe({
                            ref: 'iframe',
                            src: this.iframeUrl,
                            width: "100%",
                            height: "100%",
                            frameBorder: "0",
                            scrolling: "no",
                            'background-color': 'red'
                        })
                    ]
                }
            };
        }
    };
});
