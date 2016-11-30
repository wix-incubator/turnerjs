/**
 * Created by alexandreroitman on 08/05/2016.
 */
define(['lodash', 'santaProps', 'utils'], function(_, santaProps) {
    'use strict';

    return {
        propTypes: {
            setRuntimeCompData: santaProps.Types.DAL.setCompData.isRequired,
            setRuntimeCompProps: santaProps.Types.DAL.setCompProps.isRequired
        },

        updateData: function (newData) {
            this.props.setRuntimeCompData(this.props.id, newData);
        },

        updateProps: function (newProps) {
            this.props.setRuntimeCompProps(this.props.id, newProps);
        }
    };
});
