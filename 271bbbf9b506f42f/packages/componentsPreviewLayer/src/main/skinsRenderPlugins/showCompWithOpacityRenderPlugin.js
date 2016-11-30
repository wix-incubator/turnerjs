define(['lodash'], function (_) {
    'use strict';

    return function showCompWithOpacity(refData, skinTree, structure, props) {
        var compsToShowWithOpacity = _.get(props, 'renderRealtimeConfig.compsToShowWithOpacity');
        if (!compsToShowWithOpacity || !compsToShowWithOpacity.compIds) {
            return;
        }

        if (_.includes(compsToShowWithOpacity.compIds, structure.id)) {
            _.set(refData, ['', 'style', 'opacity'], compsToShowWithOpacity.opacity);
        }
    };
});
