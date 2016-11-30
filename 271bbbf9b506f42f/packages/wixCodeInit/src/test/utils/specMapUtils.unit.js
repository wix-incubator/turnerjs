define(['wixCodeInit/utils/specMapUtils'], function(specMapUtils) {
    'use strict';

    describe('specMapUtils', function() {

        describe('getAppSpec', function() {

            function getTestClientSpecMap() {
                return {
                    '2': {
                        'type': 'appbuilder',
                        'applicationId': 2,
                        'appDefinitionId': '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297',
                        'instanceId': '1442bb8b-d5eb-b1b0-5f04-ca1fabb5a9fb',
                        'state': 'Initialized'
                    },
                    '13': {
                        'type': 'sitemembers',
                        'applicationId': 13,
                        'collectionType': 'Open',
                        'smcollectionId': "'e85356f9-9cdf-47a0-8ae7-fdacc339c0e2'",
                        'smtoken': '9363b4c90b6168d0047f8fbc5cba8ef51b63d1ff59354a7f3ea2d1e73fa811600bf85ef57d435dbba36721e1478a5241a375dc291769a72d0bf976b8562c60431942f1b28d894d532d0adcc4aa684d6e12c0233a62af4f318da856cbc9c93922'
                    },
                    '1103': {
                        'type': 'siteextension',
                        'instance': '95394bbea2517225bcd7f7437dd07ac12e50b6f6.eyJleHRlbnNpb25JZCI6IjhlNTNmOWJjLTdhYTgtNDhkNi1iODYyLTU0NzRhY2YwMTgyOCIsImluc3RhbmNlSWQiOiI4YmEzZmVjYy05MWZiLTRlMmEtOWNmMy0wZWNkZGNkODNmZWQiLCJzaWduRGF0ZSI6MTQ2MzY2ODIzMTE0NSwidWlkIjoiMzUwZGJiMjUtMmVjMS00ZGJhLWI3ZjgtMDMyNzUzMGNlMTBjIiwicGVybWlzc2lvbnMiOiJPV05FUiJ9',
                        'extensionId': '8e53f9bc-7aa8-48d6-b862-5474acf01828',
                        'instanceId': '8ba3fecc-91fb-4e2a-9cf3-0ecddcd83fed',
                        'htmlSiteId': '0640844a-6ec3-4b4f-8e78-0cc5a58741dc',
                        'applicationId': 1103,
                        'appDefinitionId': '8e53f9bc-7aa8-48d6-b862-5474acf01828'
                    }
                };
            }

            it('should find and return a wix code app spec from the given client spec map', function() {
                var testSpecMap = getTestClientSpecMap();
                var returnedSpec = specMapUtils.getAppSpec(testSpecMap);

                expect(returnedSpec).toEqual({
                    'type': 'siteextension',
                    'instance': '95394bbea2517225bcd7f7437dd07ac12e50b6f6.eyJleHRlbnNpb25JZCI6IjhlNTNmOWJjLTdhYTgtNDhkNi1iODYyLTU0NzRhY2YwMTgyOCIsImluc3RhbmNlSWQiOiI4YmEzZmVjYy05MWZiLTRlMmEtOWNmMy0wZWNkZGNkODNmZWQiLCJzaWduRGF0ZSI6MTQ2MzY2ODIzMTE0NSwidWlkIjoiMzUwZGJiMjUtMmVjMS00ZGJhLWI3ZjgtMDMyNzUzMGNlMTBjIiwicGVybWlzc2lvbnMiOiJPV05FUiJ9',
                    'extensionId': '8e53f9bc-7aa8-48d6-b862-5474acf01828',
                    'instanceId': '8ba3fecc-91fb-4e2a-9cf3-0ecddcd83fed',
                    'htmlSiteId': '0640844a-6ec3-4b4f-8e78-0cc5a58741dc',
                    'applicationId': 1103,
                    'appDefinitionId': '8e53f9bc-7aa8-48d6-b862-5474acf01828'
                });
            });

            it('should return "undefined" if wix code is not in the client spec map', function() {
                var testSpecMap = getTestClientSpecMap();
                delete testSpecMap[1103];
                var returnedSpec = specMapUtils.getAppSpec(testSpecMap);

                expect(returnedSpec).toBeUndefined();
            });

        });
    });
});
