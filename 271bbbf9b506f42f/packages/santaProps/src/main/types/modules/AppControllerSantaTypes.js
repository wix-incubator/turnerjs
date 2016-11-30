define(['lodash', 'santaProps/utils/propsSelectorsUtils'], function (_, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var DEFAULT_STAGE_DATA = {icon: 'https://maxcdn.icons8.com/office/PNG/40/Animals/unicorn-40.png'};

    var applicativeUIData = function (shape) {
        return applyFetch(shape, function (state, props) {
            var controllerId = props.structure.id;
            var controllerData = state.siteAPI.getRuntimeDal().getCompData(controllerId);
            var controllerType = controllerData.controllerType;
            var applicationId = controllerData.applicationId;

            var controllerState = state.siteAPI.getControllerState(controllerId);
            var controllerStageData = state.siteAPI.getControllerStageData(applicationId, controllerType, controllerState);

            return _.assign({}, DEFAULT_STAGE_DATA, controllerStageData);
        });
    };

    return {
        applicativeUIData: applicativeUIData
    };

});
