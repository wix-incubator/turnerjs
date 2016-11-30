/**
 * Created by alexandreroitman on 14/11/2016.
 */
define(['santaProps'], function (santaProps) {
    'use strict';

    return {
        propTypes: {
            compData: santaProps.Types.Component.compData,
            urlFormat: santaProps.Types.urlFormat,
            getMainPageUrl: santaProps.Types.getMainPageUrl,
            getCurrentUrl:santaProps.Types.getCurrentUrl
        },

        getSocialUrl: function (forceMainPage) {
            var urlFormat = this.props.compData ? this.props.compData.urlFormat : this.props.urlFormat;

            if (forceMainPage) {
                return this.props.getMainPageUrl(urlFormat);
            }

            return this.props.getCurrentUrl(urlFormat, undefined, urlFormat !== this.props.urlFormat);
        }
    };

});
