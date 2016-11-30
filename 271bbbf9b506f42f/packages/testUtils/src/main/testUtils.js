define([
    'lodash',
    'experiment',
    'testUtils/util/domHelper',
    'testUtils/util/mockFactory',
    'testUtils/util/mockModulesBuilder',
    'testUtils/util/componentHelper',
    'testUtils/util/proxyHelper',
    'testUtils/util/mockSequence',
    'testUtils/util/mockTimelineMax',
    'testUtils/util/mockTweenMax',
    'testUtils/util/requireHelper',
    'testUtils/util/jasmineHelper',
    'testUtils/util/createExperimentHelper',
    'testUtils/util/santaTypesBuilder',
    'testUtils/util/MockTaskRegistryBuilder',
    'testUtils/util/compDesignMixinFixture'
], function (_, experiment, domHelper, /** testUtils.mockFactory */
             mockFactory, mockModulesBuilder, componentHelper,
             proxyHelper, mockSequence, mockTimelineMax,
             mockTweenMax, requireHelper, jasmineHelper,
             createExperimentHelper, santaTypesBuilder,
             MockTaskRegistryBuilder, compDesignMixinFixture) {
    'use strict';


    /** @class testUtils*/
    return {
        mockFactory: mockFactory,
        mockModules: mockModulesBuilder,
        componentBuilder: componentHelper.componentBuilder,
        getComponentFromDefinition: componentHelper.getComponentFromDefinition,
        getComponentFromReactClass: componentHelper.getComponentFromReactClass,
        getComponentReactElementFromDefinition: componentHelper.getComponentReactElementFromDefinition,
        proxyBuilder: proxyHelper.proxyBuilder,
        proxyStringBuilder: proxyHelper.proxyStringBuilder,
        proxyPropsBuilder: proxyHelper.proxyPropsBuilder,
        proxyData: proxyHelper.data,
        proxyViewDef: proxyHelper.viewDef,
        stupidProxy: proxyHelper.stupidProxy,
        isComponentOfType: componentHelper.isComponentOfType,
        mockSequence: mockSequence,
        mockTimelineMax: mockTimelineMax,
        mockTweenMax: mockTweenMax,
        jasmineHelper: jasmineHelper,
        requireWithMocks: requireHelper.requireWithMocks,
        describeWithMocks: requireHelper.describeWithMocks,
        getStyleObject: domHelper.getStyleObject,
        createExperimentHelper: createExperimentHelper,
        experimentHelper: createExperimentHelper(experiment),
        santaTypesBuilder: santaTypesBuilder,
        MockTaskRegistryBuilder: MockTaskRegistryBuilder,
        compDesignMixinFixture: compDesignMixinFixture
    };
});
