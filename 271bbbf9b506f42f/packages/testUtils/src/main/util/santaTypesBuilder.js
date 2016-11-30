define(['lodash', 'santaProps', 'testUtils/util/mockFactory'], function(_, santaProps, mockFactory) {
    'use strict';

    function getComponentProps(compDef, overrideProps, siteData, siteAPI) {
        siteData = siteData || mockFactory.mockSiteData();
        siteAPI = siteAPI || mockFactory.mockSiteAPI(siteData);
        var santaTypeProps = santaProps.santaTypesUtils.getSantaTypesByDefinition(compDef);

        var structure = _.get(overrideProps, 'structure', {});
        structure.id = structure.id || _.uniqueId('test_');
        structure.componentType = structure.componentType || ('mockComponentType_' + compDef.displayName);

        var props = _.assign(santaProps.santaTypesUtils.resolveComponentProps(santaTypeProps, {
            siteData: siteData,
            siteAPI: siteAPI,
            structure: structure,
            rootId: siteData.getCurrentUrlPageId()
        }), overrideProps);

        return _.omit(props, ['ref']);
    }

    return {
      getComponentProps: getComponentProps
    };
});
