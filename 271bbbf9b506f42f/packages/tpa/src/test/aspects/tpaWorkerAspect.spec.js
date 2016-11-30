define(['testUtils', 'tpa/aspects/TPAWorkerAspect', 'testUtils'], function (testUtils, TPAWorkerAspect) {
    'use strict';

    var tpaWorkerAspect;
    // Holds all possible values. Please don't delete from this object!
    var mockSpecMap = {
        1: {
            "applicationId": 1,
            "permissions": {
                revoked: false
            },
            "appWorkerUrl": null,
            "installedAtDashboard": false
        },
        2: {
            "applicationId": 2,
            "permissions": {
                revoked: false
            },
            "appWorkerUrl": "http://localhost:8000/docs",
            "installedAtDashboard": false
        },
        3: {
            "applicationId": 3,
            "permissions": {
                revoked: true
            },
            "appWorkerUrl": "http://localhost:8000/docs",
            "installedAtDashboard": false
        },
        4: {
            "applicationId": 4,
            "permissions": {
                revoked: true
            },
            "appWorkerUrl": "http://localhost:8000/docs",
            "installedAtDashboard": true
        },
        5: {
            "applicationId": 5,
            "permissions": {
                revoked: false
            },
            "appWorkerUrl": null,
            "installedAtDashboard": false
        },
        6: {
            "applicationId": 6,
            "permissions": {
                revoked: true
            },
            "appWorkerUrl": null,
            "installedAtDashboard": true
        },
        7: {
            "applicationId": 7,
            "permissions": {
                revoked: false
            },
            "appWorkerUrl": "http://localhost:8000/docs",
            "installedAtDashboard": true
        },
        8: {
            "applicationId": 8,
            "permissions": {
                revoked: true
            },
            "appWorkerUrl": null,
            "installedAtDashboard": false
        }
    };

    describe('TPAWorkerAspect tests', function () {
        beforeEach(function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            spyOn(siteData, 'getClientSpecMap').and.returnValue(mockSpecMap);
            var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

            var aspectSiteApi = {
                forceUpdate: jasmine.createSpy(),
                getSiteData: function () {
                    return siteAPI.getSiteData();
                },
                getSiteAPI: function() {
                    return siteAPI;
                }
            };
            tpaWorkerAspect = new TPAWorkerAspect(aspectSiteApi);
        });

        it('should get TPA workers from client spec map successfully and filter out revoked workers', function () {
            var workers = tpaWorkerAspect.getTPAWorkers(mockSpecMap);
            expect(workers.length).toBe(2);
            expect(workers[0].applicationId).toEqual(2);
            expect(workers[1].applicationId).toEqual(7);
        });

        it('should get react components', function () {
            var comps = tpaWorkerAspect.getReactComponents();

            expect(comps.length).toEqual(2);

            expect(comps[0].props.compData.appWorkerUrl).toBeDefined();
            expect(comps[0].props.compData.applicationId).toEqual(2);

            expect(comps[1].props.compData.appWorkerUrl).toBeDefined();
            expect(comps[1].props.compData.applicationId).toEqual(7);
        });

        it('should get component structures', function () {
            var structures = tpaWorkerAspect.getComponentStructures();

            expect(structures.length).toEqual(1);
            expect(structures[0].componentType).toEqual('tpa.viewer.classes.TPAWorker');
            expect(structures[0].skin).toEqual('wysiwyg.viewer.skins.TPAWidgetSkin');
            expect(structures[0].type).toEqual('Component');
        });
    });
});
