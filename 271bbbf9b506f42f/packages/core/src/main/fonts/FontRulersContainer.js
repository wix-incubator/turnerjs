define(['react', 'lodash', 'core/fonts/FontRuler', 'utils'], function (React, _, FontRulerClass, utils) {
    'use strict';

    var FONT_DEBOUNCE = 30;
    var LONG_FONT_DEBOUNCE = FONT_DEBOUNCE * 10;

    var fontRuler = React.createFactory(FontRulerClass);

    var FontRulersContainer = React.createClass({
        displayName: 'FontRulersContainer',
        getInitialState: function() {
            var siteData = this.props.siteData;
            this.invokeCallback = _.debounce(this.invokeCallback,
                siteData.browser.firefox || siteData.os.ios ? LONG_FONT_DEBOUNCE : FONT_DEBOUNCE);
            return {loadedFonts: []};
        },

        fontLoaded: function (fontFamily) {
            var loadedFonts = this.state.loadedFonts.concat(fontFamily);
            if (this.isMounted()) {
                this.setState({loadedFonts: loadedFonts});
                utils.fonts.renderedFontsList.set(loadedFonts);
            }
            this.invokeCallback();
        },

        invokeCallback: function () {
            utils.performance.finish('font ruler');
            this.props.onLoadCallback();
        },

        componentDidMount: function () {
            utils.performance.startOnce('font ruler');
        },

        render: function() {
            var fontsList = this.props.fontsList;
            var fontRulerComponents = [{
                key: 'fontRulersContainer',
                style: {
                    overflow: 'hidden',
                    visibility: 'hidden',
                    maxHeight: 0,
                    maxWidth: 0,
                    position: 'absolute'
                }
            },
            React.DOM.style({dangerouslySetInnerHTML: {__html:'.font-ruler-content::after {content:"@#$%%^&*~IAO"}'}})];
            _.forEach(fontsList, function(fontFamily){
                if (!_.includes(this.state.loadedFonts, fontFamily)) {
                    fontRulerComponents.push(fontRuler({key: fontFamily, fontFamily: fontFamily, onLoadCallback: this.fontLoaded}));
                }
            }, this);

            return React.DOM.div.apply(undefined, fontRulerComponents);
        },

        hasPendingFonts: function() {
            return _.difference(this.props.fontsList, this.state.loadedFonts).length > 0;
        }
    });

    return FontRulersContainer;
});
