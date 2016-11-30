define(['lodash', 'santaProps'], function(_, santaProps){
    'use strict';

    function isFixedPosition(props){
        return props.style && props.style.position === 'fixed';
    }

    function getFixedCssState(props){
        if (isFixedPosition(props) && !props.isMobileView) {
            return {
              $fixed: 'fixedPosition'
            };
        }
        return {
            $fixed: ''
        };
    }

    function getMobileCssState(props){
        if (props.isMobileView) {
            return {
                $mobile: 'mobileView'
            };
        }
        return {
            $mobile: ''
        };
    }

    function getCssStates(props){
        return _.merge(getMobileCssState(props), getFixedCssState(props));
    }

    return {
        propTypes: {
            isMobileView: santaProps.Types.isMobileView.isRequired,
            style: santaProps.Types.Component.style.isRequired
        },

        getRootStyle: function (style) {
          if (this.getRootPosition) {
            return {position: this.getRootPosition(style)};
          }
          return {};
        },

        getInitialState: function(){
            return getCssStates(this.props);
        },

        componentWillReceiveProps: function(nextProps){
            var oldCssStates = getCssStates(this.props); //we do this because we don't know if a component using the mixin has other states, so we cant compare with this.state
            var newCssStates = getCssStates(nextProps);
            if (!_.isEqual(oldCssStates, newCssStates)) {
                this.setState(newCssStates);
            }
        }
    };
});
