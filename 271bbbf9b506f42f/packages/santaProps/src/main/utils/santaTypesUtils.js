define(['lodash'], function(_) {
    'use strict';

    function getAllMixinsAndSelf(compDefinition) {
        var queue = [compDefinition];
        for (var index = 0; index < queue.length; index++) {
            var mixins = queue[index].mixins;
            if (mixins && mixins.length) {
                queue.push.apply(queue, mixins);
            }
        }
        return queue;
    }

    function isSantaTypeProp(propType) {
        return _.isFunction(propType.fetch);
    }

    function getPropTypesByDefinition(compDefinition) {
        var allMixinsAndSelf = getAllMixinsAndSelf(compDefinition);
        var allPropsTypes = _.map(allMixinsAndSelf, 'propTypes');
        return _.defaults.apply(_, [{}].concat(allPropsTypes));
    }

    function getSantaTypesByDefinition(compDefinition) {
        return _.pick(getPropTypesByDefinition(compDefinition), isSantaTypeProp);
    }

    function resolveComponentProps(propTypes, props) {
        var siteData = props.siteData;
        var navigationInfo = siteData.getExistingRootNavigationInfo(siteData.getFocusedRootId());

        var state = {
            stylesMap: props.loadedStyles,
            siteData: props.siteData,
            siteAPI: props.siteAPI
        };

        var compProps = {
            structure: props.structure,
            rootId: props.rootId,
            rootNavigationInfo: navigationInfo
        };

        var santaTypePropTypes = _.pick(propTypes, isSantaTypeProp);

        var santaTypeProps = _.mapValues(santaTypePropTypes, function (propType) {
            return propType.fetch(state, compProps);
        });

        return _.assign(santaTypeProps, _.pick(props, _.keys(propTypes)));
    }

    return {
        resolveComponentProps: resolveComponentProps,
        isSantaTypeProp: isSantaTypeProp,
        getPropTypesByDefinition: getPropTypesByDefinition,
        getSantaTypesByDefinition: getSantaTypesByDefinition
    };
});
