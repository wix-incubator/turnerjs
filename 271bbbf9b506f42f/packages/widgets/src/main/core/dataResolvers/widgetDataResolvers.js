define(['lodash', 'widgets/core/dataResolvers/pageLinkDataResolver'], function(_, pageLinkDataResolver){
    'use strict';

    var dataResolvers = [
        pageLinkDataResolver
    ];

    return {
        resolve: function(data, siteAPI, compProps) {
            _.forEach(dataResolvers, function(resolver){
                data = resolver.resolve(data, siteAPI, compProps);
            });
            return data;
        }
    };
});
